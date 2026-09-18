<!-- GENERATED FILE: Edit ai-instructions/ws__personal__portfolio/shared.md, then run scripts/sync-agent-instructions.ps1 -Action Sync. -->

# CLAUDE.md — portfolio プロジェクト固有ガイドライン

このファイルは親ディレクトリ（ワークスペースルート）の `CLAUDE.md` に追加・上書きする
プロジェクト固有のルールを定義します。このプロジェクトのみに適用されます。

---

## プロジェクト情報

- **プロジェクト名**: portfolio（杉浦健太郎 パーソナルポートフォリオサイト）
- **GitHubリポジトリ**: https://github.com/kentaro-sk/kentaro-sk.github.io
  （**⚠️暫定運用(2026-09-17〜)**: このリポジトリは常時Publicにはしない方針。GitHubの
  Branch protection ruleはPrivateリポジトリだと有料プランが必要なため、**作業を開始する
  ときにPublic化し、作業を終える（このプロジェクトでの一連の作業が完了する）ときに
  必ずPrivateへ戻す**運用にしている。

  - 作業開始時: `gh repo edit kentaro-sk/kentaro-sk.github.io --visibility public --accept-visibility-change-consequences`
  - 作業終了時（区切りの良いタイミング・会話の終盤等）: `gh repo edit kentaro-sk/kentaro-sk.github.io --visibility private --accept-visibility-change-consequences`
  - Private化を忘れないよう、その作業セッションの最後の完了報告をする前に
    `gh api repos/kentaro-sk/kentaro-sk.github.io --jq .visibility` で確認する習慣をつける。
  - **既知の副作用（2026-09-17判明）**: 無料プランではPrivateリポジトリでGitHub Pagesを
    公開できないため、**Private化するとGitHub Pagesサイトの設定自体が削除される**
    （`GET /repos/.../pages` が404になる）。そのため次回Public化した直後は、以下の
    手順でPagesサイトを再作成し、直近のデプロイを再実行すること（忘れると本番サイトが
    落ちたままになる）：
    ```powershell
    gh api -X POST repos/kentaro-sk/kentaro-sk.github.io/pages -f 'build_type=workflow' -f 'source[branch]=main' -f 'source[path]=/'
    gh run rerun <直近のdeploy.ymlのrun ID> --repo kentaro-sk/kentaro-sk.github.io
    # 確認
    gh api repos/kentaro-sk/kentaro-sk.github.io/pages --jq '{status,html_url,build_type}'
    ```
  - **常時Public運用に切り替えることが決まったら、この暫定運用に関する記述（この⚠️の
    箇条書き全体）を削除すること。**

  なお、初回Public化前（2026-09-17）にGit履歴に残っていた不適切な記述（機密情報にあたる
  文言）は`git-filter-repo`で削除済み〈全ブランチ・強制push済み〉。作業中は一時的にでも
  公開状態になることを常に意識すること）
- **本番URL**: https://kentaro-sk.github.io
- **ブランチ戦略**: `main` への直接pushはGitHub Branch protection ruleで禁止（2026-09-17〜）。
  作業ブランチ→Pull Request作成→CI通過を確認→マージ、という流れに統一する
  （個人サイトではあるが、CIによる機械チェックを本当にデプロイ前のゲートにするため）。
  保護ルールの内容: CIジョブ`check`の成功が必須ステータスチェック／PR必須（レビュー承認数0で可）／
  強制push・ブランチ削除は禁止。`enforce_admins`はfalseにしており、リポジトリ管理者（＝自分自身）は
  緊急時に保護ルールをバイパスして直接pushできる状態を残しているが、これは
  「通常のマージ確認よりさらに慎重な操作」（後述）として扱い、日常的なマージ経路には使わない。

---

## Git 自動化ルール（このプロジェクント限定）

> **このプロジェクトでは、作業ブランチの作成・コミット・push・PR作成・CI結果の確認までを
> Claude が自動で行う。ユーザーへの個別確認は不要。**
> **ただし、PRを `main` に実際にマージする（＝本番に反映する）前には、必ずユーザーに
> 最終確認を取る**（2026-09-17変更。理由: PR必須化によりmainへの直接pushはできなくなった
> ため、「本番に影響する操作」は push ではなく merge に一本化された）。下記の安全条件も
> 必ず守ること。

### 自動で行う作業（ユーザー確認不要）

以下の条件を**すべて満たす**ときに、作業ブランチの作成からPR作成・CI結果の確認までを
自動で行う：

| 条件 | 詳細 |
|------|------|
| ✅ 作業単位が完結している | 1つの機能追加・バグ修正・コンテンツ更新が完了した時点 |
| ✅ HTMLが構文的に壊れていない | タグの開閉が正しい・ページが表示可能な状態 |
| ✅ 変更ファイルが意図した範囲内 | 無関係なファイルを巻き込んでいない |
| ✅ 秘密情報が含まれていない | APIキー・パスワード等がコードに混入していない |

