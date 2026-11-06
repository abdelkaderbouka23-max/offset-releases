// OFFSET site: the game on screen, the live overlay, the hotkeys and the entrances. No libraries.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the bar turns solid once the hero is behind it ---------- */
  const bar = $('.bar'), hero = $('.hero');
  const solid = () => bar.classList.toggle('is-solid', hero.getBoundingClientRect().bottom < 90);
  addEventListener('scroll', solid, { passive: true }); solid();

  /* ---------- the hero clip: a real recording when there is one, the photograph until then ---------- */
  const video = $('[data-clip]');
  if (video && !still) {
    video.src = 'clips/hero.mp4';
    video.addEventListener('loadeddata', () => { hero.classList.add('has-clip'); seq = SEQ.Clip; n = 0; nextNotice(); video.play().catch(() => {}); }, { once: true });
    video.addEventListener('error', () => video.removeAttribute('src'), { once: true });
    video.load();
  }

  /* ---------- OFFSET's notices arrive over the game, one after another ---------- */
  const cycle = $('[data-cycle]'), gameTag = $('[data-game]');
  // the notices name the game on screen: the street photo stands for Fortnite, the clip is Call of Duty
  const SEQ = {
    Fortnite: [
      ['img/notice-detected.png', 764, 186, 'Fortnite'],
      ['img/notice-replay.png', 590, 230, 'Fortnite'],
      ['img/notice-shot.png', 684, 230, 'Fortnite'],
      ['img/notice-session.png', 698, 230, 'Fortnite'],
    ],
    Clip: [
      ['img/notice-detected-cod.png', 764, 186, 'Call of Duty'],
      ['img/notice-replay.png', 590, 230, 'Call of Duty'],
      ['img/notice-shot-cod.png', 726, 230, 'Call of Duty'],
      ['img/notice-session-cod.png', 694, 230, 'Call of Duty'],
    ],
  };
  let seq = SEQ.Fortnite, n = 0;
  function nextNotice() {
    const [src, w, h, game] = seq[n++ % seq.length];
    cycle.classList.remove('is-on');
    setTimeout(() => {
      cycle.src = src; cycle.width = w; cycle.height = h; gameTag.textContent = game;
      requestAnimationFrame(() => cycle.classList.add('is-on'));
    }, still ? 0 : 450);
  }
  nextNotice();
  setInterval(nextNotice, 3600);

  /* ---------- every overlay on the page is live: a steady game around 212 FPS, a stutter now and then ---------- */
  const N = 140, ft = Array.from({ length: N }, () => 4.4 + Math.random() * 0.8);
  let rec = 41, beat = 0;
  const setAll = (sel, v) => $$(sel).forEach((e) => { e.textContent = v; });
  function tick() {
    for (let k = 0; k < 4; k++) { ft.shift(); ft.push(Math.random() < 0.012 ? 26 + Math.random() * 12 : 4.4 + Math.random() * 0.8); }
    const top = 40, x = (i) => (i * 120 / (N - 1)).toFixed(1), y = (v) => (30 - Math.min(1, v / top) * 28.5).toFixed(1);
    const pts = ft.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const sp = ft.map((v, i) => (v > 20 ? `<line x1="${x(i)}" x2="${x(i)}" y1="30" y2="${y(v)}"/>` : '')).join('');
    $$('[data-line]').forEach((l) => l.setAttribute('points', pts));
    $$('[data-spikes]').forEach((g) => { g.innerHTML = sp; });
    if (++beat % 6 === 0) {                                  // the numbers move once a second, like the real overlay
      const recent = ft.slice(-60), avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      setAll('[data-fps]', Math.round(1000 / avg));
      setAll('[data-ft]', `${avg.toFixed(1)} ms`);
      setAll('[data-gpu]', `${69 + Math.round(Math.random() * 5)}%`);
      setAll('[data-temp]', `${62 + Math.round(Math.random() * 2)} °C`);
      rec++;
      setAll('[data-rec]', `${String(Math.floor(rec / 60)).padStart(2, '0')}:${String(rec % 60).padStart(2, '0')}`);
    }
  }
  tick();
  setInterval(tick, still ? 1000 : 166);

  /* ---------- in a game: the tabs switch what the plate shows ---------- */
  const show = $('.show');
  const COPY = {
    overlay: ['Numbers over any game', 'A small click-through box above the game in front: FPS, frame time, GPU load, temperature and a live frame-time line where every stutter shows as a red spike. Nothing is injected into the game, so anti-cheats see nothing.'],
    replay: ['The last 30 seconds', 'OFFSET keeps the last moments of your game ready all the time. Ctrl Alt F10 saves them as an mp4 in about two seconds, on your card’s own encoder, so the game keeps its frames.'],
    sessions: ['Proof a change helped', 'Close a game and OFFSET sums it up: how long you played, average FPS, 1% and 0.1% lows and every stutter. Monitoring puts each session next to the one before.'],
  };
  const tabs = $$('.tabs [role="tab"]'), pane = $('#pane');
  function pick(tab, focus) {
    tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    const k = tab.dataset.tab;
    show.dataset.on = k;
    $('#show-title').textContent = COPY[k][0];
    $('#show-desc').textContent = COPY[k][1];
    pane.setAttribute('aria-labelledby', tab.id);
    pane.classList.remove('is-swapping'); void pane.offsetWidth; pane.classList.add('is-swapping');
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => pick(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  show.dataset.on = 'overlay';

  /* ---------- the hotkeys: press them, OFFSET's own notice answers ---------- */
  const toast = $('.toast'), timg = $('.toast img');
  const NOTE = {
    F9: ['img/notice-rec.png', 'Notice: Recording, Valorant, Ctrl Alt F9 stops it', 544, 186],
    F10: ['img/notice-replay.png', 'Notice: Replay saved, 0:30, 42 MB in Videos\\OFFSET', 590, 230],
    F11: ['img/notice-shot.png', 'Notice: Screenshot saved in Videos\\OFFSET\\Screenshots', 684, 230],
  };
  let hide;
  function notice(k) {
    const [src, alt, w, h] = NOTE[k];
    timg.src = src; timg.alt = alt; timg.width = w; timg.height = h;
    toast.style.width = `min(${Math.round(w / 1.45)}px, calc(100vw - 32px))`;
    toast.classList.remove('is-on'); void toast.offsetWidth; toast.classList.add('is-on');
    const b = $(`.key[data-key="${k}"]`); b.classList.add('is-down'); setTimeout(() => b.classList.remove('is-down'), 200);
    clearTimeout(hide); hide = setTimeout(() => toast.classList.remove('is-on'), 3200);
  }
  $$('.key').forEach((b) => b.addEventListener('click', () => notice(b.dataset.key)));
  addEventListener('keydown', (e) => { if (e.ctrlKey && e.altKey && NOTE[e.key]) { e.preventDefault(); notice(e.key); } });

  /* ---------- the line-up on a phone: format and place under the name ---------- */
  $$('.lineup tbody tr:not(.lineup__day)').forEach((tr) => { const c = tr.cells; tr.dataset.meta = `${c[1].textContent} · ${c[2].textContent}`; });

  /* ---------- the figures roll up to their values once ---------- */
  const rollIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    rollIO.unobserve(e.target);
    const dd = e.target, to = +dd.dataset.roll, small = dd.querySelector('small');
    if (still || to === 0) return;
    const t0 = performance.now(), dur = 1100;
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      dd.firstChild.nodeValue = String(v);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
    if (small) dd.append(small);
  }), { threshold: 0.6 });
  $$('[data-roll]').forEach((dd) => rollIO.observe(dd));

  /* ---------- the Download band: its letters start offset and snap into line, and jump on hover ---------- */
  const go = $('.go'), word = $$('.go__word span');
  const OFF = [0.16, -0.08, 0.12, -0.14, 0.06, -0.1, 0.14, -0.06];
  const set = (k) => word.forEach((s, i) => { s.style.transform = `translateY(${(OFF[i] * k).toFixed(3)}em)`; });
  if (!still) {
    const place = () => {
      const r = go.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.8)));
      if (!go.matches(':hover')) set(1 - p);
    };
    addEventListener('scroll', place, { passive: true }); place();
    go.addEventListener('mouseenter', () => set(-0.7));
    go.addEventListener('mouseleave', place);
  }

  /* ---------- entrances: heading, then text, then pictures ---------- */
  const groups = [
    ['.stats', 'dl > div'],
    ['.games', 'h2, .games__more p, .tag'],
    ['.show', '.tabs, #pane, .show__act, .show__plate'],
    ['.inside', 'h2, .tile'],
    ['.keys-sec', 'h2, .keys-sec__lede, .key'],
    ['.cards', 'h2, .lineup__day, .lineup tbody tr'],
    ['.faq', '.faq__title, details'],
  ];
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
  groups.forEach(([sec, parts]) => {
    $$(parts, $(sec)).forEach((el, i) => { el.dataset.rise = ''; el.style.setProperty('--i', i % 8); io.observe(el); });
  });
})();
