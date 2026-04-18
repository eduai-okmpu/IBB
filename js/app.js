const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbzsHO8t7TM04Sohp6Lq6nuYzLoSvJOHy_fI4MA0wW7qv6tUxUkwpzUHXVpcmrNMtc_zfg/exec"; // Бұл сілтемені өзіңіздің Google Apps Script web app URL-ге ауыстырыңыз
const defaultState = {
  view: 'home',
  user: null, // 'teacher' or 'student' or null
  history: ['home'],
  labs: [
    { id: 1, key: 'freefall', title: 'Еркін түсуді зерттеу', desc: 'Дененің еркін түсу уақыты мен жылдамдығының биіктікке тәуелділігін зерделеу.' },
    { id: 2, key: 'impulse', title: 'Денелердің соқтығысуы', desc: 'Серпімді және серпімсіз соқтығыстар кезінде импульстің сақталуын зерттеу.' },
    { id: 3, key: 'hooke', title: 'Гук заңын зерттеу', desc: 'Серпімділік күшінің ұзаруға тәуелділігін зерделеу және қатаңдықты анықтау.' },
    { id: 4, key: 'newton1', title: 'Инерция заңын зерттеу', desc: 'Денелердің инерциялық қасиеттерін және үйкелістің қозғалысқа әсерін бақылау.' },
    { id: 5, key: 'newton2', title: 'Ньютонның 2-заңы', desc: 'Күш, масса және үдеу арасындағы тәуелділікті эксперимент жүзінде тексеру.' },
    { id: 6, key: 'newton3', title: 'Әрекет және қарсы әрекет', desc: 'Өзара әрекеттесетін денелердің күштерінің теңдігін бақылау.' },
    { id: 7, key: 'gravity', title: 'Бүкіләлемдік тартылыс', desc: 'Денелер арасындағы тартылыс күшінің масса мен қашықтыққа тәуелділігін зерттеу.' },
    { id: 8, key: 'density', title: 'Заттың тығыздығы', desc: 'Әртүрлі заттардың тығыздығын өлшеу және оларды салыстыру.' },
    { id: 9, key: 'pressure', title: 'Қысымды зерттеу', desc: 'Қысымның түсірілген күш пен ауданға тәуелділігін бақылау.' },
    { id: 10, key: 'archimedes', title: 'Архимед заңы', desc: 'Сұйыққа батырылған денеге әсер ететін итеруші күшті өлшеу.' }
  ],
  teacherProfile: {
    name: '',
    category: '',
    school: '',
    subject: '',
    experience: '',
    classes: '',
    achievementsText: '',
    certificates: [], // {name, dataUrl}
    documents: []
  },
  studentProfile: {
    id: Date.now(),
    name: '',
    school: '',
    grade: '',
    points: 0,
    level: 1,
    achievements: [],
    avatar: null
  },
  quizResults: [],
  allStudents: [],
  chatMessages: [],
  currentTeacherChatStudentId: null
};

const savedState = localStorage.getItem('physicsAccessState');
const parsedState = savedState ? JSON.parse(savedState) : {};
// Site should start as guest on first launch, so we ignore user/view from storage
const state = { ...defaultState, ...parsedState, user: null, view: 'home', labs: defaultState.labs };

function saveState() {
  localStorage.setItem('physicsAccessState', JSON.stringify({
    view: state.view,
    user: state.user,
    history: state.history,
    teacherProfile: state.teacherProfile,
    studentProfile: state.studentProfile,
    quizResults: state.quizResults,
    allStudents: state.allStudents,
    chatMessages: state.chatMessages,
    currentTeacherChatStudentId: state.currentTeacherChatStudentId
  }));
}

// Sync state across multiple tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'physicsAccessState') {
    const newState = JSON.parse(e.newValue);
    if (newState && newState.chatMessages) {
      state.chatMessages = newState.chatMessages;
      state.currentTeacherChatStudentId = newState.currentTeacherChatStudentId;

      // Refresh current view if it is a chat
      const chatContainer = document.getElementById('chat-messages-container');
      if (chatContainer) {
      }
    }
  }
});

function navigate(viewId, pushToHistory = true) {
  // If user is logged in and trying to go to home/login, redirect to dashboard
  if (state.user && (viewId === 'home' || viewId === 'login')) {
    viewId = state.user;
  }

  if (pushToHistory && state.view !== viewId) {
    state.history.push(viewId);
  }
  state.view = viewId;
  saveState();

  const views = document.querySelectorAll('.view');
  views.forEach(v => v.classList.remove('active'));

  const targetView = document.getElementById(`${viewId}-view`);

  const isHome = viewId === 'home' || viewId === 'login';

  const headerActions = document.getElementById('header-actions');
  const authActions = document.getElementById('auth-actions');

  if (state.user) {
    if (headerActions) headerActions.style.display = 'none';
    if (authActions) {
      authActions.style.display = 'flex';
      updateHeaderNav();
    }
  } else {
    if (headerActions) headerActions.style.display = isHome ? 'flex' : 'none';
    if (authActions) authActions.style.display = 'none';
  }

  if (targetView) {
    targetView.classList.add('active');
    if (viewId === 'labs') renderLabs();
    if (viewId === 'teacher' && state.user === 'teacher') window.renderTeacherDashboard();
    if (viewId === 'student' && state.user === 'student') renderStudentDashboard();
    if (viewId === 'student-lessons' && state.user === 'student') window.showStudentLessons('student-lessons-view', "navigate('student')");
    if (viewId === 'student-ai' && state.user === 'student') {
      window.showStudentAIAssistant();
    }
    if (viewId === 'teacher-ai' && state.user === 'teacher') {
      window.showAIAssistant();
    }
    if (viewId === 'teacher-class' && state.user === 'teacher') {
      window.showClassManager();
    }
  }

  // Handle calculator visibility
  const calcBtn = document.querySelector('.floating-calc-btn');
  if (calcBtn) {
    calcBtn.style.display = (viewId === 'student-lesson-play') ? 'flex' : 'none';
  }

  // Handle accessibility panel visibility
  const a11yPanel = document.getElementById('a11y-panel');
  if (a11yPanel) {
    const isStudentView = viewId.startsWith('student') || (state.user === 'student' && viewId === 'labs');
    a11yPanel.style.display = (state.user === 'student' && isStudentView) ? 'flex' : 'none';
  }

  // Close calculator modal if navigating away
  const calcModal = document.getElementById('calc-modal');
  if (calcModal && viewId !== 'student-lesson-play') {
    calcModal.style.display = 'none';
  }
}

function updateHeaderNav() {
  const authActions = document.getElementById('auth-actions');
  if (!authActions || !state.user) return;

  const isTeacher = state.user === 'teacher';
  const navLinks = isTeacher ? [
    { id: 'teacher', label: 'Басты бет', icon: 'layout' },
    { id: 'teacher-class', label: 'Оқушылар', icon: 'users' },
    { id: 'teacher-ai', label: 'AI Көмекші', icon: 'bot' },
    { id: 'labs', label: 'Зертхана', icon: 'flask-conical' }
  ] : [
    { id: 'student', label: 'Басты бет', icon: 'layout' },
    { id: 'student-lessons', label: 'Сабақтар', icon: 'play-circle' },
    { id: 'labs', label: 'Зертхана', icon: 'flask-conical' },
    { id: 'student-ai', label: 'AI Көмекші', icon: 'sparkles' }
  ];

  authActions.innerHTML = `
    <div class="flex items-center gap-2 header-nav">
      ${navLinks.map(link => `
        <button onclick="${link.fn ? link.fn : `navigate('${link.id}')`}" class="header-nav-btn ${state.view === link.id ? 'active' : ''}">
          <i data-lucide="${link.icon}" size="18"></i>
          <span>${link.label}</span>
        </button>
      `).join('')}
      <div style="width: 1px; height: 24px; background: var(--border-glass); margin: 0 0.5rem;"></div>
      <button onclick="logout()" class="header-nav-btn logout" title="Шығу">
        <i data-lucide="log-out" size="18"></i>
      </button>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}


let quizState = {
  topicId: null,
  currentIndex: 0,
  score: 0,
  isFinished: false
};

function goBack() {
  if (state.history.length > 1) {
    state.history.pop();
    const prevView = state.history[state.history.length - 1];
    navigate(prevView, false);
  }
}

const GOOGLE_SCRIPTS_AUTH_URL = 'https://script.google.com/macros/s/AKfycbzsHO8t7TM04Sohp6Lq6nuYzLoSvJOHy_fI4MA0wW7qv6tUxUkwpzUHXVpcmrNMtc_zfg/exec';

window.callAI = async function (text) {
  const email = state.user === 'teacher' ? (state.teacherProfile.email || 'teacher@demo.com') : (state.studentProfile.email || 'student@demo.com');

  try {
    const params = new URLSearchParams({
      action: 'chat',
      email: email,
      text: text
    });
    const response = await fetch(`${GOOGLE_SCRIPTS_AUTH_URL}?${params.toString()}`);
    return await response.json();
  } catch (error) {
    console.error('AI API Error:', error);
    return { success: false, message: error.message };
  }
};

window.openAuthModal = function (mode = 'login') {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.style.display = 'flex';
    toggleAuthMode(mode);
  }
};

window.closeAuthModal = function () {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
};

window.toggleAuthMode = function (mode) {
  const loginView = document.getElementById('login-form-view');
  const registerView = document.getElementById('register-form-view');
  if (loginView && registerView) {
    loginView.style.display = mode === 'login' ? 'block' : 'none';
    registerView.style.display = mode === 'register' ? 'block' : 'none';
  }
};

window.handleAuthSubmit = async function (mode) {
  const loading = document.getElementById('auth-loading');
  const emailVal = document.getElementById(mode === 'login' ? 'login-email' : 'reg-email').value;
  let params = new URLSearchParams({ action: mode });

  if (mode === 'login') {
    const password = document.getElementById('login-password').value;
    if (!emailVal || !password) return alert('Мәліметтерді толтырыңыз');
    params.append('email', emailVal);
    params.append('password', password);
  } else {
    const name = document.getElementById('reg-name').value;
    const role = document.getElementById('reg-role').value;
    const password = document.getElementById('reg-password').value;
    if (!name || !emailVal || !password) return alert('Барлық өрістерді толтырыңыз');
    params.append('name', name);
    params.append('role', role);
    params.append('email', emailVal);
    params.append('password', password);
  }

  if (loading) loading.style.display = 'flex';

  try {
    const url = `${GOOGLE_SCRIPTS_AUTH_URL}?${params.toString()}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      state.user = result.user.role;
      let name = result.user.name;
      if (!name || name === 'Вы') {
        name = emailVal ? emailVal.split('@')[0] : 'User';
      }
      state.studentProfile.name = name;
      state.teacherProfile.name = name;

      // Save email to state for AI history
      if (state.user === 'teacher') {
        state.teacherProfile.email = emailVal;
      } else {
        state.studentProfile.email = emailVal;
      }

      login(result.user.role);
      closeAuthModal();
    } else {
      alert(result.message || 'Қате орын алды');
    }
  } catch (error) {
    console.error('Auth Error:', error);
    if (emailVal === 'teacher@demo.com') login('teacher');
    else if (emailVal === 'student@demo.com') login('student');
    else alert('API байланыс қатесі.');
  } finally {
    if (loading) loading.style.display = 'none';
  }
};

function login(role) {
  state.user = role;
  state.history = ['home', role];
  saveState();
  navigate(role, false);
}

function logout() {
  state.user = null;
  state.history = ['home'];

  // Clear AI chat sessions
  if (window.clearStudentAIChat) window.clearStudentAIChat();
  if (window.clearTeacherAIChat) window.clearTeacherAIChat();

  saveState();
  navigate('home', false);
}

function navigateHome() {
  if (state.user) {
    navigate(state.user);
  } else {
    // If guest clicks start/logo, show auth modal for better UX
    if (state.view === 'home') {
      openAuthModal('register');
    } else {
      navigate('home');
    }
  }
}

