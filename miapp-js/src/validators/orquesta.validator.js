// Validación y normalización de los cuerpos de /api/consultar y /api/fase2.
// Solo pasan los campos conocidos y con longitudes acotadas: lo que llega aquí
// termina dentro de un prompt de pago, así que no se confía en avariciosos.
const { ValidationError } = require('../errors/AppError');

const MAX_TEXT = 120;
const MAX_ITEMS = 30;
const MAX_BACKENDS = 4;
const CATEGORIES = ['deployment', 'database', 'cloud'];
const SUBCATEGORIAS = ['db', 'cloud'];

function text(value, campo, errores, { required = false, max = MAX_TEXT } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) errores.push(`"${campo}" es obligatorio.`);
    return '';
  }
  if (typeof value !== 'string' || value.length > max) {
    errores.push(`"${campo}" debe ser texto de máximo ${max} caracteres.`);
    return '';
  }
  return value.trim();
}

function textList(value, campo, errores) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > MAX_ITEMS) {
    errores.push(`"${campo}" debe ser una lista de máximo ${MAX_ITEMS} elementos.`);
    return [];
  }
  return value.map((item, i) => text(item, `${campo}[${i}]`, errores));
}

function seleccion(value, campo, errores, { withSubcategoria = false } = {}) {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) {
    errores.push(`"${campo}" debe ser un objeto.`);
    return {};
  }
  const out = {
    label: text(value.label, `${campo}.label`, errores),
    tecnologias: textList(value.tecnologias, `${campo}.tecnologias`, errores),
    camino: textList(value.camino, `${campo}.camino`, errores),
  };
  if (withSubcategoria) {
    if (value.subcategoria != null && !SUBCATEGORIAS.includes(value.subcategoria)) {
      errores.push(`"${campo}.subcategoria" debe ser uno de: ${SUBCATEGORIAS.join(', ')}.`);
    } else {
      out.subcategoria = value.subcategoria ?? null;
    }
  }
  return out;
}

function validateConsultar(body = {}) {
  const errores = [];
  const frontend = seleccion(body.frontend, 'frontend', errores);

  let backend = [];
  if (body.backend !== undefined && body.backend !== null) {
    if (!Array.isArray(body.backend) || body.backend.length > MAX_BACKENDS) {
      errores.push(`"backend" debe ser una lista de máximo ${MAX_BACKENDS} elementos.`);
    } else {
      backend = body.backend.map((be, i) =>
        seleccion(be, `backend[${i}]`, errores, { withSubcategoria: true }),
      );
    }
  }

  if (body.noBackend !== undefined && typeof body.noBackend !== 'boolean') {
    errores.push('"noBackend" debe ser booleano.');
  }

  if (errores.length > 0) throw new ValidationError('Datos inválidos', errores);
  return { frontend, backend, noBackend: body.noBackend === true };
}

function validateFase2(body = {}) {
  const errores = [];
  const category = text(body.category, 'category', errores, { required: true });
  if (category && !CATEGORIES.includes(category)) {
    errores.push(`"category" debe ser uno de: ${CATEGORIES.join(', ')}.`);
  }
  const branch = text(body.branch, 'branch', errores, { max: 40 });
  if (branch && !/^[a-z_]+$/.test(branch)) errores.push('"branch" tiene un formato inválido.');

  const currentTool = text(body.currentTool, 'currentTool', errores);
  const phase1Label = text(body.phase1Label, 'phase1Label', errores);

  if (errores.length > 0) throw new ValidationError('Datos inválidos', errores);
  return { category, branch, currentTool, phase1Label };
}

module.exports = { validateConsultar, validateFase2, CATEGORIES };
