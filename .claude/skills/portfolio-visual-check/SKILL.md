---
name: portfolio-visual-check
description: ポートフォリオの見た目を確認するための標準手順とスクリプト（ローカルサーバ起動→ページ移動→スクロール演出の完了待ち→PC幅・スマホ幅で全体撮影→コンソールエラー・横はみ出しの検出）。HTML/CSSを変更したあとの目視確認、変更前後の比較、「スクリーンショットを撮って」「見た目を確認して」と依頼されたときに使う。使い捨てのPuppeteerスクリプトをプロジェクト直下に作らず、これを使う。
---

# 見た目確認（スクリーンショット＋簡易チェック）

`scripts/visual-check.mjs` が、ローカルサーバの起動から撮影・検査までを1コマンドで行う。
外部のサーバやコマンドは不要（Node.js と node_modules の puppeteer だけ）。

## 使い方（プロジェクト直下で）

```
node scripts/visual-check.mjs --page PROFILE                      # PC幅(1440)とスマホ幅(390)で撮影
node scripts/visual-check.mjs --page WORKS --widths 1440,768,390  # 幅を指定
node scripts/visual-check.mjs --file pages/hobby-castles.html     # 独立したHTMLを開く
node scripts/visual-check.mjs --page HOME --out C:/tmp/shots      # 保存先を指定
```

- `--page` は index.html 内のナビ名（HOME / PROFILE / WORKS / STORY / GOAL / HOBBY / CONTACT など）。
  このサイトは1つの index.html の中で画面を切り替える構成なので、ナビのリンクをクリックして移動する。
- 保存先の既定は OS の一時フォルダ（リポジトリ内に一時ファイルを残さない）。
- 撮影後、**必ず画像を `Read` で開いて目視確認する**。スクリプトが検出できるのは、コンソールエラー・
  未捕捉の例外・横はみ出しだけで、見た目の良し悪しは判断できない。
- 問題が1件でもあれば終了コード1（問題の一覧が表示される）。

## 変更前後を比較するとき
1. **変更する前に**撮る: `--out <前用フォルダ>`
2. 変更する。
3. 同じコマンドで撮る: `--out <後用フォルダ>`
4. 2枚を見比べる。意図しない差分があれば不具合として直す。

## 落とし穴（すべて過去に実際に踏んだもの。スクリプトは対策済み）
- **スクロールで出現する演出（`data-rv`）は、待たないと未表示のまま撮れる。**
  スクロール後に約2.5秒待ち、さらに全体撮影の直前にビューポートをページ全体の高さへ広げてもう一度待つ
  （全体撮影の内部処理で演出が再判定され、下半分が空白で写るため）。
- **`--page` に存在しない名前を渡すと**「ナビのリンクが見つかりません」と報告して終了コード1になる。
- **使い捨てスクリプトを作らない。** プロジェクト外（スクラッチ等）で書くと `puppeteer` が見つからず、
  プロジェクト直下に置くと消し忘れる（`stray-scratch-check` フックが警告する）。特別な確認が要る場合も、
  まずこのスクリプトのオプションで足りないか考える。
- Puppeteer のバージョンによって `page.waitForTimeout` は使えない。待つときは `setTimeout` の Promise を使う。
- DOMRect は `JSON.stringify` すると `{}` になる。数値を取り出してから返す。

## 関連
- 変更前後の「変わっていない」の確認は `refactoring-playbook`、デザイン改修の検証は `portfolio-design-review`
  の手順から、このスキルを呼ぶ。
- スマホ表示・複数のPC幅の崩れを専門に見るには `mobile-responsive-reviewer` / `pc-layout-reviewer` エージェントを使う。
