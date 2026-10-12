const { ValidationError } = require('../errors/AppError');

/** Devuelve la lista de errores de un proyecto (vacía si es válido). */
function validarProyectoData({ nombre, frontend }) {
  const errores = [];
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    errores.push('El nombre del proyecto es obligatorio y debe ser texto.');
  }
  if (!frontend || typeof frontend !== 'object' || !frontend.label) {
    errores.push('El proyecto debe incluir al menos una selección de frontend con "label".');
  }
  return errores;
}

/** Lanza ValidationError si el proyecto no es válido. */
function assertProyectoValido(data) {
  const errores = validarProyectoData(data);
  if (errores.length > 0) throw new ValidationError('Datos inválidos', errores);
}

module.exports = { validarProyectoData, assertProyectoValido };
