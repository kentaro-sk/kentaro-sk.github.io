// style-hover="..." / style-focus="..." 属性を持つ要素に対して、通常のCSS
// :hover / :focus ルールと同じ意味のスタイルを動的に生成して適用する。
// 旧index.html(dc-runtime)ではこれらの属性をランタイムが解釈し、要素ごとに
// 生成した .c-XXX クラス+疑似クラスのルールを insertRule で差し込んでいた。
// サイト全体の大量の要素(ナビリンク・カード・ボタン・フォーム等)がこの属性に
// 依存しているため、Astro移行にあたっても属性自体はマークアップにそのまま残し、
// この汎用スクリプトだけを全ページ共通で読み込むことで同じ見た目・挙動を再現する。
const sheet = document.createElement('style');
document.head.appendChild(sheet);
let seq = 0;
[['style-hover', 'hover'], ['style-focus', 'focus']].forEach(([attr, pseudo]) => {
  document.querySelectorAll('[' + attr + ']').forEach(el => {
    const decl = el.getAttribute(attr);
    if (!decl) return;
    const cls = 'sh-' + (seq++);
    el.classList.add(cls);
    sheet.sheet.insertRule('.' + cls + ':' + pseudo + '{' + decl + '}', sheet.sheet.cssRules.length);
  });
});
