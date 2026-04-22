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
    score: 0,
    level: 1,
    achievements: [],
    avatar: null,
    inventory: [],
    activeFrame: null,
    activeIcon: null,
    activeTitle: null,
    spentPoints: 0,
    assignmentPoints: 0
  },
  quizResults: [],
  allStudents: [],
  chatMessages: [],
  currentTeacherChatStudentId: null
};

const savedState = localStorage.getItem('physicsAccessState');
const parsedState = savedState ? JSON.parse(savedState) : {};
// Site should start as guest on first launch, so we ignore user/view from storage
window.state = { ...defaultState, ...parsedState, user: null, view: 'home', labs: defaultState.labs };
const state = window.state;

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
    currentTeacherChatStudentId: state.currentTeacherChatStudentId,
    userEmail: state.userEmail
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

    try {
      if (viewId === 'labs') renderLabs();
      if (viewId === 'teacher' && state.user === 'teacher') {
        if (typeof window.renderTeacherDashboard === 'function') window.renderTeacherDashboard();
        else console.error('renderTeacherDashboard not found');
      }
      if (viewId === 'student' && state.user === 'student') renderStudentDashboard();

      if (viewId === 'student-lessons' && state.user === 'student') {
        if (typeof window.showStudentLessons === 'function') {
          window.showStudentLessons('student-lessons-view', "navigate('student')");
        } else {
          console.error('showStudentLessons not found');
          targetView.innerHTML = `<div class='p-10 text-center'>Қате: Сабақтар модулі жүктелмеді. Бетті жаңартып көріңіз.</div>`;
        }
      }

      if (viewId === 'student-ai' && state.user === 'student') {
        if (typeof window.showStudentAIAssistant === 'function') {
          window.showStudentAIAssistant();
        } else {
          console.error('showStudentAIAssistant not found');
          targetView.innerHTML = `<div class='p-10 text-center'>Қате: AI Көмекші жүктелмеді. Бетті жаңартып көріңіз.</div>`;
        }
      }

      if (viewId === 'teacher-ai' && state.user === 'teacher') window.showAIAssistant();
      if (viewId === 'teacher-class' && state.user === 'teacher') window.showClassManager();
      if (viewId === 'workbook') renderWorkbook();
      if (viewId === 'shop') {
        window.activeShopCategory = null;
        renderShop();
      }
    } catch (error) {
      console.error(`Error rendering view ${viewId}:`, error);
    }
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
    { id: 'labs', label: 'Зертхана', icon: 'flask-conical' },
    { id: 'shop', label: 'Дүкен', icon: 'shopping-cart' }
  ] : [
    { id: 'student', label: 'Басты бет', icon: 'layout' },
    { id: 'student-lessons', label: 'Сабақтар', icon: 'play-circle' },
    { id: 'labs', label: 'Зертхана', icon: 'flask-conical' },
    { id: 'student-ai', label: 'AI Көмекші', icon: 'sparkles' },
    { id: 'shop', label: 'Дүкен', icon: 'shopping-cart' }
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

    let name = emailVal ? emailVal.split('@')[0] : 'User';
    let role = 'student';

    // Сақтандыру: егер профильдер объектісі жасалмаған болса, оларға бос объект береміз.
    if (!state.teacherProfile) state.teacherProfile = {};
    if (!state.studentProfile) state.studentProfile = {};

    if (mode === 'register') {
      name = document.getElementById('reg-name').value;
      role = document.getElementById('reg-role').value;

      if (role === 'teacher') {
        state.teacherProfile.name = name;
        state.teacherProfile.email = emailVal;
      } else {
        state.studentProfile.name = name;
        state.studentProfile.email = emailVal;
      }
    } else {
      if (emailVal.includes('teacher')) {
        role = 'teacher';
        state.teacherProfile.email = emailVal;
      } else {
        role = 'student';
        state.studentProfile.email = emailVal;
      }
    }

    console.warn('Жүйеге жергілікті түрде кіру (Офлайн режим) іске қосылды.');
    state.userEmail = emailVal;

    login(role);
    closeAuthModal();

  } catch (error) {
    console.error('Auth Error:', error);
    alert('Жүйелік қате: ' + error.message);
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
  if (!labsView || typeof PHET_LABS_DATA === 'undefined') return;

  const colors = ['#3b82f6', '#6366f1', '#22c55e', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#64748b'];

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
        <span style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; padding: 0.4rem 1rem; border-radius: 50px; font-weight: 800; font-size: 0.85rem;">20 ЖҰМЫС</span>
      </div>

      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
         ${PHET_LABS_DATA.map((lab, index) => `
          <div class="glass-card voice-target animate-hover" onclick="showPhetLabDetail(${lab.id})" style="padding: 2rem; border-bottom: 6px solid ${colors[index % colors.length]}; cursor: pointer; display: flex; flex-direction: column; height: 100%;">
             <div class="flex justify-between items-start mb-4">
                <div style="width: 45px; height: 45px; border-radius: 12px; background: ${colors[index % colors.length]}15; display: flex; align-items: center; justify-content: center; color: ${colors[index % colors.length]};">
                   <i data-lucide="flask-conical" size="22"></i>
                </div>
                <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-tertiary);">ФИЗИКА</span>
             </div>
             <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.4; flex-grow: 1;">${lab.title}</h3>
             <div class="flex items-center gap-2" style="font-weight: 700; color: ${colors[index % colors.length]}; font-size: 0.9rem;">
                БАСТАУ <i data-lucide="play" size="16"></i>
             </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  lucide.createIcons();
}

function showPhetLabDetail(id) {
  const labsView = document.getElementById('labs-view');
  if (!labsView || typeof PHET_LABS_DATA === 'undefined') return;

  const lab = PHET_LABS_DATA.find(l => l.id === id);
  if (!lab) return;

  labsView.innerHTML = `
    <div class="flex flex-col gap-6 animate-fade-in" style="height: 100%; padding-bottom: 2rem;">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button class="btn-secondary v-center h-center" style="width: 50px; height: 50px; border-radius: 50%; padding: 0; border: 1.5px solid var(--border-glass);" onclick="renderPhetLabsList()" title="Тізімге қайту">
            <i data-lucide="arrow-left" size="24"></i>
          </button>
          <div>
            <h2 class="gradient-text" style="font-size: 2rem; font-weight: 800;">${lab.title}</h2>
            <p style="color: var(--text-secondary); font-size: 1rem; font-weight: 600;">PhET Интерактивті симуляциясы</p>
          </div>
        </div>
      </div>
      
      <div class="grid" style="grid-template-columns: 380px 1fr; gap: 2rem; align-items: start;">
        <!-- Left Panel: Instructions -->
        <aside class="flex flex-col gap-4 overflow-y-auto" style="max-height: 85vh; padding: 0.5rem; border-radius: 20px;">
          <div class="glass-card" style="padding: 1.8rem; border-left: 6px solid #3b82f6; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <h3 class="v-center gap-3" style="font-size: 1.25rem; margin-bottom: 1.2rem; font-weight: 800;">
              <i data-lucide="target" size="22" style="color: #3b82f6;"></i> Жұмыс мақсаты
            </h3>
            <p style="font-size: 1.05rem; line-height: 1.6; color: var(--text-primary); font-weight: 500;">${lab.objective}</p>
          </div>
          
          <div class="glass-card" style="padding: 1.8rem; background: white; border: 1px solid var(--border-glass); box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <h3 class="v-center gap-3" style="font-size: 1.25rem; margin-bottom: 1.2rem; font-weight: 800;">
              <i data-lucide="list-checks" size="22" style="color: #f59e0b;"></i> Орындалу реті
            </h3>
            <div style="font-size: 1.05rem; display: flex; flex-direction: column; gap: 1.2rem; line-height: 1.5; color: var(--text-secondary); font-weight: 500;">
              ${lab.steps.map((step, idx) => `
                <div class="flex gap-4">
                  <span style="background: #fef3c7; color: #d97706; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 800; font-size: 0.9rem;">${idx + 1}</span>
                  <p style="margin: 0;">${step}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="padding: 1.5rem; background: #eff6ff; border-radius: 20px; border: 1.5px dashed #bfdbfe; color: #1e40af; font-size: 0.95rem; line-height: 1.6;">
            <i data-lucide="info" size="18" style="vertical-align: middle; margin-right: 8px;"></i>
            <strong>Кеңес:</strong> Симуляцияны толық экранда ашу үшін төмендегі батырманы немесе симуляцияның оң жақ төменгі бұрышындағы белгішені басыңыз.
          </div>
        </aside> 

        <!-- Main Panel: Simulation -->
        <div id="simulation-container" style="min-height: 650px; display: flex; flex-direction: column; gap: 1.5rem;">
           <div class="glass-panel" style="flex: 1; padding: 0; overflow: hidden; border-radius: 24px; background: #000; position: relative; border: 2px solid var(--border-glass); box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
            <iframe src="${lab.phetUrl}" style="width: 100%; height: 650px; border: none;" allowfullscreen></iframe>
          </div>
          <div class="flex justify-center">
             <a href="${lab.phetUrl}" target="_blank" class="btn-secondary v-center gap-2" style="padding: 1rem 2rem; border-radius: 50px;">
                <i data-lucide="maximize" size="20"></i> ТОЛЫҚ ЭКРАНДА АШУ
             </a>
          </div>
        </div>
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

function renderWorkbook() {
  const container = document.getElementById('workbook-view');
  if (!container) return;

  const backView = state.user === 'teacher' ? 'teacher' : 'student';
  const label = "Физика пәнінен функционалдық сауаттылықты дамытуға арналған оқушының жұмыс дәптері";

  container.innerHTML = `
    <div class="animate-fade-in" style="padding: 1rem;">
      <button class="btn-secondary v-center" style="margin-bottom: 2rem; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;" onclick="navigate('${backView}')">
        <i data-lucide="arrow-left" size="18"></i> Артқа
      </button>

      <div class="glass-card flex flex-col items-center justify-center text-center" style="padding: 5rem 2rem; border-radius: 32px; min-height: 400px; border: 2px dashed var(--border-glass);">
        <div style="background: rgba(242, 109, 33, 0.1); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--accent-orange); margin-bottom: 2rem;">
          <i data-lucide="book-marked" size="40"></i>
        </div>
        <h2 class="gradient-text" style="font-size: 2rem; font-weight: 800; margin-bottom: 1.5rem; max-width: 700px;">${label}</h2>
        <p style="color: var(--text-secondary); font-size: 1.1rem; max-width: 600px; line-height: 1.6;">
          Бұл бөлім қазіргі уақытта әзірлену үстінде. Жақын арада функционалдық сауаттылықты арттыруға арналған жаңа тапсырмалар мен материалдар осында жарияланатын болады.
        </p>
        <div style="margin-top: 2.5rem; padding: 0.8rem 1.5rem; background: #fffcf0; border: 1px solid #fbbf24; border-radius: 12px; color: #92400e; font-size: 0.9rem; font-weight: 600;">
          <i data-lucide="info" size="16" style="vertical-align: middle; margin-right: 5px;"></i> Күте тұрыңыз, жаңалықтар жақын арада!
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

window.activeShopCategory = null;
window.setShopCategory = function (cat) {
  window.activeShopCategory = cat;
  renderShop();
};

function renderShop() {
  const container = document.getElementById('shop-view');
  if (!container) return;

  const p = state.studentProfile;
  if (!p.inventory) p.inventory = [];

  const category = window.activeShopCategory;

  // Header with back button and points
  let headerHtml = `
    <div class="v-center justify-between" style="margin-bottom: 2rem;">
      <button class="btn-secondary v-center" style="gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;" onclick="${category ? 'setShopCategory(null)' : "navigate('student')"}">
        <i data-lucide="arrow-left" size="18"></i> ${category ? 'Мәзірге' : 'Артқа'}
      </button>
      <div class="v-center gap-3 glass-panel" style="padding: 0.5rem 1.5rem; border-radius: 50px; border: 1.5px solid var(--accent-orange);">
        <i data-lucide="award" size="20" style="color: var(--accent-orange);"></i>
        <span style="font-weight: 800; font-size: 1.2rem;" class="rating-score-value">${p.score || 0}</span>
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">PA Point</span>
      </div>
    </div>
  `;

  if (!category) {
    // Menu View
    container.innerHTML = `
      <div class="animate-fade-in" style="padding: 1rem;">
        ${headerHtml}
        <div class="dashboard-header text-center" style="margin-bottom: 3rem;">
          <h1 class="gradient-text" style="font-size: 2.5rem; margin-bottom: 0.5rem;">Ғылым Дүкені</h1>
          <p style="color: var(--text-secondary);">Өз бейініңді ерекшелеу үшін қажетті санатты таңда</p>
        </div>

        <div class="grid gap-8" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
          <div class="feature-card voice-target animate-hover" style="cursor: pointer; padding: 3rem 2rem;" onclick="setShopCategory('avatar')">
            <div class="icon-circle" style="color: var(--accent-orange); width: 80px; height: 80px; margin-bottom: 2rem;">
              <i data-lucide="user-square" size="40"></i>
            </div>
            <h3 class="label-caps" style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 1rem;">Ғалымдар Аватарлары</h3>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Ұлы физиктердің кейпіне еніңіз.</p>
            <button class="card-btn orange label-caps">ТАҢДАУ</button>
          </div>

          <div class="feature-card voice-target animate-hover" style="cursor: pointer; padding: 3rem 2rem;" onclick="setShopCategory('title')">
            <div class="icon-circle" style="color: var(--accent-orange); width: 80px; height: 80px; margin-bottom: 2rem;">
              <i data-lucide="award" size="40"></i>
            </div>
            <h3 class="label-caps" style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 1rem;">Құрметті Титулдар</h3>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Беделді атақтарды иеленіңіз.</p>
            <button class="card-btn orange label-caps">ТАҢДАУ</button>
          </div>

          <div class="feature-card voice-target animate-hover" style="cursor: pointer; padding: 3rem 2rem;" onclick="setShopCategory('frame')">
            <div class="icon-circle" style="color: var(--accent-orange); width: 80px; height: 80px; margin-bottom: 2rem;">
              <i data-lucide="frame" size="40"></i>
            </div>
            <h3 class="label-caps" style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 1rem;">Бейін Рамкалары</h3>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Профиліңізді жарқын етіңіз.</p>
            <button class="card-btn orange label-caps">ТАҢДАУ</button>
          </div>
        </div>
      </div>
    `;
  } else {
    // Category View
    let contentHtml = '';
    let title = '';

    if (category === 'avatar') {
      title = 'Ғалымдар Аватарлары';
      contentHtml = `
        <div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
          ${SHOP_CATALOG.avatars.map(item => {
        const isOwned = p.inventory.includes(item.id);
        const isActive = p.activeIcon === item.icon;
        return `
              <div class="glass-card flex flex-col items-center text-center gap-4 animate-hover" style="padding: 2rem; border: 1.5px solid ${isActive ? 'var(--accent-orange)' : 'var(--border-glass)'};">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: ${item.bgColor}; display: flex; align-items: center; justify-content: center; color: ${item.color}; box-shadow: 0 8px 16px rgba(0,0,0,0.1); overflow: hidden;">
                  ${item.image ? `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="${item.icon}" size="36"></i>`}
                </div>
                <div>
                  <h4 style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.3rem;">${item.name}</h4>
                  <p style="font-size: 0.85rem; color: var(--text-tertiary); min-height: 2.5rem;">${item.desc}</p>
                </div>
                <div class="flex flex-col gap-2 w-full mt-2">
                  ${isOwned ? `
                    <button class="btn-${isActive ? 'secondary' : 'primary'}" style="width: 100%; font-size: 0.85rem;" onclick="${isActive ? '' : `equipShopItem('avatar', '${item.id}')`}">
                      ${isActive ? 'БЕЛСЕНДІ' : 'ТАҢДАУ'}
                    </button>
                  ` : `
                    <button class="btn-primary" style="width: 100%; font-size: 0.85rem; background: var(--text-primary);" onclick="buyShopItem('avatar', '${item.id}')">
                      ${item.price} PA Point — САТЫП АЛУ
                    </button>
                  `}
                </div>
              </div>
            `;
      }).join('')}
        </div>
      `;
    } else if (category === 'title') {
      title = 'Құрметті Титулдар';
      contentHtml = `
        <div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
          ${SHOP_CATALOG.titles.map(item => {
        const isOwned = p.inventory.includes(item.id);
        const isActive = p.activeTitle === item.name;
        return `
              <div class="glass-card flex flex-col items-center text-center gap-4 animate-hover" style="padding: 1.5rem; border: 1.5px solid ${isActive ? 'var(--accent-orange)' : 'var(--border-glass)'};">
                <div style="display: inline-block; padding: 0.4rem 1.2rem; border-radius: 50px; font-size: 0.9rem; font-weight: 800; letter-spacing: 0.5px; ${item.style || 'background: #fffcf0; border: 1px solid #fbbf24; color: #92400e;'}">
                  «${item.name}»
                </div>
                <div>
                  <p style="font-size: 0.85rem; color: var(--text-tertiary);">${item.desc}</p>
                </div>
                <div class="flex flex-col gap-2 w-full mt-1">
                  ${isOwned ? `
                    <button class="btn-${isActive ? 'secondary' : 'primary'}" style="width: 100%; font-size: 0.85rem;" onclick="${isActive ? '' : `equipShopItem('title', '${item.id}')`}">
                      ${isActive ? 'БЕЛСЕНДІ' : 'ТАҢДАУ'}
                    </button>
                  ` : `
                    <button class="btn-primary" style="width: 100%; font-size: 0.85rem; background: var(--text-primary);" onclick="buyShopItem('title', '${item.id}')">
                      ${item.price} PA Point — САТЫП АЛУ
                    </button>
                  `}
                </div>
              </div>
            `;
      }).join('')}
        </div>
      `;
    } else if (category === 'frame') {
      title = 'Бейін Рамкалары';
      contentHtml = `
        <div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
          ${SHOP_CATALOG.frames.map(item => {
        const isOwned = p.inventory.includes(item.id);
        const isActive = p.activeFrame === item.style;
        return `
              <div class="glass-card flex flex-col items-center text-center gap-4 animate-hover" style="padding: 2rem; border: 1.5px solid ${isActive ? 'var(--accent-orange)' : 'var(--border-glass)'};">
                <div style="width: 80px; height: 80px; border-radius: 50%; ${item.style} display: flex; align-items: center; justify-content: center;">
                  <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--bg-glass-bright); display: flex; align-items: center; justify-content: center; color: var(--text-tertiary);">
                    <i data-lucide="user" size="24"></i>
                  </div>
                </div>
                <div>
                  <h4 style="font-weight: 800; font-size: 1.1rem; margin-bottom: 0.3rem;">${item.name}</h4>
                  <p style="font-size: 0.85rem; color: var(--text-tertiary);">${item.desc}</p>
                </div>
                <div class="flex flex-col gap-2 w-full mt-2">
                  ${isOwned ? `
                    <button class="btn-${isActive ? 'secondary' : 'primary'}" style="width: 100%; font-size: 0.85rem;" onclick="${isActive ? '' : `equipShopItem('frame', '${item.id}')`}">
                      ${isActive ? 'БЕЛСЕНДІ' : 'ТАҢДАУ'}
                    </button>
                  ` : `
                    <button class="btn-primary" style="width: 100%; font-size: 0.85rem; background: var(--text-primary);" onclick="buyShopItem('frame', '${item.id}')">
                      ${item.price} PA Point — САТЫП АЛУ
                    </button>
                  `}
                </div>
              </div>
            `;
      }).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="animate-fade-in" style="padding: 1rem;">
        ${headerHtml}
        <h2 class="label-caps mb-8" style="font-size: 1.5rem; color: var(--text-primary); border-left: 4px solid var(--accent-orange); padding-left: 1rem;">${title}</h2>
        ${contentHtml}
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

function renderStudentDashboard() {
  const studentView = document.getElementById('student-view');
  if (!studentView) return;

  // Recalculate score from all lessons
  if (typeof calculateTotalStudentScore === 'function') {
    state.studentProfile.score = calculateTotalStudentScore();
    saveState();
  }
  const p = state.studentProfile;
  const hasShop = (typeof SHOP_CATALOG !== 'undefined');
  const activeAvatar = (p.activeIcon && hasShop) ? SHOP_CATALOG.avatars.find(a => a.icon === p.activeIcon) : null;
  const activeBg = activeAvatar ? activeAvatar.bgColor : 'var(--primary-gradient)';
  const activeTitleItem = (p.activeTitle && hasShop) ? SHOP_CATALOG.titles.find(t => t.name === p.activeTitle) : null;

  studentView.innerHTML = `
      <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar-panel glass-panel animate-slide-in">
          
          <div class="flex flex-col items-center gap-4 text-center">
            <div style="width: 100px; height: 100px; border-radius: 50%; background: ${activeBg}; display: flex; align-items: center; justify-content: center; border: 3px solid var(--border-glass); overflow: hidden; position: relative; ${p.activeFrame || ''}">
              ${(activeAvatar && activeAvatar.image) ? `<img src="${activeAvatar.image}" style="width: 100%; height: 100%; object-fit: cover;">` : (p.activeIcon ? `<i data-lucide="${p.activeIcon}" size="48" style="color: var(--text-primary);"></i>` : (p.avatar ? `<img src="${p.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="user" size="48" style="color: var(--text-primary);"></i>`))}
            </div>
            <div style="text-align: center; width: 100%;">
              <h3 style="font-size: var(--font-xl); font-weight: 700; margin-bottom: 0.4rem; text-align: center;">${p.name}</h3>
              ${p.activeTitle ? `<div style="display: inline-block; padding: 0.35rem 1.2rem; border-radius: 50px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.6rem; ${activeTitleItem ? activeTitleItem.style : 'background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fcd34d; color: #92400e;'}">«${p.activeTitle}»</div>` : '<p style="color: var(--text-secondary); font-size: var(--font-sm); text-align: center; display: block; margin: 0 auto; margin-bottom: 0.4rem;">Оқушы</p>'}
            </div>
        </div>

        <div class="flex flex-col gap-2" style="background: rgba(255,255,255,0.6); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="award" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">PA Point</span>
              <span class="rating-score-value" style="font-weight: 800; font-size: var(--font-base); color: var(--accent-orange); line-height: 1.3;">${p.score || 0}</span>
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

          <!-- Card 5: Assignments -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="clipboard-list" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Тапсырмалар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Өздік жұмыс тапсырмаларын орындап, біліміңді тексер.</p>
            <button class="card-btn orange label-caps" onclick="window.showAssignments('student-content', 'student')">КІРУ</button>
          </div>

          <!-- Card 6: Lab Works -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="flask-conical" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Зертханалық жұмыстар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Интерактивті симуляциялар мен тәжірибелерді жасаңыз.</p>
            <button class="card-btn orange label-caps" onclick="navigate('labs')">КІРУ</button>
          </div>

          <!-- Card 7: Workbook -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="book-marked" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Жұмыс дәптері</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Функционалдық сауаттылықты дамытуға арналған тапсырмалар.</p>
            <button class="card-btn orange label-caps" onclick="navigate('workbook')">КІРУ</button>
          </div>

          <!-- Card 8: Shop -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="shopping-bag" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Ғылым Дүкені</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">PA Point ұпайларын аватарлар мен рамкаларға айырбаста.</p>
            <button class="card-btn orange label-caps" onclick="navigate('shop')">КІРУ</button>
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

let freeFallLabState = {
  h: 50,
  isSolved: false,
  feedback: ''
};

function renderFreeFallLab() {
  setTimeout(() => {
    updateFreeFallSim(freeFallLabState.h);
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="animate-scale-in" style="padding: 1rem;">
      <!-- Lab Report Header -->
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #f0f9ff; padding: 2rem; border-radius: 28px; border: 1.5px solid #bae6fd;">
        <div>
          <h3 style="color: #0369a1; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№1: Еркін түсуді зерттеу</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #0c4a6e;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Дененің еркін түсу уақыты мен жылдамдығының биіктікке тәуелділігін зерделеу.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #7dd3fc; margin-top: 1rem;">
             <p style="font-weight: 800; color: #0369a1; margin-bottom: 8px;" class="label-caps">Формула:</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #0c4a6e; font-family: 'Outfit', sans-serif;">v = <span style="font-size: 1.2rem; vertical-align: middle;">√</span><span style="border-top: 2px solid #0c4a6e; padding-top: 2px;">2 · g · h</span></div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #bae6fd;">
          <h4 style="font-weight: 800; color: #0369a1; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
            <i data-lucide="list-checks" size="20"></i> Жұмыс барысы:
          </h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #0c4a6e; padding-left: 1.2rem; font-weight: 600;">
            <li>Биіктікті ($h$) таңдаңыз.</li>
            <li>"ТҮСІРУ" басып, қозғалысты бақылаңыз.</li>
            <li>Формула арқылы соңғы жылдамдықты ($v$) есептеңіз ($g \approx 10$ м/с²).</li>
            <li>Есептелген мәнді оң жақтағы тексеру ұяшығына енгізіңіз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
        <!-- Simulation Area -->
        <div class="flex flex-col gap-6">
          <div id="ff-sim-stage" style="height: 440px; background: linear-gradient(to bottom, #f0f9ff, #e0f2fe); border-radius: 32px; border: 1px solid var(--border-glass); position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
             <!-- SVG injected here -->
          </div>
          
          <div class="glass-panel flex flex-wrap justify-between items-center gap-4" style="padding: 1.5rem; border-radius: 24px;">
            <div class="flex items-center gap-4">
              <span class="label-caps" style="font-weight: 800; color: var(--text-secondary); font-size: 0.8rem;">Биіктік (h):</span>
              <div class="flex gap-2">
                <button class="lab-btn ${freeFallLabState.h === 10 ? 'active' : ''}" onclick="updateFreeFallSim(10)">10м</button>
                <button class="lab-btn ${freeFallLabState.h === 20 ? 'active' : ''}" onclick="updateFreeFallSim(20)">20м</button>
                <button class="lab-btn ${freeFallLabState.h === 45 ? 'active' : ''}" onclick="updateFreeFallSim(45)">45м</button>
                <button class="lab-btn ${freeFallLabState.h === 80 ? 'active' : ''}" onclick="updateFreeFallSim(80)">80м</button>
              </div>
            </div>
            
            <button class="btn-primary v-center gap-2" onclick="startFreeFallAnim()" id="ff-start-btn" style="padding: 1rem 2rem; border-radius: 12px; font-weight: 900;">
              <i data-lucide="play-circle" size="20"></i> ТҮСІРУ
            </button>
          </div>
        </div>

        <!-- Calculation Side -->
        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 1.5rem; background: #f8fafc; border-radius: 20px;">
             <div id="ff-data-live" style="font-weight: 700; color: var(--text-secondary);">
                <div class="flex justify-between"><span>Уақыт (t):</span> <span id="ff-res-t" style="color: #64748b;">0.00 с</span></div>
                <div class="flex justify-between mt-2"><span>Жылдамдық (v):</span> <span id="ff-res-v" style="color: #64748b;">0.0 м/с</span></div>
             </div>
          </div>

          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #f97316; border-radius: 28px;">
            <h4 class="v-center gap-2" style="font-weight: 900; color: #9a3412; margin-bottom: 2rem; font-size: 1.1rem;">
              <i data-lucide="calculator" size="20" style="color: #f97316;"></i> ЖЫЛДАМДЫҚТЫ ЕСЕПТЕУ
            </h4>

            <div class="flex flex-col gap-4">
               <div class="flex justify-between items-center" style="padding: 0.8rem; background: #fff7ed; border-radius: 12px;">
                 <span style="font-weight: 700; color: #9a3412;">Биіктік (h):</span>
                 <span id="ff-calc-h" style="font-weight: 900; color: #c2410c;">${freeFallLabState.h} м</span>
               </div>
               <div class="flex justify-between items-center" style="padding: 0.8rem; background: #fff7ed; border-radius: 12px;">
                 <span style="font-weight: 700; color: #9a3412;">Тұрақты (g):</span>
                 <span style="font-weight: 900; color: #c2410c;">10 м/с²</span>
               </div>
               
               <div style="padding: 1.2rem; background: #fff7ed; border-radius: 20px; border: 2px solid #ffedd5; text-align: center;">
                 <p style="font-weight: 800; color: #9a3412; font-size: 0.8rem; margin-bottom: 0.5rem;" class="label-caps">Жылдамдық (v = √2gh):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="ff-calc-v" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #fed7aa; font-size: 1.2rem; font-weight: 900; text-align: center; color: #c2410c;" ${freeFallLabState.isSolved ? 'disabled' : ''}>
                    <span style="font-size: 1.2rem; font-weight: 900; color: #9a3412;">м/с</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; padding: 0.8rem; border-radius: 12px; background: #f97316;" onclick="checkFreeFallCalculation()" ${freeFallLabState.isSolved ? 'disabled' : ''}>
                   ${freeFallLabState.isSolved ? 'ДҰРЫС' : 'ТЕКСЕРУ'}
                 </button>
               </div>
               <div id="ff-feedback">${freeFallLabState.feedback}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateFreeFallSim(h) {
  freeFallLabState.h = h;
  freeFallLabState.isSolved = false;
  freeFallLabState.feedback = '';

  const stage = document.getElementById('ff-sim-stage');
  const hLabel = document.getElementById('ff-calc-h');
  const feed = document.getElementById('ff-feedback');
  const input = document.getElementById('ff-calc-v');
  const btn = document.querySelector('[onclick="checkFreeFallCalculation()"]');

  if (hLabel) hLabel.innerText = `${h} м`;
  if (feed) feed.innerHTML = '';
  if (input) { input.value = ''; input.disabled = false; }
  if (btn) { btn.disabled = false; btn.innerText = 'ТЕКСЕРУ'; }

  const btns = document.querySelectorAll('.lab-btn');
  btns.forEach(b => {
    if (b.innerText.includes(h + 'м')) b.classList.add('active');
    else b.classList.remove('active');
  });

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
        </linearRadialGradient>
      </defs>
      <rect width="400" height="600" fill="url(#skyGrad)" />
      ${[0, 20, 40, 60, 80, 100].map(m => `
        <line x1="50" y1="${550 - m * 5}" x2="80" y2="${550 - m * 5}" stroke="#94a3b8" stroke-width="2" />
        <text x="40" y="${555 - m * 5}" font-size="14" font-weight="800" fill="#64748b" text-anchor="end">${m}м</text>
      `).join('')}
      <line x1="20" y1="550" x2="380" y2="550" stroke="#334155" stroke-width="12" stroke-linecap="round" />
      <rect x="160" y="${holderY}" width="80" height="15" fill="#1e293b" rx="4" />
      <circle id="ff-ball" cx="200" cy="${ballCy}" r="20" fill="#F26D21" stroke="white" stroke-width="3" />
      <text x="200" y="${holderY - 15}" text-anchor="middle" font-size="18" font-weight="900" fill="var(--accent-orange)">Биіктік: ${h}м</text>
    </svg>
  `;
}

function checkFreeFallCalculation() {
  const input = document.getElementById('ff-calc-v');
  const feed = document.getElementById('ff-feedback');
  const btn = document.querySelector('[onclick="checkFreeFallCalculation()"]');
  if (!input || !feed) return;

  const correct = Math.sqrt(2 * 10 * freeFallLabState.h).toFixed(1);
  const user = parseFloat(input.value).toFixed(1);

  if (Math.abs(correct - user) < 0.2) {
    freeFallLabState.isSolved = true;
    feed.innerHTML = '<div style="color:#16a34a; font-weight:800; margin-top:0.5rem;">Дұрыс! Келесіге өтсеңіз болады.</div>';
    input.disabled = true;
    btn.disabled = true;
    if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
    if (window.triggerSalute) triggerSalute();
  } else {
    feed.innerHTML = '<div style="color:#dc2626; font-size:0.8rem; margin-top:0.5rem;">Қате. v = √2gh формуласын қолдан.</div>';
  }
}

function startFreeFallAnim() {
  const ball = document.getElementById('ff-ball');
  const btn = document.getElementById('ff-start-btn');
  if (!ball || !btn || btn.disabled) return;

  btn.disabled = true;
  const h = freeFallLabState.h;
  const tFinal = Math.sqrt(2 * h / 10);
  const startTIme = performance.now();
  const startY = parseFloat(ball.getAttribute('cy'));

  function step(now) {
    const dt = (now - startTIme) / 1000;
    if (dt < tFinal) {
      const cy = startY + (0.5 * 10 * dt * dt * 5);
      ball.setAttribute('cy', cy);
      document.getElementById('ff-res-t').innerText = dt.toFixed(2) + " с";
      document.getElementById('ff-res-v').innerText = (10 * dt).toFixed(1) + " м/с";
      requestAnimationFrame(step);
    } else {
      ball.setAttribute('cy', startY + (h * 5));
      document.getElementById('ff-res-t').innerText = tFinal.toFixed(2) + " с";
      document.getElementById('ff-res-v').innerText = (10 * tFinal).toFixed(1) + " м/с";
      setTimeout(() => {
        btn.disabled = false;
        ball.setAttribute('cy', startY);
      }, 2000);
    }
  }
  requestAnimationFrame(step);
}

const impulseLabState = {
  m1: 2,
  v1: 5,
  m2: 4,
  type: 'elastic',
  isSolved: false,
  feedback: ''
};

function checkImpulseCalculation() {
  const input = document.getElementById('imp-calc-p');
  const feed = document.getElementById('imp-feedback');
  if (!input || !feed) return;

  const m1 = parseFloat(document.getElementById('m1-range').value);
  const v1 = parseFloat(document.getElementById('v1-range').value);
  const correct = m1 * v1;
  const user = parseFloat(input.value);

  if (Math.abs(correct - user) < 0.1) {
    impulseLabState.isSolved = true;
    feed.innerHTML = '<div style="color:#16a34a; font-weight:800; margin-top:0.5rem;">Дұрыс! Импульс дұрыс есептелді.</div>';
    if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
    if (window.triggerSalute) triggerSalute();
  } else {
    feed.innerHTML = '<div style="color:#dc2626; font-size:0.8rem; margin-top:0.5rem;">Қате. p = m · v формуласын қолдан.</div>';
  }
}

function renderImpulseLab() {
  setTimeout(() => {
    updateImpulseSim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="animate-scale-in" style="padding: 1rem;">
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #fdf2f8; padding: 2rem; border-radius: 28px; border: 1.5px solid #fce7f3;">
        <div>
          <h3 style="color: #9d174d; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№2: Денелердің соқтығысуы</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #831843;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Соқтығыс кезіндегі импульстің сақталуын зерттеу.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #fbcfe8; margin-top: 1rem;">
             <p style="font-weight: 800; color: #9d174d; margin-bottom: 8px;" class="label-caps">Формула:</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #831843;">p = m · v</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #fce7f3;">
          <h4 style="font-weight: 800; color: #9d174d; margin-bottom: 1rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #831843; padding-left: 1.2rem; font-weight: 600;">
            <li>Масса мен жылдамдықты таңдаңыз.</li>
            <li>Импульсті (p = mv) есептеп, мәнін енгізіңіз.</li>
            <li>"БАСТАУ" басып, соқтығысты бақылаңыз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
        <div class="flex flex-col gap-6">
          <div id="impulse-sim-stage" style="height: 380px; background: #f8fafc; border-radius: 32px; border: 1px solid var(--border-glass); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;"></div>
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 24px;">
             <div class="grid grid-cols-2 gap-8">
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #6366f1;">m₁ массасы:</span>
                 <input type="range" id="m1-range" min="1" max="10" value="2" oninput="updateImpulseSim()" style="width: 100%;">
                 <span id="m1-val" style="font-weight: 800; color: #6366f1;">2кг</span>
               </div>
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #06b6d4;">v₁ жылдамдығы:</span>
                 <input type="range" id="v1-range" min="1" max="10" value="5" oninput="updateImpulseSim()" style="width: 100%;">
                 <span id="v1-val" style="font-weight: 800; color: #06b6d4;">5м/с</span>
               </div>
             </div>
             
             <div class="flex items-center gap-6" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #fbcfe8;">
                <div class="flex flex-col gap-2" style="flex: 1;">
                   <span class="label-caps" style="font-weight: 800; color: #06b6d4;">m₂ (Оң жақ):</span>
                   <input type="range" id="m2-range" min="1" max="10" value="4" oninput="updateImpulseSim()" style="width: 100%;">
                   <span id="m2-val" style="font-weight: 800; color: #06b6d4;">4кг</span>
                </div>
                <div class="flex flex-col gap-2" style="flex: 1;">
                   <span class="label-caps" style="font-weight: 800;">Түрі:</span>
                   <select id="collision-type" onchange="updateImpulseSim()" style="padding: 0.6rem; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 700;">
                     <option value="elastic">Серпімді</option>
                     <option value="inelastic">Серпімсіз</option>
                   </select>
                </div>
             </div>
             <button id="start-imp-btn" class="btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; border-radius: 12px;" onclick="startImpulseAnim()">БАСТАУ</button>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #ec4899; border-radius: 28px;">
            <h4 style="font-weight: 900; color: #9d174d; margin-bottom: 2rem;">ЕСЕПТЕУ</h4>
            <div class="flex flex-col gap-4">
               <div style="padding: 1.2rem; background: #fdf2f8; border-radius: 20px; border: 2px solid #fce7f3; text-align: center;">
                 <p style="font-weight: 800; color: #9d174d; margin-bottom: 0.5rem;" class="label-caps">Импульс (p = m₁v₁):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="imp-calc-p" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #fbcfe8; font-size: 1.2rem; font-weight: 900; text-align: center; color: #be185d;">
                    <span style="font-size: 1rem; font-weight: 900; color: #9d174d;">кг·м/с</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; background: #ec4899;" onclick="checkImpulseCalculation()">ТЕКСЕРУ</button>
               </div>
               <div id="imp-feedback"></div>
            </div>
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
  isSolved: false,
  feedback: '',
  isMoving: false
};

function renderNewton3Lab() {
  setTimeout(() => {
    updateNewton3Sim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="animate-scale-in" style="padding: 1rem;">
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #fff1f2; padding: 2rem; border-radius: 28px; border: 1.5px solid #fecdd3;">
        <div>
          <h3 style="color: #9f1239; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№6: Әрекет және қарсы әрекет</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #881337;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Денелердің өзара әрекеттесу күштерінің теңдігін бақылау.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #fecdd3; margin-top: 1rem;">
             <p style="font-weight: 800; color: #9f1239; margin-bottom: 8px;" class="label-caps">Формула:</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #e11d48; font-family: 'Outfit', sans-serif;">F₁ = -F₂</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #fecdd3;">
          <h4 style="font-weight: 800; color: #9f1239; margin-bottom: 1rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #881337; padding-left: 1.2rem; font-weight: 600;">
            <li>Әсер етуші күшті ($F_1$) таңдаңыз.</li>
            <li>Қарсы әрекет етуші күштің ($F_2$) мәнін жазыңыз.</li>
            <li>"БАСТАУ" басып, динамометрлерді бақылаңыз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
        <div class="flex flex-col gap-6">
          <div id="newton3-sim-stage" style="height: 350px; background: white; border-radius: 32px; border: 1px solid var(--border-glass); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;"></div>
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 24px;">
             <div class="flex flex-col gap-4">
               <span class="label-caps" style="font-weight: 800; color: #9f1239;">Әсер етуші күш (F₁):</span>
               <input type="range" id="n3-f-range" min="10" max="100" step="10" value="20" oninput="updateNewton3Value()" style="width: 100%;">
               <div class="flex justify-between font-bold" style="color: #e11d48;">
                   <span>10 Н</span>
                   <span id="n3-f-val">20 Н</span>
                   <span>100 Н</span>
               </div>
               <button id="n3-start-btn" class="btn-primary" style="width: 100%; margin-top: 1rem; padding: 1rem; border-radius: 12px; background: #e11d48;" onclick="startNewton3Anim()">БАСТАУ</button>
             </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #e11d48; border-radius: 28px;">
            <h4 style="font-weight: 900; color: #9f1239; margin-bottom: 2rem;">КҮШТІ ТЕКСЕРУ</h4>
            <div class="flex flex-col gap-4">
               <div style="padding: 1.2rem; background: #fff1f2; border-radius: 20px; border: 2px solid #fecdd3; text-align: center;">
                 <p style="font-weight: 800; color: #9f1239; margin-bottom: 0.5rem;" class="label-caps">Қарсы әрекет күші (F₂):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="n3-calc-f" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #fda4af; font-size: 1.2rem; font-weight: 900; text-align: center; color: #e11d48;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #9f1239;">Н</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; background: #e11d48;" onclick="checkNewton3Calculation()">ТЕКСЕРУ</button>
               </div>
               <div id="n3-feedback"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateNewton3Value() {
  newton3LabState.f = parseFloat(document.getElementById('n3-f-range').value);
  document.getElementById('n3-f-val').innerText = newton3LabState.f + " Н";
  updateNewton3Sim();
}

function updateNewton3Sim() {
  const stage = document.getElementById('newton3-sim-stage');
  if (!stage) return;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 350">
      <line x1="100" y1="220" x2="700" y2="220" stroke="#94a3b8" stroke-width="2" />
      <g id="n3-s1" transform="translate(340, 160)">
         <rect x="0" y="0" width="60" height="50" rx="4" fill="#6366f1" />
         <circle cx="15" cy="55" r="8" fill="#1e293b" />
         <circle cx="45" cy="55" r="8" fill="#1e293b" />
         <text x="30" y="30" text-anchor="middle" fill="white" font-weight="900">m₁</text>
         <rect x="60" y="20" width="60" height="10" fill="#cbd5e1" />
         <text x="90" y="15" text-anchor="middle" font-size="12" font-weight="900" fill="#6366f1">-${newton3LabState.f} Н</text>
      </g>
      <g id="n3-s2" transform="translate(400, 160)">
         <rect x="0" y="0" width="60" height="50" rx="4" fill="#ec4899" />
         <circle cx="15" cy="55" r="8" fill="#1e293b" />
         <circle cx="45" cy="55" r="8" fill="#1e293b" />
         <text x="30" y="30" text-anchor="middle" fill="white" font-weight="900">m₂</text>
         <rect x="-60" y="20" width="60" height="10" fill="#cbd5e1" />
         <text x="-30" y="15" text-anchor="middle" font-size="12" font-weight="900" fill="#ec4899">+${newton3LabState.f} Н</text>
      </g>
    </svg>
  `;
}

function checkNewton3Calculation() {
  const input = document.getElementById('n3-calc-f');
  const feed = document.getElementById('n3-feedback');
  if (!input || !feed) return;

  const correct = newton3LabState.f;
  const user = Math.abs(parseFloat(input.value));

  if (correct === user) {
    newton3LabState.isSolved = true;
    feed.innerHTML = '<div style="color:#16a34a; font-weight:800; margin-top:0.5rem;">Дұрыс! Әрекет қарсы әрекетке тең.</div>';
    if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
    if (window.triggerSalute) triggerSalute();
  } else {
    feed.innerHTML = '<div style="color:#dc2626; font-size:0.8rem; margin-top:0.5rem;">Қате. Күштердің модулі тең болуы керек.</div>';
  }
}

function startNewton3Anim() {
  const s1 = document.getElementById('n3-s1');
  const s2 = document.getElementById('n3-s2');
  const btn = document.getElementById('n3-start-btn');
  if (!s1 || !s2 || !btn || btn.disabled) return;

  btn.disabled = true;
  let x1 = 340, x2 = 400;
  let v1 = 0, v2 = 0;
  const a = newton3LabState.f / 10;

  function step() {
    v1 -= a * 0.016;
    v2 += a * 0.016;
    x1 += v1;
    x2 += v2;
    if (x1 < 50 || x2 > 700) {
      btn.disabled = false;
      setTimeout(() => {
        s1.setAttribute('transform', 'translate(340, 160)');
        s2.setAttribute('transform', 'translate(400, 160)');
      }, 2000);
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
    <div class="animate-scale-in" style="padding: 1rem;">
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #faf5ff; padding: 2rem; border-radius: 28px; border: 1.5px solid #f3e8ff;">
        <div>
          <h3 style="color: #7e22ce; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№7: Бүкіләлемдік тартылыс</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #6b21a8;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Тартылыс күшінің масса мен қашықтыққа тәуелділігін зерттеу.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #e9d5ff; margin-top: 1rem;">
             <p style="font-weight: 800; color: #7e22ce; margin-bottom: 8px;" class="label-caps">Формула (G≈1):</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #9333ea; font-family: 'Outfit', sans-serif;">F = (m₁ · m₂) / r²</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #f3e8ff;">
          <h4 style="font-weight: 800; color: #7e22ce; margin-bottom: 1rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #6b21a8; padding-left: 1.2rem; font-weight: 600;">
            <li>Массаларды ($m_1, m_2$) және қашықтықты ($r$) таңдаңыз.</li>
            <li>Күшті ($F = \frac{m_1 m_2}{r^2}$) есептеп, мәнін енгізіңіз.</li>
            <li>"ТЕКСЕРУ" басып, нәтижені көріңіз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
        <div class="flex flex-col gap-6">
          <div id="gravity-sim-stage" style="height: 380px; background: #0c0a09; border-radius: 32px; border: 1px solid #2e1065; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;"></div>
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 24px;">
             <div class="grid grid-cols-3 gap-6">
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #7e22ce;">m1 (кг):</span>
                 <input type="range" id="grav-m1-range" min="10" max="200" step="10" value="100" oninput="updateGravityValue()" style="width: 100%;">
                 <span id="grav-m1-v" style="font-weight: 800; color: #9333ea;">100 кг</span>
               </div>
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #7e22ce;">m2 (кг):</span>
                 <input type="range" id="grav-m2-range" min="10" max="200" step="10" value="100" oninput="updateGravityValue()" style="width: 100%;">
                 <span id="grav-m2-v" style="font-weight: 800; color: #9333ea;">100 кг</span>
               </div>
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #7e22ce;">r (м):</span>
                 <input type="range" id="grav-dist-range" min="50" max="300" step="10" value="100" oninput="updateGravityValue()" style="width: 100%;">
                 <span id="grav-dist-v" style="font-weight: 800; color: #9333ea;">100 м</span>
               </div>
             </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #9333ea; border-radius: 28px;">
            <h4 style="font-weight: 900; color: #6b21a8; margin-bottom: 2rem;">КҮШТІ ЕСЕПТЕУ</h4>
            <div class="flex flex-col gap-4">
               <div style="padding: 1.2rem; background: #faf5ff; border-radius: 20px; border: 2px solid #f3e8ff; text-align: center;">
                 <p style="font-weight: 800; color: #7e22ce; margin-bottom: 0.5rem;" class="label-caps">Тартылыс күші (F):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="grav-calc-f" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #d8b4fe; font-size: 1.2rem; font-weight: 900; text-align: center; color: #7e22ce;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #9333ea;">Н</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; background: #9333ea;" onclick="checkGravityCalculation()">ТЕКСЕРУ</button>
               </div>
               <div id="grav-feedback"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateGravityValue() {
  gravityLabState.m1 = parseFloat(document.getElementById('grav-m1-range').value);
  gravityLabState.m2 = parseFloat(document.getElementById('grav-m2-range').value);
  gravityLabState.dist = parseFloat(document.getElementById('grav-dist-range').value);

  document.getElementById('grav-m1-v').innerText = gravityLabState.m1 + " кг";
  document.getElementById('grav-m2-v').innerText = gravityLabState.m2 + " кг";
  document.getElementById('grav-dist-v').innerText = gravityLabState.dist + " м";
  updateGravitySim();
}

function updateGravitySim() {
  const stage = document.getElementById('gravity-sim-stage');
  if (!stage) return;

  const r1 = Math.sqrt(gravityLabState.m1) * 2;
  const r2 = Math.sqrt(gravityLabState.m2) * 2;
  const cx = 400;
  const cy = 190;
  const offset = gravityLabState.dist / 2;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 380">
      <defs>
        <radialGradient id="gradPlanet1">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </radialGradient>
        <radialGradient id="gradPlanet2">
          <stop offset="0%" stop-color="#ec4899" />
          <stop offset="100%" stop-color="#be185d" />
        </radialGradient>
      </defs>
      <circle cx="${cx - offset}" cy="${cy}" r="${r1}" fill="url(#gradPlanet1)" />
      <circle cx="${cx + offset}" cy="${cy}" r="${r2}" fill="url(#gradPlanet2)" />
      <line x1="${cx - offset}" y1="${cy + 50}" x2="${cx + offset}" y2="${cy + 50}" stroke="#a78bfa" stroke-width="2" stroke-dasharray="5,5" />
      <text x="${cx}" y="${cy + 70}" text-anchor="middle" fill="#a78bfa" font-weight="800">r = ${gravityLabState.dist} м</text>
    </svg>
  `;
}

function checkGravityCalculation() {
  const input = document.getElementById('grav-calc-f');
  const feed = document.getElementById('grav-feedback');
  if (!input || !feed) return;

  const correct = (gravityLabState.m1 * gravityLabState.m2) / Math.pow(gravityLabState.dist, 2);
  const user = parseFloat(input.value);

  if (Math.abs(correct - user) / (correct || 1) < 0.1) {
    gravityLabState.isSolved = true;
    feed.innerHTML = '<div style="color:#16a34a; font-weight:800; margin-top:0.5rem;">Дұрыс! Тартылыс күші есептелді.</div>';
    if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
    if (window.triggerSalute) triggerSalute();
  } else {
    feed.innerHTML = `<div style="color:#dc2626; font-size:0.8rem; margin-top:0.5rem;">Қате. (m₁·m₂)/r² екенін ұмытпа. Жауап: ${correct.toFixed(3)}</div>`;
  }
}


// Density Lab State
let densityLabState = {
  material: 'gold',
  mass: 193,
  volume: 10,
  isSolved: false,
  feedback: ''
};

function renderDensityLab() {
  setTimeout(() => {
    updateDensitySim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="animate-scale-in" style="padding: 1rem;">
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #eff6ff; padding: 2rem; border-radius: 28px; border: 1.5px solid #dbeafe;">
        <div>
          <h3 style="color: #1e40af; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№8: Заттың тығыздығы</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #1e3a8a;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Масса мен көлем арқылы тығыздықты анықтау.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #bfdbfe; margin-top: 1rem;">
             <p style="font-weight: 800; color: #1e40af; margin-bottom: 8px;" class="label-caps">Формула:</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #3b82f6; font-family: 'Outfit', sans-serif;">ρ = m / V</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #dbeafe;">
          <h4 style="font-weight: 800; color: #1e40af; margin-bottom: 1rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #1e3a8a; padding-left: 1.2rem; font-weight: 600;">
            <li>Материалды таңдап, көлемін ($V$) реттеңіз.</li>
            <li>Тығыздықты ($\rho = m/V$) есептеп, мәнін енгізіңіз.</li>
            <li>"ТЕКСЕРУ" басып, нәтижені көріңіз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
        <div class="flex flex-col gap-6">
          <div id="density-sim-stage" style="height: 380px; background: white; border-radius: 32px; border: 1px solid var(--border-glass); position: relative; overflow: hidden; display: flex; align-items: flex-end; justify-content: center;"></div>
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 24px;">
             <div class="grid grid-cols-2 gap-8">
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #1e40af;">Материал:</span>
                 <select id="dens-mat-select" onchange="updateDensityValue()" style="padding: 0.6rem; border-radius: 10px; border: 1px solid #bfdbfe; font-weight: 700;">
                    <option value="gold">Алтын (m = 19.3V)</option>
                    <option value="iron">Темір (m = 7.8V)</option>
                    <option value="wood">Ағаш (m = 0.7V)</option>
                 </select>
               </div>
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #1e40af;">Көлем (V):</span>
                 <input type="range" id="dens-vol-range" min="10" max="50" step="10" value="10" oninput="updateDensityValue()" style="width: 100%;">
                 <span id="dens-vol-v" style="font-weight: 800; color: #3b82f6;">10 см³</span>
               </div>
             </div>
             <div id="dens-mass-display" style="margin-top: 1rem; text-align: center; font-weight: 900; color: #1e3a8a; font-size: 1.2rem;">m = 193 г</div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #3b82f6; border-radius: 28px;">
            <h4 style="font-weight: 900; color: #1e40af; margin-bottom: 2rem;">ТЫҒЫЗДЫҚТЫ ЕСЕПТЕУ</h4>
            <div class="flex flex-col gap-4">
               <div style="padding: 1.2rem; background: #eff6ff; border-radius: 20px; border: 2px solid #dbeafe; text-align: center;">
                 <p style="font-weight: 800; color: #1e40af; margin-bottom: 0.5rem;" class="label-caps">Тығыздық (г/см³):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="dens-calc-rho" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #bfdbfe; font-size: 1.2rem; font-weight: 900; text-align: center; color: #1e40af;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #3b82f6;">г/см³</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; background: #3b82f6;" onclick="checkDensityCalculation()">ТЕКСЕРУ</button>
               </div>
               <div id="dens-feedback"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateDensityValue() {
  const mat = document.getElementById('dens-mat-select').value;
  const vol = parseFloat(document.getElementById('dens-vol-range').value);
  const densities = { gold: 19.3, iron: 7.8, wood: 0.7 };

  densityLabState.material = mat;
  densityLabState.volume = vol;
  densityLabState.mass = (densities[mat] * vol).toFixed(1);

  document.getElementById('dens-vol-v').innerText = vol + " см³";
  document.getElementById('dens-mass-display').innerText = `m = ${densityLabState.mass} г`;
  updateDensitySim();
}

function updateDensitySim() {
  const stage = document.getElementById('density-sim-stage');
  if (!stage) return;
  const color = densityLabState.material === 'gold' ? '#facc15' : densityLabState.material === 'iron' ? '#94a3b8' : '#b45309';
  const size = Math.pow(densityLabState.volume, 1 / 3) * 25;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 350">
      <rect x="300" y="100" width="200" height="200" fill="#bae6fd" opacity="0.6" stroke="#0ea5e9" stroke-width="2" />
      <path d="M 500 120 L 530 120 L 530 250" fill="none" stroke="#0ea5e9" stroke-width="8" stroke-linecap="round" />
      <rect x="510" y="250" width="40" height="50" fill="#bae6fd" opacity="0.6" stroke="#0ea5e9" stroke-width="2" />
      <rect x="${400 - size / 2}" y="${300 - size}" width="${size}" height="${size}" fill="${color}" rx="4" stroke="rgba(0,0,0,0.1)" />
      <text x="400" y="${300 - size - 10}" text-anchor="middle" font-size="12" font-weight="900" fill="${color}">${densityLabState.material.toUpperCase()}</text>
    </svg>
  `;
}

function checkDensityCalculation() {
  const input = document.getElementById('dens-calc-rho');
  const feed = document.getElementById('dens-feedback');
  if (!input || !feed) return;

  const densities = { gold: 19.3, iron: 7.8, wood: 0.7 };
  const correct = densities[densityLabState.material];
  const user = parseFloat(input.value);

  if (Math.abs(correct - user) < 0.1) {
    densityLabState.isSolved = true;
    feed.innerHTML = '<div style="color:#16a34a; font-weight:800; margin-top:0.5rem;">Дұрыс! Тығыздық анықталды.</div>';
    if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
    if (window.triggerSalute) triggerSalute();
  } else {
    feed.innerHTML = '<div style="color:#dc2626; font-size:0.8rem; margin-top:0.5rem;">Қате. ρ = m / V формуласын қолдан.</div>';
  }
}

// Pressure Lab State
// Pressure Lab State
let pressureLabState = {
  force: 50,
  area: 1,
  isSolved: false,
  feedback: ''
};

function renderPressureLab() {
  setTimeout(() => {
    updatePressureSim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="animate-scale-in" style="padding: 1rem;">
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #fff7ed; padding: 2rem; border-radius: 28px; border: 1.5px solid #ffedd5;">
        <div>
          <h3 style="color: #9a3412; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№9: Қысымды зерттеу</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #7c2d12;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Күш пен ауданның қысымға әсерін зерттеу.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #ffedd5; margin-top: 1rem;">
             <p style="font-weight: 800; color: #9a3412; margin-bottom: 8px;" class="label-caps">Формула:</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #f97316; font-family: 'Outfit', sans-serif;">P = F / S</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #ffedd5;">
          <h4 style="font-weight: 800; color: #9a3412; margin-bottom: 1rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #7c2d12; padding-left: 1.2rem; font-weight: 600;">
            <li>Күш ($F$) пен ауданды ($S$) таңдаңыз.</li>
            <li>Қысымды ($P = F/S$) есептеп, мәнін енгізіңіз.</li>
            <li>"ТЕКСЕРУ" басып, нәтижені көріңіз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
        <div class="flex flex-col gap-6">
          <div id="pressure-sim-stage" style="height: 380px; background: #fef3c7; border-radius: 32px; border: 2px solid #fde68a; position: relative; overflow: hidden; display: flex; align-items: flex-end; justify-content: center;"></div>
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 24px;">
             <div class="grid grid-cols-2 gap-8">
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #9a3412;">Күш (F):</span>
                 <input type="range" id="pres-force-range" min="10" max="100" step="10" value="50" oninput="updatePressureValue()" style="width: 100%;">
                 <span id="pres-f-v" style="font-weight: 800; color: #9a3412;">50 Н</span>
               </div>
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #9a3412;">Аудан (S):</span>
                 <select id="pres-area-select" onchange="updatePressureValue()" style="padding: 0.6rem; border-radius: 10px; border: 1px solid #ffedd5; font-weight: 700;">
                    <option value="1">Кіші (1 см²)</option>
                    <option value="2" selected>Орташа (2 см²)</option>
                    <option value="5">Үлкен (5 см²)</option>
                 </select>
               </div>
             </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #f97316; border-radius: 28px;">
            <h4 style="font-weight: 900; color: #9a3412; margin-bottom: 2rem;">ҚЫСЫМДЫ ЕСЕПТЕУ</h4>
            <div class="flex flex-col gap-4">
               <div style="padding: 1.2rem; background: #fff7ed; border-radius: 20px; border: 2px solid #ffedd5; text-align: center;">
                 <p style="font-weight: 800; color: #9a3412; margin-bottom: 0.5rem;" class="label-caps">Қысым (Н/см²):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="pres-calc-p" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #fed7aa; font-size: 1.2rem; font-weight: 900; text-align: center; color: #9a3412;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #f97316;">Н/см²</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; background: #f97316;" onclick="checkPressureCalculation()">ТЕКСЕРУ</button>
               </div>
               <div id="pres-feedback"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updatePressureValue() {
  pressureLabState.force = parseFloat(document.getElementById('pres-force-range').value);
  pressureLabState.area = parseFloat(document.getElementById('pres-area-select').value);

  document.getElementById('pres-f-v').innerText = pressureLabState.force + " Н";
  updatePressureSim();
}

function updatePressureSim() {
  const stage = document.getElementById('pressure-sim-stage');
  if (!stage) return;
  const p = pressureLabState.force / pressureLabState.area;
  const depth = (p / 20) * 30;
  const w = 40 * pressureLabState.area;
  const h = 80 / pressureLabState.area;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 350">
      <rect x="0" y="250" width="800" height="100" fill="#fde68a" />
      <path d="M 0 250 Q 400 ${250 + depth / 2} 800 250" fill="#fde68a" stroke="#f59e0b" stroke-width="2" />
      <rect x="${400 - w / 2}" y="${250 + depth - h}" width="${w}" height="${h}" fill="#92400e" rx="2" />
    </svg>
  `;
}

function checkPressureCalculation() {
  const input = document.getElementById('pres-calc-p');
  const feed = document.getElementById('pres-feedback');
  if (!input || !feed) return;

  const correct = (pressureLabState.force / pressureLabState.area).toFixed(1);
  const user = parseFloat(input.value).toFixed(1);

  if (Math.abs(correct - user) < 0.1) {
    pressureLabState.isSolved = true;
    feed.innerHTML = '<div style="color:#16a34a; font-weight:800; margin-top:0.5rem;">Дұрыс! Қысым дәл есептелді.</div>';
    if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
    if (window.triggerSalute) triggerSalute();
  } else {
    feed.innerHTML = '<div style="color:#dc2626; font-size:0.8rem; margin-top:0.5rem;">Қате. P = F / S формуласын қолдан.</div>';
  }
}

// Archimedes Lab State
let archiLabState = {
  liquid: 'water',
  vol: 100,
  isSubmerged: false,
  isSolved: false,
  feedback: ''
};

function renderArchimedesLab() {
  setTimeout(() => {
    updateArchiSim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="animate-scale-in" style="padding: 1rem;">
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #f0fdfa; padding: 2rem; border-radius: 28px; border: 1.5px solid #ccfbf1;">
        <div>
          <h3 style="color: #0d9488; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№10: Архимед заңы</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #0f766e;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Кері итеруші күштің ($F_A$) сұйық тығыздығы мен көлемге тәуелділігін зерттеу.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #ccfbf1; margin-top: 1rem;">
             <p style="font-weight: 800; color: #0d9488; margin-bottom: 8px;" class="label-caps">Формула (g ≈ 10):</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #0d9488; font-family: 'Outfit', sans-serif;">F_A = ρ · g · V</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #ccfbf1;">
          <h4 style="font-weight: 800; color: #0d9488; margin-bottom: 1rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #0f766e; padding-left: 1.2rem; font-weight: 600;">
            <li>Сұйықты таңдап, көлемді ($V$) реттеңіз (м³-ге аударуды ұмытпаңыз).</li>
            <li>Архимед күшін ($F_A$) есептеп, мәнін енгізіңіз.</li>
            <li>"ТЕКСЕРУ" басып, нәтижені көріңіз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
        <div class="flex flex-col gap-6">
          <div id="archi-sim-stage" style="height: 380px; background: white; border-radius: 32px; border: 1px solid var(--border-glass); position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;"></div>
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 24px;">
             <div class="grid grid-cols-2 gap-8">
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #0d9488;">Сұйық (ρ):</span>
                 <select id="archi-liq-select" onchange="updateArchiValue()" style="padding: 0.6rem; border-radius: 10px; border: 1px solid #99f6e4; font-weight: 700;">
                    <option value="water">Су (1000 кг/м³)</option>
                    <option value="oil">Май (800 кг/м³)</option>
                 </select>
               </div>
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #0d9488;">Көлем (V):</span>
                 <input type="range" id="archi-vol-range" min="100" max="500" step="100" value="200" oninput="updateArchiValue()" style="width: 100%;">
                 <span id="archi-vol-v" style="font-weight: 800; color: #0d9488;">200 см³ (0.0002 м³)</span>
               </div>
             </div>
             <div class="flex justify-center mt-4">
                <button id="archi-sub-btn" class="btn-primary" style="background: #0d9488; width: 200px;" onclick="toggleArchiSubmerge()">БАТЫРУ</button>
             </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #0d9488; border-radius: 28px;">
            <h4 style="font-weight: 900; color: #0f766e; margin-bottom: 2rem;">КҮШТІ ЕСЕПТЕУ</h4>
            <div class="flex flex-col gap-4">
               <div style="padding: 1.2rem; background: #f0fdfa; border-radius: 20px; border: 2px solid #ccfbf1; text-align: center;">
                 <p style="font-weight: 800; color: #0d9488; margin-bottom: 0.5rem;" class="label-caps">Кері итеруші күш (Н):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="archi-calc-fa" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #99f6e4; font-size: 1.2rem; font-weight: 900; text-align: center; color: #0d9488;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #0d9488;">Н</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; background: #0d9488;" onclick="checkArchimedesCalculation()">ТЕКСЕРУ</button>
               </div>
               <div id="archi-feedback"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateArchiValue() {
  archiLabState.liquid = document.getElementById('archi-liq-select').value;
  archiLabState.vol = parseFloat(document.getElementById('archi-vol-range').value);

  const m3 = (archiLabState.vol / 1000000).toFixed(4);
  document.getElementById('archi-vol-v').innerText = `${archiLabState.vol} см³ (${m3} м³)`;
  updateArchiSim();
}

function toggleArchiSubmerge() {
  archiLabState.isSubmerged = !archiLabState.isSubmerged;
  const btn = document.getElementById('archi-sub-btn');
  if (btn) btn.innerText = archiLabState.isSubmerged ? 'ШЫҒАРУ' : 'БАТЫРУ';
  updateArchiSim();
}

function updateArchiSim() {
  const stage = document.getElementById('archi-sim-stage');
  if (!stage) return;

  const liqColor = archiLabState.liquid === 'water' ? '#bae6fd' : '#fef08a';
  const y = archiLabState.isSubmerged ? 180 : 100;
  const size = 60 + (archiLabState.vol / 10);

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 350">
      <rect x="300" y="150" width="200" height="200" fill="${liqColor}" opacity="0.6" stroke="${liqColor}" stroke-width="2" />
      <g transform="translate(400, 50)">
         <rect x="-10" y="0" width="20" height="100" fill="#cbd5e1" />
         <line x1="0" y1="100" x2="0" y2="${y}" stroke="#475569" stroke-width="2" />
         <rect x="-${size / 2}" y="${y}" width="${size}" height="${size}" fill="#134e4a" rx="4" />
      </g>
    </svg>
  `;
}

function checkArchimedesCalculation() {
  const input = document.getElementById('archi-calc-fa');
  const feed = document.getElementById('archi-feedback');
  if (!input || !feed) return;

  const rho = archiLabState.liquid === 'water' ? 1000 : 800;
  const correct = (rho * 10 * archiLabState.vol) / 1000000;
  const user = parseFloat(input.value);

  if (Math.abs(correct - user) < 0.05) {
    archiLabState.isSolved = true;
    feed.innerHTML = '<div style="color:#16a34a; font-weight:800; margin-top:0.5rem;">Дұрыс! Архимед күші табылды.</div>';
    if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
    if (window.triggerSalute) triggerSalute();
  } else {
    feed.innerHTML = `<div style="color:#dc2626; font-size:0.8rem; margin-top:0.5rem;">Қате. ρ·g·V есепте. Жауап: ${correct.toFixed(2)}</div>`;
  }
}

// Newton 1 Lab State
let newton1LabState = {
  v0: 10,
  surface: 'floor',
  mu: 0.1,
  isSolved: false,
  feedback: '',
  isMoving: false
};

function renderNewton1Lab() {
  setTimeout(() => {
    updateNewton1Sim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="animate-scale-in" style="padding: 1rem;">
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #f8fafc; padding: 2rem; border-radius: 28px; border: 1.5px solid #e2e8f0;">
        <div>
          <h3 style="color: #475569; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№4: Инерция заңы</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #1e293b;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Үйкеліс күшінің тоқтау қашықтығына әсерін зерттеу.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #e2e8f0; margin-top: 1rem;">
             <p style="font-weight: 800; color: #475569; margin-bottom: 8px;" class="label-caps">Формула:</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #1e293b;">d = v₀² / (2 · μ · g)</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0;">
          <h4 style="font-weight: 800; color: #475569; margin-bottom: 1rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #1e293b; padding-left: 1.2rem; font-weight: 600;">
            <li>Бастапқы жылдамдық пен бетті таңдаңыз.</li>
            <li>Тоқтау қашықтығын ($d$) есептеп, мәнін енгізіңіз ($g \approx 10$ м/с²).</li>
            <li>"БАСТАУ" басып, нәтижені тексеріңіз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
        <div class="flex flex-col gap-6">
          <div id="newton1-sim-stage" style="height: 380px; background: white; border-radius: 32px; border: 1px solid var(--border-glass); position: relative; overflow: hidden; display: flex; align-items: flex-end;"></div>
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 24px;">
             <div class="grid grid-cols-2 gap-8">
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #64748b;">$v_0$ (м/с):</span>
                 <input type="range" id="n1-v0-range" min="5" max="20" step="5" value="10" oninput="updateNewton1Value()" style="width: 100%;">
                 <span id="n1-v0-val" style="font-weight: 800; color: #475569;">10 м/с</span>
               </div>
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #64748b;">Бет түрі:</span>
                 <select id="n1-surface" onchange="updateNewton1Value()" style="padding: 0.6rem; border-radius: 10px; border: 1px solid #cbd5e1; font-weight: 700;">
                    <option value="0.1">Мұз (μ = 0.1)</option>
                    <option value="0.5" selected>Еден (μ = 0.5)</option>
                    <option value="1.0">Құм (μ = 1.0)</option>
                 </select>
               </div>
             </div>
             <button id="n1-start-btn" class="btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; border-radius: 12px;" onclick="startNewton1Anim()">БАСТАУ</button>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #64748b; border-radius: 28px;">
            <h4 style="font-weight: 900; color: #1e293b; margin-bottom: 2rem;">ҚАШЫҚТЫҚТЫ ЕСЕПТЕУ</h4>
            <div class="flex flex-col gap-4">
               <div style="padding: 1.2rem; background: #f8fafc; border-radius: 20px; border: 2px solid #e2e8f0; text-align: center;">
                 <p style="font-weight: 800; color: #475569; margin-bottom: 0.5rem;" class="label-caps">Тоқтау қашықтығы (м):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="n1-calc-d" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #cbd5e1; font-size: 1.2rem; font-weight: 900; text-align: center; color: #1e293b;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #64748b;">м</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; background: #475569;" onclick="checkNewton1Calculation()">ТЕКСЕРУ</button>
               </div>
               <div id="n1-feedback"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateNewton1Value() {
  const v0 = parseFloat(document.getElementById('n1-v0-range').value);
  const mu = parseFloat(document.getElementById('n1-surface').value);
  newton1LabState.v0 = v0;
  newton1LabState.mu = mu;

  document.getElementById('n1-v0-val').innerText = v0 + " м/с";
  updateNewton1Sim();
}

function updateNewton1Sim() {
  const stage = document.getElementById('newton1-sim-stage');
  if (!stage) return;
  const mu = newton1LabState.mu;
  const color = mu < 0.2 ? '#e0f2fe' : mu > 0.6 ? '#fef3c7' : '#f1f5f9';

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 350">
      <rect x="0" y="300" width="800" height="50" fill="${color}" />
      <line x1="0" y1="300" x2="800" y2="300" stroke="#94a3b8" stroke-width="2" />
      ${[0, 100, 200, 300, 400, 500, 600, 700, 800].map(x => `
        <line x1="${x}" y1="300" x2="${x}" y2="315" stroke="#94a3b8" stroke-width="1" />
        <text x="${x + 5}" y="330" font-size="10" fill="#94a3b8">${x / 10} м</text>
      `).join('')}
      <g id="n1-car" transform="translate(50, 260)">
         <rect x="0" y="0" width="60" height="30" rx="5" fill="#475569" />
         <circle cx="15" cy="35" r="8" fill="#1e293b" />
         <circle cx="45" cy="35" r="8" fill="#1e293b" />
      </g>
    </svg>
  `;
}

function checkNewton1Calculation() {
  const input = document.getElementById('n1-calc-d');
  const feed = document.getElementById('n1-feedback');
  if (!input || !feed) return;

  const correct = (Math.pow(newton1LabState.v0, 2) / (2 * newton1LabState.mu * 10)).toFixed(1);
  const user = parseFloat(input.value).toFixed(1);

  if (Math.abs(correct - user) < 0.2) {
    newton1LabState.isSolved = true;
    feed.innerHTML = '<div style="color:#16a34a; font-weight:800; margin-top:0.5rem;">Дұрыс! Инерция заңы дәлелденді.</div>';
    if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
    if (window.triggerSalute) triggerSalute();
  } else {
    feed.innerHTML = '<div style="color:#dc2626; font-size:0.8rem; margin-top:0.5rem;">Қате. d = v² / (2μg) формуласын қолдан.</div>';
  }
}

function startNewton1Anim() {
  const car = document.getElementById('n1-car');
  const btn = document.getElementById('n1-start-btn');
  if (!car || !btn || btn.disabled) return;

  btn.disabled = true;
  let x = 50;
  let v = newton1LabState.v0;
  const a = -10 * newton1LabState.mu;

  function step() {
    v += a * 0.016;
    if (v <= 0) {
      btn.disabled = false;
      setTimeout(() => car.setAttribute('transform', 'translate(50, 260)'), 2000);
      return;
    }
    x += v;
    if (x > 740) {
      btn.disabled = false;
      setTimeout(() => car.setAttribute('transform', 'translate(50, 260)'), 2000);
      return;
    }
    car.setAttribute('transform', `translate(${x}, 260)`);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Newton 2 Lab State
let newton2LabState = {
  force: 10,
  mass: 2,
  isSolved: false,
  feedback: '',
  isMoving: false
};

function renderNewton2Lab() {
  setTimeout(() => {
    updateNewton2Sim();
    if (window.lucide) lucide.createIcons();
  }, 100);

  return `
    <div class="animate-scale-in" style="padding: 1rem;">
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #ecfdf5; padding: 2rem; border-radius: 28px; border: 1.5px solid #d1fae5;">
        <div>
          <h3 style="color: #065f46; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№5: Ньютонның 2-заңы</h3>
          <p style="font-size: 1.1rem; margin-bottom: 0.8rem;"><strong style="color: #064e3b;"><i data-lucide="target" size="18" style="vertical-align: middle; margin-right: 8px;"></i> Жұмыс мақсаты:</strong> Күш пен массаның үдеуге әсерін зерттеу.</p>
          <div style="background: white; padding: 1.2rem; border-radius: 16px; border: 1.5px solid #a7f3d0; margin-top: 1rem;">
             <p style="font-weight: 800; color: #065f46; margin-bottom: 8px;" class="label-caps">Формула:</p>
             <div style="font-size: 1.8rem; font-weight: 900; color: #064e3b; font-family: 'Outfit', sans-serif;">a = F / m</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 20px; border: 1px solid #d1fae5;">
          <h4 style="font-weight: 800; color: #065f46; margin-bottom: 1rem;">Жұмыс барысы:</h4>
          <ol style="font-size: 1rem; line-height: 1.6; color: #064e3b; padding-left: 1.2rem; font-weight: 600;">
            <li>Күш ($F$) пен массаны ($m$) таңдаңыз.</li>
            <li>Үдеуді ($a = F/m$) есептеп, мәнін енгізіңіз.</li>
            <li>"БАСТАУ" басып, нәтижені тексеріңіз.</li>
          </ol>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
        <div class="flex flex-col gap-6">
          <div id="newton2-sim-stage" style="height: 380px; background: white; border-radius: 32px; border: 1px solid var(--border-glass); position: relative; overflow: hidden; display: flex; align-items: flex-end;"></div>
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 24px;">
             <div class="grid grid-cols-2 gap-8">
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #059669;">Күш (F):</span>
                 <input type="range" id="n2-force-range" min="10" max="100" step="10" value="10" oninput="updateNewton2Value()" style="width: 100%;">
                 <span id="n2-force-val" style="font-weight: 800; color: #065f46;">10 Н</span>
               </div>
               <div class="flex flex-col gap-2">
                 <span class="label-caps" style="font-weight: 800; color: #059669;">Масса (m):</span>
                 <input type="range" id="n2-mass-range" min="1" max="5" step="1" value="2" oninput="updateNewton2Value()" style="width: 100%;">
                 <span id="n2-mass-val" style="font-weight: 800; color: #065f46;">2 кг</span>
               </div>
             </div>
             <button id="n2-start-btn" class="btn-primary" style="width: 100%; margin-top: 1.5rem; padding: 1rem; border-radius: 12px; background: #059669;" onclick="startNewton2Anim()">БАСТАУ</button>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="glass-card" style="padding: 2rem; background: white; border-top: 10px solid #059669; border-radius: 28px;">
            <h4 style="font-weight: 900; color: #065f46; margin-bottom: 2rem;">ҮДЕУДІ ЕСЕПТЕУ</h4>
            <div class="flex flex-col gap-4">
               <div style="padding: 1.2rem; background: #ecfdf5; border-radius: 20px; border: 2px solid #d1fae5; text-align: center;">
                 <p style="font-weight: 800; color: #065f46; margin-bottom: 0.5rem;" class="label-caps">Үдеу (a = F/m):</p>
                 <div class="flex items-center justify-center gap-2">
                    <input type="number" id="n2-calc-a" placeholder="???" style="width: 100px; padding: 0.8rem; border-radius: 12px; border: 2px solid #a7f3d0; font-size: 1.2rem; font-weight: 900; text-align: center; color: #065f46;">
                    <span style="font-size: 1.2rem; font-weight: 900; color: #059669;">м/с²</span>
                 </div>
                 <button class="btn-primary" style="width: 100%; margin-top: 1rem; background: #059669;" onclick="checkNewton2Calculation()">ТЕКСЕРУ</button>
               </div>
               <div id="n2-feedback"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateNewton2Value() {
  newton2LabState.force = parseFloat(document.getElementById('n2-force-range').value);
  newton2LabState.mass = parseFloat(document.getElementById('n2-mass-range').value);

  document.getElementById('n2-force-val').innerText = newton2LabState.force + " Н";
  document.getElementById('n2-mass-val').innerText = newton2LabState.mass + " кг";
  updateNewton2Sim();
}

function updateNewton2Sim() {
  const stage = document.getElementById('newton2-sim-stage');
  if (!stage) return;

  stage.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 800 350">
      <rect x="0" y="300" width="800" height="50" fill="#f1f5f9" />
      <line x1="0" y1="300" x2="800" y2="300" stroke="#94a3b8" stroke-width="2" />
      <g id="n2-block" transform="translate(100, 250)">
         <rect x="0" y="0" width="80" height="50" rx="4" fill="#059669" />
         <text x="40" y="30" text-anchor="middle" fill="white" font-weight="900">${newton2LabState.mass} кг</text>
         <path d="M -10 25 L -50 25 M -10 25 L -20 15 M -10 25 L -20 35" stroke="#ef4444" stroke-width="3" />
         <text x="-70" y="20" fill="#ef4444" font-weight="900" text-anchor="end">${newton2LabState.force} Н</text>
      </g>
    </svg>
  `;
}

function checkNewton2Calculation() {
  const input = document.getElementById('n2-calc-a');
  const feed = document.getElementById('n2-feedback');
  if (!input || !feed) return;

  const correct = (newton2LabState.force / newton2LabState.mass).toFixed(1);
  const user = parseFloat(input.value).toFixed(1);

  if (Math.abs(correct - user) < 0.1) {
    newton2LabState.isSolved = true;
    feed.innerHTML = '<div style="color:#16a34a; font-weight:800; margin-top:0.5rem;">Дұрыс! Үдеу дәл есептелді.</div>';
    if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
    if (window.triggerSalute) triggerSalute();
  } else {
    feed.innerHTML = '<div style="color:#dc2626; font-size:0.8rem; margin-top:0.5rem;">Қате. a = F / m формуласын қолдан.</div>';
  }
}

function startNewton2Anim() {
  const block = document.getElementById('n2-block');
  const btn = document.getElementById('n2-start-btn');
  if (!block || !btn || btn.disabled) return;

  btn.disabled = true;
  let x = 100;
  let v = 0;
  const a = newton2LabState.force / newton2LabState.mass;

  function step() {
    v += a * 0.016;
    x += v * 0.5;
    if (x > 700) {
      btn.disabled = false;
      setTimeout(() => block.setAttribute('transform', 'translate(100, 250)'), 2000);
      return;
    }
    block.setAttribute('transform', `translate(${x}, 250)`);
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
      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-bottom: 2rem; background: #f0fdf4; padding: 2rem; border-radius: 28px; border: 1.5px solid #dcfce7;">
        <div>
          <h3 style="color: #166534; font-size: 1.6rem; margin-bottom: 1rem; font-weight: 900;">№3 Гук заңын зерттеу</h3>
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

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2.5rem;">
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
      if (window.onInteractiveLabSuccess) window.onInteractiveLabSuccess();
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




