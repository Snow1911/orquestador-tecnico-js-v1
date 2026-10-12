/* ═══════════════════════════════════════════════════════
   PHASE 2 STATE
   ═══════════════════════════════════════════════════════ */
const P2 = {
  source:     null,      // 'phase1' | 'manual'
  deployment: null,      // { branch, icon, label, phase1Label, currentTool }
  database:   null,      // { label, icon, currentTool }
  cloud:      null,      // { label, icon, currentTool }
  sections:   [],        // ['deployment','database','cloud'] — only what applies
  responses:  {},        // { deployment: 'text...', database: '...', cloud: '...' }
  activeSection: null,
};

function p2Reset() {
  P2.source = null; P2.deployment = null; P2.database = null; P2.cloud = null;
  P2.sections = []; P2.responses = {}; P2.activeSection = null;
}

function p2BuildSections() {
  P2.sections = [];
  if (P2.deployment) P2.sections.push('deployment');
  if (P2.database)   P2.sections.push('database');
  if (P2.cloud)      P2.sections.push('cloud');
}

/* ── Enter Phase 2 from Phase 1 ── */
function enterPhase2FromPhase1() {
  p2Reset();
  P2.source = 'phase1';

  if (State.frontend) {
    const map = LABEL_TO_BRANCH[State.frontend.label] || { branch:'web', icon:'◐', label:'Web' };
    P2.deployment = { branch:map.branch, icon:map.icon, label:map.label, phase1Label:State.frontend.label, currentTool:null };
  }

  for (const b of State.backend) {
    if (b.subcategoria === 'db') {
      const m = getMeta(b.label);
      P2.database = { label:b.label, icon:m.icon||'◆', currentTool:b.label, branch:'database' };
    } else if (b.subcategoria === 'cloud') {
      const m = getMeta(b.label);
      P2.cloud = { label:b.label, icon:m.icon||'☁', currentTool:b.label, branch:'cloud' };
    }
  }

  p2BuildSections();
  openP2Panel();
}

/* ── Enter Phase 2 from Manual ── */
function enterPhase2FromManual() {
  const feVal    = document.getElementById('manualFrontend').value;
  const dbVal    = document.getElementById('manualDB').value;
  const cloudVal = document.getElementById('manualCloud').value;

  p2Reset();
  P2.source = 'manual';

  if (feVal && feVal !== 'none') {
    const parts  = feVal.split('|');
    const branch = parts[0];
    const tool   = parts[1] || '';
    const bData  = MANUAL_BRANCHES[branch] || { icon:'◈', label:branch };
    P2.deployment = { branch, icon:bData.icon, label:bData.label, phase1Label:null, currentTool:tool };
  }

  if (dbVal && dbVal !== 'none') {
    const m = getMeta(dbVal);
    P2.database = { label:dbVal, icon:m.icon||'◆', currentTool:dbVal, branch:'database' };
  }

  if (cloudVal && cloudVal !== 'none') {
    const m = getMeta(cloudVal);
    P2.cloud = { label:cloudVal, icon:m.icon||'☁', currentTool:cloudVal, branch:'cloud' };
  }

  p2BuildSections();
  closeManualPanel();
  openP2Panel();
}

/* ═══════════════════════════════════════════════════════
   PHASE 2 UI
   ═══════════════════════════════════════════════════════ */
function openP2Panel() {
  if (!P2.sections.length) { alert('Selecciona al menos una herramienta.'); return; }
  renderP2CtxBar();
  renderP2CatGrid();
  showView('selector');
  document.getElementById('p2Panel').classList.add('open');
  document.getElementById('p2Panel').querySelector('.p2-scroll').scrollTop = 0;
}

function closeP2Panel() {
  document.getElementById('p2Panel').classList.remove('open');
}

function showView(which) {
  const sel = document.getElementById('p2SelectorView');
  const res = document.getElementById('p2ResponseView');
  if (which === 'selector') {
    sel.style.display = 'flex'; res.style.display = 'none';
  } else {
    sel.style.display = 'none'; res.style.display = 'flex';
  }
  document.getElementById('p2Panel').querySelector('.p2-scroll').scrollTop = 0;
}

/* Context bar (stack summary chips) */
function renderP2CtxBar() {
  const bar = document.getElementById('p2CtxBar');
  const items = [];
  if (P2.deployment) items.push({ icon:P2.deployment.icon, text:P2.deployment.currentTool||P2.deployment.phase1Label||P2.deployment.label, color:'#60A5FA' });
  if (P2.database)   items.push({ icon:'◆', text:P2.database.currentTool||P2.database.label, color:'#FBBF24' });
  if (P2.cloud)      items.push({ icon:'☁', text:P2.cloud.currentTool||P2.cloud.label,       color:'#38BDF8' });

  bar.innerHTML = items.map(it => `
    <div class="p2-ctx-chip">
      <div class="p2-ctx-dot" style="background:${it.color}"></div>
      <span>${it.icon} ${escapeHtml(it.text)}</span>
    </div>
  `).join('');
}

