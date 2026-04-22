/**
 * PhysicsAccess - Teacher Logic (Premium UI & 120 Questions)
 */

// Teacher AI Assistant Logic
let teacherChatMessages = [
  { role: 'ai', text: 'Сәлеметсіз бе! Мен сіздің AI көмекшіңізбін. Сабақ жоспарын құруға, есептер шығаруға немесе физикадан кез келген сұраққа жауап беруге дайынмын.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
];

window.showAIAssistant = function () {
  const content = document.getElementById('teacher-ai-view');
  if (!content) return;

  content.innerHTML = `
    <div class="flex flex-col animate-fade-in" style="height: 85vh; gap: 1.5rem; padding: 2rem 0;">
      <div class="flex justify-between items-center">
        <button class="btn-secondary voice-target" onclick="navigate('teacher')" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
          <i data-lucide="arrow-left" size="18"></i> Басты бетке қайту
        </button>
        <div class="flex items-center" style="gap: 0.75rem;">
          <button class="btn-primary v-center gap-2" onclick="window.clearTeacherAIChat()" style="padding: 0.6rem 1.2rem; border-radius: 12px;">
            <i data-lucide="refresh-cw" size="18"></i> Тазалау
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
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Сұрақ қою</p>
          </div>
        </div>

        <!-- Chat Messages -->
        <div id="teacher-chat-messages" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; background: rgba(255,255,255,0.1);">
          <!-- Messages -->
        </div>

        <div class="chat-input-wrapper" style="padding: 1.2rem; border-top: 1px solid var(--border-glass); background: #fff;">
          <div class="flex" style="gap: 0.75rem; align-items: center;">
            <input type="text" id="teacher-chat-input" placeholder="Сұрақ қойыңыз немесе тақырыпты жазыңыз..." 
                   class="glass-panel" style="flex: 1; padding: 0.8rem 1.2rem; border-radius: 15px; border: 1px solid var(--border-glass); outline: none; font-size: 1rem;"
                   onkeypress="if(event.key === 'Enter') window.sendTeacherAIMessage()">
            <button class="btn-primary chat-send-btn" onclick="window.sendTeacherAIMessage()" style="width: 48px; height: 48px; flex-shrink: 0; padding: 0; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <i data-lucide="send" size="20"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  window.renderTeacherChatMessages();
  if (window.lucide) lucide.createIcons();
}

window.clearTeacherAIChat = function () {
  teacherChatMessages = [
    { role: 'ai', text: 'Сәлеметсіз бе! Мен сіздің AI көмекшіңізбін. Сабақ жоспарын құруға, есептер шығаруға немесе физикадан кез келген сұраққа жауап беруге дайынмын.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ];
  window.renderTeacherChatMessages();
}

window.renderTeacherChatMessages = function () {
  const container = document.getElementById('teacher-chat-messages');
  if (!container) return;

  container.innerHTML = teacherChatMessages.map(msg => `
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

window.sendTeacherAIMessage = async function () {
  const input = document.getElementById('teacher-chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const userMsg = { role: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  teacherChatMessages.push(userMsg);

  input.value = '';
  window.renderTeacherChatMessages();
  if (window.playSound) window.playSound('correct');

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

  try {
    const result = await window.callAI(text);
    
    const typingElem = document.getElementById(typingId);
    if (typingElem) typingElem.remove();

    if (result.success) {
      const aiMsg = { role: 'ai', text: result.text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      teacherChatMessages.push(aiMsg);

      window.renderTeacherChatMessages();
      if (window.speakText) window.speakText("Жаңа хабарлама келді.");
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


let currentManagerTab = 'list'; // 'list' or 'results'
let currentStudentAuthData = []; // Full user data from Google Sheet

window.syncStudentsWithServer = async function () {
  const loading = document.getElementById('auth-loading');
  if (loading) loading.style.display = 'flex';

  try {
    const url = `${GOOGLE_SCRIPTS_AUTH_URL}?action=listUsers`;
    const response = await fetch(url);
    currentStudentAuthData = await response.json();

    // Only process users with 'student' role
    const serverStudents = currentStudentAuthData.filter(u => u.role === 'student');

    // Build new state from server data, preserving local points/level if they exist
    const syncedList = serverStudents.map(su => {
      const suName = String(su.name || '').trim();
      const suEmail = String(su.email || '').trim();

      const local = state.allStudents.find(s =>
        String(s.email || '').toLowerCase() === suEmail.toLowerCase()
      );

      if (local) {
        return {
          ...local,
          name: suName,
          email: suEmail,
          grade: su.grade || local.grade || 'Белгісіз'
        };
      } else {
        return {
          id: Date.now() + Math.random(),
          name: suName,
          email: suEmail,
          grade: su.grade || 'Белгісіз',
          points: 0,
          level: 1,
          school: state.teacherProfile.school || '№15 ІТ мектеп-лицейі'
        };
      }
    });

    state.allStudents = syncedList;
    saveState();

    // Refresh the UI if it's currently showing the class manager
    if (typeof filterClassManager === 'function') {
      filterClassManager();
    }
  } catch (error) {
    console.error('Sync Error:', error);
  } finally {
    if (loading) loading.style.display = 'none';
  }
};

window.showClassManager = function () {
  const content = document.getElementById('teacher-class-view');

  const teacherClassesRaw = state.teacherProfile.classes || '';
  const availableClasses = teacherClassesRaw.split(',').map(c => c.trim().replace(/["']/g, '')).filter(c => c);

  content.innerHTML = `
    <div class="animate-fade-in" style="padding: 2rem 0;">
    <button class="btn-secondary voice-target" onclick="navigate('teacher')" style="margin-bottom: 2rem; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
      <i data-lucide="arrow-left" size="18"></i> Басты бетке қайту
    </button>
    
    <div class="glass-card" style="padding: 1rem; min-height: 600px;">
      <div class="flex flex-col md-flex-row justify-between items-start md-items-center gap-4" style="margin-bottom: 2.5rem;">
        <div style="flex: 1;">
          <h2 class="voice-target gradient-text" style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.3rem;">Менің сыныбым</h2>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Оқушыларды бақылау</p>
        </div>
      </div>


      <!-- Tab Switcher -->
      <div class="flex flex-nowrap md:flex-wrap gap-2" style="margin-bottom: 2rem; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem; overflow-x: auto;">
        <button class="tab-btn ${currentManagerTab === 'list' ? 'active' : ''}" onclick="window.switchManagerTab('list')" 
                style="background: none; border: none; padding: 0.8rem 1rem; font-weight: 700; cursor: pointer; color: ${currentManagerTab === 'list' ? 'var(--accent-orange)' : 'var(--text-tertiary)'}; border-bottom: 2px solid ${currentManagerTab === 'list' ? 'var(--accent-orange)' : 'transparent'}; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; text-align: left; line-height: 1.2;">
          <i data-lucide="users" size="18" style="flex-shrink: 0;"></i> 
          <span>Оқушылар<br>тізімі</span>
        </button>
        <button class="tab-btn ${currentManagerTab === 'results' ? 'active' : ''}" onclick="window.switchManagerTab('results')" 
                style="background: none; border: none; padding: 0.8rem 1rem; font-weight: 700; cursor: pointer; color: ${currentManagerTab === 'results' ? 'var(--accent-orange)' : 'var(--text-tertiary)'}; border-bottom: 2px solid ${currentManagerTab === 'results' ? 'var(--accent-orange)' : 'transparent'}; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; text-align: left; line-height: 1.2;">
          <i data-lucide="bar-chart-2" size="18" style="flex-shrink: 0;"></i> 
          <span>Үлгерім<br>нәтижелері</span>
        </button>
      </div>

      
      <!-- List Controls (Search & Filter) -->
      <div class="flex flex-col lg-flex-row items-stretch lg-items-center gap-4" style="margin-bottom: 2rem;">
        <div class="v-center glass-panel" style="flex: 3; min-width: 200px; padding: 0.7rem 1.2rem; border-radius: 15px; border: 1px solid var(--border-glass); background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <i data-lucide="search" size="20" style="color: var(--text-tertiary); margin-right: 0.75rem;"></i>
          <input type="text" id="class-manager-search" placeholder="Оқушы есімімен іздеу..." 
                 style="border: none; outline: none; background: transparent; font-size: 1rem; width: 100%;" 
                 oninput="filterClassManager()">
        </div>
        
        <div class="flex items-center gap-3" style="flex: 2; min-width: 200px;">
          <label class="label-caps hide-mobile" style="margin: 0; white-space: nowrap;">сынып бойынша:</label>
          <select id="teacher-class-filter" class="glass-panel" 
                  style="width: 100%; padding: 0.7rem 1.2rem; border-radius: 12px; outline: none; border: 1px solid var(--border-glass); cursor: pointer; background: #fff; font-weight: 600;" 
                  onchange="filterClassManager()">
            <option value="all">Сыныптар</option>
            ${availableClasses.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>

        ${currentManagerTab === 'list' ? `
          <button class="btn-primary flex justify-center items-center gap-2" style="padding: 0.8rem 1.5rem; border-radius: 12px; cursor: pointer; white-space: nowrap; flex: 1.5; min-width: 180px;" onclick="showAddStudentModal()">
            <i data-lucide="user-plus" size="20"></i> <span>Оқушы қосу</span>
          </button>
        ` : ''}
      </div>



      <div style="overflow-x: auto;">
          <table class="student-table">
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
    <div id="add-student-modal" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 10000; align-items: center; justify-content: center;">
      <div class="glass-card animate-scale-in" style="width: 100%; max-width: 500px; padding: 3rem; background: #fff; border-radius: 28px;">
        <div class="flex justify-between items-center" style="margin-bottom: 2.5rem;">
          <h3 style="font-size: 1.8rem; font-weight: 800;">Жаңа оқушы қосу</h3>
          <button class="btn-secondary" onclick="window.closeAddStudentModal()" style="padding: 0.5rem; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"><i data-lucide="x"></i></button>
        </div>
        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <label class="label-caps" style="font-size: 0.75rem;">Оқушының аты-жөні:</label>
            <input type="text" id="new-student-name" placeholder="Мысалы: Дархан Саматұлы" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #f8fafc; font-size: 1rem;">
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="label-caps" style="font-size: 0.75rem;">Логин (Email):</label>
            <input type="email" id="new-student-email" placeholder="example@mail.com" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #f8fafc; font-size: 1rem;">
          </div>

          <div class="flex flex-col gap-2">
            <label class="label-caps" style="font-size: 0.75rem;">Құпия сөз:</label>
            <input type="text" id="new-student-password" placeholder="Пароль" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #f8fafc; font-size: 1rem;">
          </div>

          <button id="add-student-btn" class="btn-primary" onclick="window.addNewStudentToState()" style="margin-top: 1rem; padding: 1.2rem; border-radius: 15px; font-weight: 800; font-size: 1.1rem; box-shadow: 0 10px 20px rgba(242, 109, 33, 0.2);">Сақтау</button>
        </div>
      </div>
    </div>
  `;

  if (currentManagerTab === 'list') {
    window.syncStudentsWithServer().then(() => filterClassManager());
  } else {
    filterClassManager();
  }
  lucide.createIcons();
}

window.switchManagerTab = function (tab) {
  currentManagerTab = tab;
  showClassManager();
}

window.showAddStudentModal = function () {
  const modal = document.getElementById('add-student-modal');
  if (modal) {
    modal.style.display = 'flex';
    lucide.createIcons();
  }
}

window.closeAddStudentModal = function () {
  const modal = document.getElementById('add-student-modal');
  if (modal) modal.style.display = 'none';
}

window.addNewStudentToState = async function () {
  const name = document.getElementById('new-student-name').value.trim();
  const email = document.getElementById('new-student-email').value.trim();
  const password = document.getElementById('new-student-password').value.trim();

  if (!name || !email || !password) {
    alert("Барлық өрістерді толтырыңыз");
    return;
  }

  const btn = document.getElementById('add-student-btn');
  const originalText = btn.innerText;
  btn.innerText = "Сақталуда...";
  btn.disabled = true;

  try {
    const params = new URLSearchParams({
      action: 'register',
      name: name,
      email: email,
      password: password,
      role: 'student'
    });

    const response = await fetch(`${GOOGLE_SCRIPTS_AUTH_URL}?${params.toString()}`);
    const result = await response.json();

    if (result.success) {
      // Local addition
      const newStudent = {
        id: Date.now(),
        name: name,
        grade: 'Белгісіз', // Will be updated by teacher later or defaults
        points: 0,
        level: 1,
        school: state.teacherProfile.school || '№15 ІТ мектеп-лицейі'
      };
      state.allStudents.push(newStudent);
      saveState();

      alert('Оқушы сәтті тіркелді!');
      closeAddStudentModal();
      window.showClassManager(); // Refresh list via sync
    } else {
      alert(result.message || "Тіркеу кезінде қате орын алды");
    }
  } catch (error) {
    console.error('Add Student Error:', error);
    alert("Сервермен байланыс қатесі");
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

window.deleteStudentFromState = function (id) {
  if (!confirm("Оқушыны тізімнен өшіруді мақұлдайсыз ба?")) return;
  state.allStudents = state.allStudents.filter(s => s.id !== id);
  saveState();
  filterClassManager();
}

window.filterClassManager = function () {
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
        <th class="col-student">Оқушы</th>
        <th class="col-grade">Сынып</th>
        <th class="col-school">Мектеп</th>
        <th class="col-action">Әрекет</th>
      </tr>
    `;

    let filteredStudents = state.allStudents.filter(s => {
      const sGrade = (s.grade || '').trim().toLowerCase().replace(/["']/g, '').replace(/[aа]/g, 'а').replace(/[eе]/g, 'е').replace(/[oо]/g, 'о').replace(/[kк]/g, 'к');
      const matchesSearch = String(s.name || '').toLowerCase().includes(searchVal);

      const isInTeacherClass = teacherClasses.some(tc => {
        const cleanTc = tc.trim().toLowerCase().replace(/["']/g, '').replace(/[aа]/g, 'а').replace(/[eе]/g, 'е').replace(/[oо]/g, 'о').replace(/[kк]/g, 'к');
        return cleanTc === sGrade;
      });

      if (filterVal !== 'all' && !isInTeacherClass) return false;
      if (filterVal !== 'all' && sGrade !== filterVal.toLowerCase().replace(/["']/g, '').replace(/[aа]/g, 'а').replace(/[eе]/g, 'е').replace(/[oо]/g, 'о').replace(/[kк]/g, 'к')) return false;
      if (searchVal && !matchesSearch) return false;
      return true;
    }).sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

    if (filteredStudents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-tertiary);">Оқушылар табылмады</td></tr>`;
    } else {
      tbody.innerHTML = filteredStudents.map(s => {
        const authInfo = currentStudentAuthData.find(u => String(u.email || '').toLowerCase() === String(s.email || '').toLowerCase());
        return `
          <tr class="student-row animate-hover" onclick="window.showStudentDetail('${s.email}')" style="background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); border-radius: 16px; transition: all 0.2s ease; cursor: pointer;">
            <td class="col-student" style="border-radius: 16px 0 0 16px;">
              <div class="flex items-center gap-3">
                <div style="width: 35px; height: 35px; border-radius: 50%; background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;">${s.name.charAt(0)}</div>
                <div class="flex flex-col">
                  <span style="font-weight: 700;">${s.name}</span>
                  ${authInfo ? `<span style="font-size: 0.7rem; color: var(--text-tertiary);">${authInfo.email}</span>` : ''}
                </div>
              </div>
            </td>
            <td class="col-grade">${s.grade}</td>
            <td class="col-school" style="font-size: 0.85rem; color: var(--text-secondary);">${s.school}</td>
            <td class="col-action" style="border-radius: 0 16px 16px 0;">
              <button class="btn-secondary" style="padding: 0.5rem; border-radius: 10px; color: #ef4444; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;" onclick="event.stopPropagation(); deleteStudentFromState(${s.id})"><i data-lucide="trash-2" size="18"></i></button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  lucide.createIcons();
}

window.showStudentDetail = function (email) {
  const student = state.allStudents.find(s => String(s.email).toLowerCase() === String(email).toLowerCase());
  const auth = currentStudentAuthData.find(u => String(u.email).toLowerCase() === String(email).toLowerCase());

  const name = student ? student.name : (auth ? auth.name : 'Белгісіз');

  const modalId = 'student-detail-modal';
  let modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-backdrop';
    modal.style.cssText = 'display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); z-index: 10000; align-items: center; justify-content: center;';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="glass-card animate-scale-in" style="width: 100%; max-width: 450px; padding: 2.5rem; background: #fff; border-radius: 24px;">
      <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.5rem; font-weight: 800;">Оқушы мәліметі</h3>
        <button class="btn-secondary" onclick="document.getElementById('${modalId}').style.display = 'none'" style="padding: 0.5rem; border-radius: 50%;"><i data-lucide="x"></i></button>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex-center flex-col gap-2" style="margin-bottom: 1rem;">
          <div style="width: 70px; height: 70px; border-radius: 50%; background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800;">${name.charAt(0)}</div>
          <h4 style="font-size: 1.2rem;">${name}</h4>
          <p style="color: var(--text-tertiary); font-size: 0.85rem;">${student ? student.grade : ''} | ${student ? student.school : ''}</p>
        </div>

        <div class="glass-panel" style="padding: 1.5rem; border: 1px solid var(--border-glass); background: rgba(0,0,0,0.02); border-radius: 16px;">
          <h5 class="label-caps" style="margin-bottom: 1rem; color: var(--accent-orange);">Кіру мәліметтері</h5>
          
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label style="font-size: 0.75rem; font-weight: 700; opacity: 0.7;">Логин (Email)</label>
              <input type="email" id="edit-student-email" value="${auth ? auth.email : ''}" class="glass-panel" style="padding: 0.8rem; border-radius: 10px; border: 1px solid var(--border-glass); font-size: 0.9rem;">
            </div>
            <div class="flex flex-col gap-1">
              <label style="font-size: 0.75rem; font-weight: 700; opacity: 0.7;">Пароль</label>
              <input type="text" id="edit-student-password" value="${auth ? auth.password : ''}" class="glass-panel" style="padding: 0.8rem; border-radius: 10px; border: 1px solid var(--border-glass); font-size: 0.9rem;">
            </div>
          </div>
        </div>

        <input type="hidden" id="edit-student-old-email" value="${auth ? auth.email : ''}">
        
        <button class="btn-primary" onclick="window.updateStudentRemote()" style="margin-top: 1rem; padding: 1rem; border-radius: 12px; font-weight: 700; font-size: 1rem;">Өзгерістерді сақтау</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  lucide.createIcons();
}

window.updateStudentRemote = async function () {
  const oldEmailInput = document.getElementById('edit-student-old-email');
  const oldEmail = oldEmailInput ? oldEmailInput.value : '';
  const newEmail = document.getElementById('edit-student-email').value.trim();
  const newPassword = document.getElementById('edit-student-password').value.trim();

  if (!newEmail || !newPassword) return alert("Логин мен парольді толтырыңыз");

  const saveBtn = event.target;
  const originalText = saveBtn.innerText;
  saveBtn.innerText = "Сақталуда...";
  saveBtn.disabled = true;

  try {
    const params = new URLSearchParams({
      action: 'updateUser',
      oldEmail: oldEmail,
      newEmail: newEmail,
      newPassword: newPassword
    });

    const response = await fetch(`${GOOGLE_SCRIPTS_AUTH_URL}?${params.toString()}`);
    const result = await response.json();

    if (result.success) {
      document.getElementById('student-detail-modal').style.display = 'none';
      window.showClassManager(); // Refresh list
    } else {
      alert(result.message || "Қате орын алды");
    }
  } catch (error) {
    console.error('Update Error:', error);
    alert("Сервермен байланыс қатесі");
  } finally {
    saveBtn.innerText = originalText;
    saveBtn.disabled = false;
  }
}



// Assignment session context to handle navigation back to student or teacher dashboards
let assignmentContext = {
  containerId: 'teacher-content',
  backView: 'teacher'
};

const physicsDb = {
  "questions": {
    "Механика": [
      { "q": "Күштің өлшем бірлігі қандай?", "options": ["Ньютон (Н)", "Паскаль (Па)", "Джоуль (Дж)", "Ватт (Вт)"], "answer": 0 },
      { "q": "Энергияның физикалық мағынасы қандай?", "options": ["Дененің жұмыс істеу қабілеті", "Қозғалыс жылдамдығы", "Дененің массасы", "Кедергі күші"], "answer": 0 },
      { "q": "Архимед заңы қандай параметрлерге байланысты?", "options": ["Сұйықтың тығыздығы мен батқан бөліктің көлеміне", "Сұйықтың массасына", "Дененің пішініне", "Ауа қысымына"], "answer": 0 },
      { "q": "Үдеудің өлшем бірлігі?", "options": ["м/с²", "м/с", "м", "кг"], "answer": 0 },
      { "q": "Ньютонның екінші заңы?", "options": ["F = ma", "F = m/a", "a = F*m", "P = mv"], "answer": 0 },
      { "q": "Жұмыс формуласы?", "options": ["A = Fs", "A = P/t", "A = mgh", "A = v/t"], "answer": 0 },
      { "q": "Кинетикалық энергия формуласы?", "options": ["Ek = mv²/2", "Ep = mgh", "Ek = ma", "Ek = mv"], "answer": 0 },
      { "q": "Қысым формуласы?", "options": ["P = F/S", "P = S/F", "P = m/V", "P = v*t"], "answer": 0 },
      { "q": "Еркін түсу үдеуі шамамен қаншаға тең (g)?", "options": ["9.8 м/с²", "10 м/с²", "8.9 м/с²", "11 м/с²"], "answer": 0 },
      { "q": "Импульс формуласы?", "options": ["p = mv", "p = m/v", "p = Ft", "p = ma"], "answer": 0 },
      { "q": "Гук заңы қандай параметрлерді байланыстырады?", "options": ["Күш пен созылу", "Күш пен жылдамдық", "Жұмыс пен уақыт", "Энергия мен масса"], "answer": 0 },
      { "q": "Қуаттың өлшем бірлігі қандай?", "options": ["Ватт (Вт)", "Джоуль (Дж)", "Ньютон (Н)", "Вольт (В)"], "answer": 0 },
      { "q": "Иіндік ережесі (Моменттер ережесі)?", "options": ["F1*d1 = F2*d2", "F1/d1 = F2/d2", "F1*F2 = d1*d2", "F = ma"], "answer": 0 },
      { "q": "Потенциалдық энергия формуласы?", "options": ["Ep = mgh", "Ek = mv²/2", "E = mc²", "A = Fs"], "answer": 0 },
      { "q": "Механикалық қозғалыстың негізгі сипаттамасы?", "options": ["Координатаның уақытқа қарай өзгеруі", "Дененің массасы", "Термиялық күйі", "Заттың құрамы"], "answer": 0 },
      { "q": "Үйкеліс күші неге тәуелді?", "options": ["Үйкеліс коэффиценті мен нормаль қысым күшіне", "Дененің жылдамдығына", "Бетінің ауданына", "Ауа қысымына"], "answer": 0 },
      { "q": "Бірқалыпты қозғалыс кезіндегі жылдамдық формуласы?", "options": ["v = s/t", "v = gt", "v = at", "v = s*t"], "answer": 0 },
      { "q": "Бірқалыпты үдемелі қозғалыс кезіндегі жол формуласы (v0=0)?", "options": ["s = at²/2", "s = vt", "s = v²/2a", "s = v0*t"], "answer": 0 },
      { "q": "Центрге тартқыш үдеу формуласы?", "options": ["a = v²/R", "a = v*R", "a = ω²R", "a = G*M/R²"], "answer": 0 },
      { "q": "Бүкіләлемдік тартылыс заңы?", "options": ["F = G*m1*m2/r²", "F = ma", "F = kx", "F = BIl"], "answer": 0 },
      { "q": "Бірінші ғарыштық жылдамдық шамасы?", "options": ["7.9 км/с", "11.2 км/с", "16.7 км/с", "8.0 м/с"], "answer": 0 },
      { "q": "Гидравликалық престің жұмыс принципі неге негізделген?", "options": ["Паскаль заңына", "Архимед заңына", "Ньютон заңына", "Бойль-Мариотт заңына"], "answer": 0 },
      { "q": "Дененің инерттілік өлшемі?", "options": ["Масса", "Күш", "Жылдамдық", "Көлем"], "answer": 0 },
      { "q": "Тербеліс периоды дегеніміз не?", "options": ["Бір толық тербеліске кеткен уақыт", "Уақыт бірлігіндегі тербелістер саны", "Ең үлкен ауытқу", "Орташа жылдамдық"], "answer": 0 },
      { "q": "Тербеліс жиілігінің өлшем бірлігі?", "options": ["Герц (Гц)", "Секунд (с)", "Метр (м)", "Радиан"], "answer": 0 },
      { "q": "Математикалық маятниктің периоды неге тәуелді?", "options": ["Жіптің ұзындығы мен еркін түсу үдеуіне", "Маятниктің массасына", "Тербеліс амплитудасына", "Ауа температурасына"], "answer": 0 },
      { "q": "Серіппелі маятниктің периоды неге тәуелді?", "options": ["Масса мен серіппе қатаңдығына", "Жіп ұзындығына", "Гравитацияға", "Дененің пішініне"], "answer": 0 },
      { "q": "Толқын ұзындығы мен жылдамдық арасындағы байланыс?", "options": ["v = λ * ν", "v = λ / ν", "λ = v * T", "v = s / t"], "answer": 0 },
      { "q": "Дыбыстың ауадағы орташа жылдамдығы?", "options": ["340 м/с", "300,000 км/с", "1500 м/с", "100 м/с"], "answer": 0 },
      { "q": "Күш моментінің өлшем бірлігі?", "options": ["Ньютон*метр (Н*м)", "Джоуль (Дж)", "Ватт (Вт)", "Паскаль (Па)"], "answer": 0 }
    ],
    "Термодинамика": [
      { "q": "Температураның абсолют нөлі?", "options": ["-273.15 °C", "0 °C", "-100 °C", "-373.15 °C"], "answer": 0 },
      { "q": "Термодинамиканың бірінші заңы?", "options": ["Q = ΔU + A", "Q = ΔU - A", "U = Q + A", "ΔU = Q / A"], "answer": 0 },
      { "q": "Заттың үш күйі?", "options": ["Қатты, сұйық, газ", "Су, мұз, бу", "От, су, жер", "Металл, бейметалл"], "answer": 0 },
      { "q": "Қайнау температурасы (қалыпты жағдайда)?", "options": ["100 °C", "0 °C", "50 °C", "373 K"], "answer": 0 },
      { "q": "Газ заңдары (Изобаралық)?", "options": ["V/T = const", "P/T = const", "PV = const", "P/V = const"], "answer": 0 },
      { "q": "Менделеев-Клапейрон теңдеуі?", "options": ["PV = nRT", "PV = T", "P/T = R", "V = nRT"], "answer": 0 },
      { "q": "Ішкі энергия неге байланысты (идеал газ үшін)?", "options": ["Температураға", "Көлемге", "Қысымға", "Массаға"], "answer": 0 },
      { "q": "Жылулық сыйымдылық бірлігі?", "options": ["Дж/(кг·К)", "Дж", "Вт", "Кельвин"], "answer": 0 },
      { "q": "Жылулық қозғалтқыштың ПӘК-і?", "options": ["η = (Q1-Q2)/Q1", "η = Q1/Q2", "η = Q2/Q1", "η = (Q1+Q2)/Q1"], "answer": 0 },
      { "q": "Изотермиялық процесс кезінде не тұрақты?", "options": ["Температура (T)", "Қысым (P)", "Көлем (V)", "Жылу (Q)"], "answer": 0 },
      { "q": "Изохоралық процесс кезінде не тұрақты?", "options": ["Көлем (V)", "Температура (T)", "Қысым (P)", "Энтропия"], "answer": 0 },
      { "q": "Адиабаталық процесс дегеніміз не?", "options": ["Сыртқы ортамен жылу алмасусыз өтетін процесс", "Температура тұрақты болатын процесс", "Қысым тұрақты болатын процесс", "Көлем тұрақты болатын процесс"], "answer": 0 },
      { "q": "Диффузия құбылысы нені дәлелдейді?", "options": ["Молекулалардың үздіксіз қозғалысын", "Молекулалар өлшемін", "Молекулалар арасындағы тартылысты", "Заттың химиялық құрамын"], "answer": 0 },
      { "q": "Идеал газдың негізгі теңдеуі (Клаузиус теңдеуі)?", "options": ["P = 1/3 n m v²", "P = nRT", "P = F/S", "P = mgh"], "answer": 0 },
      { "q": "Броундық қозғалыс дегеніміз не?", "options": ["Микроскопиялық бөлшектердің ретсіз қозғалысы", "Газдардың диффузиясы", "Сұйықтардың қайнауы", "Планеталардың қозғалысы"], "answer": 0 },
      { "q": "Зат мөлшерінің өлшем бірлігі?", "options": ["Моль", "Киллограмм", "Грамм", "Литр"], "answer": 0 },
      { "q": "Авогадро тұрақтысының шамасы?", "options": ["6.02 * 10²³ моль⁻¹", "1.38 * 10⁻²³ Дж/К", "8.31 Дж/(моль*К)", "1.6 * 10⁻¹⁹ Кл"], "answer": 0 },
      { "q": "Больцман тұрақтысы (k)?", "options": ["1.38 * 10⁻²³ Дж/К", "8.31 Дж/(моль*К)", "6.62 * 10⁻³⁴ Дж*с", "9.1 * 10⁻³¹ кг"], "answer": 0 },
      { "q": "Газдың орташа квадраттық жылдамдығы формуласы?", "options": ["v = √(3kT/m)", "v = 3RT/M", "v = √(kT/m)", "v = at"], "answer": 0 },
      { "q": "Қаныққан бу дегеніміз не?", "options": ["Өз сұйығымен динамикалық тепе-теңдіктегі бу", "Ыстық бу", "Құрғақ бу", "Қысымы жоғары бу"], "answer": 0 },
      { "q": "Психрометр не үшін қолданылады?", "options": ["Ауаның ылғалдылығын өлшеу үшін", "Қысымды өлшеу үшін", "Температураны өлшеу үшін", "Жылдамдықты өлшеу үшін"], "answer": 0 },
      { "q": "Кризистік температура дегеніміз не?", "options": ["Газ сұйыққа айналмайтын шектік температура", "Қайнау температурасы", "Мұздау температурасы", "0 Кельвин"], "answer": 1 },
      { "q": "Балқу кезінде жұтылатын жылу мөлшері?", "options": ["Q = λ * m", "Q = c * m * ΔT", "Q = L * m", "Q = q * m"], "answer": 0 },
      { "q": "Булану кезінде жұтылатын жылу мөлшері?", "options": ["Q = L * m", "Q = λ * m", "Q = c * m * ΔT", "Q = U + A"], "answer": 0 },
      { "q": "Отын жанғанда бөлінетін жылу мөлшері?", "options": ["Q = q * m", "Q = L * m", "Q = c * m * ΔT", "Q = λ * m"], "answer": 0 },
      { "q": "Термодинамиканың екінші заңының мағынасы?", "options": ["Жылу өздігінен суық денеден ыстық денеге берілмейді", "Энергия жоғалмайды", "Жылу әрқашан тұрақты", "ПӘК 100% болуы мүмкін"], "answer": 0 },
      { "q": "Карно циклі қандай процестерден тұрады?", "options": ["Екі изотерма және екі адиабата", "Екі изохора және екі изобара", "Төрт изотерма", "Бір изохора және бір изобара"], "answer": 0 },
      { "q": "Энтропия дегеніміз не?", "options": ["Жүйенің ретсіздік өлшемі", "Жалпы энергия", "Жұмыс мөлшері", "Температура градиенті"], "answer": 0 },
      { "q": "Еркін дәрежелер саны (бір атомды газ үшін)?", "options": ["i = 3", "i = 5", "i = 6", "i = 1"], "answer": 0 },
      { "q": "Универсал газ тұрақтысы (R)?", "options": ["8.31 Дж/(моль*К)", "1.38 * 10⁻²³ Дж/К", "0.082", "9.8"], "answer": 0 }
    ],
    "Электр және магнетизм": [
      { "q": "Кернеудің өлшем бірлігі?", "options": ["Вольт (В)", "Ампер (А)", "Ом", "Ватт (Вт)"], "answer": 0 },
      { "q": "Ток күшіның формуласы?", "options": ["I = U/R", "U = I/R", "R = U*I", "I = q*t"], "answer": 0 },
      { "q": "Қарсыласудың өлшем бірлігі?", "options": ["Ом", "Фарадей", "Генри", "Тесла"], "answer": 0 },
      { "q": "Ом заңы?", "options": ["I = U/R", "U = IR", "R = U/I", "P = UI"], "answer": 0 },
      { "q": "Кулон заңы?", "options": ["F = k*q1*q2/r²", "F = ma", "F = mg", "F = BIl"], "answer": 0 },
      { "q": "Электр сыйымдылығының өлшем бірлігі?", "options": ["Фарадей (Ф)", "Кулон (Кл)", "Ом", "Вольт"], "answer": 0 },
      { "q": "Конденсатор энергиясының формуласы?", "options": ["W = CU²/2", "W = qU", "W = I²Rt", "W = P*t"], "answer": 0 },
      { "q": "Джоуль-Ленц заңы?", "options": ["Q = I²Rt", "Q = UIt", "Q = U²/R * t", "Барлық жауап дұрыс"], "answer": 3 },
      { "q": "Магнит индукциясының өлшем бірлігі?", "options": ["Тесла (Тл)", "Вебер (Вб)", "Генри (Гн)", "Гаусс"], "answer": 0 },
      { "q": "Лоренц күші дегеніміз не?", "options": ["Магнит өрісінде қозғалатын зарядқа әсер ететін күш", "Тогы бар өткізгішке әсер ететін күш", "Екі заряд арасындағы күш", "Гравитациялық күш"], "answer": 0 },
      { "q": "Ампер күшінің формуласы?", "options": ["F = BIl * sin(α)", "F = qvB * sin(α)", "F = k*q1*q2/r²", "F = ma"], "answer": 0 },
      { "q": "Электромагниттік индукция заңы (Фарадей)?", "options": ["ε = -ΔΦ/Δt", "ε = IR", "Φ = BS * cos(α)", "ε = Bvl"], "answer": 0 },
      { "q": "Магнит ағынының өлшем бірлігі?", "options": ["Вебер (Вб)", "Тесла (Тл)", "Генри (Гн)", "Люкс"], "answer": 0 },
      { "q": "Өздік индукция ЭҚК-і формуласы?", "options": ["ε = -L * ΔI/Δt", "ε = -ΔΦ/Δt", "ε = IR", "ε = Bvl"], "answer": 0 },
      { "q": "Индуктивтіліктің өлшем бірлігі?", "options": ["Генри (Гн)", "Фарадей", "Вебер", "Ом"], "answer": 0 },
      { "q": "Трансформатордың жұмыс принципі неге негізделген?", "options": ["Электромагниттік индукцияға", "Өздік индукцияға", "Фотоэффектке", "Ом заңына"], "answer": 0 },
      { "q": "Айнмалы ток жиілігі Қазақстанда (тұрмыстық)?", "options": ["50 Гц", "60 Гц", "220 Гц", "100 Гц"], "answer": 0 },
      { "q": "Электр тогының қуаты формуласы?", "options": ["P = UI", "P = I²R", "P = U²/R", "Барлық жауап дұрыс"], "answer": 3 },
      { "q": "Сол қол ережесі не үшін қолданылады?", "options": ["Ампер және Лоренц күштерінің бағытын анықтау үшін", "Магнит өрісінің бағытын анықтау үшін", "Ток бағытын анықтау үшін", "Күш моментін анықтау үшін"], "answer": 0 },
      { "q": "Оң қол ережесі (бұрғы ережесі)?", "options": ["Магнит индукция сызықтарының бағытын анықтау үшін", "Күш бағытын анықтау үшін", "Үдеу бағытын анықтау үшін", "Жарық бағытын анықтау үшін"], "answer": 0 },
      { "q": "Диэлектрлік өтімділік нені көрсетеді?", "options": ["Өрістің диэлектрикте неше есе азаятынын", "Ток күшін", "Кедергіні", "Энергияны"], "answer": 0 },
      { "q": "Электр өрісінің кернеулігі бірлігі?", "options": ["В/м немесе Н/Кл", "Кл/м", "Вольт", "Ньютон"], "answer": 0 },
      { "q": "Кирхгофтың бірінші заңы?", "options": ["Түйіндегі токтардың қосындысы нөлге тең", "ЭҚК қосындысы кернеуге тең", "Кедергілер қосындысы тұрақты", "Ток кернеуге тура пропорционал"], "answer": 0 },
      { "q": "Жартылай өткізгіштердегі негізгі заряд тасушылар (n-тип)?", "options": ["Электрондар", "Кемтіктер", "Иондар", "Протондар"], "answer": 0 },
      { "q": "Жартылай өткізгіштердегі негізгі заряд тасушылар (p-тип)?", "options": ["Кемтіктер", "Электрондар", "Позитрондар", "Нейтрондар"], "answer": 0 },
      { "q": "Электролиз заңының авторы?", "options": ["Фарадей", "Ом", "Вольта", "Ампер"], "answer": 0 },
      { "q": "Рентген сәулелерінің табиғаты?", "options": ["Электромагниттік толқын", "Электрондық ағын", "Дыбыстық толқын", "Магниттік өріс"], "answer": 0 },
      { "q": "Тербелмелі контурдың периоды (Томсон формуласы)?", "options": ["T = 2π√(LC)", "T = 2π√(L/C)", "T = 2π/ω", "T = LC"], "answer": 0 },
      { "q": "Электр тогының өткізгіштердегі әсерлері?", "options": ["Жылулық, химиялық, магниттік", "Тек жылулық", "Тек магниттік", "Механикалық"], "answer": 0 },
      { "q": "Электрон заряды қаншаға тең?", "options": ["-1.6 * 10⁻¹⁹ Кл", "1.6 * 10⁻²⁷ Кл", "9.1 * 10⁻³¹ Кл", "1.0 Кл"], "answer": 0 }
    ],
    "Оптика": [
      { "q": "Жарық жылдамдығы вакуумде қаншаға тең?", "options": ["300 000 км/с", "150 000 км/с", "300 м/с", "1000 км/с"], "answer": 0 },
      { "q": "Шағылысу заңы?", "options": ["Түсу бұрышы шағылысу бұрышына тең", "Сыну бұрышы үлкен", "Түсу бұрышы 90 градус", "Сәулелер тоғысады"], "answer": 0 },
      { "q": "Жарықтың сыну көрсеткіші?", "options": ["n = c/v", "n = v/c", "n = sin(r)/sin(i)", "n = d/f"], "answer": 0 },
      { "q": "Линзаның оптикалық күші?", "options": ["Диоптрия (дптр)", "Метр (м)", "Ватт (Вт)", "Люкс (лк)"], "answer": 0 },
      { "q": "Жарықтың дисперсиясы дегеніміз не?", "options": ["Жарықтың спектрге жіктелуі", "Жарықтың шағылысуы", "Жарықтың түзу сызықты қозғалысы", "Көлеңке түсуі"], "answer": 0 },
      { "q": "Интерференция дегеніміз не?", "options": ["Толқындардың қабаттасып, бірін-бірі күшейтуі немесе әлсіретуі", "Жарықтың сынуы", "Жарықтың тосқауылды айналып өтуі", "Сәуленің таралуы"], "answer": 0 },
      { "q": "Дифракция дегеніміз не?", "options": ["Жарықтың тосқауылды айналып өтуі", "Толқындардың қабаттасуы", "Түстердің қосылуы", "Кескіннің жоғалуы"], "answer": 0 },
      { "q": "Жұқа линза формуласы?", "options": ["1/F = 1/d + 1/f", "F = d + f", "D = F / 1", "f = d / F"], "answer": 0 },
      { "q": "Жинағыш линзаның бас фокусы арқылы өткен сәуле қалай таралады?", "options": ["Бас оптикалық оське параллель", "Өз бағытымен", "Линза ортасына қарай", "Кері қарай"], "answer": 0 },
      { "q": "Жарықтың толқындық табиғаты қандай құбылыспен дәлелденеді?", "options": ["Интерференция және дифракция", "Шағылысу", "Фотоэффект", "Сыну"], "answer": 0 },
      { "q": "Көрнекі жарық спектрінің шекаралары?", "options": ["380 - 760 нм", "100 - 400 нм", "800 - 1500 нм", "10 - 100 м"], "answer": 0 },
      { "q": "Фотометрияның негізгі өлшем бірлігі (жарық күші)?", "options": ["Кандела (кд)", "Люмен", "Люкс", "Ватт"], "answer": 0 },
      { "q": "Жарқырау бірлігі (освещенность)?", "options": ["Люкс (лк)", "Кандела", "Ватт", "Джоуль"], "answer": 0 },
      { "q": "Толық ішкі шағылу құбылысы қайда қолданылады?", "options": ["Талшықты оптикада", "Көзілдірікте", "Айна жасуда", "Лампаларда"], "answer": 0 },
      { "q": "Мираж құбылысы неге байланысты?", "options": ["Жарықтың рефракциясына (сынуына)", "Дифракцияға", "Дисперсияға", "Жұтылуға"], "answer": 0 },
      { "q": "Фотоаппарат кескіні қандай болады?", "options": ["Кішірейтілген, төңкерілген, шын", "Үлкейтілген, тура, жорамал", "Кішірейтілген, тура, шын", "Өз өлшемімен"], "answer": 0 },
      { "q": "Адам көзінің кескіні қайда түседі?", "options": ["Торламаға (сетчатка)", "Қарашыққа", "Хрусталикке", "Қасаң қабыққа"], "answer": 0 },
      { "q": "Жақыннан көргіштік қалай түзетіледі?", "options": ["Шашыратқыш (теріс) линзамен", "Жинағыш (оң) линзамен", "Тек отамен", "Призмамен"], "answer": 0 },
      { "q": "Алыстан көргіштік қалай түзетіледі?", "options": ["Жинағыш (оң) линзамен", "Шашыратқыш (теріс) линзамен", "Көзілдіріксіз", "Қараңғы бөлмеде"], "answer": 0 },
      { "q": "Жарықтың қысымын алғаш өлшеген ғалым?", "options": ["П.Н. Лебедев", "И. Ньютон", "Х. Гюйгенс", "М. Планк"], "answer": 0 },
      { "q": "Жарықтың электромагниттік теориясын кім жасады?", "options": ["Дж. Максвелл", "М. Фарадей", "Г. Герц", "А. Эйнштейн"], "answer": 0 },
      { "q": "Поляризация нені дәлелдейді?", "options": ["Жарықтың көлденең толқын екенін", "Жарықтың жылдамдығын", "Түстердің бар екенін", "Бөлшектер ағынын"], "answer": 0 },
      { "q": "Кемпірқосақ қандай құбылыс нәтижесі?", "options": ["Дисперсия және шағылысу", "Дифракция", "Жұтылу", "Поляризация"], "answer": 0 },
      { "q": "Гаусс оптикасында 'd' нені білдіреді?", "options": ["Нәрседен линзаға дейінгі қашықтық", "Линзадан кескінге дейінгі қашықтық", "Фокус аралығы", "Линза диаметрі"], "answer": 0 },
      { "q": "Көздің бейімделу (аккомодация) қабілеті деген не?", "options": ["Түрлі қашықтықтағы заттарды анық көру үшін хрусталик қисықтығының өзгеруі", "Көздің түсі", "Жарыққа төзімділік", "Қозғалысты сезу"], "answer": 0 },
      { "q": "Абсолют сыну көрсеткіші су үшін?", "options": ["1.33", "1.00", "1.50", "2.42"], "answer": 0 },
      { "q": "Призма арқылы өткенде ең көп ауытқитын түс?", "options": ["Күлгін (фиолетовый)", "Қызыл", "Жасыл", "Сары"], "answer": 0 },
      { "q": "Призма арқылы өткенде ең аз ауытқитын түс?", "options": ["Қызыл", "Күлгін", "Көк", "Қызғылт сары"], "answer": 0 },
      { "q": "Инфрақызыл сәулелердің негізгі әсері?", "options": ["Жылулық", "Химиялық", "Фотоэффект", "Биологиялық"], "answer": 0 },
      { "q": "Ультракүлгін сәулелердің әсері?", "options": ["Химиялық және бактерицидтік", "Тек жылулық", "Тек жарықтық", "Көрінбейді"], "answer": 0 }
    ],
    "Кванттық физика": [
      { "q": "Жарық кванты қалай аталады?", "options": ["Фотон", "Электрон", "Протон", "Нейтрон"], "answer": 0 },
      { "q": "Фотоэффект заңын кім ашты?", "options": ["Альберт Эйнштейн", "Нильс Бор", "Макс Планк", "Эрнест Резерфорд"], "answer": 0 },
      { "q": "Атомның планетарлық моделін ұсынған?", "options": ["Эрнест Резерфорд", "Дж. Томсон", "Джон Дальтон", "Нильс Бор"], "answer": 0 },
      { "q": "Планк тұрақтысының мәні (h)?", "options": ["6.62 * 10⁻³⁴ Дж*с", "1.6 * 10⁻¹⁹ Кл", "3 * 10⁸ м/с", "6.02 * 10²³"], "answer": 0 },
      { "q": "Фотон энергиясының формуласы?", "options": ["E = hν", "E = mc²", "E = p²/2m", "E = qV"], "answer": 0 },
      { "q": "Эйнштейннің фотоэффект теңдеуі?", "options": ["hν = A_шығу + Ek", "E = mc²", "F = BIl", "U = IR"], "answer": 0 },
      { "q": "Фотоэффектің қызыл шекарасы дегеніміз не?", "options": ["Фотоэффект басталатын ең аз жиілік", "Ең үлкен толқын ұзындығы", "Көрінетін түс", "Электрондардың толық тоқтауы"], "answer": 0 },
      { "q": "Бор постулаттары нені сипаттайды?", "options": ["Атомның тұрақтылық күйлерін", "Бөлшектердің қозғалысын", "Ядролық реакцияны", "Гравитацияны"], "answer": 0 },
      { "q": "Атом ядросы неден тұрады?", "options": ["Протондар мен нейтрондардан", "Электрондар мен протондардан", "Тек протондардан", "Нейтринодан"], "answer": 0 },
      { "q": "Ядродағы нуклондар саны бұл?", "options": ["Массалық сан (A)", "Реттік нөмір (Z)", "Нейтрондар саны", "Зарядтық сан"], "answer": 0 },
      { "q": "Протондар саны бұл?", "options": ["Реттік нөмір (Z)", "Массалық сан (A)", "Изотоп саны", "Энергетикалық деңгей"], "answer": 0 },
      { "q": "Изотоптар дегеніміз не?", "options": ["Реттік нөмірі бірдей, бірақ массасы әртүрлі атомдар", "Массасы бірдей атомдар", "Түрлі элементтер", "Радиоактивті заттар"], "answer": 0 },
      { "q": "Альфа-ыдырау кезінде қандай бөлшек бөлінеді?", "options": ["Гелий ядросы (α-бөлшек)", "Электрон (β-бөлшек)", "Фотон (γ-сәуле)", "Нейтрон"], "answer": 0 },
      { "q": "Бета-ыдырау кезінде ядро қалай өзгереді?", "options": ["Реттік нөмірі 1-ге артады немесе кемиді", "Массалық сан 4-ке кемиді", "Өзгермейді", "Ядро толық бөлшектенеді"], "answer": 0 },
      { "q": "Гамма-сәулеленудің табиғаты?", "options": ["Қысқа толқынды электромагниттік сәуле", "Зарядталған бөлшектер", "Дыбыс", "Жылу"], "answer": 0 },
      { "q": "Ядролық байланыс энергиясының себебі?", "options": ["Ядролық күштер", "Электрлік тебісу", "Магниттік тартылыс", "Гравитация"], "answer": 0 },
      { "q": "Масса ақауы (дефект) формуласы?", "options": ["Δm = (Zmp + Nmn) - M_ядро", "Δm = M_ядро / Z", "Δm = mc²", "Δm = m1 - m2"], "answer": 0 },
      { "q": "Ядролық реакцияның энергетикалық шығымы?", "options": ["ΔE = Δm * c²", "E = hν", "Q = cmΔT", "E = ma"], "answer": 0 },
      { "q": "Радиоактивті ыдырау заңы?", "options": ["N = N0 * 2^(-t/T)", "N = N0 * e^t", "N = kt", "N = N0 - t"], "answer": 0 },
      { "q": "Радиоактивтілік құбылысын ашқан ғалым?", "options": ["А. Беккерель", "Э. Резерфорд", "М. Кюри", "Дж. Чедвик"], "answer": 0 },
      { "q": "Нейтронның ашылуы кімнің еңбегі?", "options": ["Дж. Чедвик", "Э. Резерфорд", "И. Кюри", "Н. Бор"], "answer": 0 },
      { "q": "Ядролық тізбекті реакция қайда жүреді?", "options": ["Атомдық реакторда", "Күн бетінде", "Электр шамында", "Пеште"], "answer": 0 },
      { "q": "Термоядролық реакция дегеніміз не?", "options": ["Жеңіл ядролардың қосылуы (синтез)", "Ауыр ядролардың бөлінуі", "Атомның иондалуы", "Химиялық жану"], "answer": 0 },
      { "q": "Күн энергиясының көзі қандай реакция?", "options": ["Термоядролық синтез (сутегінің гелийге айналуы)", "Уранның бөлінуі", "Көмірдің жануы", "Магниттік өріс"], "answer": 0 },
      { "q": "Де Бройль толқындары нені сипаттайды?", "options": ["Кез келген қозғалыстағы бөлшектің толқындық қасиетін", "Тек жарықты", "Дыбысты", "Радиотолқындарды"], "answer": 0 },
      { "q": "Атомның иондалуы дегеніміз не?", "options": ["Атомның электронды жоғалтуы немесе қосып алуы", "Атомның бөлшектенуі", "Атомның қозған күйі", "Ядроның ыдырауы"], "answer": 0 },
      { "q": "Паули принципі нені шектейді?", "options": ["Бір кванттық күйде екі бірдей фермионның болуын", "Электрондар жылдамдығын", "Атом өлшемін", "Зарядты"], "answer": 0 },
      { "q": "Кванттық сандардың саны?", "options": ["4 (бас, орбиталь, магниттік, спин)", "3", "2", "6"], "answer": 0 },
      { "q": "Гейзенбергтің анықталмағандық принципі?", "options": ["Δx * Δp ≥ h/4π", "E = mc²", "λ = h/p", "F = kx"], "answer": 0 },
      { "q": "Кварктар дегеніміз не?", "options": ["Адрондардың құрамдас бөліктері (құрылымдық бөлшектер)", "Жеңіл бөлшектер", "Антибөлшектер", "Теріс зарядтар"], "answer": 0 }
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
  /* Sound effects disabled */
}

function speak(text) {
  /* Speech synthesis disabled */
}

window.speakText = speak;

window.toggleQuizAudio = function () {
  /* Audio toggle removed */
};

window.showAssignments = function (containerId = 'teacher-content', backView = 'teacher') {
  assignmentContext.containerId = containerId;
  assignmentContext.backView = backView;
  const content = document.getElementById(containerId);
  if (!content) return;

  const topicsHtml = Object.keys(physicsDb.questions).map(topic => `<option value="${topic}">${topic}</option>`).join('');
  content.innerHTML = `
    <div class="animate-fade-in" style="max-width: 800px; margin: 0 auto; padding-top: 1rem;">
      <button class="btn-secondary v-center gap-2" onclick="navigate('${backView}')" style="margin-bottom: 2rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
        <i data-lucide="arrow-left" size="18"></i> Басты бетке қайту
      </button>
      
      <div class="flex flex-col items-center text-center mb-10">
        <h2 class="gradient-text" style="font-size: 3rem; font-weight: 800; margin-bottom: 1rem;">Тапсырмалар менеджері</h2>
        <p style="color: var(--text-secondary); font-size: 1.1rem; max-width: 500px;">Бөлімді таңдап, тест немесе сәйкестендіру тапсырмасын бастаңыз</p>
      </div>
      
      <div class="glass-panel animate-slide-up" style="padding: 3rem; border-radius: 32px; background: rgba(255,255,255,0.7); box-shadow: 0 20px 50px rgba(0,0,0,0.05); border: 1px solid var(--border-glass);">
        <div class="grid gap-8" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
          <div class="flex flex-col gap-3">
             <label class="label-caps" style="color: var(--accent-orange);">ФИЗИКА БӨЛІМІ:</label>
             <select id="topic-select" class="glass-panel custom-select" style="padding: 1rem; border-radius: 15px; border: 1px solid var(--border-glass); background: #fff; width: 100%; outline: none; font-size: 1rem; font-weight: 600;">${topicsHtml}</select>
          </div>
          <div class="flex flex-col gap-3">
             <label class="label-caps" style="color: var(--accent-orange);">ТАПСЫРМА САНЫ:</label>
             <select id="count-select" class="glass-panel custom-select" style="padding: 1rem; border-radius: 15px; border: 1px solid var(--border-glass); background: #fff; width: 100%; outline: none; font-size: 1rem; font-weight: 600;">
               <option value="10">10 тапсырма</option>
               <option value="15">15 тапсырма</option>
               <option value="20">20 тапсырма</option>
               <option value="25">25 тапсырма</option>
               <option value="30">30 тапсырма</option>
             </select>
          </div>
          <div class="flex flex-col gap-3">
             <label class="label-caps" style="color: var(--accent-orange);">УАҚЫТ (С):</label>
             <select id="timer-select" class="glass-panel custom-select" style="padding: 1rem; border-radius: 15px; border: 1px solid var(--border-glass); background: #fff; width: 100%; outline: none; font-size: 1rem; font-weight: 600;">
               <option value="30">30 секунд</option>
               <option value="60">60 секунд</option>
               <option value="90">90 секунд</option>
               <option value="120">120 секунд</option>
             </select>
          </div>
          <div class="flex flex-col gap-3">
             <label class="label-caps" style="color: var(--accent-orange);">ТАПСЫРМА ТҮРІ:</label>
             <div style="display: flex; gap: 1rem; background: #f1f5f9; padding: 0.5rem; border-radius: 15px; border: 1px solid var(--border-glass);">
                <label class="flex-1 text-center cursor-pointer py-2 px-3 rounded-xl transition-all" style="font-weight: 700; font-size: 0.9rem;">
                  <input type="radio" name="taskMode" value="quiz" checked style="display: none;" onchange="updateTaskTypeUI(this)"> 
                  <span class="task-type-tab active">Тест</span>
                </label>
                <label class="flex-1 text-center cursor-pointer py-2 px-3 rounded-xl transition-all" style="font-weight: 700; font-size: 0.9rem;">
                  <input type="radio" name="taskMode" value="match" style="display: none;" onchange="updateTaskTypeUI(this)"> 
                  <span class="task-type-tab">Сәйкестендіру</span>
                </label>
             </div>
          </div>
        </div>
        
        <div class="flex justify-center mt-12">
          <button class="btn-primary v-center gap-3 animate-pulse-slow" onclick="generateTaskPreview()" style="padding: 1.2rem 4rem; font-size: 1.2rem; border-radius: 20px; font-weight: 800; box-shadow: 0 10px 25px rgba(242, 109, 33, 0.3);">
            <i data-lucide="sparkles" size="24"></i> ГЕНЕРАЦИЯЛАУ
          </button>
        </div>
      </div>
    </div>
    
    <style>
      .task-type-tab { padding: 0.6rem 1rem; border-radius: 10px; display: block; border: 1px solid transparent; }
      .task-type-tab.active { background: #fff; color: var(--accent-orange); box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid var(--border-glass); }
      .custom-select:hover { background: #f8fafc !important; border-color: var(--accent-orange) !important; }
    </style>
  `;
  
  window.updateTaskTypeUI = function(input) {
    document.querySelectorAll('.task-type-tab').forEach(el => el.classList.remove('active'));
    input.nextElementSibling.classList.add('active');
  };

  lucide.createIcons();
}

function generateTaskPreview() {
  const mode = document.querySelector('input[name="taskMode"]:checked').value;
  const topic = document.getElementById('topic-select').value;
  const count = parseInt(document.getElementById('count-select').value);
  const time = parseInt(document.getElementById('timer-select').value);
  if (mode === 'quiz') startQuizSession(topic, count, time);
  else renderMatchGame();
}

function startQuizSession(topic, count, time) {
  const allQuestions = physicsDb.questions[topic] || [];
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, count);
  if (shuffled.length === 0) { alert("Сұрақтар табылмады."); return; }
  quizSession = { questions: shuffled, currentIndex: 0, score: 0, timer: null, timeLeft: time, initialTime: time, isMuted: quizSession.isMuted };
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const content = document.getElementById(assignmentContext.containerId);
  if (!content) return;
  const q = quizSession.questions[quizSession.currentIndex];
  if (!q) { renderQuizResults(); return; }
  if (quizSession.timer) clearInterval(quizSession.timer);
  quizSession.timeLeft = quizSession.initialTime;

  let options = q.options.map((opt, index) => ({ text: opt, isCorrect: index === q.answer }));
  options = options.sort(() => Math.random() - 0.5);

  content.innerHTML = `
    <div class="animate-fade-in" style="max-width: 900px; margin: 0 auto;">
      <div class="flex justify-between items-center mb-6">
        <button class="btn-secondary v-center gap-2" onclick="window.showAssignments(assignmentContext.containerId, assignmentContext.backView)" style="padding: 0.6rem 1.2rem; border-radius: 50px;">
          <i data-lucide="x" size="18"></i> Тоқтату
        </button>
        <div class="flex items-center gap-4">
          <div id="quiz-timer" class="flex-center" style="padding: 0.8rem 1.5rem; background: #fff; border: 2px solid var(--border-glass); border-radius: 16px; font-weight: 800; font-size: 1.5rem; min-width: 100px; color: var(--text-primary); box-shadow: var(--shadow-sm);">${quizSession.timeLeft}с</div>
        </div>
      </div>

      <div class="flex flex-col w-full animate-slide-up" style="padding: 3rem; text-align: left; background: #fff; border-radius: 40px; box-shadow: 0 25px 60px rgba(0,0,0,0.1); position: relative; border: 1px solid var(--border-glass); overflow: hidden; box-sizing: border-box;">
      <div class="flex justify-between items-start" style="margin-bottom: 2.5rem;">
        <div class="flex items-center gap-4">
          <div class="flex flex-col">
            <span class="label-caps" style="font-size: 0.75rem; color: var(--text-tertiary);">Сұрақ</span>
            <span style="font-weight: 800; color: var(--accent-orange); font-size: 1.2rem;">${quizSession.currentIndex + 1} / ${quizSession.questions.length}</span>
          </div>
          <div style="width: 1px; height: 30px; background: var(--border-glass);"></div>
          <div class="flex flex-col">
            <span class="label-caps" style="font-size: 0.75rem; color: var(--text-tertiary);">Балл</span>
            <span style="font-size: 0.65rem; color: var(--accent-orange); background: rgba(242, 109, 33, 0.1); padding: 1px 6px; border-radius: 4px; font-weight: 800; margin-top: 4px;">+1 БАЛЛ</span>
          </div>
        </div>

        <div class="flex flex-col items-end">
          <span class="label-caps" style="font-size: 0.75rem; color: var(--text-tertiary);">Жалпы балл:</span>
          <span style="font-size: 2.5rem; color: var(--text-secondary); font-weight: 900; line-height: 1;">${quizSession.score}</span>
        </div>
      </div>
      
      <!-- Progress Line -->
      <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.03); border-radius: 50px; margin-bottom: 2.5rem; overflow: hidden;">
         <div style="height: 100%; width: ${(quizSession.currentIndex / quizSession.questions.length) * 100}%; background: var(--primary-gradient); transition: width 0.3s ease;"></div>
      </div>

      <h3 style="font-size: var(--font-2xl); font-weight: 800; line-height: 1.4; margin-bottom: 2.5rem; color: var(--text-primary); text-align: center;">${q.q}</h3>
      
      <div class="grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
        ${options.map((opt, i) => `
          <button class="quiz-btn v-center gap-4" onclick="handleQuizAnswer(this, ${opt.isCorrect})" style="padding: 1.2rem; border-radius: 16px; border: 2px solid var(--border-glass); background: #f8fafc; text-align: left; transition: all 0.2s; cursor: pointer;">
            <div class="quiz-badge">${String.fromCharCode(65 + i)}</div>
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
    if (timerDisplay) {
      const tVal = Math.max(0, quizSession.timeLeft);
      timerDisplay.innerText = tVal + 'с';
      if (quizSession.timeLeft <= 10) timerDisplay.style.color = 'var(--accent-red)';
    }
    if (quizSession.timeLeft <= 0) {
      clearInterval(quizSession.timer);
      playSound('wrong'); speakText('Уақыт бітті!');
      setTimeout(() => { quizSession.currentIndex++; renderQuizQuestion(); }, 1500);
    }
  }, 1000);
}

window.handleQuizAnswer = function (btn, isCorrect) {
  clearInterval(quizSession.timer);
  const btns = document.querySelectorAll('.quiz-btn');
  btns.forEach(b => b.disabled = true);

  if (isCorrect) {
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
  const content = document.getElementById(assignmentContext.containerId);
  if (!content) return;
  const percent = Math.round((quizSession.score / quizSession.questions.length) * 100);

  if (window.state.user === 'student') {
    window.state.studentProfile.assignmentPoints = (window.state.studentProfile.assignmentPoints || 0) + quizSession.score;
    if (typeof window.saveState === 'function') window.saveState();
  }

  content.innerHTML = `
    <div class="flex flex-col items-center justify-center animate-fade-in" style="min-height: 60vh;">
      <div class="glass-card flex flex-col items-center justify-center gap-6 w-full max-width-600 animate-fade-in" style="padding: 2.5rem 1.5rem; border-radius: 30px; text-align: center; box-sizing: border-box; background: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.05);">
        <div class="flex-center" style="width: 120px; height: 120px; border-radius: 50%; background: #fff; border: 5px solid var(--accent-orange); box-shadow: 0 0 30px rgba(242, 109, 33, 0.2);">
          <span style="font-size: var(--font-3xl); font-weight: 900; color: var(--accent-orange);">${percent}%</span>
        </div>
        <div>
          <h3 style="font-size: var(--font-3xl); font-weight: 800; margin-bottom: 0.5rem;">Тест Аяқталды!</h3>
          <p style="color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 0.5rem;">Сіз ${quizSession.questions.length} сұрақтың ${quizSession.score}-ына дұрыс жауап бердіңіз.</p>
          <div style="background: rgba(242, 109, 33, 0.1); padding: 0.8rem 1.5rem; border-radius: 12px; display: inline-block; border: 1px solid rgba(242, 109, 33, 0.2);">
            <p style="color: var(--accent-orange); font-weight: 800; margin: 0; font-size: 1.2rem;">${quizSession.score} балл = ${quizSession.score} PA Point</p>
          </div>
        </div>
        <div class="v-center gap-4">
          <button class="btn-primary v-center gap-2" onclick="window.showAssignments(assignmentContext.containerId, assignmentContext.backView)" style="padding: 1rem 2rem; border-radius: 50px;"><i data-lucide="refresh-cw" size="18"></i> Қайталау</button>
          <button class="btn-secondary v-center gap-2" onclick="navigate(assignmentContext.backView)" style="padding: 1rem 2rem; border-radius: 50px;"><i data-lucide="home" size="18"></i> Мәзір</button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
  speakText(`Тест аяқталды. Сіздің нәтижеңіз ${percent} пайыз.`);
}

function renderMatchGame() {
  const content = document.getElementById(assignmentContext.containerId);
  if (!content) return;
  
  content.innerHTML = `
    <div class="animate-fade-in" style="max-width: 1000px; margin: 0 auto;">
      <div class="flex justify-between items-center mb-8">
        <button class="btn-secondary v-center gap-2" onclick="window.showAssignments(assignmentContext.containerId, assignmentContext.backView)" style="padding: 0.6rem 1.2rem; border-radius: 50px;">
          <i data-lucide="arrow-left" size="18"></i> Артқа
        </button>
        <h2 class="gradient-text" style="font-size: 2rem; font-weight: 800;">Терминдерді сәйкестендір</h2>
        <div style="width: 120px;"></div>
      </div>
      
      <div id="match-container" class="glass-panel" style="padding: 2.5rem; border-radius: 32px; background: rgba(255,255,255,0.4); border: 1px solid var(--border-glass); min-height: 500px;">
        <!-- Match game content will be injected here -->
      </div>
    </div>
  `;

  const preview = document.getElementById('match-container');
  let leftSide = [...physicsDb.matches].sort(() => Math.random() - 0.5);
  let rightSide = [...physicsDb.matches].sort(() => Math.random() - 0.5);

  preview.innerHTML = `
    <div class="glass-card w-full h-full animate-fade-in" style="padding: 1.5rem; text-align: left; border-radius: 24px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
        <h3 class="gradient-text" style="font-size: 1.6rem;">Сәйкестендіру Ойыны</h3>
        <!-- Sound button removed -->
      </div>
      <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); align-items: stretch;">
        <div id="match-left" class="flex flex-col gap-2">
          ${leftSide.map(m => `<button class="match-btn flex-center" data-term="${m.term}" onclick="window.handleMatchSelection(this, 'left')" style="padding: 1rem; border-radius: 12px; border: 2px solid var(--border-glass); background: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s; height: 100%; flex: 1; font-size: var(--font-sm);">${m.term}</button>`).join('')}
        </div>
        <div id="match-right" class="flex flex-col gap-2">
          ${rightSide.map(m => `<button class="match-btn flex-center" data-term="${m.term}" onclick="window.handleMatchSelection(this, 'right')" style="padding: 1rem; border-radius: 12px; border: 2px solid var(--border-glass); background: #fff; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 11px; line-height: 1.3; height: 100%; flex: 1;">${m.def}</button>`).join('')}
        </div>
      </div>
      <button class="btn-secondary mt-8" onclick="window.showAssignments(assignmentContext.containerId, assignmentContext.backView)" style="width: 100%; border-radius: 12px;">Артқа</button>
    </div>
  `;
  lucide.createIcons();
}

window.handleMatchSelection = function (btn, side) {
  if (!window.matchState) window.matchState = { left: null, right: null };
  const parent = btn.parentElement;
  parent.querySelectorAll('.match-btn').forEach(b => { if (!b.disabled) b.style.borderColor = 'var(--border-glass)'; });

  window.matchState[side] = btn;
  btn.style.borderColor = 'var(--accent-orange)';

  if (window.matchState.left && window.matchState.right) {
    if (window.matchState.left.getAttribute('data-term') === window.matchState.right.getAttribute('data-term')) {
      playSound('correct');
      window.matchState.left.style.borderColor = '#4ADE80'; window.matchState.left.style.background = 'rgba(74, 222, 128, 0.05)';
      window.matchState.right.style.borderColor = '#4ADE80'; window.matchState.right.style.background = 'rgba(74, 222, 128, 0.05)';
      window.matchState.left.disabled = true; window.matchState.right.disabled = true;
    } else {
      playSound('wrong');
      const l = window.matchState.left, r = window.matchState.right;
      setTimeout(() => {
        if (!l.disabled) l.style.borderColor = '';
        if (!r.disabled) r.style.borderColor = '';
      }, 400);
    }
    window.matchState.left = null; window.matchState.right = null;
  }
};



window.filterMyClassGroup = function () {
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

/**
 * Teacher Dashboard & Document Manager
 * Centralized for robust rendering and global accessibility
 */

window.renderTeacherDashboard = function () {
  const teacherView = document.getElementById('teacher-view');
  if (!teacherView) return;

  teacherView.innerHTML = `
    <div class="dashboard-container" style="display: grid; grid-template-columns: 320px 1fr; gap: 2.5rem; min-height: 80vh; padding: 2rem 0;">
      <aside class="sidebar-panel glass-panel animate-slide-in">
        
        <!-- Profile Section -->
        <div class="flex flex-col items-center gap-4 text-center">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 3px solid var(--border-glass); overflow: hidden;">
            ${state.teacherProfile.avatar ? `<img src="${state.teacherProfile.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="user" size="48" style="color: var(--text-primary);"></i>`}
          </div>
          <div style="text-align: center; width: 100%;">
            <h3 style="font-size: var(--font-xl); font-weight: 700; margin-bottom: 0.2rem; text-align: center;">${state.teacherProfile.name}</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-sm); text-align: center; display: block; margin: 0 auto;">${state.teacherProfile.category}</p>
          </div>
          <button class="btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem; border-radius: 6px;" onclick="window.showTeacherProfile(true)"><i data-lucide="edit" size="16"></i> Ақпаратты өңдеу</button>
        </div>

        <div class="flex flex-col gap-2" style="background: rgba(255,255,255,0.6); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          
          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="school" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Мектебі</span>
              <span style="font-weight: 600; font-size: var(--font-sm); line-height: 1.3;">${state.teacherProfile.school}</span>
            </div>
          </div>

          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="users" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Сыныбы</span>
              <span style="font-weight: 600; font-size: var(--font-sm); line-height: 1.3;">${state.teacherProfile.classes}</span>
            </div>
          </div>

          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="book-open" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Пәні</span>
              <span style="font-weight: 600; font-size: var(--font-sm); line-height: 1.3;">${state.teacherProfile.subject}</span>
            </div>
          </div>

          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="award" size="16"></i>
            </div>
            <div class="flex flex-col flex-1">
              <span class="label-caps">Жетістіктері</span>
              <span style="font-size: var(--font-xs); font-weight: 500; line-height: 1.4; margin-top: 0.15rem;">${(state.teacherProfile.achievementsText || "").replace(/\n/g, '<br>')}</span>
            </div>
          </div>

        </div>

        <button class="btn-secondary v-center h-center" style="border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; padding: 0.8rem; font-size: var(--font-sm); font-weight: 700; color: #1e293b; gap: 0.5rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.02);" onclick="window.showMyDocuments()">
          <i data-lucide="folder" size="18" style="color: var(--accent-orange);"></i> Менің құжаттарым
        </button>

        <button class="btn-secondary v-center h-center" style="margin-top: auto; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; padding: 0.8rem; font-size: var(--font-sm); font-weight: 700; color: #1e293b; gap: 0.5rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.02);" onclick="window.logout()">
          <i data-lucide="log-out" size="18"></i> Шығу
        </button>
      </aside>

      <div id="teacher-content" class="content-panel glass-panel">
        <h2 class="voice-target" style="font-size: var(--font-3xl); margin-bottom: 1rem;">Қош келдіңіз, ${state.teacherProfile.name || 'Ұстаз'}!</h2>
        <p class="voice-target" style="color: var(--text-secondary); font-size: var(--font-base); margin-bottom: 2rem;">Бүгін қандай сабақ жоспарын дайындаймыз?</p>
        
        <div class="feature-grid animate-fade-in">
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);"> <i data-lucide="bot" size="32"></i> </div>
            <h3 class="label-caps" style="color: var(--text-primary);">AI Көмекші</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Сабақ жоспарларын AI арқылы жасаңыз.</p>
            <button class="card-btn orange label-caps" onclick="window.navigate('teacher-ai')">КІРУ</button>
          </div>
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);"> <i data-lucide="users-2" size="32"></i> </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Менің сыныбым</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Оқушылар тізімі және үлгерім.</p>
            <button class="card-btn orange label-caps" onclick="window.navigate('teacher-class')">КІРУ</button>
          </div>
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);"> <i data-lucide="clipboard-list" size="32"></i> </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Тапсырмалар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Тесттер мен жаттығулар.</p>
            <button class="card-btn orange label-caps" onclick="window.showAssignments()">КІРУ</button>
          </div>
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);"> <i data-lucide="library" size="32"></i> </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Оқулықтар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Электрондық оқулықтар жинағы.</p>
            <button class="card-btn orange label-caps" onclick="window.showResourceLibrary('teacher-content', 'window.renderTeacherDashboard')">КІРУ</button>
          </div>
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);"> <i data-lucide="flask-conical" size="32"></i> </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Зертханалық жұмыстар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Интерактивті симуляциялар.</p>
            <button class="card-btn orange label-caps" onclick="window.navigate('labs')">КІРУ</button>
          </div>
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);"> <i data-lucide="book-marked" size="32"></i> </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Жұмыс дәптері</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Функционалдық сауаттылық жұмыс дәптері.</p>
            <button class="card-btn orange label-caps" onclick="window.navigate('workbook')">КІРУ</button>
          </div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
};

window.showMyDocuments = function () {
  const content = document.getElementById('teacher-content');
  if (!content) {
    console.error("Teacher content container not found");
    return;
  }

  const docs = (state.teacherProfile && state.teacherProfile.documents) || [];

  content.innerHTML = `
    <div class="animate-fade-in" style="padding: 1rem;">
      <div class="flex justify-between items-center mb-6">
        <h2 class="gradient-text" style="font-size: 2.2rem; font-weight: 800; margin: 0;">Менің құжаттарым</h2>
        <button class="btn-secondary v-center" onclick="navigate('teacher')" style="padding: 0.6rem 1.2rem; border-radius: 50px; cursor: pointer;">
          <i data-lucide="arrow-left" size="18" style="margin-right: 8px;"></i> Артқа
        </button>
      </div>

      <div class="upload-zone animate-scale-in" onclick="document.getElementById('doc-upload-input').click()" style="cursor: pointer; padding: 2.5rem; border: 2px dashed rgba(242, 109, 33, 0.3); border-radius: 24px; text-align: center; background: rgba(255,255,255,0.4); line-height: 1.6;">
        <div style="background: rgba(242, 109, 33, 0.1); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <i data-lucide="upload-cloud" size="32" style="color: var(--accent-orange);"></i>
        </div>
        <div>
          <h3 style="margin-bottom: 0.5rem; font-size: 1.2rem; font-weight: 700;">Файлдарды жүктеу</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">Осы жерді басыңыз (PDF, PNG, JPG, макс 2МБ)</p>
        </div>
        <input type="file" id="doc-upload-input" style="display: none;" multiple onchange="window.handleDocumentUpload(event)">
      </div>

      <div class="doc-grid" id="documents-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
        ${docs.length === 0 ? `
          <div style="grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; background: rgba(255,255,255,0.4); border-radius: 24px; border: 1px dashed var(--border-glass);">
            <i data-lucide="folder-open" size="48" style="color: var(--text-tertiary); margin-bottom: 1rem; opacity: 0.5;"></i>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">Әлі ешқандай құжат жүктелген жоқ.</p>
          </div>
        ` : docs.map((doc, index) => `
          <div class="doc-card animate-scale-in" style="animation-delay: ${index * 0.05}s; background: white; border-radius: 20px; padding: 1.5rem; border: 1px solid var(--border-glass); box-shadow: 0 10px 25px rgba(0,0,0,0.03); position: relative; display: flex; flex-direction: column; align-items: center; text-align: center;">
            <button class="doc-delete-btn" onclick="window.deleteDocument(${index})" style="position: absolute; top: 12px; right: 12px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;"> <i data-lucide="trash-2" size="14"></i> </button>
            <div class="doc-icon-wrapper" onclick="window.open('${doc.dataUrl}', '_blank')" style="cursor: pointer; width: 60px; height: 60px; background: #f8fafc; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.2rem; color: var(--accent-orange);">
              <i data-lucide="${getFileIcon(doc.type)}" size="28"></i>
            </div>
            <div class="doc-name" onclick="window.open('${doc.dataUrl}', '_blank')" style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem; margin-bottom: 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; cursor: pointer;">${doc.name}</div>
            <div class="doc-meta" style="font-size: 0.75rem; color: var(--text-tertiary); font-weight: 500;">${doc.size} • ${doc.date}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
};

window.handleDocumentUpload = function (e) {
  const files = Array.from(e.target.files);
  let uploadedCount = 0;

  files.forEach(file => {
    if (file.size > 2 * 1024 * 1024) {
      alert(`Файл "${file.name}" тым үлкен (макс 2МБ)`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
      const newDoc = {
        name: file.name,
        type: file.type,
        size: formatBytes(file.size),
        date: dateStr,
        dataUrl: event.target.result
      };
      state.teacherProfile.documents.unshift(newDoc);
      uploadedCount++;
      if (uploadedCount === files.length) {
        saveState();
        showMyDocuments();
        if (window.speakText) window.speakText('Құжаттар сәтті жүктелді.');
      }
    };
    reader.readAsDataURL(file);
  });
};

window.deleteDocument = function (index) {
  if (confirm('Бұл құжатты өшіргіңіз келе ме?')) {
    state.teacherProfile.documents.splice(index, 1);
    saveState();
    showMyDocuments();
  }
};

function getFileIcon(type) {
  if (!type || typeof type !== 'string') return 'file';
  if (type.includes('pdf')) return 'file-text';
  if (type.includes('image')) return 'file-image';
  return 'file';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const sizes = ['B', 'KB', 'MB'];
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Teacher Profile Edit Feature
 */
window.showTeacherProfile = function (editMode = false) {
  const content = document.getElementById('teacher-content');
  if (!content) return;

  if (editMode) {
    const p = state.teacherProfile;
    const grades = [7, 8, 9, 10, 11];
    const sections = ['А', 'Ә', 'Б'];
    const currentClasses = p.classes ? p.classes.split(',').map(s => s.trim()) : [];

    let classSelectionsHtml = '';
    grades.forEach(g => {
      sections.forEach(s => {
        const val = `${g} "${s}"`;
        const isChecked = currentClasses.includes(val) ? 'checked' : '';
        classSelectionsHtml += `
          <label class="flex items-center gap-3 pointer" style="padding: 0.7rem; border: 1px solid var(--border-glass); border-radius: 12px; background: ${isChecked ? 'rgba(255, 126, 85, 0.08)' : '#fff'}; cursor: pointer; transition: all 0.2s; border: 1.5px solid ${isChecked ? 'var(--accent-orange)' : 'var(--border-glass)'};">
              <input type="checkbox" class="class-checkbox" value='${val}' ${isChecked} style="cursor: pointer; width: 20px; height: 20px; accent-color: var(--accent-orange);">
              <span style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">${val}</span>
          </label>
        `;
      });
    });

    const subjects = ['Физика', 'Математика', 'Информатика', 'Химия', 'Биология', 'География', 'Тарих', 'Қазақ тілі', 'Орыс тілі', 'Ағылшын тілі', 'Дене шынықтыру', 'Көркем еңбек'];
    const subjectOptionsHtml = subjects.map(s => `<option value="${s}" ${p.subject === s ? 'selected' : ''}>${s}</option>`).join('');

    content.innerHTML = `
      <div class="glass-card animate-fade-in" style="padding: 2.5rem; max-width: 600px; margin: 0 auto; border: 1px solid var(--border-glass); border-radius: 24px; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
          <h2 class="gradient-text" style="font-size: 1.8rem; margin-bottom: 2rem; font-weight: 800;">Профильді өңдеу</h2>
          
          <div class="flex flex-col items-center gap-2 mb-6">
            <div id="avatar-preview-container" onclick="document.getElementById('edit-avatar').click()" style="width: 120px; height: 120px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 4px solid var(--border-glass); cursor: pointer; overflow: hidden; position: relative;">
              ${p.avatar ? `<img id="avatar-preview-img" src="${p.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i id="avatar-placeholder" data-lucide="user" size="48" style="color: var(--text-primary);"></i>`}
              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.4); padding: 4px; color: white; font-size: 10px; text-align: center; font-weight: 700;">ЖҮКТЕУ</div>
            </div>
            <input type="file" id="edit-avatar" style="display: none;" accept="image/*">
            <span class="label-caps" style="font-size: 10px; color: var(--text-tertiary);">Суретті ауыстыру үшін басыңыз</span>
          </div>

          <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Толық аты-жөні:</label>
                  <input type="text" id="edit-name" value="${p.name}" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; outline: none; font-size: var(--font-base);">
              </div>
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Санаты:</label>
                  <input type="text" id="edit-category" value="${p.category}" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; outline: none; font-size: var(--font-base);">
              </div>
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Мектебі:</label>
                  <input type="text" id="edit-school" value="${p.school}" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; outline: none; font-size: var(--font-base);">
              </div>
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Пәні:</label>
                  <select id="edit-subject" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; outline: none; font-size: var(--font-base); cursor: pointer;">
                      ${subjectOptionsHtml}
                  </select>
              </div>
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Сыныптары:</label>
                  <div id="classes-selection-grid" class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); background: #fdfdfd; padding: 1.2rem; border-radius: 16px; border: 1px solid var(--border-glass); max-height: 220px; overflow-y: auto;">
                      ${classSelectionsHtml}
                  </div>
              </div>
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Жетістіктері:</label>
                  <textarea id="edit-achievements" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; min-height: 120px; outline: none; font-size: var(--font-base); font-family: inherit;">${p.achievementsText}</textarea>
              </div>
              <div class="flex gap-4" style="margin-top: 1.5rem;">
                  <button class="btn-primary" style="flex: 1; padding: 1.1rem; border-radius: 14px;" onclick="window.saveTeacherProfile()"><i data-lucide="save" size="18"></i> Сақтау</button>
                  <button class="btn-secondary" style="flex: 1; padding: 1.1rem; border-radius: 14px;" onclick="navigate('teacher')">Болдырмау</button>
              </div>
          </div>
      </div>
    `;

    document.getElementById('edit-avatar').onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('avatar-preview-img').src = event.target.result;
          p.avatar = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    lucide.createIcons();
  }
};

window.saveTeacherProfile = function () {
  const p = state.teacherProfile;
  p.name = document.getElementById('edit-name').value;
  p.category = document.getElementById('edit-category').value;
  p.school = document.getElementById('edit-school').value;
  p.subject = document.getElementById('edit-subject').value;
  p.achievementsText = document.getElementById('edit-achievements').value;

  const checkedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked')).map(cb => cb.value);
  p.classes = checkedClasses.join(', ');

  saveState();
  renderTeacherDashboard();
  if (window.speakText) window.speakText('Профиль мәліметтері сәтті сақталды.');
};
