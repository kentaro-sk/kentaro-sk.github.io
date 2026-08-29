(() => {
  // ★差し替えはここだけ: src を書き換えれば動きます（順序 = 時間の流れ）
  const IMAGES = [
    { id: 'morning',  label: 'Morning',  jp: '朝',     src: './images/effects/city/city-morning.jpg?v=2' },
    { id: 'noon',     label: 'Noon',     jp: '昼',     src: './images/effects/city/city-noon.jpg?v=2' },
    { id: 'evening',  label: 'Evening',  jp: '夕方',   src: './images/effects/city/city-evening.jpg?v=2' },
    { id: 'night',    label: 'Night',    jp: '夜',     src: './images/effects/city/city-night.jpg?v=2' },
    { id: 'midnight', label: 'Midnight', jp: '真夜中', src: './images/effects/city/city-midnight.jpg?v=2' },
    { id: 'dawn',     label: 'Dawn',     jp: '夜明け', src: './images/effects/city/city-dawn.jpg?v=2' }
  ];

  const N = IMAGES.length;
  const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
  const smooth = v => v * v * (3 - 2 * v);
  const TAU = Math.PI * 2;

  const CSS = `
dream-city{position:relative;display:block;overflow:hidden;background:#070C16;isolation:isolate;color:#fff;-webkit-tap-highlight-color:transparent}
dream-city .dcam{position:absolute;left:0;top:0;width:100%;background:#0A1224;transform-origin:50% 84%;will-change:transform;backface-visibility:hidden}
dream-city .dcimg{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:50% 50%;opacity:0;user-select:none;-webkit-user-drag:none}
dream-city .dov{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:4;mix-blend-mode:screen;opacity:0}
dream-city .dwarm-in{position:absolute;inset:0;animation:dcBreathe 11s ease-in-out infinite;background:
 radial-gradient(58% 34% at 50% 84%,rgba(255,186,96,.34),rgba(255,170,80,0) 72%),
 radial-gradient(30% 22% at 17% 74%,rgba(255,198,124,.24),rgba(255,198,124,0) 72%),
 radial-gradient(28% 20% at 82% 70%,rgba(255,192,116,.22),rgba(255,192,116,0) 72%),
 radial-gradient(74% 26% at 50% 100%,rgba(255,176,92,.30),rgba(255,176,92,0) 76%)}
dream-city .daurora-in{position:absolute;left:-6%;right:-6%;top:0;height:56%;animation:dcDrift 30s ease-in-out infinite;background:
 radial-gradient(64% 62% at 28% 6%,rgba(186,150,238,.36),rgba(186,150,238,0) 70%),
 radial-gradient(56% 52% at 74% 2%,rgba(248,170,206,.30),rgba(248,170,206,0) 72%),
 linear-gradient(180deg,rgba(208,178,242,.20),rgba(255,214,226,.07) 46%,rgba(255,214,226,0) 74%)}
dream-city .dedge{position:absolute;inset:0;z-index:5;pointer-events:none;background:linear-gradient(180deg,rgba(6,10,20,.34),rgba(6,10,20,0) 24%,rgba(6,10,20,0) 56%,rgba(6,10,20,.44));box-shadow:inset 0 0 150px 46px rgba(6,10,20,.26)}
dream-city .ddepth{position:absolute;left:28px;top:50%;transform:translateY(-50%);z-index:6;display:flex;flex-direction:column;align-items:center;gap:11px;pointer-events:none}
dream-city .dlab{display:block;color:rgba(255,255,255,.88);filter:drop-shadow(0 1px 6px rgba(4,8,18,.85))}
dream-city .dlab svg{display:block}
dream-city .dtrack{position:relative;width:1px;height:104px;background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.4),rgba(255,255,255,.14))}
dream-city .ddot{position:absolute;left:50%;top:0;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:999px;background:#fff;box-shadow:0 0 10px rgba(255,255,255,.85)}
dream-city .dpanel{position:absolute;right:24px;bottom:24px;z-index:7;display:flex;align-items:center;gap:14px;padding:10px 16px 10px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.26);background:rgba(255,255,255,.11);backdrop-filter:blur(16px) saturate(150%);-webkit-backdrop-filter:blur(16px) saturate(150%);box-shadow:0 20px 44px -22px rgba(4,8,18,.7),inset 0 1px 0 rgba(255,255,255,.22)}
dream-city .dplay{width:36px;height:36px;flex:none;border-radius:999px;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.14);color:#fff;display:grid;place-items:center;cursor:pointer;padding:0;transition:background .3s ease,transform .35s cubic-bezier(.22,.61,.36,1)}
dream-city .dplay:hover{background:rgba(255,255,255,.26);transform:scale(1.06)}
dream-city .dplay:focus-visible,dream-city .ddial:focus-visible{outline:1px solid rgba(255,255,255,.75);outline-offset:3px}
dream-city .dsep{width:1px;height:22px;flex:none;background:rgba(255,255,255,.24)}
dream-city .dtext{display:flex;flex-direction:column;gap:3px;min-width:62px}
dream-city .djp{font-family:'Shippori Mincho B1',serif;font-size:14px;letter-spacing:.14em;line-height:1;color:rgba(255,255,255,.96)}
dream-city .den{font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:12px;letter-spacing:.14em;line-height:1;color:rgba(255,255,255,.6)}
dream-city .ddial{flex:none;width:58px;height:58px;display:grid;place-items:center;cursor:grab;touch-action:none}
dream-city .ddial:active{cursor:grabbing}
dream-city .ddial svg{display:block;overflow:visible}
@keyframes dcBreathe{0%,100%{opacity:.86}50%{opacity:1}}
@keyframes dcDrift{0%,100%{transform:translate3d(-10px,0,0)}50%{transform:translate3d(12px,4px,0)}}
@media (max-width:720px){dream-city .ddepth{left:16px}dream-city .dpanel{right:14px;bottom:16px;gap:11px;padding:8px 13px 8px 9px}dream-city .dtext{min-width:54px}}
@media (prefers-reduced-motion:reduce){dream-city .dwarm-in,dream-city .daurora-in{animation:none}}`;

  if (!document.getElementById('dream-city-css')) {
    const st = document.createElement('style');
    st.id = 'dream-city-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  const ICON_PLAY = '<path d="M5.4 3.4 12.6 8 5.4 12.6Z" fill="currentColor"/>';
  const ICON_PAUSE = '<rect x="4.7" y="3.6" width="2.3" height="8.8" rx=".7" fill="currentColor"/><rect x="9" y="3.6" width="2.3" height="8.8" rx=".7" fill="currentColor"/>';

  class DreamCity extends HTMLElement {
    connectedCallback() {
      if (this.__built) return;
      this.__built = true;

      const cycle = Math.max(6, parseFloat(this.getAttribute('cycle')) || 26);
      const override = (this.getAttribute('sources') || '').split(',').map(s => s.trim()).filter(Boolean);
      const imgs = IMAGES.map((im, i) => ({ ...im, src: override[i] || im.src }));
      const startIdx = Math.max(0, imgs.findIndex(im => im.id === (this.getAttribute('start') || 'evening')));
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

      const R = 20, C = TAU * R;
      this.setAttribute('aria-label', '夢の街 — 時間帯とスクロールで変化する街の風景');
      this.innerHTML =
        '<div class="dcam">' +
          imgs.map((im, i) => `<img class="dcimg" src="${im.src}" alt="${i === 0 ? '地上と地下がつながる夢の街の風景' : ''}" draggable="false" decoding="async">`).join('') +
          '<div class="dov dwarm"><div class="dwarm-in"></div></div>' +
          '<div class="dov daurora"><div class="daurora-in"></div></div>' +
        '</div>' +
        '<div class="dedge"></div>' +
        '<div class="ddepth"><span class="dlab" title="地上" aria-label="地上"><svg viewBox="0 0 18 18" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><rect x="5.6" y="3.4" width="6.8" height="6.8" rx="1"></rect><line x1="2.2" y1="13.2" x2="15.8" y2="13.2"></line></svg></span><span class="dtrack"><span class="ddot"></span></span><span class="dlab" title="地下" aria-label="地下"><svg viewBox="0 0 18 18" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><line x1="2.2" y1="4.8" x2="15.8" y2="4.8"></line><rect x="5.6" y="7.8" width="6.8" height="6.8" rx="1" stroke-dasharray="2.4 1.8"></rect></svg></span></div>' +
        '<div class="dpanel">' +
          '<button class="dplay" type="button" aria-label="時間の自動再生 / 一時停止" aria-pressed="true"><svg viewBox="0 0 16 16" width="15" height="15">' + ICON_PAUSE + '</svg></button>' +
          '<span class="dsep"></span>' +
          '<div class="dtext"><span class="djp"></span><span class="den"></span></div>' +
          '<div class="ddial" role="slider" tabindex="0" aria-label="時間帯" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0">' +
            '<svg viewBox="0 0 66 66" width="58" height="58">' +
              '<g transform="translate(33 6.4)" stroke="rgba(255,255,255,.86)" stroke-width="1" stroke-linecap="round">' +
                '<circle r="2.5" fill="rgba(255,255,255,.92)" stroke="none"/>' +
                '<line y1="-4.4" y2="-6.1"/><line y1="4.4" y2="6.1"/><line x1="-4.4" x2="-6.1"/><line x1="4.4" x2="6.1"/>' +
                '<line x1="-3.1" y1="-3.1" x2="-4.4" y2="-4.4"/><line x1="3.1" y1="3.1" x2="4.4" y2="4.4"/>' +
                '<line x1="3.1" y1="-3.1" x2="4.4" y2="-4.4"/><line x1="-3.1" y1="3.1" x2="-4.4" y2="4.4"/>' +
              '</g>' +
              '<circle cx="33" cy="59.6" r="3" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.1"/>' +
              `<circle cx="33" cy="33" r="${R}" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="2"/>` +
              `<circle class="darc" cx="33" cy="33" r="${R}" fill="none" stroke="rgba(255,248,238,.95)" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${C.toFixed(2)}" transform="rotate(-90 33 33)"/>` +
              '<circle class="dknob" cx="33" cy="13" r="2.7" fill="#fff"/>' +
            '</svg>' +
          '</div>' +
        '</div>';

      // ホストページのスクロールrevealに内部要素を触らせない（transform / opacity を奪い合わないため）
      this.__rv = true;
      this.querySelectorAll('*').forEach(el => { el.__rv = true; });

      const cam = this.querySelector('.dcam');
      const layers = [...this.querySelectorAll('.dcimg')];
      const warm = this.querySelector('.dwarm');
      const aurora = this.querySelector('.daurora');
      const dot = this.querySelector('.ddot');
      const playBtn = this.querySelector('.dplay');
      const playIco = playBtn.querySelector('svg');
      const jpEl = this.querySelector('.djp');
      const enEl = this.querySelector('.den');
      const dial = this.querySelector('.ddial');
      const arc = this.querySelector('.darc');
      const knob = this.querySelector('.dknob');

      let t = startIdx, sp = 0, travel = 0, playing = !reduce, dragging = false, vis = true, lastPhase = -1;
      let rectTop = 0, rectH = 0, needRect = true;
      // スクロール固定（sticky）の素親がある場合は、その区間をカメラの行程に使う
      let pinSticky = null, pinRange = null;
      const findPin = () => {
        pinSticky = null; pinRange = null;
        let n = this.parentElement;
        for (let i = 0; n && i < 6; i++) {
          if (getComputedStyle(n).position === 'sticky') { pinSticky = n; pinRange = n.parentElement; break; }
          n = n.parentElement;
        }
      };
      findPin();
      const onScroll = () => { needRect = true; };
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll);
      this.__onScroll = onScroll;

      layers[startIdx].style.opacity = 1;
      layers[startIdx].__o = 1;

      const layout = () => {
        needRect = true;
        this.__dirty = true;
        if (cam.style.opacity && cam.style.opacity !== '1') { cam.style.opacity = ''; cam.style.filter = ''; }
        // 親（マウント要素）が高さを持ち、自身が0高さの場合は絶対配置で全面に張る
        if (this.clientHeight < 4 && this.parentElement && this.parentElement.clientHeight > 4) {
          this.style.cssText += ';position:absolute;inset:0;width:auto;height:auto';
        }
        const W = this.clientWidth || 1, H = this.clientHeight || 1;
        const camH = Math.max(H * 1.42, Math.min(H * 1.68, W / 1.32));
        cam.style.height = camH.toFixed(1) + 'px';
        travel = camH - H;
      };
      layout();

      const setPlaying = v => {
        playing = v;
        playIco.innerHTML = v ? ICON_PAUSE : ICON_PLAY;
        playBtn.setAttribute('aria-pressed', String(v));
      };
      setPlaying(playing);

      playBtn.addEventListener('click', () => setPlaying(!playing));

      const fromPointer = e => {
        const r = dial.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        let deg = Math.atan2(dx, -dy) * 180 / Math.PI;
        if (deg < 0) deg += 360;
        t = (1 + deg / 60) % N;
      };
      dial.addEventListener('pointerdown', e => {
        e.preventDefault();
        dragging = true;
        this.__dirty = true;
        try { dial.setPointerCapture(e.pointerId); } catch (_) {}
        setPlaying(false);
        fromPointer(e);
      });
      dial.addEventListener('pointermove', e => { if (dragging) { fromPointer(e); this.__dirty = true; } });
      const end = () => { dragging = false; };
      dial.addEventListener('pointerup', end);
      dial.addEventListener('pointercancel', end);
      dial.addEventListener('keydown', e => {
        const back = e.key === 'ArrowLeft' || e.key === 'ArrowDown';
        const fwd = e.key === 'ArrowRight' || e.key === 'ArrowUp';
        if (!back && !fwd) return;
        e.preventDefault();
        setPlaying(false);
        t = (Math.round(t) + (fwd ? 1 : -1) + N) % N;
        this.__dirty = true;
      });

      const io = new IntersectionObserver(es => { vis = es[es.length - 1].isIntersecting; }, { rootMargin: '30% 0px' });
      io.observe(this);
      const ro = new ResizeObserver(layout);
      ro.observe(this);

      let last = performance.now();
      const frame = now => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        this.__raf = requestAnimationFrame(frame);
        if (!vis) return;

        // ── 縦スクロール = 地上 ⇄ 地下のカメラ移動
        const vh = innerHeight || 1;
        if (needRect) {
          const r = this.getBoundingClientRect();
          rectTop = r.top; rectH = r.height; needRect = false;
          if (!pinRange) findPin();
        }
        let target;
        if (pinRange) {
          const pr = pinRange.getBoundingClientRect();
          const span = Math.max(1, pr.height - pinSticky.offsetHeight);
          target = clamp01((-pr.top / span - .05) / .90);
        } else {
          target = clamp01(((vh - rectTop) / (vh + rectH) - .12) / .70);
        }
        sp += (target - sp) * (reduce ? 1 : Math.min(1, dt * 6));
        const ep = smooth(sp);
        const camT = `translate3d(0,${(-travel * ep).toFixed(2)}px,0) scale(${(1 + .06 * ep).toFixed(4)})`;
        if (camT !== cam.style.transform) {
          cam.style.transform = camT;
          dot.style.top = (ep * 100).toFixed(2) + '%';
        }

        // ── 時間経過のクロスフェード
        const moving = playing && !dragging;
        if (moving) t = (t + dt * N / cycle) % N;
        if (!moving && !this.__dirty) return;
        this.__dirty = moving;
        const i0 = Math.floor(t) % N, f = t - Math.floor(t), i1 = (i0 + 1) % N;
        const fade = smooth(clamp01((f - .28) / .72));
        for (let i = 0; i < N; i++) {
          const el = layers[i];
          const o = i === i0 ? 1 : i === i1 ? fade : 0;
          const z = i === i0 ? 1 : i === i1 ? 2 : 0;
          if (el.__o !== o) { el.style.opacity = o; el.__o = o; }
          if (el.__z !== z) { el.style.zIndex = z; el.__z = z; }
        }
        const w = i => (i === i0 ? 1 - fade : i === i1 ? fade : 0);
        warm.style.opacity = clamp01(.88 * (w(3) + w(4)) + .4 * w(2)).toFixed(3);
        aurora.style.opacity = clamp01(w(5) + .25 * w(4)).toFixed(3);

        // ── ダイヤル（数字を使わない進行表示）
        const frac = ((t - 1) / N + 1) % 1;
        arc.setAttribute('stroke-dashoffset', (C * (1 - frac)).toFixed(2));
        const a = frac * TAU - Math.PI / 2;
        knob.setAttribute('cx', (33 + Math.cos(a) * R).toFixed(2));
        knob.setAttribute('cy', (33 + Math.sin(a) * R).toFixed(2));

        const near = fade > .5 ? i1 : i0;
        if (near !== lastPhase) {
          lastPhase = near;
          jpEl.textContent = imgs[near].jp;
          enEl.textContent = imgs[near].label.toUpperCase();
          dial.setAttribute('aria-valuenow', String(near));
          dial.setAttribute('aria-valuetext', imgs[near].jp);
        }
      };
      this.__raf = requestAnimationFrame(frame);
      this.__io = io;
      this.__ro = ro;
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.__raf);
      if (this.__onScroll) { removeEventListener('scroll', this.__onScroll); removeEventListener('resize', this.__onScroll); }
      if (this.__io) this.__io.disconnect();
      if (this.__ro) this.__ro.disconnect();
      this.__built = false;
    }
  }

  if (!customElements.get('dream-city')) customElements.define('dream-city', DreamCity);
})();
