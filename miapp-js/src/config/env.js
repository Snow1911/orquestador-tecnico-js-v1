// Configuración centralizada: único lugar donde se lee process.env.
require('dotenv').config();

const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
};

const env = Object.freeze({
  PORT: toInt(process.env.PORT, 5000),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/orquesta',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  // Vacío = solo mismo origen (el frontend lo sirve este mismo servidor).
  // Para permitir otros orígenes: CORS_ORIGIN=http://localhost:3000,https://midominio.com
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
  // Límite de peticiones a los endpoints de IA (protege la cuota de Groq). 0 = sin límite.
  RATE_LIMIT_MAX: toInt(process.env.RATE_LIMIT_MAX, 20),
  RATE_LIMIT_WINDOW_MS: toInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
});

module.exports = { env };
