class ProyectoController {
  constructor({ proyectoService }) {
    this.proyectoService = proyectoService;
  }

  listar = async (req, res) => {
    res.json(await this.proyectoService.listar());
  };

  obtener = async (req, res) => {
    res.json(await this.proyectoService.obtener(req.params.id));
  };

  crear = async (req, res) => {
    const proyecto = await this.proyectoService.crear(req.body || {});
    res.status(201).json({ mensaje: 'Proyecto creado con éxito', proyecto });
  };

  actualizar = async (req, res) => {
    const proyecto = await this.proyectoService.actualizar(req.params.id, req.body);
    res.json({ mensaje: 'Proyecto actualizado con éxito', proyecto });
  };

  eliminar = async (req, res) => {
    await this.proyectoService.eliminar(req.params.id);
    res.json({ mensaje: 'Proyecto eliminado con éxito' });
  };
}

module.exports = { ProyectoController };
