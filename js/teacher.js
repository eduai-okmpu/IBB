/**
 * PhysicsAccess - Teacher Logic (Premium UI & 120 Questions)
 */

let currentTeacherChatId = null;

function showAIAssistant() {
  const content = document.getElementById('teacher-content');
  
  // If no chat selected, create or pick latest
  if (!currentTeacherChatId) {
    if (state.teacherAIChats.length > 0) {
      currentTeacherChatId = state.teacherAIChats[state.teacherAIChats.length - 1].id;
    } else {
      createNewTeacherAIChat();
    }
  }

  const chat = state.teacherAIChats.find(c => c.id === currentTeacherChatId) || state.teacherAIChats[0];

  content.innerHTML = `
    <div class="flex flex-col animate-fade-in" style="height: 75vh; gap: 1.5rem;">
      <div class="flex justify-between items-center">
        <button class="btn-secondary voice-target" onclick="renderTeacherDashboard()" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
          <i data-lucide="arrow-left" size="18"></i> Басты бет
        </button>
        <div class="flex items-center" style="gap: 0.75rem;">
          <button class="btn-secondary v-center gap-2" onclick="showTeacherAIHistory()" style="padding: 0.6rem 1.2rem; border-radius: 12px;">
            <i data-lucide="history" size="18"></i> Тарих
          </button>
          <button class="btn-primary v-center gap-2" onclick="createNewTeacherAIChat()" style="padding: 0.6rem 1.2rem; border-radius: 12px;">
            <i data-lucide="plus" size="18"></i> Жаңа чат
          </button>
        </div>
      </div>

      <div class="glass-card flex flex-col" style="flex: 1; padding: 0; overflow: hidden; border-radius: 24px;">
        <!-- Chat Header -->
        <div style="padding: 1.2rem 2rem; border-bottom: 1px solid var(--border-glass); background: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 1rem;">
          <div style="width: 40px; height: 40px; border-radius: 10px; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; color: white;">
            <i data-lucide="bot" size="20"></i>
          </div>
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 800;">AI Көмекші</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">${chat ? chat.title : 'Жаңа сөйлесу'}</p>
          </div>
        </div>

        <!-- Chat Messages -->
        <div id="teacher-chat-messages" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; background: rgba(255,255,255,0.1);">
          <!-- Messages will be rendered here -->
        </div>

        <!-- Chat Input -->
        <div style="padding: 1.5rem; border-top: 1px solid var(--border-glass); background: #fff;">
          <div class="flex" style="gap: 1rem;">
            <input type="text" id="teacher-chat-input" placeholder="Сұрақ қойыңыз немесе тақырыпты жазыңыз..." 
                   class="glass-panel" style="flex: 1; padding: 1rem 1.5rem; border-radius: 15px; border: 1px solid var(--border-glass); outline: none;"
                   onkeypress="if(event.key === 'Enter') sendTeacherAIMessage()">
            <button class="btn-primary" onclick="sendTeacherAIMessage()" style="width: 50px; height: 50px; padding: 0; border-radius: 15px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="send" size="20"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  renderTeacherChatMessages();
  lucide.createIcons();
}

function createNewTeacherAIChat() {
  const newChat = {
    id: Date.now(),
    title: 'Жаңа сөйлесу',
    messages: [
      { role: 'ai', text: 'Сәлеметсіз бе! Мен сіздің AI көмекшіңізбін. Сабақ жоспарын құруға, есептер шығаруға немесе физикадан кез келген сұраққа жауап беруге дайынмын.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
    ],
    lastUpdate: new Date()
  };
  state.teacherAIChats.push(newChat);
  currentTeacherChatId = newChat.id;
  showAIAssistant();
}

function renderTeacherChatMessages() {
  const container = document.getElementById('teacher-chat-messages');
  if (!container) return;
  
  const chat = state.teacherAIChats.find(c => c.id === currentTeacherChatId);
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

function sendTeacherAIMessage() {
  const input = document.getElementById('teacher-chat-input');
  const text = input.value.trim();
  if (!text) return;

  const chat = state.teacherAIChats.find(c => c.id === currentTeacherChatId);
  if (!chat) return;

  // Add User Message
  const userMsg = { role: 'user', text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
  chat.messages.push(userMsg);
  chat.lastUpdate = new Date();
  
  // Set title based on first user message if it's still "New Chat"
  if (chat.title === 'Жаңа сөйлесу') {
    chat.title = text.length > 25 ? text.substring(0, 25) + '...' : text;
  }

  input.value = '';
  renderTeacherChatMessages();
  playSound('correct');

  // AI Typing indicator
  const container = document.getElementById('teacher-chat-messages');
  const typingId = 'typing-' + Date.now();
  const typingHtml = `
    <div id="${typingId}" class="animate-fade-in" style="align-self: flex-start; background: #fff; padding: 1rem 1.2rem; border-radius: 20px 20px 20px 0; border: 1px solid var(--border-glass); display: flex; gap: 4px;">
      <div class="dot-typing" style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-orange); animation: dotPulse 1.5s infinite 0s;"></div>
      <div class="dot-typing" style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-orange); animation: dotPulse 1.5s infinite 0.2s;"></div>
      <div class="dot-typing" style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-orange); animation: dotPulse 1.5s infinite 0.4s;"></div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', typingHtml);
  container.scrollTop = container.scrollHeight;

  // Simulate AI Response
  setTimeout(() => {
    const typingElem = document.getElementById(typingId);
    if (typingElem) typingElem.remove();

    let aiText = `Сіздің "${text}" туралы сұранысыңыз бойынша материал дайындадым. `;
    if (text.toLowerCase().includes('ө жоспар') || text.toLowerCase().includes('сабақ')) {
      aiText += `\n\n**Сабақ жоспары: ${text}**\n1. Ұйымдастыру кезеңі (5 мин)\n2. Өткен тақырыпты қайталау (10 мин)\n3. Жаңа материалды түсіндіру (20 мин)\n4. Есептер шығару (10 мин)\n5. Қорытынды.`;
    } else {
      aiText += `\n\nБұл тақырып бойынша қосымша мәліметтер керек болса немесе есеп шығару қажет болса, хабарласыңыз. Мен сізге көмектесуге әрқашан дайынмын.`;
    }

    const aiMsg = { role: 'ai', text: aiText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    chat.messages.push(aiMsg);
    chat.lastUpdate = new Date();
    
    renderTeacherChatMessages();
    speak("Жаңа хабарлама келді.");
    lucide.createIcons();
  }, 1800);
}

