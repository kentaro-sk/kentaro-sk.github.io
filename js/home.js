'use strict';

/* ================================================================
   home.js — トップページ専用インタラクション

   【役割】
   ① IntersectionObserver によるスクロール連動フェードイン
   ② ヒーローセクションのスクロール進行度に応じた視差演出
   ③ ナビバーのスクロール量に応じた背景不透明度変化

   【依存関係】
   ・jQuery は不要（Vanilla JS のみで実装）
   ・style.js と progressbar.js の後に読み込む
   ================================================================ */


/* ----------------------------------------------------------------
   1. スクロール連動フェードイン
   [data-reveal] 属性を持つ要素がビューポートに入ると
   .is-visible クラスが付与され、CSS トランジションで表示される。

   [data-delay] 属性で遅延秒数を指定できる（例: data-delay="0.2"）。
   兄弟要素に連番で delay を付けるとスタッガード（段差）アニメーションになる。
   ---------------------------------------------------------------- */
(function initReveal() {
  /* IntersectionObserver が使えないブラウザ（IE 等）では何もしない
     その場合は要素が最初から表示されるよう CSS でフォールバックを設定 */
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  /* 要素の10%がビューポートに入った瞬間に発火する設定
     rootMargin の負値により、画面下端より少し手前で発火させて
     ユーザーが要素を認識できるタイミングに合わせる */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      /* data-delay 属性があればその秒数だけトランジションを遅らせる
         カードを順番に表示するスタッガード演出に利用 */
      const delay = parseFloat(el.dataset.delay || '0');
      el.style.transitionDelay = delay + 's';
      el.classList.add('is-visible');

      /* 一度表示した要素は監視を解除してパフォーマンスを節約 */
      observer.unobserve(el);
    });
  }, {
    threshold:  0.1,            /* 要素の10%が見えたら発火 */
    rootMargin: '0px 0px -60px 0px' /* 画面下端より60px手前で発火 */
  });

  /* [data-reveal] 属性を持つ全要素を監視対象に登録 */
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    observer.observe(el);
  });
}());


/* ----------------------------------------------------------------
   2. ヒーローセクションの視差スクロール（Parallax）補助
   scroll イベントをリッスンし、ヒーロー内テキストを
   スクロール量の半分だけ上方向に動かすことで奥行き感を演出する。
   background-attachment: fixed が効かないモバイルでも動作する。
   ---------------------------------------------------------------- */
(function initHeroParallax() {
  const heroContent = document.querySelector('.hero-content');
  if (!heroContent) return;

  let ticking = false; /* requestAnimationFrame による描画最適化フラグ */

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;

    /* requestAnimationFrame でスクロールハンドラを1フレームに1回に間引く
       scroll イベントは高頻度で発火するため、直接DOMを操作するとジャンクが生じる */
    requestAnimationFrame(function () {
      const scrollY  = window.pageYOffset;
      const heroH    = heroContent.closest('.hero-section').offsetHeight;

      /* ヒーローが画面内にある間だけ処理する（不要な計算を省く） */
      if (scrollY < heroH) {
        /* スクロール量の30%分、上方向に移動させる（背景より遅く動く演出） */
        heroContent.style.transform = 'translateY(' + (scrollY * 0.30) + 'px)';
        /* スクロールに応じて透明度を下げてフェードアウトさせる */
        heroContent.style.opacity = 1 - (scrollY / (heroH * 0.65));
      }

      ticking = false;
    });
  }, { passive: true }); /* passive: true でスクロールのレンダリングを妨げない */
}());


/* ----------------------------------------------------------------
   3. スクロール量に応じたナビバー背景強化
   ページトップ（ヒーロー内）ではナビを透明に近くし、
   スクロールが進むと不透明にすることで視認性を高める。
   ---------------------------------------------------------------- */
(function initNavScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    /* スクロール量が 80px を超えたら .scrolled クラスを付与
       CSS でナビバーの見た目を切り替える */
    if (window.pageYOffset > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}());
