// GitHub Actions のCIログから「警告」と「失敗」を拾って、報告用にまとめるスクリプト。
//
// 目的: このプロジェクトのCIは、画像サイズ・アクセシビリティ・Lighthouse を「警告のみ」（ジョブは
// 成功＝緑）にしている。緑でも警告が出ていることに気づかず放置される事故を避けるため、
// 「CI警告は成功していても必ず報告する」というルールがある。毎回 `gh run view --log` を
// grep するのを1コマンドにして、報告の抜け漏れを防ぐ。
//
// 使い方（gh CLI にログイン済みであること）:
//   node scripts/ci-warnings.mjs 24                 # PR番号（そのPRのブランチの最新のCI実行）
//   node scripts/ci-warnings.mjs --run 35416212578  # 実行ID を直接指定
//   node scripts/ci-warnings.mjs --run 35416212578 --attempt 1   # 再実行前の1回目の結果を見る
//   node scripts/ci-warnings.mjs                    # 現在のブランチの最新のCI実行
//
// 出力: 結論（成功/失敗）、失敗したステップ、gitleaksの結果、警告のカテゴリ別の一覧。
// このスクリプトは読み取り専用（何も変更しない）。

import { execFileSync } from "node:child_process";

/** gh コマンドを実行して標準出力を返す。失敗したら原因を表示して終了する。 */
function gh(args) {
  try {
    return execFileSync("gh", args, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    console.error(`gh ${args.join(" ")} に失敗しました: ${(e.stderr || e.message).toString().trim().split("\n")[0]}`);
    process.exit(2);
  }
}

// ---- 対象の実行(run)を決める ----
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
let runId = opt("run");
const attempt = opt("attempt");

if (!runId) {
  const prNumber = argv.find((a) => /^\d+$/.test(a));
  let branch;
  if (prNumber) {
    branch = JSON.parse(gh(["pr", "view", prNumber, "--json", "headRefName"])).headRefName;
  } else {
    branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
  }
  const runs = JSON.parse(gh(["run", "list", "--branch", branch, "--limit", "1", "--json", "databaseId"]));
  if (runs.length === 0) {
    console.error(`ブランチ ${branch} のCI実行が見つかりません。`);
    process.exit(2);
  }
  runId = String(runs[0].databaseId);
}

const attemptArgs = attempt ? ["--attempt", attempt] : [];
const summary = JSON.parse(gh(["run", "view", runId, ...attemptArgs, "--json", "conclusion,status,workflowName,jobs,headBranch"]));
const rawLog = gh(["run", "view", runId, ...attemptArgs, "--log"]);

// ログの各行は「ジョブ名<TAB>ステップ名<TAB>時刻 本文」。時刻より前を取り除き、色コード・BOMも除去する
const lines = rawLog
  .split("\n")
  .map((l) => l.replace(/\r$/, "").split("\t").slice(2).join("\t"))
  .map((l) => l.replace(/^﻿?\d{4}-\d\d-\d\dT[\d:.]+Z\s?/, "").replace(/\[[0-9;]*m/g, "").replace(/\^\[\[[0-9;]*m/g, "").trim())
  .filter(Boolean);

const uniq = (arr) => [...new Set(arr)];
const grep = (re) => uniq(lines.filter((l) => re.test(l)));

// ---- 結論・失敗ステップ ----
console.log(`ワークフロー: ${summary.workflowName} / ブランチ: ${summary.headBranch} / 実行ID: ${runId}${attempt ? ` (試行${attempt})` : ""}`);
console.log(`結論: ${summary.conclusion || summary.status}`);

const failedSteps = summary.jobs.flatMap((j) => (j.steps || []).filter((s) => s.conclusion === "failure").map((s) => `${j.name} / ${s.name}`));
if (failedSteps.length > 0) {
  console.log("\n■ 失敗したステップ");
  for (const s of failedSteps) console.log(`  - ${s}`);
  const errors = grep(/^##\[error\]|^ERROR:|broken links|Detected \d+ broken/i);
  for (const e of errors) console.log(`    ${e.slice(0, 200)}`);
  // 429（レート制限）はリンクチェックが警告扱いにしているものなので、リンク切れからは除く
  const broken = grep(/^\[(?:0|4(?!29)\d\d|5\d\d)\] http/);
  if (broken.length > 0) console.log(`    リンク切れ: ${broken.join(", ").slice(0, 400)}`);
}

// ---- シークレットスキャン ----
const leaks = grep(/no leaks found|leaks found/i);
console.log(`\n■ シークレットスキャン(gitleaks): ${leaks.length > 0 ? leaks.map((l) => l.replace(/^.*?INF\s*/, "")).join(" / ") : "（ログに結果なし）"}`);

// ---- 警告をカテゴリ別に ----
console.log("\n■ 警告（成功していても報告が必要なもの）");

const imageHeader = grep(/1MBを超える画像が\d+件/);
const imageItems = grep(/^- .*\(\d+(?:\.\d+)?MB\)$/);
if (imageHeader.length > 0) {
  console.log(`  [画像サイズ] ${imageHeader[0].replace(/^⚠\s*/, "")}`);
  for (const i of imageItems.slice(0, 12)) console.log(`      ${i}`);
  if (imageItems.length > 12) console.log(`      …ほか ${imageItems.length - 12} 件`);
}

const a11y = grep(/pa11y/i).filter((l) => /失敗|警告|⚠|issue|timeout/i.test(l));
if (a11y.length > 0) {
  console.log("  [アクセシビリティ(pa11y)]");
  for (const l of a11y.slice(0, 6)) console.log(`      ${l.replace(/^##\[warning\]/, "").slice(0, 180)}`);
}

const lh = grep(/warning for .*minScore assertion|categories\.[\w-]+ .*(?:expected|found)/i);
const lhCategories = uniq(lh.map((l) => (l.match(/categories\.([\w-]+)/) || [])[1]).filter(Boolean));
if (lhCategories.length > 0) {
  console.log(`  [Lighthouse] スコア閾値未達: ${lhCategories.join(", ")}（${lh.length}行）`);
}

const linkWarn = grep(/^\[WARN\]|\(429\)/);
if (linkWarn.length > 0) {
  console.log("  [リンクチェック] 外部サイトが 429(レート制限) 等で確認できなかったURL:");
  for (const l of linkWarn.slice(0, 6)) console.log(`      ${l.slice(0, 160)}`);
}

// 上のどれにも入らない ##[warning]・非推奨の通知（Node 20 廃止予告など）
const known = new Set([...imageHeader, ...imageItems, ...a11y, ...lh, ...linkWarn]);
const others = grep(/^##\[warning\]|Node 20 is being deprecated/i).filter((l) => !known.has(l) && !/画像サイズが|pa11y/.test(l));
if (others.length > 0) {
  console.log("  [その他]");
  for (const l of others.slice(0, 6)) console.log(`      ${l.replace(/^##\[warning\]/, "").slice(0, 200)}`);
}
const npmDeprecated = lines.filter((l) => /^npm warn deprecated/.test(l)).length;
if (npmDeprecated > 0) console.log(`  [依存パッケージ] npm の deprecated 警告 ${npmDeprecated} 件（依存関係由来。通常は対応不要）`);

const anyWarning = imageHeader.length + a11y.length + lhCategories.length + linkWarn.length + others.length + npmDeprecated;
if (anyWarning === 0) console.log("  （警告なし）");
