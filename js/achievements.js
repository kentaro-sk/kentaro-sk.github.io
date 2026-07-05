'use strict';

/* ================================================================
   achievements.js — 研究実績データ + 動的レンダリングロジック

   【役割と設計方針】
   ・このファイル1つに「データ定義」と「描画ロジック」をまとめている。
   ・新しい実績を追加する場合は ACHIEVEMENTS 配列にオブジェクトを追加するだけでよい。
   ・HTML側は空の <div id="achievement-list"> と <div id="achievement-filter">
     を用意するだけで、このスクリプトが動的にDOMを生成する。

   【読み込み順序】
   <script src="./js/achievements.js"></script>
   → DOMContentLoaded イベント後に自動で初期化が走る。
   ================================================================ */


/* ----------------------------------------------------------------
   1. カテゴリ定義
   各カテゴリのラベル（日本語）・バッジ色・アイコンを一元管理する。
   新しいカテゴリを追加する際はここにエントリを足すだけでよい。
   ---------------------------------------------------------------- */
const CATEGORIES = {
  Award: {
    label: '受賞',        /* フィルタボタンやバッジに表示するテキスト */
    bg:    '#f59e0b',     /* バッジ背景色（ゴールド系） */
    text:  '#1a1a1a',     /* バッジテキスト色（濃い色で視認性を確保） */
    icon:  '🏆'           /* バッジ左側に表示する絵文字アイコン */
  },
  Journal: {
    label: '論文誌',      /* 査読付きジャーナル論文。学会発表より格上のため独立カテゴリとする */
    bg:    '#dc2626',     /* バッジ背景色（レッド系。最上位の学術成果として目立たせる） */
    text:  '#fff',
    icon:  '📕'
  },
  Conference: {
    label: '学会発表',
    bg:    '#2563eb',     /* ブルー */
    text:  '#fff',
    icon:  '📄'
  },
  Patent: {
    label: '特許',
    bg:    '#7c3aed',     /* パープル */
    text:  '#fff',
    icon:  '📋'
  },
  Grant: {
    label: '研究費',
    bg:    '#059669',     /* グリーン */
    text:  '#fff',
    icon:  '🎓'
  }
};


/* ----------------------------------------------------------------
   2. 実績データ配列（7件）

   各オブジェクトのプロパティ説明：
     category    : "Award" / "Conference" / "Patent" / "Grant"
                   ※ CATEGORIES のキーと一致させること
     title       : 発表タイトル・論文名・特許名等（文字列）
     organization: 学会名・機関名・財団名等
     dateLocation: 発表日時・場所を自由書式で記述（例: "2023年10月 / 仙台"）
     year        : 西暦年（数値）。タイムラインのグループ化と降順ソートに使用
     description : 共著者情報・補足説明・受賞コメント等
     url         : 論文・PDFへのリンクURL。なければ null を指定
     highlight   : true にすると Best Paper Award などを金色ボーダーで強調表示
   ---------------------------------------------------------------- */