```powershell
# ステップ1: 変更内容を確認（差分チェック）
git diff
git status

# ステップ2: 作業ブランチを作成（例: work/2026-09-17-lighthouse-ci のように
# 日付+内容がわかる kebab-case。main上で直接作業していた場合はここで分岐する）
git checkout -b work/<日付>-<内容>

# ステップ3: 変更ファイルをステージング（関連ファイルのみ）
git add <変更したファイル>

# ステップ4: 日本語コミットメッセージでコミット
git commit -m "種別: 変更内容の要約（日本語）"

# ステップ5: 作業ブランチをpush（mainではないため本番に影響しない。確認不要）
git push origin work/<日付>-<内容>

# ステップ6: Pull Requestを作成
gh pr create --title "種別: 変更内容の要約（日本語）" --body "変更内容の詳細"

# ステップ7: CIの結果を確認（数分かかることがある）
gh pr checks --watch
```

### コミットメッセージ・PRタイトルのルール

親 `CLAUDE.md` のルールに従い、日本語で記述する：

```
feat: プロフィールページに研究テーマを追加
fix: スマホ表示でメニューが崩れる問題を修正
docs: README に開発手順を追記
chore: .gitignore に一時ファイルを追加
```

### マージ前の確認（必須）

CIの結果を確認したら、`gh pr merge` を実行する **前に** 必ず以下をユーザーに提示し、
明示的な承認（「OK」「マージして」等）を得てから実行する。承認を得るまでマージしない。

```
📋 マージ確認
　マージするブランチ: work/2026-09-17-lighthouse-ci → main
　PR: feat: Lighthouse CIを追加 (#12) https://github.com/kentaro-sk/kentaro-sk.github.io/pull/12
　作業単位の内容: Lighthouse CIによるパフォーマンス/SEOスコア計測を追加
　CI結果: ✅ 必須チェック(check)は成功 / ⚠ 警告2件（下記参照）
　　- 画像サイズ超過: images/travel/travel-world-map.png (2.61MB)
　　- アクセシビリティ: index.htmlでコントラスト比不足14件
このままマージしてよいですか？
```

- 「マージするブランチ」: 作業ブランチ名とマージ先（常に`main`）
- 「作業単位の内容」: PRのタイトル・概要
- 「CI結果」: 必須チェックの成否に加え、**警告（後述の「CI警告の報告義務」）は
  ビルドが成功していても必ず一覧で提示する**

### 通常のマージ確認よりさらに慎重な操作（自動実行しない）

以下の操作は、上記「マージ前の確認」の簡易な「OK」だけでは実行せず、
操作内容そのもののリスクを個別に説明したうえで、必ずユーザーに確認する：

- `git push --force`（強制プッシュ）
- `git reset --hard`（変更の完全破棄）
- ファイルの削除（`git rm` や OS上のファイル削除）
- ブランチ保護ルールの変更・無効化
- admin権限によるCIチェックのバイパスマージ（`gh pr merge --admin`等）

### 作業完了後の報告フォーマット

**PR作成・CI確認完了時**（マージ確認を求めるタイミングで）、上記「マージ前の確認」の
フォーマットで報告する。

**ユーザーの承認を得てマージが完了したら**、以下の形式で報告する：

```
✅ マージ完了
　マージしたブランチ: work/2026-09-17-lighthouse-ci → main
　本番反映: https://kentaro-sk.github.io（数秒〜1分で反映）
```

### CI警告の報告義務

`.github/workflows/ci.yml` のチェックのうち、画像サイズ・アクセシビリティ・Lighthouseスコアは
**意図的に警告のみ**（ビルドを失敗させない）にしている（後述）。これはCIを形骸化させない
ための設計だが、裏を返すと「ビルドが成功（緑）していても実は警告が出ている」状態が
気づかれずに放置されるリスクがある。

**そのためClaudeは、CIの実行結果を確認した際（マージ確認時に限らず、GitHub Actionsの
ログや `gh pr checks` / `gh run view --log` 等を確認したとき）、警告が1件でも出ていれば、
たとえジョブ自体が成功していても、その内容を必ずユーザーに報告すること。** 黙って見なかった
ことにしてはならない。

### CI/CD による自動検証（`.github/workflows/ci.yml`）

`main` へのマージは GitHub Pages にそのまま反映されるため、Claude の目視確認だけに
頼らず、Pull Request作成時に GitHub Actions が機械的にチェックする（`pull_request`
トリガーで実行され、Branch protection ruleにより必須チェックとしてマージをブロックする）：

