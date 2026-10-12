/* ═══════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════ */
let nodos    = {};
let navStack = [];

const NAV_PATHS = {
  'n2':  () => [{ nodeId:'n1',label:nodos.n1.label },{ nodeId:'n2',label:nodos.n2.label }],
  'n3':  () => [{ nodeId:'n1',label:nodos.n1.label },{ nodeId:'n3',label:nodos.n3.label }],
  'n4':  () => [{ nodeId:'n1',label:nodos.n1.label },{ nodeId:'n2',label:nodos.n2.label },{ nodeId:'n4',label:nodos.n4.label }],
  'n36': () => [{ nodeId:'n1',label:nodos.n1.label },{ nodeId:'n3',label:nodos.n3.label },{ nodeId:'n36',label:nodos.n36.label }],
  'n42': () => [{ nodeId:'n1',label:nodos.n1.label },{ nodeId:'n3',label:nodos.n3.label },{ nodeId:'n42',label:nodos.n42.label }],
};

function navigateTo(nodeId) {
  navStack = NAV_PATHS[nodeId] ? NAV_PATHS[nodeId]() : [{ nodeId:'n1', label:nodos.n1.label }];
  renderStage();
}

/* ═══════════════════════════════════════════════════════
   LEAF HANDLER
   ═══════════════════════════════════════════════════════ */
function handleLeafSelected(nodeId, info) {
  const rama   = info.rama;
  const camino = navStack.map(x=>x.label).concat(info.label);
  const leafData = { label:info.label, camino, tecnologias:info.tecnologias||[] };

  if (rama === 'frontend') {
    State.frontend = leafData;
    updateSelectionsBar();
    if (State.phase === 'navigating_frontend_forced') {
      State.phase = 'second_backend_offer';
      updatePhaseHint();
      showModal({
        tag:'✓ FRONTEND LISTO', icon:'◱', title:`${info.label} seleccionado`,
        desc:`Tu stack de Frontend está listo. ¿Deseas agregar también <strong>${getOtherSubLabel()}</strong> para completar la arquitectura?`,
        actions:[
          { label:`Sí, agregar ${getOtherSubLabel()}`, primary:true, cb:()=>startSecondBackend() },
          { label:'No, generar ruta ahora', cb:()=>generateResponse() }
        ]
      });
    } else {
      State.phase = 'backend_decision';
      updatePhaseHint();
      showModal({
        tag:'✓ FRONTEND LISTO', icon:'◱', title:`${info.label} seleccionado`,
        desc:`¿Deseas configurar también el <strong>Backend</strong> de tu aplicación? Puedes elegir hasta un Servicio Cloud y una Base de Datos.`,
        actions:[
          { label:'Sí, configurar Backend →', primary:true, cb:()=>startBackendNavigation() },
          { label:'No, la IA recomendará uno', cb:()=>{ State.noBackend=true; generateResponse(); } }
        ]
      });
    }
  } else if (rama === 'backend') {
    const subcategoria = info.subcategoria;
    const beData = { ...leafData, subcategoria };
    if (State.phase === 'free') {
      State.backend.push(beData); updateSelectionsBar();
      State.phase = 'must_frontend'; updatePhaseHint();
      showModal({
        tag:'◳ BACKEND LISTO', icon:'◳', title:'Ahora elige el Frontend',
        desc:`<strong>${info.label}</strong> configurado. Para completar la arquitectura, selecciona tu plataforma de <strong>Frontend</strong>.`,
        actions:[{ label:'Explorar Frontend →', primary:true, cb:()=>startFrontendNavigation() }]
      });
    } else if (State.phase === 'navigating_backend') {
      State.backend.push(beData); updateSelectionsBar();
      State.phase = 'second_backend_offer'; updatePhaseHint();
      showModal({
        tag: subcategoria==='cloud'?'☁ CLOUD LISTO':'◆ BD LISTA',
        icon: subcategoria==='cloud'?'☁':'◆',
        title:`${info.label} seleccionado`,
        desc:`¿También quieres agregar <strong>${getOtherSubLabel()}</strong> para tener un stack más completo?`,
        actions:[
          { label:`Sí, agregar ${getOtherSubLabel()}`, primary:true, cb:()=>startSecondBackend() },
          { label:'No, generar ruta ahora', cb:()=>generateResponse() }
        ]
      });
    } else if (State.phase === 'navigating_second_backend') {
      if (State.backend[0].subcategoria === subcategoria) { closeModal(); return; }
      State.backend.push(beData); updateSelectionsBar();
      generateResponse();
    }
  }
}

function startBackendNavigation()   { closeModal(); State.phase='navigating_backend'; updatePhaseHint(); navigateTo('n3'); }
function startFrontendNavigation()  { closeModal(); State.phase='navigating_frontend_forced'; updatePhaseHint(); navigateTo('n4'); }
function startSecondBackend()       { closeModal(); State.phase='navigating_second_backend'; updatePhaseHint(); navigateTo(getOtherSubNodeId()); }
function generateResponse()         { closeModal(); showAiPanel({ frontend:State.frontend, backend:State.backend, noBackend:State.noBackend }); }

