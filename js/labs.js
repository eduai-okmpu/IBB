/**
 * PhysicsAccess - Lab Logic
 */

function showLabDetails(id) {
  const lab = state.labs.find(l => l.id === id);
  if (!lab) return;
  
  const view = document.getElementById('labs-view');
  
  // Decide what to render in the main panel
  let simulationHtml = '';
  
  // Mapping of keys to their respective render functions defined in app.js
  const labRenders = {
    'freefall': typeof renderFreeFallLab === 'function' ? renderFreeFallLab : null,
    'impulse': typeof renderImpulseLab === 'function' ? renderImpulseLab : null,
    'hooke': typeof renderHookeLab === 'function' ? renderHookeLab : null,
    'newton1': typeof renderNewton1Lab === 'function' ? renderNewton1Lab : null,
    'newton2': typeof renderNewton2Lab === 'function' ? renderNewton2Lab : null,
    'newton3': typeof renderNewton3Lab === 'function' ? renderNewton3Lab : null,
    'gravity': typeof renderGravityLab === 'function' ? renderGravityLab : null,
    'density': typeof renderDensityLab === 'function' ? renderDensityLab : null,
    'pressure': typeof renderPressureLab === 'function' ? renderPressureLab : null,
    'archimedes': typeof renderArchimedesLab === 'function' ? renderArchimedesLab : null
  };

  const renderFn = labRenders[lab.key];

  if (renderFn) {
    simulationHtml = renderFn();
  } else if (lab.phetUrl) {
    simulationHtml = `
      <div class="glass-panel" style="height: 100%; padding: 0; overflow: hidden; border-radius: 20px; background: #000; position: relative; border: 1px solid var(--border-glass);">
        <iframe src="${lab.phetUrl}" style="width: 100%; height: 600px; border: none;" allowfullscreen></iframe>
      </div>
    `;
  } else {
    simulationHtml = `
      <div class="glass-panel flex-center flex-col gap-4 text-center" style="height: 100%; color: var(--text-tertiary); background: rgba(255,255,255,0.2); border: 2px dashed var(--border-glass);">
        <i data-lucide="monitor-off" size="48" style="opacity: 0.3;"></i>
        <p>Симуляция жүктелуде немесе қолжетімсіз...</p>
      </div>
    `;
  }

  view.innerHTML = `
    <div class="flex flex-col gap-6 animate-fade-in" style="height: 100%; padding-bottom: 2rem;">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button class="btn-secondary v-center h-center" style="width: 50px; height: 50px; border-radius: 50%; padding: 0; border: 1.5px solid var(--border-glass);" onclick="renderLabs()" title="Тізімге қайту">
            <i data-lucide="arrow-left" size="24"></i>
          </button>
          <div>
            <h2 class="gradient-text" style="font-size: 2rem; font-weight: 800;">${lab.title}</h2>
            <p style="color: var(--text-secondary); font-size: 1rem; font-weight: 600;">Зертханалық жұмыс №${lab.id}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="btn-primary v-center" style="gap: 0.6rem; padding: 0.8rem 1.5rem; font-size: 1rem; border-radius: 40px;" onclick="speak('${lab.title}. ${lab.desc}')">
            <i data-lucide="volume-2" size="20"></i> Дыбыстау
          </button>
        </div>
      </div>
      
      <div class="grid" style="grid-template-columns: 350px 1fr; gap: 2rem; align-items: start;">
        <!-- Left Panel: Instructions -->
        <aside class="flex flex-col gap-4 overflow-y-auto" style="max-height: 80vh; scrollbar-width: none; background: rgba(0,0,0,0.01); padding: 0.5rem; border-radius: 20px;">
          <div class="glass-card" style="padding: 1.5rem; border-left: 6px solid var(--accent-cyan); background: white;">
            <h3 class="v-center gap-2" style="font-size: 1.2rem; margin-bottom: 0.8rem; font-weight: 800;">
              <i data-lucide="target" size="20" style="color: var(--accent-cyan);"></i> Жұмыс мақсаты
            </h3>
            <p style="font-size: 1rem; line-height: 1.5; color: var(--text-primary); font-weight: 500;">${lab.desc}</p>
          </div>
          
          <div class="glass-card" style="padding: 1.5rem; background: white; border: 1px solid var(--border-glass);">
            <h3 class="v-center gap-2" style="font-size: 1.2rem; margin-bottom: 0.8rem; font-weight: 800;">
              <i data-lucide="list-checks" size="20" style="color: var(--accent-orange);"></i> Жұмыс барысы
            </h3>
            <div style="font-size: 1rem; display: flex; flex-direction: column; gap: 0.8rem; line-height: 1.4; color: var(--text-secondary); font-weight: 500;">
              <p><strong style="color: var(--accent-orange);">1.</strong> Параметрлерді таңдаңыз.</p>
              <p><strong style="color: var(--accent-orange);">2.</strong> Тәжірибені бастаңыз.</p>
              <p><strong style="color: var(--accent-orange);">3.</strong> Мәліметтерді бақылаңыз.</p>
              <p><strong style="color: var(--accent-orange);">4.</strong> Қорытынды жасаңыз.</p>
            </div>
          </div>
        </aside> 

        <!-- Main Panel: Simulation -->
        <div id="simulation-container" style="min-height: 600px; display: flex; flex-direction: column;">
          ${simulationHtml}
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
  speak(`${lab.title} зертханалық жұмысы ашылды.`);
}

function speakLabInstructions(topic) {
  speak(`${topic} жұмысының барысы: Бірінші. Параметрлерді реттеп, тәжірибені бастаңыз. Екінші. Алынған мәліметтерді кестеге енгізіңіз. Үшінші. Тәжірибені бірнеше рет қайталаңыз.`);
}

