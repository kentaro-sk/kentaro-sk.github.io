(() => {
  const TAU = Math.PI * 2;

  // <particle-field>: Canvas上に大量の点(パーティクル)を描画し、球体・波・文字などの
  // 図形の間をなめらかに変形させながらループするWeb Component。
  // トップページの背景演出（HOME画面の各セクションに対応した図形を表示する）に使用している。
  class ParticleField extends HTMLElement {
    // 要素がDOMに接続されたタイミングで呼ばれるカスタム要素のライフサイクルフック。
    // canvasの生成・属性の読み取り・各種イベントリスナー登録・初回描画までを行う。
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      this.style.display = 'block';
      this.style.position = this.style.position || 'relative';
      if (!this.style.width) this.style.width = '100%';
      if (!this.style.height) this.style.height = '100%';
      const c = (this.canvas = document.createElement('canvas'));
      c.style.cssText = 'display:block;width:100%;height:100%';
      this.appendChild(c);
      this.ctx = c.getContext('2d');
      // count: パーティクルの総数（デフォルト2000個）。多いほど密度の高い図形になる。
      this.count = +(this.getAttribute('count') || 2000);
      // color: 通常パーティクルの色、accent: 一部（19個に1個）のパーティクルに使う強調色。
      this.color = this.getAttribute('color') || '#151515';
      this.accent = this.getAttribute('accent') || '#3B82C4';
      // dot: パーティクル1粒の基準半径、scale: 図形全体のサイズ倍率。
      this.dot = +(this.getAttribute('dot') || 1.1);
      this.scale = +(this.getAttribute('scale') || 0.78);
      this.font = this.getAttribute('font') || "'Zen Kaku Gothic New', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', system-ui, sans-serif";
      // shapes: カンマ区切りで指定された図形名のリスト。hold(ミリ秒)ごとに順番に切り替わる。
      // 例: "sphere,問,wave" なら 球体→「問」の文字→波 の順にループする。
      this.shapes = (this.getAttribute('shapes') || 'sphere,問,wave').split(',').map(s => s.trim());
      this.hold = +(this.getAttribute('hold') || 5000);
      this.si = 0;
      // sd(scroll-driven): trueの場合、固定のshapesではなく、画面内に見えているセクションの
      // data-particle属性に応じて表示図形を動的に切り替える（syncSection参照）。
      this.sd = this.hasAttribute('data-scroll-driven') || this.hasAttribute('scroll-driven') || this.hasAttribute('scrolldriven');
      // cache: 同じ図形・同じサイズ・同じ粒数の組み合わせで生成した座標配列を使い回すためのキャッシュ。
      // リサイズやセクション切り替えのたびに座標計算をやり直すコストを避けるために使う。
      this.cache = new Map();
      // sd(スクロール連動)の場合は最初はフェードイン前提でalpha=0からスタートする。
      this.alpha = this.sd ? 0 : 1;
      this.targetAlpha = 1;
      this.last = performance.now();
      this.angle = 0;
      // OSの「視差効果を減らす」設定が有効な場合はshapeの自動回転を止める（tick内で参照）。
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // マウス座標。画面外にあるときは-9999にしておき、反発計算(tick内)が効かないようにする。
      this.mx = this.my = -9999;
      this.p = null;
      // pointermove: マウス/タッチ位置を要素相対座標に変換して保持する。
      // 少し外側(90px)までは範囲内として許容し、要素の境界ぎりぎりでも反発が自然に見えるようにする。
      this.onMove = e => {
        const r = this.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top, m = 90;
        if (x < -m || y < -m || x > r.width + m || y > r.height + m) { this.mx = this.my = -9999; return; }
        this.mx = x; this.my = y;
      };
      // ウィンドウがフォーカスを失ったら、カーソル位置が不明になるため反発対象を無効化する。
      this.onLeave = () => { this.mx = this.my = -9999; };
      window.addEventListener('pointermove', this.onMove, { passive: true });
      window.addEventListener('blur', this.onLeave);
      // 要素のサイズが変わったらcanvasの解像度と図形の座標を再計算する。
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this);
      this.vis = true;
      // 画面外にあるときはtick内の描画処理をスキップして負荷を抑える(rootMarginで少し手前から判定)。
      this.io = new IntersectionObserver(es => { this.vis = es[0].isIntersecting; }, { rootMargin: '150px' });
      this.io.observe(this);
      this.resize();
      // Webフォントの読み込みが終わってから文字図形(sampleText)を生成しないと、
      // フォールバックフォントの形状で焼き付いてしまうため、fonts.readyを待つ。
      const ready = document.fonts ? document.fonts.ready : Promise.resolve();
      ready.then(() => { this.build(); });
      this.tick = this.tick.bind(this);
      this.raf = requestAnimationFrame(this.tick);
    }

    // 要素がDOMから削除されたときのクリーンアップ。アニメーションループとイベント
    // リスナー・Observerを確実に解除し、メモリリークやゾンビ処理を防ぐ。
    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('blur', this.onLeave);
    }

    // 要素のサイズに合わせてcanvasの実ピクセルサイズを設定し直す。
    // devicePixelRatioは1.5を上限にし、高精細ディスプレイでの過度な負荷増を防ぐ。
    resize() {
      const r = this.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const d = Math.min(window.devicePixelRatio || 1, 1.5);
      this.w = r.width; this.h = r.height;
      this.canvas.width = Math.round(r.width * d);
      this.canvas.height = Math.round(r.height * d);
      this.ctx.setTransform(d, 0, 0, d, 0, 0);
      this.build();
    }

    // パーティクル本体(位置・速度係数などの状態)と、現在指定されているshapes分の
    // 目標座標データ(this.data)を構築する。パーティクル数が変わった場合のみ配列を作り直す。
    build() {
      if (!this.w) return;
      const n = this.count;
      if (!this.p || this.p.length !== n) {
        this.p = [];
        for (let i = 0; i < n; i++) {
          this.p.push({
            x: this.w / 2 + (Math.random() - 0.5) * this.w,
            y: this.h / 2 + (Math.random() - 0.5) * this.h,
            // k: 目標座標への追従速度係数。粒ごとにばらつかせることで一斉に動かず自然に見せる。
            k: 0.55 + Math.random() * 0.9,
            // ph/am: tick内のsin波の位相・振幅。粒ごとの微小な浮遊アニメーション用。
            ph: Math.random() * TAU,
            am: 0.4 + Math.random() * 1.1,
            // ac(accent): 19個に1個だけaccent色で描画する強調パーティクルかどうか。
            ac: i % 19 === 0
          });
        }
      }
      this.data = this.shapes.map(s => this.makeShape(s, n));
    }

    // 図形名ごとの座標データをキャッシュ経由で取得する。同一の図形・サイズ・粒数であれば
    // 再計算せずキャッシュを返し、リサイズ時などの計算コストを抑える。
    makeShape(name, n) {
      const key = name + '|' + Math.round(this.w) + 'x' + Math.round(this.h) + '|' + n;
      if (this.cache && this.cache.has(key)) return this.cache.get(key);
      const s = this.buildShape(name, n);
      if (this.cache) this.cache.set(key, s);
      return s;
    }

    // 図形名に応じて、各パーティクルの目標座標(3次元、-1〜1程度の正規化座標)を計算する。
    // "sphere"/"wave"/"ring"/"globe"/"city" はあらかじめ決めた数式で座標を生成し、
    // それ以外の文字列は文字（テキスト）として扱いsampleText()で形状をサンプリングする。
    // 先頭が"~"の場合はモード'land'（海と陸地を判定するテキスト形状、地図的な表現用）。
    buildShape(name, n) {
      const R = Math.min(this.w, this.h) * 0.5 * this.scale;
      if (name === 'sphere') {
        // フィボナッチ球（黄金角を使った均等分布）で球面上に点を配置する。
        const a = new Float32Array(n * 3);
        const g = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < n; i++) {
          const y = 1 - (i / (n - 1)) * 2;
          const r = Math.sqrt(Math.max(0, 1 - y * y));
          const th = g * i;
          a[i * 3] = Math.cos(th) * r; a[i * 3 + 1] = y; a[i * 3 + 2] = Math.sin(th) * r;
        }
        return { type: 'sphere', a, R };
      }
      if (name === 'wave') {
        // グリッド状に並べた点をsin/cosの合成波でZ方向にずらし、波面のような形状を作る。
        const a = new Float32Array(n * 3);
        const cols = Math.round(Math.sqrt(n * 1.7)), rows = Math.ceil(n / cols);
        for (let i = 0; i < n; i++) {
          const cx = (i % cols) / (cols - 1) - 0.5, cy = Math.floor(i / cols) / (rows - 1) - 0.5;
          a[i * 3] = cx * 2; a[i * 3 + 1] = cy * 1.1; a[i * 3 + 2] = Math.sin(cx * 6.5) * 0.42 + Math.cos(cy * 5.5) * 0.28;
        }
        return { type: 'wave', a, R };
      }
      if (name === 'ring') {
        // 3周分の螺旋状の環（リング）を描く座標を計算する。
        const a = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          const t = (i / n) * TAU * 3, u = Math.floor(i / (n / 3)) * 0.9;
          a[i * 3] = Math.cos(t) * (0.7 + u * 0.12);
          a[i * 3 + 1] = Math.sin(t) * (0.7 + u * 0.12) * 0.35;
          a[i * 3 + 2] = Math.sin(t * 1.5) * 0.5;
        }
        return { type: 'ring', a, R };
      }
      if (name === 'globe') {
        // 緯線（偶数インデックス）と経線（奇数インデックス）を交互に配置し、地球儀のような
        // ワイヤーフレーム風の球体を表現する。
        const a = new Float32Array(n * 3);
        const lats = [-0.78, -0.55, -0.3, 0, 0.3, 0.55, 0.78], M = 12;
        for (let i = 0; i < n; i++) {
          let x, y, z;
          if (i % 2 === 0) {
            const l = lats[((i / 2) | 0) % lats.length], rr = Math.sqrt(1 - l * l), th = Math.random() * TAU;
            x = Math.cos(th) * rr; y = l; z = Math.sin(th) * rr;
          } else {
            const ph = ((((i - 1) / 2) | 0) % M) / M * Math.PI, t = Math.random() * TAU;
            x = Math.cos(t) * Math.cos(ph); y = Math.sin(t); z = Math.cos(t) * Math.sin(ph);
          }
          a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
        }
        return { type: 'globe', a, R: R * 0.6 };
      }
      if (name === 'city') {
        // B: 都市のビル群を模したブロック定義[開始x, 終了x, 高さ]の配列。
        // 各ブロックの面積(幅×高さ)に比例した確率で点を配置し、ビル街のシルエットを作る。
        const a = new Float32Array(n * 3);
        const B = [[-0.95,-0.72,0.55],[-0.70,-0.52,0.86],[-0.50,-0.31,0.42],[-0.29,-0.10,1.06],[-0.08,0.09,0.62],[0.11,0.31,0.92],[0.33,0.51,0.48],[0.53,0.75,0.74],[0.77,0.96,0.34]];
        let tot = 0; for (const b of B) tot += (b[1] - b[0]) * b[2];
        for (let i = 0; i < n; i++) {
          // 累積分布に対する乱数サンプリング（面積が大きいブロックほど選ばれやすい）。
          let r = Math.random() * tot, k = 0;
          for (; k < B.length - 1; k++) { r -= (B[k][1] - B[k][0]) * B[k][2]; if (r <= 0) break; }
          const b = B[k];
          a[i * 3] = b[0] + Math.random() * (b[1] - b[0]);
          a[i * 3 + 1] = 0.6 - Math.random() * b[2];
          a[i * 3 + 2] = (Math.random() - 0.5) * 0.22;
        }
        return { type: 'flat', a, R };
      }
      if (name.charAt(0) === '~') return this.sampleText(name.slice(1), n, R, 'land');
      return this.sampleText(name, n, R);
    }

    // 文字列(絵文字含む)をcanvasに描画し、そのピクセルを走査して文字の形をした
    // パーティクル配置を作る。mode==='land'のときは緑がかったピクセル(海など)を除外し、
    // 陸地部分だけを対象にすることで地図的な表現(~globe等)に対応する。
    sampleText(str, n, R, mode) {
      const S = 240;
      const cv = document.createElement('canvas');
      cv.width = S; cv.height = S;
      const g = cv.getContext('2d');
      g.clearRect(0, 0, S, S);
      g.fillStyle = '#000';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      let size = S * 0.86;
      g.font = `700 ${size}px ${this.font}`;
      // 文字幅がcanvas幅をはみ出す場合はフォントサイズを縮小して収める。
      const m = g.measureText(str).width;
      if (m > S * 0.92) { size = size * (S * 0.92) / m; g.font = `700 ${size}px ${this.font}`; }
      g.fillText(str, S / 2, S / 2);
      let d;
      // getImageDataはCORS制約等で例外を投げることがあるため、失敗時は無難なsphereにフォールバックする。
      try { d = g.getImageData(0, 0, S, S).data; } catch (e) { return this.makeShape('sphere', n); }
      // 処理負荷軽減のため、実際の解像度(S)の半分の粒度(G)でマスクを作る（2ピクセルおきにサンプリング）。
      const G = S / 2, mask = new Uint8Array(G * G);
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
        const i = ((y * 2) * S + x * 2) * 4;
        if (d[i + 3] < 128) continue;
        // land モードでは緑成分が赤成分より一定以上強いピクセル(海の水色など)を除外する。
        if (mode === 'land' && d[i + 2] - d[i + 1] > 12) continue;
        mask[y * G + x] = 1;
      }
      // pool: 文字の内部を含む全ピクセル、edge: 文字の輪郭(隣接ピクセルの少なくとも1つが
      // マスク外)にあたるピクセル。輪郭を優先的にサンプリングすることで文字の形が
      // くっきり見えるようにする(下のn個生成ループでuseEdgeとして参照)。
      const pool = [], edge = [];
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
        if (!mask[y * G + x]) continue;
        const px = (x / G - 0.5) * 2, py = (y / G - 0.5) * 2;
        pool.push(px, py);
        const on = x === 0 || y === 0 || x === G - 1 || y === G - 1 ||
          !mask[y * G + x - 1] || !mask[y * G + x + 1] || !mask[(y - 1) * G + x] || !mask[(y + 1) * G + x];
        if (on) edge.push(px, py);
      }
      // 文字が小さすぎてサンプル点が足りない場合もsphereにフォールバックする。
      if (pool.length < 200) return this.makeShape('sphere', n);
      const a = new Float32Array(n * 3);
      const cnt = pool.length / 2, ecnt = edge.length / 2;
      for (let i = 0; i < n; i++) {
        // 輪郭サンプルが十分にある場合は3個に2個の割合で輪郭を優先し、
        // 残りは内部からサンプリングして文字の面としての厚みも表現する。
        const useEdge = ecnt > 60 && i % 3 !== 2;
        const src = useEdge ? edge : pool, j = Math.floor(Math.random() * (useEdge ? ecnt : cnt));
        const jit = useEdge ? 0.008 : 0.014;
        a[i * 3] = src[j * 2] + (Math.random() - 0.5) * jit;
        a[i * 3 + 1] = src[j * 2 + 1] + (Math.random() - 0.5) * jit;
        a[i * 3 + 2] = (Math.random() - 0.5) * 0.16;
      }
      return { type: 'flat', a, R };
    }

    // scroll-driven指定時に、現在画面内で最も基準に近い位置にあるセクション(data-particle
    // 属性を持つ要素)を探し、そのセクション用の図形・不透明度に切り替える。
    syncSection(now) {
      const els = document.querySelectorAll('[data-particle]');
      if (!els.length) return;
      const vh = window.innerHeight;
      // 「画面上部からやや下(22%の高さ)」に最も近いセクションを、現在アクティブなセクション
      // とみなす。ビューポート内(12%〜88%)に一部でも見えていることを条件にする。
      let best = null, bd = 1e9;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < vh * 0.12 || r.top > vh * 0.88) return;
        const d = Math.abs(r.top - vh * 0.22);
        if (d < bd) { bd = d; best = el; }
      });
      if (!best) return;
      // data-particle-alphaで指定された不透明度をtargetAlphaに反映する。
      // 0.5超はそのまま、0.5以下はさらに0.8倍して控えめに表示する（背景に馴染ませるため）。
      const a0 = parseFloat(best.getAttribute('data-particle-alpha')) || 0.26;
      this.targetAlpha = a0 > 0.5 ? a0 : a0 * 0.8;
      const v = best.getAttribute('data-particle');
      // 直前と同じセクションなら図形の切り替え・再構築は行わない(無駄な再計算を避ける)。
      if (v === this.curKey) return;
      this.curKey = v;
      this.shapes = v.split(',').map(s => s.trim());
      this.si = 0; this.t0 = now; this.mt = 0;
      this.build();
    }

    // 毎フレーム呼ばれるメインループ。パーティクルの位置更新・図形の自動切り替え・
    // マウス反発・描画までをまとめて行う。requestAnimationFrameで自身を再スケジュールする。
    tick(now) {
      this.raf = requestAnimationFrame(this.tick);
      // 非表示（画面外）またはタブが非アクティブなときは描画をスキップし、
      // last/t0を更新して復帰後に経過時間が一気に加算されるのを防ぐ。
      if (!this.vis || document.hidden) { this.last = now; this.t0 = now; return; }
      // scroll-drivenの場合は160msおきにsyncSection()でアクティブなセクションを再判定する。
      if (this.sd && now - (this.lastSync || 0) > 160) { this.lastSync = now; this.syncSection(now); }
      if (!this.p || !this.data || !this.data.length) return;
      // alphaをtargetAlphaへ指数移動平均的に近づけ、不透明度の変化をなめらかにする。
      this.alpha += (this.targetAlpha - this.alpha) * 0.07;
      // フレーム間隔を28ms〜50msにクランプし、極端に短い/長いフレームでの
      // アニメーション速度のブレを抑える(dt<28msのフレームはスキップして間引く)。
      const dt = Math.min(50, now - this.last);
      if (dt < 28) return;
      this.last = now;
      // this.holdミリ秒経過したら次のshapeへ自動的に切り替える(reduced-motion時は切り替えない)。
      if (!this.reduced && this.data.length > 1 && now - (this.t0 || (this.t0 = now)) > this.hold) { this.t0 = now; this.mt = 0; this.si = (this.si + 1) % this.data.length; }
      this.mt = (this.mt || 0) + dt;
      const s = this.data[this.si];
      let ang;
      if (s.type === 'flat') {
        // flat(city/sampleText)図形は回転させず、代わりに登場時に緩やかな回り込み演出(pr)を
        // 加えつつ、常時ごくわずかに角度を揺らして静止しすぎないようにする。
        const pr = Math.min(1, this.mt / 2100);
        ang = (1 - Math.cos(Math.PI * pr)) / 2 * TAU + Math.sin(now * 0.00022) * 0.2;
      } else { this.angle += dt * 0.00042; ang = this.angle; }
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const cx = this.w / 2, cy = this.h / 2, R = s.R, t = now * 0.0009;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      ctx.beginPath();
      const acc = [];
      for (let i = 0; i < this.p.length; i++) {
        const p = this.p[i];
        // 目標座標(ax,ay,az)をY軸まわりに回転(rx,rz)させ、簡易的な透視投影(persp)で
        // 2次元のスクリーン座標(tx,ty)に変換する。
        const ax = s.a[i * 3], ay = s.a[i * 3 + 1], az = s.a[i * 3 + 2];
        const rx = ax * ca + az * sa, rz = az * ca - ax * sa;
        const persp = 1 / (1.9 - rz * 0.45);
        const tx = cx + rx * R * persp * 1.55;
        const ty = cy + ay * R * persp * 1.55 + Math.sin(t + p.ph) * p.am * 2.2;
        // 現在位置(p.x,p.y)を目標座標へ徐々に追従させる(kは粒ごとの追従速度係数)。
        // 一気に飛ばさずイージング的に動かすことで、図形の変形がなめらかに見える。
        p.x += (tx - p.x) * 0.045 * p.k;
        p.y += (ty - p.y) * 0.045 * p.k;
        // マウス位置との距離が近い(7000px^2未満、半径にして約84px)場合、
        // その粒をマウスから遠ざける方向に反発させる(fは距離に応じた反発の強さ)。
        const dx = p.x - this.mx, dy = p.y - this.my;
        const d2 = dx * dx + dy * dy;
        let px = p.x, py = p.y;
        if (d2 < 7000) { const f = (1 - d2 / 7000) * 26; const dd = Math.sqrt(d2) || 1; px += (dx / dd) * f; py += (dy / dd) * f; }
        const r = this.dot * (0.62 + persp * 0.62);
        // 強調パーティクル(ac)は別配列に集めて後段でaccent色でまとめて描画する。
        if (p.ac) { acc.push(px, py, r); continue; }
        ctx.moveTo(px + r, py);
        ctx.arc(px, py, r, 0, TAU);
      }
      // 通常パーティクルをまとめて1回のfill()で描画(パスをまとめることで描画コストを抑える)。
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.82 * this.alpha;
      ctx.fill();
      // 強調パーティクル(accent色、通常より大きい半径)を別パスとして重ねて描画する。
      ctx.beginPath();
      for (let i = 0; i < acc.length; i += 3) { ctx.moveTo(acc[i] + acc[i + 2] * 1.5, acc[i + 1]); ctx.arc(acc[i], acc[i + 1], acc[i + 2] * 1.5, 0, TAU); }
      ctx.fillStyle = this.accent;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  // 既に定義済み(二重読み込み等)でなければカスタム要素として登録する。
  if (!customElements.get('particle-field')) customElements.define('particle-field', ParticleField);
})();