function renderLabs(category = null) {
  const labsView = document.getElementById('labs-view');
  if (!labsView) return;

  if (!category) {
    labsView.innerHTML = `
      <div class="animate-fade-in" style="padding: 1rem;">
        <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 2.5rem; color: var(--text-primary);" class="voice-target">Зертханалық жұмыстар</h2>
        
        <div class="grid gap-8" style="grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));">
          <!-- PhysicsAccess Category -->
          <div class="glass-card voice-target animate-hover" onclick="renderPhysicsAccessLabs()" style="padding: 2.5rem; cursor: pointer; border: 2px solid var(--accent-orange); position: relative; overflow: hidden; background: linear-gradient(135deg, rgba(242, 109, 33, 0.05), white);">
            <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: var(--accent-orange); opacity: 0.1; border-radius: 50%;"></div>
            <div style="background: var(--primary-gradient); width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; color: white;">
              <i data-lucide="blocks" size="32"></i>
            </div>
            <h3 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary);">PhysicsAccess платформасы</h3>
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">Интерактивті, қолмен есептелетін және сандық зертханалық жұмыстар жинағы.</p>
            <div class="flex items-center gap-2" style="font-weight: 700; color: var(--accent-orange);">
              КӨРУ <i data-lucide="chevron-right" size="20"></i>
            </div>
          </div>

          <!-- Phet Category -->
          <div class="glass-card voice-target animate-hover" onclick="renderPhetLabsList()" style="padding: 2.5rem; cursor: pointer; border: 2px solid #3b82f6; position: relative; overflow: hidden; background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), white);">
            <div style="position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: #3b82f6; opacity: 0.1; border-radius: 50%;"></div>
            <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; color: white;">
              <i data-lucide="shapes" size="32"></i>
            </div>
            <h3 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 1rem; color: var(--text-primary);">Phet симуляциялары</h3>
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">Әлемдік деңгейдегі интерактивті көрнекі физикалық симуляциялар тізімі.</p>
            <div class="flex items-center gap-2" style="font-weight: 700; color: #3b82f6;">
              КӨРУ <i data-lucide="chevron-right" size="20"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  lucide.createIcons();
}

function renderPhysicsAccessLabs() {
  const labsView = document.getElementById('labs-view');
  if (!labsView) return;

  const colors = ['#f26d21', '#6366f1', '#22c55e', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6', '#3b82f6', '#f97316', '#10b981'];

  labsView.innerHTML = `
    <div class="animate-fade-in" style="padding: 1rem;">
      <button class="btn-secondary v-center" style="margin-bottom: 2rem; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;" onclick="renderLabs()">
        <i data-lucide="arrow-left" size="18"></i> Артқа
      </button>

      <div class="flex items-center gap-4" style="margin-bottom: 2.5rem;">
        <div style="background: var(--accent-orange); padding: 10px; border-radius: 12px; color: white;">
          <i data-lucide="blocks" size="28"></i>
        </div>
        <h2 style="font-size: 2rem; font-weight: 800; margin: 0;">PhysicsAccess Зертханалары</h2>
      </div>
      
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
        ${state.labs.map((lab, index) => `
          <div class="glass-card voice-target animate-hover" onclick="showPhysicsAccessLab('${lab.key}')" style="padding: 2rem; border-left: 8px solid ${colors[index % colors.length]}; cursor: pointer;">
             <h4 class="label-caps" style="color: ${colors[index % colors.length]}; font-size: 0.75rem; margin-bottom: 0.5rem;">№${lab.id} Зертханалық жұмыс</h4>
             <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 1rem;">${lab.title}</h3>
             <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">${lab.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  lucide.createIcons();
}

function renderPhetLabsList() {
  const labsView = document.getElementById('labs-view');
  labsView.innerHTML = `
    <div class="animate-fade-in" style="padding: 1rem;">
      <button class="btn-secondary v-center" style="margin-bottom: 2rem; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;" onclick="renderLabs()">
        <i data-lucide="arrow-left" size="18"></i> Артқа
      </button>

      <div class="flex items-center gap-4" style="margin-bottom: 2.5rem;">
        <div style="background: #3b82f6; padding: 10px; border-radius: 12px; color: white;">
          <i data-lucide="shapes" size="28"></i>
        </div>
        <h2 style="font-size: 2rem; font-weight: 800; margin: 0;">Phet интерактивті симуляциялары</h2>
      </div>

      <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
         ${state.labs.map(lab => `
           <div class="glass-card voice-target animate-hover" onclick="showLabDetails(${lab.id})" style="padding: 1.5rem; border: 1px solid var(--border-glass);">
             <div style="background: #3b82f6; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: white; font-weight: 900; font-size: 0.8rem;">
               ${lab.id}
             </div>
             <h3 style="margin-bottom: 0.5rem; font-size: 1.1rem; font-weight: 700;">${lab.title}</h3>
             <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">${lab.desc}</p>
           </div>
         `).join('')}
      </div>
    </div>
  `;
  lucide.createIcons();
}

function showPhysicsAccessLab(type) {
  const container = document.getElementById('labs-view');
  if (!container) return;

  const backBtn = `
    <button class="btn-secondary v-center" style="margin-bottom: 1.5rem; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;" onclick="renderPhysicsAccessLabs()">
      <i data-lucide="arrow-left" size="18"></i> Тізімге оралу
    </button>
  `;

  const labRenders = {
    'freefall': () => renderFreeFallLab(true),
    'impulse': renderImpulseLab,
    'hooke': renderHookeLab,
    'newton1': renderNewton1Lab,
    'newton2': renderNewton2Lab,
    'newton3': renderNewton3Lab,
    'gravity': renderGravityLab,
    'density': renderDensityLab,
    'pressure': renderPressureLab,
    'archimedes': renderArchimedesLab
  };

  if (labRenders[type]) {
    container.innerHTML = backBtn + labRenders[type]();
    lucide.createIcons();
  }
}

/**
 * Teacher & Student logic moved to respective files
 */

function renderStudentDashboard() {
  const studentView = document.getElementById('student-view');
  if (!studentView) return;

  const p = state.studentProfile;

  studentView.innerHTML = `
    <div class="dashboard-container">
      <!-- Sidebar -->
      <aside class="sidebar-panel glass-panel animate-slide-in">
        
        <div class="flex flex-col items-center gap-4 text-center">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 3px solid var(--border-glass); overflow: hidden; position: relative;">
            ${p.avatar ? `<img src="${p.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="user" size="48" style="color: var(--text-primary);"></i>`}
          </div>
          <div style="text-align: center; width: 100%;">
            <h3 style="font-size: var(--font-xl); font-weight: 700; margin-bottom: 0.2rem; text-align: center;">${p.name}</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-sm); text-align: center; display: block; margin: 0 auto;">Оқушы</p>
          </div>
          <button class="btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem; border-radius: 6px;" onclick="showStudentProfile(true)"><i data-lucide="edit" size="16"></i> Ақпаратты өңдеу</button>
        </div>

        <div class="flex flex-col gap-2" style="background: rgba(255,255,255,0.6); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          
          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(0, 195, 255, 0.1); border-radius: 6px; color: var(--accent-cyan); flex-shrink: 0;">
              <i data-lucide="school" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Мектебі</span>
              <span style="font-weight: 600; font-size: var(--font-sm); line-height: 1.3;">${p.school}</span>
            </div>
          </div>

          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(0, 195, 255, 0.1); border-radius: 6px; color: var(--accent-cyan); flex-shrink: 0;">
              <i data-lucide="book-open" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Сыныбы</span>
              <span style="font-weight: 600; font-size: var(--font-sm); line-height: 1.3;">${p.grade}</span>
            </div>
          </div>

          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="award" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Рейтинг (Балл)</span>
              <span style="font-weight: 800; font-size: var(--font-base); color: var(--accent-orange); line-height: 1.3;">${p.score || p.points || 0}</span>
            </div>
          </div>
        </div>

        <button class="btn-secondary v-center h-center" style="margin-top: auto; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; padding: 0.8rem; font-size: var(--font-sm); font-weight: 700; color: #1e293b; gap: 0.5rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.02);" onclick="logout()">
          <i data-lucide="log-out" size="18"></i> Шығу
        </button>
      </aside>

      <!-- Main Content -->
      <div id="student-content" class="content-panel glass-panel">
        <div class="dashboard-header animate-fade-in" style="margin-bottom: 2rem;">
          <h1 class="gradient-text voice-target" style="font-size: var(--font-3xl); margin-bottom: 0.5rem;">Қош келдіңіз, ${p.name || 'Оқушы'}!</h1>
          <p class="voice-target" style="color: var(--text-secondary); font-size: var(--font-base);">Бүгін физика әлемін бірге зерттейік!</p>
        </div>

        <div class="feature-grid animate-fade-in">
          <!-- Card 1: AI Assistant -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="bot" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">AI Көмекші</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Физика пәні бойынша кез келген сұрақтарыңа жауап ал.</p>
            <button class="card-btn orange label-caps" onclick="navigate('student-ai')">КІРУ</button>
          </div>

          <!-- Card 2: Lessons -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="play-circle" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Сабақтар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Интерактивті сабақтар мен теориялық материалдар.</p>
            <button class="card-btn orange label-caps" onclick="navigate('student-lessons')">КІРУ</button>
          </div>

          <!-- Card 4: Electronic Textbooks -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="library" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Оқулықтар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Дайын физика оқулықтарына тікелей сілтемелер мен онлайн оқу мүмкіндігі.</p>
            <button class="card-btn orange label-caps" onclick="showResourceLibrary('student-content', 'renderStudentDashboard')">КІРУ</button>
          </div>

          <!-- Card 5: Lab Works -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="flask-conical" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Зертханалық жұмыстар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Интерактивті симуляциялар мен тәжірибелерді жасаңыз.</p>
            <button class="card-btn orange label-caps" onclick="navigate('labs')">КІРУ</button>
          </div>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}


// Redundant lesson logic removed. Logic migrated to js/student.js and js/lessons_data.js.





// Redundant lesson/quiz functions removed. Logic migrated to student.js.
function updateTeacherSidebar() {
  if (state.user === 'teacher') window.renderTeacherDashboard();
}

function showStudentAchievements() {
  const content = document.getElementById('student-content');
  if (!content) return;
  content.innerHTML = `
    <div class="animate-fade-in">
      <button class="btn-secondary v-center" style="margin-bottom: 2rem; gap: 0.5rem;" onclick="renderStudentDashboard()">
        <i data-lucide="arrow-left" size="18"></i>
        Артқа
      </button>
      <h2 class="gradient-text" style="font-size: 2rem; margin-bottom: 1.5rem;">Жетістіктерім</h2>
      <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
        <div class="glass-card flex flex-col items-center text-center">
            <div style="width: 64px; height: 64px; background: rgba(242, 109, 33, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: var(--accent-orange);">
                <i data-lucide="award" size="32"></i>
            </div>
            <h3>Жас физик</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px;">Алғашқы сабақты өтті</p>
        </div>
        <div class="glass-card flex flex-col items-center text-center">
            <div style="width: 64px; height: 64px; background: rgba(147, 51, 234, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: var(--accent-purple);">
                <i data-lucide="zap" size="32"></i>
            </div>
            <h3>Жылдам жауап</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 5px;">Тестті 100% орындады</p>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function saveStudentProfile() {
  state.studentProfile.name = document.getElementById('edit-student-name').value;
  state.studentProfile.school = document.getElementById('edit-student-school').value;
  state.studentProfile.grade = document.getElementById('edit-student-grade').value;

  if (state.tempStudentAvatar) {
    state.studentProfile.avatar = state.tempStudentAvatar;
    delete state.tempStudentAvatar;
  }

  if (state.allStudents) {
    const studentIndex = state.allStudents.findIndex(s => s.id === state.studentProfile.id);
    if (studentIndex !== -1) {
      state.allStudents[studentIndex].name = state.studentProfile.name;
      state.allStudents[studentIndex].grade = state.studentProfile.grade;
      state.allStudents[studentIndex].school = state.studentProfile.school;
      state.allStudents[studentIndex].avatar = state.studentProfile.avatar;
    }
  }

  saveState();
  renderStudentDashboard();
  if (window.speakText) window.speakText('Профиль мәліметтері сәтті сақталды.');
}

function showMyTeacherInfo() {
  const content = document.getElementById('student-content');
  if (!content) return;

  const tp = state.teacherProfile;

  content.innerHTML = `
    <div class="animate-fade-in" style="max-width: 800px; margin: 0 auto;">
      <button class="btn-secondary v-center" style="margin-bottom: 2rem; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;" onclick="renderStudentDashboard()">
        <i data-lucide="arrow-left" size="18"></i> Артқа
      </button>

      <div class="glass-card" style="padding: 1.5rem; position: relative; overflow: hidden; border-radius: 30px;">
        <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: var(--primary-gradient); opacity: 0.05; border-radius: 50%;"></div>
        
        <div class="flex flex-col md-flex-row gap-8 items-center md-items-start">
          <div style="width: 160px; height: 160px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 5px solid white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; flex-shrink: 0;">
            ${tp.avatar ? `<img src="${tp.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="user" size="80" style="color: white;"></i>`}
          </div>

          <div style="flex: 1; text-align: left;">
            <h2 class="gradient-text" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem;">${tp.name}</h2>
            <p style="font-size: 1.1rem; color: var(--accent-orange); font-weight: 700; margin-bottom: 1.5rem; text-transform: uppercase;">${tp.category}</p>
            
            <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
              <div class="glass-panel" style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.7);">
                <span class="label-caps" style="font-size: 10px;">Пәні</span>
                <p style="font-weight: 700; font-size: 1rem;">${tp.subject}</p>
              </div>
              <div class="glass-panel" style="padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.7);">
                <span class="label-caps" style="font-size: 10px;">Мектебі</span>
                <p style="font-weight: 700; font-size: 1rem;">${tp.school}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function showStudentProfile(editMode = false) {
  const content = document.getElementById('student-content');
  if (!content) return;

  const p = state.studentProfile;
  const gradeOptions = ['7 А', '7 B', '8 А', '8 B', '9 А', '9 B'];
  const gradeOptionsHtml = gradeOptions.map(g => `<option value="${g}" ${p.grade === g ? 'selected' : ''}>${g}</option>`).join('');

  if (editMode) {
    content.innerHTML = `
      <div class="animate-fade-in" style="max-width: 600px; margin: 0 auto;">
          <h2 class="gradient-text mb-6" style="font-size: 2rem;">Профильді өңдеу</h2>
          <div class="glass-card" style="padding: 2rem;">
          <div class="flex flex-col items-center gap-2 mb-6">
            <div id="student-avatar-preview-container" onclick="document.getElementById('edit-student-avatar').click()" style="width: 120px; height: 120px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 4px solid var(--border-glass); cursor: pointer; overflow: hidden; position: relative;">
              ${p.avatar ? `<img id="student-avatar-preview-img" src="${p.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i id="student-avatar-placeholder" data-lucide="user" size="48" style="color: var(--text-primary);"></i>`}
              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.4); padding: 4px; color: white; font-size: 10px; text-align: center; font-weight: 700;">ЖҮКТЕУ</div>
            </div>
            <input type="file" id="edit-student-avatar" style="display: none;" accept="image/*">
            <span class="label-caps" style="font-size: 10px; color: var(--text-tertiary);">Суретті ауыстыру үшін басыңыз</span>
          </div>

          <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Толық аты-жөні:</label>
                  <input type="text" id="edit-student-name" value="${p.name}" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; outline: none; font-size: var(--font-base);">
              </div>
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Мектебі:</label>
                  <input type="text" id="edit-student-school" value="${p.school}" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; outline: none; font-size: var(--font-base);">
              </div>
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Сыныбы:</label>
                  <select id="edit-student-grade" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; outline: none; font-size: var(--font-base); cursor: pointer;">
                      ${gradeOptionsHtml}
                  </select>
              </div>
              <div class="flex gap-4" style="margin-top: 1.5rem;">
                  <button class="btn-primary" style="flex: 1; padding: 1.1rem; border-radius: 14px;" onclick="saveStudentProfile()"><i data-lucide="save" size="18"></i> Сақтау</button>
                  <button class="btn-secondary" style="flex: 1; padding: 1.1rem; border-radius: 14px;" onclick="renderStudentDashboard()">Болдырмау</button>
              </div>
          </div>
      </div>
    </div>
    `;

    document.getElementById('edit-student-avatar').onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          state.tempStudentAvatar = ev.target.result;
          const container = document.getElementById('student-avatar-preview-container');
          container.innerHTML = `<img src="${ev.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
        };
        reader.readAsDataURL(file);
      }
    };
    lucide.createIcons();
  } else {
    content.innerHTML = `
      <div class="animate-fade-in" style="max-width: 600px; margin: 0 auto;">
        <div class="glass-card" style="padding: 3rem; text-align: center;">
          <div style="width: 150px; height: 150px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 5px solid white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin: 0 auto 2rem; overflow: hidden;">
            ${p.avatar ? `<img src="${p.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="user" size="70" style="color: white;"></i>`}
          </div>
          <h2 class="gradient-text" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem;">${p.name}</h2>
          <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 2rem;">Сыныбы: ${p.grade} | Мектебі: ${p.school}</p>
          <div class="flex gap-4 justify-center">
            <button class="btn-primary" style="padding: 1rem 2rem; border-radius: 15px;" onclick="showStudentProfile(true)">
              <i data-lucide="edit-3" size="20"></i> Өңдеу
            </button>
            <button class="btn-secondary" style="padding: 1rem 2rem; border-radius: 15px;" onclick="renderStudentDashboard()">Басты бет</button>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
  }
}

