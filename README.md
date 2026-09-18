# kentaro-sk.github.io

杉浦健太郎のパーソナルポートフォリオサイトです。

これまでの研究・仕事・趣味などの歩みを、1つのページの中で紹介しています。

🔗 https://kentaro-sk.github.io/

## Built with

フレームワークを使わず、素の HTML / CSS / JavaScript（Web Components）で作っています。

- HTML / CSS / JavaScript（Custom Elements / Web Components）
- [D3.js](https://d3js.org/) — 地図・データビジュアライゼーション（`pages/hobby-travel.html` 等）
- Google Fonts

## ディレクトリ構成

```
.
├── index.html              トップページ（1ページ完結のSPA的構成）
├── pages/                   個別ページ・iframe埋め込み用のサブページ
├── css/site.css             共通スタイルシート
├── js/                      手書きのWeb Components
│   ├── support.js            共通ロジック（カスタム要素の登録・ルーティング等）
│   ├── particle-field.js     点群エフェクト
│   ├── journey-scene.js      夜景シーン
│   ├── dream-city.js         「夢の街」シーン
│   └── flow-cycle.js         循環図エフェクト
├── images/ fonts/            静的アセット
├── scripts/                  CI用の検証スクリプト（画像サイズ・アクセシビリティチェック）
├── .htmlvalidate.cjs         HTML構文チェックの設定
├── .stylelintrc.cjs          CSS構文チェックの設定
├── lighthouserc.json         Lighthouse CIの設定
└── .github/workflows/        CI/CDパイプライン定義（後述）
```

## 開発

### セットアップ

```sh
npm install
```

### ローカルでの検証

```sh
npm run check          # HTML/リンク/CSS/画像サイズ/アクセシビリティを一括チェック
npm run check:html     # HTML構文チェック（html-validate）
npm run check:links    # リンク切れ・画像パス切れチェック（linkinator）
npm run check:css      # CSS構文チェック（stylelint）
npm run check:images   # 画像サイズチェック（1MB超で警告）
npm run check:a11y     # アクセシビリティチェック（pa11y, WCAG2AA）
npm run check:lighthouse  # パフォーマンス/SEO等のスコア計測（Lighthouse CI）
```

## CI/CD

このリポジトリは、Pull Requestベースのパイプラインで運用しています。

1. 作業ブランチで変更 → Pull Request作成
2. GitHub Actions（[`ci.yml`](.github/workflows/ci.yml)）が自動検証
   - **マージをブロックするチェック**: HTML構文・リンク切れ・CSS構文
   - **警告として報告するチェック**（マージはブロックしない）: 画像サイズ・アクセシビリティ(WCAG2AA)・Lighthouseスコア
3. チェックに通ったPRを `main` にマージ
4. `main` への変更をトリガーに、[`deploy.yml`](.github/workflows/deploy.yml) がGitHub Pagesへ自動デプロイ

Branch protection ruleにより、`main` への直接pushはできず、CIを通過したPull Requestのみがマージ可能です。

## AI駆動開発について

このリポジトリは、[Claude Code](https://claude.com/claude-code) を使ったAI駆動開発で構築・運用しています。単に「AIにコードを書かせる」のではなく、AIが安全かつ再現性高く動けるように、以下のような「ハーネス（足場）」を整備しています。

- **[`CLAUDE.md`](./CLAUDE.md) / [`AGENTS.md`](./AGENTS.md)**: このプロジェクト固有のコーディング規約・Git運用ルールをAIに指示する設定ファイル。ワークスペース共通ルールと合わせて階層的に管理しています
- **CI/CDによる機械的な検証**: 上記の通り、AIの目視確認だけに頼らず、HTML構文・アクセシビリティ・パフォーマンス等を毎回自動チェックしています
- **Pull Requestベースの承認フロー**: `main` への変更は必ずPull Request経由。AIが自動でブランチ作成・コミット・PR作成・CI結果の確認までを行いますが、**本番環境（GitHub Pages）へのマージは必ず人間の最終承認を経てから実行**します
- **段階的な安全設計**: 「壊れている可能性が高いもの」はビルドを失敗させてブロックし、「デザイン判断が必要なもの（配色・画像品質等）」は警告に留めて人間が判断する、という使い分けをしています
- **専用サブエージェント（[`.claude/agents/`](.claude/agents/)）**: このリポジトリ専属の役割を持つAIエージェントを19体定義しています
  - デザイン批評×提案パイプライン: Apple / Google / Minimalist（Dieter Rams）の思想でデザインを批判する3体（`design-critic-*`）と、その指摘を統合する `design-critique-summarizer`、さらにApple・Google・MUJI・Airbnb・Stripe等10通りの視点から具体的な改修案を出す `designer-*` 群
  - レイアウトレビュー: スマホ幅・PC複数画面幅で実際にレンダリングして崩れを検出する `mobile-responsive-reviewer` / `pc-layout-reviewer`
  - リファクタリング3段階パイプライン: 見た目を一切変えずに軽量化する方針を提案する `portfolio-refactor-proposer` → 実装する `portfolio-refactor-coder` → 変更前後の見た目が完全一致するか検証する `portfolio-refactor-qa`
- **品質基準スキル（[`.claude/skills/uiux-standards/`](.claude/skills/uiux-standards/)）**: UI実装・変更のたびに、WCAG 2.2・Nielsenのユーザビリティ原則・Core Web Vitals等の世界標準に基づいたチェックリストを強制適用しています

## License

このリポジトリのソースコードは個人ポートフォリオサイト用です。画像・文章等のコンテンツは無断転載をご遠慮ください。
