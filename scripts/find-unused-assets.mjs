// 未使用アセット（画像・フォント）の候補を洗い出すスクリプト。
//
// 目的: images/ や fonts/ 配下のファイルのうち、HTML・CSS・JS のどこからも参照されていないものを
// 一覧にする。**このスクリプトは何も削除しない**（一覧を人間が確認してから削除する運用のため）。
//
// 使い方:
//   node scripts/find-unused-assets.mjs            # 一覧を表示
//   node scripts/find-unused-assets.mjs --json     # JSONで出力
//
// 判定の考え方（誤って「使用中」を「未使用」と判定して削除する事故を避けるため、疑わしきは
// 「要確認」に倒す）:
//   - 使用中     : ファイルの相対パス（例: images/story/a.png）が、参照元のどこかにそのまま現れる
//   - 要確認     : パスは現れないが、(a) ファイル名だけが現れる、または (b) そのディレクトリ配下を
//                  文字列連結・テンプレートリテラルで動的に組み立てているコードがある
//   - 未使用候補 : 上記のどれにも当てはまらない
//
// 限界: 実行時に完全に動的な文字列（外部データから読み込んだパス等）までは検出できない。
// 削除する前に、候補ごとに `git log --follow` や実際の画面確認で裏を取ること。

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, extname, basename, sep } from "node:path";

const ROOT = process.cwd();

// 調査対象のアセット置き場と拡張子
const ASSET_DIRS = ["images", "fonts"];
const ASSET_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".webm"]);

// 参照元として読むファイルの拡張子（Markdownは「説明」であり実際の使用ではないため含めない）
const SOURCE_EXTS = new Set([".html", ".css", ".js", ".mjs", ".json", ".svg"]);

// 走査から除外するディレクトリ（依存パッケージ・Git管理外の出力・アセット自体・検証用スクリプトや
// AI設定は「サイトの参照元」ではない。scripts/ を含めるのは、このスクリプト自身のコメント中の
// 例示パスを「動的な参照」と誤検知しないため）
const SKIP_DIRS = new Set(["node_modules", ".git", ".lighthouseci", ".claude", "scripts", "images", "fonts"]);

/**
 * ディレクトリを再帰的に歩き、条件に合うファイルの絶対パス一覧を返す。
 * @param {string} dir 起点ディレクトリ
 * @param {(name: string, fullPath: string) => boolean} accept ファイルを採用する条件
 * @param {Set<string>} skipDirs 入らないディレクトリ名
 * @returns {string[]} 絶対パスの配列
 */
function walk(dir, accept, skipDirs = new Set()) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDirs.has(entry.name)) found.push(...walk(full, accept, skipDirs));
    } else if (accept(entry.name, full)) {
      found.push(full);
    }
  }
  return found;
}

// パスを「/ 区切り」に統一し、Unicode正規化（macOS由来のNFD等）の違いを吸収する
const toPosix = (p) => p.split(sep).join("/").normalize("NFC");

// 参照元のテキストを全部読み込み、比較しやすいようにパーセントエンコードを復号したものも併記する
const sourceFiles = walk(ROOT, (name) => SOURCE_EXTS.has(extname(name).toLowerCase()), SKIP_DIRS);
let haystack = "";
for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  let decoded = text;
  try {
    decoded = decodeURIComponent(text.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
  } catch {
    // 復号できない断片が混ざっていても、元のテキストだけで判定を続ける
  }
  haystack += "\n" + text.normalize("NFC") + "\n" + decoded.normalize("NFC");
}

// 動的にパスを組み立てているディレクトリ（例: 'images/travel/' + name や `images/${dir}/...`）を検出する
const dynamicDirs = new Set();
for (const m of haystack.matchAll(/["'`]((?:images|fonts)\/[^"'`$\s{}]*)["'`]\s*\+|["'`]((?:images|fonts)\/[^"'`$\s{}]*)\$\{/g)) {
  const prefix = (m[1] || m[2]).replace(/\/[^/]*$/, "");
  if (prefix) dynamicDirs.add(prefix);
}

// アセット一覧を作り、1件ずつ判定する
const assets = ASSET_DIRS.filter((d) => {
  try {
    return statSync(join(ROOT, d)).isDirectory();
  } catch {
    return false;
  }
}).flatMap((d) => walk(join(ROOT, d), (name) => ASSET_EXTS.has(extname(name).toLowerCase())));

const results = assets.map((abs) => {
  const rel = toPosix(relative(ROOT, abs));
  const size = statSync(abs).size;
  const name = basename(rel);

  let status;
  let reason = "";
  if (haystack.includes(rel)) {
    status = "used";
  } else if ([...dynamicDirs].some((d) => rel.startsWith(d + "/"))) {
    status = "check";
    reason = "配下を動的に組み立てるコードあり";
  } else if (haystack.includes(name)) {
    status = "check";
    reason = "ファイル名のみ一致";
  } else {
    status = "unused";
  }
  return { path: rel, size, status, reason };
});

const bytesToText = (n) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(2)}MB` : `${(n / 1024).toFixed(0)}KB`);
const byStatus = (s) => results.filter((r) => r.status === s).sort((a, b) => b.size - a.size);
const unused = byStatus("unused");
const check = byStatus("check");

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ scannedAssets: results.length, sourceFiles: sourceFiles.length, dynamicDirs: [...dynamicDirs], unused, check }, null, 2));
  process.exit(0);
}

console.log(`調査対象アセット: ${results.length}件 / 参照元ファイル: ${sourceFiles.length}件`);
if (dynamicDirs.size > 0) console.log(`動的にパスを組み立てているディレクトリ: ${[...dynamicDirs].join(", ")}`);

console.log(`\n■ 未使用候補（${unused.length}件・計${bytesToText(unused.reduce((s, r) => s + r.size, 0))}）`);
for (const r of unused) console.log(`  ${bytesToText(r.size).padStart(8)}  ${r.path}`);

console.log(`\n■ 要確認（${check.length}件）`);
for (const r of check) console.log(`  ${bytesToText(r.size).padStart(8)}  ${r.path}  ← ${r.reason}`);

console.log("\n注意: このスクリプトは何も削除しません。削除する場合は、一覧をユーザーに見せて確認を得てから行ってください。");