function renderFreeFallLab() {
  setTimeout(() => {
    updateFreeFallSim(50);
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="glass-panel animate-scale-in" style="padding: 1.2rem; margin-top: 1rem; border-radius: 32px; border: 1px solid var(--border-glass); background: white; position: relative;">
      
      <!-- Theory Section -->
      <div class="flex flex-col md-flex-row gap-4" style="margin-bottom: 2rem; background: #f8fafc; padding: 1.2rem; border-radius: 24px; border: 1px solid var(--border-glass);">
        <div style="flex: 1; width: 100%;">
          <h3 style="color: var(--accent-orange); font-size: 1.3rem; margin-bottom: 1rem; font-weight: 800;">Еркін түсуді зерттеу</h3>
          <div style="display: flex; flex-direction: column; gap: 0.8rem;">
            <p style="font-size: 0.95rem;"><strong style="color: var(--text-primary);"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Мақсаты:</strong> Дененің еркін түсу уақыты мен жылдамдығының биіктікке тәуелділігін зерделеу.</p>
            <div style="background: white; padding: 0.8rem; border-radius: 12px; border: 1px solid var(--border-glass);">
               <p style="font-weight: 800; color: var(--accent-orange); margin-bottom: 0.5rem; font-size: 0.75rem;" class="label-caps">Формулалар:</p>
               <div style="display: flex; flex-wrap: wrap; gap: 1rem; font-size: 1rem; font-weight: 700; color: var(--text-primary);">
                 <span>g = <div style="display: inline-block; vertical-align: middle; text-align: center;"><div style="border-bottom: 2px solid currentColor;">2h</div><div>t<sup>2</sup></div></div></span>
                 <span>g = <div style="display: inline-block; vertical-align: middle; text-align: center;"><div style="border-bottom: 2px solid currentColor;">v</div><div>t</div></div></span>
               </div>
            </div>
          </div>
        </div>
        <div style="flex: 1; width: 100%; border-top: 2px solid var(--accent-orange); border-left: none; padding: 1.2rem 0 0 0;" class="md-theory-border">
          <h4 style="font-weight: 800; color: var(--text-primary); margin-bottom: 0.8rem; font-size: 0.95rem;">Орындалу реті:</h4>
          <ul style="padding-left: 0; line-height: 1.5; color: var(--text-secondary); font-weight: 500; list-style-type: none; font-size: 0.9rem;">
            <li class="v-center gap-2"><i data-lucide="check-circle-2" size="16" style="color: var(--accent-cyan);"></i> Биіктікті (h) таңдаңыз.</li>
            <li class="v-center gap-2"><i data-lucide="check-circle-2" size="16" style="color: var(--accent-cyan);"></i> "ТҮСІРУ" батырмасын басыңыз.</li>
            <li class="v-center gap-2"><i data-lucide="check-circle-2" size="16" style="color: var(--accent-cyan);"></i> Уақыт пен жылдамдық мәндерін жазыңыз.</li>
            <li class="v-center gap-2"><i data-lucide="check-circle-2" size="16" style="color: var(--accent-cyan);"></i> g мәнін есептеңіз.</li>
          </ul>
        </div>
      </div>

      <style>
        @media (min-width: 768px) {
          .md-theory-border { border-top: none !important; border-left: 2px solid var(--accent-orange) !important; padding: 0 0 0 1.2rem !important; }
        }
      </style>

      <div class="flex flex-col md-flex-row gap-6">
        <!-- Left Side: Experiment & Controls -->
        <div class="flex flex-col gap-4" style="flex: 1.5; width: 100%;">
          <div id="ff-sim-stage" style="height: 380px; background: linear-gradient(to bottom, #f0f9ff, #e0f2fe); border-radius: 24px; border: 1px solid var(--border-glass); position: relative; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);">
            <!-- SVG injected here -->
          </div>
          
          <div class="glass-panel flex flex-col md-flex-row justify-between items-center gap-4" style="padding: 1rem; border-radius: 20px; background: #f8fafc; border: 1px solid var(--border-glass);">
            <div class="flex flex-col md-flex-row items-center gap-3">
              <span class="label-caps" style="font-weight: 800; color: var(--text-secondary); font-size: 0.75rem;">Биіктік:</span>
              <div class="flex gap-2">
                <button class="lab-ff-btn" onclick="updateFreeFallSim(10)" style="padding: 0.5rem 0.8rem; font-size: 0.85rem;">10м</button>
                <button class="lab-ff-btn active" onclick="updateFreeFallSim(50)" style="padding: 0.5rem 0.8rem; font-size: 0.85rem;">50м</button>
                <button class="lab-ff-btn" onclick="updateFreeFallSim(100)" style="padding: 0.5rem 0.8rem; font-size: 0.85rem;">100м</button>
              </div>
            </div>
            
            <button class="btn-primary v-center gap-3" onclick="startFreeFallAnim()" id="ff-start-btn" style="padding: 0.8rem 1.2rem; border-radius: 12px; font-weight: 900; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(242, 109, 33, 0.2); width: 100%;" class="md-w-auto">
              <i data-lucide="play-circle" size="20"></i> ТҮСІРУ
            </button>
          </div>
        </div>

        <!-- Right Side: Data -->
        <div class="flex flex-col gap-4" style="flex: 1; width: 100%;">
          <div class="glass-card" style="padding: 1.2rem; background: white; border-top: 6px solid var(--accent-orange); border-radius: 24px; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <h4 class="v-center gap-2" style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 1.2rem;">
              <i data-lucide="timer" size="20" style="color: var(--accent-orange);"></i> Мәліметтер
            </h4>
            <div id="ff-data" style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary); line-height: 1.8;">
              <div class="flex justify-between items-center">
                <span style="font-size: 1rem;">Уақыт:</span>
                <span style="color: var(--accent-orange);">0.00 с</span>
              </div>
              <div style="border-top: 1px solid var(--border-glass); margin: 0.6rem 0;"></div>
              <div class="flex justify-between items-center">
                <span style="font-size: 1rem;">Жылдамдық:</span>
                <span style="color: var(--accent-orange);">0.0 м/с</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        @media (min-width: 768px) {
          .md-w-auto { width: auto !important; }
        }
      </style>


    <style>
      .lab-ff-btn { padding: 0.6rem 1.2rem; border-radius: 12px; font-weight: 700; background: white; border: 1.5px solid var(--border-glass); cursor: pointer; transition: all 0.2s; }
      .lab-ff-btn:hover { border-color: var(--accent-orange); color: var(--accent-orange); }
      .lab-ff-btn.active { background: var(--primary-gradient); color: white; border-color: transparent; box-shadow: 0 4px 12px rgba(242, 109, 33, 0.2); }
    </style>
  `;
}

let ffCurrentHeight = 50;
function updateFreeFallSim(h) {
  ffCurrentHeight = h;
  const stage = document.getElementById('ff-sim-stage');
  const btns = document.querySelectorAll('.lab-ff-btn');
  btns.forEach(b => b.classList.toggle('active', parseInt(b.innerText) === h));

  // Calculate dynamic positions
  const markerY = 550 - (h * 5); // Base Y for the selected height
  const holderY = markerY - 15;   // Holder sits slightly above the mark
  const ballCy = holderY + 35;   // Ball sits centered below the holder

  stage.innerHTML = `
    <svg class="lab-svg" width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid meet">

      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#bae6fd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="600" fill="url(#skyGrad)" />
      
      <!-- Scale lines -->
      ${[0, 20, 40, 60, 80, 100].map(m => `
        <line x1="50" y1="${550 - m * 5}" x2="80" y2="${550 - m * 5}" stroke="#94a3b8" stroke-width="2" />
        <text x="40" y="${555 - m * 5}" font-size="14" font-weight="800" fill="#64748b" text-anchor="end">${m}м</text>
      `).join('')}
      
      <!-- Ground -->
      <line x1="20" y1="550" x2="380" y2="550" stroke="#334155" stroke-width="12" stroke-linecap="round" />
      
      <!-- Dynamic Holder -->
      <rect x="160" y="${holderY}" width="80" height="15" fill="#1e293b" rx="4" />
      
      <!-- Dynamic Ball -->
      <circle id="ff-ball" cx="200" cy="${ballCy}" r="20" fill="#F26D21" stroke="white" stroke-width="3" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));" />
      
      <text x="200" y="${holderY - 15}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--accent-orange)" class="label-caps">Биіктік: ${h}м</text>
    </svg>
  `;
  document.getElementById('ff-data').innerHTML = `
    <div class="flex justify-between items-center">
      <span>Уақыт:</span>
      <span style="color: var(--accent-orange);">0.00 с</span>
    </div>
    <div style="border-top: 1px solid var(--border-glass); margin: 0.8rem 0;"></div>
    <div class="flex justify-between items-center">
      <span>Жылдамдық:</span>
      <span style="color: var(--accent-orange);">0.0 м/с</span>
    </div>
  `;
  const startBtn = document.getElementById('ff-start-btn');
  if (startBtn) {
    startBtn.disabled = false;
    startBtn.innerHTML = '<i data-lucide="play-circle" size="22"></i> ТҮСІРУ';
    lucide.createIcons();
  }
}

function startFreeFallAnim() {
  const ball = document.getElementById('ff-ball');
  const btn = document.getElementById('ff-start-btn');
  const dataEl = document.getElementById('ff-data');
  if (!ball || btn.disabled) return;

  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="refresh-cw" size="32" class="animate-spin"></i> ТӘЖІРИБЕ ӨТУДЕ...';
  lucide.createIcons();

  const g = 9.8;
  const h = ffCurrentHeight;
  const totalTime = Math.sqrt((2 * h) / g);
  const startTime = performance.now();

  // Simulation constants
  const startY = 550 - (h * 5) + 20;
  const groundY = 530; // 550 (ground) - 20 (ball radius)
  const totalDist = groundY - startY;

  function anim(now) {
    const elapsed = (now - startTime) / 1000;
    if (elapsed < totalTime) {
      // Free fall formula: s = 0.5 * g * t^2
      const timeRatio = elapsed / totalTime;
      const currentY = startY + (timeRatio * timeRatio) * totalDist;

      ball.setAttribute('cy', currentY);
      const currentV = g * elapsed;
      dataEl.innerHTML = `
        <div class="flex justify-between items-center">
          <span>Уақыт:</span>
          <span style="color: var(--accent-orange);">${elapsed.toFixed(2)} с</span>
        </div>
        <div style="border-top: 1px solid var(--border-glass); margin: 0.8rem 0;"></div>
        <div class="flex justify-between items-center">
          <span>Жылдамдық:</span>
          <span style="color: var(--accent-orange);">${currentV.toFixed(1)} м/с</span>
        </div>
      `;
      requestAnimationFrame(anim);
    } else {
      ball.setAttribute('cy', groundY);
      const finalV = g * totalTime;
      dataEl.innerHTML = `
        <div class="flex justify-between items-center">
          <span>Уақыт:</span>
          <span style="color: var(--accent-orange);">${totalTime.toFixed(2)} с</span>
        </div>
        <div style="border-top: 1px solid var(--border-glass); margin: 0.8rem 0;"></div>
        <div class="flex justify-between items-center">
          <span>Жылдамдық:</span>
          <span style="color: var(--accent-orange);">${finalV.toFixed(1)} м/с</span>
        </div>
      `;
      btn.innerHTML = '<i data-lucide="check-circle" size="22"></i> АЯҚТАЛДЫ';
      btn.classList.add('finished');
      lucide.createIcons();
      if (window.speakText) window.speakText(`Дене ${totalTime.toFixed(2)} секундта түсті. Соңғы жылдамдық секундына ${finalV.toFixed(1)} метр.`);

      // Auto-reset after 3 seconds
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="play-circle" size="22"></i> ТҮСІРУ';
        ball.setAttribute('cy', startY);
        lucide.createIcons();
      }, 3000);
    }
  }
  requestAnimationFrame(anim);
}

function renderImpulseLab() {
  setTimeout(() => {
    updateImpulseSim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="glass-panel animate-scale-in" style="padding: 2rem; margin-top: 1rem; border-radius: 32px; border: 1px solid var(--border-glass); background: white;">
      <!-- Lab Report Header -->
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; margin-bottom: 2rem; background: #f0f9ff; padding: 2rem; border-radius: 24px; border: 1px solid #bae6fd;">
        <div>
          <h3 style="color: #0369a1; font-size: 1.5rem; margin-bottom: 1rem; font-weight: 800;">№2</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong style="color: #0c4a6e;">Тақырыбы:</strong> Денелердің соқтығысуы және импульстің сақталу заңы.</p>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong style="color: #0c4a6e;">Мақсаты:</strong> Серпімді және серпімсіз соқтығыстар кезінде импульстің сақталуын зерттеу.</p>
          <div style="background: white; padding: 1rem; border-radius: 12px; border: 1.5px solid #7dd3fc; margin-top: 1rem;">
             <p style="font-weight: 700; color: #0369a1; margin-bottom: 5px;">Қажетті формулалар:</p>
             <code style="font-size: 1.2rem; font-weight: 900; color: #0c4a6e;">p = m · v | m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'</code>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.6); padding: 1.5rem; border-radius: 16px; border: 1px solid #bae6fd;">
          <h4 style="font-weight: 800; color: #0369a1; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Жұмыстың орындалу реті:
          </h4>
          <ol style="font-size: 0.95rem; line-height: 1.6; color: #0c4a6e; padding-left: 1.2rem;">
            <li>Денелердің массасын (m₁, m₂) және алғашқы жылдамдығын (v₁) таңдаңыз.</li>
            <li>Соқтығыс түрін таңдаңыз: <b>Серпімді</b> немесе <b>Серпімсіз</b>.</li>
            <li>"БАСТАУ" батырмасын басып, нәтижені бақылаңыз.</li>
            <li>Соқтығысқа дейінгі және кейінгі импульсті салыстырыңыз.</li>
          </ol>
        </div>
      </div>

      <!-- Simulation Stage -->
      <div id="impulse-sim-stage" style="height: 350px; background: #f8fafc; border-radius: 24px; border: 2px solid #e2e8f0; margin-bottom: 2rem; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
         <!-- SVG will be rendered here -->
      </div>

      <!-- Controls and Simulation Interface -->
      <div class="flex flex-col gap-8">
        <div class="glass-panel" style="padding: 2rem; background: #f1f5f9; border-radius: 24px;">
          <div class="grid gap-8" style="grid-template-columns: 1fr 1fr;">
            <!-- Ball 1 Controls -->
            <div>
              <h5 style="color: #6366f1; font-weight: 800; margin-bottom: 1.5rem; text-transform: uppercase; font-size: 0.85rem;">1-ші дене (Сол жақ)</h5>
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-4">
                  <span style="width: 80px; font-size: 0.9rem; font-weight: 700;">Масса:</span>
                  <input type="range" id="m1-range" min="1" max="10" value="2" step="0.5" oninput="updateImpulseSim()" style="flex-grow: 1;">
                  <span id="m1-val" style="width: 50px; font-weight: 800; color: #6366f1;">2кг</span>
                </div>
                <div class="flex items-center gap-4">
                  <span style="width: 80px; font-size: 0.9rem; font-weight: 700;">Жылдамдық:</span>
                  <input type="range" id="v1-range" min="1" max="10" value="5" step="0.5" oninput="updateImpulseSim()" style="flex-grow: 1;">
                  <span id="v1-val" style="width: 50px; font-weight: 800; color: #6366f1;">5м/с</span>
                </div>
              </div>
            </div>
            <!-- Ball 2 Controls -->
            <div>
              <h5 style="color: #06b6d4; font-weight: 800; margin-bottom: 1.5rem; text-transform: uppercase; font-size: 0.85rem;">2-ші дене (Оң жақ)</h5>
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-4">
                  <span style="width: 80px; font-size: 0.9rem; font-weight: 700;">Масса:</span>
                  <input type="range" id="m2-range" min="1" max="10" value="4" step="0.5" oninput="updateImpulseSim()" style="flex-grow: 1;">
                  <span id="m2-val" style="width: 50px; font-weight: 800; color: #06b6d4;">4кг</span>
                </div>
                <div style="background: #e2e8f0; padding: 1rem; border-radius: 12px; font-size: 0.85rem; color: #475569; font-weight: 600;">
                  2-ші дене тыныштықта (v₂ = 0)
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-6" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #cbd5e1;">
            <div class="flex items-center gap-3">
              <span style="font-weight: 800;">Соқтығыс түрі:</span>
              <select id="collision-type" onchange="updateImpulseSim()" style="padding: 0.6rem 1rem; border-radius: 10px; border: 2px solid #cbd5e1; font-weight: 700; color: var(--text-primary); outline: none;">
                <option value="elastic">Серпімді</option>
                <option value="inelastic">Серпімсіз</option>
              </select>
            </div>
            <button id="start-imp-btn" class="btn-primary" style="flex-grow: 1; padding: 1rem; border-radius: 12px; font-size: 1.1rem;" onclick="startImpulseAnim()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              БАСТАУ (Run Simulation)
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}

function updateImpulseSim() {
  const stage = document.getElementById('impulse-sim-stage');
  const m1 = parseFloat(document.getElementById('m1-range').value);
  const v1 = parseFloat(document.getElementById('v1-range').value);
  const m2 = parseFloat(document.getElementById('m2-range').value);
  const type = document.getElementById('collision-type').value;

  document.getElementById('m1-val').innerText = m1 + "кг";
  document.getElementById('v1-val').innerText = v1 + "м/с";
  document.getElementById('m2-val').innerText = m2 + "кг";

  const p1 = m1 * v1;
  const p2 = 0; // v2 is 0
  const pTotal = p1 + p2;

  const pInitial = document.getElementById('p-initial-val');
  const pFinal = document.getElementById('p-final-val');
  if (pInitial) pInitial.innerText = pTotal.toFixed(1);
  if (pFinal) pFinal.innerText = pTotal.toFixed(1);

  if (!stage) return;

  const r1 = 15 + (m1 * 3);
  const r2 = 15 + (m2 * 3);

  stage.innerHTML = `
    <svg class="lab-svg" id="imp-svg" width="100%" height="100%" viewBox="0 0 600 350">

      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Track -->
      <line x1="20" y1="280" x2="580" y2="280" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round" />
      <line x1="20" y1="280" x2="580" y2="280" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="10,10" />
      
      <!-- Ball 2 (Stationary at center) -->
      <circle id="ball2" cx="350" cy="240" r="${r2}" fill="url(#grad2)" stroke="#fff" stroke-width="2" style="filter: drop-shadow(0 8px 15px rgba(0,0,0,0.15));" />
      
      <!-- Ball 1 (Starting at left) -->
      <circle id="ball1" cx="80" cy="240" r="${r1}" fill="url(#grad1)" stroke="#fff" stroke-width="2" style="filter: drop-shadow(0 8px 15px rgba(0,0,0,0.15));" />
      
      <!-- Velocity Vector for Ball 1 -->
      <path id="v1-vector" d="M ${80 + r1 + 5} 240 L ${80 + r1 + 5 + (v1 * 8)} 240" stroke="#6366f1" stroke-width="4" marker-end="url(#arrowhead)" />
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
      </marker>
    </svg>
  `;
}

window.startImpulseAnim = function () {
  const btn = document.getElementById('start-imp-btn');
  const m1 = parseFloat(document.getElementById('m1-range').value);
  const v1 = parseFloat(document.getElementById('v1-range').value);
  const m2 = parseFloat(document.getElementById('m2-range').value);
  const type = document.getElementById('collision-type').value;

  if (v1 <= 0 || !btn) return;

  // Disable Controls
  btn.disabled = true;
  document.getElementById('m1-range').disabled = true;
  document.getElementById('v1-range').disabled = true;
  document.getElementById('m2-range').disabled = true;
  document.getElementById('collision-type').disabled = true;

  const b1 = document.getElementById('ball1');
  const b2 = document.getElementById('ball2');
  const vVec = document.getElementById('v1-vector');
  const r1 = parseFloat(b1.getAttribute('r'));
  const r2 = parseFloat(b2.getAttribute('r'));

  let cx1 = 80;
  let cx2 = 350;
  let curV1 = v1 * 1.5; // Scale for animation speed
  let curV2 = 0;
  let collided = false;

  function step() {
    cx1 += curV1;
    cx2 += curV2;

    b1.setAttribute('cx', cx1);
    b2.setAttribute('cx', cx2);
    if (vVec) vVec.setAttribute('display', 'none');

    // Collision Check
    if (!collided && (cx1 + r1 >= cx2 - r2)) {
      collided = true;
      cx1 = cx2 - r2 - r1; // Align exactly at impact

      if (type === 'elastic') {
        const v1_final = ((m1 - m2) * v1) / (m1 + m2);
        const v2_final = (2 * m1 * v1) / (m1 + m2);
        curV1 = v1_final * 1.5;
        curV2 = v2_final * 1.5;
      } else {
        const v_final = (m1 * v1) / (m1 + m2);
        curV1 = v_final * 1.5;
        curV2 = v_final * 1.5;
      }
    }

    // Stop condition
    if (cx1 > 650 || cx1 < -50 || cx2 > 650) {
      btn.disabled = false;
      document.getElementById('m1-range').disabled = false;
      document.getElementById('v1-range').disabled = false;
      document.getElementById('m2-range').disabled = false;
      document.getElementById('collision-type').disabled = false;
      updateImpulseSim(); // Reset to initial state after animation
      return;
    }

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
};


// Newton 3 Lab State
let newton3LabState = {
  f: 20,
  isMoving: false
};

function renderNewton3Lab() {
  setTimeout(() => {
    updateNewton3Sim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="glass-panel animate-scale-in" style="padding: 2rem; margin-top: 1rem; border-radius: 32px; border: 1px solid var(--border-glass); background: white;">
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; margin-bottom: 2rem; background: #fff1f2; padding: 2rem; border-radius: 24px; border: 1.5px solid #fecdd3;">
        <div>
          <h3 style="color: #9f1239; font-size: 1.5rem; margin-bottom: 1rem; font-weight: 800;">№6: Әрекет және қарсы әрекет</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong style="color: #881337;">Мақсаты:</strong> Денелердің өзара әрекеттесу күштерінің теңдігін бақылау.</p>
          <div style="background: white; padding: 1rem; border-radius: 12px; border: 1.5px solid #fecdd3; margin-top: 1rem;">
             <code style="font-size: 1.8rem; font-weight: 900; color: #e11d48;">F₁ = -F₂</code>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.6); padding: 1.5rem; border-radius: 16px; border: 1px solid #fecdd3;">
          <h4 style="font-weight: 800; color: #9f1239; margin-bottom: 0.8rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 0.95rem; line-height: 1.6; color: #881337; padding-left: 1.2rem;">
            <li>Өзара әрекеттесу күшін таңдаңыз.</li>
            <li>"БАСТАУ" басып, екі дененің қалай қозғалатынын бақылаңыз.</li>
            <li>Екі динамометрдің де бірдей күшті көрсететініне көз жеткізіңіз.</li>
          </ol>
        </div>
      </div>

      <div id="newton3-sim-stage" style="height: 300px; background: #f8fafc; border-radius: 24px; border: 2px solid #e2e8f0; margin-bottom: 2rem; position: relative;">
         <!-- SVG -->
      </div>

      <div class="glass-panel" style="padding: 2rem; background: #fff1f2; border-radius: 24px;">
        <div class="flex justify-between items-center gap-8">
          <div class="flex flex-col gap-2 flex-grow">
            <span class="label-caps" style="font-weight: 800; color: #9f1239;">Әсер етуші күш (F):</span>
            <input type="range" min="10" max="100" value="20" oninput="updateNewton3Value(this.value)" style="width: 100%;">
            <div class="flex justify-between font-bold" style="color: #e11d48;">
              <span>10 Н</span>
              <span id="n3-f-val">20 Н</span>
              <span>100 Н</span>
            </div>
          </div>
          <button class="btn-primary" onclick="startNewton3Anim()" id="n3-start-btn" style="background: #e11d48; border-radius: 12px; padding: 1rem 3rem;">
             БАСТАУ
          </button>
        </div>
      </div>
    </div>
  `;
}

