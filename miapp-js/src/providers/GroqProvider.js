const Groq = require('groq-sdk');
const { AiProvider } = require('./AiProvider');
const { ServiceUnavailableError } = require('../errors/AppError');

/** Implementación de AiProvider sobre la API de Groq. */
class GroqProvider extends AiProvider {
  #client = null;

  constructor({ apiKey, model, temperature = 0.65 }) {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.temperature = temperature;
  }

  // El cliente se crea en el primer uso, con la clave ya validada.
  #getClient() {
    if (!this.apiKey) {
      throw new ServiceUnavailableError('El servicio de IA no está configurado (falta GROQ_API_KEY).');
    }
    this.#client ??= new Groq({ apiKey: this.apiKey });
    return this.#client;
  }

  async *streamChat({ system, prompt, signal }) {
    const stream = await this.#getClient().chat.completions.create(
      {
        model: this.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        temperature: this.temperature,
        stream: true,
      },
      { signal },
    );

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) yield content;
    }
  }
}

module.exports = { GroqProvider };
