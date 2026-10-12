// APP — ensambla Express: middlewares, rutas de los 3 módulos y frontend estático.
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const { createContainer } = require('./container');
const { apiNotFound, errorHandler } = require('./middlewares/errorHandler');

const nodosRoutes = require('./routes/nodos.routes');
const consultarRoutes = require('./routes/consultar.routes');
const fase2Routes = require('./routes/fase2.routes');
const checkpointRoutes = require('./routes/checkpoint.routes');
const proyectosRoutes = require('./routes/proyectos.routes');

function createApp({ container = createContainer(), config = env } = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '256kb' }));
  if (config.CORS_ORIGIN) {
    app.use(cors({ origin: config.CORS_ORIGIN.split(',').map((o) => o.trim()) }));
  }

  // Los endpoints de IA gastan la cuota de Groq: se limitan por IP.
  const aiLimits =
    config.RATE_LIMIT_MAX > 0
      ? [
          rateLimit({
            windowMs: config.RATE_LIMIT_WINDOW_MS,
            limit: config.RATE_LIMIT_MAX,
            standardHeaders: true,
            legacyHeaders: false,
            message: { mensaje: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' },
          }),
        ]
      : [];

  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use('/api', nodosRoutes(container.orquestaController));
  app.use('/api', consultarRoutes(container.orquestaController, aiLimits));
  app.use('/api', fase2Routes(container.orquestaController, aiLimits));
  app.use('/api', checkpointRoutes(container.checkpointController));
  app.use('/api', proyectosRoutes(container.proyectoController));

  app.use('/api', apiNotFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
