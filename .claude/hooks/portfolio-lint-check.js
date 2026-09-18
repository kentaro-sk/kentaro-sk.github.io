#!/usr/bin/env node
/**
 * PostToolUseフック: このリポジトリの .html / .css ファイルを Edit/Write した
 * 直後に html-validate / stylelint を自動実行し、構文エラーがあれば
 * 警告としてAIにフィードバックする。
 *
 * なぜ必要か: CLAUDE.mdは「HTMLが構文的に壊れていないこと」を自動push条件に
 * しているが、それを確認する npm run check:html / check:css の実行はAIが
 * 忘れずに叩くことに依存していた。このhookで、AIの記憶力に頼らず機械的に
 * 確認する。
 *
 * 注記: 開発ワークスペース（claudecode_ws/.claude/hooks/）にある原本は、
 * モノレポ内のどのプロジェクトを編集したかをファイルパスから判定してから
 * このリポジトリのnpmスクリプトを呼び出す設計になっている。このリポジトリを
 * 単体でcloneした場合はその判定が不要なため、常にリポジトリ直下(cwd)を
 * 対象に簡略化してある。
 *
 * 設計方針: 「もう編集は完了している」タイミングのhookなので、ここでブロック
 * (exit 2)しても手戻りが大きいだけで得るものが少ない。常にexit 0で許可した
 * うえでエラー内容だけstderrに流し、AIが次の一手で気づいて自分で直せるように
 * する。
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

  const toolName = payload.tool_name || "";
  if (!["Edit", "Write"].includes(toolName)) {
    process.exit(0);
  }

  const toolInput = payload.tool_input || {};
  const filePath = toolInput.file_path || "";
  if (!/\.(html|css)$/i.test(filePath)) {
    process.exit(0);
  }

  const cwd = payload.cwd || process.cwd();
  const results = [];

  try {
    execSync("npm run check:html", { cwd, stdio: "pipe" });
  } catch (e) {
    results.push(
      "[html-validate]\n" +
        (e.stdout ? e.stdout.toString() : "") +
        (e.stderr ? e.stderr.toString() : "")
    );
  }

  try {
    execSync("npm run check:css", { cwd, stdio: "pipe" });
  } catch (e) {
    results.push(
      "[stylelint]\n" +
        (e.stdout ? e.stdout.toString() : "") +
        (e.stderr ? e.stderr.toString() : "")
    );
  }

  if (results.length > 0) {
    process.stderr.write(
      "[portfolio-lint-check] 直前の編集で構文エラーが検出されました。修正を検討してください。\n\n" +
        results.join("\n\n") +
        "\n"
    );
  }

  process.exit(0);
});
