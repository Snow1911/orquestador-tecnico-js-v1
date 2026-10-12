/* ═══════════════════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════════════════ */
function showModal({ tag='DECISIÓN', icon='⚡', title, desc, actions }) {
  document.getElementById('modalTag').textContent   = tag;
  document.getElementById('modalIcon').textContent  = icon;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalDesc').innerHTML    = desc;
  const actionsEl = document.getElementById('modalActions');
  actionsEl.innerHTML = '';
  actions.forEach(({ label, primary, cb }) => {
    const btn = document.createElement('button');
    btn.className   = primary ? 'modal-btn primary' : 'modal-btn';
    btn.textContent = label;
    btn.addEventListener('click', cb);
    actionsEl.appendChild(btn);
  });
  document.getElementById('selectionModal').classList.add('visible');
}
function closeModal() { document.getElementById('selectionModal').classList.remove('visible'); }
