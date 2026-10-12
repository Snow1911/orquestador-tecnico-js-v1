const { AppError } = require('../errors/AppError');
const { PromptBuilder } = require('./PromptBuilder');
const { determineLevel } = require('../data/evolutionGraph');

/**
 * Módulo "Orquesta": arma el prompt de cada fase, lo envía al proveedor de IA
 * y retransmite la respuesta por SSE. No conoce Express ni Groq: depende solo
 * de los contratos AiProvider y SseResponse (inyectados).
 */
class OrquestaService {
  constructor({ aiProvider, promptBuilder = new PromptBuilder(), levelResolver = determineLevel }) {
    this.aiProvider = aiProvider;
    this.promptBuilder = promptBuilder;
    this.levelResolver = levelResolver;
  }

  /** Fase 1: arquitectura sugerida a partir de las decisiones del usuario. */
  streamFase1(sse, params, signal) {
    const prompt = this.promptBuilder.buildFase1(params);
    return this.#stream(sse, this.promptBuilder.systemMessage('fase1'), prompt, signal);
  }

  /** Fase 2: guía de evolución técnica según el nivel actual. */
  streamFase2(sse, params, signal) {
    const currentLevel = this.levelResolver(params.category, params.currentTool || params.phase1Label);
    const prompt = this.promptBuilder.buildFase2({ ...params, currentLevel });
    return this.#stream(sse, this.promptBuilder.systemMessage('fase2'), prompt, signal);
  }

  async #stream(sse, system, prompt, signal) {
    sse.open();
    try {
      for await (const chunk of this.aiProvider.streamChat({ system, prompt, signal })) {
        if (sse.closed) break; // el cliente se fue: dejamos de consumir la IA
        sse.sendText(chunk);
      }
      sse.done();
    } catch (error) {
      if (!sse.closed) {
        if (!(error instanceof AppError)) console.error('Error del proveedor de IA:', error);
        sse.sendError(
          error instanceof AppError ? error.message : 'Error al comunicarse con el modelo de IA.',
        );
      }
    } finally {
      sse.close();
    }
  }
}

module.exports = { OrquestaService };
