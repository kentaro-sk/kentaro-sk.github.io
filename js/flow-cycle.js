(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const ICONS = {
    edu: 'M3 8.5 12 4.5l9 4-9 4-9-4Z M7 11v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V11',
    people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5 M17 8.5a2.4 2.4 0 1 0 0-4.8 M16.5 13.6c2.3.3 4 2.2 4 4.6',
    gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6',
    coin: 'M12 20.5c4.7 0 8.5-3.8 8.5-8.5S16.7 3.5 12 3.5 3.5 7.3 3.5 12s3.8 8.5 8.5 8.5Z M12 7v10 M14.6 9.2c-.6-.8-1.6-1.2-2.6-1.2-1.5 0-2.6.8-2.6 2s1.1 1.8 2.6 2 2.7.7 2.7 2-1.2 2-2.7 2c-1.1 0-2.1-.4-2.7-1.2',
    city: 'M4 20V9l2 1.5V7l2.5 1.5V6l3.5 2 3.5-2v2.5L18 7v3.5L20 9v11Z M10.5 20v-4h3v4'
  };
  const KEYS = ['edu', 'people', 'gear', 'coin', 'city'];

  class FlowCycle extends HTMLElement {
    connectedCallback() {
      if (this.__b) return;
      this.__b = true;
      const items = (this.getAttribute('items') || '教育|EDUCATION,人材|TALENT,産業|INDUSTRY,収益|REVENUE,まちづくり|URBAN')
        .split(',').map(s => s.split('|'));
      const accent = this.getAttribute('accent') || '#3B82C4';
      const ink = this.getAttribute('ink') || '#151515';
      const n = items.length;
      const CX = 260, CY = 250, RAD = 155;

      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 520 500');
      svg.setAttribute('width', '100%');
      svg.style.cssText = 'display:block;overflow:visible;font-family:"IBM Plex Mono",ui-monospace,monospace';

      const mk = (tag, attrs, parent) => {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        (parent || svg).appendChild(e);
        return e;
      };

      mk('circle', { cx: CX, cy: CY, r: RAD, fill: 'none', stroke: ink, 'stroke-opacity': .13, 'stroke-width': 1 });
      mk('circle', { cx: CX, cy: CY, r: RAD - 34, fill: 'none', stroke: ink, 'stroke-opacity': .06, 'stroke-width': 1, 'stroke-dasharray': '2 6' });

      const arc = mk('circle', {
        cx: CX, cy: CY, r: RAD, fill: 'none', stroke: accent, 'stroke-width': 2.4,
        'stroke-linecap': 'round', 'stroke-dasharray': `${2 * Math.PI * RAD * .12} ${2 * Math.PI * RAD}`,
        transform: `rotate(-90 ${CX} ${CY})`, opacity: .85
      });

      const core = mk('g', {});
      mk('circle', { cx: CX, cy: CY, r: 54, fill: '#FFFDF5', stroke: accent, 'stroke-opacity': .3 }, core);
      const coreRing = mk('circle', { cx: CX, cy: CY, r: 62, fill: 'none', stroke: accent, 'stroke-opacity': .3, 'stroke-width': 1 }, core);
      const t1 = mk('text', { x: CX, y: CY - 4, 'text-anchor': 'middle', fill: ink, 'font-size': 19, 'font-family': '"Shippori Mincho B1",serif', 'font-weight': 600, 'letter-spacing': '.08em' }, core);
      t1.textContent = this.getAttribute('center') || '地域創生';
      const t2 = mk('text', { x: CX, y: CY + 17, 'text-anchor': 'middle', fill: ink, 'fill-opacity': .48, 'font-size': 8.5, 'letter-spacing': '.16em' }, core);
      t2.textContent = this.getAttribute('center-en') || 'REGIONAL REVITALIZATION';

      const nodes = items.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = CX + Math.cos(a) * RAD, y = CY + Math.sin(a) * RAD;
        const g = mk('g', {});
        const halo = mk('circle', { cx: x, cy: y, r: 34, fill: accent, opacity: 0 }, g);
        mk('circle', { cx: x, cy: y, r: 27, fill: '#FFFDF5', stroke: ink, 'stroke-opacity': .16 }, g);
        const disc = mk('circle', { cx: x, cy: y, r: 27, fill: accent, 'fill-opacity': 0, stroke: accent, 'stroke-opacity': 0, 'stroke-width': 1.6 }, g);
        const ic = mk('g', { transform: `translate(${x - 11} ${y - 11}) scale(.92)`, fill: 'none', stroke: accent, 'stroke-width': 1.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
        mk('path', { d: ICONS[KEYS[i % KEYS.length]] }, ic);
        const lx = CX + Math.cos(a) * (RAD + 56), ly = CY + Math.sin(a) * (RAD + 56);
        const anchor = Math.abs(Math.cos(a)) < .35 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
        const lab = mk('text', { x: lx, y: ly, 'text-anchor': anchor, fill: ink, 'font-size': 14, 'font-weight': 700, 'font-family': '"Zen Kaku Gothic New",system-ui,sans-serif' }, g);
        lab.textContent = it[0];
        const sub = mk('text', { x: lx, y: ly + 14, 'text-anchor': anchor, fill: ink, 'fill-opacity': .45, 'font-size': 8.5, 'letter-spacing': '.14em' }, g);
        sub.textContent = it[1] || '';
        return { x, y, halo, disc, ic, lab, a };
      });

      const dot = mk('g', {});
      mk('circle', { r: 13, fill: accent, opacity: .18 }, dot);
      mk('circle', { r: 5.5, fill: accent }, dot);

      this.appendChild(svg);

      const C = 2 * Math.PI * RAD;
      let p = 0, last = performance.now(), run = false;
      const step = now => {
        if (!this.isConnected) return;
        const dt = Math.min((now - last) / 1000, .05);
        last = now;
        if (run) {
          p = (p + dt * .085) % 1;
          const a = p * Math.PI * 2 - Math.PI / 2;
          dot.setAttribute('transform', `translate(${CX + Math.cos(a) * RAD} ${CY + Math.sin(a) * RAD})`);
          arc.setAttribute('stroke-dashoffset', String(-C * p));
          coreRing.setAttribute('r', String(62 + Math.sin(now / 700) * 3));
          nodes.forEach((nd, i) => {
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

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(es => es.forEach(e => { run = e.isIntersecting; last = performance.now(); }), { threshold: .05 }).observe(this);
      } else run = true;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) run = false;
    }
  }

  if (!customElements.get('flow-cycle')) customElements.define('flow-cycle', FlowCycle);
})();
