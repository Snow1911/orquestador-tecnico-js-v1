/* ═══════════════════════════════════════════════════════
   API — comunicación con el backend + utilidades de render seguro
   ═══════════════════════════════════════════════════════ */

/** Escapa texto para insertarlo dentro de una plantilla HTML (anti-XSS). */
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

/** Muestra un mensaje de error en un contenedor sin interpretar HTML. */
function showError(el, message) {
  const box = document.createElement('div');
  box.className = 'ai-error';
  box.textContent = `⚠ ${message}`;
  el.replaceChildren(box);
}

/** Markdown → HTML sanitizado (marked + DOMPurify) y resaltado de código. */
function renderMarkdown(el, markdown) {
  el.innerHTML = DOMPurify.sanitize(marked.parse(markdown, { breaks: true }));
  el.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
}

/**
 * Acumula texto que llega por streaming y lo renderiza como Markdown con un
 * pequeño debounce, para no repintar el DOM por cada chunk.
 */
function createMarkdownStream(el) {
  let text = '';
  let timer = null;

  function paint(done) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      renderMarkdown(el, text + (done ? '' : '▋'));
      if (!done) el.insertAdjacentHTML('beforeend', '<span class="cursor"></span>');
    }, done ? 0 : UI.RENDER_DEBOUNCE_MS);
  }

  return {
    append(chunk) { text += chunk; paint(false); },
    finish() { paint(true); },
    get text() { return text; },
  };
}

/**
 * POST + lectura de Server-Sent Events. Reemplaza los dos bucles duplicados
 * que existían para Fase 1 y Fase 2.
 *
 * - Lanza Error si el servidor responde !ok, si llega un evento {error} o si
 *   la conexión se corta antes de recibir [DONE]. Los errores NO se ignoran.
 */
async function streamSSE(url, body, { onText, onDone, signal } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    const info = await res.json().catch(() => null);
    throw new Error(info?.mensaje || `El servidor respondió con estado ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // la última línea puede venir incompleta

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);

      if (payload === '[DONE]') {
        onDone?.();
        return;
      }

      let event;
      try {
        event = JSON.parse(payload);
      } catch {
        continue; // línea SSE malformada: se descarta, el resto sigue
      }
      if (event.error) throw new Error(event.error);
      if (event.text) onText?.(event.text);
    }
  }

  throw new Error('La conexión se cerró antes de terminar la respuesta.');
}

/** GET /api/nodos — árbol de nodos del wizard. */
async function fetchNodos() {
  const res = await fetch('/api/nodos');
  if (!res.ok) throw new Error(`No se pudo cargar el árbol de nodos (${res.status}).`);
  return res.json();
}
