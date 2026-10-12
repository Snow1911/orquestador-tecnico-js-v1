// PROMPT BUILDER 
const { EVOLUTION_GRAPH } = require('../data/evolutionGraph');

function fmt(lst) {
  if (Array.isArray(lst)) return lst.join(', ');
  return String(lst);
}

/**
 * Construye el prompt de la Fase 2 (guía de evolución técnica) a partir de
 * la categoría/rama elegida en la Fase 1 y el nivel actual del usuario.
 */
function buildFase2Prompt(category, branch, currentTool, phase1Label, currentLevel) {
  const key = category === 'deployment' ? branch : category;
  const graph = EVOLUTION_GRAPH[key];

  if (!graph) return 'Error: árbol de evolución no encontrado.';

  const gLabel = graph.label;
  const basicStr = fmt(graph.basic || []);
  const interStr = fmt(graph.intermediate || []);

  let profStr;
  if (key === 'web') {
    const profParts = graph.professional || [];
    profStr = profParts.map((p) => fmt(p)).join(' | ');
  } else {
    profStr = fmt(graph.professional || []);
  }

  const scaleB = graph.scale_basic || 'escala limitada';
  const scaleI = graph.scale_intermediate || 'escala media';
  const scaleP = graph.scale_professional || 'escala alta';

  // Contexto sobre dónde está el usuario
  let startCtx;
  if (currentTool) {
    startCtx = `El usuario trabaja actualmente con **${currentTool}** como herramienta de ${gLabel}.`;
  } else if (phase1Label) {
    startCtx =
      `El usuario configuró **${phase1Label}** como plataforma en la Fase 1. ` +
      `El Orquestador le recomendó comenzar con las herramientas básicas de ${gLabel}.`;
  } else {
    startCtx = `El usuario está comenzando en el nivel básico de ${gLabel}.`;
  }

  const levelLabels = { basic: 'Básico', intermediate: 'Intermedio', professional: 'Profesional' };
  const levelCtx = `Su nivel de partida actual es: **${levelLabels[currentLevel] || 'Básico'}**.`;

  const diagnosticoTech =
    currentLevel === 'basic' ? basicStr : currentLevel === 'intermediate' ? interStr : profStr;

  return `Actúa como un Arquitecto de Software Senior de élite y mentor técnico.

CONTEXTO DEL USUARIO:
${startCtx}
${levelCtx}

ÁRBOL COMPLETO DE EVOLUCIÓN — ${gLabel}:
Básico:       ${basicStr}
Intermedio:   ${interStr}
Profesional:  ${profStr}

ESCALABILIDAD ESTIMADA POR NIVEL:
- Básico:       ${scaleB}
- Intermedio:   ${scaleI}
- Profesional:  ${scaleP}

Genera una guía de evolución técnica completa usando EXACTAMENTE este formato Markdown:

## 1. DIAGNÓSTICO — DÓNDE ESTÁS HOY
Describe qué puede lograr el usuario con su herramienta actual (${diagnosticoTech}) y cuáles son sus limitaciones críticas conforme la app crece. Sé específico sobre cuándo van a empezar a sentir fricción real.

## 2. SEÑALES DE ALERTA — ¿CUÁNDO EVOLUCIONAR?
Lista 3 señales concretas y observables de que es momento de pasar al siguiente nivel. Sé específico: métricas, errores típicos, situaciones de bloqueo.

## 3. SALTO AL NIVEL INTERMEDIO
Herramientas objetivo: ${interStr}
Explica: qué aprender primero, tiempo estimado de transición realista, qué capacidades se desbloquean, y cómo migrar sin romper lo que ya existe. Escala alcanzable: ${scaleI}.

## 4. SALTO AL NIVEL PROFESIONAL
Herramientas objetivo: ${profStr}
Cuándo y por qué dar este salto. Qué implica en términos de equipo, tiempo y recursos. Qué arquitecturas se hacen posibles. Escala alcanzable: ${scaleP}.

## 5. HOJA DE RUTA — PLAN DE ACCIÓN
Cronograma realista paso a paso con tiempos aproximados (semanas / meses por nivel). Incluye hitos concretos y criterios de éxito.

## 6. ANÁLISIS DE RENTABILIDAD
Para un desarrollador independiente o startup pequeña: ¿hasta qué nivel tiene sentido escalar económicamente? ¿En qué punto el costo de escalar supera el beneficio esperado? Incluye estimaciones de costo de desarrollo y operación por nivel (USD/mes aproximados).
`;
}


// PROMPTS FASE 1

