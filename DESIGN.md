## Overview

このサイトは「和の情緒」と「エンジニアの精密さ」を同居させたパーソナルポートフォリオである。単一HTML内で画面切り替えを行うSPA的ルーター構造を持ち、各画面はクリーム紙(`{colors.canvas}`系)を基調としながら、ビジョンや夜景を語る場面でだけ濃紺(`{colors.canvas-dark}`系)へ切り替わる。書体は4種を役割別に厳密に使い分ける——明朝体(Shippori Mincho B1)が情緒的な見出し・語り、等幅体(IBM Plex Mono)がラベル・ナビ・数値、ゴシック体(Zen Kaku Gothic New)が本文可読性、筆記体(Parisienne)が署名的な一点豪華主義——という4層の書体ヒエラルキーが、このサイトで最も一貫した設計原則になっている。

配色は単一アクセントではなく、面によってアクセントを切り替える**2アクセント運用**を取る。クリーム面ではAction Blue (`#3B82C4`) が、濃紺面ではGold (`#D9B979`) が「クリックできる/特別である」を示す。青=日常の導線・行動喚起、金=ビジョン・実績・特別な瞬間、という意味分担になっており、これはこのサイトの意図的な設計であって崩すべき不統一ではない。

エレベーション(奥行き表現)は「常時ほぼフラット、hoverで初めてshadowが立ち上がる」という動的な設計を取る。カード・ボタン・SNSアイコンのいずれも、ホバー時に `translateY(-3px〜-8px)` と2層box-shadowが同時に発生し、「操作可能であることをインタラクションで証明する」手触りを作っている。

**Key Characteristics:**
- 4書体ヒエラルキー: 明朝(見出し・情緒) / 等幅(ラベル・数値) / ゴシック(本文) / 筆記体(署名的装飾、年に1〜2箇所)。
- 2アクセント運用: クリーム面=Action Blue、濃紺面=Gold。単一アクセントに統一しない。
- 動的エレベーション: 静止時フラット→hoverで`translateY`+2層shadowが立ち上がる。
- CTA・カードは角丸0基調(四角)。丸(50%)は「現在地・アイコン」、pillは「バッジ」に用途を限定。
- 4つのcanvas/SVGカスタム要素(particle-field / journey-scene / dream-city / flow-cycle)が、製品写真の代わりに「概念・ビジョン」を象徴的に演出する。
- セクション区切りは色面の切替だけでなく、余白(56–96px)とhairline border-bottomの併用で明示される。
- STORY年表はPC/モバイルで実装が完全に分岐する唯一のコンポーネント(PC: 縦stickyナビ、モバイル: sticky進捗バー)。

## Colors

> **対象範囲:** 全画面(HOME / PROFILE系 / WORKS系 / STORY系 / GOAL系 / HOBBY系 / CONTACT)。面(クリーム/濃紺)ごとにアクセントが異なる点に注意。

