/* Legislativo Conectado · deck engine */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const W = 1920, H = 1080;
  const store = {
    get(k) { try { return localStorage.getItem('lc:' + k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem('lc:' + k, v); } catch {} },
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ---------- icons ---------- */
  const ICONS = {
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    tv: '<rect x="2" y="6" width="20" height="13" rx="1"/><path d="M8 2l4 4 4-4"/>',
    panel: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 9v12"/>',
    pin: '<path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    clipboard: '<rect x="5" y="4" width="14" height="18" rx="1"/><path d="M9 4V2h6v2M9 11h6M9 15h4"/>',
    file: '<path d="M14 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/><path d="M14 2v5h5M8.5 13h7M8.5 17h5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 21c0-3-1.8-5.5-4.5-6.5"/>',
    megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h3l7 5V5L7 10H4a1 1 0 0 0-1 1z"/><path d="M18 8a5 5 0 0 1 0 8"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.3 19a10 10 0 1 1 17.4 0"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
    lock: '<rect x="4" y="11" width="16" height="11" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    building: '<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-7 10 7z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    camera: '<path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/>',
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    left: '<path d="M15 5l-7 7 7 7"/>',
    right: '<path d="M9 5l7 7-7 7"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  };
  const icon = n => `<svg viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;

  /* ---------- logo ---------- */
  const L = window.LC_LOGO;
  const logoSVG = (word = true) => {
    const seats = L.dots.map(([x, y]) => `<circle class="seat" cx="${x}" cy="${y}" r="${L.r}"/>`).join('');
    const w = word ? `<g class="word">${L.word.map(d => `<path d="${d}"/>`).join('')}</g>` : '';
    return `<svg class="lc-logo" viewBox="0 0 ${word ? 120 : 50} 23" aria-label="Legislativo Conectado">${seats}${w}</svg>`;
  };

  /* ---------- plenary geometry ---------- */
  function hemi(cx, cy, r0, r1, rows, count) {
    const radii = Array.from({ length: rows }, (_, i) => r0 + (r1 - r0) * (rows === 1 ? 0 : i / (rows - 1)));
    const sum = radii.reduce((a, b) => a + b, 0);
    const pts = [];
    let left = count;
    radii.forEach((r, i) => {
      const n = i === rows - 1 ? left : Math.round(count * r / sum);
      left -= n;
      for (let k = 0; k < n; k++) {
        const a = Math.PI + (n === 1 ? .5 : k / (n - 1)) * Math.PI;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    });
    return pts;
  }
  function paintMiniHemis() {
    $$('svg.mini-hemi').forEach(svg => {
      const n = +svg.dataset.n || 30;
      svg.innerHTML = hemi(110, 112, 42, 100, 4, n)
        .map(([x, y], i) => `<circle style="--i:${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/>`).join('');
    });
    $$('.video .mini-hemi circle').forEach((c, i) => { if (i % 7 === 3) c.classList.add('talk'); });
  }

  // Line art: the logo's plenary drawn as construction lines (concentric rows + aisles + a few seats).
  const ARCS = {
    cover: { cx: 1640, cy: 1240, r0: 220, step: 86, rows: 9, aisles: 7, seatRow: 2 },
    focus: { cx: 1720, cy: 1260, r0: 240, step: 90, rows: 9, aisles: 5, seatRow: 2 },
    close: { cx: 1560, cy: 1180, r0: 200, step: 80, rows: 9, aisles: 7, seatRow: 5 },
    side: { cx: 410, cy: 1160, r0: 180, step: 70, rows: 10, aisles: 5, seatRow: -1 },
  };
  function paintArcs() {
    $$('svg[data-arcs]').forEach(svg => {
      const g = ARCS[svg.dataset.arcs];
      let out = '', i = 0;
      const rMax = g.r0 + g.step * (g.rows - 1);
      for (let k = 0; k < g.rows; k++) {
        const r = g.r0 + g.step * k;
        out += `<path pathLength="1" style="--i:${i++}" d="M${g.cx - r} ${g.cy} A ${r} ${r} 0 0 1 ${g.cx + r} ${g.cy}"/>`;
      }
      for (let a = 1; a < g.aisles; a++) {
        const t = Math.PI + Math.PI * a / g.aisles;
        out += `<line pathLength="1" style="--i:${i++}" x1="${g.cx + Math.cos(t) * g.r0}" y1="${g.cy + Math.sin(t) * g.r0}" x2="${g.cx + Math.cos(t) * (rMax + 40)}" y2="${g.cy + Math.sin(t) * (rMax + 40)}"/>`;
      }
      if (g.seatRow >= 0) {
        const r = g.r0 + g.step * g.seatRow, n = 26;
        for (let s = 0; s < n; s++) {
          const t = Math.PI + Math.PI * (s + .5) / n;
          const lit = s % 6 === 2;
          out += `<circle style="--i:${s};--o:${lit ? 1 : .55}" cx="${(g.cx + Math.cos(t) * r).toFixed(1)}" cy="${(g.cy + Math.sin(t) * r).toFixed(1)}" r="${lit ? 5 : 3}"/>`;
        }
      }
      svg.innerHTML = out;
    });
  }

  // 02 · the city as a grid of people; a handful "know the answer"
  function paintCity() {
    const grid = $('.city-grid');
    if (!grid) return;
    const n = +grid.dataset.n || 144;
    const knows = new Set([23, 58, 97, 131, 162]);
    grid.innerHTML = Array.from({ length: n }, (_, k) => `<i style="--k:${k}"${knows.has(k) ? ' class="knows"' : ''}></i>`).join('');
  }

  /* ---------- stage scale ---------- */
  const stage = $('#stage');
  let scale = 1;
  function fit() {
    scale = Math.min(innerWidth / W, innerHeight / H);
    stage.style.setProperty('--s', scale);
  }

  /* ---------- slide controllers ---------- */
  const ctrls = {};
  let deckGo = null;

  // 04 · channel -> IA -> vereador
  ctrls.flow = (slide) => {
    const flow = $('.flow', slide), pkt = $('.packet', slide), ticket = $('.ticket', slide);
    const chans = $$('.chan', slide), dests = $$('.dest', slide);
    const D = [
      { ch: 2, dest: 1, msg: '“Tem um buraco enorme na minha rua”', tags: 'Infraestrutura · São José · Protocolo 2026-001284' },
      { ch: 0, dest: 0, msg: '“Falta médico no posto do bairro”', tags: 'Saúde · Jardim América · Protocolo 2026-001285' },
      { ch: 1, dest: 2, msg: '“Como consigo vaga em creche?”', tags: 'Educação · Centro · Protocolo 2026-001286' },
    ];
    let run = 0, idx = 0;
    const along = (path, ms, tok) => new Promise(res => {
      const len = path.getTotalLength(), t0 = performance.now();
      const step = now => {
        if (tok !== run) return res(false);
        const t = Math.min(1, (now - t0) / ms), p = path.getPointAtLength(len * ease(t));
        pkt.setAttribute('cx', p.x); pkt.setAttribute('cy', p.y);
        t < 1 ? requestAnimationFrame(step) : res(true);
      };
      requestAnimationFrame(step);
    });
    const clear = () => {
      chans.forEach(c => c.classList.remove('lit')); dests.forEach(d => d.classList.remove('lit'));
      $$('.wires path', slide).forEach(p => p.classList.remove('lit'));
      flow.classList.remove('pulse'); ticket.classList.remove('on');
      pkt.setAttribute('cx', -50); pkt.setAttribute('cy', -50);
    };
    async function play(d, tok) {
      clear();
      const win = $(`#w-in-${d.ch}`, slide), wout = $(`#w-out-${d.dest}`, slide);
      chans[d.ch].classList.add('lit'); win.classList.add('lit');
      $('.t-msg', ticket).textContent = d.msg; $('.t-tags', ticket).textContent = 'Classificando…';
      if (!await along(win, 1100, tok)) return;
      flow.classList.add('pulse'); ticket.classList.add('on');
      await sleep(800); if (tok !== run) return;
      $('.t-tags', ticket).textContent = d.tags;
      await sleep(1000); if (tok !== run) return;
      flow.classList.remove('pulse'); wout.classList.add('lit');
      if (!await along(wout, 1100, tok)) return;
      dests[d.dest].classList.add('lit');
      await sleep(1800); if (tok !== run) return;
      clear();
      await sleep(600); if (tok !== run) return;
      idx = (idx + 1) % D.length; play(D[idx], tok);
    }
    chans.forEach((c, i) => c.addEventListener('click', () => { idx = D.findIndex(d => d.ch === i); play(D[idx], ++run); }));
    return { enter() { play(D[idx], ++run); }, leave() { run++; clear(); } };
  };

  // 05 · org chart
  ctrls.org = (slide) => {
    const map = $('.org-map', slide), svg = $('.org-svg', slide), panel = $('.org-panel', slide), org = $('.org', slide);
    const N = [
      { id: 'cid', t: 'top', x: 590, y: 30, ic: 'users', l: 'Cidadão', g: 'Público', d: 'Entende, participa e recebe resposta pelo canal que preferir.' },
      { id: 'app', t: 'ch', x: 150, y: 130, ic: 'phone', l: 'App com IA', g: 'Canal do cidadão', d: 'Assistente de IA que tira dúvidas sobre a Câmara, registra demandas, acompanha protocolos e responde pesquisas. Inclui atendimento em LIBRAS por avatar.' },
      { id: 'portal', t: 'ch', x: 443, y: 130, ic: 'globe', l: 'Portal no site', g: 'Canal do cidadão', d: 'Entra no site atual da Câmara como widget. Conecta, não substitui.' },
      { id: 'wpp', t: 'ch', x: 736, y: 130, ic: 'chat', l: 'WhatsApp oficial', g: 'Canal do cidadão', d: 'Canal institucional com registro: a IA pede foto e local, gera protocolo e avisa cada etapa.' },
      { id: 'tv', t: 'ch', x: 1030, y: 130, ic: 'tv', l: 'TV Câmara ao vivo', g: 'Canal do cidadão', d: 'Usa a transmissão atual. Cada sessão vira aviso no celular de quem se interessa pelo tema.' },
      { id: 'hub', t: 'hub', x: 590, y: 245, ic: 'grid', l: 'Núcleo Legislativo Conectado', g: 'Núcleo', d: 'IA que responde com fonte oficial, triagem por tema e bairro, protocolo único e base de dados da Câmara. Na dúvida, passa para uma pessoa.' },
      { id: 'pv', t: 'mod', x: 98, y: 370, ic: 'panel', l: 'Painel do Vereador', g: 'Módulo', d: 'Demandas por bairro e tema, histórico de respostas e pesquisas na região de cada vereador.' },
      { id: 'pe', t: 'mod', x: 295, y: 370, ic: 'file', l: 'Processo eletrônico', g: 'Módulo', d: 'Do protocolo ao arquivo, sem papel, com rastreio de quem fez, quando e em que etapa está.' },
      { id: 'pq', t: 'mod', x: 492, y: 370, ic: 'clipboard', l: 'Pesquisas regionais', g: 'Módulo', d: 'Pesquisas pelo app e pelo WhatsApp, por bairro, com resultados no mapa ao lado das demandas.' },
      { id: 'com', t: 'mod', x: 689, y: 370, ic: 'users', l: 'Área das Comissões', g: 'Módulo', d: 'Pautas, documentos e audiências públicas das comissões em um só lugar.' },
      { id: 'ca', t: 'mod', x: 886, y: 370, ic: 'megaphone', l: 'Comunicação ativa', g: 'Módulo', d: 'Avisos de sessão, convites para audiências e retorno das demandas direto no celular do cidadão.' },
      { id: 'pg', t: 'mod', x: 1083, y: 370, ic: 'gauge', l: 'Painel de gestão', g: 'Módulo', d: 'Visão da Mesa: volume de demandas, temas, bairros, prazos e satisfação do cidadão.' },
      { id: 'ver', t: 'bot', x: 300, y: 478, ic: 'user', l: 'Vereadores', g: 'Quem usa', d: 'Recebem a demanda certa e registram a prova do trabalho que fazem.' },
      { id: 'mesa', t: 'bot', x: 880, y: 478, ic: 'building', l: 'Mesa, servidores e ouvidoria', g: 'Quem usa', d: 'A IA faz a triagem; o servidor cuida do que precisa de gente. A Mesa tem dados para decidir.' },
    ];
    const E = [['cid', 'app'], ['cid', 'portal'], ['cid', 'wpp'], ['cid', 'tv'],
      ['app', 'hub'], ['portal', 'hub'], ['wpp', 'hub'], ['tv', 'hub'],
      ['hub', 'pv'], ['hub', 'pe'], ['hub', 'pq'], ['hub', 'com'], ['hub', 'ca'], ['hub', 'pg'],
      ['pv', 'ver'], ['pq', 'ver'], ['pq', 'mesa'], ['pe', 'mesa'], ['com', 'mesa'], ['ca', 'mesa'], ['pg', 'mesa']];
    const byId = Object.fromEntries(N.map(n => [n.id, n]));
    svg.innerHTML = E.map(([a, b]) => {
      const A = byId[a], B = byId[b], my = (A.y + B.y) / 2;
      return `<path d="M${A.x} ${A.y} C ${A.x} ${my}, ${B.x} ${my}, ${B.x} ${B.y}"/>`;
    }).join('');
    N.forEach(n => {
      const b = document.createElement('button');
      b.className = `node ${n.t}`; b.dataset.id = n.id;
      b.style.left = n.x + 'px'; b.style.top = n.y + 'px';
      b.innerHTML = `<span class="ic">${icon(n.ic)}</span><span>${n.l}</span>`;
      b.addEventListener('click', () => select(n.id));
      map.appendChild(b);
    });
    const paths = $$('path', svg), nodes = $$('.node', map);
    function select(id) {
      const n = byId[id], rel = new Set([id]);
      E.forEach(([a, b], i) => {
        const on = a === id || b === id;
        paths[i].classList.toggle('lit', on);
        if (on) { rel.add(a); rel.add(b); }
      });
      nodes.forEach(el => { el.classList.toggle('sel', el.dataset.id === id); el.classList.toggle('rel', rel.has(el.dataset.id)); });
      org.classList.add('focus');
      $('.op-group', panel).textContent = n.g;
      $('.op-title', panel).textContent = n.l;
      $('.op-desc', panel).textContent = n.d;
      panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    }
    select('hub');
    return {};
  };

  // 06 · audiences
  $$('.aud .col').forEach(c => c.addEventListener('click', () => {
    $$('.aud .col').forEach(x => x.classList.toggle('on', x === c));
  }));

  // 07 · zero paper + regional map
  ctrls.paper = (slide) => {
    const STAGES = [
      ['Protocolo', 'Protocolo geral'], ['Proposição', 'Ver. Ana Lima'], ['Comissões', 'Comissão de Obras'],
      ['Plenário', 'Aprovado em sessão'], ['Publicação', 'Diário Oficial'], ['Arquivo', 'Arquivo digital'],
    ];
    const stops = $('.pipe-stops', slide), fill = $('.pipe-fill', slide), log = $('.log', slide);
    stops.innerHTML = STAGES.map(s => `<span class="stop"><i></i><em>${s[0]}</em></span>`).join('');
    const stopEls = $$('.stop', stops);
    let k = -1, timer = null, minute = 9 * 60 + 12;
    function tick() {
      k = (k + 1) % (STAGES.length + 1);
      if (k === STAGES.length) {
        k = -1; log.innerHTML = ''; fill.style.width = '0%';
        stopEls.forEach(s => s.classList.remove('done', 'cur'));
        return;
      }
      fill.style.width = (100 * k / (STAGES.length - 1)) + '%';
      stopEls.forEach((s, i) => { s.classList.toggle('done', i <= k); s.classList.toggle('cur', i === k); });
      minute += 7 + (k * 13) % 40;
      const hh = String(Math.floor(minute / 60) % 24).padStart(2, '0'), mm = String(minute % 60).padStart(2, '0');
      const li = document.createElement('li');
      li.innerHTML = `<span>${hh}:${mm}</span><b>${STAGES[k][0]}</b><span>${STAGES[k][1]} · PL 045/2026</span>`;
      log.appendChild(li);
      while (log.children.length > 6) log.firstChild.remove();
    }

    const svg = $('.map-svg', slide), tip = $('.map-tip', slide), mapBox = $('.map', slide);
    const R = [
      { n: 'Centro', x: 380, y: 185, dem: 64, pes: ['Mobilidade', 48] },
      { n: 'Vila Nova', x: 200, y: 110, dem: 41, pes: ['Iluminação', 55] },
      { n: 'Jardim América', x: 545, y: 95, dem: 52, pes: ['Saúde', 62] },
      { n: 'São José', x: 600, y: 270, dem: 88, pes: ['Vias', 71] },
      { n: 'Boa Vista', x: 160, y: 270, dem: 35, pes: ['Saneamento', 58] },
      { n: 'Industrial', x: 705, y: 170, dem: 22, pes: ['Segurança', 44] },
      { n: 'Santa Rita', x: 385, y: 330, dem: 47, pes: ['Educação', 51] },
    ];
    let mode = 'dem';
    const dots = [];
    for (let y = 12; y < 400; y += 17) for (let x = 12; x < 760; x += 17) {
      const e = ((x - 380) / 360) ** 2 + ((y - 200) / 190) ** 2;
      if (e > 1 + .12 * Math.sin(x / 38) + .1 * Math.cos(y / 27)) continue;
      let best = 0, bd = 1e9;
      R.forEach((r, i) => { const d = (r.x - x) ** 2 + (r.y - y) ** 2; if (d < bd) { bd = d; best = i; } });
      dots.push({ x, y, g: best });
    }
    svg.innerHTML = dots.map(d => `<circle cx="${d.x}" cy="${d.y}" r="4.6" fill="#005CFF" data-g="${d.g}"/>`).join('') +
      R.map(r => `<text class="map-lbl" x="${r.x}" y="${r.y + 5}" text-anchor="middle">${r.n}</text>`).join('');
    const circles = $$('circle', svg);
    const val = r => mode === 'dem' ? r.dem / 88 : r.pes[1] / 71;
    function paint(hover = -1) {
      circles.forEach((c, i) => {
        const g = dots[i].g, v = val(R[g]);
        c.style.opacity = hover < 0 ? (.1 + .9 * v * v) : (g === hover ? 1 : .08);
      });
    }
    function show(g) {
      paint(g);
      const r = R[g], s = mapBox.clientWidth / 760;
      tip.innerHTML = mode === 'dem'
        ? `<b>${r.n}</b><span>${r.dem} demandas</span> no mês`
        : `<b>${r.n}</b>Prioridade: <span>${r.pes[0]} · ${r.pes[1]}%</span>`;
      tip.style.left = r.x * s + 'px'; tip.style.top = (r.y - 12) * (mapBox.clientHeight / 400) + 'px';
      tip.classList.add('on');
    }
    svg.addEventListener('pointermove', e => { const g = e.target.dataset && e.target.dataset.g; if (g != null) show(+g); });
    svg.addEventListener('pointerleave', () => { paint(); tip.classList.remove('on'); });
    $$('.seg button', slide).forEach(b => b.addEventListener('click', () => {
      mode = b.dataset.mode;
      $$('.seg button', slide).forEach(x => x.classList.toggle('on', x === b));
      paint(); tip.classList.remove('on');
    }));
    const foot = document.createElement('span'); foot.className = 'map-foot'; foot.textContent = 'Mapa e números ilustrativos';
    mapBox.appendChild(foot);
    paint();

    return {
      enter() { clearInterval(timer); k = -1; log.innerHTML = ''; tick(); timer = setInterval(tick, 1500); },
      leave() { clearInterval(timer); },
    };
  };

  // 08 · Dona Maria's journey (each step is a build)
  ctrls.journey = (slide) => {
    const scrs = $$('.scr', slide), items = $$('.steps li', slide), btn = $('.play', slide);
    let timer = null;
    const label = (ic, t) => { $('.ic', btn).innerHTML = icon(ic); $('.pl-t', btn).textContent = t; };
    const stop = () => { clearInterval(timer); timer = null; label('play', 'Reproduzir jornada'); };
    items.forEach((li, i) => li.addEventListener('click', () => { stop(); deckGo(cur, i); }));
    btn.addEventListener('click', () => {
      if (timer) return stop();
      if (step >= 7) deckGo(cur, 0);
      label('pause', 'Pausar');
      timer = setInterval(() => { if (step >= 7) return stop(); next(); }, 3600);
    });
    $$('.stars button', slide).forEach((s, i, all) => s.addEventListener('click', () => {
      all.forEach((x, j) => x.classList.toggle('on', j <= i));
      $('.rate', slide).classList.add('rated');
    }));
    const yes = $('.inv-yes', slide);
    yes.addEventListener('click', () => { yes.classList.add('ok'); yes.textContent = 'Presença confirmada'; });
    return {
      steps: 7,
      set(s) {
        scrs.forEach((el, i) => el.classList.toggle('on', i === s));
        items.forEach((li, i) => { li.classList.toggle('done', i < s); li.classList.toggle('cur', i === s); });
      },
      leave: stop,
    };
  };

  // 13 · next step choice
  ctrls.next = (slide) => {
    const opts = $$('.opt', slide), when = $('.when', slide), inp = $('.when-in', slide);
    const pick = v => {
      opts.forEach(o => o.classList.toggle('on', o.dataset.opt === v));
      when.classList.toggle('on', !!v);
    };
    opts.forEach(o => o.addEventListener('click', () => {
      const v = o.classList.contains('on') ? '' : o.dataset.opt;
      pick(v); store.set('next', v);
    }));
    inp.value = store.get('when') || '';
    inp.addEventListener('change', () => store.set('when', inp.value));
    pick(store.get('next') || '');
    return {};
  };

  /* ---------- editable cover fields ---------- */
  function initEdits() {
    const url = new URLSearchParams(location.search);
    const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const vals = {
      camara: url.get('camara') ?? store.get('camara') ?? '',
      data: url.get('data') ?? store.get('data') ?? today,
    };
    const bind = () => $$('[data-bind="camara-short"]').forEach(el => { el.textContent = vals.camara.trim() || 'Câmara'; });
    $$('.edit').forEach(el => {
      const k = el.dataset.key;
      el.textContent = vals[k];
      el.addEventListener('input', () => { vals[k] = el.textContent; store.set(k, el.textContent); bind(); });
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); el.blur(); } });
    });
    bind();
  }

  /* ---------- deck ---------- */
  const slides = $$('.slide');
  const last = slides.length - 1;
  let cur = -1, step = 0;
  const C = slides.map(s => (s.dataset.ctrl && ctrls[s.dataset.ctrl]) ? ctrls[s.dataset.ctrl](s) : {});
  const stepsOf = i => C[i].steps ?? $$('.frag', slides[i]).length;

  function applyStep() {
    const s = slides[cur];
    if (C[cur].set) C[cur].set(step);
    else $$('.frag', s).forEach((f, k) => f.classList.toggle('shown', k < step));
    s.className = s.className.replace(/\bs-\d+\b/g, '').trim() + ' s-' + step;
  }
  function go(i, s = 0) {
    i = Math.max(0, Math.min(last, i));
    if (i !== cur) {
      if (cur >= 0 && C[cur].leave) C[cur].leave();
      slides.forEach((el, k) => el.classList.toggle('active', k === i));
      cur = i;
      const t = 't-' + slides[i].dataset.theme;
      stage.classList.remove('t-light', 't-dark', 't-blue', 't-paper'); stage.classList.add(t);
      stage.classList.toggle('chrome-off', slides[i].dataset.chrome === 'off');
      document.body.classList.remove('t-light', 't-dark', 't-blue', 't-paper'); document.body.classList.add(t);
      $('.c-sec').textContent = slides[i].dataset.sec || '';
      stage.classList.toggle('rc-blue', slides[i].dataset.rc === 'blue');
      if (C[i].enter) C[i].enter();
      try { history.replaceState(null, '', '#' + (i + 1)); } catch {}
    }
    step = Math.max(0, Math.min(stepsOf(i), s));
    applyStep();
    ui();
  }
  deckGo = go;
  function next() { if (step < stepsOf(cur)) { step++; applyStep(); } else if (cur < last) go(cur + 1, 0); }
  function prev() { if (step > 0) { step--; applyStep(); } else if (cur > 0) go(cur - 1, stepsOf(cur - 1)); }

  /* ---------- chrome ---------- */
  const ctrlBar = $('.ctrls'), ov = $('.overview');
  const pad = n => String(n).padStart(2, '0');
  function ui() {
    $('.count').textContent = `${pad(cur + 1)} / ${pad(slides.length)}`;
    $('.c-page').textContent = cur === 0 ? '' : `${pad(cur + 1)} / ${pad(slides.length)}`;
    $('.progress i').style.width = (100 * cur / last) + '%';
    $$('.ov-card').forEach((c, k) => c.classList.toggle('cur', k === cur));
  }
  $('.ov-grid').innerHTML = slides.map((s, i) => {
    const th = s.dataset.theme === 'dark' ? 'dk' : s.dataset.theme === 'blue' ? 'bl' : '';
    return `<button class="ov-card ${th}" data-i="${i}"><small>${pad(i + 1)}</small><span>${s.dataset.title}</span></button>`;
  }).join('');
  $$('.ov-card').forEach(c => c.addEventListener('click', () => { go(+c.dataset.i, 0); toggleOv(false); }));
  const toggleOv = on => ov.classList.toggle('on', on ?? !ov.classList.contains('on'));
  const full = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch {} };
  $$('.ctrls button').forEach(b => b.addEventListener('click', () => {
    ({ prev, next, grid: () => toggleOv(), full })[b.dataset.act]();
  }));
  let hideT;
  stage.addEventListener('pointermove', () => {
    ctrlBar.classList.add('on'); clearTimeout(hideT);
    hideT = setTimeout(() => { if (!ctrlBar.matches(':hover')) ctrlBar.classList.remove('on'); }, 2000);
  });

  document.addEventListener('keydown', e => {
    const t = e.target;
    if (t.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
    const k = e.key;
    if (['ArrowRight', 'PageDown', ' ', 'ArrowDown'].includes(k)) { e.preventDefault(); if (!ov.classList.contains('on')) next(); }
    else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(k)) { e.preventDefault(); if (!ov.classList.contains('on')) prev(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(last);
    else if (k === 'o' || k === 'O' || k === 'g' || k === 'G') toggleOv();
    else if (k === 'Escape') toggleOv(false);
    else if (k === 'f' || k === 'F') full();
  });
  let tx = 0, ty = 0;
  stage.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
  });

  // in-slide buttons: data-act="next" advances, data-go="n" jumps to slide n
  $$('.slide [data-act="next"]').forEach(b => b.addEventListener('click', () => next()));
  $$('.slide [data-go]').forEach(b => b.addEventListener('click', () => go(+b.dataset.go - 1, 0)));

  // cover card texture: plenary rows drawn as fine contour lines
  function paintCardArt() {
    const svg = $('.cv-card-art');
    if (!svg) return;
    let out = '';
    for (let k = 0; k < 22; k++) {
      const r = 40 + k * 13, w = 6 + (k % 4) * 2;
      let d = '';
      for (let s = 0; s <= 60; s++) {
        const t = Math.PI + Math.PI * s / 60;
        const rr = r + Math.sin(s / 6 + k * .7) * w * .5;
        d += (s ? ' L' : 'M') + (300 + Math.cos(t) * rr).toFixed(1) + ' ' + (250 + Math.sin(t) * rr * .78).toFixed(1);
      }
      out += `<path d="${d}"/>`;
    }
    svg.innerHTML = out;
  }

  /* ---------- boot ---------- */
  $$('[data-logo]').forEach(el => { el.innerHTML = logoSVG(true); });
  $$('[data-seat]').forEach(el => { el.innerHTML = logoSVG(false); });
  $$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  paintMiniHemis();
  paintArcs();
  paintCity();
  paintCardArt();
  initEdits();
  addEventListener('resize', fit);
  addEventListener('hashchange', () => { const n = parseInt(location.hash.slice(1), 10); if (n - 1 !== cur && n >= 1) go(n - 1, 0); });
  fit();
  const h = parseInt(location.hash.slice(1), 10);
  go(Number.isFinite(h) ? h - 1 : 0, 0);
})();
