const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { createContainer } = require('../src/container');
const { AiProvider } = require('../src/providers/AiProvider');

class FakeProvider extends AiProvider {
  async *streamChat() {
    yield 'Hola';
    yield ' IA';
  }
}

async function withServer(config, fn) {
  const app = createApp({ container: createContainer({ aiProvider: new FakeProvider() }), config });
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((r) => server.close(r));
  }
}
const post = (url, body) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('GET /api/nodos devuelve el árbol', async () => {
  await withServer({ RATE_LIMIT_MAX: 0 }, async (base) => {
    const data = await (await fetch(`${base}/api/nodos`)).json();
    assert.equal(data.n1.label, 'Infraestructura');
  });
});

test('POST /api/consultar hace streaming SSE y termina con [DONE]', async () => {
  await withServer({ RATE_LIMIT_MAX: 0 }, async (base) => {
    const res = await post(`${base}/api/consultar`, {
      frontend: { label: 'Android', tecnologias: ['Kotlin'] },
      noBackend: true,
    });
    assert.match(res.headers.get('content-type'), /^text\/event-stream/);
    const body = await res.text();
    assert.match(body, /data: {"text":"Hola"}/);
    assert.match(body, /data: \[DONE\]\n\n$/);
  });
});

test('cuerpos inválidos responden 400 con detalle, no llegan a la IA', async () => {
  await withServer({ RATE_LIMIT_MAX: 0 }, async (base) => {
    const r1 = await post(`${base}/api/fase2`, { category: 'hack' });
    assert.equal(r1.status, 400);
    assert.ok((await r1.json()).errores.length > 0);
    const r2 = await fetch(`${base}/api/consultar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{roto',
    });
    assert.equal(r2.status, 400);
  });
});

test('rate limit: la petición N+1 recibe 429', async () => {
  await withServer({ RATE_LIMIT_MAX: 2, RATE_LIMIT_WINDOW_MS: 60000 }, async (base) => {
    const body = { category: 'cloud' };
    assert.equal((await post(`${base}/api/fase2`, body)).status, 200);
    assert.equal((await post(`${base}/api/fase2`, body)).status, 200);
    assert.equal((await post(`${base}/api/fase2`, body)).status, 429);
  });
});

test('rutas /api desconocidas responden 404 JSON y checkpoint con id inválido 400', async () => {
  await withServer({ RATE_LIMIT_MAX: 0 }, async (base) => {
    assert.equal((await fetch(`${base}/api/nada`)).status, 404);
    assert.equal((await fetch(`${base}/api/checkpoint/..%2Fx`)).status, 400);
  });
});
