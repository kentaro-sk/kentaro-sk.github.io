## Overview

このサイトは「和の情緒」と「エンジニアの精密さ」を同居させたパーソナルポートフォリオである。単一HTML内で画面切り替えを行うSPA的ルーター構造を持ち、各画面はクリーム紙(`{colors.canvas}`系)を基調としながら、ビジョンや夜景を語る場面でだけ濃紺(`{colors.canvas-dark}`系)へ切り替わる。書体は4種を役割別に厳密に使い分ける——明朝体(Shippori Mincho B1)が情緒的な見出し・語り、等幅体(IBM Plex Mono)がラベル・ナビ・数値、ゴシック体(Zen Kaku Gothic New)が本文可読性、筆記体(Parisienne)が署名的な一点豪華主義——という4層の書体ヒエラルキーが、このサイトで最も一貫した設計原則になっている。

**2026-09-19の方針転換。** サイト全体の方向を「Apple風のおしゃれでシンプルなデザイン」へ移す。カード・影・装飾を減らし、細い区切り線・大きな余白・控えめな配色で構成する。書体も、**HOMEを除く全ページ**で見出しを明朝から Avenir Next系ゴシック(共通クラス `.u-display`)へ切り替えた。**HOMEだけは従来どおり明朝を維持する**(例外として、STORY「ここまでの道のり。」・GOAL「地域創生」の2つの大見出しも明朝のまま残す)。転換の進捗は、PROFILE・ACHIEVEMENTS・WORKS(一覧ページ)・GOAL(トップ・VISION・ROADMAP)・CONTACT・HOME末尾のCTAがレイアウトまで刷新済み、WORKSの詳細ページ(MOBILITY / AI×仕事 / AI×教育)・STORY・HOBBY は書体のみ転換済みでレイアウトは旧方針のまま(順次刷新の対象)。従来の禁止事項「Apple的な単一グラマーに寄せる判断を持ち込まない」は**全面的に撤回**し、むしろ「カード・ボタン・アイコンの文法を少数に統一する」ことを推奨する。以降の記述のうち旧方針に由来する箇所は、この転換に合わせて更新してある。

配色は**Action Blue (`#3B82C4`) 1色を基本のアクセント**とし、Gold (`#D9B979`) は濃紺面でビジョン・実績・特別な瞬間を示す**特別色**として限定的に使う(2026-09-19、Apple風の方針に合わせ、従来の「2アクセント運用を崩さない」を「アクセントは青が基本、金は特別な場面のみ」へ改めた)。クリーム面のクリック可能要素は青、濃紺面のクリック可能要素は金という現行の使い分けはそのまま維持し、金をクリーム面へ広げない。

エレベーション(奥行き表現)は「常時ほぼフラット、hoverで初めてshadowが立ち上がる」という動的な設計を取る。カード・ボタン・SNSアイコンのいずれも、ホバー時に `translateY(-3px〜-8px)` と2層box-shadowが同時に発生し、「操作可能であることをインタラクションで証明する」手触りを作っている。

**Key Characteristics:**
- 書体ヒエラルキー: 見出し=Avenir Next系ゴシック `.u-display`(HOMEのみ明朝) / 等幅(ラベル・数値) / ゴシック(本文) / 筆記体(署名的装飾、年に1〜2箇所)。
- アクセントは青(Action Blue)が基本。金(Gold)は濃紺面の特別な場面だけに使う特別色。クリーム面へ金を広げない。
- 動的エレベーション: 静止時フラット→hoverで`translateY`+2層shadowが立ち上がる。 立体感は、面の段差(L1)・半透明(L2)・hoverの浮き上がり(L3)で表現し、静止時の影では作らない(詳細は「Elevation & Depth」の「立体感(Depth)の方針」)。
- CTAはpill(999px)、カードは角丸0の矩形で、それぞれ少数の文法に統一する(2026-09-19にCTAをpillへ一括変更)。丸(50%)は「現在地・アイコン・円形トリミング」、pillはCTAと「バッジ」に使う。
- 4つのcanvas/SVGカスタム要素(particle-field / journey-scene / dream-city / flow-cycle)が、製品写真の代わりに「概念・ビジョン」を象徴的に演出する。
- セクション区切りは色面の切替だけでなく、余白(56–96px)とhairline borderの併用で明示される。転換済みページは、カードの箱ではなく区切り線ベースの行リスト(`row-list`)で構成する。
- STORY年表はPC/モバイルで実装が完全に分岐する唯一のコンポーネント(PC: 縦stickyナビ、モバイル: sticky進捗バー)。

