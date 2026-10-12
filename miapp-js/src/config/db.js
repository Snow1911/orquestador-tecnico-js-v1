// Conexión a MongoDB 
const mongoose = require('mongoose');
const { env } = require('./env');

async function conectarDB(uri = env.MONGODB_URI) {
  try {
    await mongoose.connect(uri);
    console.log('Base de datos MongoDB conectada.');
  } catch (error) {
    console.error('No se pudo conectar a MongoDB:', error.message);
    throw error;
  }
}

async function desconectarDB() {
  await mongoose.disconnect();
}

module.exports = { conectarDB, desconectarDB };
