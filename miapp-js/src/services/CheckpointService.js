// CHECKPOINT SERVICE — módulo "Lectura y Escritura [JSON]".
// Exporta/lee un JSON con las decisiones del usuario y la sugerencia de la IA de
// la Fase 1, para poder retomar la Fase 2 más tarde.

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { ValidationError } = require('../errors/AppError');

const DEFAULT_DIR = path.join(__dirname, '..', '..', 'checkpoints');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class CheckpointService {
  constructor({ dir = DEFAULT_DIR } = {}) {
    this.dir = dir;
  }

  async guardar({ frontend = {}, backend = [], noBackend = false, sugerenciaIA = '' }) {
    await this.#ensureDir();
    const id = crypto.randomUUID();
    const checkpoint = {
      id,
      creadoEn: new Date().toISOString(),
      decisionesUsuario: { frontend, backend, noBackend },
      sugerenciaIA,
    };
    await fs.writeFile(this.#fileOf(id), JSON.stringify(checkpoint, null, 2), 'utf-8');
    return checkpoint;
  }

  /** Devuelve el checkpoint o null si no existe. */
  async leer(id) {
    try {
      return JSON.parse(await fs.readFile(this.#fileOf(id), 'utf-8'));
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  /** Resumen de todos los checkpoints (los archivos corruptos se omiten). */
  async listar() {
    await this.#ensureDir();
    const archivos = (await fs.readdir(this.dir)).filter((f) => f.endsWith('.json'));

    const resumenes = await Promise.all(
      archivos.map(async (archivo) => {
        try {
          const data = JSON.parse(await fs.readFile(path.join(this.dir, archivo), 'utf-8'));
          return {
            id: data.id,
            creadoEn: data.creadoEn,
            frontendLabel: data.decisionesUsuario?.frontend?.label || null,
          };
        } catch (err) {
          console.warn(`Checkpoint ilegible omitido (${archivo}): ${err.message}`);
          return null;
        }
      }),
    );

    return resumenes.filter(Boolean).sort((a, b) => (a.creadoEn < b.creadoEn ? 1 : -1));
  }

  /** true si existía y se borró. */
  async eliminar(id) {
    try {
      await fs.unlink(this.#fileOf(id));
      return true;
    } catch (err) {
      if (err.code === 'ENOENT') return false;
      throw err;
    }
  }

  async #ensureDir() {
    await fs.mkdir(this.dir, { recursive: true });
  }

  // Solo se aceptan UUID: elimina de raíz el path traversal.
  #fileOf(id) {
    if (typeof id !== 'string' || !UUID_RE.test(id)) {
      throw new ValidationError('El id del checkpoint no es válido.');
    }
    return path.join(this.dir, `${id}.json`);
  }
}

module.exports = { CheckpointService };