function showTeacherAIHistory() {
  const content = document.getElementById('teacher-content');
  
  const sortedChats = [...state.teacherAIChats].sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));

  content.innerHTML = `
    <div class="flex flex-col animate-fade-in" style="height: 75vh; gap: 1.5rem;">
      <div class="flex justify-between items-center">
        <button class="btn-secondary voice-target" onclick="showAIAssistant()" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
          <i data-lucide="arrow-left" size="18"></i> Чатқа қайту
        </button>
        <h2 class="gradient-text" style="font-size: 1.8rem; font-weight: 800;">Сұраныстар тарихы</h2>
      </div>

      <div class="glass-card flex flex-col gap-3" style="flex: 1; padding: 1.5rem; overflow-y: auto;">
        ${sortedChats.length === 0 ? `
          <div class="flex-center flex-col gap-4" style="height: 100%; opacity: 0.5;">
            <i data-lucide="message-square-off" size="64"></i>
            <p>Тарих бос...</p>
          </div>
        ` : sortedChats.map(chat => `
          <div class="glass-panel voice-target" onclick="loadTeacherAIChat(${chat.id})" 
               style="padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-glass); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
            <div class="flex items-center gap-4">
              <div style="width: 45px; height: 45px; border-radius: 12px; background: rgba(var(--accent-orange-rgb), 0.1); color: var(--accent-orange); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="message-circle" size="24"></i>
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

function loadTeacherAIChat(id) {
  currentTeacherChatId = id;
  showAIAssistant();
}


let currentManagerTab = 'list'; // 'list' or 'results'

