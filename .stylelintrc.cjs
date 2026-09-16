// stylelint の設定ファイル。
//
// なぜ "stylelint-config-standard"（書式の好み中心）ではなく
// "stylelint-config-recommended"（本当に間違っている可能性が高いものだけ）を使うか:
// html-validateのときと同じ理由。インデント・空行・色の書き方等の「好みの問題」まで
// エラー扱いにすると、CIが常に赤信号になって形骸化してしまう。まずは「壊れている可能性が
// 高いもの」だけを検知する構成にしている。
module.exports = {
  extends: "stylelint-config-recommended",
  rules: {
    // no-descending-specificity: 「後に書かれたセレクタの方が詳細度が低い」箇所を検知するルール。
    // 理論上はCSSの並び順を変えると見た目が変わりうる「壊れやすさ」を示すが、
    // 実際にCSSを並び替えて直すと現状の見た目が変わるリスクの方が大きいため、
    // 現状維持を優先しoffにしている（このプロジェクトは「エフェクト・見た目を変えない」ことを
    // 最優先する方針。詳細はportfolio-refactor-*サブエージェントの制約を参照）。
    "no-descending-specificity": null,
  },
};
