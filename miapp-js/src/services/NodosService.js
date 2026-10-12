const fs = require('fs/promises');
const path = require('path');
const { NotFoundError, AppError } = require('../errors/AppError');

const DEFAULT_PATH = path.join(__dirname, '..', 'data', 'nodos_config.json');

/** Lee el árbol de nodos del wizard desde nodos_config.json. */
class NodosService {
  constructor({ filePath = DEFAULT_PATH } = {}) {
    this.filePath = filePath;
  }

  async getAll() {
    let raw;
    try {
      raw = await fs.readFile(this.filePath, 'utf-8');
    } catch (err) {
      if (err.code === 'ENOENT') throw new NotFoundError('nodos_config.json no encontrado');
      throw err;
    }
    try {
      return JSON.parse(raw);
    } catch {
      throw new AppError(500, 'nodos_config.json contiene JSON inválido');
    }
  }
}

module.exports = { NodosService };
