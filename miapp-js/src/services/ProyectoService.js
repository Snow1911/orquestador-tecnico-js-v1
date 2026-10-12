const Proyecto = require('../models/Proyecto');
const { NotFoundError } = require('../errors/AppError');
const { assertProyectoValido } = require('../validators/proyecto.validator');

/** Módulo "API para BD": CRUD de los árboles de decisión guardados en MongoDB. */
class ProyectoService {
  constructor({ model = Proyecto } = {}) {
    this.model = model;
  }

  listar() {
    return this.model.find().sort({ createdAt: -1 });
  }

  async obtener(id) {
    const proyecto = await this.model.findById(id);
    if (!proyecto) throw new NotFoundError('Proyecto no encontrado');
    return proyecto;
  }

  crear({ nombre, frontend, backend, noBackend, checkpointId }) {
    assertProyectoValido({ nombre, frontend });
    return this.model.create({
      nombre: nombre.trim(),
      frontend,
      backend: backend || [],
      noBackend: noBackend || false,
      checkpointId: checkpointId || null,
    });
  }

  async actualizar(id, body = {}) {
    const actual = await this.obtener(id);
    const cambios = {
      nombre: body.nombre ?? actual.nombre,
      frontend: body.frontend ?? actual.frontend,
      backend: body.backend ?? actual.backend,
      noBackend: body.noBackend ?? actual.noBackend,
      fase2: body.fase2 ?? actual.fase2,
      checkpointId: body.checkpointId ?? actual.checkpointId,
    };
    assertProyectoValido(cambios);
    Object.assign(actual, cambios);
    return actual.save();
  }

  async eliminar(id) {
    const eliminado = await this.model.findByIdAndDelete(id);
    if (!eliminado) throw new NotFoundError('Proyecto no encontrado');
  }
}

module.exports = { ProyectoService };
