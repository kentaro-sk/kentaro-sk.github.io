(() => {
  const TAU = Math.PI * 2;

  class ParticleField extends HTMLElement {
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
      this.count = +(this.getAttribute('count') || 2000);
      this.color = this.getAttribute('color') || '#151515';
      this.accent = this.getAttribute('accent') || '#3B82C4';
      this.dot = +(this.getAttribute('dot') || 1.1);
      this.scale = +(this.getAttribute('scale') || 0.78);
      this.font = this.getAttribute('font') || "'Zen Kaku Gothic New', 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', system-ui, sans-serif";
      this.shapes = (this.getAttribute('shapes') || 'sphere,問,wave').split(',').map(s => s.trim());
      this.hold = +(this.getAttribute('hold') || 5000);
      this.si = 0;
      this.sd = this.hasAttribute('data-scroll-driven') || this.hasAttribute('scroll-driven') || this.hasAttribute('scrolldriven');
      this.cache = new Map();
      this.alpha = this.sd ? 0 : 1;
      this.targetAlpha = 1;
      this.last = performance.now();
      this.angle = 0;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.mx = this.my = -9999;
      this.p = null;
      this.onMove = e => {
        const r = this.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top, m = 90;
        if (x < -m || y < -m || x > r.width + m || y > r.height + m) { this.mx = this.my = -9999; return; }
        this.mx = x; this.my = y;
      };
      this.onLeave = () => { this.mx = this.my = -9999; };
      window.addEventListener('pointermove', this.onMove, { passive: true });
      window.addEventListener('blur', this.onLeave);
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this);
      this.vis = true;
      this.io = new IntersectionObserver(es => { this.vis = es[0].isIntersecting; }, { rootMargin: '150px' });
      this.io.observe(this);
      this.resize();
      const ready = document.fonts ? document.fonts.ready : Promise.resolve();
      ready.then(() => { this.build(); });
      this.tick = this.tick.bind(this);
      this.raf = requestAnimationFrame(this.tick);
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('blur', this.onLeave);
    }

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

    build() {
      if (!this.w) return;
      const n = this.count;
      if (!this.p || this.p.length !== n) {
        this.p = [];
        for (let i = 0; i < n; i++) {
          this.p.push({
            x: this.w / 2 + (Math.random() - 0.5) * this.w,
            y: this.h / 2 + (Math.random() - 0.5) * this.h,
            k: 0.55 + Math.random() * 0.9,
            ph: Math.random() * TAU,
            am: 0.4 + Math.random() * 1.1,
            ac: i % 19 === 0
          });
        }
      }
      this.data = this.shapes.map(s => this.makeShape(s, n));
    }

    makeShape(name, n) {
      const key = name + '|' + Math.round(this.w) + 'x' + Math.round(this.h) + '|' + n;
      if (this.cache && this.cache.has(key)) return this.cache.get(key);
      const s = this.buildShape(name, n);
      if (this.cache) this.cache.set(key, s);
      return s;
    }

    buildShape(name, n) {
      const R = Math.min(this.w, this.h) * 0.5 * this.scale;
      if (name === 'sphere') {
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
        const a = new Float32Array(n * 3);
        const cols = Math.round(Math.sqrt(n * 1.7)), rows = Math.ceil(n / cols);
        for (let i = 0; i < n; i++) {
          const cx = (i % cols) / (cols - 1) - 0.5, cy = Math.floor(i / cols) / (rows - 1) - 0.5;
          a[i * 3] = cx * 2; a[i * 3 + 1] = cy * 1.1; a[i * 3 + 2] = Math.sin(cx * 6.5) * 0.42 + Math.cos(cy * 5.5) * 0.28;
        }
        return { type: 'wave', a, R };
      }
      if (name === 'ring') {
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
        const a = new Float32Array(n * 3);
        const B = [[-0.95,-0.72,0.55],[-0.70,-0.52,0.86],[-0.50,-0.31,0.42],[-0.29,-0.10,1.06],[-0.08,0.09,0.62],[0.11,0.31,0.92],[0.33,0.51,0.48],[0.53,0.75,0.74],[0.77,0.96,0.34]];
        let tot = 0; for (const b of B) tot += (b[1] - b[0]) * b[2];
        for (let i = 0; i < n; i++) {
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
      const m = g.measureText(str).width;
      if (m > S * 0.92) { size = size * (S * 0.92) / m; g.font = `700 ${size}px ${this.font}`; }
      g.fillText(str, S / 2, S / 2);
      let d;
      try { d = g.getImageData(0, 0, S, S).data; } catch (e) { return this.makeShape('sphere', n); }
      const G = S / 2, mask = new Uint8Array(G * G);
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
        const i = ((y * 2) * S + x * 2) * 4;
        if (d[i + 3] < 128) continue;
        if (mode === 'land' && d[i + 2] - d[i + 1] > 12) continue;
        mask[y * G + x] = 1;
      }
      const pool = [], edge = [];
      for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
        if (!mask[y * G + x]) continue;
        const px = (x / G - 0.5) * 2, py = (y / G - 0.5) * 2;
        pool.push(px, py);
        const on = x === 0 || y === 0 || x === G - 1 || y === G - 1 ||
          !mask[y * G + x - 1] || !mask[y * G + x + 1] || !mask[(y - 1) * G + x] || !mask[(y + 1) * G + x];
        if (on) edge.push(px, py);
      }
      if (pool.length < 200) return this.makeShape('sphere', n);
      const a = new Float32Array(n * 3);
      const cnt = pool.length / 2, ecnt = edge.length / 2;
      for (let i = 0; i < n; i++) {
        const useEdge = ecnt > 60 && i % 3 !== 2;
        const src = useEdge ? edge : pool, j = Math.floor(Math.random() * (useEdge ? ecnt : cnt));
        const jit = useEdge ? 0.008 : 0.014;
        a[i * 3] = src[j * 2] + (Math.random() - 0.5) * jit;
        a[i * 3 + 1] = src[j * 2 + 1] + (Math.random() - 0.5) * jit;
        a[i * 3 + 2] = (Math.random() - 0.5) * 0.16;
      }
      return { type: 'flat', a, R };
    }

    syncSection(now) {
      const els = document.querySelectorAll('[data-particle]');
      if (!els.length) return;
      const vh = window.innerHeight;
      let best = null, bd = 1e9;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < vh * 0.12 || r.top > vh * 0.88) return;
        const d = Math.abs(r.top - vh * 0.22);
        if (d < bd) { bd = d; best = el; }
      });
      if (!best) return;
      const a0 = parseFloat(best.getAttribute('data-particle-alpha')) || 0.26;
      this.targetAlpha = a0 > 0.5 ? a0 : a0 * 0.8;
      const v = best.getAttribute('data-particle');
      if (v === this.curKey) return;
      this.curKey = v;
      this.shapes = v.split(',').map(s => s.trim());
      this.si = 0; this.t0 = now; this.mt = 0;
      this.build();
    }

    tick(now) {
      this.raf = requestAnimationFrame(this.tick);
      if (!this.vis || document.hidden) { this.last = now; this.t0 = now; return; }
      if (this.sd && now - (this.lastSync || 0) > 160) { this.lastSync = now; this.syncSection(now); }
      if (!this.p || !this.data || !this.data.length) return;
      this.alpha += (this.targetAlpha - this.alpha) * 0.07;
      const dt = Math.min(50, now - this.last);
      if (dt < 28) return;
      this.last = now;
      if (!this.reduced && this.data.length > 1 && now - (this.t0 || (this.t0 = now)) > this.hold) { this.t0 = now; this.mt = 0; this.si = (this.si + 1) % this.data.length; }
      this.mt = (this.mt || 0) + dt;
      const s = this.data[this.si];
      let ang;
      if (s.type === 'flat') {
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
        const ax = s.a[i * 3], ay = s.a[i * 3 + 1], az = s.a[i * 3 + 2];
        const rx = ax * ca + az * sa, rz = az * ca - ax * sa;
        const persp = 1 / (1.9 - rz * 0.45);
        const tx = cx + rx * R * persp * 1.55;
        const ty = cy + ay * R * persp * 1.55 + Math.sin(t + p.ph) * p.am * 2.2;
        p.x += (tx - p.x) * 0.045 * p.k;
        p.y += (ty - p.y) * 0.045 * p.k;
        const dx = p.x - this.mx, dy = p.y - this.my;
        const d2 = dx * dx + dy * dy;
        let px = p.x, py = p.y;
        if (d2 < 7000) { const f = (1 - d2 / 7000) * 26; const dd = Math.sqrt(d2) || 1; px += (dx / dd) * f; py += (dy / dd) * f; }
        const r = this.dot * (0.62 + persp * 0.62);
        if (p.ac) { acc.push(px, py, r); continue; }
        ctx.moveTo(px + r, py);
        ctx.arc(px, py, r, 0, TAU);
      }
      ctx.fillStyle = this.color;
      ctx.globalAlpha = 0.82 * this.alpha;
      ctx.fill();
      ctx.beginPath();
      for (let i = 0; i < acc.length; i += 3) { ctx.moveTo(acc[i] + acc[i + 2] * 1.5, acc[i + 1]); ctx.arc(acc[i], acc[i + 1], acc[i + 2] * 1.5, 0, TAU); }
      ctx.fillStyle = this.accent;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  if (!customElements.get('particle-field')) customElements.define('particle-field', ParticleField);
})();
