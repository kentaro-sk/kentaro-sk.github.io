(() => {
  const NS = 'http://www.w3.org/2000/svg';
  // ICONS: 各セクション（教育・人材・産業・収益・まちづくり）を表す簡易アイコンのSVGパスデータ。
  // KEYSの順番でノードに割り当てる(項目数がKEYS.lengthを超える場合は先頭から繰り返す)。
  const ICONS = {
    edu: 'M3 8.5 12 4.5l9 4-9 4-9-4Z M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11',
    people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5 M17 8.5a2.4 2.4 0 1 0 0-4.8 M16.5 13.6c2.3.3 4 2.2 4 4.6',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6',
    coin: 'M12 20.5c4.7 0 8.5-3.8 8.5-8.5S16.7 3.5 12 3.5 3.5 7.3 3.5 12s3.8 8.5 8.5 8.5Z M12 7v10 M14.6 9.2c-.6-.8-1.6-1.2-2.6-1.2-1.5 0-2.6.8-2.6 2s1.1 1.8 2.6 2 2.7.7 2.7 2-1.2 2-2.7 2c-1.1 0-2.1-.4-2.7-1.2',
    city: 'M4 20V9l2 1.5V7l2.5 1.5V6l3.5 2 3.5-2v2.5L18 7v3.5L20 9v11Z M10.5 20v-4h3v4'
  };
  const KEYS = ['edu', 'people', 'gear', 'coin', 'city'];

  // <flow-cycle>: 中心のテーマから放射状に伸びる複数の項目を円環状に配置し、
  // 円周を1周する進行ドットで「循環している」ことを表現するSVGアニメーションのWeb Component。
  // 「地域創生」ページ等で、教育→人材→産業→収益→まちづくりの循環図として使用している。
  class FlowCycle extends HTMLElement {
    connectedCallback() {
      if (this.__b) return;
      this.__b = true;
      // items: "ラベル|英語ラベル" のカンマ区切り文字列を分解した2次元配列。
      // 属性未指定時は「地域創生」文脈のデフォルト5項目を使う。
      const items = (this.getAttribute('items') || '教育|EDUCATION,人材|TALENT,産業|INDUSTRY,収益|REVENUE,まちづくり|URBAN')
        .split(',').map(s => s.split('|'));
      const accent = this.getAttribute('accent') || '#3B82C4';
      const ink = this.getAttribute('ink') || '#151515';
      const n = items.length;
      // CX/CY: 円環の中心座標、RAD: 項目ノードを配置する円の半径(viewBox基準の座標系)。
      const CX = 260, CY = 250, RAD = 155;

      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 520 500');
      svg.setAttribute('width', '100%');
      svg.style.cssText = 'display:block;overflow:visible;font-family:"IBM Plex Mono",ui-monospace,monospace';

      // mk: SVG要素を1つ生成し、属性をまとめて設定してparent(省略時はsvgルート)に追加する
      // ヘルパー。以降の要素生成をすべてこの関数経由で行い、記述量を減らしている。
      const mk = (tag, attrs, parent) => {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        (parent || svg).appendChild(e);
        return e;
      };

      // 背景の目盛り的な円(外周の薄い実線、内側の点線)を先に描画しておく。
      mk('circle', { cx: CX, cy: CY, r: RAD, fill: 'none', stroke: ink, 'stroke-opacity': .13, 'stroke-width': 1 });
      mk('circle', { cx: CX, cy: CY, r: RAD - 34, fill: 'none', stroke: ink, 'stroke-opacity': .06, 'stroke-width': 1, 'stroke-dasharray': '2 6' });

      // arc: 進行状況を示す円弧。stroke-dasharrayで全周の12%分だけ線を描画し、
      // stroke-dashoffset(step関数内で更新)をずらすことで、その短い弧が周回しているように見せる。
      const arc = mk('circle', {
        cx: CX, cy: CY, r: RAD, fill: 'none', stroke: accent, 'stroke-width': 2.4,
        'stroke-linecap': 'round', 'stroke-dasharray': `${2 * Math.PI * RAD * .12} ${2 * Math.PI * RAD}`,
        transform: `rotate(-90 ${CX} ${CY})`, opacity: .85
      });

      // core: 中心の円とテキスト(中心テーマ名・英語サブタイトル)。coreRingは
      // step内でわずかに半径を脈動させ(呼吸するような)演出に使う。
      const core = mk('g', {});
      mk('circle', { cx: CX, cy: CY, r: 54, fill: '#FFFDF5', stroke: accent, 'stroke-opacity': .3 }, core);
      const coreRing = mk('circle', { cx: CX, cy: CY, r: 62, fill: 'none', stroke: accent, 'stroke-opacity': .3, 'stroke-width': 1 }, core);
      const t1 = mk('text', { x: CX, y: CY - 4, 'text-anchor': 'middle', fill: ink, 'font-size': 19, 'font-family': "'Avenir Next','Avenir','Nunito Sans','Zen Kaku Gothic Antique','Zen Kaku Gothic New',sans-serif", 'font-weight': 500, 'letter-spacing': '.08em' }, core);
      t1.textContent = this.getAttribute('center') || '地域創生';
      const t2 = mk('text', { x: CX, y: CY + 17, 'text-anchor': 'middle', fill: ink, 'fill-opacity': .48, 'font-size': 8.5, 'letter-spacing': '.16em' }, core);
      t2.textContent = this.getAttribute('center-en') || 'REGIONAL REVITALIZATION';

      // 項目数nに応じて円周上に等間隔(2π/n)の角度でノードを配置していく。
      // -Math.PI/2の補正で、先頭項目(i=0)が円の真上（12時の位置）から始まるようにしている。
      const nodes = items.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = CX + Math.cos(a) * RAD, y = CY + Math.sin(a) * RAD;
        const g = mk('g', {});
        // halo: 進行ドットがこのノードに近づいたときにふわっと光らせる背景円(opacityはstep内で制御)。
        const halo = mk('circle', { cx: x, cy: y, r: 34, fill: accent, opacity: 0 }, g);
        mk('circle', { cx: x, cy: y, r: 27, fill: '#FFFDF5', stroke: ink, 'stroke-opacity': .16 }, g);
        // disc: ノード円のアクセント縁取り。fill/strokeの不透明度をstep内でハイライト時に強調する。
        const disc = mk('circle', { cx: x, cy: y, r: 27, fill: accent, 'fill-opacity': 0, stroke: accent, 'stroke-opacity': 0, 'stroke-width': 1.6 }, g);
        const ic = mk('g', { transform: `translate(${x - 11} ${y - 11}) scale(.92)`, fill: 'none', stroke: accent, 'stroke-width': 1.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        mk('path', { d: ICONS[KEYS[i % KEYS.length]] }, ic);
        // ラベルはノードよりさらに外側(RAD+56)に配置し、円の左右どちらにあるかで
        // テキストの基準位置(text-anchor)を切り替えて中心から見て自然な向きに揃える。
        const lx = CX + Math.cos(a) * (RAD + 56), ly = CY + Math.sin(a) * (RAD + 56);
        const anchor = Math.abs(Math.cos(a)) < .35 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
        const lab = mk('text', { x: lx, y: ly, 'text-anchor': anchor, fill: ink, 'font-size': 14, 'font-weight': 700, 'font-family': '"Zen Kaku Gothic New",system-ui,sans-serif' }, g);
        lab.textContent = it[0];
        const sub = mk('text', { x: lx, y: ly + 14, 'text-anchor': anchor, fill: ink, 'fill-opacity': .45, 'font-size': 8.5, 'letter-spacing': '.14em' }, g);
        sub.textContent = it[1] || '';
        return { x, y, halo, disc, ic, lab, a };
      });

      // dot: 円周上を実際に進行するドット本体(内側の小さい円＋外側のうっすら光る円)。
      const dot = mk('g', {});
      mk('circle', { r: 13, fill: accent, opacity: .18 }, dot);
      mk('circle', { r: 5.5, fill: accent }, dot);

      this.appendChild(svg);

      // C: 円周の全長(1周分のstroke-dasharray/offset計算に使う)。
      // p: 0〜1で表した進行度(1周を1とする)。runがfalseの間は進行を止める(画面外や視差軽減設定時)。
      const C = 2 * Math.PI * RAD;
      let p = 0, last = performance.now(), run = false;
      const step = now => {
        if (!this.isConnected) return;
        // dtは前フレームからの経過秒数。タブ切り替え等で極端に空いた場合に備え、
        // 最大50ms分(.05秒)にクランプして一気に進みすぎないようにする。
        const dt = Math.min((now - last) / 1000, .05);
        last = now;
        if (run) {
          // 1周を約11.8秒(0.085/秒)で進む速度。%1で0〜1の範囲に折り返す。
          p = (p + dt * .085) % 1;
          const a = p * Math.PI * 2 - Math.PI / 2;
          dot.setAttribute('transform', `translate(${CX + Math.cos(a) * RAD} ${CY + Math.sin(a) * RAD})`);
          arc.setAttribute('stroke-dashoffset', String(-C * p));
          // 中心の円をゆっくり脈動させる(sinの周期700msで±3pxの半径変化)。
          coreRing.setAttribute('r', String(62 + Math.sin(now / 700) * 3));
          nodes.forEach((nd, i) => {
            // 現在の進行度pと各ノードの角度位置(i/n)との円環上の最短距離dを求め、
            // ドットがノードに近いほど強く光る(k)ようにハイライトの強さを計算する。
            let d = Math.abs(p - i / n);
            d = Math.min(d, 1 - d);
            const k = Math.max(0, 1 - d * n * 1.7);
            nd.halo.setAttribute('opacity', String(k * .12));
            nd.disc.setAttribute('fill-opacity', String(k * .12));
            nd.disc.setAttribute('stroke-opacity', String(.15 + k * .85));
            nd.lab.setAttribute('fill-opacity', String(.55 + k * .45));
          });
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);

      // 要素が画面内に見えている間だけ進行させる(見えていないときはrun=falseで停止し、
      // last=performance.now()で経過時間をリセットして再表示時に一気に進むのを防ぐ)。
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(es => es.forEach(e => { run = e.isIntersecting; last = performance.now(); }), { threshold: .05 }).observe(this);
      } else run = true;
      // OSの「視差効果を減らす」設定が有効な場合はアニメーションを開始しない。
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) run = false;
    }
  }

  // 既に定義済み(二重読み込み等)でなければカスタム要素として登録する。
  if (!customElements.get('flow-cycle')) customElements.define('flow-cycle', FlowCycle);
})();
