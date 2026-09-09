# kentaro-sk.github.io

杉浦健太郎のパーソナルポートフォリオサイトです。

これまでの研究・仕事・趣味などの歩みを、1つのページの中で紹介しています。

🔗 https://kentaro-sk.github.io

## Built with

**[Astro](https://astro.build)** を採用しています（`astro-migration` ブランチで移行中。詳細は下記）。

### なぜAstroか

もともとは素の HTML / CSS / JavaScript（独自テンプレートランタイム「dc-runtime」による
ハッシュルーティングSPA）で作っていましたが、以下の理由からAstroへ移行しました。

- **静的コンテンツが中心のサイト**であり、ページ単位で必要な分だけJSを読み込める
  Astroの「アイランドアーキテクチャ」と相性が良い（例: 点群アニメーション等の
  Web ComponentsはHOMEページなど使うページだけがJSを読み込み、他ページには一切含まれない）。
- **実URLでのルーティング**に切り替えられる（`#profile` のようなハッシュベースではなく
  `/profile/` のような実パスになり、SEO・共有リンク・ブラウザ履歴の面で有利）。
- **GitHub Pages + GitHub Actions**との親和性が高く、`npm run build` の静的出力を
  そのままデプロイできる。
- 旧来のdc-runtimeは独自ビルド生成物（`js/support.js`）のソースコードがリポジトリに
  存在せず、ブラックボックス化していた問題があった。Astroへの移行によりこの問題を解消している。

### 移行の状態

- `main` ブランチ: 移行前の実装（dc-runtime版）が本番稼働中。
- `astro-migration` ブランチ: Astro移行作業用。全ページの移行が完了し次第 `main` へマージし、
  GitHub PagesのデプロイもGitHub Actions経由に切り替える。