/* ═══════════════════════════════════════════════════════
   RENDER STAGE
   ═══════════════════════════════════════════════════════ */
function renderStage() {
  const { nodeId } = navStack[navStack.length-1];
  const info       = nodos[nodeId];
  if (!info) return;

  updateBreadcrumb();

  const eyebrow = document.getElementById('eyebrow');
  const titleEl = document.getElementById('stageTitle');
  const hintEl  = document.getElementById('stageHint');
  const grid    = document.getElementById('nodesGrid');
  const alrWrap = document.getElementById('alreadyWrap');

  eyebrow.classList.remove('show'); titleEl.classList.remove('show'); hintEl.classList.remove('show');
  alrWrap.classList.remove('show');
  grid.innerHTML = '';

  const depth = navStack.length;
  const hijos = info.hijos || [];

  eyebrow.textContent = depth===1 ? 'PUNTO DE PARTIDA' : `NIVEL ${depth} · ${hijos.length} OPCIONES`;
  titleEl.innerHTML   = buildTitle(info.label);
  hintEl.textContent  = `// ${hijos.length} opción${hijos.length!==1?'es':''} disponible${hijos.length!==1?'s':''}`;

  requestAnimationFrame(() => {
    eyebrow.classList.add('show'); titleEl.classList.add('show'); hintEl.classList.add('show');
    // Show "already have app" button only at root
    if (depth === 1) alrWrap.classList.add('show');
  });

  hijos.forEach((hId, i) => {
    const child  = nodos[hId];
    if (!child)  return;
    const isLeaf = !child.hijos || child.hijos.length===0;
    const meta   = getMeta(child.label);
    const card   = document.createElement('div');
    card.className = `node-card${isLeaf?' leaf':''}`;
    card.style.setProperty('--card-color', meta.color);
    card.style.setProperty('--card-glow', hexAlpha(meta.color,.18));
    card.innerHTML = `
      <div class="card-stripe"></div>
      ${isLeaf?'<div class="leaf-badge"><span class="leaf-dot"></span>DESTINO FINAL</div>':''}
      <span class="card-icon">${meta.icon}</span>
      <div class="card-label">${escapeHtml(child.label)}</div>
      <div class="card-hint">${isLeaf?'⚡ clic para seleccionar':meta.hint}</div>
      ${isLeaf&&child.tecnologias?`<div class="tech-tags">${child.tecnologias.map(t=>`<span class="tech-tag">${escapeHtml(t)}</span>`).join('')}</div>`:''}
      <span class="card-arrow">→</span>
    `;
    card.addEventListener('click', e => onCardClick(hId, e));
    grid.appendChild(card);
    setTimeout(() => card.classList.add('entered'), UI.CARD_ENTER_DELAY_MS + i * UI.CARD_STAGGER_MS);
  });
}

function buildTitle(label) {
  const words = label.split(' ');
  if (words.length===1) return `Elige <em>${label}</em>`;
  const last = words.pop();
  return `${words.join(' ')} <em>${last}</em>`;
}

function hexAlpha(hex, a) {
  if (!hex||!hex.startsWith('#')) return `rgba(217,119,6,${a})`;
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function updateBreadcrumb() {
  const bc = document.getElementById('breadcrumb');
  bc.innerHTML = '';
  navStack.forEach(({ label }, i) => {
    if (i>0) bc.appendChild(Object.assign(document.createElement('span'),{className:'bc-sep',textContent:'›'}));
    const isActive = i===navStack.length-1;
    const item = Object.assign(document.createElement('span'),{
      className:`bc-item${isActive?' active':''}`, textContent:label
    });
    if (!isActive) item.addEventListener('click',()=>goBack(i));
    bc.appendChild(item);
  });
}

function goBack(toIndex) {
  navStack = navStack.slice(0,toIndex+1);
  if (toIndex===0) resetState();
  closeModal(); renderStage();
}

function onCardClick(nodeId, event) {
  const info = nodos[nodeId];
  if (!info) return;
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const cx   = rect.left + rect.width/2;
  const cy   = rect.top  + rect.height/2;
  const size = Math.hypot(window.innerWidth, window.innerHeight)*2.4;
  const circle  = document.getElementById('rippleCircle');
  const overlay = document.getElementById('cinematicOverlay');
  overlay.style.pointerEvents = 'all';
  circle.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;transform:translate(-50%,-50%) scale(0);opacity:1;transition:none;`;
  circle.getBoundingClientRect();
  circle.style.transition = `transform .55s cubic-bezier(.4,0,.2,1), opacity .4s ease .28s`;
  circle.style.transform  = 'translate(-50%,-50%) scale(1)';
  circle.style.opacity    = '0';
  navStack.push({ nodeId, label:info.label });
  const isLeaf = !info.hijos || info.hijos.length===0;
  setTimeout(() => {
    overlay.style.pointerEvents = 'none';
    if (isLeaf) handleLeafSelected(nodeId, info); else renderStage();
  }, isLeaf ? UI.NAV_FADE_LEAF_MS : UI.NAV_FADE_BRANCH_MS);
}
