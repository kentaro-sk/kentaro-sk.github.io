/* ================================================================
   page_link.js — 全ページ共通インタラクション

   ① ページ内スクロール（アンカーリンクをスムーズスクロールに変換）
   ② ハンバーガーメニューのトグル（スマホ表示時）
   ================================================================ */

$(document).ready(function () {

  /* ----------------------------------------------------------------
     ① ページ内スクロール
     href に "#" を含むリンクをクリックしたとき、
     対象要素までアニメーションスクロールする。
     固定ナビバーの高さ（65px）分だけ上端をずらして位置合わせする。
     ---------------------------------------------------------------- */
  $('#page-link a[href*="#"]').on('click', function () {
    var elmHash = $(this).attr('href'); /* リンク先のID（例: "#section1"）を取得 */
    var pos = $(elmHash).offset().top;  /* ID要素の上端からページトップまでの距離 */
    $('body, html').animate(
      { scrollTop: pos - 80 }, /* ナビバー高さ分だけ上にオフセット */
      500                       /* スクロール時間（ms）。大きいほどゆっくり */
    );
    return false; /* デフォルトのジャンプ動作をキャンセル */
  });


  /* ----------------------------------------------------------------
     ② ハンバーガーメニューのトグル
     スマホ表示（max-width: 670px）では .header-right がCSSで非表示になる。
     ハンバーガーアイコン（.menu-icon）をクリックすると
     .header-right に .is-open クラスを付け外しして表示を切り替える。
     ---------------------------------------------------------------- */

  /* アイコンクリック：メニューの開閉を切り替える */
  $('.menu-icon').on('click', function (e) {
    e.stopPropagation(); /* クリックイベントが document まで伝播するのを止める
                            （直後の「メニュー外クリックで閉じる」処理が誤発火しないよう） */
    $('#page-link').toggleClass('is-open');

    /* アイコンをバツ（×）に切り替えて「開いている」状態をわかりやすくする */
    $(this).toggleClass('fa-bars fa-times');
  });

  /* メニュー内のリンクをクリックしたらメニューを閉じる
     ページ遷移後に開いたままにならないようにするため */
  $('#page-link a').on('click', function () {
    $('#page-link').removeClass('is-open');
    $('.menu-icon').removeClass('fa-times').addClass('fa-bars');
  });

  /* メニューの外側をクリックしたらメニューを閉じる
     ユーザーが誤ってメニューを開いたまま離脱しないようにする */
  $(document).on('click', function (e) {
    /* クリック対象が header の中でない場合のみ閉じる */
    if (!$(e.target).closest('header').length) {
      $('#page-link').removeClass('is-open');
      $('.menu-icon').removeClass('fa-times').addClass('fa-bars');
      /* ドロップダウン（Academic）も同時に閉じて状態を揃える */
      closeDropdown();
    }
  });


  /* ----------------------------------------------------------------
     ③ ナビのドロップダウン（Academic）開閉
     クリック/タップで .is-open をトグルし、aria-expanded を同期する。
     デスクトップのホバー展開は CSS 側（:hover / :focus-within）が担当し、
     ここではタッチデバイスとキーボード操作のための開閉のみ扱う。
     ---------------------------------------------------------------- */

  /* ドロップダウンを閉じて aria-expanded も false に戻す共通処理 */
  function closeDropdown() {
    $('.nav-dropdown').removeClass('is-open');
    $('.nav-drop-toggle').attr('aria-expanded', 'false');
  }

  /* トグルボタンのクリック：開閉を切り替える */
  $('.nav-drop-toggle').on('click', function (e) {
    e.stopPropagation(); /* document のクリックハンドラ（外側クリックで閉じる）の誤発火を防ぐ */
    var $dropdown = $(this).closest('.nav-dropdown');
    $dropdown.toggleClass('is-open');
    /* スクリーンリーダーに開閉状態を正しく伝えるため aria-expanded を同期する */
    $(this).attr('aria-expanded', $dropdown.hasClass('is-open') ? 'true' : 'false');
  });

  /* Esc キーでドロップダウンを閉じる（キーボード操作への配慮） */
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      closeDropdown();
    }
  });

});
