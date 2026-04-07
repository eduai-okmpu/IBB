/**
 * PhysicsAccess - Student Logic
 */

function startTopic(id) {
  const view = document.getElementById('student-view');
  const topicName = id === 1 ? 'Кинематика негіздері' : 'Динамика заңдары';
  
  view.innerHTML = `
    <div class="flex flex-col gap-6 animate-fade-in">
      <div class="flex items-center gap-4">
        <button class="btn-secondary" onclick="navigate('student')"><i data-lucide="arrow-left"></i> Қайту</button>
        <h2 class="voice-target">${topicName}</h2>
      </div>
      
      <div class="grid" style="grid-template-columns: 1fr 350px; gap: 2rem;">
        <div class="flex flex-col gap-4">
          <div class="glass-panel" style="padding: 0; overflow: hidden; border-radius: 16px; aspect-ratio: 16/9; background: #000; position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
              <i data-lucide="play" size="64" style="color: white; cursor: pointer;"></i>
              <p style="margin-top: 1rem; color: #ccc;">Бейне-сабақты бастау</p>
            </div>
          </div>
          <article class="glass-card voice-target">
            <h3>Тақырып мазмұны</h3>
            <p>Бұл сабақта біз ${topicName} туралы білетін боламыз. Негізгі формулалар мен заңдылықтарды талқылаймыз. Төмендегі тест арқылы біліміңізді тексере аласыз.</p>
          </article>
        </div>
        
        <aside class="flex flex-col gap-4">
          <div class="glass-card voice-target" style="border-color: var(--accent-orange);">
            <h3 class="gradient-text">Тапсырмалар</h3>
            <p>Интерактивті тесттен өтіп, 10 ұпай жинаңыз!</p>
            <button class="btn-primary" style="width: 100%; margin-top: 1rem;" onclick="startQuiz('${topicName}')">Ойынды бастау</button>
          </div>
          <div class="glass-card voice-target">
            <h3>Материалдар</h3>
            <button class="btn-secondary" style="width: 100%; margin-bottom: 0.5rem;"><i data-lucide="file-text"></i> Конспект (Kaz)</button>
          </div>
        </aside>
      </div>
    </div>
  `;
  lucide.createIcons();
  speak(`${topicName} сабағына қош келдіңіз. Бұл жерде бейне-сабақты көріп, тест тапсыра аласыз.`);
}

function startQuiz(topic) {
  const view = document.getElementById('student-view');
  view.innerHTML = `
    <div class="flex flex-col items-center justify-center animate-fade-in" style="min-height: 60vh;">
      <h2 class="gradient-text" style="font-size: 2.5rem; margin-bottom: 2rem;">${topic} - Тест</h2>
      <div id="quiz-container" class="glass-panel" style="padding: 3rem; width: 100%; max-width: 600px; text-align: center;">
        <p class="voice-target" style="font-size: 1.5rem; margin-bottom: 2rem;">Сұрақ 1: Дененің қозғалыс жылдамдығын қандай құралмен өлшейміз?</p>
        <div class="grid gap-4">
          <button class="btn-secondary voice-target" onclick="answer('wrong')">Термометр</button>
          <button class="btn-secondary voice-target" onclick="answer('correct')">Спидометр</button>
          <button class="btn-secondary voice-target" onclick="answer('wrong')">Барометр</button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
  speak("Тест басталды. Бірінші сұрақ: Дененің қозғалыс жылдамдығын қандай құралмен өлшейміз?");
}

function answer(status) {
  const container = document.getElementById('quiz-container');
  if (status === 'correct') {
    container.innerHTML = `
      <div class="animate-fade-in">
        <i data-lucide="star" size="80" style="color: gold; margin-bottom: 1rem;"></i>
        <h2 style="color: #48bb78; font-size: 2.5rem;">Өте жақсы!</h2>
        <p style="font-size: 1.2rem; margin: 1rem 0;">Сіз 10 ұпай жинадыңыз.</p>
        <button class="btn-primary" onclick="navigate('student')">Аяқтау</button>
      </div>
    `;
    speak("Өте жақсы! Жарайсың! Сіз 10 ұпай жинадыңыз.");
    
    // Simple particle effect (Star burst)
    createStars();
  } else {
    speak("Қате. Тағы да байқап көріңіз.");
    alert("Қате. Тағы да байқап көріңіз.");
  }
  lucide.createIcons();
}

function createStars() {
  for (let i = 0; i < 20; i++) {
    const star = document.createElement('div');
    star.innerHTML = '★';
    star.style.position = 'fixed';
    star.style.left = '50%';
    star.style.top = '50%';
    star.style.color = 'gold';
    star.style.fontSize = '2rem';
    star.style.zIndex = '9999';
    star.style.transform = `translate(${(Math.random() - 0.5) * 500}px, ${(Math.random() - 0.5) * 500}px) scale(0)`;
    star.style.transition = 'all 1s ease-out';
    document.body.appendChild(star);
    
    setTimeout(() => {
      star.style.transform = `translate(${(Math.random() - 0.5) * 1000}px, ${(Math.random() - 0.5) * 1000}px) scale(1.5)`;
      star.style.opacity = '0';
    }, 50);
    
    setTimeout(() => star.remove(), 1000);
  }
}
