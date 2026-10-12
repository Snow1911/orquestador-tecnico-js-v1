/* ═══════════════════════════════════════════════════════
   CONSTANTES DE UI
   ═══════════════════════════════════════════════════════ */
const UI = Object.freeze({
  RENDER_DEBOUNCE_MS: 60,   // espera entre repintados del Markdown en streaming
  CARD_ENTER_DELAY_MS: 60,  // retardo inicial de la animación de tarjetas
  CARD_STAGGER_MS: 75,      // desfase entre tarjetas consecutivas
  NAV_FADE_LEAF_MS: 340,    // transición al elegir un nodo hoja
  NAV_FADE_BRANCH_MS: 300,  // transición al elegir un nodo intermedio
  STAR_COUNT: 90,           // estrellas del fondo
});

/* ═══════════════════════════════════════════════════════
   NODE META
   ═══════════════════════════════════════════════════════ */
const NODE_META = {
  'Infraestructura':              { icon:'⬡', color:'#D97706', hint:'base del sistema' },
  'Frontend':                     { icon:'◱', color:'#60A5FA', hint:'capa de presentación' },
  'Backend':                      { icon:'◳', color:'#34D399', hint:'lógica del servidor' },
  'Despliegue':                   { icon:'⚡', color:'#F59E0B', hint:'tipo de plataforma' },
  'Móvil':                        { icon:'◻', color:'#A78BFA', hint:'aplicación nativa' },
  'Web':                          { icon:'◐', color:'#38BDF8', hint:'aplicación web' },
  'Desktop':                      { icon:'◑', color:'#FB923C', hint:'escritorio nativo' },
  'Teléfono':                     { icon:'◈', color:'#A78BFA', hint:'smartphone' },
  'Tablet':                       { icon:'⬜', color:'#818CF8', hint:'tableta' },
  'Android':                      { icon:'◎', color:'#34D399', hint:'ecosistema Google' },
  'iPhone':                       { icon:'◈', color:'#94A3B8', hint:'ecosistema Apple' },
  'Ambos (cross\u2011platform)':  { icon:'∞', color:'#F472B6', hint:'multiplataforma' },
  'Base de Datos':                { icon:'◆', color:'#FBBF24', hint:'persistencia de datos' },
  'Servicios Cloud':              { icon:'☁', color:'#38BDF8', hint:'nube pública' },
  'macOS':                        { icon:'◈', color:'#94A3B8', hint:'ecosistema Apple' },
  'Windows':                      { icon:'⊞', color:'#60A5FA', hint:'ecosistema Microsoft' },
  'Linux':                        { icon:'⊛', color:'#FBBF24', hint:'código abierto' },
  'Mozilla':                      { icon:'◉', color:'#FB923C', hint:'Firefox' },
  'Chromium':                     { icon:'◎', color:'#34D399', hint:'Chrome / Edge' },
  'Safari':                       { icon:'◈', color:'#94A3B8', hint:'WebKit / Apple' },
  'PostgreSQL':                   { icon:'⬡', color:'#60A5FA', hint:'relacional avanzado' },
  'MySQL':                        { icon:'◆', color:'#FBBF24', hint:'relacional clásico' },
  'MongoDB':                      { icon:'◈', color:'#34D399', hint:'documental NoSQL' },
  'SQLite':                       { icon:'◻', color:'#94A3B8', hint:'embebido local' },
  'Microsoft Access':             { icon:'⊞', color:'#60A5FA', hint:'escritorio MS' },
  'Oracle Database':              { icon:'◉', color:'#F87171', hint:'enterprise' },
  'Ninguno (sin BD)':             { icon:'∅', color:'#78716C', hint:'sin persistencia' },
  'Amazon Web Services (AWS)':    { icon:'☁', color:'#FB923C', hint:'líder del mercado' },
  'Google Cloud Platform (GCP)':  { icon:'◎', color:'#34D399', hint:'cloud de Google' },
  'Microsoft Azure':              { icon:'⊞', color:'#60A5FA', hint:'cloud de Microsoft' },
  'IBM Cloud / Otro':             { icon:'⬡', color:'#818CF8', hint:'alternativo' },
  'Ninguno (solo local)':         { icon:'⊛', color:'#78716C', hint:'entorno local' },
  'iPadOS':                       { icon:'⬜', color:'#818CF8', hint:'iPad nativo' },
  'Android Tablet':               { icon:'◎', color:'#34D399', hint:'tablet Android' },
};
function getMeta(label) { return NODE_META[label] || { icon:'◈', color:'#D97706', hint:'explorar' }; }

/* ═══════════════════════════════════════════════════════
   PHASE 1 → PHASE 2 BRANCH MAPPING
   ═══════════════════════════════════════════════════════ */
const LABEL_TO_BRANCH = {
  'Android':                    { branch:'movil_android',   icon:'◎', label:'Móvil — Android' },
  'Android Tablet':             { branch:'movil_android',   icon:'◎', label:'Móvil — Android' },
  'iPhone':                     { branch:'movil_ios',       icon:'◈', label:'Móvil — iOS' },
  'iPadOS':                     { branch:'movil_ios',       icon:'◈', label:'Móvil — iOS' },
  'Ambos (cross\u2011platform)':{ branch:'movil_cross',     icon:'∞', label:'Móvil — Multiplataforma' },
  'macOS':                      { branch:'desktop_macos',   icon:'◈', label:'Desktop — macOS' },
  'Windows':                    { branch:'desktop_windows', icon:'⊞', label:'Desktop — Windows' },
  'Linux':                      { branch:'desktop_linux',   icon:'⊛', label:'Desktop — Linux' },
  'Mozilla':                    { branch:'web',             icon:'◐', label:'Web' },
  'Chromium':                   { branch:'web',             icon:'◐', label:'Web' },
  'Safari':                     { branch:'web',             icon:'◐', label:'Web' },
};

const MANUAL_BRANCHES = {
  movil_android:   { icon:'◎', label:'Móvil — Android Solo' },
  movil_ios:       { icon:'◈', label:'Móvil — iOS Solo' },
  movil_cross:     { icon:'∞', label:'Móvil — Multiplataforma' },
  desktop_windows: { icon:'⊞', label:'Desktop — Windows' },
  desktop_macos:   { icon:'◈', label:'Desktop — macOS' },
  desktop_linux:   { icon:'⊛', label:'Desktop — Linux' },
  desktop_cross:   { icon:'◑', label:'Desktop — Multiplataforma' },
  web:             { icon:'◐', label:'Web' },
};