window.showClassManager = function() {
  const content = document.getElementById('teacher-class-view');
  
  const teacherClassesRaw = state.teacherProfile.classes || '';
  const availableClasses = teacherClassesRaw.split(',').map(c => c.trim().replace(/["']/g, '')).filter(c => c);
  
  content.innerHTML = `
    <div class="animate-fade-in" style="padding: 2rem 0;">
    <button class="btn-secondary voice-target" onclick="navigate('teacher')" style="margin-bottom: 2rem; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
      <i data-lucide="arrow-left" size="18"></i> Басты бетке қайту
    </button>
    
    <div class="glass-card" style="padding: 2.5rem; min-height: 600px;">
      <div class="flex justify-between items-center" style="margin-bottom: 2.1rem;">
        <div>
          <h2 class="voice-target gradient-text" style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">Менің сыныбым</h2>
          <p style="color: var(--text-secondary);">Оқушылар тізімі мен үлгерімін бақылаңыз</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="v-center glass-panel" style="padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff;">
            <i data-lucide="search" size="18" style="color: var(--text-tertiary); margin-right: 0.5rem;"></i>
            <input type="text" id="class-manager-search" placeholder="Оқушыны іздеу..." style="border: none; outline: none; background: transparent; font-size: 0.95rem; width: 180px;" oninput="filterClassManager()">
          </div>
          <div class="flex items-center gap-2">
            <label class="label-caps" style="margin-bottom: 0;">Сынып:</label>
            <select id="teacher-class-filter" class="glass-panel" style="padding: 0.6rem 1rem; border-radius: 12px; outline: none; border: 1px solid var(--border-glass); cursor: pointer;" onchange="filterClassManager()">
              <option value="all">Барлық сыныптар</option>
              ${availableClasses.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          ${currentManagerTab === 'list' ? `
            <button class="btn-primary v-center gap-2" style="padding: 0.6rem 1.2rem; border-radius: 12px; cursor: pointer; position: relative; z-index: 10;" onclick="showAddStudentModal()">
              <i data-lucide="user-plus" size="18"></i> Оқушы қосу
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="flex gap-4" style="margin-bottom: 2rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem;">
        <button class="tab-btn ${currentManagerTab === 'list' ? 'active' : ''}" onclick="switchManagerTab('list')" style="background: none; border: none; padding: 0.8rem 1.5rem; font-weight: 700; cursor: pointer; color: ${currentManagerTab === 'list' ? 'var(--accent-orange)' : 'var(--text-tertiary)'}; border-bottom: 2px solid ${currentManagerTab === 'list' ? 'var(--accent-orange)' : 'transparent'}; transition: all 0.2s;">
          <i data-lucide="users" size="18" style="vertical-align: middle; margin-right: 0.5rem;"></i> Оқушылар тізімі
        </button>
        <button class="tab-btn ${currentManagerTab === 'results' ? 'active' : ''}" onclick="switchManagerTab('results')" style="background: none; border: none; padding: 0.8rem 1.5rem; font-weight: 700; cursor: pointer; color: ${currentManagerTab === 'results' ? 'var(--accent-orange)' : 'var(--text-tertiary)'}; border-bottom: 2px solid ${currentManagerTab === 'results' ? 'var(--accent-orange)' : 'transparent'}; transition: all 0.2s;">
          <i data-lucide="bar-chart-2" size="18" style="vertical-align: middle; margin-right: 0.5rem;"></i> Үлгерім нәтижелері
        </button>
      </div>

      <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
            <thead id="manager-thead">
              <!-- Content generated by filterClassManager() -->
            </thead>
            <tbody id="class-manager-tbody">
              <!-- Content generated by filterClassManager() -->
            </tbody>
          </table>
      </div>
    </div>
    </div>

    <!-- Add Student Modal -->
    <div id="add-student-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 9999; align-items: center; justify-content: center;">
      <div class="glass-card animate-scale-in" style="width: 100%; max-width: 500px; padding: 3rem; background: #fff;">
        <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.5rem; font-weight: 800;">Жаңа оқушы қосу</h3>
          <button class="btn-secondary" onclick="closeAddStudentModal()" style="padding: 0.5rem; border-radius: 50%;"><i data-lucide="x"></i></button>
        </div>
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <label class="label-caps">Оқушының аты-жөні:</label>
            <input type="text" id="new-student-name" placeholder="Мысалы: Дархан Саматұлы" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: rgba(0,0,0,0.02);">
          </div>
          <div class="flex flex-col gap-2">
            <label class="label-caps">Сыныбы:</label>
            <select id="new-student-grade" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: rgba(0,0,0,0.02);">
              ${availableClasses.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <button class="btn-primary" onclick="addNewStudentToState()" style="margin-top: 1rem; padding: 1.2rem; border-radius: 12px; font-weight: 700;">Сақтау</button>
        </div>
      </div>
    </div>
  `;
  
  filterClassManager();
  lucide.createIcons();
}

window.switchManagerTab = function(tab) {
  currentManagerTab = tab;
  showClassManager();
}

window.showAddStudentModal = function() {
  const modal = document.getElementById('add-student-modal');
  if (modal) {
    modal.style.display = 'flex';
    lucide.createIcons();
  }
}

window.closeAddStudentModal = function() {
  const modal = document.getElementById('add-student-modal');
  if (modal) modal.style.display = 'none';
}

window.addNewStudentToState = function() {
  const name = document.getElementById('new-student-name').value.trim();
  const grade = document.getElementById('new-student-grade').value;
  
  if (!name) {
    alert("Оқушының атын енгізіңіз");
    return;
  }

  const newStudent = {
    id: Date.now(),
    name: name,
    grade: grade,
    points: 0,
    level: 1,
    school: state.teacherProfile.school || '№15 ІТ мектеп-лицейі'
  };

  state.allStudents.push(newStudent);
  saveState();
  closeAddStudentModal();
  filterClassManager();
  if (window.playSound) window.playSound('correct');
  if (window.speakText) window.speakText('Жаңа оқушы тізімге қосылды.');
}

window.deleteStudentFromState = function(id) {
  if (!confirm("Оқушыны тізімнен өшіруді мақұлдайсыз ба?")) return;
  state.allStudents = state.allStudents.filter(s => s.id !== id);
  saveState();
  filterClassManager();
}

window.filterClassManager = function() {
  const filterVal = document.getElementById('teacher-class-filter').value;
  const searchVal = document.getElementById('class-manager-search').value.toLowerCase();
  const thead = document.getElementById('manager-thead');
  const tbody = document.getElementById('class-manager-tbody');
  
  const teacherClassesRaw = state.teacherProfile.classes || '';
  const teacherClasses = teacherClassesRaw.split(',').map(c => c.trim().replace(/["']/g, ''));

  if (currentManagerTab === 'results') {
    // RENDER RESULTS VIEW
    thead.innerHTML = `
      <tr class="label-caps" style="text-align: left; opacity: 0.6;">
        <th style="padding: 0 1rem 1rem 1rem;">Оқушы</th>
        <th style="padding: 0 1rem 1rem 1rem;">Сынып</th>
        <th style="padding: 0 1rem 1rem 1rem;">Тақырып</th>
        <th style="padding: 0 1rem 1rem 1rem;">Нәтиже</th>
        <th style="padding: 0 1rem 1rem 1rem;">Күні</th>
      </tr>
    `;

    let filteredResults = state.quizResults.filter(res => {
      const resGrade = (res.grade || '').trim().toLowerCase().replace(/["']/g, '').replace(/[aа]/g, 'а').replace(/[eе]/g, 'е').replace(/[oо]/g, 'о').replace(/[kк]/g, 'к');
      const matchesSearch = (res.studentName || '').toLowerCase().includes(searchVal);
      
      const isInTeacherClass = teacherClasses.some(tc => {
        const cleanTc = tc.trim().toLowerCase().replace(/["']/g, '').replace(/[aа]/g, 'а').replace(/[eе]/g, 'е').replace(/[oо]/g, 'о').replace(/[kк]/g, 'к');
        return cleanTc === resGrade;
      });

      if (filterVal !== 'all' && !isInTeacherClass) return false;
      if (filterVal !== 'all' && resGrade !== filterVal.toLowerCase().replace(/["']/g, '').replace(/[aа]/g, 'а').replace(/[eе]/g, 'е').replace(/[oо]/g, 'о').replace(/[kк]/g, 'к')) return false;
      if (searchVal && !matchesSearch) return false;
      return true;
    });

    if (filteredResults.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-tertiary);">Мәліметтер табылмады</td></tr>`;
    } else {
      tbody.innerHTML = filteredResults.map(res => {
        const percentage = Math.round((res.score / res.maxScore) * 100);
        let scoreColor = percentage < 50 ? '#F44336' : (percentage < 85 ? '#FFC107' : '#4CAF50');
        return `
          <tr style="background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); border-radius: 16px; transition: transform 0.2s ease;">
            <td style="padding: 1.2rem; border-radius: 16px 0 0 16px; font-weight: 700;">${res.studentName}</td>
            <td style="padding: 1.2rem;">${res.grade}</td>
            <td style="padding: 1.2rem; font-size: 0.9rem;">${res.topic}</td>
            <td style="padding: 1.2rem;">
              <div class="flex items-center gap-3">
                 <div style="flex: 1; height: 8px; background: rgba(0,0,0,0.05); border-radius: 10px; overflow: hidden; width: 100px;">
                    <div style="width: ${percentage}%; height: 100%; background: ${scoreColor}; border-radius: 10px;"></div>
                 </div>
                 <span style="font-weight: 800; color: ${scoreColor};">${res.score}/${res.maxScore}</span>
              </div>
            </td>
            <td style="padding: 1.2rem; border-radius: 0 16px 16px 0; font-size: 0.8rem; color: var(--text-tertiary);">${res.date}</td>
          </tr>
        `;
      }).join('');
    }
  } else {
    // RENDER STUDENT LIST VIEW
    thead.innerHTML = `
      <tr class="label-caps" style="text-align: left; opacity: 0.6;">
        <th style="padding: 0 1rem 1rem 1rem;">Оқушы</th>
        <th style="padding: 0 1rem 1rem 1rem;">Сынып</th>
        <th style="padding: 0 1rem 1rem 1rem;">Мектеп</th>
        <th style="padding: 0 1rem 1rem 1rem; text-align: right;">Әрекет</th>
      </tr>
    `;

    let filteredStudents = state.allStudents.filter(s => {
      const sGrade = (s.grade || '').trim().toLowerCase().replace(/["']/g, '').replace(/[aа]/g, 'а').replace(/[eе]/g, 'е').replace(/[oо]/g, 'о').replace(/[kк]/g, 'к');
      const matchesSearch = (s.name || '').toLowerCase().includes(searchVal);
      
      const isInTeacherClass = teacherClasses.some(tc => {
        const cleanTc = tc.trim().toLowerCase().replace(/["']/g, '').replace(/[aа]/g, 'а').replace(/[eе]/g, 'е').replace(/[oо]/g, 'о').replace(/[kк]/g, 'к');
        return cleanTc === sGrade;
      });

      if (filterVal !== 'all' && !isInTeacherClass) return false;
      if (filterVal !== 'all' && sGrade !== filterVal.toLowerCase().replace(/["']/g, '').replace(/[aа]/g, 'а').replace(/[eе]/g, 'е').replace(/[oо]/g, 'о').replace(/[kк]/g, 'к')) return false;
      if (searchVal && !matchesSearch) return false;
      return true;
    }).sort((a,b) => a.name.localeCompare(b.name));

    if (filteredStudents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-tertiary);">Оқушылар табылмады</td></tr>`;
    } else {
      tbody.innerHTML = filteredStudents.map(s => `
        <tr style="background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); border-radius: 16px; transition: transform 0.2s ease;">
          <td style="padding: 1.2rem; border-radius: 16px 0 0 16px;">
            <div class="flex items-center gap-3">
              <div style="width: 35px; height: 35px; border-radius: 50%; background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;">${s.name.charAt(0)}</div>
              <span style="font-weight: 700;">${s.name}</span>
            </div>
          </td>
          <td style="padding: 1.2rem;">${s.grade}</td>
          <td style="padding: 1.2rem; font-size: 0.85rem; color: var(--text-secondary);">${s.school}</td>
          <td style="padding: 1.2rem; border-radius: 0 16px 16px 0; text-align: right;">
            <button class="btn-secondary" style="padding: 0.5rem; border-radius: 10px; color: #ef4444;" onclick="deleteStudentFromState(${s.id})"><i data-lucide="trash-2" size="18"></i></button>
          </td>
        </tr>
      `).join('');
    }
  }
  
  lucide.createIcons();
}



const physicsDb = {
  "questions": {
    "Механика": [
      {
        "q": "Күштің өлшем бірлігі қандай?",
        "options": [
          "Ньютон (Н)",
          "Паскаль (Па)",
          "Джоуль (Дж)",
          "Ватт (Вт)"
        ],
        "answer": 0
      },
      {
        "q": "Энергияның физикалық мағынасы қандай?",
        "options": [
          "Дененің жұмыс істеу қабілеті",
          "Қозғалыс жылдамдығы",
          "Дененің массасы",
          "Кедергі күші"
        ],
        "answer": 0
      },
      {
        "q": "Архимед заңы қандай параметрлерге байланысты?",
        "options": [
          "Сұйықтың тығыздығы мен батқан бөліктің көлеміне",
          "Сұйықтың массасына",
          "Дененің пішініне",
          "Ауа қысымына"
        ],
        "answer": 0
      },
      {
        "q": "Үдеудің өлшем бірлігі?",
        "options": [
          "м/с²",
          "м/с",
          "м",
          "кг"
        ],
        "answer": 0
      },
      {
        "q": "Ньютонның екінші заңы?",
        "options": [
          "F = ma",
          "F = m/a",
          "a = F*m",
          "P = mv"
        ],
        "answer": 0
      },
      {
        "q": "Жұмыс формуласы?",
        "options": [
          "A = Fs",
          "A = P/t",
          "A = mgh",
          "A = v/t"
        ],
        "answer": 0
      },
      {
        "q": "Кинетикалық энергия формуласы?",
        "options": [
          "Ek = mv²/2",
          "Ep = mgh",
          "Ek = ma",
          "Ek = mv"
        ],
        "answer": 0
      },
      {
        "q": "Қысым формуласы?",
        "options": [
          "P = F/S",
          "P = S/F",
          "P = m/V",
          "P = v*t"
        ],
        "answer": 0
      },
      {
        "q": "Еркін түсу үдеуі шамамен қаншаға тең (g)?",
        "options": [
          "9.8 м/с²",
          "10 м/с²",
          "8.9 м/с²",
          "11 м/с²"
        ],
        "answer": 0
      },
      {
        "q": "Импульс формуласы?",
        "options": [
          "p = mv",
          "p = m/v",
          "p = Ft",
          "p = ma"
        ],
        "answer": 0
      }
    ],
    "Термодинамика": [
      {
        "q": "Температураның абсолют нөлі?",
        "options": [
          "-273.15 °C",
          "0 °C",
          "-100 °C",
          "-373.15 °C"
        ],
        "answer": 0
      },
      {
        "q": "Термодинамиканың бірінші заңы?",
        "options": [
          "Q = ΔU + A",
          "Q = ΔU - A",
          "U = Q + A",
          "ΔU = Q / A"
        ],
        "answer": 0
      },
      {
        "q": "Заттың үш күйі?",
        "options": [
          "Қатты, сұйық, газ",
          "Су, мұз, бу",
          "От, су, жер",
          "Металл, бейметалл"
        ],
        "answer": 0
      },
      {
        "q": "Қайнау температурасы (қалыпты жағдайда)?",
        "options": [
          "100 °C",
          "0 °C",
          "50 °C",
          "373 K"
        ],
        "answer": 0
      },
      {
        "q": "Газ заңдары (Изобаралық)?",
        "options": [
          "V/T = const",
          "P/T = const",
          "PV = const",
          "P/V = const"
        ],
        "answer": 0
      },
      {
        "q": "Менделеев-Клапейрон теңдеуі?",
        "options": [
          "PV = nRT",
          "PV = T",
          "P/T = R",
          "V = nRT"
        ],
        "answer": 0
      },
      {
        "q": "Ішкі энергия неге байланысты (идеал газ үшін)?",
        "options": [
          "Температураға",
          "Көлемге",
          "Қысымға",
          "Массаға"
        ],
        "answer": 0
      },
      {
        "q": "Жылулық сыйымдылық бірлігі?",
        "options": [
          "Дж/(кг·К)",
          "Дж",
          "Вт",
          "Кельвин"
        ],
        "answer": 0
      }
    ],
    "Электр және магнетизм": [
      {
        "q": "Кернеудің өлшем бірлігі?",
        "options": [
          "Вольт (В)",
          "Ампер (А)",
          "Ом",
          "Ватт (Вт)"
        ],
        "answer": 0
      },
      {
        "q": "Ток күшіның формуласы?",
        "options": [
          "I = U/R",
          "U = I/R",
          "R = U*I",
          "I = q*t"
        ],
        "answer": 0
      },
      {
        "q": "Қарсыласудың өлшем бірлігі?",
        "options": [
          "Ом",
          "Фарадей",
          "Генри",
          "Тесла"
        ],
        "answer": 0
      },
      {
        "q": "Ом заңы?",
        "options": [
          "I = U/R",
          "U = IR",
          "R = U/I",
          "P = UI"
        ],
        "answer": 0
      },
      {
        "q": "Кулон заңы?",
        "options": [
          "F = k*q1*q2/r²",
          "F = ma",
          "F = mg",
          "F = BIl"
        ],
        "answer": 0
      }
    ],
    "Оптика": [
      {
        "q": "Жарық жылдамдығы вакуумде қаншаға тең?",
        "options": [
          "300 000 км/с",
          "150 000 км/с",
          "300 м/с",
          "1000 км/с"
        ],
        "answer": 0
      },
      {
        "q": "Шағылысу заңы?",
        "options": [
          "Түсу бұрышы шағылысу бұрышына тең",
          "Сыну бұрышы үлкен",
          "Түсу бұрышы 90 градус",
          "Сәулелер тоғысады"
        ],
        "answer": 0
      },
      {
        "q": "Жарықтың сыну көрсеткіші?",
        "options": [
          "n = c/v",
          "n = v/c",
          "n = sin(r)/sin(i)",
          "n = d/f"
        ],
        "answer": 0
      },
      {
        "q": "Линзаның оптикалық күші?",
        "options": [
          "Диоптрия (дптр)",
          "Метр (м)",
          "Ватт (Вт)",
          "Люкс (лк)"
        ],
        "answer": 0
      }
    ],
    "Кванттық физика": [
      {
        "q": "Жарық кванты қалай аталады?",
        "options": [
          "Фотон",
          "Электрон",
          "Протон",
          "Нейтрон"
        ],
        "answer": 0
      },
      {
        "q": "Фотоэффект заңын кім ашты?",
        "options": [
          "Альберт Эйнштейн",
          "Нильс Бор",
          "Макс Планк",
          "Эрнест Резерфорд"
        ],
        "answer": 0
      },
      {
        "q": "Атомның планетарлық моделін ұсынған?",
        "options": [
          "Эрнест Резерфорд",
          "Дж. Томсон",
          "Нильс Бор",
          "Исаак Ньютон"
        ],
        "answer": 0
      },
      {
        "q": "Планк тұрақтысының мағынасы?",
        "options": [
          "Энергия квантының жиілікке қатынасы",
          "Жарық жылдамдығы",
          "Масса",
          "Күш"
        ],
        "answer": 0
      },
      {
        "q": "Радиоактивтілік құбылысын ашқан?",
        "options": [
          "Анри Беккерель",
          "Мария Кюри",
          "Пьер Кюри",
          "Вильгельм Рентген"
        ],
        "answer": 0
      }
    ]
  },
  "matches": [
    {
      "term": "Масса",
      "def": "Дененің инерттілігінің өлшемі"
    },
    {
      "term": "Жылдамдық",
      "def": "Уақыт бірлігіндегі орын ауыстыру"
    },
    {
      "term": "Қысым",
      "def": "Бетке түсетін күштің ауданға қатынасы"
    },
    {
      "term": "Кедергі",
      "def": "Өткізгіштің тоққа жасайтын бөгеті"
    },
    {
      "term": "Күш",
      "def": "Денелерөдің өзара әрекеттесу өлшемі"
    },
    {
      "term": "Температура",
      "def": "Дененің жылулық күйінің сипаттамасы"
    }
  ]
};

let quizSession = {
  questions: [],
  currentIndex: 0,
  score: 0,
  timer: null,
  timeLeft: 0,
  initialTime: 30,
  isMuted: false
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (quizSession.isMuted) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  if (type === 'correct') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
  } else {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
  }
}

function speak(text) {
  if (quizSession.isMuted) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('kk') || v.lang.includes('ru'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.volume = 1; utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
}

window.speakText = speak;

window.toggleQuizAudio = function() {
  quizSession.isMuted = !quizSession.isMuted;
  if (quizSession.isMuted) window.speechSynthesis.cancel();
  const btn = document.getElementById('quiz-audio-toggle');
  if (btn) {
    btn.innerHTML = `<i data-lucide="${quizSession.isMuted ? 'volume-x' : 'volume-2'}" size="22"></i>`;
    btn.style.color = quizSession.isMuted ? 'var(--text-tertiary)' : 'var(--accent-orange)';
    btn.style.background = quizSession.isMuted ? 'rgba(0,0,0,0.05)' : 'rgba(242, 109, 33, 0.1)';
    lucide.createIcons();
  }
};

function showAssignments() {
  const content = document.getElementById('teacher-content');
  const topicsHtml = Object.keys(physicsDb.questions).map(topic => `<option value="${topic}">${topic}</option>`).join('');
  content.innerHTML = `
    <button class="btn-secondary voice-target" onclick="renderTeacherDashboard()" style="margin-bottom: 2rem; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
      <i data-lucide="arrow-left" size="18"></i> Басты бетке қайту
    </button>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem;">
    <div class="grid gap-8" style="grid-template-columns: 350px 1fr; align-items: start;">
       <div class="glass-panel flex flex-col gap-6" style="padding: 2rem; border-radius: 20px;">
         <h3 class="label-caps" style="color: var(--accent-orange); font-size: var(--font-lg); display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="settings-2"></i> Параметрлерді реттеу</h3>
         <div class="flex flex-col gap-2">
            <label class="label-caps">Физика бөлімі:</label>
            <select id="topic-select" class="glass-panel" style="padding: 0.8rem; border-radius: 10px; border: 1px solid var(--border-glass); background: #fff; width: 100%; outline: none; font-size: var(--font-sm);">${topicsHtml}</select>
         </div>
         <div class="flex flex-col gap-2">
            <label class="label-caps">Тапсырма саны:</label>
            <select id="count-select" class="glass-panel" style="padding: 0.8rem; border-radius: 10px; border: 1px solid var(--border-glass); background: #fff; width: 100%; outline: none; font-size: var(--font-sm);"><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option></select>
         </div>
         <div class="flex flex-col gap-2">
            <label class="label-caps">Уақыт (с):</label>
            <select id="timer-select" class="glass-panel" style="padding: 0.8rem; border-radius: 10px; border: 1px solid var(--border-glass); background: #fff; width: 100%; outline: none; font-size: var(--font-sm);"><option value="30">30</option><option value="60">60</option><option value="90">90</option><option value="120">120</option></select>
         </div>
         <div class="flex flex-col gap-2">
            <label class="label-caps">Түрі:</label>
            <div style="display: flex; gap: 0.75rem;">
               <label class="task-mode-label text-sm"><input type="radio" name="taskMode" value="quiz" checked style="accent-color: var(--accent-orange);"> <span>Тест</span></label>
               <label class="task-mode-label text-sm"><input type="radio" name="taskMode" value="match" style="accent-color: var(--accent-orange);"> <span>Сәйкестендіру</span></label>
            </div>
         </div>
         <button class="btn-primary v-center h-center label-caps" onclick="generateTaskPreview()" style="margin-top: 1rem; padding: 1.2rem; font-size: var(--font-base); border-radius: 12px; gap: 0.5rem;"><i data-lucide="sparkles" size="18"></i> Генерациялау</button>
       </div>
       <div id="task-preview-area" class="glass-panel flex flex-col items-center justify-center text-center" style="min-height: 520px; border: 2px dashed var(--border-glass); background: rgba(255,255,255,0.2); border-radius: 24px;">
          <div style="color: var(--text-tertiary); margin-bottom: 1.5rem;"><i data-lucide="layout-template" size="64"></i></div>
          <h4 style="color: var(--text-secondary); max-width: 300px; line-height: 1.5;">Бөлім мен параметрлерді таңдап, тестті бастаңыз</h4>
       </div>
    </div>
  `;
  lucide.createIcons();
}

function generateTaskPreview() {
  const mode = document.querySelector('input[name="taskMode"]:checked').value;
  const topic = document.getElementById('topic-select').value;
  const count = parseInt(document.getElementById('count-select').value);
  const time = parseInt(document.getElementById('timer-select').value);
  if(mode === 'quiz') startQuizSession(topic, count, time);
  else renderMatchGame();
}

function startQuizSession(topic, count, time) {
  const allQuestions = physicsDb.questions[topic] || [];
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, count);
  if(shuffled.length === 0) { alert("Сұрақтар табылмады."); return; }
  quizSession = { questions: shuffled, currentIndex: 0, score: 0, timer: null, timeLeft: time, initialTime: time, isMuted: quizSession.isMuted };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const preview = document.getElementById('task-preview-area');
  const q = quizSession.questions[quizSession.currentIndex];
  if(!q) { renderQuizResults(); return; }
  if(quizSession.timer) clearInterval(quizSession.timer);
  quizSession.timeLeft = quizSession.initialTime;
  
  let options = q.options.map((opt, index) => ({ text: opt, isCorrect: index === q.answer }));
  options = options.sort(() => Math.random() - 0.5);

  preview.innerHTML = `
    <div class="flex flex-col w-full h-full animate-fade-in" style="padding: 2.5rem; text-align: left; background: #fff; border-radius: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.05); position: relative; border: 1px solid var(--border-glass); overflow: hidden;">
      <div class="v-center justify-between" style="margin-bottom: 1.5rem;">
        <div class="v-center gap-6">
          <div class="flex flex-col">
            <span class="label-caps">Сұрақ</span>
            <span style="font-weight: 800; color: var(--accent-orange); font-size: var(--font-lg);">${quizSession.currentIndex + 1} / ${quizSession.questions.length}</span>
          </div>
          <div style="width: 1px; height: 30px; background: var(--border-glass);"></div>
          <div class="flex flex-col">
            <span class="label-caps">Ұпай</span>
            <span style="font-size: var(--font-lg); color: var(--text-secondary); font-weight: 800;">${quizSession.score}</span>
          </div>
        </div>
        <div class="v-center gap-3">
          <div id="quiz-timer" class="flex-center" style="padding: 0.6rem 1rem; background: #f8fafc; border: 2px solid var(--border-glass); border-radius: 12px; font-weight: 900; font-size: var(--font-xl); min-width: 80px;">${quizSession.timeLeft}с</div>
          <button id="quiz-audio-toggle" class="btn-secondary flex-center" onclick="toggleQuizAudio()" style="width: 48px; height: 48px; padding: 0; border-radius: 12px;"><i data-lucide="${quizSession.isMuted ? 'volume-x' : 'volume-2'}" size="22"></i></button>
        </div>
      </div>
      
      <!-- Progress Line -->
      <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.03); border-radius: 50px; margin-bottom: 2.5rem; overflow: hidden;">
         <div style="height: 100%; width: ${(quizSession.currentIndex / quizSession.questions.length) * 100}%; background: var(--primary-gradient); transition: width 0.3s ease;"></div>
      </div>

      <h3 style="font-size: var(--font-2xl); font-weight: 800; line-height: 1.4; margin-bottom: 2.5rem; color: var(--text-primary); text-align: center;">${q.q}</h3>
      
      <div class="grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
        ${options.map((opt, i) => `
          <button class="quiz-btn v-center gap-4" onclick="handleQuizAnswer(this, ${opt.isCorrect})" onmouseenter="speak('${opt.text.replace(/'/g, "\\'")}')" style="padding: 1.2rem; border-radius: 16px; border: 2px solid var(--border-glass); background: #f8fafc; text-align: left; transition: all 0.2s; cursor: pointer;">
            <div class="quiz-badge">${String.fromCharCode(65+i)}</div>
            <span style="font-size: var(--font-base); font-weight: 600; color: var(--text-primary);">${opt.text}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
  lucide.createIcons();
  
  quizSession.timer = setInterval(() => {
    quizSession.timeLeft--;
    const timerDisplay = document.getElementById('quiz-timer');
    if(timerDisplay) {
        const tVal = Math.max(0, quizSession.timeLeft);
        timerDisplay.innerText = tVal + 'с';
        if(quizSession.timeLeft <= 10) timerDisplay.style.color = 'var(--accent-red)';
    }
    if(quizSession.timeLeft <= 0) {
      clearInterval(quizSession.timer); 
      playSound('wrong'); speakText('Уақыт бітті!');
      setTimeout(() => { quizSession.currentIndex++; renderQuizQuestion(); }, 1500);
    }
  }, 1000);
}

window.handleQuizAnswer = function(btn, isCorrect) {
  clearInterval(quizSession.timer);
  const btns = document.querySelectorAll('.quiz-btn');
  btns.forEach(b => b.disabled = true);
  
  if(isCorrect) { 
    btn.style.borderColor = '#4ADE80'; 
    btn.style.background = 'rgba(74, 222, 128, 0.05)';
    quizSession.score++; playSound('correct'); speakText('Дұрыс жауап!'); 
  } else { 
    btn.style.borderColor = '#F87171'; 
    btn.style.background = 'rgba(248, 113, 113, 0.05)';
    playSound('wrong'); speakText('Қате жауап.'); 
  }
  
  setTimeout(() => { quizSession.currentIndex++; renderQuizQuestion(); }, 1500);
};

function renderQuizResults() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const preview = document.getElementById('task-preview-area');
  const percent = Math.round((quizSession.score / quizSession.questions.length) * 100);
  
  preview.style.background = 'transparent'; preview.style.border = 'none';
  preview.innerHTML = `
    <div class="glass-card flex flex-col items-center justify-center gap-8 w-full animate-fade-in" style="padding: 4rem 2rem; border-radius: 30px; text-align: center;">
      <div class="flex-center" style="width: 140px; height: 140px; border-radius: 50%; background: #fff; border: 6px solid var(--accent-orange); box-shadow: 0 0 30px rgba(242, 109, 33, 0.2);">
        <span style="font-size: var(--font-4xl); font-weight: 900; color: var(--accent-orange);">${percent}%</span>
      </div>
      <div>
        <h3 style="font-size: var(--font-3xl); font-weight: 800; margin-bottom: 0.5rem;">Тест Аяқталды!</h3>
        <p style="color: var(--text-secondary); font-size: var(--font-lg);">Сіз ${quizSession.questions.length} сұрақтың ${quizSession.score}-ына дұрыс жауап бердіңіз.</p>
      </div>
      <div class="v-center gap-4">
        <button class="btn-primary v-center gap-2" onclick="showAssignments()" style="padding: 1rem 2rem; border-radius: 50px;"><i data-lucide="refresh-cw" size="18"></i> Қайталау</button>
        <button class="btn-secondary v-center gap-2" onclick="renderTeacherDashboard()" style="padding: 1rem 2rem; border-radius: 50px;"><i data-lucide="home" size="18"></i> Мәзір</button>
      </div>
    </div>
  `;
  lucide.createIcons();
  speakText(`Тест аяқталды. Сіздің нәтижеңіз ${percent} пайыз.`);
}

function renderMatchGame() {
  const preview = document.getElementById('task-preview-area');
  let leftSide = [...physicsDb.matches].sort(() => Math.random() - 0.5);
  let rightSide = [...physicsDb.matches].sort(() => Math.random() - 0.5);
  
  preview.style.background = 'transparent'; preview.style.border = 'none';
  preview.innerHTML = `
    <div class="glass-card w-full h-full animate-fade-in" style="padding: 2.5rem; text-align: left; border-radius: 24px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
        <h3 class="gradient-text" style="font-size: 1.6rem;">Сәйкестендіру Ойыны</h3>
        <button class="btn-secondary" onclick="speakText('Терминдерді тиісті анықтамалармен біріктіріңіз')" style="padding: 0.6rem 1.2rem; border-radius: 12px;"><i data-lucide="volume-2"></i></button>
      </div>
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; align-items: stretch;">
        <div id="match-left" class="flex flex-col gap-3">
          ${leftSide.map(m => `<button class="match-btn flex-center" data-term="${m.term}" onclick="handleMatchSelection(this, 'left')" style="padding: 1.2rem; border-radius: 12px; border: 2px solid var(--border-glass); background: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s; height: 100%; flex: 1; font-size: var(--font-base);">${m.term}</button>`).join('')}
        </div>
        <div id="match-right" class="flex flex-col gap-3">
          ${rightSide.map(m => `<button class="match-btn flex-center" data-term="${m.term}" onclick="handleMatchSelection(this, 'right')" style="padding: 1.2rem; border-radius: 12px; border: 2px solid var(--border-glass); background: #fff; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: var(--font-sm); line-height: 1.4; height: 100%; flex: 1;">${m.def}</button>`).join('')}
        </div>
      </div>
      <button class="btn-secondary mt-8" onclick="showAssignments()" style="width: 100%; border-radius: 12px;">Артқа</button>
    </div>
  `;
  lucide.createIcons();
}

window.handleMatchSelection = function(btn, side) {
  if(!window.matchState) window.matchState = { left: null, right: null };
  const parent = btn.parentElement;
  parent.querySelectorAll('.match-btn').forEach(b => { if(!b.disabled) b.style.borderColor = 'var(--border-glass)'; });
  
  window.matchState[side] = btn;
  btn.style.borderColor = 'var(--accent-orange)';
  
  if(window.matchState.left && window.matchState.right) {
      if(window.matchState.left.getAttribute('data-term') === window.matchState.right.getAttribute('data-term')) {
          playSound('correct');
          window.matchState.left.style.borderColor = '#4ADE80'; window.matchState.left.style.background = 'rgba(74, 222, 128, 0.05)';
          window.matchState.right.style.borderColor = '#4ADE80'; window.matchState.right.style.background = 'rgba(74, 222, 128, 0.05)';
          window.matchState.left.disabled = true; window.matchState.right.disabled = true;
      } else {
          playSound('wrong');
          const l = window.matchState.left, r = window.matchState.right;
          setTimeout(() => { 
            if(!l.disabled) l.style.borderColor = ''; 
            if(!r.disabled) r.style.borderColor = ''; 
          }, 400);
      }
      window.matchState.left = null; window.matchState.right = null;
  }
};



function filterMyClassGroup() {
  const filterVal = document.getElementById('my-class-filter').value;
  const searchVal = document.getElementById('student-search-input').value.toLowerCase();
  const grid = document.getElementById('students-grid');
  
  const teacherClassesRaw = state.teacherProfile.classes || '';
  const teacherClasses = teacherClassesRaw.split(',').map(c => c.trim());
  
  // 1. Filter by teacher's classes
  // 2. Filter by selected class dropdown
  // 3. Filter by search input
  // 4. Sort alphabetically
  let filtered = state.allStudents.filter(s => {
    const sGrade = s.grade.trim();
    const inTeacherClasses = teacherClasses.some(tc => tc.trim() === sGrade);
    const matchesFilter = filterVal === 'all' || sGrade === filterVal;
    const matchesSearch = s.name.toLowerCase().includes(searchVal);
    return inTeacherClasses && matchesFilter && matchesSearch;
  });

  filtered.sort((a, b) => a.name.localeCompare(b.name));

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-tertiary);">
        <i data-lucide="users" size="48" style="margin-bottom: 1rem; opacity: 0.2;"></i>
        <p>Оқушылар табылмады</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(s => {
    return `
      <div class="glass-panel voice-target" style="padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-glass); background: #fff; transition: transform 0.2s, box-shadow 0.2s; display: flex; align-items: center; gap: 1rem;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 1.2rem; flex-shrink: 0;">
          ${s.name.charAt(0)}
        </div>
        <div style="flex: 1; overflow: hidden;">
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</h3>
          <div class="flex items-center gap-2">
            <span style="font-size: 0.8rem; color: var(--text-secondary); background: rgba(0,0,0,0.05); padding: 2px 8px; border-radius: 4px;">${s.grade}</span>
            <span style="font-size: 0.8rem; color: var(--accent-orange); font-weight: 700;">${s.level} LVL</span>
          </div>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 800; font-size: 0.9rem; color: var(--text-primary);">${s.points}</p>
          <p style="font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase;">ұпай</p>
        </div>
      </div>
    `;
  }).join('');
  
  lucide.createIcons();
}
