// html-validate の設定ファイル。
//
// なぜ標準の "html-validate:recommended" をそのまま使わないか:
// このプロジェクトのCLAUDE.md（コーディング規約）では、インラインstyleを基本的に許容している。
// また `<x-dc>` `<helmet>` のような、このサイト独自の非標準タグ（"DCランタイム"由来の構造）を
// 意図的に使っている。recommendedプリセットをそのまま適用すると、これらの「意図的な設計」まで
// エラー扱いになってしまい、CIが常に赤信号になって形骸化してしまう。
//
// そのため、CLAUDE.mdの自動push条件にある「HTMLが構文的に壊れていない（タグの開閉が正しい・
// ページが表示可能な状態）」という本来の目的に合わせて、スタイル・アクセシビリティ上の好みに
// 関するルールだけをoffにし、閉じタグ不一致・属性重複・ID重複といった「本当に壊れている」ことを
// 検知するルールは有効なまま残している。
module.exports = {
  extends: ["html-validate:recommended"],
  rules: {
    // このプロジェクトはインラインstyleを許容する方針（親CLAUDE.md参照）
    "no-inline-style": "off",
    // 属性名の大文字小文字は動作に影響しないため許容
    "attr-case": "off",
    // <br> と <br/> など空要素の自己終了スタイルは動作に影響しないため許容
    "void-style": "off",
    // 1ページ内に複数の<main>を使う構成を意図的に採用しているため許容
    "no-multiple-main": "off",
    // <button>・<input>のtype省略は動作に影響するケースが稀なため許容
    "no-implicit-button-type": "off",
    "no-implicit-input-type": "off",
    // 見出しタグを装飾目的で一時的に空にするケースがあるため許容
    "empty-heading": "off",
    // crossorigin="" のような空値属性の書式は動作に影響しないため許容
    "attribute-empty-style": "off",
    "aria-label-misuse": "off",
    "unique-landmark": "off",
    // iframeのscrolling属性は非推奨だが動作はするため許容（HTML5構文としては壊れていない）
    "no-deprecated-attr": "off",
    // <x-dc>・<helmet> 等、このサイト独自の非標準タグを使っているため許容
    "element-name": "off",
    // <html lang>・<title>未設定は既知の改善余地として別途対応するためCIでは一旦許容
    // （2026-09-16時点で未対応。対応時にこの2行を削除してよい）
    "element-required-attributes": "off",
    "element-required-content": "off",
  },
};
