#!/usr/bin/env node
/**
 * Stopフック: 応答ターンが終わる（ユーザーに制御が戻る）タイミングで、
 * 作業中のgitリポジトリに未コミットの .html / .css の変更があれば、
 * `npm run check:fast`（HTML構文 + CSS構文の軽量チェック）を1回だけ実行し、
 * 失敗していれば警告する。
 *
 * なぜ必要か: PostToolUseフック(portfolio-lint-check.js)は「1回の編集ごと」に
 * 警告を出すが、複数回の編集の途中で出た警告は流れてしまい、最終状態が本当に
 * 壊れていないかの確認にはならない。ターン終了時に「最終状態」を1回だけ
 * まとめて確認することで、編集ごとの警告の見落としを最後に拾う。
 * CI（PR時）で初めて赤になる手戻りを、手元のターン終了時点まで前倒しする。
 *
 * 設計方針:
 *   - ブロックはせず(exit 0)、stderrへの警告のみ。ターンはすでに終わろうとして
 *     いるため、止めても得るものが少ない（項目②のexit code方針と同じ）。
 *   - リポジトリ判定は「gitの最上位ディレクトリに package.json があり、
 *     scripts に check:fast が定義されている」ことを条件にする。該当しない
 *     ディレクトリ（別プロジェクト・gitでない場所）では何もしない。
 *   - 実際に走らせるチェックの定義は package.json に一元化されており、
 *     手動実行・CIと同じ `npm run` を呼ぶので、判定基準がずれない。
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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

  // gitの最上位ディレクトリと、未コミット変更の一覧を取得する
  let repoRoot = "";
  let statusOutput = "";
  try {
    repoRoot = execSync("git rev-parse --show-toplevel", { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    statusOutput = execSync("git status --porcelain", { cwd: repoRoot, encoding: "utf8" });
  } catch (e) {
    // gitリポジトリでない・コマンド失敗等は判定不能なので何もしない
    process.exit(0);
  }

  // check:fast が定義されているプロジェクトだけを対象にする
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
    if (!pkg.scripts || !pkg.scripts["check:fast"]) {
      process.exit(0);
    }
  } catch (e) {
    process.exit(0);
  }

  // .html / .css の変更（追加・修正・未追跡）が無ければ走らせる意味がない
  const changed = statusOutput
    .split("\n")
    .map((line) => line.slice(3).trim())
    .filter((f) => /\.(html|css)$/i.test(f) && !/(^|\/)node_modules\//.test(f));
  if (changed.length === 0) {
    process.exit(0);
  }

  try {
    execSync("npm run check:fast", { cwd: repoRoot, stdio: "pipe", timeout: 120000 });
  } catch (e) {
    process.stderr.write(
      "[fast-check-on-stop] 未コミットの .html/.css の変更があり、最終状態で `npm run check:fast` が失敗しました。" +
        "PR前に修正してください。\n\n" +
        (e.stdout ? e.stdout.toString() : "") +
        (e.stderr ? e.stderr.toString() : "") +
        "\n"
    );
  }

  process.exit(0);
});
