# Orquestador Técnico v1 — versión JavaScript (Node + Express)

## 1. Arquitectura (según el diagrama de contenedores)

| Contenedor del diagrama | Carpeta / archivo en este proyecto |
|---|---|
| **Aplicación web** [html, css, js] | `public/index.html` + `public/css/styles.css` + `public/js/*.js` (mismos endpoints) |
| **Orquesta** [Software System] | `src/data/evolutionGraph.js`, `src/services/PromptBuilder.js`, `src/services/OrquestaService.js`, `src/services/NodosService.js`, `src/controllers/OrquestaController.js`, `src/routes/{nodos,consultar,fase2}.routes.js` |
| **groq: Modelo IA** [API IA] | `src/providers/AiProvider.js` (contrato) + `src/providers/GroqProvider.js` |
| **Lectura y Escritura** [JSON] | `src/services/CheckpointService.js`, `src/controllers/CheckpointController.js`, `src/routes/checkpoint.routes.js`, carpeta `checkpoints/` |
| **API para BD** [API] | `src/services/ProyectoService.js`, `src/controllers/ProyectoController.js`, `src/routes/proyectos.routes.js`, `src/models/Proyecto.js` |
| **Base de Datos** [Container: MongoDB] | `src/config/db.js` (conexión) + MongoDB real |

El punto de entrada es `server.js` → lee `src/config/env.js`, conecta Mongo y levanta
`src/app.js`, que recibe sus dependencias ya armadas desde `src/container.js`.

### Capas del backend

```
routes  →  controllers  →  services  →  providers / models / disco
(HTTP)     (req → res)     (negocio)     (Groq, Mongoose, fs)
```

Errores: los servicios lanzan `AppError` (`ValidationError`, `NotFoundError`,
`ServiceUnavailableError`) y un único middleware (`middlewares/errorHandler.js`)
los convierte en JSON. Ya no hay `try/catch` repetido en cada ruta.

## 2. Cómo correrlo

```bash
npm install
cp .env.example .env        # completa GROQ_API_KEY y MONGODB_URI
npm start                    # http://localhost:5000
npm test                     # pruebas automáticas (node:test, sin dependencias extra)
npm run lint                 # ESLint
```

Si Mongo todavía no está configurado, el servidor arranca igual (solo
`/api/proyectos` quedará inutilizable hasta conectar la base de datos) —
así ningún integrante queda bloqueado esperando a otro.

## 3. Endpoints

- `GET /api/nodos` — árbol de nodos del wizard (igual que en Python).
- `POST /api/consultar` — Fase 1, streaming SSE con la sugerencia de arquitectura.
- `POST /api/fase2` — Fase 2, streaming SSE con la guía de evolución técnica.
- `POST /api/checkpoint` / `GET /api/checkpoint` / `GET /api/checkpoint/:id` / `DELETE /api/checkpoint/:id` — checkpoints JSON de la Fase 1.
- `GET|POST|PUT|DELETE /api/proyectos[/:id]` — CRUD del árbol de decisiones en MongoDB.

