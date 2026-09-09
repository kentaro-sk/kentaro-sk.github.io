// HOMEページ専用の演出(文字送りフェード・セクション単位のスクロールリビール・
// particle-fieldの背景図形タグ付け)。旧index.html(dc-runtime)のComponentクラスに
// あったcharFx()/homeReveal()/tag()/flattenScreenSections()をほぼ無変更で移植したもの。
// 他ページでは使わないため、HOMEページ(index.astro)からのみ読み込む。

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)';

// screenの子要素を走査し、子要素数3以上かつ高さがビューポート1.5倍超のセクションだけ
// 孫要素まで分解する共通ロジック。
function flattenScreenSections(screen, vh) {
  const result = [];
  Array.from(screen.children).forEach(c => {
    if (c.children.length >= 3 && c.getBoundingClientRect().height > vh * 1.5) {
      Array.from(c.children).forEach(g => result.push(g));
    } else result.push(c);
  });
  return result;
}

// data-charfx属性の要素を1文字ずつ span化し、画面内に入ったタイミングで
// 順番にフェードイン+ブラー解除させる演出。
function charFx() {
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-charfx]').forEach(el => {
      if (el.__cfx) return;
      el.__cfx = true;
      const step = parseFloat(el.getAttribute('data-charfx')) || 40;
      const base = parseFloat(el.getAttribute('data-charfx-delay')) || 0;
      const txt = el.textContent;
      el.textContent = '';
      const spans = Array.from(txt).map((ch, i) => {
        const s = document.createElement('span');
        s.textContent = ch === ' ' ? ' ' : ch;
        const d = base + i * step;
        s.style.cssText = 'display:inline-block;opacity:0;transform:translateY(26px);filter:blur(7px);transition:opacity .85s ' + EASE_OUT + ' ' + d + 'ms, transform 1.05s ' + EASE_OUT + ' ' + d + 'ms, filter .85s ' + EASE_OUT + ' ' + d + 'ms';
        el.appendChild(s);
        return s;
      });
      const run = () => spans.forEach(s => {
        s.style.opacity = '1';
        s.style.transform = 'none';
        s.style.filter = 'blur(0px)';
      });
      if (!('IntersectionObserver' in window)) return run();
      const io = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) { run(); io.unobserve(e.target); } });
      }, { threshold: 0, rootMargin: '0px 0px -16% 0px' });
      io.observe(el);
    });
  });
}

let hio = null;
let rvAll = [];

// data-screen-label="HOME"配下のセクションをヒューリスティックに分解し、
// スクロールで画面内に入るごとにフェードイン+ブラー解除させる演出。
function homeReveal() {
  requestAnimationFrame(() => {
    const screen = document.querySelector('[data-screen-label]');
    if (!screen) return;
    if (!hio) {
      hio = new IntersectionObserver(es => {
        es.forEach(e => {
          if (!e.isIntersecting) return;
          const t = e.target;
          t.__shown = true;
          t.style.opacity = '1';
          t.style.transform = 'none';
          t.style.filter = 'blur(0px)';
          setTimeout(() => { t.style.filter = ''; t.style.willChange = ''; }, 1800);
          hio.unobserve(t);
        });
      }, { threshold: 0.04, rootMargin: '0px 0px -14% 0px' });
    }
    const vh = window.innerHeight;
    const blocks = flattenScreenSections(screen, vh);
    const targets = [];
    blocks.forEach(b => {
      let node = b;
      while (node.children.length === 1 && node.children[0].children.length) node = node.children[0];
      const kids = Array.from(node.children);
      const set = kids.length > 1 && kids.length <= 8 ? kids : [node];
      set.forEach((el, i) => {
        if (el.__rv) return;
        el.__rv = true;
        if ((el.getAttribute('style') || '').indexOf('animation:') > -1) return;
        // data-no-reveal: STORY年表・カード列などposition:stickyで自前の位置制御をしている
        // 要素にtransformが乗るとstickyの基準がずれてカクつくため、明示的に除外する。
        if (el.hasAttribute('data-charfx') || el.hasAttribute('data-rv') || el.hasAttribute('data-no-reveal')) return;
        const d = i * 130;
        el.style.opacity = '0';
        el.style.transform = 'translateY(44px) scale(.985)';
        el.style.filter = 'blur(9px)';
        el.style.willChange = 'opacity, transform, filter';
        el.style.transition = 'opacity 1.1s ' + EASE_OUT + ' ' + d + 'ms, transform 1.35s ' + EASE_OUT + ' ' + d + 'ms, filter 1.1s ' + EASE_OUT + ' ' + d + 'ms';
        targets.push(el);
      });
    });
    rvAll = rvAll.concat(targets).filter(el => el.isConnected && !el.__shown);
    if (!('IntersectionObserver' in window)) { rvAll.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'blur(0px)'; }); return; }
    rvAll.forEach(el => hio.observe(el));
  });
}

// HOMEの各セクションのテキストを見て、particle-field(背景の点群)に
// data-particle/data-particle-alpha属性でヒントを付与する
// (scroll-driven指定のparticle-fieldがあれば図形切り替えに使う)。
function tag() {
  requestAnimationFrame(() => {
    const screen = document.querySelector('[data-screen-label="HOME"]');
    if (!screen) return;
    const vh = window.innerHeight;
    const sections = flattenScreenSections(screen, vh);
    const RULES = [
      [/WHY DO WE BUILD/, '\u{1F995},globe,\u{1F3EF},\u{1F697},AI,~\u{1F5FE}', 1],
      [/HOW SHOULD ROBOTS MOVE/, '\u{1F697}', .8],
      [/RETHINKING HOW WE WORK/, 'AI', .8],
      [/HOW I BECAME WHO I AM/, '\u{1F995}', .8],
      [/AI × MOBILITY × DESIGN/, '\u{1F393}', .8],
      [/考えて、つくったもの/, '\u{1F697}', .8],
      [/仕事の相談も/, '✉', .8],
      [/FUTURE VISION|FROM NAGOYA/, '~\u{1F5FE}', .34],
      [/SELECTED WORKS/, '\u{1F697}', .28],
      [/WHAT I'M WORKING ON NOW/, 'AI', .3],
      [/^STORY|挫折/, '\u{1F3EF}', .3],
      [/^CONTACT|LET'S BUILD/, '✉', .3],
      [/WHAT WE COULD DO/, '\u{1F91D}', .28],
      [/OUTPUT|ACHIEVEMENTS|Best Paper|RESULT/, '\u{1F3C6}', .3],
      [/CERTIFICATIONS/, '証', .28],
      [/OUTSIDE THE WORK|CURIOSITY/, '\u{1F995}', .28],
      [/FAILURE/, '壁', .34],
      [/LEADERSHIP|人の側も/, '\u{1F91D}', .28],
      [/PROBLEM/, '\u{1F6B6}', .28],
      [/APPROACH|可誘導性/, 'wave', .3],
      [/CAPABILITIES|IMPLEMENTATION|BUILD/, '⚙', .28],
      [/WHAT I LEARNED|SOCIETY|地域が強く/, 'globe', .3],
      [/EDUCATION|NAGOYA UNIVERSITY/, '\u{1F393}', .28],
      [/MOBILITY|自律移動/, '\u{1F697}', .28]
    ];
    sections.forEach(sec => {
      const t = (sec.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 150);
      const hit = RULES.find(r => r[0].test(t)) || [null, 'AI', .26];
      sec.setAttribute('data-particle', hit[1]);
      sec.setAttribute('data-particle-alpha', String(hit[2]));
    });
  });
}

charFx();
homeReveal();
tag();
