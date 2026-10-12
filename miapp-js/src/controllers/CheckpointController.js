const { ValidationError, NotFoundError } = require('../errors/AppError');

class CheckpointController {
  constructor({ checkpointService }) {
    this.checkpointService = checkpointService;
  }

  crear = async (req, res) => {
    const { frontend, backend, noBackend, sugerenciaIA } = req.body || {};
    if (!frontend || typeof frontend !== 'object' || Object.keys(frontend).length === 0) {
      throw new ValidationError('El campo "frontend" es obligatorio para crear un checkpoint.');
    }
    const checkpoint = await this.checkpointService.guardar({ frontend, backend, noBackend, sugerenciaIA });
    res.status(201).json({ mensaje: 'Checkpoint guardado con éxito', checkpoint });
  };

  listar = async (req, res) => {
    res.json(await this.checkpointService.listar());
  };

  obtener = async (req, res) => {
    const checkpoint = await this.checkpointService.leer(req.params.id);
    if (!checkpoint) throw new NotFoundError('Checkpoint no encontrado');
    res.json(checkpoint);
  };

  eliminar = async (req, res) => {
    if (!(await this.checkpointService.eliminar(req.params.id))) {
      throw new NotFoundError('Checkpoint no encontrado');
    }
    res.json({ mensaje: 'Checkpoint eliminado con éxito' });
  };
}

module.exports = { CheckpointController };
