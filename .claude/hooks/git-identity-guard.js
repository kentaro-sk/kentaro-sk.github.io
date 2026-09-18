#!/usr/bin/env node
/**
 * PreToolUseフック: Bashツールで `git push` を実行する直前に、
 * このリポジトリのremote URLが個人アカウント（kentaro-sk）を
 * 指しているかを確認する。
 *
 * なぜ必要か: 開発機では複数のGitHubアカウントをSSH Hostエイリアスで
 * 使い分けている。意図しないアカウントでこのリポジトリをpushしてしまう
 * 事故を機械的に防ぐ。
 *
 * 制約: このフックは payload.cwd（フック実行時点のカレントディレクトリ）を
 * 手がかりに判定するベストエフォート方式。`git push` の前に明示的に
 * `cd <repo>` していないケース（例: 1コマンドで別ディレクトリのgitを
 * 操作する `git -C <path> push`）までは検知できない。誤検知/検知漏れが
 * あればユーザーに確認のうえこのスクリプトを調整すること。
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

  if (payload.tool_name !== "Bash") {
    process.exit(0);
  }

  const command = (payload.tool_input && payload.tool_input.command) || "";
  if (!/\bgit\s+push\b/.test(command)) {
    process.exit(0);
  }

  const cwd = payload.cwd || process.cwd();

  let remoteUrl = "";
  try {
    remoteUrl = execSync("git remote get-url origin", { cwd, encoding: "utf8" }).trim();
  } catch (e) {
    // remote未設定・gitリポジトリでない等は判定不能なので許可する
    process.exit(0);
  }

  const usesPersonalAccount =
    /github\.com-kentaro-sk/i.test(remoteUrl) || /kentaro-sk\//i.test(remoteUrl);

  if (!usesPersonalAccount) {
    process.stderr.write(
      `[git-identity-guard] remoteが個人アカウント（kentaro-sk）を使用していません。\n` +
        `現在のremote: ${remoteUrl}\n` +
        `誤ったアカウントでpushしようとしていないか確認してください。\n`
    );
    process.exit(2);
  }

  process.exit(0);
});
