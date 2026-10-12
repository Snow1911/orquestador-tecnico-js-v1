// Jerarquía de errores de la aplicación. El middleware de errores los traduce a HTTP.
class AppError extends Error {
  constructor(status, mensaje, detalles = undefined) {
    super(mensaje);
    this.name = this.constructor.name;
    this.status = status;
    this.detalles = detalles;
  }
}

class ValidationError extends AppError {
  constructor(mensaje = 'Datos inválidos', detalles = undefined) {
    super(400, mensaje, detalles);
  }
}

class NotFoundError extends AppError {
  constructor(mensaje = 'Recurso no encontrado') {
    super(404, mensaje);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(mensaje = 'Servicio no disponible') {
    super(503, mensaje);
  }
}

module.exports = { AppError, ValidationError, NotFoundError, ServiceUnavailableError };
