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

// Student AI Assistant Logic
let currentStudentChatId = null;

function showStudentAIAssistant() {
  const view = document.getElementById('student-view');
  
  if (!currentStudentChatId) {
    if (state.studentAIChats && state.studentAIChats.length > 0) {
      currentStudentChatId = state.studentAIChats[state.studentAIChats.length - 1].id;
    } else {
      createNewStudentAIChat();
    }
  }

  const chat = state.studentAIChats.find(c => c.id === currentStudentChatId) || state.studentAIChats[0];

  view.innerHTML = `
    <div class="flex flex-col animate-fade-in" style="height: 75vh; gap: 1.5rem;">
      <div class="flex justify-between items-center">
        <button class="btn-secondary" onclick="navigate('student')" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
          <i data-lucide="arrow-left" size="18"></i> Мәзір
        </button>
        <div class="flex items-center" style="gap: 0.75rem;">
          <button class="btn-secondary v-center gap-2" onclick="showStudentAIHistory()" style="padding: 0.6rem 1.2rem; border-radius: 12px;">
            <i data-lucide="history" size="18"></i> Тарих
          </button>
          <button class="btn-primary v-center gap-2" onclick="createNewStudentAIChat()" style="padding: 0.6rem 1.2rem; border-radius: 12px;">
            <i data-lucide="plus" size="18"></i> Жаңа чат
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
            <p style="font-size: 0.8rem; color: var(--text-secondary);">${chat ? chat.title : 'Сұрақ қою'}</p>
          </div>
        </div>

        <div id="student-chat-messages" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; background: rgba(255,255,255,0.1);">
          <!-- Messages -->
        </div>

        <div style="padding: 1.5rem; border-top: 1px solid var(--border-glass); background: #fff;">
          <div class="flex" style="gap: 1rem;">
            <input type="text" id="student-chat-input" placeholder="Физикадан көмек керек пе? Сұрақ қой..." 
                   class="glass-panel" style="flex: 1; padding: 1rem 1.5rem; border-radius: 15px; border: 1px solid var(--border-glass); outline: none;"
                   onkeypress="if(event.key === 'Enter') sendStudentAIMessage()">
            <button class="btn-primary" onclick="sendStudentAIMessage()" style="width: 50px; height: 50px; padding: 0; border-radius: 15px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="send" size="20"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  renderStudentChatMessages();
  lucide.createIcons();
}

function createNewStudentAIChat() {
  const newChat = {
    id: Date.now(),
    title: 'Жаңа сұрақ',
    messages: [
      { role: 'ai', text: 'Сәлем! Мен саған физиканы түсінуге көмектесемін. Формулалар, заңдар немесе есептер бойынша сұрақтарың болса, қоя бер!', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ],
    lastUpdate: new Date()
  };
  if (!state.studentAIChats) state.studentAIChats = [];
  state.studentAIChats.push(newChat);
  currentStudentChatId = newChat.id;
  showStudentAIAssistant();
}

function renderStudentChatMessages() {
  const container = document.getElementById('student-chat-messages');
  if (!container) return;
  
  const chat = state.studentAIChats.find(c => c.id === currentStudentChatId);
  if (!chat) return;

  container.innerHTML = chat.messages.map(msg => `
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

function sendStudentAIMessage() {
  const input = document.getElementById('student-chat-input');
  const text = input.value.trim();
  if (!text) return;

  const chat = state.studentAIChats.find(c => c.id === currentStudentChatId);
  if (!chat) return;

  const userMsg = { role: 'user', text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
  chat.messages.push(userMsg);
  chat.lastUpdate = new Date();
  
  if (chat.title === 'Жаңа сұрақ') {
    chat.title = text.length > 25 ? text.substring(0, 25) + '...' : text;
  }

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

  setTimeout(() => {
    const typingElem = document.getElementById(typingId);
    if (typingElem) typingElem.remove();

    let aiText = `Керемет сұрақ! "${text}" туралы саған қарапайым тілмен түсіндіріп көрейін. `;
    if (text.toLowerCase().includes('формула')) {
      aiText += `\n\nНегізгі формулалар:\n- Күш: $F = m \cdot a$\n- Жылдамдық: $v = S / t$\n- Энергия: $E = mc^2$`;
    } else if (text.toLowerCase().includes('ньютон')) {
      aiText += `\n\nНьютонның 3 заңы бар:\n1. Инерция заңы.\n2. $F = ma$.\n3. Әсер етуші күш қарсы әсер етуші күшке тең.`;
    } else {
      aiText += `\n\nБұл тақырыпты тереңірек білгің келсе, сабақтар бөліміндегі видеоны көр немесе зертханада тәжірибе жасап көр!`;
    }

    const aiMsg = { role: 'ai', text: aiText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    chat.messages.push(aiMsg);
    chat.lastUpdate = new Date();
    
    renderStudentChatMessages();
    if (typeof speak === 'function') speak("Жаңа жауап келді.");
    lucide.createIcons();
  }, 1800);
}

function showStudentAIHistory() {
  const view = document.getElementById('student-view');
  const sortedChats = [...(state.studentAIChats || [])].sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));

  view.innerHTML = `
    <div class="flex flex-col animate-fade-in" style="height: 75vh; gap: 1.5rem;">
      <div class="flex justify-between items-center">
        <button class="btn-secondary" onclick="showStudentAIAssistant()" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
          <i data-lucide="arrow-left" size="18"></i> Чатқа қайту
        </button>
        <h2 class="gradient-text" style="font-size: 1.8rem; font-weight: 800;">Менің сұрақтарым</h2>
      </div>

      <div class="glass-card flex flex-col gap-3" style="flex: 1; padding: 1.5rem; overflow-y: auto;">
        ${sortedChats.length === 0 ? `
          <div class="flex-center flex-col gap-4" style="height: 100%; opacity: 0.5;">
            <i data-lucide="message-square-off" size="64"></i>
            <p>Тарих бос...</p>
          </div>
        ` : sortedChats.map(chat => `
          <div class="glass-panel voice-target" onclick="loadStudentAIChat(${chat.id})" 
               style="padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-glass); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
            <div class="flex items-center gap-4">
              <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(var(--accent-cyan-rgb), 0.1); color: var(--accent-cyan); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="help-circle" size="24"></i>
              </div>
              <div>
                <h4 style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.2rem;">${chat.title}</h4>
                <p style="font-size: 0.8rem; color: var(--text-tertiary);">${chat.messages.length} хабарлама • ${new Date(chat.lastUpdate).toLocaleDateString()}</p>
              </div>
            </div>
            <i data-lucide="chevron-right" size="20" style="color: var(--text-tertiary);"></i>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  lucide.createIcons();
}

function loadStudentAIChat(id) {
  currentStudentChatId = id;
  showStudentAIAssistant();
}

