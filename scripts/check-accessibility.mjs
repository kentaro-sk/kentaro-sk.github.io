// index.html・pages/配下の各ページに対してアクセシビリティ検証(pa11y, WCAG2AA基準)を
// 実行し、指摘事項を一覧表示するスクリプト。
//
// なぜ「エラーで止める」ではなく「警告のみ」にしているか:
// 導入時点(2026-09-16)でindex.htmlに「文字色と背景色のコントラスト比不足」が14件見つかったが、
// これは配色というデザイン判断そのものに関わる問題であり、機械的に安全に直せない
// （このプロジェクトは見た目を変えないことを優先する方針のため、色の変更はデザイン判断が必要）。
// 画像サイズチェック(check-image-sizes.mjs)と同じ理由で、CIはブロックせず
// 気づけるようにするだけに留めている。
import pa11y from "pa11y";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// チェック対象ページ: トップページ + pages/配下の全HTML
const pageFiles = [
  "index.html",
  ...readdirSync("pages")
    .filter((name) => name.endsWith(".html"))
    .map((name) => `pages/${name}`),
];

let totalIssues = 0;

for (const pageFile of pageFiles) {
  const url = pathToFileURL(resolve(pageFile)).href;
  let result;
  try {
    // GitHub Actions(Ubuntu)のコンテナ環境ではChromeの標準サンドボックスが
    // 使えず起動に失敗するため、--no-sandboxを指定する必要がある
    // （ローカルWindows環境では不要だが、付けても害はない）。
    result = await pa11y(url, {
      chromeLaunchConfig: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
    });
  } catch (error) {
    // pa11y自体の起動失敗もビルドは止めず、警告として報告する
    console.log(`⚠ ${pageFile}: pa11yの実行に失敗しました（${error.message}）`);
    console.log(`::warning file=${pageFile}::pa11yの実行に失敗しました: ${error.message}`);
    continue;
  }

  if (result.issues.length === 0) {
    console.log(`✓ ${pageFile}: 指摘なし`);
    continue;
  }

  totalIssues += result.issues.length;
  console.log(`⚠ ${pageFile}: ${result.issues.length}件の指摘`);
  for (const issue of result.issues) {
    const message = issue.message.replace(/\r?\n/g, " ");
    console.log(`  - [${issue.code}] ${message}`);
    console.log(`    要素: ${issue.selector}`);
    // GitHub Actions上で警告アノテーションとして表示する（ジョブは失敗させない）
    console.log(`::warning file=${pageFile}::${message}`);
  }
}

console.log(`\n合計 ${totalIssues} 件の指摘（WCAG2AA基準、pa11y）`);

// 意図的に exit 0（警告のみでジョブを失敗させない）
process.exit(0);
