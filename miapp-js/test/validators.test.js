const test = require('node:test');
const assert = require('node:assert/strict');
const { validateConsultar, validateFase2 } = require('../src/validators/orquesta.validator');
const { ValidationError } = require('../src/errors/AppError');

test('validateConsultar normaliza y descarta campos desconocidos', () => {
  const out = validateConsultar({
    frontend: { label: 'Android', tecnologias: ['Kotlin'], camino: ['Móvil'], evil: '<script>' },
    backend: [{ label: 'MongoDB', tecnologias: ['Mongo'], subcategoria: 'db' }],
    noBackend: false,
  });
  assert.deepEqual(out.frontend, { label: 'Android', tecnologias: ['Kotlin'], camino: ['Móvil'] });
  assert.equal(out.backend[0].subcategoria, 'db');
  assert.equal('evil' in out.frontend, false);
});

test('validateConsultar acepta cuerpo vacío (comportamiento original)', () => {
  assert.deepEqual(validateConsultar({}), { frontend: {}, backend: [], noBackend: false });
});

test('validateConsultar rechaza tipos y longitudes inválidos', () => {
  assert.throws(() => validateConsultar({ frontend: 'x' }), ValidationError);
  assert.throws(() => validateConsultar({ frontend: { label: 'a'.repeat(500) } }), ValidationError);
  assert.throws(() => validateConsultar({ backend: [{}, {}, {}, {}, {}] }), ValidationError);
  assert.throws(() => validateConsultar({ backend: [{ subcategoria: 'otra' }] }), ValidationError);
  assert.throws(() => validateConsultar({ noBackend: 'si' }), ValidationError);
});

test('validateFase2 exige category válida', () => {
  assert.deepEqual(
    validateFase2({ category: 'deployment', branch: 'movil_android', currentTool: 'Kodular' }),
    { category: 'deployment', branch: 'movil_android', currentTool: 'Kodular', phase1Label: '' },
  );
  assert.throws(() => validateFase2({}), ValidationError);
  assert.throws(() => validateFase2({ category: 'otra' }), ValidationError);
  assert.throws(() => validateFase2({ category: 'deployment', branch: '../etc' }), ValidationError);
});
