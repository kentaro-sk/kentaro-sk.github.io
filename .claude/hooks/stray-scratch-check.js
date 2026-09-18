#!/usr/bin/env node
/**
 * Stopフック: 応答ターンが終わる（ユーザーに制御が戻る）タイミングで、
 * 直前に作業していたディレクトリ(cwd)がgitリポジトリであれば git status を確認し、
 * 一時検証スクリプトらしき未追跡ファイルが放置されていないかを警告する。
 *
 * なぜ必要か: 実際にこのリポジトリでの作業中、Puppeteerでの見た目確認用に
 * つくった一時スクリプト（_contrast.js, _story_shot.js 等）をプロジェクト直下に
 * 作ったまま消し忘れ、ユーザーに指摘される／git statusで偶然気づく、という
 * 同型のミスが複数回発生した。スクラッチパッドディレクトリを使うべき場面で
 * プロジェクト直下に作ってしまう、というAI側の再現性あるミスパターンなので、
 * hookで機械的に気づかせる。
 *
 * 設計方針: ブロックはせず(exit 0)、stderrへの警告のみに留める。「本当に必要な
 * 新規ファイル」まで止めてしまうと日常作業の妨げになるため、あくまで気づきの
 * トリガーとして使う。
 */

const { execSync } = require("child_process");

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});

process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch (e) {
    process.exit(0);
  }

  // Stopフック自身が別のStopフック呼び出しを誘発する無限ループを防ぐ
  if (payload.stop_hook_active) {
    process.exit(0);
  }

  const cwd = payload.cwd || process.cwd();

  let statusOutput = "";
  try {
    statusOutput = execSync("git status --porcelain", {
      cwd,
      encoding: "utf8",
    });
  } catch (e) {
    // gitリポジトリでない・コマンド失敗等は判定不能なので何もしない
    process.exit(0);
  }

  const untracked = statusOutput
    .split("\n")
    .filter((line) => line.startsWith("??"))
    .map((line) => line.slice(3).trim());

  // 先頭アンダースコア、または verify-/test-/debug-/tmp-/scratch- 等で
  // 始まる使い捨てスクリプトらしき命名パターン
  const scratchPattern =
    /^_[\w.-]+\.(js|mjs|cjs|ts|py|html|png|json)$|^(verify|test|debug|tmp|scratch|shot|measure)[-_].*\.(js|mjs|ts|py)$/i;

  const suspicious = untracked.filter((f) =>
    scratchPattern.test(f.split("/").pop())
  );

  if (suspicious.length > 0) {
    process.stderr.write(
      "[stray-scratch-check] 一時検証スクリプトらしき未追跡ファイルが残っています。" +
        "本来はClaude Codeのスクラッチパッドディレクトリに置くべきものです。" +
        "削除するか、次のターンで片付けを検討してください:\n" +
        suspicious.map((f) => "  - " + f).join("\n") +
        "\n"
    );
  }

  process.exit(0);
});