/* Category selection cards */
function renderP2CatGrid() {
  const grid = document.getElementById('p2CatGrid');
  grid.innerHTML = '';

  const CAT_META = {
    deployment: { icon: P2.deployment?.icon||'◱', label:'Despliegue',   sub: P2.deployment?.label||'',  tool:P2.deployment?.currentTool||P2.deployment?.phase1Label||'' },
    database:   { icon: P2.database?.icon||'◆',   label:'Base de Datos', sub: P2.database?.label||'',    tool:P2.database?.currentTool||'' },
    cloud:      { icon: P2.cloud?.icon||'☁',       label:'Servicio Cloud',sub: P2.cloud?.label||'',       tool:P2.cloud?.currentTool||'' },
  };

  for (const key of P2.sections) {
    const meta      = CAT_META[key];
    const isDone    = !!P2.responses[key];
    const card      = document.createElement('div');
    card.className  = `p2-cat-card${isDone?' completed':''}`;
    card.dataset.cat = key;

    card.innerHTML = `
      <div class="p2-card-stripe"></div>
      <span class="p2-cat-status ${isDone?'done':'pending'}">${isDone?'✓ LISTA':'PENDIENTE'}</span>
      <span class="p2-cat-icon">${meta.icon}</span>
      <div class="p2-cat-label">${meta.label}</div>
      <div class="p2-cat-sub">${meta.sub}</div>
      ${meta.tool ? `<div class="p2-cat-tool">${escapeHtml(meta.tool)}</div>` : ''}
      <span class="p2-cat-arrow">→</span>
    `;
    card.addEventListener('click', () => openP2Section(key));
    grid.appendChild(card);
  }

  checkAllDone();
}

function checkAllDone() {
  const allDone = P2.sections.every(s => !!P2.responses[s]);
  document.getElementById('p2TerminarWrap').style.display = allDone ? 'block' : 'none';
}

/* Open a section (with cache) */
function openP2Section(category) {
  P2.activeSection = category;

  const CAT_LABELS = {
    deployment: `${P2.deployment?.icon||'◱'} DESPLIEGUE`,
    database:   '◆ BASE DE DATOS',
    cloud:      '☁ SERVICIO CLOUD',
  };
  document.getElementById('p2SectionLabel').textContent = CAT_LABELS[category] || category.toUpperCase();

  const dot = document.getElementById('p2SectionDot');

  showView('response');

  if (P2.responses[category]) {
    // Cached — just render
    dot.className = 'p2-section-dot done';
    renderMarkdown(document.getElementById('p2Content'), P2.responses[category]);
    return;
  }

  // Stream new response
  dot.className = 'p2-section-dot';
  dot.style.animation = 'pulse 1.4s ease-in-out infinite';
  document.getElementById('p2Content').innerHTML = '<span class="cursor"></span>';
  streamP2Section(category);
}

async function streamP2Section(category) {
  const dot = document.getElementById('p2SectionDot');
  const contentEl = document.getElementById('p2Content');

  let data = {};
  if (category === 'deployment' && P2.deployment) {
    data = { category:'deployment', branch:P2.deployment.branch, currentTool:P2.deployment.currentTool||'', phase1Label:P2.deployment.phase1Label||'' };
  } else if (category === 'database' && P2.database) {
    data = { category:'database', branch:'database', currentTool:P2.database.currentTool||'', phase1Label:P2.database.label||'' };
  } else if (category === 'cloud' && P2.cloud) {
    data = { category:'cloud', branch:'cloud', currentTool:P2.cloud.currentTool||'', phase1Label:P2.cloud.label||'' };
  }

  const stream = createMarkdownStream(contentEl);

  try {
    await streamSSE('/api/fase2', data, {
      onText: (chunk) => stream.append(chunk),
      onDone: () => {
        stream.finish();
        dot.className = 'p2-section-dot done';
        P2.responses[category] = stream.text; // cache de la respuesta
      },
    });
  } catch (err) {
    showError(contentEl, err.message);
    dot.className = 'p2-section-dot';
  }
}

/* Back to selector from response */
document.getElementById('p2BackToCatsBtn').addEventListener('click', () => {
  renderP2CatGrid();   // refresh (marks completed)
  showView('selector');
});

/* Exit Phase 2 */
document.getElementById('p2ExitBtn').addEventListener('click', () => {
  closeP2Panel();
  p2Reset();
  resetState();
  navStack = [{ nodeId:'n1', label:nodos['n1']?.label||'Infraestructura' }];
  renderStage();
});

/* Terminar */
document.getElementById('p2TerminarBtn').addEventListener('click', () => {
  closeP2Panel();
  p2Reset();
  resetState();
  navStack = [{ nodeId:'n1', label:nodos['n1']?.label||'Infraestructura' }];
  renderStage();
});
