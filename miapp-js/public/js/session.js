/* ═══════════════════════════════════════════════════════
   MANUAL PANEL
   ═══════════════════════════════════════════════════════ */
function openManualPanel() {
  document.getElementById('manualPanel').classList.add('visible');
}
function closeManualPanel() {
  document.getElementById('manualPanel').classList.remove('visible');
}

document.getElementById('manualCloseBtn').addEventListener('click', closeManualPanel);
document.getElementById('alreadyBtn').addEventListener('click', openManualPanel);

// Validate: enable start button only when frontend is selected
document.getElementById('manualFrontend').addEventListener('change', function() {
  document.getElementById('manualStartBtn').disabled = this.value === 'none';
});

document.getElementById('manualStartBtn').addEventListener('click', enterPhase2FromManual);

/* ═══════════════════════════════════════════════════════
   JSON EXPORT
   ═══════════════════════════════════════════════════════ */
const BASIC_TOOLS_BY_BRANCH = {
  movil_android:   ['MIT App Inventor', 'Thunkable', 'Kodular'],
  movil_ios:       ['Swift Playgrounds', 'SwiftUI básico'],
  movil_cross:     ['FlutterFlow', 'Adalo', 'Glide', 'Expo Snacks'],
  desktop_windows: ['Windows Forms Designer', 'PowerShell Studio', 'AutoIt+Koda'],
  desktop_macos:   ['Swift Playgrounds', 'Xcode+Storyboards básico'],
  desktop_linux:   ['Glade+GTK', 'Lazarus IDE'],
  desktop_cross:   ['Electron Fiddle', 'Tauri Studio'],
  web:             ['HTML5+CSS3+JS', 'Codepen', 'JSFiddle'],
};

function exportSessionJSON() {
  const feLabel  = State.frontend?.label || '';
  const mapping  = LABEL_TO_BRANCH[feLabel] || {};
  const branch   = mapping.branch || 'web';
  const basicFe  = BASIC_TOOLS_BY_BRANCH[branch] || [];

  const dbEntry    = State.backend.find(b => b.subcategoria === 'db');
  const cloudEntry = State.backend.find(b => b.subcategoria === 'cloud');

  const exportData = {
    version:   '1.0',
    timestamp: new Date().toISOString(),
    fase1: {
      frontend: {
        plataforma:            feLabel || 'No configurado',
        camino:                State.frontend?.camino || [],
        tecnologias:           State.frontend?.tecnologias || [],
        herramientas_basicas:  basicFe,
        branch_fase2:          branch,
      },
      backend: {
        base_de_datos: {
          plataforma:   dbEntry?.label    || 'Sin BD',
          tecnologias:  dbEntry?.tecnologias || [],
        },
        servicio_cloud: {
          plataforma:   cloudEntry?.label    || 'Sin Cloud',
          tecnologias:  cloudEntry?.tecnologias || [],
        },
      },
    },
    instrucciones: 'Carga este archivo en el Orquestador para continuar con la Fase 2.',
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'orquestador-sesion-fase1.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

document.getElementById('exportJsonBtn').addEventListener('click', exportSessionJSON);

/* ═══════════════════════════════════════════════════════
   JSON IMPORT
   ═══════════════════════════════════════════════════════ */
function importSessionJSON(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    let data;
    try {
      data = JSON.parse(e.target.result);
    } catch {
      alert('❌ El archivo no es un JSON válido.');
      return;
    }

    const f1 = data?.fase1;
    if (!f1) {
      alert('❌ El archivo no parece ser una sesión exportada de Fase 1.');
      return;
    }

    // Restore State from the exported JSON
    const fe = f1.frontend || {};
    const be = f1.backend  || {};

    State.frontend = {
      label:       fe.plataforma   || '',
      camino:      fe.camino       || [],
      tecnologias: fe.tecnologias  || [],
    };
    State.backend  = [];
    State.noBackend = false;

    const dbLabel    = be.base_de_datos?.plataforma;
    const dbTechs    = be.base_de_datos?.tecnologias || [];
    const cloudLabel = be.servicio_cloud?.plataforma;
    const cloudTechs = be.servicio_cloud?.tecnologias || [];

    if (dbLabel && dbLabel !== 'Sin BD') {
      State.backend.push({ subcategoria:'db',    label:dbLabel,    tecnologias:dbTechs });
    }
    if (cloudLabel && cloudLabel !== 'Sin Cloud') {
      State.backend.push({ subcategoria:'cloud', label:cloudLabel, tecnologias:cloudTechs });
    }
    if (!State.backend.length) State.noBackend = true;

    // Jump straight into Phase 2 with the restored state
    enterPhase2FromPhase1();
  };
  reader.readAsText(file);
}

document.getElementById('importJsonBtn').addEventListener('click', () => {
  document.getElementById('importJsonInput').value = '';
  document.getElementById('importJsonInput').click();
});
document.getElementById('importJsonInput').addEventListener('change', function() {
  if (this.files && this.files[0]) importSessionJSON(this.files[0]);
});
