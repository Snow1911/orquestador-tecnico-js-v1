const test = require('node:test');
const assert = require('node:assert/strict');
const { OrquestaService } = require('../src/services/OrquestaService');
const { AiProvider } = require('../src/providers/AiProvider');
const { AppError } = require('../src/errors/AppError');

class FakeProvider extends AiProvider {
  constructor(chunks, failWith) {
    super();
    this.chunks = chunks;
    this.failWith = failWith;
    this.calls = [];
  }
  async *streamChat(req) {
    this.calls.push(req);
    for (const c of this.chunks) yield c;
    if (this.failWith) throw this.failWith;
  }
}

class FakeSse {
  constructor() {
    this.events = [];
    this.closed = false;
  }
  open() {
    this.events.push('open');
  }
  sendText(t) {
    this.events.push(['text', t]);
  }
  sendError(e) {
    this.events.push(['error', e]);
  }
  done() {
    this.events.push('done');
  }
  close() {
    this.closed = true;
  }
}

test('streamFase1 retransmite chunks, envía done y cierra', async () => {
  const provider = new FakeProvider(['Hola', ' mundo']);
  const sse = new FakeSse();
  await new OrquestaService({ aiProvider: provider }).streamFase1(sse, {
    frontend: { label: 'Android' },
    backend: [],
    noBackend: true,
  });
  assert.deepEqual(sse.events, ['open', ['text', 'Hola'], ['text', ' mundo'], 'done']);
  assert.equal(sse.closed, true);
  assert.match(provider.calls[0].prompt, /Android/);
});

test('streamFase2 calcula el nivel y arma el prompt de evolución', async () => {
  const provider = new FakeProvider(['ok']);
  await new OrquestaService({ aiProvider: provider }).streamFase2(new FakeSse(), {
    category: 'database',
    branch: 'database',
    currentTool: 'Oracle Database',
    phase1Label: '',
  });
  assert.match(provider.calls[0].prompt, /Profesional/);
});

test('un error genérico del proveedor NO filtra detalles internos al cliente', async () => {
  const sse = new FakeSse();
  const quiet = console.error;
  console.error = () => {};
  await new OrquestaService({
    aiProvider: new FakeProvider([], new Error('clave sk-secreta inválida')),
  }).streamFase1(sse, {});
  console.error = quiet;
  const err = sse.events.find((e) => e[0] === 'error');
  assert.doesNotMatch(err[1], /sk-secreta/);
  assert.equal(sse.closed, true);
});

test('un AppError conserva su mensaje (p. ej. falta GROQ_API_KEY)', async () => {
  const sse = new FakeSse();
  await new OrquestaService({
    aiProvider: new FakeProvider([], new AppError(503, 'IA no configurada')),
  }).streamFase1(sse, {});
  assert.deepEqual(
    sse.events.find((e) => e[0] === 'error'),
    ['error', 'IA no configurada'],
  );
});

test('si el cliente se desconecta se deja de consumir la IA', async () => {
  const sse = new FakeSse();
  const originalSend = sse.sendText.bind(sse);
  sse.sendText = (t) => {
    originalSend(t);
    sse.closed = true;
  };
  await new OrquestaService({ aiProvider: new FakeProvider(['a', 'b', 'c']) }).streamFase1(sse, {});
  assert.equal(sse.events.filter((e) => e[0] === 'text').length, 1);
});

test('AiProvider base obliga a implementar streamChat', async () => {
  await assert.rejects(() => new AiProvider().streamChat({}).next(), /debe implementar/);
});
