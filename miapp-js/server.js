// SERVER — punto de entrada: conecta Mongo (opcional) y levanta Express.
const { env } = require('./src/config/env');
const { createApp } = require('./src/app');
const { conectarDB, desconectarDB } = require('./src/config/db');

async function iniciar() {
  if (!env.GROQ_API_KEY) {
    console.warn('⚠ GROQ_API_KEY vacía — /api/consultar y /api/fase2 responderán 503 hasta configurarla.');
  }

  try {
    await conectarDB();
  } catch {
    // Orquesta y checkpoints siguen funcionando sin base de datos;
    // solo /api/proyectos quedará inutilizable hasta que Mongo esté arriba.
    console.warn('⚠ Continuando sin MongoDB — /api/proyectos no funcionará hasta reconectar.');
  }

  const server = createApp().listen(env.PORT, () => {
    console.log(`🚀 Orquestador Técnico v2 (JS) — http://localhost:${env.PORT}`);
  });

  const apagar = () => {
    console.log('Cerrando servidor…');
    server.close(async () => {
      await desconectarDB().catch(() => {});
      process.exit(0);
    });
  };
  process.on('SIGINT', apagar);
  process.on('SIGTERM', apagar);
}

iniciar();