### Brand & Accent — クリーム面
- **Action Blue** (`{colors.primary}` — #3B82C4): クリーム面での唯一のクリック可能シグナル。ナビ現在地、テキストリンク、フォーカスボーダー、CTAのホバー背景。
- **Action Blue Deep** (`{colors.primary-deep}` — #2A6BA6): Action Blueの押下/ホバー濃色バリエーション。
- **Pale Blue Ring** (`{colors.primary-pale}` — #D9E8F7): フォーカスリング・選択状態の淡いハイライト。

### Brand & Accent — 濃紺面
- **Gold** (`{colors.accent-gold}` — #D9B979): 濃紺面での唯一のクリック可能/特別シグナル。Action Blueのダーク面対応物。実績・年号・ビジョンの強調に使用。
- **Gold Light** (`{colors.accent-gold-light}` — #E2C58C / #F5E2B4): グロー・テキストシャドウの発光色。
- **Gold Deep** (`{colors.accent-gold-deep}` — #C9A961 / #A8823A / #8A6D2A): ホバー・枠線用の濃色バリエーション。
- **Sky Blue on Dark** (`{colors.sky-on-dark}` — #8FC0EA): 濃紺面でごく限定的に使う涼しいアクセント(アイコン等)。

### Surface
- **Canvas Cream** (`{colors.canvas}` — #FFFDF5): 全ページの基調背景色。
- **Canvas Cream Deep** (`{colors.canvas-deep}` — #FBF5DE / #FAF3DC): クリーム面の中で一段沈めた区画(フォームパネル、情報ボックス)。
- **Canvas Cream Pale** (`{colors.canvas-pale}` — #F9F0CE / #FDFBF3 / #F7F2E6 / #FBF7EF): 微差のクリーム濃淡。セクションごとの呼吸を作る。
- **Canvas Dark** (`{colors.canvas-dark}` — #070B16 / #070C16): ビジョン・夜景・実績を語る主要な濃紺面。
- **Canvas Dark Deep** (`{colors.canvas-dark-deep}` — #0A1A2F): 野球観戦セクションのスコアボード背景。
- **Neutral Dark** (`{colors.neutral-dark}` — #151515 / #111111): カード背景の黒寄りバリエーション。

### Text
- **Ink** (`{colors.ink}` — #151515): クリーム面のほぼ全テキスト・アイコン色。
- **Cream Text on Dark** (`{colors.text-on-dark}` — #F6F2E7): 濃紺面の本文テキスト色。純白ではなく生成りにして紙質感を保つ。
- **Ink Muted** (`{colors.ink-muted}` — rgba(21,21,21,.42〜.72)): キャプション・年代・補助テキスト。alpha値で階調をつける。
- **Cream Text Muted** (`{colors.text-on-dark-muted}` — rgba(244,240,229,.6〜.86)): 濃紺面のリード文の階調。
- **Error** (`{colors.error}` — #B4442B): フォームのバリデーションエラー文言。

### Hairlines & Borders
- **Hairline Ink** (`{colors.hairline}` — rgba(21,21,21,.08〜.22)): カードの1pxボーダー、ヘッダー下線、入力欄ボーダー。alpha値は文脈で微調整する(固定1値に丸めない)。
- **Hairline Cream** (`{colors.hairline-on-dark}` — rgba(246,242,231,.18〜.25)): 濃紺面での区切り線。

### アクセント・グラデーション
- **スクロール進捗バー**: `linear-gradient(90deg, #3B82C4, #D9B979)` — 唯一の装飾グラデーション。青(クリーム面アクセント)から金(濃紺面アクセント)への移行そのものが、2アクセント運用を1本の線で表現する意味のあるグラデーション。
- **SNSシェアボタン**は各サービスの公式ブランドカラーをそのまま使用する(自社パレットではなく外部規定への準拠のため、トークン化しない)。

## Typography

### Font Family
- **明朝 (Shippori Mincho B1)**: weight 400/600。情緒的な見出しと、STORY/CONTACT等のリード文。「和」のトーンを担う。
- **等幅 (IBM Plex Mono)**: weight 400/500/600。ラベル・ナビ項目・年号・数値・セクションアイラベル。letter-spacingを`.1em〜.26em`と広く取り「ラベルらしさ」を演出。
- **ゴシック (Zen Kaku Gothic New)**: weight 400/500/700。body既定フォント。本文段落・フォーム入力など可読性最優先の箇所。
- **筆記体 (Parisienne)**: weight 400、自己ホストwoff2。装飾専用。年に1〜2箇所の署名的使用に留める。

### 使い分けの原則(最重要・崩さない)
- **見出し・情緒 → 明朝。ラベル・データ → 等幅。本文 → ゴシック。署名 → 筆記体。** 3層+1の役割分担がこのサイトの一貫性の核。
- 等幅ラベルは原則すべて大文字 + letter-spacing `.1em`以上。「システムのラベル」であることを一目で示す。
- 明朝は400(リード文・本文)と600(見出し)の2ウェイトのみ。
- 本文サイズはモバイルで16pxに統一(PC由来の17/18px指定は760px以下で16pxへ強制縮小)。

### Note on 書体調達
- 4書体すべてGoogle Fonts経由。Parisienneのみ自己ホストwoff2を併用し、外部フォントブロック時も署名的見出しが確実に表示されるようフォールバックを確保する。
- 和文/欧文混在のためline-height比率を用途ごとに個別調整する(明朝1.75〜2.05、ゴシック1.4〜1.9、等幅1.0〜1.7)。単一のline-heightスケールに揃えない——書体ごとに最適値を優先する。

## Layout

### Spacing System
- **コンテナ最大幅:** `{layout.container}` 1180px(900px以下でpadding 30px、760px以下でpadding 16px)。1680px以上ではコンテナを`{layout.container-wide}` 1320pxまで拡張。
- **セクション垂直余白:** 56〜96pxのレンジで画面ごとに個別調整。
- **STORY年表カード間隔:** `{layout.story-gap}` 164px。罫線を使わず余白だけで区切りを作る意図的な広さ。
- **カードpadding:** 18–28px(カード種によって個別設定)。

### Grid & Container
- STORY年表のみPC(≥761px)で `56px minmax(0,1fr)` の2カラムgrid(ナビ56px固定+カード列)。
- その他のグリッドは概ね2〜3カラムで、760px以下で1カラムへ縮退。

### Whitespace Philosophy
STORY年表の164pxマージンのように「罫線の代わりに余白で語る」姿勢を随所に持つ一方、情報密度は全体としてかなり高い(等幅ラベル・年代・キャプションが常に併走する)。製品カタログ的な余白最優先ではなく、"ジャーナル/年表"としての読み物密度を優先する。

## Elevation & Depth

| レベル | 処理 | 用途 |
|---|---|---|
| `{elevation.flat}` | shadowなし・1px hairline borderのみ | ほぼ全てのカード・ボタンの初期状態 |
| `{elevation.hover-soft}` | `0 2px 4px rgba(21,21,21,.05〜.08)` + `0 20〜26px 40〜48px -12〜30px rgba(21,21,21,.2〜.95)` | カードホバー(研究カード・STORY年表カード等) |
| `{elevation.hover-lift}` | hover-soft + `translateY(-3px〜-8px)` | CTAボタン・SNSアイコンのホバー |
| `{elevation.frosted}` | `backdrop-filter:blur(9px)` + 半透明クリーム | グローバルヘッダー |
| `{elevation.glow}` | box-shadowに発光色(`rgba(201,169,97,.28)`等)を含む | Gold系の強調要素(STORY年表の選択年、実績ハイライト) |

**エレベーション哲学。** shadowは「静止画に重みを与える」ためではなく「操作可能であることをインタラクションで証明する」ために使う。静止時はフラットにして情報の読みやすさを優先し、hoverで初めてshadowとリフトが発生する。ヘッダーの`{elevation.frosted}`だけは常時適用される例外(スクロール時も可読性を保つ機能的要請のため)。

## Shapes

### Border Radius Scale

| トークン | 値 | 用途 |
|---|---|---|
| `{rounded.none}` | 0px | CTAボタン全般、STORY年表カード、大半のカード。最頻出=このサイトの基調シルエット |
| `{rounded.sm}` | 10px | PROFILEのスキル/資格系の小カード |
| `{rounded.lg}` | 16px | HOMEのSELECTED WORKS 3枚カードなど、目玉コンテンツ限定 |
| `{rounded.full}` | 50% | ロゴアイコン、STORY年表の現在地マーク等「点・現在地」を示す要素 |
| `{rounded.pill}` | 999px | 一部のタグ・バッジ(「COMING SOON」等)限定 |

**Radiusの意味分担。** 角丸ゼロが「情報を扱う真面目な面」の基調で最頻出。10px/16pxは段階的に「カードの重要度・特別感」を示す2段のエスカレーションとして機能する(小カード=10px、目玉カード=16px)。丸(50%)は「現在地・アイコン」を示す記号、pillは「バッジ」に用途を絞り、Appleのような「pill=行動喚起」の文法は採用しない——CTAは角丸0の矩形で統一する。

### Illustration / Photography Geometry
- 製品写真の代わりに、canvas/SVGによる4種のカスタム要素がビジュアルの主役を担う(Componentsを参照)。
- 実写真(プロフィール写真・STORY年表の思い出写真・旅行/城/野球の写真)は用途ごとに`aspect-ratio`を固定(4:3, 3:4, 16:9, 1:1等)し、レスポンシブ時もトリミング範囲を一定に保つ。

## Components

### ヘッダー / グローバルナビ

**`header-frosted`** — sticky、高さ66px。背景 `rgba(255,253,245,.93)` + `backdrop-filter:blur(9px)`、下線hairline。左: 34px円形写真ロゴ + 等幅大文字ワードマーク。右(PC): 6項目ナビ(一部ホバードロップダウン)、現在地は下線チップで表示。モバイル(≤760px): ハンバーガー→スクリム付きドロップダウンパネル。

**`scroll-progress-bar`** — ヘッダー直下2px、`linear-gradient(90deg,#3B82C4,#D9B979)`。スクロール位置=読了度を示す。

### ボタン

**`cta-primary`** — 主要CTA(「GET IN TOUCH →」等)。`{rounded.none}`、背景`{colors.neutral-dark}`→hover`{colors.primary}`+`translateY(-3px)`+shadow出現、等幅・letter-spacing `.14em`、padding 22px 44px。フルブロック矩形。

**`text-link-cta`** — 「VIEW FULL "PROFILE" →」等。下線ボーダー+ホバーでletter-spacing展開するテキストリンク型。角丸ボタンではない。

**`social-icon-contact`** — CONTACT本文の46×46px円形SNSアイコン。ブランド公式色背景+カラーシャドウ、hoverで`translateY(-3px)`+`brightness(1.08)`。

**`social-icon-footer`** — フッターの34×34px円形SNSアイコン。透明背景+ニュートラルborder、hoverでAction Blueへ色変化。CONTACT本文とは意図的に別グラマー(実線塗り vs アウトライン)。

### カード

**`card-showcase`** — `{rounded.lg}`(16px)、常時薄い2層shadow。HOMEのSELECTED WORKS 3枚限定の「特別な」カードグラマー。

**`card-flat-bordered`** — `{rounded.none}`、白背景、1pxハーフトーンborderのみ、静止時shadowなし。研究カード・導線カード等の最頻出パターン。hoverで`translateY(-8px)`+shadow出現。

**`card-soft-rounded`** — `{rounded.sm}`(10px)、常時ソフトshadow。スキル/資格系の小カード。

**`card-accent-top`** — 白背景、1pxborder+上端だけ3px accentボーダー(`{colors.primary}`)。実績バッジに使用。

**`panel-cream-inset`** — `{colors.canvas-deep}`のパディング小箱。地の色から一段沈めた情報ボックス。

**`story-timeline-card`** — STORY年表本体。`{rounded.none}`、margin-bottom 164pxの広い余白のみで区切り(罫線なし)。

### STORY年表(唯一の完全分岐コンポーネント)

**`story-nav-desktop`** — PC(≥761px)限定。2カラムgrid(`56px minmax(0,1fr)`)、ナビ列は`position:sticky;height:100vh`で常時垂直中央固定。現在地はリング型マークがtransitionで該当年へスライド。

**`story-nav-mobile`** — モバイル限定。ヘッダー直下にsticky表示する進捗バー。年・カードタイトル・カウンタ・細いfillバーをテキストで示す。PC版のリングマークは非表示——現在地表示の実装がPC/モバイルで完全に別物という、このサイトで唯一の構造分岐コンポーネント。変更時は両実装を必ずセットで確認する。

### 演出コンポーネント(canvas/SVGカスタム要素)

**`particle-field`** — HOME最上部で複数図形(恐竜/地球/姫路城/車/AI/日本地図等)をモーフィングする点群canvas。製品写真の代替として「多面的な興味・専門性」を象徴する。

**`journey-scene`** — HOME中盤の濃紺バンドに配置される夜景風canvas演出。「これまでの歩み」導入部の背景。

**`dream-city`** — 朝/昼/夕方/夜/真夜中/夜明けの都市写真をスクロールに応じてクロスフェードする`position:sticky;height:100vh`の演出。「一日/長期的な変化」のメタファーとして使用。

**`flow-cycle`** — 放射状に項目を円環配置しドットが周回するSVGアニメーション。循環的なビジョン(教育→人材→産業→収益→まちづくり等)の図示に使用。

いずれも独自ローダー経由で読み込むカスタム要素で、「未来/ビジョン」を語る濃紺セクションに集中配置する。新規追加時もこの位置づけ(実写真ヒーローの代わりに概念を象徴するcanvas/SVG)を踏襲する。

### フォーム

**`contact-form`** — `{colors.canvas-deep}`パネル内に設置。入力欄は背景`{colors.canvas}`、border `1px solid rgba(21,21,21,.2)`、`{rounded.none}`、padding 11px 12px、フォーカス時はborder-colorのみ`{colors.primary}`へ変化(shadowなし)。氏名/用件欄はゴシック16px、メール欄のみ等幅12.5px(半角入力であることを書体で示唆)。送信後はチェックアイコン+完了メッセージへ差し替え。エラー時は`{colors.error}`の注意文。

### フッター

**`footer`** — 筆記体の署名ロゴ+ `social-icon-footer` + 補助リンク。

## Do's and Don'ts

### Do
- クリーム面のクリック可能要素は`{colors.primary}`(Action Blue)、濃紺面は`{colors.accent-gold}`(Gold)——面によってアクセントを使い分ける。
- 見出し・情緒的リード文は明朝、ラベル・数値・ナビは等幅、本文はゴシック。この3層の役割を混同しない。
- カード・ボタンは静止時フラット、hoverで`translateY`+2層box-shadowを立ち上げて操作可能性を示す。
- CTAとカードは`{rounded.none}`を基調とし、丸(`{rounded.full}`)は「現在地・アイコン」、pillは「バッジ」に用途を絞る。
- Parisienne(筆記体)は年に1〜2箇所の署名的な使用に留め、多用しない。
- STORY年表以外の画面はPC/モバイルで構造そのものを変えず、レイアウトのみブレークポイントで調整する。
- 新しい演出コンポーネントを追加する場合も「概念を象徴するcanvas/SVG」という位置づけに留め、実写真ヒーローに頼らない。

### Don't
- 単一アクセントカラーに統一しない——2アクセント運用(青/金)は意図的な設計であり、1色ルールを持ち込むと面の意味分担が壊れる。
- カードの`border-radius`を機械的に1種類へ統一しない——`{rounded.none}`/`{rounded.sm}`/`{rounded.lg}`の3段階は用途(通常/小カード/特別カード)に対応した意味のある差である。
- 静止時のカード・ボタンにshadowを足さない——「hoverで初めて浮き上がる」動きがこのサイトの手触りの核。
- 本文を明朝・等幅で長文表示しない——ゴシック以外は可読性が落ちる。
- 濃紺セクションを増やしすぎない——「ビジョン・実績・特別な瞬間」を語る場に限定されているからこそ効果を持つ。
- pillやCTAの丸角化など、Apple的な「単一グラマーに寄せる」判断を安易に持ち込まない——このサイトのCTAグラマーは角丸0の矩形である。

## Responsive Behavior

### Breakpoints

| 名称 | 幅 | 主な変化 |
|---|---|---|
| 極狭端末 | ≤345px | リード段落15pxへ縮小(語中改行対策) |
| 狭端末 | ≤400px | リード段落のletter-spacingを0に |
| スマホ/狭幅 | ≤760px | 1カラム化・ナビをハンバーガーへ・本文16px統一・各種セクション専用パッチ |
| タブレット | ≤900px | コンテナpaddingを30pxへ緩和 |
| デスクトップ | ≥761px | モバイルメニュー非表示、STORY年表がPC専用2カラムgridへ |
| 大画面 | ≥1680px | コンテナ最大幅を1320pxへ拡張 |

### Touch Targets
- SNSアイコン: CONTACT本文46×46px、フッター34×34px。
- CTAボタン: padding 22px×44pxで十分な高さを確保。
- ハンバーガーメニューは独立ボタンとしてタップ領域を確保。

### Collapsing Strategy
- **ヘッダー:** デスクトップ6項目インラインナビ→760px以下でハンバーガー+ドロップダウンパネル。
- **STORY年表:** PC=左サイドsticky縦ナビ+カード列の2カラムgrid→モバイル=ナビ非表示、ヘッダー直下sticky進捗バーに置換。
- **グリッド全般:** 2〜3カラム→760px以下で1カラムへ強制(例外: 野球スコアボードは横並び構造を維持したまま列幅・文字サイズのみ縮小)。
- **dream-city:** PC=390vh scrollでsticky100vh窓を地上⇄地下にパン→モバイル=スクロール連動パンを廃し、朝昼晩自動切替のみの通常ブロックに簡略化。

### Image Behavior
- 用途別に`aspect-ratio`を固定(4:3, 3:4, 16:9, 1:1, 個別実寸比)し、画面幅が変わってもトリミング範囲(見える窓)を一定に保つ。
- 一部写真は横長原寸に合わせて`object-fit:contain`を個別適用し、被写体の見切れを防ぐ。

## Iteration Guide

1. まず「クリーム面か濃紺面か」を決め、対応するアクセント(青 or 金)を選ぶ。
2. 見出し=明朝、ラベル=等幅、本文=ゴシックの3層を崩さない。筆記体は追加しない。
3. 新規カードは既存3パターン(`card-flat-bordered` / `card-soft-rounded` / `card-showcase`)のいずれかに寄せ、border-radiusを勝手に増やさない。
4. shadowは静止時ゼロ、hoverで2層shadow+わずかな`translateY`——この「動的エレベーション」の型を踏襲する。
5. 新しい演出コンポーネントを追加する場合も、`particle-field`/`journey-scene`/`dream-city`/`flow-cycle`と同様に「概念を象徴するcanvas/SVG」という位置づけに留める。
6. STORY年表のPC/モバイル分岐構造は複雑なため、変更時は両方の実装(PC縦ナビ系/モバイル進捗バー系)を必ずセットで確認する。
7. `{token.refs}`を使い、可能な限りhex直書きを避ける——ただしalpha値は文脈依存で個別調整されているため、無理に1値へ丸めない。

## Known Gaps

- カードの`border-radius`(0/10/16px)とbox-shadowの数値バリエーション(4〜5パターン)は意図的な使い分けの側面もあるが、正式なトークン表としては本ドキュメントで初めて整理した段階。今後さらに増やす場合は3段階(`{rounded.none}`/`{rounded.sm}`/`{rounded.lg}`)の枠内に収めることを推奨する。
- ダークモード(OS設定連動の自動切替)は実装されていない。濃紺セクションは常設のダーク演出であり、ライト/ダークの自動切替とは別物。
- フォームのバリデーション仕様(必須項目・文字数制限等の詳細)はJS実装側にあり、本ドキュメントには構造のみ記載した。
- 4つの演出コンポーネント(`particle-field`/`journey-scene`/`dream-city`/`flow-cycle`)の内部パラメータ・カスタマイズ可能範囲は本ドキュメントの対象外。変更時は各`js/*.js`を直接参照すること。
