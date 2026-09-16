// images/ 配下の画像ファイルサイズをチェックし、大きすぎるものを警告するスクリプト。
//
// なぜ「エラーで止める」ではなく「警告のみ」にしているか:
// 導入時点(2026-09-16)で1MBを超える画像が既に十数枚あり、これらは「今すぐ直せる」種類の
// 問題ではない（画質を落とさず圧縮するには、1枚ずつ見た目を確認しながら作業する必要がある）。
// html-validateのlang/title対応と違い、機械的に安全に直せないため、CIをブロックせず
// 「気づけるようにする」だけに留めている。将来的に既存画像の最適化が完了したら、
// 新規追加分だけをエラーにする運用に切り替えることも検討できる。
import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

// 対象拡張子（Webでよく使う画像形式）
const TARGET_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

// 警告の閾値（バイト単位）。1MBを超える画像はLCP(表示速度指標)に悪影響を与えやすいとされる目安。
const THRESHOLD_BYTES = 1 * 1024 * 1024;

const IMAGES_ROOT = "images";

// 指定ディレクトリ配下を再帰的に走査し、画像ファイルのパス一覧を返す
function collectImageFiles(directory) {
  const results = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImageFiles(fullPath));
    } else if (TARGET_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

const oversizedFiles = collectImageFiles(IMAGES_ROOT)
  .map((path) => ({ path, bytes: statSync(path).size }))
  .filter((file) => file.bytes > THRESHOLD_BYTES)
  .sort((a, b) => b.bytes - a.bytes);

if (oversizedFiles.length === 0) {
  console.log(`✓ ${THRESHOLD_BYTES / 1024 / 1024}MBを超える画像はありません。`);
  process.exit(0);
}

console.log(
  `⚠ ${THRESHOLD_BYTES / 1024 / 1024}MBを超える画像が${oversizedFiles.length}件あります（表示速度に影響する可能性があります）:`
);
for (const file of oversizedFiles) {
  const sizeMb = (file.bytes / 1024 / 1024).toFixed(2);
  console.log(`  - ${file.path} (${sizeMb}MB)`);
  // GitHub Actions上で警告アノテーションとして表示する（ジョブは失敗させない）
  console.log(`::warning file=${file.path}::画像サイズが${sizeMb}MBあります（目安: 1MB以下）`);
}

// 意図的に exit 0（警告のみでジョブを失敗させない）
process.exit(0);