function updateNewton3Value(val) {
  newton3LabState.f = parseFloat(val);
  document.getElementById('n3-f-val').innerText = `${val} Н`;
  updateNewton3Sim();
}

function updateNewton3Sim() {
  const stage = document.getElementById('newton3-sim-stage');
  if (!stage) return;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 300">
      <line x1="100" y1="220" x2="700" y2="220" stroke="#94a3b8" stroke-width="2" />
      
      <!-- Skater 1 -->
      <g id="n3-s1" transform="translate(340, 160)">
         <rect x="0" y="0" width="60" height="50" rx="4" fill="#6366f1" />
         <circle cx="15" cy="55" r="8" fill="#1e293b" />
         <circle cx="45" cy="55" r="8" fill="#1e293b" />
         <text x="30" y="30" text-anchor="middle" fill="white" font-weight="900">m₁</text>
         <!-- Gauge 1 -->
         <rect x="60" y="20" width="60" height="10" fill="#cbd5e1" />
         <text x="90" y="15" text-anchor="middle" font-size="12" font-weight="900" fill="#6366f1">-${newton3LabState.f} Н</text>
      </g>

      <!-- Skater 2 -->
      <g id="n3-s2" transform="translate(400, 160)">
         <rect x="0" y="0" width="60" height="50" rx="4" fill="#ec4899" />
         <circle cx="15" cy="55" r="8" fill="#1e293b" />
         <circle cx="45" cy="55" r="8" fill="#1e293b" />
         <text x="30" y="30" text-anchor="middle" fill="white" font-weight="900">m₂</text>
         <!-- Gauge 2 -->
         <rect x="-60" y="20" width="60" height="10" fill="#cbd5e1" />
         <text x="-30" y="15" text-anchor="middle" font-size="12" font-weight="900" fill="#ec4899">+${newton3LabState.f} Н</text>
      </g>
    </svg>
  `;
}

function startNewton3Anim() {
  if (newton3LabState.isMoving) return;
  newton3LabState.isMoving = true;
  document.getElementById('n3-start-btn').disabled = true;

  const s1 = document.getElementById('n3-s1');
  const s2 = document.getElementById('n3-s2');
  let x1 = 340, x2 = 400;
  let v1 = 0, v2 = 0;
  const a = newton3LabState.f / 10; // F/m where m=10

  function step() {
    v1 -= a * 0.016;
    v2 += a * 0.016;
    x1 += v1;
    x2 += v2;
    if (x1 < 50 || x2 > 700) {
      newton3LabState.isMoving = false;
      document.getElementById('n3-start-btn').disabled = false;
      if (window.triggerSalute) triggerSalute();
      return;
    }
    s1.setAttribute('transform', `translate(${x1}, 160)`);
    s2.setAttribute('transform', `translate(${x2}, 160)`);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Gravity Lab State
let gravityLabState = {
  m1: 100,
  m2: 100,
  dist: 200
};

function renderGravityLab() {
  setTimeout(() => {
    updateGravitySim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="glass-panel animate-scale-in" style="padding: 2rem; margin-top: 1rem; border-radius: 32px; border: 1px solid var(--border-glass); background: white;">
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; margin-bottom: 2rem; background: #faf5ff; padding: 2rem; border-radius: 24px; border: 1.5px solid #f3e8ff;">
        <div>
          <h3 style="color: #7e22ce; font-size: 1.5rem; margin-bottom: 1rem; font-weight: 800;">№7: Бүкіләлемдік тартылыс</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong style="color: #6b21a8;">Мақсаты:</strong> Тартылыс күшінің масса мен қашықтыққа тәуелділігін зерттеу.</p>
          <div style="background: white; padding: 1rem; border-radius: 12px; border: 1.5px solid #e9d5ff; margin-top: 1rem;">
             <code style="font-size: 1.4rem; font-weight: 900; color: #9333ea;">F = G · (m₁m₂) / r²</code>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.6); padding: 1.5rem; border-radius: 16px; border: 1px solid #f3e8ff;">
          <h4 style="font-weight: 800; color: #7e22ce; margin-bottom: 0.8rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 0.95rem; line-height: 1.6; color: #6b21a8; padding-left: 1.2rem;">
            <li>Планеталардың массасын өзгертіңіз.</li>
            <li>Олардың арақашықтығын реттеңіз.</li>
            <li>Тартылыс күшінің қалай өзгеретінін бақылаңыз.</li>
          </ol>
        </div>
      </div>

      <div id="gravity-sim-stage" style="height: 350px; background: radial-gradient(circle, #1e1b4b, #0f172a); border-radius: 24px; border: 1px solid #334155; margin-bottom: 2rem; position: relative;">
         <!-- SVG planets -->
      </div>

      <div class="glass-panel" style="padding: 2rem; background: #faf5ff; border-radius: 24px;">
        <div class="grid gap-8" style="grid-template-columns: 1fr 1fr 1fr;">
          <div class="flex flex-col gap-2">
            <span class="label-caps" style="font-weight: 800; color: #7e22ce;">m₁ массасы:</span>
            <input type="range" min="10" max="500" value="100" oninput="updateGravityValue('m1', this.value)" style="width: 100%;">
            <span id="grav-m1" style="font-weight: 800; color: #9333ea;">100 x 10²⁴ кг</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="label-caps" style="font-weight: 800; color: #7e22ce;">m₂ массасы:</span>
            <input type="range" min="10" max="500" value="100" oninput="updateGravityValue('m2', this.value)" style="width: 100%;">
            <span id="grav-m2" style="font-weight: 800; color: #9333ea;">100 x 10²⁴ кг</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="label-caps" style="font-weight: 800; color: #7e22ce;">Арақашықтық (r):</span>
            <input type="range" min="100" max="500" value="200" oninput="updateGravityValue('dist', this.value)" style="width: 100%;">
            <span id="grav-dist" style="font-weight: 800; color: #9333ea;">200 x 10⁶ м</span>
          </div>
        </div>
        <div id="grav-force-data" style="margin-top: 1.5rem; text-align: center; color: #6b21a8; font-size: 1.5rem; font-weight: 900; background: white; padding: 1rem; border-radius: 12px; border: 2px solid #e9d5ff;">
           Тартылыс күші (F): 1.67 x 10¹⁸ Н
        </div>
      </div>
    </div>
  `;
}

