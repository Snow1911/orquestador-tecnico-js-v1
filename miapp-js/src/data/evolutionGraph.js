const EVOLUTION_GRAPH = {
  // ── MÓVIL ──────────────────────────────────────────────────────────────
  movil_android: {
    label: 'Móvil — Android Solo',
    icon: '◎',
    basic: ['MIT App Inventor', 'Thunkable', 'Kodular'],
    intermediate: ['Java + XML', 'Kotlin + XML'],
    professional: ['Kotlin + Jetpack Compose'],
    scale_basic: '~100 – 1,000 usuarios activos',
    scale_intermediate: '~1,000 – 50,000 usuarios activos',
    scale_professional: '50,000 – millones (con backend adecuado)',
  },
  movil_ios: {
    label: 'Móvil — iOS Solo',
    icon: '◈',
    basic: ['Swift Playgrounds', 'SwiftUI básico con preview'],
    intermediate: ['UIKit + Storyboards', 'UIKit + XIBs'],
    professional: ['SwiftUI + Combine'],
    scale_basic: '~100 – 1,000 usuarios (beta / TestFlight)',
    scale_intermediate: '~1,000 – 50,000 usuarios en App Store',
    scale_professional: '50,000 – millones, apps store-featured',
  },
  movil_cross: {
    label: 'Móvil — Multiplataforma',
    icon: '∞',
    basic: ['FlutterFlow', 'Adalo', 'Glide', 'Expo Snacks'],
    intermediate: ['React Native (JS/TS)', 'Flutter básico'],
    professional: ['React Native avanzado', 'Flutter', 'Kotlin Multiplatform (KMM)'],
    scale_basic: '~100 – 5,000 usuarios (no-code / low-code)',
    scale_intermediate: '~5,000 – 100,000 usuarios',
    scale_professional: '100,000 – millones de usuarios',
  },
  // ── DESKTOP ────────────────────────────────────────────────────────────
  desktop_windows: {
    label: 'Desktop — Windows Solo',
    icon: '⊞',
    basic: ['Windows Forms Designer', 'PowerShell Studio', 'AutoIt + Koda'],
    intermediate: ['C# WinForms manual', 'C# WPF', 'C++ Win32'],
    professional: ['C# WinUI 3', 'C# .NET MAUI', 'C++ Qt (QML)', 'Rust + Slint'],
    scale_basic: '~1 – 100 instalaciones (herramientas internas)',
    scale_intermediate: '~100 – 10,000 instalaciones',
    scale_professional: '10,000+ instalaciones, distribución enterprise / MS Store',
  },
  desktop_macos: {
    label: 'Desktop — macOS Solo',
    icon: '◈',
    basic: ['Swift Playgrounds', 'Xcode + Storyboards básico'],
    intermediate: ['Swift + AppKit', 'Objective-C + AppKit'],
    professional: ['SwiftUI (macOS)', 'AppKit avanzado + Combine'],
    scale_basic: '~1 – 100 instalaciones (sideload / TestFlight Mac)',
    scale_intermediate: '~100 – 10,000 instalaciones',
    scale_professional: '10,000+ usuarios, Mac App Store completo',
  },
  desktop_linux: {
    label: 'Desktop — Linux Solo',
    icon: '⊛',
    basic: ['Glade + GTK', 'Lazarus IDE'],
    intermediate: ['Python + tkinter', 'Python + PyQt', 'C + GTK3'],
    professional: ['C++ Qt', 'Rust + GTK-rs', 'Flutter Linux'],
    scale_basic: '~1 – 500 usuarios (paquetes .deb / .rpm básicos)',
    scale_intermediate: '~500 – 50,000 usuarios',
    scale_professional: '50,000+ usuarios, Flatpak / Snap / AUR',
  },
  desktop_cross: {
    label: 'Desktop — Multiplataforma',
    icon: '◑',
    basic: ['Electron Fiddle', 'Tauri Studio (experimental)'],
    intermediate: ['Electron (JS/TS)', 'Tauri', 'NW.js', 'Python + Eel'],
    professional: ['Qt (C++)', '.NET MAUI', 'Flutter Desktop', 'JavaFX', 'Rust + Iced / Slint'],
    scale_basic: '~1 – 1,000 usuarios (prototipos / herramientas internas)',
    scale_intermediate: '~1,000 – 100,000 usuarios',
    scale_professional: '100,000+ instalaciones cross-platform',
  },
  // ── WEB ────────────────────────────────────────────────────────────────
  web: {
    label: 'Web (todos los navegadores)',
    icon: '◐',
    basic: ['HTML5 + CSS3 + JS vainilla', 'Codepen', 'JSFiddle'],
    intermediate: ['jQuery / Alpine.js + Sass / Less + Parcel básico / esbuild simple'],
    professional: [
      'Frameworks: React / Preact — Vue — Svelte — Angular / Ember',
      'Bundlers: Webpack — Vite — esbuild — Rollup — Parcel',
      'Compatibilidad: Babel + PostCSS / Autoprefixer + Core-js',
    ],
    scale_basic: '~100 – 10,000 visitas/día (estático o básico)',
    scale_intermediate: '~10,000 – 500,000 visitas/día',
    scale_professional: '500,000+ visitas/día (CDN, SSR, backend correcto)',
  },
  // ── BASE DE DATOS ──────────────────────────────────────────────────────
  database: {
    label: 'Base de Datos',
    icon: '◆',
    basic: ['SQLite', 'MongoDB (modo standalone)'],
    intermediate: ['MySQL', 'PostgreSQL', 'MongoDB (replica set básico)'],
    professional: [
      'Oracle (RAC, Data Guard)',
      'PostgreSQL avanzado (Citus, HA)',
      'MySQL empresarial (InnoDB Cluster)',
      'MongoDB escalado (sharding + replicación)',
    ],
    scale_basic: '~1 – 10,000 registros activos, sin concurrencia alta',
    scale_intermediate: '~10,000 – 10,000,000 registros, hasta ~1,000 conexiones simultáneas',
    scale_professional: 'Miles de millones de registros, alta disponibilidad, clustering global',
  },
  // ── CLOUD ──────────────────────────────────────────────────────────────
  cloud: {
    label: 'Servicios Cloud',
    icon: '☁',
    basic: ['Ninguno / Local (XAMPP, Docker Compose básico, VirtualBox)'],
    intermediate: [
      'AWS (EC2, S3, RDS)',
      'GCP (Compute Engine, Cloud Storage)',
      'Azure (VM, Blob Storage)',
      'IBM Cloud (VPC básico)',
    ],
    professional: [
      'AWS avanzado (Lambda, EKS, CloudFormation)',
      'GCP avanzado (Cloud Run, GKE, Anthos)',
      'Azure avanzado (AKS, Functions, Arc)',
      'IBM Cloud avanzado (Code Engine, OpenShift)',
      'On-premise profesional (OpenStack, Kubernetes, Terraform)',
    ],
    scale_basic: 'Solo local, sin acceso externo o exposición mínima',
    scale_intermediate: '~1,000 – 1,000,000 usuarios, disponibilidad ~99 %',
    scale_professional: 'Millones de usuarios, 99.99 % SLA, geo-distribución',
  },
};

const DB_LEVEL = {
  SQLite: 'basic',
  MongoDB: 'basic',
  'Ninguno (sin BD)': 'basic',
  'Microsoft Access': 'basic',
  MySQL: 'intermediate',
  PostgreSQL: 'intermediate',
  'Oracle Database': 'professional',
};

const CLOUD_LEVEL = {
  'Ninguno (solo local)': 'basic',
};
// Cualquier otro que no esté en CLOUD_LEVEL es por defecto "intermediate"

/**
 * Determina el nivel (basic | intermediate | professional) de una selección
 * según su categoría. El despliegue (deployment) siempre arranca en "basic".
 */
function determineLevel(category, label) {
  if (category === 'database') return DB_LEVEL[label] || 'intermediate';
  if (category === 'cloud') return CLOUD_LEVEL[label] || 'intermediate';
  return 'basic';
}

module.exports = {
  EVOLUTION_GRAPH,
  DB_LEVEL,
  CLOUD_LEVEL,
  determineLevel,
};