**ビルドを失敗させる（マージをブロックする）チェック**
- HTML構文チェック（`html-validate`）
- リンク切れ・画像パス切れチェック（`linkinator`）
- CSS構文チェック（`stylelint`）

**警告のみ（マージはブロックしないが、上記「CI警告の報告義務」により必ず報告する）**
- 画像サイズチェック（1MB超、`scripts/check-image-sizes.mjs`）
- アクセシビリティチェック（WCAG2AA、`pa11y`、`scripts/check-accessibility.mjs`）
- Lighthouse CI（パフォーマンス/SEO等のスコア、`lighthouserc.json`で`"warn"`設定）

チェック内容を追加・強化したい場合は `.github/workflows/ci.yml` と `package.json` の
devDependencies を編集する。

補足:
- `html-validate` の標準ルール（`html-validate:recommended`）はこのプロジェクトのコーディング
  規約（インラインstyle許容・`<x-dc>` `<helmet>` 等の独自タグ使用）と衝突するため、
  `.htmlvalidate.cjs` でスタイル/アクセシビリティ上の好みに関するルールのみをoffにし、
  タグの閉じ忘れ等の本当の構文崩れを検知するルールは有効なまま残している。
- `linkinator` は `{{ item.href }}` のようなDCランタイムのテンプレート構文（クライアント側JSで
  実際のURLに置換される）を「壊れたリンク」と誤検知するため、`--skip %7B%7B` で除外している
  （`%7B%7B` は `{{` のURLエンコード形）。
- `stylelint` は書式の好みではなく `stylelint-config-recommended`（本当に壊れている可能性が
  高いものだけ）を採用。`no-descending-specificity` は既存CSSの並び順を変えるリスクの方が
  大きいため、見た目維持を優先しoffにしている（詳細は`.stylelintrc.cjs`のコメント参照）。
- 画像サイズ・アクセシビリティ・Lighthouseを警告のみにしているのは、いずれも「機械的に
  安全に直せない」問題（画質劣化のリスクがある圧縮、配色というデザイン判断、スコアの
  変動幅）のため。ビルドを止めると常に赤信号になって形骸化するリスクの方が高いと判断した。
- Lighthouse CIの依存パッケージ(`@lhci/cli`)にはdevDependencies限定の既知の脆弱性
  （ローカルでのアーカイブ展開時のパストラバーサル系）があるが、本番サイトには含まれず、
  信頼できるCI環境内でのみ実行するためリスクは低いと判断し、承知のうえで導入している。
- Lighthouse CIはWindows環境ではchrome-launcherの一時フォルダ削除処理でOS固有のエラーが
  発生し、ローカル実行で正しく完了しないことを確認済み（2026-09-16）。GitHub Actions
  (Ubuntu)側では問題なく動く想定だが、閾値は実測前の仮設定であることに注意。

---

## このプロジェクト固有のコーディング規約

### HTML
- インデントはスペース2文字
- 属性値は必ずダブルクォートで囲む（`class="foo"` ○ / `class='foo'` ×）
- 文字コードは `utf-8` を維持する
- 外部ライブラリは既存の CDN バージョンを維持する（勝手にアップデートしない）

### CSS
- 共通スタイルは単一の `css/site.css` に追記する（ページ別の `stylesheet.css` は存在しない）
- インラインスタイル（`style="..."` 属性）は基本的に許容する。同一の style 値が
  3箇所以上で重複した場合のみ、意味のあるクラス名に切り出して `css/site.css` に定義する
  （2箇所以下の重複はインラインのまま維持してよい）
- **エレベーション（box-shadow）はhover主導にする**: カード・ボタンは静止時shadowなし
  （1px hairline borderのみ）とし、hoverしたときだけ`translateY`＋2層box-shadowを
  立ち上げる。常時shadowを付けない（詳細は`DESIGN.md`の「Elevation & Depth」参照）。
- **border-radiusは0px（角丸なし）を基調にする**: CTAボタン・大半のカードは角丸0で
  統一する。例外は「現在地・アイコン」用途の50%（円形）と、バッジ用途限定の999px
  （pill）のみ。カードで10px/16pxの角丸を使う場合も既存の3段階（0/10/16px）の枠内に
  収める（詳細は`DESIGN.md`の「Shapes」参照）。

### JavaScript
- `js/support.js`・`js/particle-field.js`・`js/flow-cycle.js`・`js/journey-scene.js`・
  `js/dream-city.js` はいずれも手書きファイルであり、直接編集してよい
  （`js/support.js` は過去に `dc-runtime` という独自ビルドツールの生成物として運用されていたが、
  `dc-runtime` 自体がリポジトリに存在しないことが2026-09-16に判明し、手書きファイル運用に統一した）
- `var` ではなく `const` / `let` を使用する
- すべての関数・処理ブロックに日本語コメントを付ける（親 CLAUDE.md のルール厳守）
