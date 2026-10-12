/**
 * Contrato («interface») que debe cumplir cualquier proveedor de IA.
 * JavaScript no tiene `interface`, así que se modela como clase base abstracta.
 */
class AiProvider {
  /**
   * @param {{system: string, prompt: string, signal?: AbortSignal}} request
   * @returns {AsyncIterable<string>} fragmentos de texto a medida que se generan
   */
  // eslint-disable-next-line require-yield, no-unused-vars
  async *streamChat(request) {
    throw new Error(`${this.constructor.name} debe implementar streamChat()`);
  }
}

module.exports = { AiProvider };
