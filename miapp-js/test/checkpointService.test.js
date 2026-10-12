const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { CheckpointService } = require('../src/services/CheckpointService');
const { ValidationError } = require('../src/errors/AppError');

async function newService() {
  return new CheckpointService({ dir: await fs.mkdtemp(path.join(os.tmpdir(), 'ckpt-')) });
}

test('guardar → leer → listar → eliminar', async () => {
  const svc = await newService();
  const cp = await svc.guardar({ frontend: { label: 'Android' }, sugerenciaIA: '## hola' });
  assert.equal((await svc.leer(cp.id)).sugerenciaIA, '## hola');
  assert.equal((await svc.listar())[0].frontendLabel, 'Android');
  assert.equal(await svc.eliminar(cp.id), true);
  assert.equal(await svc.leer(cp.id), null);
  assert.equal(await svc.eliminar(cp.id), false);
});

test('ids que no son UUID (path traversal) se rechazan', async () => {
  const svc = await newService();
  await assert.rejects(() => svc.leer('../../package'), ValidationError);
  await assert.rejects(() => svc.eliminar('../x'), ValidationError);
});

test('un archivo corrupto ya no rompe el listado', async () => {
  const svc = await newService();
  await svc.guardar({ frontend: { label: 'iPhone' } });
  await fs.writeFile(path.join(svc.dir, 'roto.json'), '{no es json', 'utf-8');
  const quiet = console.warn;
  console.warn = () => {};
  const lista = await svc.listar();
  console.warn = quiet;
  assert.equal(lista.length, 1);
});
