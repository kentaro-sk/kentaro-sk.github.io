#!/usr/bin/env node
/**
 * PreToolUseフック: Edit/Write/NotebookEdit で書き込まれる内容に、APIキー・アクセストークン・
 * 秘密鍵などのシークレットらしき文字列が含まれていたら、書き込む前にブロックする。
 *
 * なぜ必要か: このリポジトリは公開されうる。一度pushした鍵はGit履歴・キャッシュ・フォークに
 * 残り、後から消しても「漏れた」扱いで失効が必要になる。AIが実行ログや設定例を貼る際に
 * 認証情報を混ぜてしまうリスクを、書き込み前（=履歴に入る前）に機械的に止める。
 * CI(gitleaks)とGitHubのPush Protectionは「後段」の防御で、これは最前段。
 *
 * 設計方針:
 *   - PreToolUseなので exit 2 でブロックし、stderrでAIに理由を返す（項目②のexit code方針）。
 *   - 誤検知を減らすため、プロバイダ固有の形式（AKIA…, ghp_… 等）と秘密鍵ヘッダを主対象にし、
 *     汎用の「password = "…"」型は、値が十分長く、プレースホルダらしくない場合だけ検出する。
 *   - 検出した値そのものは stderr に出さない（ログ経由の二次漏洩を避けるため先頭数文字のみ）。
 *   - JSONが読めない等の判定不能時は許可する（フェイルオープン。方針は項目⑦で別途検討）。
 */

// 高精度パターン（形式が固有で、誤検知がほぼ無いもの）
const PROVIDER_PATTERNS = [
  { pattern: /AKIA[0-9A-Z]{16}/, label: "AWSアクセスキーID" },
  { pattern: /gh[pousr]_[A-Za-z0-9]{30,}/, label: "GitHubトークン" },
  { pattern: /github_pat_[A-Za-z0-9_]{20,}/, label: "GitHub Fine-grained PAT" },
  { pattern: /sk-ant-[A-Za-z0-9_-]{20,}/, label: "Anthropic APIキー" },
  { pattern: /sk-[A-Za-z0-9]{32,}/, label: "OpenAI系APIキー" },
  { pattern: /xox[baprs]-[A-Za-z0-9-]{10,}/, label: "Slackトークン" },
  { pattern: /AIza[0-9A-Za-z_-]{35}/, label: "Google APIキー" },
  { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, label: "秘密鍵" },
];

// 汎用パターン: 変数名がシークレットっぽく、右辺に長い文字列リテラルがある形。
// 値の側で「プレースホルダらしいもの」を除外して誤検知を抑える。
const GENERIC_ASSIGNMENT =
  /\b(?:api[_-]?key|secret|passwd|password|access[_-]?token|auth[_-]?token|private[_-]?key)\b["']?\s*[:=]\s*["']([^"'\s]{12,})["']/gi;
const PLACEHOLDER_HINT =
  /\$\{|\{\{|<[^>]*>|example|dummy|sample|placeholder|changeme|your[_-]|xxxx|\*{4,}|process\.env|secrets\./i;

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
  if (!["Edit", "Write", "NotebookEdit"].includes(toolName)) {
    process.exit(0);
  }

  // Write: content 全体、Edit: new_string、NotebookEdit: new_source を検査対象にする
  const toolInput = payload.tool_input || {};
  const text = [toolInput.content, toolInput.new_string, toolInput.new_source]
    .filter((v) => typeof v === "string")
    .join("\n");

  const findings = [];

  for (const { pattern, label } of PROVIDER_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      findings.push(`${label}（先頭: ${m[0].slice(0, 6)}…）`);
    }
  }

  for (const m of text.matchAll(GENERIC_ASSIGNMENT)) {
    if (!PLACEHOLDER_HINT.test(m[1])) {
      findings.push(`シークレットらしき代入（変数名: ${m[0].split(/["':=\s]/)[0]}）`);
    }
  }

  if (findings.length > 0) {
    process.stderr.write(
      "[secret-scan-guard] シークレットらしき文字列を含むため、この書き込みをブロックしました。\n" +
        findings.map((f) => `  - ${f}`).join("\n") +
        "\n対応: 実際の値は書かず、環境変数（.env は .gitignore 済み）や GitHub Secrets 経由で参照してください。" +
        "サンプル値の場合は example / dummy 等の明示的なプレースホルダにしてください。" +
        "誤検知だと判断した場合は、ユーザーに確認のうえこのスクリプトのパターンを調整してください。\n"
    );
    process.exit(2);
  }

  process.exit(0);
});
