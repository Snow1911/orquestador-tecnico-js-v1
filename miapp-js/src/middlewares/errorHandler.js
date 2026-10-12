const { AppError } = require('../errors/AppError');

/** 404 para rutas /api desconocidas. */
function apiNotFound(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/** Middleware central de errores: un solo lugar para formato y logging. */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return res.end();

  if (err instanceof AppError) {
    return res.status(err.status).json({ mensaje: err.message, errores: err.detalles });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido.' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ mensaje: 'El cuerpo de la petición es demasiado grande.' });
  }
  if (err?.name === 'CastError') {
    return res.status(400).json({ mensaje: 'Identificador inválido.' });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  return res.status(500).json({ mensaje: 'Error interno del servidor.' });
}

module.exports = { apiNotFound, errorHandler };
