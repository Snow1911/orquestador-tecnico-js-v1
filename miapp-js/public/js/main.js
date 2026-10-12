/* ═══════════════════════════════════════════════════════
   MAIN — arranque de la aplicación (se carga al final)
   ═══════════════════════════════════════════════════════ */
function spawnStars() {
  const wrap = document.getElementById('stars');
  for (let i = 0; i < UI.STAR_COUNT; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const sz = Math.random() * 1.8 + .5;
    s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--dur:${2+Math.random()*4}s;--delay:${Math.random()*5}s;--lo:${(0.05+Math.random()*.1).toFixed(2)};--hi:${(0.25+Math.random()*.45).toFixed(2)};`;
    wrap.appendChild(s);
  }
}

async function boot() {
  spawnStars();
  nodos = await fetchNodos();
  navStack = [{ nodeId: 'n1', label: nodos['n1'].label }];
  renderStage();
}

boot().catch((err) => {
  console.error(err);
  const msg = document.createElement('div');
  msg.className = 'ai-error';
  msg.style.cssText = 'position:fixed;inset:auto 1rem 1rem 1rem;z-index:9999';
  msg.textContent = `⚠ No se pudo iniciar la aplicación: ${err.message}`;
  document.body.appendChild(msg);
});
