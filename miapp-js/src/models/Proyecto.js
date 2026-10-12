// Modelo Proyecto — "Almacena el árbol de la toma de decisiones del usuario
// del proyecto en curso" (descripción de "Base de Datos" en el diagrama C4).


const mongoose = require('mongoose');

const TecnologiaSeleccionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    tecnologias: { type: [String], default: [] },
    camino: { type: [String], default: [] }, // ruta de nodos recorrida (breadcrumb)
    subcategoria: { type: String, enum: ['db', 'cloud', null], default: null },
  },
  { _id: false },
);

const Fase2Schema = new mongoose.Schema(
  {
    category: { type: String, enum: ['deployment', 'database', 'cloud'] },
    branch: String,
    currentTool: String,
    phase1Label: String,
    nivelActual: { type: String, enum: ['basic', 'intermediate', 'professional'] },
  },
  { _id: false },
);

const ProyectoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    frontend: { type: TecnologiaSeleccionSchema, required: true },
    backend: { type: [TecnologiaSeleccionSchema], default: [] },
    noBackend: { type: Boolean, default: false },
    fase2: { type: Fase2Schema, default: null },
    checkpointId: { type: String, default: null }, // enlaza con un JSON de "Lectura y Escritura"
  },
  { timestamps: true },
);

module.exports = mongoose.model('Proyecto', ProyectoSchema);