## Colors

> **対象範囲:** 全画面(HOME / PROFILE系 / WORKS系 / STORY系 / GOAL系 / HOBBY系 / CONTACT)。面(クリーム/濃紺)ごとにアクセントが異なる点に注意。

### Brand & Accent — クリーム面
- **Action Blue** (`{colors.primary}` — #3B82C4): クリーム面での唯一のクリック可能シグナル。ナビ現在地、テキストリンク、フォーカスボーダー、CTAのホバー背景。
- **Action Blue Deep** (`{colors.primary-deep}` — #2A6BA6): Action Blueの押下/ホバー濃色バリエーション。**15px以下の小さいテキストリンクにはこちらを使う**(Action Blueは#FFFDF5上で約3.6:1となりAA未達のため)。
- **Pale Blue Ring** (`{colors.primary-pale}` — #D9E8F7): フォーカスリング・選択状態の淡いハイライト。PROFILE「強みと弱み」の**強みパネルの背景**にも使う(意味の色分けには新色を作らず既存トークンを使う)。

### Brand & Accent — 濃紺面
- **Gold** (`{colors.accent-gold}` — #D9B979): 濃紺面での唯一のクリック可能/特別シグナル。Action Blueのダーク面対応物。実績・年号・ビジョンの強調に使用。
- **Gold Light** (`{colors.accent-gold-light}` — #E2C58C / #F5E2B4): グロー・テキストシャドウの発光色。
- **Gold Deep** (`{colors.accent-gold-deep}` — #C9A961 / #A8823A / #8A6D2A): ホバー・枠線用の濃色バリエーション。
- **Sky Blue on Dark** (`{colors.sky-on-dark}` — #8FC0EA): 濃紺面でごく限定的に使う涼しいアクセント(アイコン等の非インタラクティブな装飾のみ)。**CTA・テキストリンクなどクリック可能な要素には使わない**——濃紺/黒背景面のクリック可能シグナルは常にGold(`{colors.accent-gold}`)に一元化する。

### Surface
- **Canvas Cream** (`{colors.canvas}` — #FFFDF5): 全ページの基調背景色。
- **Canvas Cream Deep** (`{colors.canvas-deep}` — #FBF5DE / #FAF3DC): クリーム面の中で一段沈めた区画(情報ボックス、PROFILEのサイドバーと「弱み」パネル)。
- **Canvas Cream Pale** (`{colors.canvas-pale}` — #F9F0CE / #FDFBF3 / #F7F2E6 / #FBF7EF): 微差のクリーム濃淡。セクションごとの呼吸を作る。
- **Canvas Dark** (`{colors.canvas-dark}` — #070B16 / #070C16): ビジョン・夜景・実績を語る主要な濃紺面。
- **Canvas Dark Deep** (`{colors.canvas-dark-deep}` — #0A1A2F): 野球観戦セクションのスコアボード背景。
- **Neutral Dark** (`{colors.neutral-dark}` — #151515 / #111111): カード背景の黒寄りバリエーション。

### Text
- **Ink** (`{colors.ink}` — #151515): クリーム面のほぼ全テキスト・アイコン色。
- **Cream Text on Dark** (`{colors.text-on-dark}` — #F6F2E7): 濃紺面の本文テキスト色。純白ではなく生成りにして紙質感を保つ。
- **Ink Muted** (`{colors.ink-muted}` — rgba(21,21,21,.42〜.72)): キャプション・年代・補助テキスト。alpha値で階調をつける。**12px以下の小さいラベル・キャプションに使う場合はWCAG AA(4.5:1)を満たすためalpha .6以上を使うこと**(.42〜.5は実測で2.7〜3.5:1程度となりAA未達。18px以上の大きな文字、または装飾目的の非本質的なテキストに限り使用可)。
- **Cream Text Muted** (`{colors.text-on-dark-muted}` — rgba(244,240,229,.6〜.86)): 濃紺面のリード文の階調。
- **Error** (`{colors.error}` — #B4442B): フォームのバリデーションエラー文言。

### Hairlines & Borders
- **Hairline Ink** (`{colors.hairline}` — rgba(21,21,21,.08〜.22)): カードの1pxボーダー、ヘッダー下線、入力欄ボーダー。alpha値は文脈で微調整する(固定1値に丸めない)。
- **Hairline Cream** (`{colors.hairline-on-dark}` — rgba(246,242,231,.18〜.25)): 濃紺面での区切り線。

### アクセント・グラデーション
- **スクロール進捗バー**: `linear-gradient(90deg, #3B82C4, #D9B979)` — 唯一の装飾グラデーション。青(クリーム面アクセント)から金(濃紺面アクセント)への移行そのものが、基本アクセントの青から特別色の金への移行を1本の線で表す意味のあるグラデーション。
- **SNSシェアボタン**は各サービスの公式ブランドカラーをそのまま使用する(自社パレットではなく外部規定への準拠のため、トークン化しない)。

## Typography

### Font Family
- **明朝 (Shippori Mincho B1)**: weight 400/600。**HOME限定**の見出し・リード文(「和」のトーンを担う)。HOME以外のページでは使わない(2026-09-19〜)。例外は STORY「ここまでの道のり。」・GOAL「地域創生」の2つの大見出し。
- **見出しフォント (`.u-display`、`css/site.css`)**: `'Avenir Next','Avenir','Nunito Sans','Zen Kaku Gothic Antique','Zen Kaku Gothic New',sans-serif`、weight 500のみ。Avenir Nextを持つApple端末では欧文がAvenir Next、それ以外はNunito Sans。Avenir Nextは漢字を持たずライセンス上Webフォント配信もできないため、**日本語はどの端末でもZen Kaku Gothic Antiqueで描画される**。HOME以外の全ページの見出し・引用文・大きな日本語の題に使う。
- **英語名の例外**: PROFILEヒーローの「KENTARO SUGIURA」は、名前の一部として見出しと同じ系統のAvenir Next系サンセリフ(13px・大文字・letter-spacing `.24em`・weight 500)で表示する。「ラベルは等幅の大文字」の例外(2026-09-19、ユーザー指定)。
- **等幅 (IBM Plex Mono)**: weight 400/500/600。ラベル・ナビ項目・年号・数値・セクションアイラベル。letter-spacingを`.1em〜.26em`と広く取り「ラベルらしさ」を演出。
- **ゴシック (Zen Kaku Gothic New)**: weight 400/500/700。body既定フォント。本文段落・フォーム入力など可読性最優先の箇所。
- **筆記体 (Parisienne)**: weight 400、自己ホストwoff2。装飾専用。年に1〜2箇所の署名的使用に留める。

### 使い分けの原則(最重要・崩さない)
- **見出し・情緒 → `.u-display`(HOMEのみ明朝)。ラベル・データ → 等幅。本文 → ゴシック。署名 → 筆記体。** 3層+1の役割分担がこのサイトの一貫性の核。
- 等幅ラベルは原則すべて大文字 + letter-spacing `.1em`以上。「システムのラベル」であることを一目で示す。
- 明朝(HOMEと、例外の2大見出し)は400(リード文・本文)と600(見出し)の2ウェイトのみ。`.u-display`は500のみ(Zen Kaku Gothic Antiqueを500だけ読み込んでいるため、太字指定すると擬似太字になる。`font-weight`は書かず、クラスに任せる)。
- 本文サイズはモバイルで16pxに統一(PC由来の17/18px指定は760px以下で16pxへ強制縮小)。

### ゴシック体のサイズスケール
ゴシック体は本文以外にも見出し・カードタイトル・サブ情報・ラベル値など役割が広く、
11/12/13/14/15/16/17/18pxのような近接値が実装ごとに無秩序に生まれやすい。以下の
6段階を公式スケールとし、新規実装・改修時はこの値から選ぶ(2026-09-18、PROFILE
ダッシュボードのフォント階層レビューを機に策定)。

| 用途 | サイズ | 目安 |
|------|--------|------|
| ラベル値・列挙情報(資格リスト等) | 12px | 最小サイズ。等幅ラベルと並走する値、または同格の列挙項目 |
| 補助見出し(カード内の小見出し) | 13px | 本文と1px差では階層が生まれないため、本文比+1px以上を確保 |
| サブ情報・キャプション | 14px | タイトルに付随する副次テキスト、pill/タグ状のリンク |
| 本文標準 | 15px | 段落本文(大型カード内では16pxも許容、後述) |
| カードタイトル | 18px | カード内の主見出し(職歴・学歴名など)。760px以下では上記「本文16px統一」ルールにより16pxへ自動縮小される |
| ブロック内の大見出し | 20px | 情報ブロック内の見出し。ページ内のセクション見出し(h2)は下記「見出し階層」を使う |

既存の「本文サイズはモバイルで16pxに統一」ルールとは独立しており、大型コンテンツ
カード(黒背景の職歴カード等)の本文はこれまで通り16px運用のままでよい——この
スケールは主に「見出し・タイトル・サブ情報が本文と同サイズに潰れる」ことを防ぐための
下限/上限の目安であり、全箇所を機械的に置き換える強制ルールではない。

### 見出し階層(`.u-display`)
上記6段階のゴシック本文スケールとは別に、見出し用の階層を持つ(2026-09-19、PROFILE刷新で導入)。

| 用途 | サイズ | 備考 |
|------|--------|------|
| ページタイトル(h1) | 40〜64px(`clamp`) | PROFILEの名前は`u-fs-56`、CONTACTは`clamp(40px,6vw,64px)` |
| セクション見出し(h2) | 24〜30px(`clamp`) | 「経歴」「強みと弱み」「問い合わせ内容」等 |
| 項目名(カード・パネルの題) | 22px | 「行動力」「目的思考」等。`u-fs-22`と併用 |

letter-spacingは`.04〜.1em`と広めに取る。760px以下では既存の`u-fs-*`の縮小ルールがそのまま効く。

### Note on 書体調達
- Google Fonts経由。Parisienneのみ自己ホストwoff2を併用し、外部フォントブロック時も署名的見出しが確実に表示されるようフォールバックを確保する。Nunito SansとZen Kaku Gothic Antiqueは見出し用として2026-09-19に追加した(計6書体。読み込み量が増えるため、今後さらに増やさない)。
- 和文/欧文混在のためline-height比率を用途ごとに個別調整する(明朝1.75〜2.05、ゴシック1.4〜1.9、等幅1.0〜1.7)。単一のline-heightスケールに揃えない——書体ごとに最適値を優先する。STORY/TURNING POINTの長文ナラティブ本文(自分の言葉で経緯を語る段落)に限り、"ジャーナル/年表としての読み物密度"を優先してゴシック1.9〜2.1まで許容する(2026-09-18、STORYページのマルチエージェント設計レビューで実態を追認)。

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
STORY年表の164pxマージンのように「罫線の代わりに余白で語る」姿勢を持つ。2026-09-19以降は「Apple風のシンプルさ」を優先し、情報密度よりも余白と細い区切り線での構成を基本とする(従来の「読み物密度を優先」する方針は、STORY/TURNING POINTの長文ナラティブに限って残す)。転換済みページのセクション垂直余白は**56〜96pxの範囲に収める**。

## Elevation & Depth

| レベル | 処理 | 用途 |
|---|---|---|
| `{elevation.flat}` | shadowなし・1px hairline borderのみ | ほぼ全てのカード・ボタンの初期状態 |
| `{elevation.hover-soft}` | `0 2px 4px rgba(21,21,21,.05〜.08)` + `0 20〜26px 40〜48px -12〜30px rgba(21,21,21,.2〜.95)` | カードホバー(研究カード・STORY年表カード等) |
| `{elevation.hover-lift}` | hover-soft + `translateY(-3px〜-8px)` | CTAボタン・SNSアイコンのホバー |
| `{elevation.frosted}` | `backdrop-filter:blur(9px)` + 半透明クリーム | グローバルヘッダー |
| `{elevation.glow}` | box-shadowに発光色(`rgba(201,169,97,.28)`等)を含む | Gold系の強調要素(STORY年表の選択年、実績ハイライト) |

**エレベーション哲学。** shadowは「静止画に重みを与える」ためではなく「操作可能であることをインタラクションで証明する」ために使う。静止時はフラットにして情報の読みやすさを優先し、hoverで初めてshadowとリフトが発生する。ヘッダーの`{elevation.frosted}`だけは常時適用される例外(スクロール時も可読性を保つ機能的要請のため)。**新しいカードを追加するときは`card-flat-bordered`(静止時flat)をデフォルトとし、`card-soft-rounded`の常時shadowは既存の小型バッジ状カードのみの例外として扱う(新規の大型コンテンツカードに常時shadowを持ち込まない)。**（2026-09-18: PROFILEダッシュボード改修時のデザインレビューで、この原則と`card-soft-rounded`の定義が実装上あいまいになっていたことが判明し、明文化した。）

区切り線ベースの行リスト(`row-list`)はカードではないため、hoverは`translateY(-2px)`のみでshadowは出さない。リンクでない面(強みと弱みのパネル等)はhover演出を持たない。

### 立体感(Depth)の方針

2026-09-19、「サイト全体に立体感を持たせたい」という要望を受けて追加。Appleの3つの柱(Clarity / Deference / Depth)のうちDepthに当たる。**奥行きは階層を伝えるための手段であり、装飾ではない。** そのため、静止時にshadowを足すのではなく、次の4つの手段で表現する。

| レベル | 手段 | 使いどころ |
|---|---|---|
| L0 フラット | shadowなし・1px hairlineのみ(既定) | 通常の面すべて |
| L1 面の段差 | 地(`{colors.canvas}`)→ 一段沈めた面(`{colors.canvas-deep}` / `{colors.primary-pale}`)→ 白、という色の重なりで奥行きを出す。shadowは使わない | パネル・サイドバー・意味の色分け(`panel-tinted`)・情報ボックス |
| L2 半透明 | `backdrop-filter: blur(9〜20px)` と、alpha .9前後の半透明クリーム | ヘッダー(既存)、メニュー等の「上に重なる面」だけ |
| L3 hoverの浮き上がり | `translateY(-2〜-3px)` と、blurを大きく取った低濃度の2層shadow(例: `0 2px 4px rgba(21,21,21,.05)` + `0 24px 44px -24px rgba(21,21,21,.35)`) | リンクになっている要素だけ(`{elevation.hover-soft}` / `{elevation.hover-lift}`と同じ) |

- **モーション**: スクロール連動のゆるいフェード・パララックス(既存のreveal、`dream-city`)で奥行きを補う。速度差は小さく保ち、`prefers-reduced-motion` では無効にする。
- **画像・イラスト**: 画像自体には静止時のshadowを付けず、角丸0のままにする。奥行きは周囲の余白と面の段差で作る。
- **適用例(WORKSの活動カード)**: 一段沈めた面(`{colors.canvas-deep}`の全幅の帯)の上に、白いカード(枠線・静止時shadowなし・角丸0)を重ねてL1の奥行きを出し、hoverで`translateY(-3px)`+2層shadow(L3)が立ち上がる。

**やらないこと(Appleの基調に反するため)**
- 静止時の常時ドロップシャドウ、ベベル・内側の影・光沢グラデーション
- 色付きのグロー(濃紺面の金の発光は、既存の特別演出としてのみ許可し、新規には増やさない)。HOME自己紹介の丸写真の縁取りは2026-09-19に、金のグロー・二重リング・内側の発光影を撤去し、1pxのcreamヘアライン(alpha .3)だけにした
- 3Dチルト、強いパララックスなど、動きで見せる演出の乱用
- 太い枠線+ずらした影の組み合わせ(ネオブルータリズム調)
- shadowの種類を増やすこと(上の3段の範囲に収める)


## Shapes

### Border Radius Scale

| トークン | 値 | 用途 |
|---|---|---|
| `{rounded.none}` | 0px | STORY年表カード、大半のカード。最頻出=このサイトの基調シルエット |
| `{rounded.sm}` | 10px | バッジ状の小型カード限定。経歴カード等、情報量の多い大型コンテンツカードには適用しない(`{rounded.none}`のcard-flat-borderedを使う) |
| `{rounded.lg}` | 16px | HOMEのSELECTED WORKS 3枚カードなど、目玉コンテンツ限定 |
| `{rounded.full}` | 50% | ロゴアイコン、STORY年表の現在地マーク等「点・現在地」を示す要素。人物識別を目的とする円形トリミング(PROFILEの顔写真)、および象徴的なイラストの円形トリミング(PROFILE「行動力」の3枚)もこのトークンの対象に含む |
| `{rounded.pill}` | 999px | CTAボタン全般(2026-09-19に一括変更)、および一部のタグ・バッジ(「COMING SOON」等) |

**Radiusの意味分担。** 角丸ゼロが基調で最頻出(現状の統一された文法)。10px/16pxは段階的な強調として残っているが、Apple風の方針では**カード・ボタン・アイコンの文法をできるだけ少数に統一する**ことを優先し、新しい値は増やさない。丸(50%)は「現在地・アイコン・円形トリミング」を示す記号、pillは「CTAとバッジ」に使う。CTAは全ページでpill(999px)に統一した(2026-09-19、Appleの「pill=行動喚起」の文法を採用。実装は主要CTA 4箇所: HOMEのGET IN TOUCH・CONTACTのSEND・GOALページの2つの導線ボタン)。CTAの形を変えるときは全ページ同時に切り替えて、1つの文法に揃える。

### Illustration / Photography Geometry
- 製品写真の代わりに、canvas/SVGによる4種のカスタム要素がビジュアルの主役を担う(Componentsを参照)。
- 実写真(プロフィール写真・STORY年表の思い出写真・旅行/城/野球の写真)は用途ごとに`aspect-ratio`を固定(4:3, 3:4, 16:9, 1:1等)し、レスポンシブ時もトリミング範囲を一定に保つ。

## Components

### ヘッダー / グローバルナビ

**`header-frosted`** — sticky、高さ66px。背景 `rgba(255,253,245,.93)` + `backdrop-filter:blur(9px)`、下線hairline。左: 34px円形写真ロゴ + 等幅大文字ワードマーク。右(PC): 6項目ナビ(一部ホバードロップダウン)、現在地は下線チップで表示。ドロップダウン(WORKS・HOBBY)は、日本語ラベルだけの1行項目(15px・weight 500)。矢印・番号・英語表記・静止時の影は持たず、クリーム地+hairline枠、hoverは淡いクリーム(`#FBF5DE`)の面替えだけ(2026-09-19)。モバイル(≤760px): ハンバーガー→スクリム付きドロップダウンパネル。

**`scroll-progress-bar`** — ヘッダー直下2px、`linear-gradient(90deg,#3B82C4,#D9B979)`。スクロール位置=読了度を示す。

### ボタン

**`cta-primary`** — 主要CTA(「GET IN TOUCH」等)。`{rounded.pill}`、背景`{colors.neutral-dark}`→hover`{colors.primary}`+`translateY(-2px)`+shadow出現、Zen Kaku Gothic New 500・15px・letter-spacing `.1em`、padding 16px 40px。フォームの送信ボタンは幅100%のpill。矢印「→」は付けない(2026-09-19に廃止。GOALページの導線ボタンは等幅+矢印アイコンの旧形のまま残っている)。

**`text-link-cta`** — 「VIEW FULL "PROFILE" →」等。下線ボーダー+ホバーでletter-spacing展開するテキストリンク型。角丸ボタンではない。

**`social-icon-outline`** — SNSアイコンの共通形。CONTACT本文(46px)・PROFILEヒーロー(42px)・フッター(34px)で使う円形。透明背景+1px border(alpha .18)+`rgba(21,21,21,.7)`のアイコン、hoverでAction Blueへ色変化+`translateY(-2px)`。掲載は Instagram / LinkedIn / X / Facebook / GitHub(CONTACT本文はInstagramを除く3つ)。2026-09-19に、CONTACT・PROFILEの公式ブランド色ベタ塗り(旧`social-icon-contact`)をやめて統一した。

### カード

**`card-showcase`** — `{rounded.lg}`(16px)、常時薄い2層shadow。HOMEのSELECTED WORKS 3枚限定の「特別な」カードグラマー。

**`card-flat-bordered`** — `{rounded.none}`、白背景、1pxハーフトーンborderのみ、静止時shadowなし。研究カード・導線カード等の最頻出パターン。hoverで`translateY(-8px)`+shadow出現。

**`card-soft-rounded`** — `{rounded.sm}`(10px)、常時ソフトshadow。バッジ状の小型カード限定の例外グラマー。経歴カード・研究室カードのような情報量の多い大型カードには使わず、`card-flat-bordered`を使う(2026-09-18: PROFILEダッシュボードの経歴カードが誤ってこのグラマーを使っていたため是正)。

**`card-accent-top`** — 白背景、1pxborder+上端だけ3px accentボーダー(`{colors.primary}`)。実績バッジに使用。

**`panel-cream-inset`** — `{colors.canvas-deep}`のパディング小箱。地の色から一段沈めた情報ボックス。

**`row-list`** — 転換済みページの標準的な情報の並べ方。箱・背景・影を持たず、上下1pxの区切り線(alpha .14)と余白だけで行を区切る。経歴(PROFILE)や問い合わせ内容(CONTACT)で使う。リンクの行はhoverで`translateY(-2px)`のみ。旧`card-flat-bordered`より軽く、Apple風のシンプルさを担う。

**`panel-tinted`** — 意味の色分けが必要な面(PROFILE「強みと弱み」)。`{rounded.none}`、影なし、padding 32px 28px 36px。強み=`{colors.primary-pale}`(#D9E8F7)+青いpillバッジ(`#2A6BA6`地・白文字)、弱み=`{colors.canvas-deep}`(#FBF5DE)+Ink(`#151515`)地のpillバッジ。**クリーム面で金は使わない**(金は濃紺面のアクセント)。

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

**`contact-form`** — パネルを持たず、ページの余白の中に置く(2026-09-19に`{colors.canvas-deep}`パネルをやめた)。入力欄は背景`#fff`、border `1px solid rgba(21,21,21,.2)`、`{rounded.none}`、padding 14px、フォーカス時はborder-colorのみ`{colors.primary}`へ変化(shadowなし)。氏名/用件欄はゴシック16px、メール欄のみ等幅(半角入力であることを書体で示唆)。送信ボタンは黒地でhoverに青。送信後はチェックアイコン+完了メッセージへ差し替え。エラー時は`{colors.error}`の注意文。

### フッター

**`footer`** — 筆記体の署名ロゴ+ `social-icon-outline`(34px) + 補助リンク。

## Do's and Don'ts

### Do
- クリーム面のクリック可能要素は`{colors.primary}`(Action Blue)を使う。濃紺面のクリック可能要素だけ`{colors.accent-gold}`(Gold)を特別色として使い、クリーム面へ金を広げない。
- 見出しは`.u-display`(HOMEのみ明朝)、ラベル・数値・ナビは等幅、本文はゴシック。この役割を混同しない。
- カード・ボタンは静止時フラット、hoverで`translateY`+2層box-shadowを立ち上げて操作可能性を示す。
- CTAはpill(`{rounded.pill}`)、カードは`{rounded.none}`を基調とし、それぞれ1つの文法に統一する。丸(`{rounded.full}`)は「現在地・アイコン・円形トリミング」、pillはCTAと「バッジ」に使う。
- 新しいカード・ボタン・アイコンは既存の型に寄せて、少数の文法に統一する。`border-radius`やshadowの新しい値を増やさない(現状の0/10/16pxも、今後は統一の方向で整理する)。
- 意味の色分け(強み/弱み等)には既存トークン(`primary-pale` / `canvas-deep` / `ink`)を使う。クリーム面で金を使わない。
- 転換済みページは、箱で囲うより区切り線と余白で構成する(`row-list`)。
- Parisienne(筆記体)は年に1〜2箇所の署名的な使用に留め、多用しない。
- STORY年表以外の画面はPC/モバイルで構造そのものを変えず、レイアウトのみブレークポイントで調整する(例外: PROFILEはモバイルでヒーローの写真を先頭に並べ替える。CSSの`order:-1`だけで、DOM順・読み上げ順は本文が先のまま)。
- 新しい演出コンポーネントを追加する場合も「概念を象徴するcanvas/SVG」という位置づけに留め、実写真ヒーローに頼らない。

### Don't
- 静止時のカード・ボタンにshadowを足さない——「hoverで初めて浮き上がる」動きがこのサイトの手触りの核。
- 本文を明朝・等幅で長文表示しない——ゴシック以外は可読性が落ちる。
- 濃紺セクションを増やしすぎない——「ビジョン・実績・特別な瞬間」を語る場に限定されているからこそ効果を持つ。
- HOME以外のページで明朝を使わない。例外はSTORY「ここまでの道のり。」・GOAL「地域創生」の2つの大見出しだけ(ユーザー指定)。

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

1. まず「クリーム面か濃紺面か」を決める。アクセントは基本が青で、濃紺面のクリック可能要素・特別な場面だけ金を使う。
2. 見出し=`.u-display`(HOMEのみ明朝)、ラベル=等幅、本文=ゴシックの3層を崩さない。筆記体は追加しない。
3. 新規カードは既存3パターン(`card-flat-bordered` / `card-soft-rounded` / `card-showcase`)のいずれかに寄せ、border-radiusを勝手に増やさない。
4. shadowは静止時ゼロ、hoverで2層shadow+わずかな`translateY`——この「動的エレベーション」の型を踏襲する。
5. 新しい演出コンポーネントを追加する場合も、`particle-field`/`journey-scene`/`dream-city`/`flow-cycle`と同様に「概念を象徴するcanvas/SVG」という位置づけに留める。
6. STORY年表のPC/モバイル分岐構造は複雑なため、変更時は両方の実装(PC縦ナビ系/モバイル進捗バー系)を必ずセットで確認する。
7. `{token.refs}`を使い、可能な限りhex直書きを避ける——ただしalpha値は文脈依存で個別調整されているため、無理に1値へ丸めない。

## Known Gaps

- カードの`border-radius`(0/10/16px)とbox-shadowの数値バリエーション(4〜5パターン)は、正式なトークン表としては本ドキュメントで初めて整理した段階。Apple風の方針では少数の文法への統一を優先するため、今後は増やさず、統一の方向で整理していく。
- ダークモード(OS設定連動の自動切替)は実装されていない。濃紺セクションは常設のダーク演出であり、ライト/ダークの自動切替とは別物。
- フォームのバリデーション仕様(必須項目・文字数制限等の詳細)はJS実装側にあり、本ドキュメントには構造のみ記載した。
- 4つの演出コンポーネント(`particle-field`/`journey-scene`/`dream-city`/`flow-cycle`)の内部パラメータ・カスタマイズ可能範囲は本ドキュメントの対象外。変更時は各`js/*.js`を直接参照すること。
- `card-soft-rounded`は、PROFILE「強みと弱み」が2026-09-19にパネル化(`panel-tinted`)されたことで使用箇所がなくなり、未使用になった`.c-157`・`.c-160`をCSSから削除した。今後も新規には使わない。
- 小さい非リンクのラベル(各ページの「PROFILE」「CONTACT」等の見出し前ラベル、共通クラス`.c-023`)がAction Blue(`#3B82C4`)で表示されており、クリック可能シグナルとの意味の重複と、12px以下でのコントラスト不足(約3.6:1)がある。全ページに影響するため未対応。
- 方針転換の途中段階: WORKSの詳細ページ(MOBILITY / AI×仕事 / AI×教育)・STORY・HOBBY は書体のみ`.u-display`へ転換済みで、カード・影・角丸・配色は旧方針のまま。ページごとにレイアウトの新旧が混在している。
- Avenir Nextはライセンス上Webフォントとして配信できないため、Apple端末以外ではNunito Sansで代替表示される(欧文のみ。日本語は全端末でZen Kaku Gothic Antique)。