function updateGravityValue(prop, val) {
  gravityLabState[prop] = parseFloat(val);
  if (prop === 'm1') document.getElementById('grav-m1').innerText = `${val} x 10²⁴ кг`;
  if (prop === 'm2') document.getElementById('grav-m2').innerText = `${val} x 10²⁴ кг`;
  if (prop === 'dist') document.getElementById('grav-dist').innerText = `${val} x 10⁶ м`;

  const F = (6.67 * gravityLabState.m1 * gravityLabState.m2) / (gravityLabState.dist * gravityLabState.dist);
  document.getElementById('grav-force-data').innerText = `Тартылыс күші (F) = ${F.toFixed(2)} x 10¹⁸ Н`;
  updateGravitySim();
}

function updateGravitySim() {
  const stage = document.getElementById('gravity-sim-stage');
  if (!stage) return;

  const mid = 400;
  const d = gravityLabState.dist / 2;
  const r1 = 15 + gravityLabState.m1 / 20;
  const r2 = 15 + gravityLabState.m2 / 20;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 350">
      <!-- Star background -->
      ${Array.from({ length: 50 }).map(() => `
        <circle cx="${Math.random() * 800}" cy="${Math.random() * 350}" r="${Math.random() * 1.5}" fill="white" opacity="${Math.random()}" />
      `).join('')}

      <!-- Planet 1 -->
      <g transform="translate(${mid - d}, 175)">
        <circle r="${r1}" fill="url(#grad1)" />
        <defs>
          <radialGradient id="grad1">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </radialGradient>
        </defs>
      </g>

      <!-- Planet 2 -->
      <g transform="translate(${mid + d}, 175)">
        <circle r="${r2}" fill="url(#grad2)" />
        <defs>
          <radialGradient id="grad2">
            <stop offset="0%" stop-color="#ec4899" />
            <stop offset="100%" stop-color="#be185d" />
          </radialGradient>
        </defs>
      </g>

      <!-- Force Arrows -->
      <path d="M ${mid - d + r1 + 5} 175 L ${mid - d + r1 + 40} 175 M ${mid - d + r1 + 40} 175 L ${mid - d + r1 + 30} 165 M ${mid - d + r1 + 40} 175 L ${mid - d + r1 + 30} 185" stroke="#facc15" stroke-width="3" />
      <path d="M ${mid + d - r2 - 5} 175 L ${mid + d - r2 - 40} 175 M ${mid + d - r2 - 40} 175 L ${mid + d - r2 - 30} 165 M ${mid + d - r2 - 40} 175 L ${mid + d - r2 - 30} 185" stroke="#facc15" stroke-width="3" />
    </svg>
  `;
}


// Density Lab State
let densityLabState = {
  material: 'gold',
  mass: 193, // grams
  volume: 10, // cm3
  isSubmerged: false
};

const densityData = {
  gold: { density: 19.3, color: '#facc15', name: 'Алтын' },
  iron: { density: 7.8, color: '#94a3b8', name: 'Темір' },
  wood: { density: 0.7, color: '#b45309', name: 'Ағаш' },
  aluminum: { density: 2.7, color: '#cbd5e1', name: 'Алюминий' }
};

function renderDensityLab() {
  setTimeout(() => {
    updateDensitySim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="glass-panel animate-scale-in" style="padding: 2rem; margin-top: 1rem; border-radius: 32px; border: 1px solid var(--border-glass); background: white;">
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; margin-bottom: 2rem; background: #eff6ff; padding: 2rem; border-radius: 24px; border: 1.5px solid #dbeafe;">
        <div>
          <h3 style="color: #1e40af; font-size: 1.5rem; margin-bottom: 1rem; font-weight: 800;">№8: Заттың тығыздығы</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong style="color: #1e3a8a;">Мақсаты:</strong> Заттың массасы мен көлемін өлшеу арқылы оның тығыздығын анықтау.</p>
          <div style="background: white; padding: 1rem; border-radius: 12px; border: 1.5px solid #bfdbfe; margin-top: 1rem;">
             <code style="font-size: 1.8rem; font-weight: 900; color: #3b82f6;">ρ = m / V</code>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.6); padding: 1.5rem; border-radius: 16px; border: 1px solid #dbeafe;">
          <h4 style="font-weight: 800; color: #1e40af; margin-bottom: 0.8rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 0.95rem; line-height: 1.6; color: #1e3a8a; padding-left: 1.2rem;">
            <li>Зерттелетін материалды таңдаңыз.</li>
            <li>Материалды суға батырып, көлемін анықтаңыз (ығыстырылған су).</li>
            <li>Массаны көлемге бөліп, тығыздығын есептеңіз.</li>
          </ol>
        </div>
      </div>

      <div id="density-sim-stage" style="height: 350px; background: #f8fafc; border-radius: 24px; border: 2px solid #e2e8f0; margin-bottom: 2rem; position: relative;">
         <!-- SVG -->
      </div>

      <div class="glass-panel" style="padding: 2rem; background: #eff6ff; border-radius: 24px;">
        <div class="grid gap-8" style="grid-template-columns: 1fr 1fr 1fr;">
          <div class="flex flex-col gap-3">
            <span class="label-caps" style="font-weight: 800; color: #1e40af;">Материал:</span>
            <select onchange="updateDensityValue('material', this.value)" style="padding: 0.8rem; border-radius: 12px; border: 2px solid #bfdbfe; font-weight: 700;">
              <option value="gold">Алтын</option>
              <option value="iron">Темір</option>
              <option value="wood">Ағаш</option>
              <option value="aluminum">Алюминий</option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <span class="label-caps" style="font-weight: 800; color: #1e40af;">Көлем (V):</span>
            <input type="range" min="5" max="50" value="10" oninput="updateDensityValue('volume', this.value)" style="width: 100%;">
            <span id="dens-v-val" style="font-weight: 800; color: #3b82f6;">10 см³</span>
          </div>
          <div class="flex flex-col gap-2">
             <div id="dens-m-val" style="font-weight: 900; color: #1e3a8a; font-size: 1.2rem; text-align: center; background: white; padding: 1rem; border-radius: 12px; border: 2px solid #bfdbfe;">
                m = 193 г
             </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateDensityValue(prop, val) {
  if (prop === 'material') densityLabState.material = val;
  if (prop === 'volume') densityLabState.volume = parseFloat(val);

  const d = densityData[densityLabState.material].density;
  densityLabState.mass = (d * densityLabState.volume).toFixed(1);

  const mVal = document.getElementById('dens-m-val');
  if (mVal) mVal.innerText = `m = ${densityLabState.mass} г`;
  const vVal = document.getElementById('dens-v-val');
  if (vVal) vVal.innerText = `${densityLabState.volume} см³`;

  updateDensitySim();
}

function updateDensitySim() {
  const stage = document.getElementById('density-sim-stage');
  if (!stage) return;

  const mat = densityData[densityLabState.material];
  const size = Math.pow(densityLabState.volume, 1 / 3) * 20;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 350">
      <!-- Water Tank -->
      <rect x="300" y="100" width="200" height="200" fill="#bae6fd" opacity="0.6" stroke="#0ea5e9" stroke-width="2" />
      <text x="400" y="320" text-anchor="middle" font-weight="800" fill="#0369a1">Су (V₀ = 500 мл)</text>
      
      <!-- Overflow sprout -->
      <path d="M 500 120 L 530 120 L 530 250" fill="none" stroke="#0ea5e9" stroke-width="8" stroke-linecap="round" />
      
      <!-- Measuring cup -->
      <rect x="510" y="250" width="40" height="50" fill="#bae6fd" opacity="0.6" stroke="#0ea5e9" stroke-width="2" />
      <text x="530" y="315" text-anchor="middle" font-size="10" fill="#0369a1">Төгілген: ${densityLabState.volume} мл</text>

      <!-- Object -->
      <rect x="${400 - size / 2}" y="${220 - size}" width="${size}" height="${size}" fill="${mat.color}" rx="4" stroke="rgba(0,0,0,0.1)" />
      <text x="400" y="${220 - size - 10}" text-anchor="middle" font-size="12" font-weight="900" fill="${mat.color}">${mat.name}</text>
    </svg>
  `;
}

