const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbzsHO8t7TM04Sohp6Lq6nuYzLoSvJOHy_fI4MA0wW7qv6tUxUkwpzUHXVpcmrNMtc_zfg/exec"; // Бұл сілтемені өзіңіздің Google Apps Script web app URL-ге ауыстырыңыз
const defaultState = {
  view: 'home',
  user: null, // 'teacher' or 'student' or null
  history: ['home'],
  labs: [
    { id: 1, title: 'Бірқалыпты қозғалыс', desc: 'Дененің қозғалыс заңдылықтарын зерттеу.', phetUrl: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html' },
    { id: 2, title: 'Энергияның сақталу заңы', desc: 'Кинетикалық және потенциалдық энергияның өзара айналуы.', phetUrl: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html' },
    { id: 3, title: 'Маятниктің тербелісі', desc: 'Маятниктің тербеліс периодының жіп ұзындығына тәуелділігі.', phetUrl: 'https://phet.colorado.edu/sims/html/pendulum-lab/latest/pendulum-lab_en.html' },
    { id: 4, title: 'Идеал газ заңдары', desc: 'Газдың қысымы, көлемі және температурасының байланысы.', phetUrl: 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html' },
    { id: 5, title: 'Ом заңын зерттеу', desc: 'Тұрақты ток тізбегіндегі ток күші мен кернеудің байланысы.', phetUrl: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html' },
    { id: 6, title: 'Жарықтың сынуы', desc: 'Жарықтың екі ортаның шекарасында сыну заңдылықтары.', phetUrl: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_en.html' },
    { id: 7, title: 'Фотоэффект құбылысы', desc: 'Жарық әсерінен заттан электрондардың ұшып шығуын бақылау.', phetUrl: 'https://phet.colorado.edu/sims/html/photoelectric-effect/latest/photoelectric-effect_en.html' },
    { id: 8, title: 'Атомның құрылысы', desc: 'Протондар, нейтрондар мен электрондардан атомдарды құрастыру.', phetUrl: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html' },
    { id: 9, title: 'Заттың тығыздығы', desc: 'Әртүрлі заттардың тығыздығын өлшеу және салыстыру.', phetUrl: 'https://phet.colorado.edu/sims/html/density/latest/density_en.html' },
    { id: 10, title: 'Күш моменті мен тепе-теңдік', desc: 'Иінді таразының тепе-теңдік шартын зерттеу.', phetUrl: 'https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_en.html' }
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
  teacherAIChats: [], // Array of { id, title, messages: [], lastUpdate }
  studentAIChats: [], // Array of { id, title, messages: [], lastUpdate }
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
  aiHistory: { teacher: [], student: [] },
  currentTeacherChatStudentId: null
};

const savedState = localStorage.getItem('physicsAccessState');
const parsedState = savedState ? JSON.parse(savedState) : {};
// Site should start as guest on first launch, so we ignore user/view from storage
const state = { ...defaultState, ...parsedState, user: null, view: 'home' };

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
    aiHistory: state.aiHistory,
    currentTeacherChatStudentId: state.currentTeacherChatStudentId
  }));
}

// Sync state across multiple tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'physicsAccessState') {
    const newState = JSON.parse(e.newValue);
    if (newState && newState.chatMessages) {
      state.chatMessages = newState.chatMessages;
      state.aiHistory = newState.aiHistory;
      state.currentTeacherChatStudentId = newState.currentTeacherChatStudentId;

      // Refresh current view if it's a chat
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
    if (viewId === 'student-ai' && state.user === 'student') window.showStudentAIAssistant();
    if (viewId === 'teacher-class' && state.user === 'teacher') window.showClassManager();
    if (viewId === 'teacher-ai' && state.user === 'teacher') window.showAIAssistant();
  }

  // Handle calculator visibility
  const calcBtn = document.querySelector('.floating-calc-btn');
  if (calcBtn) {
    calcBtn.style.display = (viewId === 'lesson') ? 'flex' : 'none';
  }

  // Handle accessibility panel visibility
  const a11yPanel = document.getElementById('a11y-panel');
  if (a11yPanel) {
    const isStudentView = viewId.startsWith('student') || (state.user === 'student' && viewId === 'labs');
    a11yPanel.style.display = (state.user === 'student' && isStudentView) ? 'flex' : 'none';
  }

  // Close calculator modal if navigating away
  const calcModal = document.getElementById('calc-modal');
  if (calcModal && viewId !== 'lesson') {
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
  let params = new URLSearchParams({ action: mode });

  if (mode === 'login') {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (!email || !password) return alert('Мәліметтерді толтырыңыз');
    params.append('email', email);
    params.append('password', password);
  } else {
    const name = document.getElementById('reg-name').value;
    const role = document.getElementById('reg-role').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    if (!name || !email || !password) return alert('Барлық өрістерді толтырыңыз');
    params.append('name', name);
    params.append('role', role);
    params.append('email', email);
    params.append('password', password);
  }

  if (loading) loading.style.display = 'flex';

  try {
    const url = `${GOOGLE_SCRIPTS_AUTH_URL}?${params.toString()}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.success) {
      state.user = result.user.role;
      // Set name from result, or fallback to email prefix if "Вы" or empty
      let name = result.user.name;
      if (!name || name === 'Вы') {
        const emailInput = mode === 'login' ? document.getElementById('login-email') : document.getElementById('reg-email');
        name = (emailInput && emailInput.value) ? emailInput.value.split('@')[0] : 'User';
      }
      state.studentProfile.name = name;
      state.teacherProfile.name = name;

      login(result.user.role);
      closeAuthModal();
    } else {
      alert(result.message || 'Қате орын алды');
    }
  } catch (error) {
    console.error('Auth Error:', error);
    // FALLBACK for development if API is not yet published correctly
    const emailField = mode === 'login' ? 'login-email' : 'reg-email';
    const emailVal = document.getElementById(emailField).value;

    if (emailVal === 'teacher@demo.com') login('teacher');
    else if (emailVal === 'student@demo.com') login('student');
    else alert('API байланыс қатесі. Скриптті ДЕПЛОЙ жасап, "Anyone" рұқсатын бергеніңізді тексеріңіз.');
  } finally {
    if (loading) loading.style.display = 'none';
  }
};

function login(role) {
  state.user = role;
  state.history = ['home', role]; // Set baseline history
  saveState();
  navigate(role, false);
}

function logout() {
  state.user = null;
  state.history = ['home'];
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
        <!-- Lab 1 -->
        <div class="glass-card voice-target animate-hover" onclick="showPhysicsAccessLab('freefall')" style="padding: 2rem; border-left: 8px solid var(--accent-orange);">
           <h4 class="label-caps" style="color: var(--accent-orange); font-size: 0.75rem; margin-bottom: 0.5rem;">№1 Зертханалық жұмыс</h4>
           <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 1rem;">Еркін түсуді зерттеу</h3>
           <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">Дененің еркін түсу уақыты мен жылдамдығының биіктікке тәуелділігін зерделеу.</p>
        </div>

        <!-- Lab 2 -->
        <div class="glass-card voice-target animate-hover" onclick="showPhysicsAccessLab('impulse')" style="padding: 2rem; border-left: 8px solid #6366f1;">
           <h4 class="label-caps" style="color: #6366f1; font-size: 0.75rem; margin-bottom: 0.5rem;">№2 Зертханалық жұмыс</h4>
           <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 1rem;">Денелердің соқтығысуы</h3>
           <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">Серпімді және серпімсіз соқтығыстар кезінде импульстің сақталуын зерттеу.</p>
        </div>

        <!-- Lab 3 -->
        <div class="glass-card voice-target animate-hover" onclick="showPhysicsAccessLab('hooke')" style="padding: 2rem; border-left: 8px solid #22c55e;">
           <h4 class="label-caps" style="color: #22c55e; font-size: 0.75rem; margin-bottom: 0.5rem;">№3 Зертханалық жұмыс</h4>
           <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 1rem;">Гук заңын зерттеу</h3>
           <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">Серпімділік күшінің ұзаруға тәуелділігін зерделеу және қатаңдықты анықтау.</p>
        </div>
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

  if (type === 'freefall') {
    container.innerHTML = `
      <button class="btn-secondary v-center" style="margin-bottom: 1.5rem; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;" onclick="renderPhysicsAccessLabs()">
        <i data-lucide="arrow-left" size="18"></i> Тізімге оралу
      </button>
      ${renderFreeFallLab(true)}
    `;
  } else if (type === 'impulse') {
    container.innerHTML = `
      <button class="btn-secondary v-center" style="margin-bottom: 1.5rem; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;" onclick="renderPhysicsAccessLabs()">
        <i data-lucide="arrow-left" size="18"></i> Тізімге оралу
      </button>
      ${renderImpulseLab()}
    `;
  } else if (type === 'hooke') {
    container.innerHTML = `
      <button class="btn-secondary v-center" style="margin-bottom: 1.5rem; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;" onclick="renderPhysicsAccessLabs()">
        <i data-lucide="arrow-left" size="18"></i> Тізімге оралу
      </button>
      ${renderCurrentLab()}
    `;
  }
  lucide.createIcons();
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

const lessonsData = {
  freefall: {

    title: 'Дененің еркін түсу үдеуі',
    image: 'media/lessons/freefall.png',
    video: 'https://www.youtube.com/embed/Px9Tidqtrw4',
    theory: `<h3>Еркін түсу ұғымы</h3>
             <p><b>Еркін түсу</b> — бұл денелердің тек қана ауырлық күшінің әсерінен қозғалуы. Мұндай қозғалыс кезінде денеге басқа ешқандай күштер (мысалы, ауаның кедергі күші) әсер етпейді деп есептеледі.</p>
             <h4>Негізгі сипаттамалары:</h4>
             <ul>
               <li>Барлық денелер массасына қарамастан бірдей үдеумен түседі.</li>
               <li>Бұл үдеу <b>еркін түсу үдеуі</b> деп аталады және <b>g</b> әрпімен белгіленеді.</li>
             </ul>
             <div class="glass-card flex-center" style="padding: 1.5rem; margin: 1rem 0; font-size: 1.5rem; font-weight: 800; color: var(--accent-orange); flex-direction: column; gap: 10px;">
               <div style="font-size: 0.9rem; color: var(--text-tertiary);" class="label-caps">Тұрақты мән:</div>
               g ≈ 9.8 м/с²
             </div>
             <h4>Маңызды формулалар:</h4>
             <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin: 1.5rem 0;">
               <div class="glass-card" style="padding: 1.5rem; text-align: center;">
                 <div style="font-size: 0.8rem; color: var(--text-tertiary);" class="label-caps">Жылдамдық:</div>
                 <div style="font-size: 1.4rem; font-weight: 800; margin-top: 0.5rem;">v = g · t</div>
               </div>
               <div class="glass-card" style="padding: 1.5rem; text-align: center;">
                 <div style="font-size: 0.8rem; color: var(--text-tertiary);" class="label-caps">Биіктік:</div>
                 <div style="font-size: 1.4rem; font-weight: 800; margin-top: 0.5rem;">h = (g · t²) / 2</div>
               </div>
               <div class="glass-card" style="padding: 1.5rem; text-align: center;">
                 <div style="font-size: 0.8rem; color: var(--text-tertiary);" class="label-caps">Тәуелсіздік:</div>
                 <div style="font-size: 1.4rem; font-weight: 800; margin-top: 0.5rem;">v² = 2gh</div>
               </div>
             </div>
             <p>Мұндағы: <b>v</b> — соңғы жылдамдық (м/с), <b>t</b> — уақыт (с), <b>h</b> — биіктік (м).</p>`,
    quiz: [
      {
        question: 'Еркін түсу үдеуінің мәні қандай?',
        options: ['9.8 м/с²', '5.5 м/с²', '1.6 м/с²', '12 м/с²'],
        correct: '9.8 м/с²',
        explanation: 'Жер бетіндегі еркін түсу үдеуі шамамен 9.8 м/с²-қа тең.'
      },
      {
        question: 'Вакуумде (ауасыз кеңістікте) ауыр және жеңіл денелердің түсу жылдамдығы қалай өзгереді?',
        options: ['Бірдей түседі', 'Ауыр дене тезірек түседі', 'Жеңіл дене тезірек түседі', 'Салмағына байланысты'],
        correct: 'Бірдей түседі',
        explanation: 'Вакуумде ауа кедергісі болмағандықтан, барлық денелер массасына қарамастан бірдей үдеумен түседі.'
      },
      {
        question: 'Еркін түсу кезіндегі жүрілген жолдың (биіктік) формуласы қандай?',
        options: ['h = gt²/2', 'h = gt', 'h = v/t', 'h = mg'],
        correct: 'h = gt²/2',
        explanation: 'Еркін түсу — бұл бастапқы жылдамдығы нөлге тең теңайнымалы қозғалыс, сондықтан жол формуласы: h = gt²/2.'
      },
      {
        question: 'Дене 2 секунд бойы еркін түссе, оның соңғы жылдамдығы қандай болады? (g=10 м/с²)',
        options: ['20 м/с', '10 м/с', '5 м/с', '40 м/с'],
        correct: '20 м/с',
        explanation: 'v = g * t формуласы бойынша: 10 * 2 = 20 м/с.'
      },
      {
        question: 'Еркін түсу үдеуін және денелердің бірдей түсетінін алғаш дәлелдеген ғалым?',
        options: ['Галилео Галилей', 'Исаак Ньютон', 'Альберт Эйнштейн', 'Архимед'],
        correct: 'Галилео Галилей',
        explanation: 'Пиза мұнарасында тәжірибе жасай отырып, денелердің түсу уақыты массаға тәуелсіз екенін алғаш Галилей дәлелдеді.'
      }
    ]
  },
  impulse: {
    title: 'Дене импульсі',
    image: 'media/lessons/impulse.png',
    video: 'https://www.youtube.com/embed/1ZK1KUAdTDw',
    theory: `<h3>Дене импульсі және оның сақталу заңы</h3>
             <p><b>Дене импульсі (қозғалыс мөлшері)</b> — бұл дененің инерттілігі мен қозғалыс жылдамдығын сипаттайтын векторлық физикалық шама.</p>
             <div class="glass-card flex-center" style="padding: 1.5rem; margin: 1rem 0; font-size: 1.8rem; font-weight: 800; color: var(--accent-purple); flex-direction: column; gap: 10px;">
               <div style="font-size: 0.9rem; color: var(--text-tertiary);" class="label-caps">Импульс формуласы:</div>
               p = m · v
             </div>
             <p>Мұндағы: <b>p</b> — импульс (кг·м/с), <b>m</b> — масса (кг), <b>v</b> — жылдамдық (м/с).</p>
             <h4>Күш импульсі және импульстің өзгеруі:</h4>
             <p>Ньютонның екінші заңына сәйкес, дене импульсінің өзгеруі әсер етуші күш пен уақыттың көбейтіндісіне тең:</p>
             <div class="glass-card" style="padding: 1.5rem; text-align: center; margin: 1rem 0;">
               <div style="font-size: 1.4rem; font-weight: 800;">F · Δt = Δp</div>
               <p style="font-size: 0.9rem; color: var(--text-tertiary); margin-top: 0.5rem;">мұндағы Δp = m(v₂ - v₁)</p>
             </div>
             <h4>Импульстің сақталу заңы:</h4>
             <p>Сыртқы күштер әсер етпеген тұйық жүйеде денелердің импульстерінің векторлық қосындысы тұрақты болып қалады:</p>
             <div style="background: rgba(147, 51, 234, 0.05); padding: 1.2rem; border-radius: 12px; border: 1px dashed var(--accent-purple); font-weight: 700; text-align: center; margin-top: 1rem;">
               p₁ + p₂ = p'₁ + p'₂
             </div>`,
    quiz: [
      {
        question: 'Дене импульсінің формуласы қандай?',
        options: ['p = m · v', 'p = m / v', 'p = F · s', 'p = m · g'],
        correct: 'p = m · v',
        explanation: 'Дене импульсі — бұл масса мен жылдамдықтың көбейтіндісі: p = m * v.'
      },
      {
        question: 'Дене импульсінің Халықаралық бірліктер жүйесіндегі өлшем бірлігі?',
        options: ['кг·м/с', 'кг/м', 'Н', 'Дж'],
        correct: 'кг·м/с',
        explanation: 'Масса (кг) мен жылдамдықтың (м/с) көбейтіндісі болғандықтан, импульс бірлігі кг·м/с болады.'
      },
      {
        question: 'Күш импульсі (F·Δt) физикалық мағынасы жағынан неге тең?',
        options: ['Импульстің өзгеруіне', 'Жолға', 'Күшке', 'Қуатқа'],
        correct: 'Импульстің өзгеруіне',
        explanation: 'F * Δt = Δp, яғни күш импульсі дене импульсінің өзгеруіне тең болады.'
      },
      {
        question: 'Егер дененің жылдамдығы 2 есе артса, оның импульсі қалай өзгереді?',
        options: ['2 есе артады', '2 есе кемиді', 'Өзгермейді', '4 есе артады'],
        correct: '2 есе артады',
        explanation: 'Импульс жылдамдыққа тура пропорционал (p = mv), сондықтан ол да 2 есе артады.'
      },
      {
        question: 'Импульстің сақталу заңы орындалатын жүйе қалай аталады?',
        options: ['Тұйық жүйе', 'Ашық жүйе', 'Еркін жүйе', 'Инерциялық жүйе'],
        correct: 'Тұйық жүйе',
        explanation: 'Сыртқы күштер әсер етпейтін немесе олардың қосындысы нөлге тең жүйе тұйық жүйе деп аталады.'
      }
    ]
  },
  current: {
    title: 'Гук заңы',
    image: 'media/lessons/hooke.png',
    video: 'https://www.youtube.com/embed/vx8WrN0wvhE',
    theory: `<h3>Гук заңы және серпімділік күші</h3>
             <p><b>Серпімділік күші</b> — дене деформацияланған кезде пайда болатын және оны бастапқы қалпына келтіруге тырысатын күш.</p>
             <h4>Заңдылық:</h4>
             <p>Дененің созылу немесе сығылу деформациясы кезінде пайда болатын серпімділік күші оның ұзаруына тура пропорционал және деформацияға қарама-қарсы бағытталады.</p>
             <div class="glass-card flex-center" style="padding: 1.5rem; margin: 1rem 0; font-size: 1.8rem; font-weight: 800; color: var(--accent-orange); flex-direction: column; gap: 10px;">
               <div style="font-size: 0.9rem; color: var(--text-tertiary);" class="label-caps">Формула:</div>
               F = k · |x|
             </div>
             <p>Мұндағы: <b>F</b> — серпімділік күші (Н), <b>k</b> — қатаңдық (Н/м), <b>x</b> — абсолют ұзару (м).</p>
             <h4>Деформацияланған дененің энергиясы:</h4>
             <p>Серпімді деформацияланған серіппенің потенциалдық энергиясы:</p>
             <div style="background: rgba(242, 109, 33, 0.05); padding: 1.2rem; border-radius: 12px; border: 1px dashed var(--accent-orange); font-weight: 700; text-align: center; margin: 1rem 0; font-size: 1.3rem;">
               Eₚ = (k · x²) / 2
             </div>`,
    quiz: [
      {
        question: 'Гук заңының формуласы қандай?',
        options: ['F = kx', 'F = mg', 'P = ρgh', 'v = s/t'],
        correct: 'F = kx',
        explanation: 'Гук заңы бойынша серпімділік күші қатаңдық пен ұзарудың көбейтіндісіне тең.'
      },
      {
        question: 'Қатаңдық коэффициентінің (k) өлшем бірлігі қандай?',
        options: ['Н/м', 'Н', 'кг', 'м'],
        correct: 'Н/м',
        explanation: 'Қатаңдық күштің ұзаруға қатынасы (k = F/x), сондықтан бірлігі Н/м.'
      },
      {
        question: 'Серпімділік күші қай бағытта әсер етеді?',
        options: ['Деформацияға қарама-қарсы', 'Жерге қарай', 'Қозғалыс бағытымен', 'Кез келген бағытта'],
        correct: 'Деформацияға қарама-қарсы',
        explanation: 'Серпімділік күші денені бастапқы қалпына келтіруге тырысады, сондықтан деформацияға қарсы бағытталады.'
      },
      {
        question: 'Массасы 100 г жүкті ілгенде серіппе 1 см-ге ұзарса, қатаңдығы қандай? (g=10)',
        options: ['100 Н/м', '10 Н/м', '1000 Н/м', '1 Н/м'],
        correct: '100 Н/м',
        explanation: 'F = mg = 0.1 * 10 = 1 Н. x = 0.01 м. k = F/x = 1 / 0.01 = 100 Н/м.'
      },
      {
        question: 'Гук заңы қай кезде орындалады?',
        options: ['Серпімді деформацияда', 'Пластикалық деформацияда', 'Барлық жағдайда', 'Тек қысқанда'],
        correct: 'Серпімді деформацияда',
        explanation: 'Гук заңы тек дене өзінің бастапқы пішінін сақтай алатын кішігірім серпімді деформациялар үшін орындалады.'
      }
    ]
  }
};

window.showStudentLessons = function (containerId = 'student-content', backFnName = 'renderStudentDashboard') {
  const view = document.getElementById(containerId) || document.getElementById('student-view');
  if (!view) return;

  view.innerHTML = `
    <div class="glass-panel animate-fade-in" style="padding: 2.5rem; min-height: 80vh;">
      <div class="flex items-center gap-4" style="margin-bottom: 3rem;">
        <div>
          <h2 class="gradient-text" style="font-size: 2.5rem; font-weight: 800;">Физика сабақтары</h2>
          <p style="color: var(--text-secondary); font-size: 1.1rem; font-weight: 600;">Өзіңе қажетті тақырыпты таңдап, оқуды баста!</p>
        </div>
      </div>

      <div class="grid gap-8" style="grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));">
        <div class="glass-card voice-target" style="display: flex; flex-direction: column; padding: 2.5rem; border-radius: 28px; border: 1px solid var(--border-glass);">
          <div style="background: rgba(0, 195, 255, 0.1); width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; color: var(--accent-cyan);">
            <i data-lucide="arrow-down-to-dot" size="32"></i>
          </div>
          <h3 style="margin-bottom: 1.2rem; font-size: 1.6rem; font-weight: 800; color: var(--text-primary);">Дененің еркін түсу үдеуі</h3>
          <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.6; margin-bottom: 2.5rem; flex-grow: 1;">
            Еркін түсу заңдылықтарын, g тұрақтысының мағынасын және вакуумдегі қозғалысты зерттеңіз.
          </p>
          <button class="btn-primary" style="width: 100%; padding: 1.2rem; font-size: 1.1rem; border-radius: 18px;" onclick="startLesson('freefall')">САБАҚТЫ БАСТАУ</button>
        </div>

        <div class="glass-card voice-target" style="display: flex; flex-direction: column; padding: 2.5rem; border-radius: 28px; border: 1px solid var(--border-glass);">
          <div style="background: rgba(147, 51, 234, 0.1); width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; color: var(--accent-purple);">
            <i data-lucide="move" size="32"></i>
          </div>
          <h3 style="margin-bottom: 1.2rem; font-size: 1.6rem; font-weight: 800; color: var(--text-primary);">Дене импульсі</h3>
          <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.6; margin-bottom: 2.5rem; flex-grow: 1;">
            Импульс ұғымы, p = mv формуласы және импульстің сақталу заңын зерттеңіз.
          </p>
          <button class="btn-primary" style="width: 100%; padding: 1.2rem; font-size: 1.1rem; border-radius: 18px;" onclick="startLesson('impulse')">САБАҚТЫ БАСТАУ</button>
        </div>

        <div class="glass-card voice-target" style="display: flex; flex-direction: column; padding: 2.5rem; border-radius: 28px; border: 1px solid var(--border-glass);">
          <div style="background: rgba(251, 191, 36, 0.1); width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; color: #f59e0b;">
            <i data-lucide="activity" size="32"></i>
          </div>
          <h3 style="margin-bottom: 1.2rem; font-size: 1.6rem; font-weight: 800; color: var(--text-primary);">Гук заңы</h3>
          <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.6; margin-bottom: 2.5rem; flex-grow: 1;">
            Серпімділік күші, қатаңдық және дененің деформациясы арасындағы заңдылықты зерттеңіз.
          </p>
          <button class="btn-primary" style="width: 100%; padding: 1.2rem; font-size: 1.1rem; border-radius: 18px;" onclick="startLesson('current')">САБАҚТЫ БАСТАУ</button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function startLesson(topicId) {
  renderLessonStep(topicId, 1);
}

function renderLessonStep(topicId, step) {
  const view = document.getElementById('student-view');
  const data = lessonsData[topicId];
  if (!data || !view) return;

  const totalSteps = 5;
  const progressPercent = (step / totalSteps) * 100;
  let stepContent = '';

  if (step === 1) {
    quizState = { topicId, currentIndex: 0, score: 0, isFinished: false, isSpeechEnabled: false };
    stepContent = `
      <div class="glass-panel animate-scale-in" style="padding: 2.5rem; margin-top: 1rem; border-radius: 28px; border: 1px solid var(--border-glass); background: white;">
        <div class="flex items-center gap-4" style="margin-bottom: 2.5rem;">
          <div style="background: var(--primary-gradient); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px var(--glow-orange);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <h3 class="label-caps" style="color: var(--accent-orange); font-size: 1rem; letter-spacing: 0.1em; font-weight: 800; margin-bottom: 0;">ТЕОРИЯЛЫҚ МӘЛІМЕТ</h3>
        </div>
        <div class="grid gap-8" style="grid-template-columns: minmax(300px, 400px) 1fr;">
          <div style="position: sticky; top: 0;">
            <div style="border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.12); border: 2px solid var(--border-glass); background: #f8fafc;">
              <img src="${data.image}" alt="${data.title}" style="width: 100%; height: auto; display: block; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            </div>
          </div>
          <div style="font-size: 1.15rem; line-height: 1.8; color: var(--text-primary);">
            <div class="theory-body">
              ${data.theory}
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (step === 2) {
    stepContent = `
      <div class="glass-panel animate-scale-in" style="padding: 2.5rem; margin-top: 1rem; border-radius: 28px; background: white; border: 1px solid var(--border-glass);">
        <h3 style="margin-bottom: 2rem; color: var(--accent-purple); font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 10px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          ВИДЕО ТҮСІНДІРМЕ
        </h3>
        <div style="aspect-ratio: 16/9; width: 100%; max-width: 1000px; margin: 0 auto; background: #000; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.3);">
           <iframe width="100%" height="100%" src="${data.video}" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    `;
  } else if (step === 3) {
    const quiz = data.quiz;
    const currentQ = quiz[quizState.currentIndex];
    const quizProgress = ((quizState.currentIndex) / quiz.length) * 100;
    stepContent = `
       <div class="glass-panel animate-scale-in" style="padding: 2.5rem; margin-top: 1rem; border-radius: 28px; background: white; border: 1px solid var(--border-glass);">
        <div class="flex justify-between items-center" style="margin-bottom: 2.5rem;">
          <h3 style="color: var(--accent-cyan); font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; gap: 10px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            ТЕСТ
          </h3>
          <div class="flex items-center gap-4">
            <div style="background: rgba(var(--accent-cyan-rgb), 0.1); padding: 0.6rem 1.2rem; border-radius: 20px; color: var(--accent-cyan); font-weight: 800;">
              СҰРАҚ ${quizState.currentIndex + 1} / ${quiz.length}
            </div>
            <button class="btn-primary flex-center" style="width: 48px; height: 48px; border-radius: 14px; padding: 0; background: var(--primary-gradient); box-shadow: 0 4px 12px var(--glow-orange);" onclick="toggleCalculator()" title="Калькулятор">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <line x1="8" y1="6" x2="16" y2="6"></line>
                <line x1="16" y1="14" x2="16" y2="18"></line>
                <path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path>
                <path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path>
              </svg>
            </button>
            </button>
          </div>
        </div>
        <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; margin-bottom: 3rem; overflow: hidden;">
          <div style="width: ${quizProgress}%; height: 100%; background: var(--accent-cyan); transition: width 0.3s;"></div>
        </div>
        <div class="glass-card animate-fade-in" style="max-width: 800px; margin: 0 auto; padding: 3rem; border-radius: 32px; border: 1px solid var(--border-glass);">
          <p style="font-size: 1.5rem; font-weight: 700; margin-bottom: 3rem; color: var(--text-primary); text-align: center;">${currentQ.question}</p>
          <div class="grid gap-4" style="grid-template-columns: repeat(2, 1fr);">
            ${currentQ.options.map(opt => `
              <button class="quiz-option-btn" style="width: 100%; text-align: left; padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-glass); background: white; transition: all 0.2s; cursor: pointer; font-size: 1.2rem; font-weight: 600;"
                      onclick="checkGameAnswer('${topicId}', '${opt}', this)">${opt}</button>
            `).join('')}
          </div>
          <div id="game-feedback" style="margin-top: 2.5rem; min-height: 4rem; text-align: center; font-size: 1.2rem; font-weight: 800;"></div>
          <div id="next-quiz-btn" style="margin-top: 2rem; display: none;">
            <button class="btn-primary" style="width: 100%; padding: 1.2rem; font-size: 1.1rem; border-radius: 16px;" onclick="nextQuizQuestion('${topicId}')">КЕЛЕСІ СҰРАҚ</button>
          </div>
        </div>
      </div>
    `;
  } else if (step === 4) {
    let labHtml = '';
    if (topicId === 'freefall') labHtml = renderFreeFallLab();
    else if (topicId === 'impulse') labHtml = renderImpulseLab();
    else if (topicId === 'current') labHtml = renderCurrentLab();
    stepContent = `
      <div class="glass-panel animate-scale-in" style="padding: 1.5rem; margin-top: 1rem; border-radius: 28px; background: white; border: 1px solid var(--border-glass);">
        <h3 style="margin-bottom: 2rem; color: var(--accent-orange); font-size: 1.3rem; font-weight: 800; display: flex; align-items: center; justify-content: space-between; padding: 0 1rem;">
          <div class="flex items-center gap-4">
            <div style="background: rgba(242, 109, 33, 0.1); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--accent-orange); border: 1.5px solid rgba(242, 109, 33, 0.2);">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 2v7.5"></path>
                <path d="M14 2v7.5"></path>
                <path d="M8.5 2h7"></path>
                <path d="M14 9.5c3 0 4.5 2 4.5 5a4 4 0 0 1-4 4H9.5a4 4 0 0 1-4-4c0-3 1.5-5 4.5-5"></path>
                <path d="M8.5 14h7"></path>
              </svg>
            </div>
            ЗЕРТХАНА
          </div>
          <button class="btn-primary flex-center" style="width: 42px; height: 42px; border-radius: 10px; padding: 0; background: var(--primary-gradient); box-shadow: 0 4px 12px var(--glow-orange);" onclick="toggleCalculator()" title="Калькулятор">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <line x1="8" y1="6" x2="16" y2="6"></line>
              <line x1="16" y1="14" x2="16" y2="18"></line>
              <path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path>
              <path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path>
            </svg>
          </button>
        </h3>
        ${labHtml}
      </div>
    `;
  } else if (step === 5) {
    setTimeout(() => {
      triggerSalute();
      if (window.speakText) window.speakText('Құттықтаймыз! Сіз тақырыпты сәтті аяқтадыңыз.');
    }, 500);

    stepContent = `
      <div class="glass-panel animate-scale-in flex flex-col items-center text-center" style="padding: 4rem; margin-top: 1rem; border-radius: 32px; background: white; border: 1px solid var(--border-glass);">
        <div style="background: var(--primary-gradient); width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 2rem; box-shadow: 0 10px 30px var(--glow-orange);">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h2 class="gradient-text" style="font-size: 3.5rem; margin-bottom: 1.5rem; font-weight: 900;">Құттықтаймыз!</h2>
        
        <p style="font-size: 1.4rem; color: var(--text-secondary); max-width: 600px; line-height: 1.6; margin-bottom: 2.5rem;">
          Сен "${data.title}" тақырыбын сәтті аяқтадың. Сенің тест тапсырмасынан жинаған ұпайың:
        </p>
        <div class="glass-card" style="padding: 2.5rem 5rem; border-radius: 28px; margin-bottom: 3.5rem; background: #f0fdf4; border: 2px solid #bbf7d0; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
          <div style="font-size: 4rem; font-weight: 950; color: #059669;">${quizState.score} / ${data.quiz.length}</div>
        </div>
        <button class="btn-primary" style="padding: 1.5rem 5rem; font-size: 1.2rem; border-radius: 20px; font-weight: 800; box-shadow: 0 10px 25px var(--glow-orange);" onclick="finishLesson()">БАСТЫ БЕТКЕ ОРАЛУ</button>
      </div>
    `;
  }

  view.innerHTML = `
    <div class="animate-fade-in" style="max-width: 1400px; margin: 0 auto; width: 100%; padding-bottom: 3rem;">
      <div class="flex justify-between items-center" style="margin-bottom: 2rem; background: white; padding: 1.5rem 2rem; border-radius: 24px; border: 1px solid var(--border-glass); box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
        <div class="flex items-center gap-6">
          <button class="btn-secondary flex-center" style="width: 48px; height: 48px; border-radius: 14px; border: 1.5px solid var(--border-glass); background: white; transition: all 0.3s; padding: 0;" onclick="${step === 1 ? 'showStudentLessons()' : `renderLessonStep('${topicId}', ${step - 1})`}" onmouseover="this.style.borderColor='var(--accent-orange)'; this.style.transform='translateX(-5px)'" onmouseout="this.style.borderColor='var(--border-glass)'; this.style.transform='none'">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-primary);">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          </div>
        </div>
        <div style="width: 300px;">
          <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
            <div style="width: ${progressPercent}%; height: 100%; background: var(--primary-gradient); transition: width 0.5s;"></div>
          </div>
          <div style="text-align: right; font-size: 0.85rem; color: var(--text-tertiary); font-weight: 800;">ПРОГРЕСС: ${Math.round(progressPercent)}%</div>
        </div>
      </div>
      <div class="step-container">${stepContent}</div>
      ${(step < totalSteps && (step !== 3 || quizState.isFinished)) ? `
        <div class="flex justify-end" style="margin-top: 2rem;">
          <button class="btn-primary label-caps" style="padding: 1.2rem 3rem; border-radius: 18px; font-size: 1.1rem; display: flex; align-items: center; gap: 12px;" onclick="renderLessonStep('${topicId}', ${step + 1})">
            КЕЛЕСІ ҚАДАМ 
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      ` : ''}
    </div>
  `;
  lucide.createIcons();
}



const MOTIVATION_PHRASES = [
  "Керемет! Сен нағыз физиксің! 🚀",
  "Өте жақсы! Тоқтап қалма! ✨",
  "Тамаша жауап! Сенің қолыңнан бәрі келеді! 🏆",
  "Дұрыс! Білім шыңына қарай алға! 🏔️",
  "Жарайсың! Сенің ойлау қабілетің таңғалдырады! 🧠",
  "Керемет! Ғылым әлемі сені күтуде! 🌟"
];

const ENCOURAGING_PHRASES = [
  "Қазірше қате, бірақ келесі жолы міндетті түрде дұрыс болады! 💪",
  "Уайымдама, бұл тек тәжірибе ғана. Біз бәріміз үйренеміз! 📚",
  "Қызықты жауап, бірақ дұрысы басқа екен. Талпынысың жақсы! 😊",
  "Сәл ғана жетпей қалды! Келесі жолы сәтті болады! ✨",
  "Қателіктер — біздің ұстазымыз. Келесі сұраққа зейін қой! 🎯"
];

function triggerSalute() {
  const canvas = document.getElementById('celebration-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#f26d21', '#9333ea', '#3b82f6', '#10b981', '#fbbf24', '#f472b6'];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 1.5,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.7) * 25,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      gravity: 0.4,
      rotation: Math.random() * 360,
      rotateSpeed: (Math.random() - 0.5) * 10
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      if (p.opacity > 0) {
        alive = true;
        p.vx *= 0.98;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.opacity -= 0.01;
        p.rotation += p.rotateSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        if (Math.random() > 0.5) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    if (alive) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

function playQuizSound(isCorrect) {
  const audio = new Audio(isCorrect ?
    'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3' :
    'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'
  );
  audio.volume = 0.5;
  audio.play().catch(e => console.log('Audio play failed:', e));
}

function checkGameAnswer(topicId, answer, btn) {
  const quiz = lessonsData[topicId].quiz;
  const currentQ = quiz[quizState.currentIndex];
  const feedback = document.getElementById('game-feedback');
  const nextBtn = document.getElementById('next-quiz-btn');
  const buttons = btn.parentElement.querySelectorAll('button');

  buttons.forEach(b => {
    b.disabled = true;
    b.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    if (b.innerText.trim() === currentQ.correct) {
      b.style.background = 'rgba(76, 175, 80, 0.2)';
      b.style.borderColor = '#4CAF50';
      b.style.color = '#2E7D32';
      b.style.transform = 'scale(1.05)';
    } else if (b === btn) {
      b.style.background = 'rgba(244, 67, 54, 0.2)';
      b.style.borderColor = '#F44336';
      b.style.color = '#C62828';
      b.style.transform = 'scale(0.95)';
    }
  });

  if (answer === currentQ.correct) {
    quizState.score++;
    playQuizSound(true);
    const phrase = MOTIVATION_PHRASES[Math.floor(Math.random() * MOTIVATION_PHRASES.length)];
    feedback.innerHTML = `<div class="animate-bounce" style="color: #4CAF50; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; background: rgba(76, 175, 80, 0.1); padding: 1.5rem; border-radius: 20px; border: 1px dashed #4CAF50;">
        <i data-lucide="party-popper" size="32"></i>
        <span>${phrase}</span>
      </div>`;
    triggerSalute();
    if (quizState.isSpeechEnabled && window.speakText) window.speakText(phrase);
  } else {
    playQuizSound(false);
    const phrase = ENCOURAGING_PHRASES[Math.floor(Math.random() * ENCOURAGING_PHRASES.length)];
    feedback.innerHTML = `
      <div class="animate-shake" style="color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 1rem; background: #fff; padding: 1.5rem; border-radius: 24px; border: 1px dashed var(--border-glass); box-shadow: 0 10px 20px rgba(0,0,0,0.05);">
        <div style="color: #F44336; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="help-circle" size="24"></i>
          <span>${phrase}</span>
        </div>
        <div style="background: #f1f5f9; padding: 1rem; border-radius: 16px; border-left: 5px solid var(--accent-orange); width: 100%; text-align: left;">
          <p style="font-size: 0.9rem; color: #1e293b; line-height: 1.5;"><b>Түсіндірме:</b> ${currentQ.explanation}</p>
        </div>
        <span style="font-size: 0.9rem; color: #F44336; font-weight: 700;">Дұрыс жауап: ${currentQ.correct}</span>
      </div>`;
    if (quizState.isSpeechEnabled && window.speakText) window.speakText(phrase);
  }

  lucide.createIcons();

  if (quizState.currentIndex < quiz.length - 1) {
    nextBtn.style.display = 'block';
  } else {
    quizState.isFinished = true;
    setTimeout(() => {
      renderLessonStep(topicId, 4); // Redirect to Lab step
    }, 3000);
  }
}

function nextQuizQuestion(topicId) {
  quizState.currentIndex++;
  renderLessonStep(topicId, 3);
}

function finishLesson() {
  const finalScore = quizState.score;
  const maxScore = lessonsData[quizState.topicId].quiz.length;
  const xpGained = Math.round((finalScore / maxScore) * 100);

  state.studentProfile.points += xpGained;
  state.studentProfile.level = Math.floor(state.studentProfile.points / 100) + 1;

  // Log the result for the teacher
  const topicTitle = lessonsData[quizState.topicId].title;
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

  state.quizResults.unshift({
    studentName: state.studentProfile.name,
    grade: state.studentProfile.grade,
    topic: topicTitle,
    score: finalScore,
    maxScore: maxScore,
    date: formattedDate
  });

  saveState();
  renderStudentDashboard();
  if (quizState.isSpeechEnabled && window.speakText) window.speakText('Сабақты сәтті аяқтадыңыз! Жетістігіңіз құтты болсын.');
}

function toggleLessonSpeech() {
  quizState.isSpeechEnabled = !quizState.isSpeechEnabled;
  if (!quizState.isSpeechEnabled && window.speechSynthesis) window.speechSynthesis.cancel();

  const btn = document.getElementById('lesson-speech-toggle');
  if (btn) {
    btn.innerHTML = quizState.isSpeechEnabled ? `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    ` : `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </svg>
    `;
    btn.style.background = quizState.isSpeechEnabled ? 'rgba(242, 109, 33, 0.1)' : 'white';
    btn.style.color = quizState.isSpeechEnabled ? 'var(--accent-orange)' : 'var(--text-tertiary)';
  }
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


// Vessels Lab State
let hookeLabState = {
  mass: 0.5,
  k: 50,
  isSolvedF: false,
  isSolvedX: false,
  feedbackF: '',
  feedbackX: ''
};

function renderCurrentLab() {
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




