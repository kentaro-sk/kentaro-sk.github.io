/* ================================================================
   award.js — 学会・受賞履歴ページのアコーディオン制御
   依存: jQuery（footer.jsp で読み込み済み）

   仕組み:
     - .title をクリックすると直後の .box を slideToggle する
     - .title に open クラスを付けることで CSS の + / × アイコンが切り替わる
   ================================================================ */

$(document).ready(function () {

    /* 最初のアコーディオン項目をデフォルトで開いた状態にする */
    var $firstTitle = $('.accordion-area li:first-of-type .title');
    var $firstBox   = $firstTitle.next('.box');
    $firstTitle.addClass('open');
    $firstBox.show();

    /* タイトルクリックでアコーディオンを開閉する */
    $('.title').on('click', function () {
        var $box = $(this).next('.box');

        /* .box をスライドアニメーションで表示・非表示切り替え */
        $box.slideToggle(280);

        /*
         * open クラスの切り替え → CSS の ::before / ::after が
         * + アイコン（閉じている）か × アイコン（開いている）かを決定する
         */
        $(this).toggleClass('open');
    });

});
