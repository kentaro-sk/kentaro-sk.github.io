// ヘッダー共通の挙動(モバイルメニュー開閉・スクロール進捗バー)。
// 旧index.htmlのdc-runtime Componentクラスが担っていたうち、
// 全ページ共通のヘッダー/フッター関連のロジックだけを切り出したもの。
// WORKS/HOBBYのデスクトップドロップダウンはCSSのhoverのみで実現しているため、
// ここにはロジックを持たない(SiteHeader.astroの<style>参照)。

// SVGElementは.hidden プロパティを持たない(HTMLElement専用のIDL反映のため代入しても
// 実際のhidden属性には反映されない)ため、svgアイコンの開閉には必ずこちらを使う。
function setHidden(el, hide) {
  if (!el) return;
  if (hide) el.setAttribute('hidden', ''); else el.removeAttribute('hidden');
}

function setMenuOpen(open) {
  const btn = document.querySelector('[data-hamburger]');
  const panel = document.querySelector('[data-mobile-menu]');
  const scrim = document.querySelector('[data-menu-scrim]');
  const iconOpen = document.querySelector('[data-icon-open]');
  const iconClose = document.querySelector('[data-icon-close]');
  if (!btn || !panel || !scrim) return;
  btn.setAttribute('aria-expanded', String(open));
  setHidden(panel, !open);
  setHidden(scrim, !open);
  setHidden(iconOpen, open);
  setHidden(iconClose, !open);
  if (open) panel.style.animation = 'ddIn .24s cubic-bezier(.16,1,.3,1) both';
}

function initMobileMenu() {
  const btn = document.querySelector('[data-hamburger]');
  const scrim = document.querySelector('[data-menu-scrim]');
  if (!btn) return;
  let open = false;
  btn.addEventListener('click', e => {
    e.preventDefault();
    open = !open;
    setMenuOpen(open);
  });
  if (scrim) scrim.addEventListener('click', () => { open = false; setMenuOpen(false); });
}

function initScrollProgress() {
  const bar = document.querySelector('[data-progress-bar]');
  if (!bar) return;
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? Math.min(1, h.scrollTop / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

initMobileMenu();
initScrollProgress();