/** Prompt cuando el usuario SOLO configuró Frontend (sin Backend). */
function buildPromptFrontendOnly(frontend = {}) {
  const label = frontend.label || '';
  const techs = (frontend.tecnologias || []).join(', ');
  const camino = (frontend.camino || []).join(' → ');

  return `
Actúa como un Arquitecto de Software Senior de élite. El usuario ha configurado ÚNICAMENTE un stack de Frontend:

- PLATAFORMA: ${label}
- STACK: ${techs}
- RUTA DE DECISIÓN: ${camino}

Como no se configuró un Backend, DEBES agregar una sección de recomendación automática al final.
Responde con EXACTAMENTE este formato Markdown:

## 1. ARQUITECTURA FRONTEND
Explica el patrón arquitectónico ideal para ${label} y justifica por qué es apropiado para este stack.

## 2. ENTORNO DE DESARROLLO
Pasos numerados y concretos para instalar y configurar el entorno completo con ${techs}.

## 3. ESTRUCTURA DEL PROYECTO
Árbol de carpetas recomendado en bloque de código, con comentarios explicando cada directorio.

## 4. BOILERPLATE INICIAL
Archivo de código funcional y profesional como punto de partida, con comentarios claros.

## 5. SEGURIDAD Y BUENAS PRÁCTICAS
3 recomendaciones críticas de seguridad específicas para ${label} con ejemplos concretos.

## 6. RECOMENDACIÓN DE BACKEND
El usuario no configuró backend. Basándote en ${label} (${techs}), recomienda la combinación óptima de:
(a) Servicio cloud o hosting — justifica cuál y por qué es ideal para este frontend.
(b) Base de datos — justifica cuál encaja mejor y muestra un ejemplo básico de integración con ${label}.
`;
}

/** Prompt cuando el usuario configuró Frontend + Backend (full-stack). */
function buildPromptFullstack(frontend = {}, backendList = []) {
  const feLabel = frontend.label || '';
  const feTechs = (frontend.tecnologias || []).join(', ');
  const feCamino = (frontend.camino || []).join(' → ');

  let beLines = '';
  for (const be of backendList) {
    const sub = be.subcategoria === 'cloud' ? '☁ CLOUD' : '◆ BASE DE DATOS';
    beLines += `\n- [${sub}] ${be.label || ''}: ${(be.tecnologias || []).join(', ')}`;
  }

  const be0 = backendList[0] || {};
  const be1 = backendList[1] || {};

  let sectionDb = '';
  if (be1 && Object.keys(be1).length > 0) {
    const sub1 = be1.subcategoria === 'db' ? 'BASE DE DATOS' : 'SERVICIO CLOUD';
    sectionDb = `
## 4. ${sub1} — ${be1.label || ''}
Diseño del esquema / configuración del servicio, modelos de datos y estrategia de persistencia con ${(be1.tecnologias || []).join(', ')}.
`;
  }

  const sub0 = be0.subcategoria === 'cloud' ? 'BACKEND / CLOUD' : 'BASE DE DATOS';

  return `
Actúa como un Arquitecto de Software Senior de élite. Diseña una ARQUITECTURA FULL-STACK COMPLETA para:

FRONTEND: ${feLabel}
- Stack: ${feTechs}
- Ruta de decisión: ${feCamino}

BACKEND:${beLines}

Responde con EXACTAMENTE este formato Markdown:

## 1. ARQUITECTURA GENERAL
Explica el patrón arquitectónico que integra todas las capas seleccionadas. Justifica decisiones de diseño específicas para esta combinación de tecnologías.

## 2. FRONTEND — ${feLabel}
Implementación detallada del frontend: estructura de componentes, gestión de estado, configuración específica para ${feTechs} y cómo se comunica con el backend.

## 3. ${sub0} — ${be0.label || ''}
Configuración e implementación: estructura de servicios, autenticación, endpoints y buenas prácticas para ${(be0.tecnologias || []).join(', ')}.
${sectionDb}
## 5. INTEGRACIÓN FRONTEND ↔ BACKEND
Diseño de la API (REST/GraphQL/WebSocket según corresponda), flujo de autenticación, manejo de errores cross-layer y contrato de datos.

## 6. DESPLIEGUE Y CI/CD
Pipeline de despliegue end-to-end integrando todas las capas: build, test, staging y producción.

## 7. SEGURIDAD
3 medidas críticas de seguridad específicas para este stack completo, con ejemplos concretos de implementación.
`;
}

// ══════════════════════════════════════════════════════════════════════════════
// Mensajes de sistema (antes duplicados dentro de las rutas)
// ══════════════════════════════════════════════════════════════════════════════

const SYSTEM_MESSAGES = Object.freeze({
  fase1:
    'Eres un arquitecto de software senior de élite. ' +
    'Siempre respondes en español con markdown estructurado usando ## para secciones. ' +
    'Eres conciso pero profundo, y tus ejemplos de código son producción-grade.',
  fase2:
    'Eres un arquitecto de software senior de élite y mentor técnico. ' +
    'Guías a desarrolladores en su evolución técnica con datos concretos, ' +
    'tiempos realistas y análisis de rentabilidad. ' +
    'Siempre respondes en español con markdown estructurado usando ## para secciones. ' +
    'Eres directo, práctico y usas ejemplos del mundo real.',
});

/** Decide qué prompt construir y con qué mensaje de sistema. */
class PromptBuilder {
  systemMessage(fase) {
    return SYSTEM_MESSAGES[fase];
  }

  /** Fase 1: solo frontend, o full-stack si hay backend. */
  buildFase1({ frontend = {}, backend = [], noBackend = false }) {
    return noBackend || backend.length === 0
      ? buildPromptFrontendOnly(frontend)
      : buildPromptFullstack(frontend, backend);
  }

  buildFase2({ category, branch, currentTool, phase1Label, currentLevel }) {
    return buildFase2Prompt(category, branch, currentTool, phase1Label, currentLevel);
  }
}

module.exports = {
  PromptBuilder,
  SYSTEM_MESSAGES,
  fmt,
  buildFase2Prompt,
  buildPromptFrontendOnly,
  buildPromptFullstack,
};
