const { SseResponse } = require('../http/SseResponse');
const { validateConsultar, validateFase2 } = require('../validators/orquesta.validator');

/** Capa HTTP del módulo "Orquesta": traduce petición → servicio → respuesta. */
class OrquestaController {
  constructor({ orquestaService, nodosService }) {
    this.orquestaService = orquestaService;
    this.nodosService = nodosService;
  }

  nodos = async (req, res) => {
    res.json(await this.nodosService.getAll());
  };

  consultar = async (req, res) => {
    const params = validateConsultar(req.body);
    await this.#stream(res, (sse, signal) => this.orquestaService.streamFase1(sse, params, signal));
  };

  fase2 = async (req, res) => {
    const params = validateFase2(req.body);
    await this.#stream(res, (sse, signal) => this.orquestaService.streamFase2(sse, params, signal));
  };

  // Si el cliente cierra la conexión a mitad del stream, se cancela la llamada a la IA.
  async #stream(res, run) {
    const abort = new AbortController();
    res.on('close', () => {
      if (!res.writableFinished) abort.abort();
    });
    await run(new SseResponse(res), abort.signal);
  }
}

module.exports = { OrquestaController };