const ACHIEVEMENTS = [

  /* ---- 2025年 ---- */

  {
    /* Journal of Robotics and Mechatronics（JRM）掲載の査読付きジャーナル論文。
       学生時代の研究の集大成にあたる論文誌成果のため highlight: true で強調表示する。 */
    category:     'Journal',
    title:        'Inducibility—Quantitative Measure of Interaction Between Pedestrians—',
    organization: 'Journal of Robotics and Mechatronics（JRM）Vol.37 No.6, pp.1477–1487',
    dateLocation: '2025年12月 / オープンアクセス',
    year:         2025,
    description:  '「可誘導性（inducibility）」＝ある人の行動が周囲の人の行動へ'
                + 'どの程度影響を与えるかを表す新しい定量指標を提案した論文。'
                + '意思決定の感度に基づく指標と、相互行動を表す状態空間モデルの'
                + '可制御性グラミアンに基づく指標の2種類を導出し、'
                + '実際の歩行者観測データから構築した数理モデルで分析した。'
                + '自律移動ロボット（AMR）の行動設計・評価への応用を目指す。'
                + '共著: H. Okuda（奥田裕之 教授）, T. Suzuki（鈴木達也 教授）。',
    url:          'https://doi.org/10.20965/jrm.2025.p1477',
    highlight:    true   /* 金色ボーダーで強調表示 */
  },

  /* ---- 2024年 ---- */

  {
    /* SSI2024 Best Paper Award（受賞そのものの記録）。
       最も重要な実績のため highlight: true を設定。
       同じ研究の「発表」は直後の Conference エントリに分けて記載する。 */
    category:     'Award',
    title:        'SSI2024 Best Paper Award 受賞',
    organization: 'SSI2024（計測自動制御学会 システム・情報部門学術講演会）',
    dateLocation: '2024年11月',
    year:         2024,
    description:  '「可誘導性」を提案した研究発表に対して Best Paper Award を受賞。'
                + '移動ロボットによる歩行者誘導の評価指標を提案した点が高く評価された。'
                + '奥田裕之 教授・鈴木達也 教授との共同研究。',
    url:          null,
    highlight:    true   /* 金色ボーダーで強調表示 */
  },

  {
    /* SSI2024 での研究発表（上の Best Paper Award の対象となった発表）。
       受賞と発表は性質が異なるため、カテゴリを分けて別エントリで記載する。 */
    category:     'Conference',
    title:        '可誘導性：歩行者間インタラクションにおける判断感度と可制御性に基づいた評価',
    organization: 'SSI2024（計測自動制御学会 システム・情報部門学術講演会）',
    dateLocation: '2024年11月',
    year:         2024,
    description:  '移動ロボットによる歩行者誘導の評価指標「可誘導性」を提案した研究発表。'
                + 'この発表が Best Paper Award を受賞した。'
                + '奥田裕之 教授・鈴木達也 教授との共同研究。',
    url:          null,
    highlight:    false
  },

  {
    /* ROBOMEC 2024（ロボティクス・メカトロニクス講演会 2024、栃木・宇都宮開催）。
       以前は誤って「自動制御連合講演会」と記載していたため ROBOMEC に修正。 */
    category:     'Conference',
    title:        '移動ロボットと歩行者のインタラクションに関する研究発表',
    organization: 'ロボティクス・メカトロニクス講演会 2024（ROBOMEC 2024）',
    dateLocation: '2024年 / 栃木（宇都宮）',
    year:         2024,
    description:  '移動ロボットと歩行者のインタラクションに関する研究を発表。'
                + '奥田裕之 教授・鈴木達也 教授との共同研究。',
    url:          null,
    highlight:    false
  },

  {
    /* 自動車技術会（JSAE）春季大会 学生ポスターセッション（パシフィコ横浜）。
       2024年に学生として登壇し、ポスター発表を行った。 */
    category:     'Conference',
    title:        '自動車技術会 春季大会 学生ポスターセッション 発表',
    organization: '自動車技術会（JSAE）2024年春季大会 学生ポスターセッション',
    dateLocation: '2024年 / パシフィコ横浜（横浜）',
    year:         2024,
    description:  '自動車技術会の春季大会 学生ポスターセッションに登壇し、'
                + '研究成果をポスター形式で発表した。',
    url:          null,
    highlight:    false
  },

  {
    /* 特許出願：具体的な出願日が非公開のため year は 2024 を設定 */
    category:     'Patent',
    title:        '周囲の人を所望の行動に誘導する手法',
    organization: '特許出願中',
    dateLocation: '出願中',
    year:         2024,
    description:  '移動ロボットを用いて周囲の歩行者を特定の行動へ自然に誘導する'
                + '技術に関する特許。奥田裕之 教授・鈴木達也 教授との共同出願。',
    url:          null,
    highlight:    false
  },

  {
    /* バロック村井宏之財団 研究助成採択 */
    category:     'Grant',
    title:        'バロック村井宏之財団 研究助成 採択',
    organization: 'バロック村井宏之財団（Baroque Murai Hiroyuki Foundation）',
    dateLocation: '採択',
    year:         2024,
    description:  '移動ロボットと歩行者のインタラクション研究に対する'
                + '研究費助成を獲得。研究の継続と発展を支援していただく。',
    url:          null,
    highlight:    false
  },

  /* ---- 2023年 ---- */

  {
    /* SII 2025（IEEE/SICE International Symposium on System Integration）
       IEEE Xplore より正式掲載。ICINCO 2023 の研究を SII でも発表。 */
    category:     'Conference',
    title:        'Evaluation of Controllability of Interaction Between Pedestrian and Autonomous Mobile Robot in Shared Mobility Space',
    organization: 'IEEE/SICE International Symposium on System Integration（SII 2025）',
    dateLocation: '2025年1月',
    year:         2025,
    description:  'IEEE Xplore に掲載（DOI: 10.1109/SII58957.2025.10870962）。'
                + '共著: M. Aoki, K. Kuroda, H. Okuda, T. Suzuki。',
    url:          'https://ieeexplore.ieee.org/abstract/document/10870962',
    highlight:    false
  },

  {
    /* ICINCO 2023（第20回 情報・制御・自動化・ロボティクス国際会議）
       SciTePress より出版済み。SII とは別エントリとして独立して記載。 */
    category:     'Conference',
    title:        'Evaluation of Controllability of Interaction Between Pedestrian and Autonomous Mobile Robot in Shared Mobility Space',
    organization: 'ICINCO 2023（20th International Conference on Informatics in Control, Automation and Robotics）',
    dateLocation: '2023年11月',
    year:         2023,
    description:  'SciTePress より出版（ISBN 978-989-758-670-5, DOI: 10.5220/0012177500003543, pages 249–257）。'
                + '共著: M. Aoki, K. Kuroda, H. Okuda, T. Suzuki。',
    url:          'https://www.scitepress.org/PublicationsDetail.aspx?ID=Ckw2a6TyDkg=&t=1',
    highlight:    false
  },

  {
    /* 第66回自動制御連合講演会（仙台）：J-STAGE 査読付き論文として掲載済み */
    category:     'Conference',
    title:        '共有移動空間における移動ロボットによる歩行者行動の可制御性評価',
    organization: '第66回自動制御連合講演会',
    dateLocation: '2023年10月 / 仙台',
    year:         2023,
    description:  '青木瑞穂・奥田裕之 教授・鈴木達也 教授との共同研究。'
                + '査読付き論文として J-STAGE に掲載。',
    url:          'https://www.jstage.jst.go.jp/article/jacc/66/0/66_1095/_article/-char/ja/',
    highlight:    false
  },

  {
    /* ROBOMEC 2023（名古屋）：国内主要ロボット工学系学会 */
    category:     'Conference',
    title:        '人と移動ロボットのすれ違いにおける歩行者の意図推定モデルの構築',
    organization: 'ロボティクス・メカトロニクス 講演会 2023（ROBOMEC 2023）',
    dateLocation: '2023年6月 / 名古屋',
    year:         2023,
    description:  '青木瑞穂・黒田和秀・奥田裕之 教授・鈴木達也 教授との共同研究。'
                + '移動ロボットとすれ違う際の歩行者行動をベイズ推定でモデル化。',
    url:          null,
    highlight:    false
  }

];


