/* ═══════════════════════════════════════════════════════
   AI PANEL (Phase 1)
   ═══════════════════════════════════════════════════════ */
async function showAiPanel(data) {
  const panel      = document.getElementById('aiPanel');
  const routeEl    = document.getElementById('aiRoute');
  const techRowEl  = document.getElementById('aiTechRow');
  const contentEl  = document.getElementById('aiContent');
  const statusDot  = document.getElementById('aiStatusDot');
  const statusText = document.getElementById('aiStatusText');
  const footer     = document.getElementById('aiNextFooter');

  // Hide footer until done
  footer.style.display = 'none';

  // Route display
  const fePath = data.frontend?.camino || [];
  routeEl.innerHTML = fePath.map((label,i) => {
    const last = i===fePath.length-1;
    return `${i>0?'<span class="route-sep">→</span>':''}<span class="route-crumb${last?' final':''}">${escapeHtml(label)}</span>`;
  }).join('');

  if (data.backend && data.backend.length>0) {
    routeEl.insertAdjacentHTML('beforeend','<span class="route-sep cross"> ⊕ </span>');
    data.backend.forEach((be,i) => {
      if(i>0) routeEl.insertAdjacentHTML('beforeend','<span class="route-sep">+</span>');
      routeEl.insertAdjacentHTML('beforeend',`<span class="route-crumb final be">${escapeHtml(be.label)}</span>`);
    });
  }

  const feTechs = (data.frontend?.tecnologias||[]).map(t=>`<span class="tech-chip">${escapeHtml(t)}</span>`).join('');
  const beTechs = (data.backend||[]).flatMap(be=>be.tecnologias||[]).map(t=>`<span class="tech-chip green">${escapeHtml(t)}</span>`).join('');
  techRowEl.innerHTML = feTechs + beTechs;

  contentEl.innerHTML    = '<span class="cursor"></span>';
  statusDot.className    = 'pulsing';
  statusText.textContent = data.backend.length>0 ? 'GENERANDO ARQUITECTURA FULL-STACK' : 'GENERANDO RUTA TÉCNICA';

  panel.classList.add('open');

  const stream = createMarkdownStream(contentEl);

  try {
    await streamSSE('/api/consultar', data, {
      onText: (chunk) => stream.append(chunk),
      onDone: () => {
        stream.finish();
        statusText.textContent = 'ARQUITECTURA GENERADA ✓';
        statusDot.className = 'done';
        footer.style.display = 'flex'; // muestra el footer de siguiente paso
      },
    });
  } catch (err) {
    showError(contentEl, err.message);
    statusText.textContent = 'ERROR';
    statusDot.className = '';
  }
}

function closeAiPanel() {
  document.getElementById('aiPanel').classList.remove('open');
  document.getElementById('aiNextFooter').style.display = 'none';
  resetState();
  navStack = [{ nodeId:'n1', label:nodos['n1']?.label||'Infraestructura' }];
  renderStage();
}

document.getElementById('backBtn').addEventListener('click', closeAiPanel);