// Pressure Lab State
let pressureLabState = {
  force: 50,
  area: 1 // 1: small, 2: medium, 3: large
};

function renderPressureLab() {
  setTimeout(() => {
    updatePressureSim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="glass-panel animate-scale-in" style="padding: 2rem; margin-top: 1rem; border-radius: 32px; border: 1px solid var(--border-glass); background: white;">
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; margin-bottom: 2rem; background: #fff7ed; padding: 2rem; border-radius: 24px; border: 1.5px solid #ffedd5;">
        <div>
          <h3 style="color: #9a3412; font-size: 1.5rem; margin-bottom: 1rem; font-weight: 800;">№9: Қысымды зерттеу</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong style="color: #7c2d12;">Мақсаты:</strong> Күш пен ауданның қысымға (батыру тереңдігіне) әсерін бақылау.</p>
          <div style="background: white; padding: 1rem; border-radius: 12px; border: 1.5px solid #fed7aa; margin-top: 1rem;">
             <code style="font-size: 1.8rem; font-weight: 900; color: #f97316;">p = F / S</code>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.6); padding: 1.5rem; border-radius: 16px; border: 1px solid #ffedd5;">
          <h4 style="font-weight: 800; color: #9a3412; margin-bottom: 0.8rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 0.95rem; line-height: 1.6; color: #7c2d12; padding-left: 1.2rem;">
            <li>Денеге түсетін күшті (салмақты) өзгертіңіз.</li>
            <li>Дененің жағын өзгертіп, тіреу ауданын реттеңіз.</li>
            <li>Құмға бату тереңдігін бақылаңыз.</li>
          </ol>
        </div>
      </div>

      <div id="pressure-sim-stage" style="height: 300px; background: #fef3c7; border-radius: 24px; border: 2px solid #fde68a; margin-bottom: 2rem; position: relative; overflow: hidden;">
         <!-- SVG sand -->
      </div>

      <div class="glass-panel" style="padding: 2rem; background: #fff7ed; border-radius: 24px;">
        <div class="grid gap-8" style="grid-template-columns: 1fr 1fr;">
          <div class="flex flex-col gap-2">
            <span class="label-caps" style="font-weight: 800; color: #9a3412;">Күш (F):</span>
            <input type="range" min="10" max="100" value="50" oninput="updatePressureValue('force', this.value)" style="width: 100%;">
            <span id="pres-f-val" style="font-weight: 800; color: #f97316;">50 Н</span>
          </div>
          <div class="flex flex-col gap-3">
            <span class="label-caps" style="font-weight: 800; color: #9a3412;">Тіреу ауданы (S):</span>
            <div class="flex gap-2">
               <button class="lab-btn ${pressureLabState.area === 0.5 ? 'active' : ''}" onclick="updatePressureValue('area', 0.5)">Кіші (2 см²)</button>
               <button class="lab-btn ${pressureLabState.area === 1 ? 'active' : ''}" onclick="updatePressureValue('area', 1)">Орташа (4 см²)</button>
               <button class="lab-btn ${pressureLabState.area === 2 ? 'active' : ''}" onclick="updatePressureValue('area', 2)">Үлкен (8 см²)</button>
            </div>
          </div>
        </div>
        <div id="pres-data" style="margin-top: 1.5rem; text-align: center; color: #9a3412; font-size: 1.4rem; font-weight: 900;">
           Паскаль: 50.0 Кра (Н/см²)
        </div>
      </div>
    </div>
  `;
}

function updatePressureValue(prop, val) {
  pressureLabState[prop] = parseFloat(val);
  if (prop === 'force') document.getElementById('pres-f-val').innerText = `${val} Н`;

  const p = pressureLabState.force / pressureLabState.area;
  const pData = document.getElementById('pres-data');
  if (pData) pData.innerText = `Қысым (P) = F / S = ${p.toFixed(1)} Н/см²`;

  updatePressureSim();
}

function updatePressureSim() {
  const stage = document.getElementById('pressure-sim-stage');
  if (!stage) return;

  const p = pressureLabState.force / pressureLabState.area;
  const depth = (p / 20) * 30; // Scale pressure to sinking depth
  const w = 40 * pressureLabState.area;
  const h = 80 / pressureLabState.area;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 300">
      <!-- Sand -->
      <rect x="0" y="200" width="800" height="100" fill="#fde68a" />
      <path d="M 0 200 Q 400 ${200 + depth / 2} 800 200" fill="#fde68a" stroke="#f59e0b" stroke-width="2" />
      
      <!-- Sinking Block -->
      <rect x="${400 - w / 2}" y="${200 + depth - h}" width="${w}" height="${h}" fill="#92400e" rx="2" />
      <text x="400" y="${200 + depth - h - 10}" text-anchor="middle" font-size="12" font-weight="900" fill="#78350f">Блок</text>
    </svg>
  `;
}

// Archimedes Lab State
let archiLabState = {
  liquid: 'water',
  vol: 100, // cm3
  isSubmerged: false
};

const liquidData = {
  water: { d: 1000, name: 'Су', color: '#bae6fd' },
  oil: { d: 800, name: 'Май', color: '#fef08a' },
  mercury: { d: 13600, name: 'Сынап', color: '#94a3b8' }
};

function renderArchimedesLab() {
  setTimeout(() => {
    updateArchiSim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="glass-panel animate-scale-in" style="padding: 2rem; margin-top: 1rem; border-radius: 32px; border: 1px solid var(--border-glass); background: white;">
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; margin-bottom: 2rem; background: #f0fdfa; padding: 2rem; border-radius: 24px; border: 1.5px solid #ccfbf1;">
        <div>
          <h3 style="color: #0d9488; font-size: 1.5rem; margin-bottom: 1rem; font-weight: 800;">№10: Архимед заңы</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong style="color: #0f766e;">Мақсаты:</strong> Кері итеруші күштің сұйық тығыздығы мен дене көлеміне тәуелділігін зерделеу.</p>
          <div style="background: white; padding: 1rem; border-radius: 12px; border: 1.5px solid #99f6e4; margin-top: 1rem;">
             <code style="font-size: 1.8rem; font-weight: 900; color: #0d9488;">F_А = ρ · g · V</code>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.6); padding: 1.5rem; border-radius: 16px; border: 1px solid #ccfbf1;">
          <h4 style="font-weight: 800; color: #0d9488; margin-bottom: 0.8rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 0.95rem; line-height: 1.6; color: #0f766e; padding-left: 1.2rem;">
            <li>Сұйықтың түрін таңдаңыз.</li>
            <li>Дененің батқан көлемін реттеңіз.</li>
            <li>Динамометр арқылы Архимед күшін өлшеңіз.</li>
          </ol>
        </div>
      </div>

      <div id="archi-sim-stage" style="height: 350px; background: #f8fafc; border-radius: 24px; border: 2px solid #e2e8f0; margin-bottom: 2rem; position: relative;">
         <!-- SVG -->
      </div>

      <div class="glass-panel" style="padding: 2rem; background: #f0fdfa; border-radius: 24px;">
        <div class="grid gap-8" style="grid-template-columns: 1fr 1fr 120px;">
          <div class="flex flex-col gap-3">
            <span class="label-caps" style="font-weight: 800; color: #0d9488;">Сұйық:</span>
            <select onchange="updateArchiValue('liquid', this.value)" style="padding: 0.8rem; border-radius: 12px; border: 2px solid #99f6e4; font-weight: 700;">
              <option value="water">Су</option>
              <option value="oil">Май</option>
              <option value="mercury">Сынап</option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <span class="label-caps" style="font-weight: 800; color: #0d9488;">Батқан көлем ($V_б$):</span>
            <input type="range" min="0" max="200" value="100" oninput="updateArchiValue('vol', this.value)" style="width: 100%;">
            <span id="archi-v-val" style="font-weight: 800; color: #0d9488;">100 см³</span>
          </div>
          <div class="flex flex-col items-center justify-center">
             <button class="btn-primary" onclick="toggleArchiSubmerge()" style="padding: 0.8rem; border-radius: 12px; background: #0d9488;">
                БАТЫРУ
             </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateArchiValue(prop, val) {
  if (prop === 'liquid') archiLabState.liquid = val;
  if (prop === 'vol') archiLabState.vol = parseFloat(val);

  const vLabel = document.getElementById('archi-v-val');
  if (vLabel) vLabel.innerText = `${archiLabState.vol} см³`;

  updateArchiSim();
}

function updateArchiSim() {
  const stage = document.getElementById('archi-sim-stage');
  if (!stage) return;

  const liq = liquidData[archiLabState.liquid];
  const g = 10;
  // Fa = rho * g * V (convert cm3 to m3: V/1000000)
  const Fa = (liq.d * g * archiLabState.vol) / 1000000;

  const weightInAir = 5; // 5 Newtons
  const weightInLiquid = archiLabState.isSubmerged ? (weightInAir - Fa) : weightInAir;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 350">
      <!-- Tank -->
      <rect x="300" y="150" width="200" height="150" fill="${liq.color}" opacity="0.6" stroke="${liq.color}" stroke-dasharray="0" stroke-width="2" />
      <text x="400" y="320" text-anchor="middle" font-weight="800" fill="#134e4a">${liq.name}</text>

      <!-- Spring Scale -->
      <g transform="translate(400, 50)">
         <rect x="-15" y="0" width="30" height="80" fill="#cbd5e1" rx="4" />
         <line x1="0" y1="80" x2="0" y2="${80 + weightInLiquid * 20}" stroke="#475569" stroke-width="2" />
         <rect x="-20" y="${80 + weightInLiquid * 20}" width="40" height="40" rx="4" fill="#134e4a" />
         <text x="0" y="-10" text-anchor="middle" font-weight="900" fill="#0d9488">F = ${weightInLiquid.toFixed(2)} Н</text>
         ${archiLabState.isSubmerged ? `<text x="50" y="100" font-weight="800" fill="#0d9488">F_А = ${Fa.toFixed(2)} Н</text>` : ''}
      </g>
    </svg>
  `;
}

function toggleArchiSubmerge() {
  archiLabState.isSubmerged = !archiLabState.isSubmerged;
  updateArchiSim();
}


function updateNewton1Value(prop, val) {
  if (prop === 'v0') {
    newton1LabState.v0 = parseFloat(val);
    document.getElementById('n1-v0-val').innerText = `${val} м/с`;
  } else if (prop === 'surface') {
    newton1LabState.surface = val;
    newton1LabState.friction = val === 'ice' ? 0.05 : val === 'grass' ? 0.3 : 0.6;
  }
  updateNewton1Sim();
}

function updateNewton1Sim() {
  const stage = document.getElementById('newton1-sim-stage');
  if (!stage) return;

  let surfaceColor = newton1LabState.surface === 'ice' ? '#e0f2fe' : newton1LabState.surface === 'grass' ? '#dcfce7' : '#f1f5f9';

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 300">
      <rect x="0" y="220" width="800" height="80" fill="${surfaceColor}" />
      <line x1="0" y1="220" x2="800" y2="220" stroke="#94a3b8" stroke-width="2" />
      
      <!-- Ground markings -->
      ${[0, 100, 200, 300, 400, 500, 600, 700, 800].map(x => `
        <line x1="${x}" y1="220" x2="${x}" y2="235" stroke="#94a3b8" stroke-width="1" />
        <text x="${x + 5}" y="245" font-size="10" fill="#94a3b8">${x / 10} м</text>
      `).join('')}

      <g id="n1-car" transform="translate(50, 180)">
         <rect x="0" y="0" width="60" height="30" rx="5" fill="#9a3412" />
         <circle cx="15" cy="40" r="8" fill="#1e293b" />
         <circle cx="45" cy="40" r="8" fill="#1e293b" />
      </g>
    </svg>
  `;
}

function startNewton1Anim() {
  if (newton1LabState.isMoving) return;
  newton1LabState.isMoving = true;
  document.getElementById('n1-start-btn').disabled = true;

  const car = document.getElementById('n1-car');
  let x = 50;
  let v = newton1LabState.v0;
  const a = -9.8 * newton1LabState.friction; // deceleration

  function step() {
    v += a * 0.016; // 60fps
    if (v <= 0) {
      newton1LabState.isMoving = false;
      document.getElementById('n1-start-btn').disabled = false;
      if (window.triggerSalute && v < 0.1) triggerSalute();
      return;
    }
    x += v;
    if (x > 740) {
      newton1LabState.isMoving = false;
      document.getElementById('n1-start-btn').disabled = false;
      return;
    }
    car.setAttribute('transform', `translate(${x}, 180)`);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Newton 2 Lab State
let newton2LabState = {
  force: 10,
  mass: 2,
  isMoving: false
};

function renderNewton2Lab() {
  setTimeout(() => {
    updateNewton2Sim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="glass-panel animate-scale-in" style="padding: 2rem; margin-top: 1rem; border-radius: 32px; border: 1px solid var(--border-glass); background: white;">
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; margin-bottom: 2rem; background: #ecfdf5; padding: 2rem; border-radius: 24px; border: 1.5px solid #d1fae5;">
        <div>
          <h3 style="color: #065f46; font-size: 1.5rem; margin-bottom: 1rem; font-weight: 800;">№5: Ньютонның 2-заңы</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong style="color: #064e3b;">Мақсаты:</strong> Күш, масса және үдеу арасындағы байланысты зерттеу (F = ma).</p>
          <div style="background: white; padding: 1rem; border-radius: 12px; border: 1.5px solid #a7f3d0; margin-top: 1rem;">
             <code style="font-size: 1.5rem; font-weight: 900; color: #059669;">a = F / m</code>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.6); padding: 1.5rem; border-radius: 16px; border: 1px solid #d1fae5;">
          <h4 style="font-weight: 800; color: #065f46; margin-bottom: 0.8rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 0.95rem; line-height: 1.6; color: #064e3b; padding-left: 1.2rem;">
            <li>Дененің массасын және түсірілген күшті таңдаңыз.</li>
            <li>"БАСТАУ" басып, қозғалыс үдеуін бақылаңыз.</li>
            <li>Үдеудің қалай өзгеретінін есептеп, заңдылықты табыңыз.</li>
          </ol>
        </div>
      </div>

      <div id="newton2-sim-stage" style="height: 300px; background: #f8fafc; border-radius: 24px; border: 2px solid #e2e8f0; margin-bottom: 2rem; position: relative; overflow: hidden;">
         <!-- SVG -->
      </div>

      <div class="glass-panel" style="padding: 2rem; background: #ecfdf5; border-radius: 24px;">
        <div class="grid gap-8" style="grid-template-columns: 1fr 1fr 1fr;">
          <div class="flex flex-col gap-2">
            <span class="label-caps" style="font-weight: 800; color: #065f46;">Күш (F):</span>
            <input type="range" min="1" max="50" value="10" oninput="updateNewton2Value('force', this.value)" style="width: 100%;">
            <span id="n2-force-val" style="font-weight: 800; color: #059669;">10 Н</span>
          </div>
          <div class="flex flex-col gap-2">
            <span class="label-caps" style="font-weight: 800; color: #065f46;">Масса (m):</span>
            <input type="range" min="1" max="10" value="2" oninput="updateNewton2Value('mass', this.value)" style="width: 100%;">
            <span id="n2-mass-val" style="font-weight: 800; color: #059669;">2 кг</span>
          </div>
          <button class="btn-primary" onclick="startNewton2Anim()" id="n2-start-btn" style="background: #059669; border-radius: 12px; padding: 1rem;">
             БАСТАУ
          </button>
        </div>
        <div id="n2-data" style="margin-top: 1rem; text-align: center; font-weight: 800; color: #064e3b; font-size: 1.2rem;">
           Үдеу (a): 5.00 м/с²
        </div>
      </div>
    </div>
  `;
}

function updateNewton2Value(prop, val) {
  newton2LabState[prop] = parseFloat(val);
  if (prop === 'force') document.getElementById('n2-force-val').innerText = `${val} Н`;
  if (prop === 'mass') document.getElementById('n2-mass-val').innerText = `${val} кг`;

  const a = newton2LabState.force / newton2LabState.mass;
  document.getElementById('n2-data').innerText = `Үдеу (a) = F / m = ${a.toFixed(2)} м/с²`;
  updateNewton2Sim();
}

function updateNewton2Sim() {
  const stage = document.getElementById('newton2-sim-stage');
  if (!stage) return;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 300">
      <rect x="0" y="220" width="800" height="80" fill="#f8fafc" />
      <line x1="0" y1="220" x2="800" y2="220" stroke="#94a3b8" stroke-width="2" />
      
      <g id="n2-block" transform="translate(100, 170)">
         <rect x="0" y="0" width="80" height="50" rx="4" fill="#059669" />
         <text x="40" y="30" text-anchor="middle" fill="white" font-weight="900">${newton2LabState.mass} кг</text>
         
         <!-- Force Arrow -->
         <path d="M 85 25 L 125 25 M 125 25 L 115 15 M 125 25 L 115 35" stroke="#ef4444" stroke-width="3" />
         <text x="130" y="20" fill="#ef4444" font-weight="900">${newton2LabState.force} Н</text>
      </g>
    </svg>
  `;
}

function startNewton2Anim() {
  if (newton2LabState.isMoving) return;
  newton2LabState.isMoving = true;
  document.getElementById('n2-start-btn').disabled = true;

  const block = document.getElementById('n2-block');
  let x = 100;
  let v = 0;
  const a = newton2LabState.force / newton2LabState.mass;

  function step() {
    v += a * 0.016;
    x += v;
    if (x > 700) {
      newton2LabState.isMoving = false;
      document.getElementById('n2-start-btn').disabled = false;
      if (window.triggerSalute) triggerSalute();
      return;
    }
    block.setAttribute('transform', `translate(${x}, 170)`);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);


}

const hookeLabState = {
  mass: 0.5,
  k: 50,
  isSolvedF: false,
  isSolvedX: false,
  feedbackF: '',
  feedbackX: ''
}


function renderHookeLab() {
  setTimeout(() => {
    updateHookeSim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="animate-scale-in" style="padding: 1rem;">
      <!-- Lab Report Header -->
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; margin-bottom: 2rem; background: #f0fdf4; padding: 2rem; border-radius: 28px; border: 1.5px solid #dcfce7;">
        <div>
          <h3 style="color: #166534; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">Гук заңын зерттеу</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #14532d;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Тәжірибе арқылы серпімділік күшінің ұзаруға тәуелділігін зерделеу және қатаңдықты анықтау.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #bbf7d0; margin-top: 1rem;">
             <p style="font-weight: 800; color: #166534; margin-bottom: 8px;" class="label-caps">Формула:</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #14532d; font-family: 'Outfit', sans-serif;">F<sub>серп</sub> = k · |x|</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #dcfce7;">
          <h4 style="font-weight: 800; color: #166534; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="list-checks" size="20"></i> Жұмыс барысы:
          </h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #14532d; padding-left: 1.2rem; font-weight: 600;">
            <li>Слайдерлер арқылы жүктің массасын ($m$) және қатаңдықты ($k$) таңдаңыз.</li>
            <li><strong>1-қадам (Тепе-теңдік):</strong> Ауырлық күшіне тең серпімділік күшін есептеңіз ($F = mg$).</li>
            <li><strong>2-қадам (Гук заңы):</strong> Есептелген күш пен қатаңдықты қолданып, ұзаруды табыңыз ($x = F/k$).</li>
            <li>Сызғыштағы көрсеткіштің сіздің есебіңізбен сәйкес келетінін тексеріңіз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: 1fr 340px; gap: 2.5rem;">
        <!-- Simulation Area -->
        <div class="flex flex-col gap-6">
          <div id="hooke-sim-stage" style="height: 440px; background: white; border-radius: 32px; border: 1px solid var(--border-glass); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
             <!-- SVG Spring injected here -->
          </div>
          
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 24px;">
             <div class="grid grid-cols-2 gap-8">
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: var(--text-secondary); font-size: 0.8rem;">Жүк массасы (m):</span>
                 <input type="range" min="0.1" max="1.0" step="0.1" value="${hookeLabState.mass}" oninput="updateHookeValues('mass', this.value)" style="width: 100%;">
                 <div class="flex justify-between font-bold" style="color: var(--accent-cyan);">
                   <span>0.1 кг</span>
                   <span id="hooke-mass-val">${hookeLabState.mass} кг</span>
                   <span>1.0 кг</span>
                 </div>
               </div>
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: var(--text-secondary); font-size: 0.8rem;">Қатаңдық (k):</span>
                 <input type="range" min="10" max="100" step="5" value="${hookeLabState.k}" oninput="updateHookeValues('k', this.value)" style="width: 100%;">
                 <div class="flex justify-between font-bold" style="color: var(--accent-purple);">
                   <span>10 Н/м</span>
                   <span id="hooke-k-val">${hookeLabState.k} Н/м</span>
                   <span>100 Н/м</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

        <!-- Calculation Side -->
        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #22c55e; border-radius: 28px;">
            <h4 class="v-center gap-2" style="font-weight: 900; color: #166534; margin-bottom: 2rem; font-size: 1.1rem;">
              <i data-lucide="calculator" size="20" style="color: #22c55e;"></i> 1. КҮШТІ ЕСЕПТЕУ (mg)
            </h4>

            <div class="flex flex-col gap-4">
               <div class="flex justify-between items-center" style="padding: 0.8rem; background: #f0fdf4; border-radius: 12px;">
                 <span style="font-weight: 700; color: #166534;">Масса (m):</span>
                 <span id="hooke-calc-mass" style="font-weight: 900; color: #15803d;">${hookeLabState.mass} кг</span>
               </div>
               
               <div style="padding: 1.2rem; background: #f0fdf4; border-radius: 20px; border: 2px solid #dcfce7; text-align: center;">
                 <p style="font-weight: 800; color: #166534; font-size: 0.8rem; margin-bottom: 0.5rem;" class="label-caps">Серпімділік күші (F = mg):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="hooke-calc-f" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #bbf7d0; font-size: 1.2rem; font-weight: 900; text-align: center; color: #15803d;" ${hookeLabState.isSolvedF ? 'disabled' : ''}>
                    <span style="font-size: 1.2rem; font-weight: 900; color: #166534;">Н</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; padding: 0.8rem; border-radius: 12px; background: #22c55e;" onclick="checkHookeCalculation('F')" ${hookeLabState.isSolvedF ? 'disabled' : ''}>
                   ${hookeLabState.isSolvedF ? 'ДҰРЫС' : 'ТЕКСЕРУ'}
                 </button>
               </div>
               <div id="hooke-feedback-f">${hookeLabState.feedbackF}</div>
            </div>
          </div>

          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #3b82f6; border-radius: 28px;">
            <h4 class="v-center gap-2" style="font-weight: 900; color: #1e40af; margin-bottom: 2rem; font-size: 1.1rem;">
              <i data-lucide="gauge" size="20" style="color: #3b82f6;"></i> 2. ҰЗАРУДЫ ТАБУ (F/k)
            </h4>

            <div class="flex flex-col gap-4">
               <div class="flex justify-between items-center" style="padding: 0.8rem; background: #eff6ff; border-radius: 12px;">
                 <span style="font-weight: 700; color: #1e40af;">Қатаңдық (k):</span>
                 <span style="font-weight: 900; color: #1d4ed8;">${hookeLabState.k} Н/м</span>
               </div>
               
               <div style="padding: 1.2rem; background: #eff6ff; border-radius: 20px; border: 2px solid #bfdbfe; text-align: center;">
                 <p style="font-weight: 800; color: #1e40af; font-size: 0.8rem; margin-bottom: 0.5rem;" class="label-caps">Ұзару (x = F/k):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="hooke-calc-x" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #93c5fd; font-size: 1.2rem; font-weight: 900; text-align: center; color: #1d4ed8;" ${hookeLabState.isSolvedX ? 'disabled' : ''}>
                    <span style="font-size: 1.2rem; font-weight: 900; color: #1e40af;">см</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; padding: 0.8rem; border-radius: 12px; background: #3b82f6;" onclick="checkHookeCalculation('X')" ${hookeLabState.isSolvedX ? 'disabled' : ''}>
                   ${hookeLabState.isSolvedX ? 'ДҰРЫС' : 'ТЕКСЕРУ'}
                 </button>
               </div>
               <div id="hooke-feedback-x">${hookeLabState.feedbackX}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateHookeValues(prop, val) {
  hookeLabState[prop] = parseFloat(val);
  hookeLabState.isSolvedF = false;
  hookeLabState.isSolvedX = false;
  hookeLabState.feedbackF = '';
  hookeLabState.feedbackX = '';

  // Partial update UI for smoothness
  const massVal = document.getElementById('hooke-mass-val');
  const kVal = document.getElementById('hooke-k-val');
  const calcMass = document.getElementById('hooke-calc-mass');
  const feedbackF = document.getElementById('hooke-feedback-f');
  const feedbackX = document.getElementById('hooke-feedback-x');

  if (massVal) massVal.innerText = `${hookeLabState.mass} кг`;
  if (kVal) kVal.innerText = `${hookeLabState.k} Н/м`;
  if (calcMass) calcMass.innerText = `${hookeLabState.mass} кг`;
  if (feedbackF) feedbackF.innerHTML = '';
  if (feedbackX) feedbackX.innerHTML = '';

  // Reset inputs and buttons
  const inputF = document.getElementById('hooke-calc-f');
  const inputX = document.getElementById('hooke-calc-x');
  const btnF = document.querySelector('[onclick="checkHookeCalculation(\'F\')"]');
  const btnX = document.querySelector('[onclick="checkHookeCalculation(\'X\')"]');

  if (inputF) { inputF.disabled = false; inputF.value = ''; }
  if (inputX) { inputX.disabled = false; inputX.value = ''; }
  if (btnF) { btnF.disabled = false; btnF.innerText = 'ТЕКСЕРУ'; }
  if (btnX) { btnX.disabled = false; btnX.innerText = 'ТЕКСЕРУ'; }

  updateHookeSim();
}

function checkHookeCalculation(type) {
  if (type === 'F') {
    const input = document.getElementById('hooke-calc-f');
    const feedbackBox = document.getElementById('hooke-feedback-f');
    const btn = document.querySelector('[onclick="checkHookeCalculation(\'F\')"]');
    if (!input || !feedbackBox) return;

    const userVal = parseFloat(input.value);
    const correctVal = hookeLabState.mass * 10;
    if (Math.abs(userVal - correctVal) < 0.1) {
      hookeLabState.isSolvedF = true;
      hookeLabState.feedbackF = `<div class="animate-scale-in" style="color: #22c55e; font-weight: 700; margin-top: 0.5rem;">Жарайсың! Күш дұрыс.</div>`;
      if (window.playSound) playSound('correct');
      feedbackBox.innerHTML = hookeLabState.feedbackF;
      input.disabled = true;
      if (btn) { btn.disabled = true; btn.innerText = 'ДҰРЫС'; }
    } else {
      if (window.playSound) playSound('wrong');
      feedbackBox.innerHTML = `<div style="color: #ef4444; font-size: 0.8rem; margin-top: 0.5rem;">Қате. F = mg формуласын қолдан.</div>`;
    }
  } else if (type === 'X') {
    const input = document.getElementById('hooke-calc-x');
    const feedbackBox = document.getElementById('hooke-feedback-x');
    const btn = document.querySelector('[onclick="checkHookeCalculation(\'X\')"]');
    if (!input || !feedbackBox) return;

    const userVal = parseFloat(input.value);
    const F = hookeLabState.mass * 10;
    const correctVal = (F / hookeLabState.k) * 100; // in cm

    if (Math.abs(userVal - correctVal) < 0.5) {
      hookeLabState.isSolvedX = true;
      hookeLabState.feedbackX = `<div class="animate-scale-in" style="color: #3b82f6; font-weight: 700; margin-top: 0.5rem;">Керемет! Ұзару дәл табылды.</div>`;
      if (window.playSound) playSound('correct');
      if (window.triggerSalute) triggerSalute();
      feedbackBox.innerHTML = hookeLabState.feedbackX;
      input.disabled = true;
      if (btn) { btn.disabled = true; btn.innerText = 'ДҰРЫС'; }
    } else {
      if (window.playSound) playSound('wrong');
      feedbackBox.innerHTML = `<div style="color: #ef4444; font-size: 0.8rem; margin-top: 0.5rem;">Қате. x = F / k формуласын қолдан. Нәтижені см-ге айналдыр.</div>`;
    }
  }
  if (window.lucide) lucide.createIcons();
}

function updateHookeSim() {
  const stage = document.getElementById('hooke-sim-stage');
  if (!stage) return;

  const m = hookeLabState.mass;
  const k = hookeLabState.k;
  const g = 10;
  const stretch = (m * g / k) * 1000; // 1000px per meter (0.1m = 100px)
  const springHeight = 80 + stretch;
  const weightSize = 40 + (m * 20);

  stage.innerHTML = `
    <svg class="lab-svg" width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">

      <defs>
        <linearGradient id="springGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#94a3b8" />
          <stop offset="50%" style="stop-color:#e2e8f0" />
          <stop offset="100%" style="stop-color:#94a3b8" />
        </linearGradient>
      </defs>

      <!-- Ceiling -->
      <rect x="100" y="30" width="200" height="15" fill="#334155" rx="4" />
      
      <!-- Support -->
      <line x1="200" y1="45" x2="200" y2="60" stroke="#334155" stroke-width="4" />

      <!-- Spring (Zigzag) -->
      <g transform="translate(200, 60)">
        <path d="${generateSpringPath(springHeight)}" fill="none" stroke="url(#springGrad)" stroke-width="4" stroke-linejoin="round" />
        
        <!-- Load (Weight) -->
        <g transform="translate(0, ${springHeight})">
           <path d="M 0 0 L 0 15" stroke="#334155" stroke-width="2" />
           <rect x="-${weightSize / 2}" y="15" width="${weightSize}" height="${weightSize}" rx="12" fill="#1e293b" />
           <text y="${15 + weightSize / 2 + 5}" text-anchor="middle" fill="white" font-size="14" font-weight="900">${m} кг</text>
        </g>
      </g>
      
      <!-- Ruler -->
      <g transform="translate(260, 60)">
        <line x1="0" y1="0" x2="0" y2="300" stroke="#94a3b8" stroke-width="2" />
        ${[0, 50, 100, 150, 200, 250, 300].map(y => `
          <line x1="0" y1="${y}" x2="10" y2="${y}" stroke="#94a3b8" stroke-width="2" />
          <text x="15" y="${y + 5}" font-size="10" fill="#94a3b8">${y / 10} см</text>
        `).join('')}
      </g>
    </svg>
  `;
}

function generateSpringPath(height) {
  const turns = 15;
  const radius = 20;
  const step = height / turns;
  let p = "M 0 0";
  for (let i = 0; i < turns; i++) {
    p += ` L ${radius} ${i * step + step / 4} L ${-radius} ${i * step + 3 * step / 4} L 0 ${i * step + step}`;
  }
  return p;
}

const physicsKnowledgeBase = {
  'ньютон': 'Исаак Ньютон физиканың негізін қалаушылардың бірі. Оның 3 заңы бар:\n1. Инерция заңы: егер денеге күш әсер етпесе, ол тыныштықта болады.\n2. Динамика заңы: Күш үдеуге тура пропорционал: F = m·a.\n3. Әсер және қарсы әсер заңы: Әсер етуші күшке әрқашан тең және қарама-қарсы бағытталған қарсы әсер етуші күш болады.',
  'ом': 'Ом заңы: Тізбек бөлігіндегі ток күші кернеуге тура пропорционал және кедергіге кері пропорционал. Формуласы: I = U / R.',
  'энергия': 'Энергия — дененің жұмыс істеу қабілетін сипаттайтын шама. Негізгі түрлері: Кинетикалық (E = m·v²/2) және Потенциалдық (E = m·g·h). Энергия жоғалмайды, ол тек бір түрден екінші түрге айналады.',
  'паскаль': 'Паскаль заңы бойынша: Сұйыққа немесе газға түсірілген қысым барлық бағытқа өзгеріссіз беріледі. Өлшем бірлігі - Паскаль (Па).',
  'жылдамдық': 'Жылдамдық — дененің уақыт бірлігінде жүріп өткен жолын сипаттайды. Формуласы: v = s / t. Өлшем бірлігі: м/с.',
  'күш': 'Күш — денелердің өзара әрекеттесуін сипаттайтын шама. Ол векторлық шама болып табылады. Бірлігі — Ньютон (Н).',
  'масса': 'Масса — дененің инерттілігінің және гравитациялық әрекеттесуінің өлшемі. Негізгі бірлігі — килограмм (кг).',
  'қысым': 'Қысым — бетке перпендикуляр бағытта әсер ететін күштің сол беттің ауданына қатынасы. P = F / S.',
  'фотоэффект': 'Фотоэффект — жарық сәулелерінің әсерінен заттан электрондардың ұшып шығу құбылысы. Оны Эйнштейн 1905 жылы түсіндіріп берді.',
  'линза': 'Линза — жарық сәулелерін сындырып, кескін алуға мүмкіндік беретін мөлдір дене. Жинағыш және шашыратқыш болып бөлінеді.',
  'атом': 'Атом — заттың химиялық жағынан бөлінбейтін ең кіші бөлшегі. Ол оң зарядталған ядродан және теріс зарядталған электрондардан тұрады.',
  'электр': 'Электр тогы — зарядталған бөлшектердің реттелген қозғалысы. Ток күші Ампермен (А) өлшенеді.',
  'сәлем': 'Сәлем! Мен саған физиканы түсінуге көмектесетін AI ассистентпін. Қандай сұрағың бар?',
  'саламатсыз ба': 'Сәлеметсіз бе! Физика пәні бойынша қандай түсініксіз сұрақтар бар?',
  'рахмет': 'Оқасы жоқ! Физиканы үйренуде жетістіктер тілеймін!'
};

function initSnowfall() {
  const container = document.getElementById('snow-container');
  if (!container) return;

  const flakeCount = 50;
  for (let i = 0; i < flakeCount; i++) {
    const flake = document.createElement('div');
    flake.className = 'snowflake';

    // Randomize properties for a natural feel
    const size = Math.random() * 4 + 2 + 'px';
    const left = Math.random() * 100 + 'vw';
    const duration = Math.random() * 10 + 10 + 's';
    const delay = Math.random() * 20 + 's';
    const opacity = Math.random() * 0.5 + 0.3;

    flake.style.width = size;
    flake.style.height = size;
    flake.style.left = left;
    flake.style.animation = `snowfall ${duration} linear ${delay} infinite`;
    flake.style.opacity = opacity;

    container.appendChild(flake);
  }
}

// Initial state
window.onload = () => {
  if (state.view && state.view !== 'home') {
    navigate(state.view, false);
  } else {
    navigate('home', false);
  }
  initSnowfall();
};





// Calculator Logic
let calcCurrent = '0';

function pressCalc(btn) {
  const display = document.getElementById('calc-display');
  if (!display) return;

  if (btn === 'C') {
    calcCurrent = '0';
  } else if (btn === '=') {
    try {
      // Basic math evaluation
      let expression = calcCurrent.replace(/×/g, '*');
      // Using a safer evaluation method
      calcCurrent = eval(expression).toString();

      if (calcCurrent.length > 10) {
        calcCurrent = parseFloat(calcCurrent).toPrecision(8);
      }
    } catch (e) {
      calcCurrent = 'Қате';
    }
  } else {
    if (calcCurrent === '0' || calcCurrent === 'Қате') {
      calcCurrent = btn;
    } else {
      calcCurrent += btn;
    }
  }
  display.innerText = calcCurrent;
}

function toggleCalculator() {
  const modal = document.getElementById('calc-modal');
  if (!modal) return;

  if (modal.style.display === 'none' || modal.style.display === '') {
    modal.style.display = 'flex';
  } else {
    modal.style.display = 'none';
  }
}




