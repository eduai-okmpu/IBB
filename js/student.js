/**
 * PhysicsAccess - Student Logic
 */

function startTopic(id) {
  const view = document.getElementById('student-view');
  const topicName = id === 1 ? 'Кинематика негіздері' : 'Динамика заңдары';
  
  view.innerHTML = `
    <div class="flex flex-col gap-6 animate-fade-in">
      <div class="flex items-center gap-4">
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

// Student AI Assistant Logic
let studentChatMessages = [
  { role: 'ai', text: 'Сәлем! Мен саған физиканы түсінуге көмектесемін. Формулалар, заңдар немесе есептер бойынша сұрақтарың болса, қоя бер!', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
];

function showStudentAIAssistant() {
  const view = document.getElementById('student-ai-view');
  
  view.innerHTML = `
    <div class="flex flex-col animate-fade-in" style="height: 75vh; gap: 1.5rem;">
      <div class="flex justify-between items-center">
        <div></div>
        <div class="flex items-center" style="gap: 0.75rem;">
          <button class="btn-primary v-center gap-2" onclick="clearStudentAIChat()" style="padding: 0.6rem 1.2rem; border-radius: 12px;">
            <i data-lucide="refresh-cw" size="18"></i> Тазалау
          </button>
        </div>
      </div>

      <div class="glass-card flex flex-col" style="flex: 1; padding: 0; overflow: hidden; border-radius: 24px;">
        <div style="padding: 1.2rem 2rem; border-bottom: 1px solid var(--border-glass); background: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 1rem;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; color: white;">
            <i data-lucide="sparkles" size="20"></i>
          </div>
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 800;">Физика Көмекшісі</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Сұрақ қою</p>
          </div>
        </div>

        <div id="student-chat-messages" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; background: rgba(255,255,255,0.1);">
          <!-- Messages -->
        </div>

        <div class="chat-input-wrapper" style="padding: 1.2rem; border-top: 1px solid var(--border-glass); background: #fff;">
          <div class="flex" style="gap: 0.75rem; align-items: center;">
            <input type="text" id="student-chat-input" placeholder="Физикадан көмек керек пе? Сұрақ қой..." 
                   class="glass-panel" style="flex: 1; padding: 0.8rem 1.2rem; border-radius: 15px; border: 1px solid var(--border-glass); outline: none; font-size: 1rem;"
                   onkeypress="if(event.key === 'Enter') sendStudentAIMessage()">
            <button class="btn-primary chat-send-btn" onclick="sendStudentAIMessage()" style="width: 48px; height: 48px; flex-shrink: 0; padding: 0; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="send" size="20"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  renderStudentChatMessages();
  if (window.lucide) lucide.createIcons();
}

function clearStudentAIChat() {
  studentChatMessages = [
    { role: 'ai', text: 'Сәлем! Мен саған физиканы түсінуге көмектесемін. Формулалар, заңдар немесе есептер бойынша сұрақтарың болса, қоя бер!', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ];
  renderStudentChatMessages();
}

function renderStudentChatMessages() {
  const container = document.getElementById('student-chat-messages');
  if (!container) return;
  
  container.innerHTML = studentChatMessages.map(msg => `
    <div class="animate-scale-in" style="display: flex; flex-direction: column; align-items: ${msg.role === 'user' ? 'flex-end' : 'flex-start'}; gap: 0.3rem; max-width: 85%; align-self: ${msg.role === 'user' ? 'flex-end' : 'flex-start'};">
      <div style="padding: 1rem 1.2rem; border-radius: ${msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0'}; 
                  background: ${msg.role === 'user' ? 'var(--primary-gradient)' : '#fff'}; 
                  color: ${msg.role === 'user' ? '#fff' : 'var(--text-primary)'};
                  box-shadow: 0 4px 15px rgba(0,0,0,0.05); font-size: 1rem; line-height: 1.5; border: ${msg.role === 'ai' ? '1px solid var(--border-glass)' : 'none'};">
        ${msg.text.replace(/\n/g, '<br>')}
      </div>
      <span style="font-size: 0.7rem; color: var(--text-tertiary); margin: 0 0.5rem;">${msg.time}</span>
    </div>
  `).join('');
  
  container.scrollTop = container.scrollHeight;
}

async function sendStudentAIMessage() {
  const input = document.getElementById('student-chat-input');
  const text = input.value.trim();
  if (!text) return;

  const userMsg = { role: 'user', text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
  studentChatMessages.push(userMsg);

  input.value = '';
  renderStudentChatMessages();
  if (typeof playSound === 'function') playSound('correct');

  const container = document.getElementById('student-chat-messages');
  const typingId = 'typing-' + Date.now();
  container.insertAdjacentHTML('beforeend', `
    <div id="${typingId}" class="animate-fade-in" style="align-self: flex-start; background: #fff; padding: 1rem 1.2rem; border-radius: 20px 20px 20px 0; border: 1px solid var(--border-glass); display: flex; gap: 4px;">
      <div style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-orange); animation: dotPulse 1.5s infinite 0s;"></div>
      <div style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-orange); animation: dotPulse 1.5s infinite 0.2s;"></div>
      <div style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-orange); animation: dotPulse 1.5s infinite 0.4s;"></div>
    </div>
  `);
  container.scrollTop = container.scrollHeight;

  try {
    const result = await window.callAI(text);
    
    const typingElem = document.getElementById(typingId);
    if (typingElem) typingElem.remove();

    if (result.success) {
      const aiMsg = { role: 'ai', text: result.text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      studentChatMessages.push(aiMsg);
      
      renderStudentChatMessages();
      if (typeof speak === 'function') speak("Жаңа жауап келді.");
    } else {
      alert("AI қатесі: " + result.message);
    }
  } catch (error) {
    const typingElem = document.getElementById(typingId);
    if (typingElem) typingElem.remove();
    alert("Байланыс қатесі");
  }
  if (window.lucide) lucide.createIcons();
}

