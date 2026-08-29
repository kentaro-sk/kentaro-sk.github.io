(() => {
  const TAU = Math.PI * 2;
  const mk = seed => () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const bez = (t, a, b, c, d) => {
    const u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  };

  class JourneyScene extends HTMLElement {
    connectedCallback() {
      if (this._i) return;
      this._i = true;
      this.style.display = 'block';
      if (!this.style.position) this.style.position = 'relative';
      if (!this.style.width) this.style.width = '100%';
      if (!this.style.height) this.style.height = '100%';
      const c = (this.cv = document.createElement('canvas'));
      c.style.cssText = 'display:block;width:100%;height:100%';
      this.appendChild(c);
      this.ctx = c.getContext('2d');
      this.bg = this.getAttribute('bg') || '7,11,22';
      this.animated = this.hasAttribute('animate') && !matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this);
      this.tick = this.tick.bind(this);
      this.resize();
      if (this.animated) {
        this.vis = true;
        this.io = new IntersectionObserver(e => { this.vis = e[0].isIntersecting; }, { rootMargin: '140px' });
        this.io.observe(this);
        this.raf = requestAnimationFrame(this.tick);
      }
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      if (this.ro) this.ro.disconnect();
      if (this.io) this.io.disconnect();
    }

    resize() {
      const r = this.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const d = Math.min(window.devicePixelRatio || 1, 1.6);
      this.w = r.width; this.h = r.height;
      this.cv.width = Math.round(r.width * d);
      this.cv.height = Math.round(r.height * d);
      this.ctx.setTransform(d, 0, 0, d, 0, 0);
      this.build();
      if (!this.animated) this.render(0);
    }

    path(t) {
      const w = this.w, h = this.h;
      return [
        bez(t, 0.31 * w, 0.80 * w, 0.30 * w, 0.575 * w),
        bez(t, 1.06 * h, 0.94 * h, 0.79 * h, 0.652 * h)
      ];
    }

    build() {
      const w = this.w, h = this.h;
      if (!w) return;
      const rnd = mk(20260814);
      const hz = (this.hz = h * 0.655);
      const G = {};
      const bucket = (color, a, ph) => {
        const q = Math.max(1, Math.min(6, Math.round(a * 6)));
        const key = color + '|' + q;
        if (!G[key]) G[key] = { color, a: q / 6, ph: ph || 0, pts: [] };
        return G[key];
      };
      const put = (color, a, x, y, r) => { const g = bucket(color, a); g.pts.push(x, y, r); };

      const SKY = '214,228,248';
      const GOLD = '226,190,120';
      const WARM = '240,208,142';
      const LAND = '188,208,236';
      const ROAD = '255,241,212';

      // skyline: jittered lattice per building + crisp roof and edge lines
      const B = [];
      let bx = 0.24;
      while (bx < 0.99) {
        const bw = 0.018 + rnd() * 0.038;
        const near = 1 - Math.min(1, Math.abs(bx + bw / 2 - 0.60) / 0.4);
        const bh = 0.035 + rnd() * 0.085 + near * 0.17 + (rnd() > 0.88 ? 0.06 : 0);
        B.push([bx, bw, bh]);
        bx += bw + 0.003 + rnd() * 0.014;
      }
      // buildings are sized against a width-derived stage, so every building keeps
      // the same aspect ratio however the container is resized; clamped so the
      // tallest one still fits under the horizon on short viewports
      const maxPh = B.reduce((m, b) => Math.max(m, b[2]), 0.001);
      this.su = Math.min(w / 1.9, (hz * 0.9) / maxPh);
      B.forEach(([px, pw, ph]) => {
        const x0 = px * w, bwp = Math.max(8, pw * w), bhp = ph * this.su;
        const step = 2.7;
        for (let y = 0; y < bhp; y += step) {
          const v = y / bhp;
          for (let x = 0; x < bwp; x += step) {
            const keep = 0.3 + (1 - v) * 0.45;
            if (rnd() > keep) continue;
            const a = 0.14 + (1 - v) * 0.3 + rnd() * 0.1;
            put(SKY, a, x0 + x + (rnd() - 0.5) * 1.6, hz - y + (rnd() - 0.5) * 1.6, 0.5 + rnd() * 0.42);
          }
        }
        for (let x = 0; x < bwp; x += 1.9) {
          if (rnd() > 0.8) continue;
          put(SKY, 0.62, x0 + x, hz - bhp + (rnd() - 0.5) * 1.3, 0.55 + rnd() * 0.35);
        }
        [0, bwp].forEach(ex => {
          for (let y = 0; y < bhp; y += 2.1) {
            if (rnd() > 0.62) continue;
            put(SKY, 0.5, x0 + ex + (rnd() - 0.5) * 1.2, hz - y, 0.5 + rnd() * 0.3);
          }
        });
        // window lights
        const wcount = Math.round(bwp * bhp * 0.0016);
        for (let i = 0; i < wcount; i++) {
          const v = Math.pow(rnd(), 0.75);
          put(rnd() > 0.35 ? WARM : GOLD, 0.45 + rnd() * 0.5,
            x0 + (0.1 + rnd() * 0.8) * bwp, hz - v * bhp, 0.65 + rnd() * 0.8);
        }
      });

      // sky dust
      for (let i = 0; i < 300; i++) {
        const x = w * (0.1 + rnd() * 0.92), y = h * (0.02 + rnd() * 0.63);
        put(rnd() > 0.82 ? GOLD : SKY, 0.1 + rnd() * 0.45, x, y, 0.45 + rnd() * 0.9);
      }

      // dune terrain
      for (let row = 0; row < 56; row++) {
        const t = row / 55;
        const y0 = hz + Math.pow(t, 1.3) * (h - hz) * 1.05;
        const cols = Math.round(74 + t * 200);
        const [rx] = this.path(1 - t * 0.94);
        for (let i = 0; i < cols; i++) {
          const u = i / (cols - 1);
          const x = u * w * 1.08 - w * 0.04;
          const wob = Math.sin(u * 7.1 + row * 0.4) * 11 * (0.3 + t) + Math.cos(u * 3.3 - row * 0.26) * 15 * t;
          const near = 1 - Math.min(1, Math.abs(x - rx) / (w * (0.05 + t * 0.32)));
          const a = (0.07 + t * 0.3 + rnd() * 0.12) * (1 + near * 1.3) * (t < 0.1 ? 0.5 : 1);
          put(near > 0.6 && rnd() > 0.5 ? GOLD : LAND, a,
            x + (rnd() - 0.5) * 3.4, y0 + wob + (rnd() - 0.5) * 6 * (0.4 + t), 0.45 + t * 0.8 + rnd() * 0.4);
        }
      }

      // the winding road of light
      for (let i = 0; i < 1700; i++) {
        const t = Math.pow(rnd(), 0.85);
        const [px, py] = this.path(t);
        const wd = w * (0.058 * (1 - t) + 0.004);
        const off = (rnd() + rnd() + rnd() - 1.5) / 1.5;
        put(ROAD, (0.28 + (1 - Math.abs(off)) * 0.7) * (0.45 + t * 0.55),
          px + off * wd, py + (rnd() - 0.5) * 5 * (1 - t) + 1, 0.5 + (1 - t) * 0.9 + rnd() * 0.4);
      }

      this.groups = Object.keys(G).map((k, i) => { G[k].ph = i * 1.7; return G[k]; });
      this.flow = Array.from({ length: 46 }, () => ({ t: rnd(), v: 0.00007 + rnd() * 0.00012 }));
    }

    tick(now) {
      this.raf = requestAnimationFrame(this.tick);
      if (!this.vis || document.hidden) return;
      if (now - (this.last || 0) < 32) return;
      this.last = now;
      this.render(now);
    }

    render(now) {
      if (!this.groups) return;
      const ctx = this.ctx, w = this.w, h = this.h, t = now * 0.001;
      ctx.clearRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w * 0.6, this.hz, 0, w * 0.6, this.hz, w * 0.45);
      glow.addColorStop(0, 'rgba(201,169,97,.16)');
      glow.addColorStop(0.45, 'rgba(120,152,204,.06)');
      glow.addColorStop(1, 'rgba(' + this.bg + ',0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      this.groups.forEach(g => {
        const tw = this.animated ? 0.88 + 0.12 * Math.sin(t * 0.9 + g.ph) : 1;
        ctx.globalAlpha = Math.min(1, g.a * tw);
        ctx.fillStyle = 'rgb(' + g.color + ')';
        ctx.beginPath();
        const p = g.pts;
        for (let i = 0; i < p.length; i += 3) {
          ctx.moveTo(p[i] + p[i + 2], p[i + 1]);
          ctx.arc(p[i], p[i + 1], p[i + 2], 0, TAU);
        }
        ctx.fill();
      });

      const [hx, hy] = this.path(1);
      const pool = ctx.createRadialGradient(hx, hy, 0, hx, hy, w * 0.09);
      pool.addColorStop(0, 'rgba(255,244,218,.5)');
      pool.addColorStop(0.4, 'rgba(240,208,142,.16)');
      pool.addColorStop(1, 'rgba(' + this.bg + ',0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = pool;
      ctx.beginPath();
      ctx.arc(hx, hy, w * 0.09, 0, TAU);
      ctx.fill();

      this.flow.forEach(f => {
        if (this.animated) f.t += f.v * 32;
        if (f.t > 1) f.t -= 1;
        const [px, py] = this.path(f.t);
        const r = (1 + (1 - f.t) * 1.4) * 4.5;
        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, 'rgba(255,247,226,.85)');
        g.addColorStop(1, 'rgba(255,241,212,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, TAU);
        ctx.fill();
      });

      // soften the bottom edge into the section background
      const fade = ctx.createLinearGradient(0, h * 0.8, 0, h);
      fade.addColorStop(0, 'rgba(' + this.bg + ',0)');
      fade.addColorStop(1, 'rgba(' + this.bg + ',1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, h * 0.8, w, h * 0.2);
      ctx.globalAlpha = 1;
    }
  }

  if (!customElements.get('journey-scene')) customElements.define('journey-scene', JourneyScene);
})();