/* ================================================================
   3. フィルタボタンの生成
   CATEGORIES の定義から動的にボタンを生成する。
   「すべて」ボタンを先頭に追加し、各カテゴリのボタンが続く。
   ================================================================ */

/**
 * フィルタUIを生成して #achievement-filter に挿入する。
 * ボタンのクリックイベントを登録し、クリック時に renderAchievements() を呼ぶ。
 */
function initFilters() {
  const container = document.getElementById('achievement-filter');
  if (!container) return; /* HTML側に <div id="achievement-filter"> がない場合は何もしない */

  /* 「すべて」ボタン＋各カテゴリボタンのリストを作成 */
  const filters = [
    { key: 'All', label: 'すべて', count: ACHIEVEMENTS.length }
  ];
  Object.entries(CATEGORIES).forEach(function ([key, cat]) {
    /* 各カテゴリの件数を集計してボタンラベルに表示する */
    const count = ACHIEVEMENTS.filter(function (a) { return a.category === key; }).length;
    if (count > 0) {
      filters.push({ key: key, label: cat.label, count: count });
    }
  });

  /* ボタンHTMLを組み立てる */
  let html = '<div class="filter-bar">';
  filters.forEach(function (f) {
    /* 初期状態では「すべて」がアクティブ */
    const isActive = f.key === 'All' ? ' is-active' : '';
    html += '<button'
          + ' class="filter-btn' + isActive + '"'
          + ' data-filter="' + f.key + '"'
          + '>'
          + f.label
          + ' <span class="filter-count">' + f.count + '</span>'
          + '</button>';
  });
  html += '</div>';

  container.innerHTML = html;

  /* クリックイベントをフィルタバー全体に委譲（Event Delegation）
     個々のボタンではなく親要素にイベントを1つだけ登録するため、
     ボタンが動的に増えても対応しやすい */
  container.addEventListener('click', function (e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    /* アクティブクラスの付け替え */
    container.querySelectorAll('.filter-btn').forEach(function (b) {
      b.classList.remove('is-active');
    });
    btn.classList.add('is-active');

    /* 選択されたカテゴリで再描画 */
    renderAchievements(btn.dataset.filter);
  });
}


