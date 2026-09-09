// data-rv属性を持つ要素のスクロールリビール(フェードイン)と、data-count属性を持つ
// 数字のカウントアップ演出。旧index.html(dc-runtime)のComponentクラスにあった
// reveal()/countUp()をほぼ無変更で移植したもの。HOME以外の各ページで共通して使うため、
// 必要なページ側から個別に読み込む(全ページ一律ではなく、使うページだけがJSを読み込む
// というAstro移行の方針に合わせている)。

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)';

function countUp(el) {
  const to = parseFloat(el.getAttribute('data-count')) || 0;
  const dur = 1100, t0 = performance.now();
  const tick = now => {
    const k = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = String(Math.round(to * e));
    if (k < 1) requestAnimationFrame(tick);
  };
  el.textContent = '0';
  requestAnimationFrame(tick);
}

function reveal() {
  requestAnimationFrame(() => {
    let io = reveal._io;
    if (!io) {
      io = reveal._io = new IntersectionObserver(es => {
        es.forEach(e => {
          if (!e.isIntersecting) return;
          const el = e.target;
          el.style.opacity = '1';
          el.style.transform = 'none';
          setTimeout(() => { el.style.willChange = ''; el.style.transition = el.__tr || ''; el.style.transform = ''; }, 1500);
          const c = el.matches('[data-count]') ? [el] : Array.from(el.querySelectorAll('[data-count]'));
          c.forEach(n => { if (!n.__c) { n.__c = true; countUp(n); } });
          io.unobserve(el);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    }
    const queued = [];
    document.querySelectorAll('[data-rv]').forEach((el, i) => {
      if (el.__rv) return;
      el.__rv = true;
      el.__tr = el.style.transition;
      el.style.opacity = '0';
      el.style.transform = 'translateY(34px)';
      el.style.willChange = 'opacity, transform';
      el.style.transition = 'opacity 1s ' + EASE_OUT + ' ' + ((i % 6) * 90) + 'ms, transform 1.2s ' + EASE_OUT + ' ' + ((i % 6) * 90) + 'ms';
      queued.push(el);
    });
    if (queued.length) {
      void document.body.offsetHeight;
      requestAnimationFrame(() => queued.forEach(el => io.observe(el)));
    }
    document.querySelectorAll('[data-count]').forEach(n => {
      if (n.__c || n.closest('[data-rv]')) return;
      n.__c = true;
      countUp(n);
    });
  });
}

reveal();
