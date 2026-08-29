# kentaro-sk.github.io

杉浦健太郎のパーソナルポートフォリオサイトです。
研究・仕事・趣味などの活動を、1つのページの中で「HOME / PROFILE / WORKS / STORY / GOAL / HOBBY / CONTACT」の
セクションとして紹介しています。

🔗 公開URL: https://kentaro-sk.github.io

## 技術構成

- ビルドツールなしの素の HTML / CSS(インラインstyle) / JavaScript（フレームワーク不使用）
- `js/support.js` が独自の軽量コンポーネントランタイム（Claude Design DC形式）で、
  `<x-import>` カスタム要素経由で各演出コンポーネントを読み込む
- ページ内の主な演出:
  - `js/particle-field.js` — HOMEの点群エフェクト
  - `js/journey-scene.js` — STORY導入の夜景演出
  - `js/dream-city.js` — HOME/GOAL下部の「夢の街」（朝昼晩で切り替わる都市の演出）
  - `js/flow-cycle.js` — GOALページの循環図
  - `js/image-slot.js` — HOBBY(旅行)ページの写真スロット演出
- `pages/*.html` は `<iframe>` で埋め込む単体ページ（D3.js / Three.js 等を個別に利用）

## ディレクトリ構成

```
.
├── index.html      # メインのSPA（全セクションを1ファイルに内包）
├── js/             # 全ページ共通で使うJS（演出コンポーネント・ランタイム）
├── pages/          # index.html から <iframe> で埋め込む単体HTML
│   ├── japan-glow.html    # GOALページの日本地図
│   ├── mobility-3d.html   # WORKSページの3Dシーン
│   ├── hobby-castles.html # HOBBYページの城めぐり地図
│   └── hobby-travel.html  # HOBBYページの旅行先地図
└── images/         # 写真素材（ページ別にサブフォルダ分け。詳細は下記）
```

## ローカルでの確認方法

ビルド不要の静的サイトなので、リポジトリ直下で簡易HTTPサーバーを立てるだけで確認できます。

```bash
python -m http.server 8000
# → http://localhost:8000 をブラウザで開く
```

`file://` で直接開いても基本的な演出は動作しますが、`pages/*.html` の `<iframe>` 埋め込みや
一部の外部ライブラリ読み込みは制限される場合があるため、ローカルサーバー経由を推奨します。

## 画像素材について

`images/` フォルダは容量が大きいため `.gitignore` で追跡除外しています。
このリポジトリを新しく `clone` した環境では `images/` が空の状態になるので、
別途バックアップから配置してください。
