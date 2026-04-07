/**
 * PhysicsAccess - Lab Logic
 */

function showLabDetails(id) {
  const lab = state.labs.find(l => l.id === id);
  if (!lab) return;
  
  const view = document.getElementById('labs-view');
  view.innerHTML = `
    <div class="flex flex-col gap-6 animate-fade-in" style="height: 100%;">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button class="btn-secondary v-center h-center" style="width: 40px; height: 40px; border-radius: 50%; padding: 0;" onclick="renderLabs()">
            <i data-lucide="arrow-left" size="20"></i>
          </button>
          <div>
            <h2 class="gradient-text" style="font-size: 1.8rem;">${lab.title}</h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Зертханалық жұмыс №${lab.id}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn-secondary v-center" style="gap: 0.5rem;" onclick="speak('${lab.title}. ${lab.desc}')">
            <i data-lucide="volume-2" size="20"></i> Дыбыстау
          </button>
          <button class="btn-primary v-center" style="gap: 0.5rem;" onclick="window.open('${lab.phetUrl.replace('_en.html', '_en.html')}', '_blank')">
            <i data-lucide="external-link" size="20"></i> Толық экран
          </button>
        </div>
      </div>
      
      <div class="grid" style="grid-template-columns: 350px 1fr; gap: 1.5rem; flex-grow: 1;">
        <!-- Left Panel: Instructions -->
        <aside class="flex flex-col gap-4 overflow-y-auto" style="max-height: 70vh;">
          <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid var(--accent-cyan);">
            <h3 class="v-center gap-2" style="font-size: 1.1rem; margin-bottom: 1rem;">
              <i data-lucide="target" size="18" style="color: var(--accent-cyan);"></i> Жұмыс мақсаты
            </h3>
            <p style="font-size: 0.95rem; line-height: 1.5;">${lab.desc}</p>
          </div>
          
          <div class="glass-card" style="padding: 1.5rem;">
            <h3 class="v-center gap-2" style="font-size: 1.1rem; margin-bottom: 1rem;">
              <i data-lucide="list-checks" size="18" style="color: var(--accent-orange);"></i> Жұмыс барысы
            </h3>
            <div style="font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.8rem;">
              <p><strong>1.</strong> Ашылған симуляция терезесінде "Play" батырмасын басыңыз.</p>
              <p><strong>2.</strong> Параметрлерді (масса, ұзындық, кернеу т.б.) тақырыпқа сай реттеңіз.</p>
              <p><strong>3.</strong> Өлшеу құралдарын (сызғыш, амперметр, секундомер) пайдаланып, деректерді жазып алыңыз.</p>
              <p><strong>4.</strong> Тәжірибені 3 рет қайталап, орташа мәнін есептеңіз.</p>
              <p><strong>5.</strong> Қорытынды жасаңыз: алынған нәтиже теориялық заңдылыққа сәйкес келе ме?</p>
            </div>
          </div>

          <div class="glass-card" style="padding: 1.5rem; background: rgba(var(--accent-purple-rgb), 0.05);">
             <h4 class="v-center gap-2" style="font-size: 1rem; margin-bottom: 0.5rem;">
               <i data-lucide="help-circle" size="16"></i> Көмек керек пе?
             </h4>
             <p style="font-size: 0.85rem; opacity: 0.8;">Симуляциямен жұмыс істеу қиындық тудырса, AI Көмекшіге хабарласыңыз.</p>
          </div>
        </aside>

        <!-- Main Panel: PhET Simulation -->
        <div class="glass-panel" style="padding: 0; overflow: hidden; border-radius: 20px; background: #000; border: 2px solid var(--border-glass);">
          <iframe 
            src="${lab.phetUrl}" 
            width="100%" 
            height="100%" 
            scrolling="no" 
            allowfullscreen 
            style="border: none; min-height: 500px;">
          </iframe>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
  speak(`${lab.title} зертханалық жұмысы ашылды.`);
}

function speakLabInstructions(topic) {
  speak(`${topic} жұмысының барысы: Бірінші. Штативке жіпті бекітіп, оның ұзындығын өлшеңіз. Екінші. Маятникті он-он бес градусқа ауытқытып, еркін жіберіңіз. Үшінші. Он толық тербеліс жасауға кеткен уақытты өлшеңіз. Төртінші. Периодын және жиілігін есептеңіз.`);
}
