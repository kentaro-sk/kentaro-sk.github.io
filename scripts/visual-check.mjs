// 見た目確認（スクリーンショット＋簡易チェック）を1コマンドで行うスクリプト。
//
// 目的: 「ローカルサーバを立てる → ブラウザで開く → 対象ページへ移動 → スクロール演出を
// 発火させて待つ → PC幅・スマホ幅で撮影 → 横はみ出し・コンソールエラーを確認」を毎回手書きの
// 使い捨てスクリプトで繰り返していたため、1本にまとめて再利用できるようにした。
//
// 使い方（プロジェクト直下で実行）:
//   node scripts/visual-check.mjs --page PROFILE
//   node scripts/visual-check.mjs --page WORKS --widths 1440,390
//   node scripts/visual-check.mjs --file pages/hobby-castles.html
//   node scripts/visual-check.mjs --page HOME --out C:/tmp/shots
//
// オプション:
//   --page  <名前>   index.html 内のナビゲーション名（HOME/PROFILE/WORKS/STORY/GOAL/HOBBY/CONTACT 等）。
//                    ナビのリンクをクリックして画面を切り替える（このサイトは1つの index.html 内で
//                    画面を切り替える構成のため）
//   --file  <パス>   pages/ 配下などの独立したHTMLをそのまま開く
//   --widths <幅,幅> 撮影する画面幅（既定: 1440,390 = PC幅とスマホ幅）
//   --out   <dir>    スクリーンショットの保存先（既定: OS の一時フォルダ。リポジトリ内に一時ファイルを
//                    残さないため）
//
// 出力: 画面ごとに <out>/<名前>-<幅>.png を保存し、検出した問題を一覧表示する。
// 問題（コンソールエラー・ページエラー・横はみ出し）が1件でもあれば終了コード1。
//
// 前提: puppeteer が node_modules にあること（pa11y の依存として `npm install` で入る）。
//
// 落とし穴（過去に実際に踏んだもの）:
//   - スクロールで出現する演出（data-rv）は、スクロール後にしばらく待たないと未表示のまま撮れる。
//     このスクリプトはスクロール後に約2.5秒待つ。さらに fullPage 撮影の直前にビューポートを
//     ページ全体の高さへ広げ、もう一度待つ（広げた瞬間に演出が再判定され、下半分が空白で
//     写ることがあるため）。
//   - 使い捨てスクリプトをプロジェクト外で実行すると puppeteer が見つからない（このスクリプトは
//     プロジェクト内にあるので問題ない）。

import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, extname, normalize, resolve } from "node:path";

// puppeteer が無い場合は、原因と対処を分かりやすく伝えて終了する
let puppeteer;
try {
  puppeteer = (await import("puppeteer")).default;
} catch {
  console.error("puppeteer が見つかりません。プロジェクト直下で `npm install` を実行してください。");
  process.exit(2);
}

// ---- 引数の解釈 ----
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const pageLabel = opt("page", "");
const filePath = opt("file", "");
const widths = opt("widths", "1440,390").split(",").map((w) => parseInt(w, 10)).filter(Boolean);
const outDir = resolve(opt("out", join(tmpdir(), "portfolio-visual-check")));

if (!pageLabel && !filePath) {
  console.error("--page <ナビ名> または --file <HTMLのパス> を指定してください（例: --page PROFILE）。");
  process.exit(2);
}

// ---- 静的ファイルサーバ（外部コマンド不要。空いているポートで起動する）----
const ROOT = process.cwd();
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf",
};
const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const target = normalize(join(ROOT, urlPath === "/" ? "index.html" : urlPath));
    // プロジェクト外のファイルを配信しない（パストラバーサル対策）
    if (!target.startsWith(ROOT)) {
      res.writeHead(403).end();
      return;
    }
    const body = await readFile(target);
    res.writeHead(200, { "content-type": MIME[extname(target).toLowerCase()] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

await mkdir(outDir, { recursive: true });
const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
const problems = [];

const browser = await puppeteer.launch({ headless: true });
try {
  for (const width of widths) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });

    // コンソールエラー・未捕捉の例外を収集する
    const label = pageLabel || filePath;
    page.on("console", (m) => m.type() === "error" && problems.push(`[${label} @${width}] コンソールエラー: ${m.text()}`));
    page.on("pageerror", (e) => problems.push(`[${label} @${width}] ページエラー: ${e.message}`));

    await page.goto(`${baseUrl}/${filePath || "index.html"}`, { waitUntil: "networkidle0" });

    // ナビのリンクをクリックして対象画面へ移動する（非表示のメニュー内のリンクでも動くよう、
    // マウス操作ではなく要素の click() を直接呼ぶ）。
    // HOME は読み込み直後に表示される初期画面で、ナビに「HOME」という文字のリンクは無い（ロゴが該当）ため、
    // クリックせずそのまま撮影する。
    if (pageLabel && pageLabel.toUpperCase() !== "HOME") {
      const clicked = await page.evaluate((name) => {
        // テキストが一致するリンクを候補にし、ナビ用のリンク（PC用 c-016 / スマホ用 c-014）を優先する
        const matches = [...document.querySelectorAll("a")].filter((a) => a.textContent.trim().toUpperCase().startsWith(name.toUpperCase()));
        const target = matches.find((a) => a.classList.contains("c-016") || a.classList.contains("c-014")) || matches[0];
        if (!target) return false;
        target.click();
        return true;
      }, pageLabel);
      if (!clicked) {
        problems.push(`[${label} @${width}] ナビ「${pageLabel}」のリンクが見つかりません`);
        await page.close();
        continue;
      }
      await wait(600);
    }

    // 最下部までゆっくりスクロールして、スクロール連動の出現演出を発火させる → 演出の完了を待つ → 先頭へ戻る
    await page.evaluate(async () => {
      const step = Math.max(300, Math.floor(window.innerHeight * 0.6));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((ok) => setTimeout(ok, 150));
      }
      window.scrollTo(0, 0);
    });
    await wait(2500);

    // 横はみ出しの検出: ページ全体、および画面幅を超えて右にはみ出している要素
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const wide = [];
      for (const el of document.body.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > doc.clientWidth + 1) {
          wide.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""} (右端 ${Math.round(r.right)}px)`);
        }
        if (wide.length >= 5) break;
      }
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, height: doc.scrollHeight, wide };
    });
    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      problems.push(`[${label} @${width}] 横はみ出し: scrollWidth ${overflow.scrollWidth} > ${overflow.clientWidth}（例: ${overflow.wide.join(", ")}）`);
    }

    // 全体撮影の前に、ビューポートの高さをページ全体の高さに広げて、もう一度演出の完了を待つ。
    // puppeteer の fullPage 撮影は内部でビューポートを一瞬広げるため、そこで再判定された
    // スクロール連動の出現演出が「まだ表示前」のまま写り、下の方が空白になることがあった
    // （実際に PROFILE の下半分が空白の画像が撮れた）。先に広げて待つことで防ぐ。
    await page.setViewport({ width, height: Math.min(overflow.height, 16000) });
    await wait(2500);

    const safeName = label.replace(/[^\w.-]+/g, "_");
    const shot = join(outDir, `${safeName}-${width}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    console.log(`撮影: ${shot}（高さ ${overflow.height}px）`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (problems.length > 0) {
  console.log(`\n問題 ${problems.length}件:`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log("\n問題なし（コンソールエラー・横はみ出しなし）。スクリーンショットを目視で確認してください。");
