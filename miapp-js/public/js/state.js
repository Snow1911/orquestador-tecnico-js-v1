/* ═══════════════════════════════════════════════════════
   PHASE 1 STATE MACHINE
   ═══════════════════════════════════════════════════════ */
const State = {
  phase:     'free',
  frontend:  null,
  backend:   [],
  noBackend: false,
};

function resetState() {
  State.phase = 'free'; State.frontend = null; State.backend = []; State.noBackend = false;
  updateSelectionsBar(); updatePhaseHint();
}

function updateSelectionsBar() {
  const bar  = document.getElementById('selectionsBar');
  const feEl = document.getElementById('selFrontend');
  const beEl = document.getElementById('selBackend');
  const hasAny = State.frontend || State.backend.length > 0;
  bar.classList.toggle('visible', hasAny);
  if (State.frontend) {
    feEl.innerHTML = `<span class="sel-label">◱ FRONTEND</span><span class="sel-chip">${escapeHtml(State.frontend.label)}</span>`;
  } else {
    feEl.innerHTML = `<span class="sel-label dim">◱ FRONTEND</span><span class="sel-empty">—</span>`;
  }
  if (State.backend.length > 0) {
    const chips = State.backend.map(b=>`<span class="sel-chip green">${escapeHtml(b.label)}</span>`).join('<span class="sel-plus"> + </span>');
    beEl.innerHTML = `<span class="sel-label">◳ BACKEND</span>${chips}`;
  } else {
    beEl.innerHTML = `<span class="sel-label dim">◳ BACKEND</span><span class="sel-empty">—</span>`;
  }
  adjustStagePadding();
}

function updatePhaseHint() {
  const el = document.getElementById('phaseHint');
  const text = document.getElementById('phaseHintText');
  const hints = {
    'navigating_backend':          '◳ Selecciona tu stack de Backend (Servicios Cloud o Base de Datos)',
    'navigating_second_backend':   '◆ Agrega la segunda capa de Backend para completar el stack',
    'navigating_frontend_forced':  '◱ Ahora selecciona tu plataforma de Frontend para continuar',
    'must_frontend':               '◱ Backend listo — necesitas seleccionar también el Frontend',
  };
  const msg = hints[State.phase] || '';
  el.classList.toggle('visible', !!msg);
  text.textContent = msg;
  adjustStagePadding();
}

function adjustStagePadding() {
  const stage   = document.getElementById('stage');
  const barVis  = document.getElementById('selectionsBar').classList.contains('visible');
  const hintVis = document.getElementById('phaseHint').classList.contains('visible');
  stage.className = 'stage';
  if (barVis && hintVis) stage.classList.add('bar-and-hint');
  else if (barVis)       stage.classList.add('bar-visible');
  else if (hintVis)      stage.classList.add('hint-visible');
}

function getOtherSubLabel() {
  if (!State.backend.length) return 'un servicio Backend';
  return State.backend[0].subcategoria === 'cloud' ? 'una Base de Datos' : 'un Servicio Cloud';
}
function getOtherSubNodeId() {
  if (!State.backend.length) return 'n3';
  return State.backend[0].subcategoria === 'cloud' ? 'n42' : 'n36';
}
