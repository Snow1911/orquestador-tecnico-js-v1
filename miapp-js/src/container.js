// Composición de dependencias: único lugar donde se hace `new` de las clases.
const { env } = require('./config/env');
const { GroqProvider } = require('./providers/GroqProvider');
const { PromptBuilder } = require('./services/PromptBuilder');
const { OrquestaService } = require('./services/OrquestaService');
const { NodosService } = require('./services/NodosService');
const { CheckpointService } = require('./services/CheckpointService');
const { ProyectoService } = require('./services/ProyectoService');
const { OrquestaController } = require('./controllers/OrquestaController');
const { CheckpointController } = require('./controllers/CheckpointController');
const { ProyectoController } = require('./controllers/ProyectoController');

/** Permite sustituir cualquier pieza (p. ej. un AiProvider falso en los tests). */
function createContainer(overrides = {}) {
  const aiProvider =
    overrides.aiProvider || new GroqProvider({ apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL });

  const orquestaService = new OrquestaService({ aiProvider, promptBuilder: new PromptBuilder() });
  const nodosService = overrides.nodosService || new NodosService();
  const checkpointService = overrides.checkpointService || new CheckpointService();
  const proyectoService = overrides.proyectoService || new ProyectoService();

  return {
    orquestaController: new OrquestaController({ orquestaService, nodosService }),
    checkpointController: new CheckpointController({ checkpointService }),
    proyectoController: new ProyectoController({ proyectoService }),
  };
}

module.exports = { createContainer };