/* ================================================================
   4. 実績タイムラインの描画
   ACHIEVEMENTS をフィルタリングし、年度ごとにグループ化して
   タイムライン形式のHTMLを生成する。
   ================================================================ */

/**
 * 実績タイムラインを #achievement-list に描画する。
 *
 * @param {string} filter - "All" または CATEGORIES のキー（例: "Award"）
 */
function renderAchievements(filter) {
  const container = document.getElementById('achievement-list');
  if (!container) return;

  /* ---------- フィルタリング ---------- */
  const filtered = (filter === 'All')
    ? ACHIEVEMENTS.slice() /* 全件コピー */
    : ACHIEVEMENTS.filter(function (a) { return a.category === filter; });

  /* 結果が0件のときは案内メッセージを表示 */
  if (filtered.length === 0) {
    container.innerHTML = '<p class="no-results">該当する実績はありません。</p>';
    return;
  }

  /* ---------- 年度でグループ化（降順ソート） ---------- */
  /* year をキーにしたオブジェクトを作り、各年の配列に実績を格納する */
  const byYear = {};
  filtered.forEach(function (item) {
    if (!byYear[item.year]) byYear[item.year] = [];
    byYear[item.year].push(item);
  });

  /* 年度のリストを降順（新しい年が先）にソート */
  const years = Object.keys(byYear).map(Number).sort(function (a, b) { return b - a; });

  /* ---------- HTML生成 ---------- */
  let html = '<div class="timeline">';

  years.forEach(function (year) {
    /* 年度ラベル */
    html += '<div class="timeline-year"><span>' + year + '</span></div>';

    /* その年の全実績カードを順番に生成 */
    byYear[year].forEach(function (item) {
      const cat           = CATEGORIES[item.category];
      const highlightClass = item.highlight ? ' is-highlight' : '';

      /* 論文URLが設定されている場合のみリンクボタンを表示 */
      const linkHtml = item.url
        ? '<a href="' + escapeHtml(item.url) + '"'
          + ' target="_blank" rel="noopener noreferrer"'
          + ' class="achievement-link">論文・詳細を見る →</a>'
        : '';

      html +=
        '<div class="timeline-item' + highlightClass + '" data-category="' + item.category + '">'
      + '  <div class="timeline-dot" style="background:' + cat.bg + ';box-shadow:0 0 0 4px ' + cat.bg + '33"></div>'
      + '  <div class="achievement-card">'
      + '    <div class="achievement-header">'
      + '      <span class="achievement-badge" style="background:' + cat.bg + ';color:' + cat.text + '">'
      + '        ' + cat.icon + ' ' + cat.label
      + '      </span>'
      + '      <span class="achievement-org">' + escapeHtml(item.organization) + '</span>'
      + '    </div>'
      + '    <h3 class="achievement-title">' + escapeHtml(item.title) + '</h3>'
      + '    <p class="achievement-date">📅 ' + escapeHtml(item.dateLocation) + '</p>'
      + '    <p class="achievement-desc">' + escapeHtml(item.description) + '</p>'
      + '    ' + linkHtml
      + '  </div>'
      + '</div>';
    });
  });

  html += '</div>'; /* .timeline */
  container.innerHTML = html;

  /* ---------- 入場アニメーション ---------- */
  /* setTimeout(0) で描画後に is-visible を付与し、CSSトランジションを起動する
     各カードを 80ms ずつ遅らせてスタッガード（段階的）アニメーションにする */
  const items = container.querySelectorAll('.timeline-item');
  items.forEach(function (el, i) {
    setTimeout(function () {
      el.classList.add('is-visible');
    }, i * 80);
  });
}


/* ================================================================
   5. ユーティリティ
   ================================================================ */

/**
 * XSS対策：データを安全にHTMLに埋め込むためのエスケープ関数。
 * ACHIEVEMENTS のデータは信頼できる静的データだが、
 * 将来的にユーザー入力を扱う可能性に備えて使用する。
 *
 * @param {string} str - エスケープする文字列
 * @returns {string} HTML安全な文字列
 */
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}


/* ================================================================
   6. 初期化
   DOMの構築が完了してからフィルタと実績リストを初期描画する。
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {
  initFilters();           /* フィルタボタンを生成 */
  renderAchievements('All'); /* 全件を初期表示 */
});
