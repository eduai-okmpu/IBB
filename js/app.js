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
    name: 'Арман Алиев',
    category: 'Педагог-зерттеуші',
    school: '№15 ІТ мектеп-лицейі',
    subject: 'Физика',
    experience: '12 жыл',
    classes: '7 "Б", 10 "А", 11 "Б"',
    achievementsText: 'Үздік ұстаз - 2025\nОблыстық олимпиада жеңімпазы',
    certificates: [] // {name, dataUrl}
  },
  studentProfile: {
    name: 'Қанат Серіков',
    school: '№15 ІТ мектеп-лицейі',
    grade: '10 "А"',
    points: 1250,
    level: 15,
    achievements: [
      { title: 'Жас физик', icon: 'award' },
      { title: 'Жылдам жауап', icon: 'zap' }
    ],
    avatar: null
  },
  quizResults: [
    { studentName: 'Нұрасыл Ерлан', grade: '10 "А"', topic: 'Механика', score: 9, maxScore: 10, date: '06.04.2026' },
    { studentName: 'Аружан Бақыт', grade: '11 "Б"', topic: 'Термодинамика', score: 8, maxScore: 10, date: '05.04.2026' }
  ],
  allStudents: [
    { id: 1, name: 'Айбек Жолдас', grade: '10 "А"', points: 1560, level: 16, school: '№15 ІТ мектеп-лицейі' },
    { id: 2, name: 'Бауыржан Иса', grade: '10 "А"', points: 1420, level: 14, school: '№15 ІТ мектеп-лицейі' },
    { id: 3, name: 'Гүлнұр Сәкен', grade: '11 "Б"', points: 1890, level: 19, school: '№15 ІТ мектеп-лицейі' },
    { id: 4, name: 'Дәурен Мұрат', grade: '10 "А"', points: 980, level: 10, school: '№15 ІТ мектеп-лицейі' },
    { id: 5, name: 'Еркебулан Қанат', grade: '11 "Б"', points: 2100, level: 21, school: '№15 ІТ мектеп-лицейі' },
    { id: 6, name: 'Жанерке Серік', grade: '10 "А"', points: 1330, level: 13, school: '№15 ІТ мектеп-лицейі' },
    { id: 7, name: 'Зейін Асқар', grade: '11 "Б"', points: 1750, level: 17, school: '№15 ІТ мектеп-лицейі' },
    { id: 8, name: 'Қанат Серіков', grade: '10 "А"', points: 1250, level: 15, school: '№15 ІТ мектеп-лицейі' }, // matches current studentProfile
    { id: 9, name: 'Ләззат Омар', grade: '10 "А"', points: 1100, level: 11, school: '№15 ІТ мектеп-лицейі' },
    { id: 10, name: 'Мейіржан Болат', grade: '11 "Б"', points: 2450, level: 24, school: '№15 ІТ мектеп-лицейі' }
  ]
};

const savedState = localStorage.getItem('physicsAccessState');
const parsedState = savedState ? JSON.parse(savedState) : {};
const state = { ...defaultState, ...parsedState };
if (!state.teacherProfile) state.teacherProfile = { ...defaultState.teacherProfile };
if (!state.quizResults) state.quizResults = [...defaultState.quizResults];
if (!state.allStudents) state.allStudents = [...defaultState.allStudents];

function saveState() {
  localStorage.setItem('physicsAccessState', JSON.stringify({
    view: state.view,
    user: state.user,
    history: state.history,
    teacherProfile: state.teacherProfile,
    studentProfile: state.studentProfile,
    quizResults: state.quizResults,
    allStudents: state.allStudents
  }));
}

function navigate(viewId, pushToHistory = true) {
  if (pushToHistory && state.view !== viewId) {
    state.history.push(viewId);
  }
  state.view = viewId;
  saveState();
  
  const views = document.querySelectorAll('.view');
  views.forEach(v => v.classList.remove('active'));
  
  const targetView = document.getElementById(`${viewId}-view`);
  
  const backBtn = document.getElementById('global-back');
  if (backBtn) backBtn.style.display = state.history.length > 1 ? 'flex' : 'none';

  const headerActions = document.getElementById('header-actions');
  if (viewId === 'home') {
    if (headerActions) headerActions.style.display = 'flex';
  } else {
    if (headerActions) headerActions.style.display = 'none';
  }

  if (targetView) {
    targetView.classList.add('active');
    if (viewId === 'labs') renderLabs();
    if (viewId === 'teacher' && state.user === 'teacher') renderTeacherDashboard();
    if (viewId === 'student' && state.user === 'student') renderStudentDashboard();
  }
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

function renderLabs() {
  const labsView = document.getElementById('labs-view');
  labsView.innerHTML = `
    <h2 style="font-size: 2.5rem; margin-bottom: 2rem;" class="voice-target">Зертханалық жұмыс тізімі</h2>
    <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
       ${state.labs.map(lab => `
         <div class="glass-card voice-target" onclick="showLabDetails(${lab.id})">
           <div style="background: var(--primary-gradient); width: 32px; height: 32px; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
             <span style="color: white; font-weight: bold;">${lab.id}</span>
           </div>
           <h3 style="margin-bottom: 0.5rem;">${lab.title}</h3>
           <p style="color: var(--text-secondary); font-size: 0.9rem;">${lab.desc}</p>
         </div>
       `).join('')}
    </div>
  `;
  lucide.createIcons();
}

function renderTeacherDashboard() {
  const teacherView = document.getElementById('teacher-view');
  teacherView.innerHTML = `
    <div class="grid" style="grid-template-columns: 320px 1fr; gap: 2rem; align-items: start;">
      <aside class="glass-panel" style="padding: 2rem; display: flex; flex-direction: column; gap: 2rem; position: sticky; top: 1rem;">
        
        <!-- Profile Section -->
        <div class="flex flex-col items-center gap-4 text-center">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 3px solid var(--border-glass); overflow: hidden;">
            ${state.teacherProfile.avatar ? `<img src="${state.teacherProfile.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="user" size="48" style="color: var(--text-primary);"></i>`}
          </div>
          <div style="text-align: center; width: 100%;">
            <h3 style="font-size: var(--font-xl); font-weight: 700; margin-bottom: 0.2rem; text-align: center;">${state.teacherProfile.name}</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-sm); text-align: center; display: block; margin: 0 auto;">${state.teacherProfile.category}</p>
          </div>
          <button class="btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem; border-radius: 6px;" onclick="showTeacherProfile(true)"><i data-lucide="edit" size="16"></i> Ақпаратты өңдеу</button>
        </div>

        <div class="flex flex-col gap-2" style="background: rgba(255,255,255,0.6); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
          
          <!-- School Info -->
          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="school" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Мектебі</span>
              <span style="font-weight: 600; font-size: var(--font-sm); line-height: 1.3;">${state.teacherProfile.school}</span>
            </div>
          </div>

          <!-- Class Info -->
          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="users" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Сыныбы</span>
              <span style="font-weight: 600; font-size: var(--font-sm); line-height: 1.3;">${state.teacherProfile.classes}</span>
            </div>
          </div>

          <!-- Subject Info -->
          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="book-open" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Пәні</span>
              <span style="font-weight: 600; font-size: var(--font-sm); line-height: 1.3;">${state.teacherProfile.subject}</span>
            </div>
          </div>

          <!-- Achievements -->
          <div class="v-center gap-4" style="padding: 0.5rem; background: var(--bg-glass-bright); border-radius: 8px;">
            <div class="flex-center" style="width: 32px; height: 32px; background: rgba(242, 109, 33, 0.1); border-radius: 6px; color: var(--accent-orange); flex-shrink: 0;">
              <i data-lucide="award" size="16"></i>
            </div>
            <div class="flex flex-col flex-1">
              <span class="label-caps">Жетістіктері</span>
              <span style="font-size: var(--font-xs); font-weight: 500; line-height: 1.4; margin-top: 0.15rem;">${state.teacherProfile.achievementsText.replace(/\n/g, '<br>')}</span>
            </div>
          </div>

        </div>



        <button class="btn-secondary v-center h-center" style="margin-top: 1rem; border-color: transparent; font-size: var(--font-sm); gap: 0.5rem;" onclick="logout()">
          <i data-lucide="log-out" size="18"></i> Шығу
        </button>
      </aside>

      <div id="teacher-content" class="glass-panel" style="padding: 2.5rem; min-height: 600px;">
        <h2 class="voice-target" style="font-size: var(--font-3xl); margin-bottom: 1rem;">Қош келдіңіз, ${state.teacherProfile.name}!</h2>
        <p class="voice-target" style="color: var(--text-secondary); font-size: var(--font-base); margin-bottom: 2rem;">Бүгін қандай сабақ жоспарын дайындаймыз?</p>
        
        <div class="feature-grid animate-fade-in">
          <!-- Card 1: AI Assistant -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="bot" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">AI Көмекші</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Жасанды интеллект көмегімен сабақ жоспарларын жасаңыз.</p>
            <button class="card-btn orange label-caps" onclick="showAIAssistant()">КІРУ</button>
          </div>

          <!-- Card 2: Class Manager -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="users" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Сынып менеджері</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Оқушылардың үлгерімі мен сабаққа қатысуын бақылаңыз.</p>
            <button class="card-btn orange label-caps" onclick="showClassManager()">КІРУ</button>
          </div>

          <!-- Card 3: Electronic Textbooks -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="book-open" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Оқулықтар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Okulyk.kz ресми порталынан қажетті физика оқулықтарын іздеңіз.</p>
            <button class="card-btn orange label-caps" onclick="showResourceLibrary('teacher-content', 'renderTeacherDashboard')">КІРУ</button>
          </div>

          <!-- Card 4: Assignments -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="clipboard-list" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Тапсырмалар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Үй тапсырмалары мен тесттерді құрастырыңыз және тексеріңіз.</p>
            <button class="card-btn orange label-caps" onclick="showAssignments()">КІРУ</button>
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

          <!-- Card 6: My Class -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="users-2" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Менің сыныбым</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Оқушылар тізімін әліпбилік ретпен көріп, мәліметтерді бақылаңыз.</p>
            <button class="card-btn orange label-caps" onclick="showMyClassGroup()">КІРУ</button>
          </div>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

/**
 * Teacher Profile Edit Feature
 */
function showTeacherProfile(editMode = false) {
  const content = document.getElementById('teacher-content');
  if (!content) return;
  
  if (editMode) {
    const p = state.teacherProfile;
    
    // Generate class options (7-11 grades, A, Ä, B sections)
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

    // Generate subject options
    const subjects = ['Физика', 'Математика', 'Информатика', 'Химия', 'Биология', 'География', 'Тарих', 'Қазақ тілі', 'Орыс тілі', 'Ағылшын тілі', 'Дене шынықтыру', 'Көркем еңбек'];
    const subjectOptionsHtml = subjects.map(s => `<option value="${s}" ${p.subject === s ? 'selected' : ''}>${s}</option>`).join('');

    content.innerHTML = `
      <div class="glass-card animate-fade-in" style="padding: 2.5rem; max-width: 600px; margin: 0 auto; border: 1px solid var(--border-glass); border-radius: 24px; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
          <h2 class="gradient-text" style="font-size: 1.8rem; margin-bottom: 2rem; font-weight: 800;">Профильді өңдеу</h2>
          
          <!-- Avatar Upload -->
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
                  <span class="label-caps" style="font-size: 10px; color: var(--text-tertiary); margin-top: 4px;">Бірнеше сыныпты таңдауға болады</span>
              </div>
              <div class="flex flex-col gap-2">
                  <label class="label-caps">Жетістіктері:</label>
                  <textarea id="edit-achievements" class="glass-panel" style="padding: 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; min-height: 120px; outline: none; font-size: var(--font-base); font-family: inherit;">${p.achievementsText}</textarea>
              </div>
              <div class="flex gap-4" style="margin-top: 1.5rem;">
                  <button class="btn-primary" style="flex: 1; padding: 1.1rem; border-radius: 14px;" onclick="saveTeacherProfile()"><i data-lucide="save" size="18"></i> Сақтау</button>
                  <button class="btn-secondary" style="flex: 1; padding: 1.1rem; border-radius: 14px;" onclick="renderTeacherDashboard()">Болдырмау</button>
              </div>
          </div>
      </div>
    `;
    
    // File upload handler
    document.getElementById('edit-avatar').onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          state.tempAvatar = e.target.result;
          const container = document.getElementById('avatar-preview-container');
          container.innerHTML = `
            <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.4); padding: 4px; color: white; font-size: 10px; text-align: center; font-weight: 700;">ЖҮКТЕУ</div>
          `;
        };
        reader.readAsDataURL(file);
      }
    };
    
    lucide.createIcons();
  }
}

function saveTeacherProfile() {
  state.teacherProfile.name = document.getElementById('edit-name').value;
  state.teacherProfile.category = document.getElementById('edit-category').value;
  state.teacherProfile.school = document.getElementById('edit-school').value;
  state.teacherProfile.subject = document.getElementById('edit-subject').value;
  state.teacherProfile.achievementsText = document.getElementById('edit-achievements').value;
  
  // Collect checked classes
  const checkedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked')).map(el => el.value);
  state.teacherProfile.classes = checkedClasses.join(', ');
  
  if (state.tempAvatar) {
    state.teacherProfile.avatar = state.tempAvatar;
    delete state.tempAvatar;
  }
  
  saveState();
  renderTeacherDashboard();
  if (window.speakText) window.speakText('Профиль мәліметтері сәтті сақталды.');
}

function renderStudentDashboard() {
  const studentView = document.getElementById('student-view');
  if (!studentView) return;
  
  const p = state.studentProfile;
  
  studentView.innerHTML = `
    <div class="grid" style="grid-template-columns: 320px 1fr; gap: 2rem; align-items: start;">
      <!-- Sidebar -->
      <aside class="glass-panel animate-slide-in" style="padding: 2rem; display: flex; flex-direction: column; gap: 2rem; position: sticky; top: 1rem;">
        
        <div class="flex flex-col items-center gap-4 text-center">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 3px solid var(--border-glass); overflow: hidden; position: relative;">
            ${p.avatar ? `<img src="${p.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="user" size="48" style="color: var(--text-primary);"></i>`}
            <div style="position: absolute; bottom: 0; right: 0; background: var(--accent-orange); color: white; width: 28px; height: 28px; border-radius: 50%; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid white;">${p.level}</div>
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
              <i data-lucide="star" size="16"></i>
            </div>
            <div class="flex flex-col flex-1" style="overflow: hidden;">
              <span class="label-caps">Ұпайы (XP)</span>
              <span style="font-weight: 600; font-size: var(--font-sm); line-height: 1.3;">${p.points} XP</span>
            </div>
          </div>

        </div>

        <button class="btn-secondary v-center h-center" style="border-radius: 12px; border: 1px solid var(--border-glass); background: #fff; padding: 0.8rem; font-size: var(--font-sm); gap: 0.5rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.02);" onclick="showMyTeacherInfo()">
          <i data-lucide="user-check" size="18" style="color: var(--accent-orange);"></i> Менің мұғалімім
        </button>

        <button class="btn-secondary v-center h-center" style="margin-top: auto; border-color: transparent; font-size: var(--font-sm); gap: 0.5rem;" onclick="logout()">
          <i data-lucide="log-out" size="18"></i> Шығу
        </button>
      </aside>

      <!-- Main Content -->
      <div id="student-content" class="glass-panel" style="padding: 2.5rem; min-height: 600px;">
        <div class="dashboard-header animate-fade-in" style="margin-bottom: 2rem;">
          <h1 class="gradient-text voice-target" style="font-size: var(--font-3xl); margin-bottom: 0.5rem;">Қош келдіңіз, ${p.name}!</h1>
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
            <button class="card-btn orange label-caps" onclick="showStudentAI()">КІРУ</button>
          </div>

          <!-- Card 2: Lessons -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="play-circle" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Сабақтар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Интерактивті сабақтар мен теориялық материалдар.</p>
            <button class="card-btn orange label-caps" onclick="showStudentLessons()">КІРУ</button>
          </div>

          <!-- Card 3: Achievements -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="award" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Жетістіктерім</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Марапаттар мен жиналған ұпайлар тарихы.</p>
            <button class="card-btn orange label-caps" onclick="showAchievements()">КІРУ</button>
          </div>

          <!-- Card 4: Electronic Textbooks -->
          <div class="feature-card voice-target">
            <div class="icon-circle" style="color: var(--accent-orange);">
              <i data-lucide="library" size="32"></i>
            </div>
            <h3 class="label-caps" style="color: var(--text-primary);">Оқулықтар</h3>
            <p style="color: var(--text-secondary); font-size: var(--font-xs); line-height: 1.4;">Okulyk.kz ресми порталынан қажетті физика оқулықтарын іздеңіз.</p>
            <button class="card-btn orange label-caps" onclick="showResourceLibrary('student-content', 'renderStudentDashboard')">КІРУ</button>
          </div>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function showStudentAI() {
  const content = document.getElementById('student-content');
  content.innerHTML = `
    <div class="animate-fade-in">
      <button class="btn-secondary v-center" style="margin-bottom: 2rem; gap: 0.5rem;" onclick="renderStudentDashboard()">
        <i data-lucide="arrow-left" size="18"></i> Артқа
      </button>
      <h2 class="gradient-text" style="font-size: 2rem; margin-bottom: 1.5rem;">AI Көмекші</h2>
      <div class="glass-panel" style="height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 1rem;">
        <i data-lucide="message-square" size="64" style="color: var(--accent-purple); opacity: 0.3;"></i>
        <p style="color: var(--text-secondary);">Чат интерфейсі әзірлену үстінде...</p>
      </div>
    </div>
  `;
  lucide.createIcons();
}

const lessonsData = {
  mechanics: {
    title: 'Механика',
    image: 'media/lessons/mechanics.png',
    video: 'https://www.youtube.com/embed/f3pG1iH9Fh0',
    theory: `<h3>Классикалық механика негіздері</h3>
             <p>Механика — физиканың денелердің қозғалысын және олардың өзара әрекеттесуін зерттейтін іргелі бөлімі. Ол үш негізгі тармаққа бөлінеді:</p>
             <ul>
               <li><b>Кинематика:</b> Қозғалысты оның туындау себептерін (күштерді) ескермей сипаттайды.</li>
               <li><b>Динамика:</b> Қозғалыстың себебін, яғни күштердің денеге әсерін зерттейді.</li>
               <li><b>Статика:</b> Денелердің тепе-теңдік шарттарын қарастырады.</li>
             </ul>
             <h4>Негізгі заңдар:</h4>
             <p><b>Инерция заңы (Ньютонның 1-заңы):</b> Денеге басқа денелер әсер етпесе немесе әсері теңгерілген болса, ол тыныштық күйін немесе бірқалыпты түзу сызықты қозғалысын сақтайды.</p>
             <p><b>Динамиканың негізгі заңы (Ньютонның 2-заңы):</b> Денеге әсер ететін қорытқы күш оның массасы мен үдеуінің көбейтіндісіне тең: <b>F = m · a</b>.</p>
             <p><b>Әсер және қарсы әсер заңы (Ньютонның 3-заңы):</b> Денелер бір-біріне шамасы жағынан тең, ал бағыты жағынан қарама-қарсы күштермен әсер етеді.</p>`,
    quiz: [
      {
        question: 'Ньютонның екінші заңының формуласын тап:',
        options: ['F = m · a', 'E = m · c²', 'P = U · I', 'v = s / t'],
        correct: 'F = m · a'
      },
      {
        question: 'Дененің қозғалыс траекториясының ұзындығы қалай аталады?',
        options: ['Жол', 'Орын ауыстыру', 'Жылдамдық', 'Үдеу'],
        correct: 'Жол'
      },
      {
        question: 'Күштің өлшем бірлігі қандай?',
        options: ['Ньютон (Н)', 'Паскаль (Па)', 'Джоуль (Дж)', 'Ватт (Вт)'],
        correct: 'Ньютон (Н)'
      },
      {
        question: 'Еркін түсу үдеуінің мәні (g) шамамен қаншаға тең?',
        options: ['9.8 м/с²', '100 м/с²', '5.5 м/с²', '0 м/с²'],
        correct: '9.8 м/с²'
      },
      {
        question: 'Гук заңының формуласын көрсет:',
        options: ['F = k|x|', 'F = m · g', 'F = G · m₁m₂/r²', 'E = mgh'],
        correct: 'F = k|x|'
      }
    ],
    lab: {
      title: 'Еркін түсу үдеуін анықтау',
      url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_en.html'
    }
  },
  molecular: {
    title: 'Молекулалық физика',
    image: 'media/lessons/molecular.png',
    video: 'https://www.youtube.com/embed/f3pG1iH9Fh0',
    theory: `<h3>Молекулалық-кинетикалық теория (МКТ)</h3>
             <p>МКТ — заттың құрылысын оның молекулалары мен атомдарының қозғалысы мен өзара әрекеттесуі негізінде түсіндіретін теория.</p>
             <h4>МКТ-ның негізгі қағидалары:</h4>
             <ul>
               <li>Барлық заттар микробөлшектерден (атомдар, молекулалар) тұрады.</li>
               <li>Бөлшектер үздіксіз және хаосты (жылулық) қозғалыста болады.</li>
               <li>Бөлшектер бір-бірімен өзара әрекеттеседі (тартылады және итеріледі).</li>
             </ul>
             <h4>Идеал газ заңдары:</h4>
             <p><b>Бойль-Мариотт заңы:</b> T = const болғанда, P · V = const (изотермиялық процесс).</p>
             <p><b>Гей-Люссак заңы:</b> P = const болғанда, V / T = const (изобаралық процесс).</p>
             <p><b>Шарль заңы:</b> V = const болғанда, P / T = const (изохоралық процесс).</p>`,
    quiz: [
      {
        question: 'Бойль-Мариотт заңы қай параметр тұрақты болғанда орындалады?',
        options: ['Температура (T)', 'Қысым (P)', 'Көлем (V)', 'Масса (m)'],
        correct: 'Температура (T)'
      },
      {
        question: 'Абсолют нөл температура Цельсий шкаласы бойынша қаншаға тең?',
        options: ['-273 °C', '0 °C', '100 °C', '-100 °C'],
        correct: '-273 °C'
      },
      {
        question: 'Қысымның өлшем бірлігі:',
        options: ['Паскаль (Па)', 'Ньютон (Н)', 'Джоуль (Дж)', 'Кельвин (К)'],
        correct: 'Паскаль (Па)'
      },
      {
        question: 'Идеал газ күйінің теңдеуі (Менделеев-Клапейрон):',
        options: ['PV = nRT', 'P = F/S', 'E = kT', 'V = abc'],
        correct: 'PV = nRT'
      },
      {
        question: 'Заттың агрегаттық күйлеріне не жатпайды?',
        options: ['Энергия', 'Қатты', 'Сұйық', 'Газ'],
        correct: 'Энергия'
      }
    ],
    lab: {
      title: 'Газ заңдарын зерттеу',
      url: 'https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_en.html'
    }
  },
  electro: {
    title: 'Электродинамика',
    image: 'media/lessons/electro.png',
    video: 'https://www.youtube.com/embed/f3pG1iH9Fh0',
    theory: `<h3>Электростатика және Электр тогы</h3>
             <p>Электродинамика — электр заряды бар денелердің немесе бөлшектердің өзара әрекеттесуін және олардың қозғалысын зерттейді.</p>
             <h4>Негізгі ұғымдар:</h4>
             <p><b>Электр заряды:</b> Денелердің электрлік әрекеттесу қабілетін сипаттайтын физикалық шама. Өлшем бірлігі — Кулон (Кл).</p>
             <p><b>Кулон заңы:</b> Тыныштықтағы екі нүктелік зарядтың өзара әрекеттесу күші олардың модульдерінің көбейтіндісіне тура пропорционал, арақашықтықтың квадратына кері пропорционал.</p>
             <h4>Тұрақты ток заңдары:</h4>
             <ul>
               <li>Ом заңы: <b>I = U / R</b> (Кернеу мен кедергі арасындағы байланыс).</li>
               <li>Джоуль-Ленц заңы: <b>Q = I² · R · t</b> (Тоқтың жылулық әсері).</li>
             </ul>`,
    quiz: [
      {
        question: 'Тізбек бөлігі үшін Ом заңы бойынша кедергі қалай есептеледі?',
        options: ['R = U / I', 'R = U · I', 'R = I / U', 'R = P / I'],
        correct: 'R = U / I'
      },
      {
        question: 'Электр зарядының өлшем бірлігі:',
        options: ['Кулон (Кл)', 'Ампер (А)', 'Вольт (В)', 'Ом (Ω)'],
        correct: 'Кулон (Кл)'
      },
      {
        question: 'Джоуль-Ленц заңының формуласы:',
        options: ['Q = I²Rt', 'U = IR', 'P = UI', 'E = hν'],
        correct: 'Q = I²Rt'
      },
      {
        question: 'Ток күшін өлшейтін құрал қалай аталады?',
        options: ['Амперметр', 'Вольтметр', 'Омметр', 'Ваттметр'],
        correct: 'Амперметр'
      },
      {
        question: 'Электр тогының қуаты қалай есептеледі?',
        options: ['P = U · I', 'P = F · v', 'P = m · g', 'P = A / t'],
        correct: 'P = U · I'
      }
    ],
    lab: {
      title: 'Электр тізбегін құрастыру',
      url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html'
    }
  },
  optics: {
    title: 'Оптика',
    image: 'media/lessons/optics.png',
    video: 'https://www.youtube.com/embed/f3pG1iH9Fh0',
    theory: `<h3>Жарық табиғаты және Оптика</h3>
             <p>Оптика — жарық құбылыстарының заңдылықтарын, жарықтың табиғатын және оның затпен әрекеттесуін зерттейтін физика бөлімі.</p>
             <h4>Геометриялық оптика:</h4>
             <ul>
               <li><b>Жарықтың түзу сызықты таралу заңы:</b> Біртекті ортада жарық түзу сызықпен таралады.</li>
               <li><b>Жарықтың шағылу заңы:</b> Түсу бұрышы шағылу бұрышына тең.</li>
               <li><b>Жарықтың сыну заңы:</b> Түсу бұрышы синусының сыну бұрышы синусына қатынасы — тұрақты шама.</li>
             </ul>
             <h4>Толқындық оптика:</h4>
             <p>Ол жарықтың интерференциясы, дифракциясы, дисперсиясы және поляризациясы сияқты толқындық қасиеттерін зерттейді.</p>`,
    quiz: [
      {
        question: 'Вакуумдегі жарық жылдамдығы қанша?',
        options: ['3 · 10⁸ м/с', '3 · 10⁶ м/с', '150 000 км/с', '340 м/с'],
        correct: '3 · 10⁸ м/с'
      },
      {
        question: 'Линзаның оптикалық күшінің өлшем бірлігі:',
        options: ['Диоптрия (дптр)', 'Метр (м)', 'Градус', 'Люмен'],
        correct: 'Диоптрия (дптр)'
      },
      {
        question: 'Жарықтың шағылу заңы бойынша:',
        options: ['α = β', 'α > β', 'α < β', 'α + β = 90°'],
        correct: 'α = β'
      },
      {
        question: 'Күн сәулесінің жеті түске бөліну құбылысы қалай аталады?',
        options: ['Дисперсия', 'Интерференция', 'Дифракция', 'Поляризация'],
        correct: 'Дисперсия'
      },
      {
        question: 'Жарық жылы — бұл не?',
        options: ['Қашықтық бірлігі', 'Уақыт бірлігі', 'Жылдамдық', 'Энергия'],
        correct: 'Қашықтық бірлігі'
      }
    ],
    lab: {
      title: 'Жарықтың сынуын бақылау',
      url: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_en.html'
    }
  },
  quantum: {
    title: 'Кванттық физика',
    image: 'media/lessons/quantum.png',
    video: 'https://www.youtube.com/embed/f3pG1iH9Fh0',
    theory: `<h3>Микродүние физикасы</h3>
             <p>Кванттық физика — микробөлшектердің (атомдар, молекулалар, элементар бөлшектер) қозғалыс заңдылықтарын зерттейді.</p>
             <h4>Негізгі концепциялар:</h4>
             <ul>
               <li><b>Квантталу:</b> Энергия үздіксіз емес, белгілі бір порциялармен (кванттармен) шығарылады және жұтылады. <b>E = h · ν</b>.</li>
               <li><b>Корпускулалық-толқындық дуализм:</b> Жарық әрі бөлшек (фотон), әрі толқын ретінде көрінеді.</li>
               <li><b>Фотоэффект:</b> Жарықтың әсерінен заттан электрондардың ұшып шығу құбылысы.</li>
             </ul>
             <h4>Атом құрылысы:</h4>
             <p>Бор постулаттарына сәйкес, электрон атом ішінде тек белгілі бір стационарлық орбиталар бойымен қозғалады және энергия шығармайды.</p>`,
    quiz: [
      {
        question: 'Фотоэффект заңын ашқан ғалым кім?',
        options: ['Альберт Эйнштейн', 'Исаак Ньютон', 'Нильс Бор', 'Макс Планк'],
        correct: 'Альберт Эйнштейн'
      },
      {
        question: 'Квант энергиясының формуласы:',
        options: ['E = hν', 'E = mc²', 'E = mgh', 'E = kx²/2'],
        correct: 'E = hν'
      },
      {
        question: 'Атом ядросы қандай бөлшектерден тұрады?',
        options: ['Протондар мен нейтрондар', 'Электрондар мен протондар', 'Тек нейтрондар', 'Тек фотондар'],
        correct: 'Протондар мен нейтрондар'
      },
      {
        question: 'Электронның заряды қандай?',
        options: ['Теріс', 'Оң', 'Нейтрал', 'Айнымалы'],
        correct: 'Теріс'
      },
      {
        question: 'Планк тұрақтысының (h) мәні қанша?',
        options: ['6.63 · 10⁻³⁴ Дж·с', '3.14', '9.8 м/с²', '1.6 · 10⁻¹⁹ Кл'],
        correct: '6.63 · 10⁻³⁴ Дж·с'
      }
    ],
    lab: {
      title: 'Фотоэффект құбылысы',
      url: 'https://phet.colorado.edu/sims/html/photoelectric-effect/latest/photoelectric-effect_en.html'
    }
  }
};

function showStudentLessons() {
  const content = document.getElementById('student-content');
  content.innerHTML = `
    <div class="animate-fade-in">
      <button class="btn-secondary v-center" style="margin-bottom: 2rem; gap: 0.5rem;" onclick="renderStudentDashboard()">
        <i data-lucide="arrow-left" size="18"></i> Артқа
      </button>
      <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
        <h2 class="gradient-text" style="font-size: 2.2rem; font-weight: 800;">Сабақтар</h2>
        <div class="label-caps" style="background: rgba(var(--accent-orange-rgb), 0.1); padding: 0.5rem 1rem; border-radius: 20px; color: var(--accent-orange); font-weight: 700;">5 БӨЛІМ</div>
      </div>

      <div class="grid gap-6" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
        <!-- Section 1: Mechanics -->
        <div class="glass-card voice-target" style="display: flex; flex-direction: column;">
          <div style="background: rgba(0, 195, 255, 0.1); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: var(--accent-cyan);">
            <i data-lucide="cog" size="24"></i>
          </div>
          <h3 style="margin-bottom: 1rem; font-size: 1.3rem;">Механика</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 2rem; flex-grow: 1;">
            Қозғалыс заңдары, кинематика, динамика, статика және сақталу заңдарын тереңірек зерттеңіз.
          </p>
          <button class="btn-primary" style="width: 100%;" onclick="startLesson('mechanics')">Бастау</button>
        </div>

        <!-- Section 2: Molecular Physics -->
        <div class="glass-card voice-target" style="display: flex; flex-direction: column;">
          <div style="background: rgba(147, 51, 234, 0.1); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: var(--accent-purple);">
            <i data-lucide="thermometer" size="24"></i>
          </div>
          <h3 style="margin-bottom: 1rem; font-size: 1.3rem;">Молекулалық физика және термодинамика</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 2rem; flex-grow: 1;">
            Заттың құрылысы, жылулық процестер, идеал газ заңдары және термодинамика негіздері.
          </p>
          <button class="btn-primary" style="width: 100%;" onclick="startLesson('molecular')">Бастау</button>
        </div>

        <!-- Section 3: Electrodynamics -->
        <div class="glass-card voice-target" style="display: flex; flex-direction: column;">
          <div style="background: rgba(255, 126, 85, 0.1); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: var(--accent-orange);">
            <i data-lucide="zap" size="24"></i>
          </div>
          <h3 style="margin-bottom: 1rem; font-size: 1.3rem;">Электродинамика</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 2rem; flex-grow: 1;">
            Электр өрісі, магнит өрісі, тұрақты және айнымалы ток, электромагниттік индукция.
          </p>
          <button class="btn-primary" style="width: 100%;" onclick="startLesson('electro')">Бастау</button>
        </div>

        <!-- Section 4: Optics & Waves -->
        <div class="glass-card voice-target" style="display: flex; flex-direction: column;">
          <div style="background: rgba(16, 185, 129, 0.1); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: #10b981);">
            <i data-lucide="sun" size="24"></i>
          </div>
          <h3 style="margin-bottom: 1rem; font-size: 1.3rem;">Оптика және тербелістер мен толқындар</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 2rem; flex-grow: 1;">
            Геометриялық және толқындық оптика, механикалық және электромагниттік тербелістер.
          </p>
          <button class="btn-primary" style="width: 100%;" onclick="startLesson('optics')">Бастау</button>
        </div>

        <!-- Section 5: Quantum & Nuclear Physics -->
        <div class="glass-card voice-target" style="display: flex; flex-direction: column;">
          <div style="background: rgba(239, 68, 68, 0.1); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: #ef4444);">
            <i data-lucide="atom" size="24"></i>
          </div>
          <h3 style="margin-bottom: 1rem; font-size: 1.3rem;">Кванттық, атомдық және ядролық физика</h3>
          <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; margin-bottom: 2rem; flex-grow: 1;">
            Кванттық теория, атом құрылысы, ядролық реакциялар және элементар бөлшектер.
          </p>
          <button class="btn-primary" style="width: 100%;" onclick="startLesson('quantum')">Бастау</button>
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
  const content = document.getElementById('student-content');
  const data = lessonsData[topicId];
  if (!data) return;

  let stepContent = '';
  const totalSteps = 5;
  const progressPercent = (step / totalSteps) * 100;

  if (step === 1) {
    // Reset quiz state when starting a new lesson
    quizState = {
      topicId: topicId,
      currentIndex: 0,
      score: 0,
      isFinished: false
    };
    stepContent = `
      <div class="glass-panel" style="padding: 2.5rem; margin-top: 1rem; border-radius: 28px; border: 1px solid var(--border-glass);">
        <div class="flex items-center gap-2" style="padding-left: 0.5rem; position: relative; margin-bottom: 2.5rem;">
          <div style="background: var(--primary-gradient); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px var(--glow-orange); flex-shrink: 0; z-index: 1;">
            <i data-lucide="book-open" size="24" style="color: white;"></i>
          </div>
          <h3 class="label-caps" style="color: var(--accent-orange); font-size: 0.95rem; letter-spacing: 0.12em; line-height: 1.2; padding-left: 0.2rem; white-space: nowrap;">1-ҚАДАМ: МӘЛІМЕТ ЖӘНЕ ТЕОРИЯ</h3>
        </div>

        <div class="theory-floating-container" style="display: block; overflow: hidden; padding: 0.5rem;">
          <!-- Image Floated Left -->
          <div style="float: left; width: 45%; margin-right: 2.5rem; margin-bottom: 2rem; position: relative;">
            <div style="border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px var(--border-glass); background: #fff; position: relative;">
              <img src="${data.image}" alt="${data.title}" style="width: 100%; height: auto; display: block; object-fit: cover;">
              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%); padding: 2.5rem 1.5rem 1rem;">
                <span class="label-caps" style="color: #fff; font-size: 0.7rem; opacity: 0.9; letter-spacing: 0.1em;">${data.title}</span>
                <h4 style="color: #fff; font-size: 1.5rem; font-weight: 800; margin-top: 0.2rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${data.title} негіздері</h4>
              </div>
            </div>
            <!-- Decorative Glow -->
            <div style="position: absolute; z-index: -1; top: 10%; left: 10%; right: 10%; bottom: 10%; background: var(--primary-gradient); filter: blur(40px); opacity: 0.15; pointer-events: none;"></div>
          </div>

          <!-- Text content naturally wraps around the float -->
          <div class="theory-text" style="font-size: 1.15rem; line-height: 1.8; color: var(--text-primary); font-family: 'Inter', sans-serif;">
            ${data.theory}
          </div>
        </div>
      </div>
    `;
  } else if (step === 2) {
    stepContent = `
      <div class="glass-panel" style="padding: 2rem; margin-top: 1rem;">
        <h3 style="margin-bottom: 1.5rem; color: var(--accent-purple); font-size: var(--font-lg);">2-ҚАДАМ: ВИДЕО ТҮСІНДІРМЕ</h3>
        <div style="aspect-ratio: 16/9; width: 100%; max-width: 900px; margin: 0 auto; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
           <iframe width="100%" height="100%" src="${data.video}" frameborder="0" allowfullscreen></iframe>
        </div>
      </div>
    `;
  } else if (step === 3) {
    const quiz = data.quiz;
    const currentQ = quiz[quizState.currentIndex];
    const quizProgress = ((quizState.currentIndex) / quiz.length) * 100;

    stepContent = `
       <div class="glass-panel" style="padding: 2rem; margin-top: 1rem; text-align: center;">
        <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
          <h3 style="color: var(--accent-cyan); font-size: var(--font-lg); margin: 0;">3-ҚАДАМ: ТАПСЫРМА (ТЕСТ)</h3>
          <div style="background: rgba(var(--accent-cyan-rgb), 0.1); padding: 0.4rem 1rem; border-radius: 20px; color: var(--accent-cyan); font-weight: 700; font-size: 0.9rem;">
            СҰРАҚ ${quizState.currentIndex + 1} / ${quiz.length}
          </div>
        </div>

        <!-- Quiz Progress Bar -->
        <div style="width: 100%; height: 4px; background: rgba(0,0,0,0.05); border-radius: 2px; margin-bottom: 2.5rem; overflow: hidden;">
          <div style="width: ${quizProgress}%; height: 100%; background: var(--accent-cyan); border-radius: 2px; transition: width 0.3s ease;"></div>
        </div>

        <div class="glass-card animate-fade-in" key="${quizState.currentIndex}" style="max-width: 600px; margin: 0 auto; padding: 2.5rem; border-radius: 24px;">
          <p style="font-size: 1.3rem; font-weight: 600; margin-bottom: 2.5rem; color: var(--text-primary); line-height: 1.5;">${currentQ.question}</p>
          <div class="grid gap-4">
            ${currentQ.options.map(opt => `
              <button class="quiz-option-btn" 
                      style="width: 100%; text-align: left; padding: 1.2rem 1.5rem; border-radius: 16px; border: 1px solid var(--border-glass); background: white; transition: all 0.2s ease; cursor: pointer; font-size: 1.1rem; font-weight: 500;"
                      onclick="checkGameAnswer('${topicId}', '${opt}', this)">
                ${opt}
              </button>
            `).join('')}
          </div>
          <div id="game-feedback" style="margin-top: 2rem; min-height: 3rem; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 700; border-radius: 12px;"></div>
          
          <div id="next-quiz-btn" style="margin-top: 2rem; display: none;">
            <button class="btn-primary" style="width: 100%; padding: 1rem;" onclick="nextQuizQuestion('${topicId}')">КЕЛЕСІ СҰРАҚ <i data-lucide="chevron-right" size="20"></i></button>
          </div>
        </div>
      </div>
    `;
  } else if (step === 4) {
    stepContent = `
      <div class="glass-panel" style="padding: 2rem; margin-top: 1rem;">
        <h3 style="margin-bottom: 1.5rem; color: var(--accent-orange); font-size: var(--font-lg);">4-ҚАДАМ: ОНЛАЙН ЗЕРТХАНА</h3>
        <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">${data.lab.title}: Симуляциямен жұмыс жасап, нәтижесін бақылаңыз.</p>
        <div style="height: 500px; width: 100%; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-glass); background: #f8f9fa;">
          <iframe src="${data.lab.url}" width="100%" height="100%" scrolling="no" allowfullscreen style="border: none;"></iframe>
        </div>
      </div>
    `;
  } else if (step === 5) {
    const finalScore = quizState.score;
    const maxScore = lessonsData[topicId].quiz.length;
    const xpGained = (finalScore / maxScore) * 100;
    
    stepContent = `
      <div class="glass-panel flex flex-col items-center justify-center" style="padding: 4rem; margin-top: 1rem; text-align: center;">
        <div style="width: 120px; height: 120px; background: var(--primary-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; box-shadow: 0 10px 30px var(--glow-orange);">
          <i data-lucide="check-circle-2" size="64" style="color: white;"></i>
        </div>
        <h2 class="gradient-text" style="font-size: 2.5rem; margin-bottom: 1rem;">ҚҮТТЫҚТАЙМЫЗ!</h2>
        <p style="font-size: 1.3rem; color: var(--text-secondary); margin-bottom: 2rem;">Сіз "${data.title}" бөлімін толық аяқтадыңыз.</p>
        
        <div class="flex gap-6 justify-center">
          <div class="glass-card" style="padding: 1.5rem 2rem; border-radius: 20px;">
             <span class="label-caps" style="font-size: 0.7rem; opacity: 0.7;">ТЕСТ НӘТИЖЕСІ</span>
             <h3 style="font-size: 1.8rem; color: var(--accent-cyan); margin: 0.5rem 0;">${finalScore} / ${maxScore}</h3>
          </div>
          <div class="glass-card" style="padding: 1.5rem 2rem; border-radius: 20px;">
             <span class="label-caps" style="font-size: 0.7rem; opacity: 0.7;">ЖИНАЛҒАН ҰПАЙ</span>
             <h3 style="font-size: 1.8rem; color: var(--accent-orange); margin: 0.5rem 0;">+${Math.round(xpGained)} XP</h3>
          </div>
        </div>

        <button class="btn-primary" style="margin-top: 3rem; padding: 1rem 3rem;" onclick="finishLesson()">АЯҚТАҮ</button>
      </div>
    `;
  }

  content.innerHTML = `
    <div class="animate-fade-in lesson-flow" style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="flex justify-between items-center" style="margin-bottom: 0.5rem;">
        <button class="btn-secondary v-center" style="gap: 0.5rem;" onclick="${step === 1 ? 'showStudentLessons()' : `renderLessonStep('${topicId}', ${step - 1})`}">
          <i data-lucide="arrow-left" size="18"></i> ${step === 1 ? 'Тізімге' : 'Артқа'}
        </button>
        <div style="text-align: right;">
          <span class="label-caps" style="color: var(--text-secondary);">${data.title}</span>
          <div style="font-weight: 800; font-size: 1.2rem; color: var(--text-primary);">${step} / ${totalSteps}</div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div style="width: 100%; height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; margin-bottom: 1rem; overflow: hidden;">
        <div style="width: ${progressPercent}%; height: 100%; background: var(--primary-gradient); border-radius: 4px; transition: width 0.5s ease;"></div>
      </div>

      <div class="step-container" style="flex-grow: 1;">
        ${stepContent}
      </div>

      ${step < totalSteps ? `
        <div class="flex justify-end" style="margin-top: 1.5rem; padding-bottom: 1rem;">
          <button class="card-btn orange label-caps" style="width: 200px; display: flex; align-items: center; justify-content: center; gap: 0.5rem;" onclick="renderLessonStep('${topicId}', ${step + 1})">
            КЕЛЕСІ <i data-lucide="arrow-right" size="18"></i>
          </button>
        </div>
      ` : ''}
    </div>
  `;
  lucide.createIcons();
}


function checkGameAnswer(topicId, answer, btn) {
  const quiz = lessonsData[topicId].quiz;
  const currentQ = quiz[quizState.currentIndex];
  const feedback = document.getElementById('game-feedback');
  const nextBtn = document.getElementById('next-quiz-btn');
  const buttons = btn.parentElement.querySelectorAll('button');
  
  buttons.forEach(b => {
    b.disabled = true;
    if (b.innerText.trim() === currentQ.correct) {
      b.style.background = 'rgba(76, 175, 80, 0.15)';
      b.style.borderColor = '#4CAF50';
      b.style.color = '#2E7D32';
    } else if (b === btn) {
      b.style.background = 'rgba(244, 67, 54, 0.15)';
      b.style.borderColor = '#F44336';
      b.style.color = '#C62828';
    }
  });

  if (answer === currentQ.correct) {
    quizState.score++;
    feedback.innerHTML = '<span style="color: #4CAF50; display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="check-circle"></i> Дұрыс жауап! Жарайсың!</span>';
  } else {
    feedback.innerHTML = `<span style="color: #F44336; display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="x-circle"></i> Қате. Дұрысы: ${currentQ.correct}</span>`;
  }
  
  lucide.createIcons();
  
  if (quizState.currentIndex < quiz.length - 1) {
    nextBtn.style.display = 'block';
  } else {
    quizState.isFinished = true;
    setTimeout(() => {
      renderLessonStep(topicId, 4);
    }, 2000);
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
  if (window.speakText) window.speakText('Сабақты сәтті аяқтадыңыз! Жетістігіңіз құтты болсын.');
}

function showStudentAchievements() {
  const content = document.getElementById('student-content');
  content.innerHTML = `
    <div class="animate-fade-in">
      <button class="btn-secondary v-center" style="margin-bottom: 2rem; gap: 0.5rem;" onclick="renderStudentDashboard()">
        <i data-lucide="arrow-left" size="18"></i> Артқа
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

function showStudentProfile(editMode = false) {
  const content = document.getElementById('student-content');
  if (!content) return;
  
  if (editMode) {
    const p = state.studentProfile;
    
    // Generate grade options (7-11 grades, A, Ä, B sections)
    const grades = [7, 8, 9, 10, 11];
    const sections = ['А', 'Ә', 'Б'];
    let gradeOptionsHtml = '';
    grades.forEach(g => {
      sections.forEach(s => {
        const val = `${g} "${s}"`;
        gradeOptionsHtml += `<option value='${val}' ${p.grade === val ? 'selected' : ''}>${val}</option>`;
      });
    });

    content.innerHTML = `
      <div class="glass-card animate-fade-in" style="padding: 2.5rem; max-width: 600px; margin: 0 auto; border: 1px solid var(--border-glass); border-radius: 24px; box-shadow: 0 15px 35px rgba(0,0,0,0.05);">
          <h2 class="gradient-text" style="font-size: 1.8rem; margin-bottom: 2rem; font-weight: 800;">Профильді өңдеу</h2>
          
          <!-- Avatar Upload -->
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
    `;
    
    // File upload handler
    document.getElementById('edit-student-avatar').onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          state.tempStudentAvatar = ev.target.result;
          const container = document.getElementById('student-avatar-preview-container');
          container.innerHTML = `
            <img src="${ev.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
            <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.4); padding: 4px; color: white; font-size: 10px; text-align: center; font-weight: 700;">ЖҮКТЕУ</div>
          `;
        };
        reader.readAsDataURL(file);
      }
    };
    
    lucide.createIcons();
  }
}

function saveStudentProfile() {
  state.studentProfile.name = document.getElementById('edit-student-name').value;
  state.studentProfile.school = document.getElementById('edit-student-school').value;
  state.studentProfile.grade = document.getElementById('edit-student-grade').value;
  
  if (state.tempStudentAvatar) {
    state.studentProfile.avatar = state.tempStudentAvatar;
    delete state.tempStudentAvatar;
  }
  
  // Sync with allStudents list (for the teacher's view)
  if (state.allStudents) {
    const studentIndex = state.allStudents.findIndex(s => s.name === state.studentProfile.name || s.id === 8);
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

      <div class="glass-card" style="padding: 3rem; position: relative; overflow: hidden; border-radius: 30px;">
        <!-- Background Decoration -->
        <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: var(--primary-gradient); opacity: 0.05; border-radius: 50%;"></div>
        
        <div class="flex flex-col md-flex-row gap-8 items-center md-items-start">
          <!-- Teacher Avatar -->
          <div style="width: 160px; height: 160px; border-radius: 50%; background: var(--primary-gradient); display: flex; align-items: center; justify-content: center; border: 5px solid white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; flex-shrink: 0;">
            ${tp.avatar ? `<img src="${tp.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="user" size="80" style="color: white;"></i>`}
          </div>

          <div style="flex: 1; text-align: left;">
            <h2 class="gradient-text" style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem;">${tp.name}</h2>
            <p style="font-size: 1.2rem; color: var(--accent-orange); font-weight: 700; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px;">${tp.category}</p>
            
            <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
              <div class="glass-panel" style="padding: 1.2rem; border-radius: 16px; background: rgba(255,255,255,0.7);">
                <span class="label-caps" style="font-size: 10px;">Пәні</span>
                <p style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${tp.subject}</p>
              </div>
              <div class="glass-panel" style="padding: 1.2rem; border-radius: 16px; background: rgba(255,255,255,0.7);">
                <span class="label-caps" style="font-size: 10px;">Мектебі</span>
                <p style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${tp.school}</p>
              </div>
              <div class="glass-panel" style="padding: 1.2rem; border-radius: 16px; background: rgba(255,255,255,0.7);">
                <span class="label-caps" style="font-size: 10px;">Жұмыс өтілі</span>
                <p style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">${tp.experience}</p>
              </div>
            </div>

            <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(242, 109, 33, 0.05); border-left: 4px solid var(--accent-orange); border-radius: 0 16px 16px 0;">
              <h4 class="label-caps" style="margin-bottom: 0.5rem; font-size: 11px;">Жетістіктері</h4>
              <p style="color: var(--text-secondary); line-height: 1.6; font-style: italic;">"${tp.achievementsText}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
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

function showStudentAI() {
  const content = document.getElementById('student-content');
  content.innerHTML = `
    <div class="animate-fade-in" style="height: 100%; display: flex; flex-direction: column;">
      <div class="flex justify-between items-center" style="margin-bottom: 1.5rem;">
        <button class="btn-secondary v-center" style="gap: 0.5rem;" onclick="renderStudentDashboard()">
          <i data-lucide="arrow-left" size="18"></i> Артқа
        </button>
        <div class="v-center gap-2">
          <div style="width: 10px; height: 10px; background: #4CAF50; border-radius: 50%; box-shadow: 0 0 10px #4CAF50;"></div>
          <span class="label-caps" style="font-size: 0.8rem; opacity: 0.8;">AI Online</span>
        </div>
      </div>

      <div class="glass-panel" style="flex-grow: 1; display: flex; flex-direction: column; padding: 0; min-height: 500px; overflow: hidden; border-radius: 24px;">
        <div id="chat-messages" style="flex-grow: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem; background: rgba(255,255,255,0.2);">
          <div class="ai-message glass-card" style="align-self: flex-start; max-width: 80%; border-radius: 4px 20px 20px 20px; background: white; padding: 1rem 1.5rem; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
             Сәлем! Мен сенің физикадан көмекшіңмін. Маған кез келген сұрағыңды қоя аласың.
          </div>
        </div>

        <div style="padding: 1.5rem; background: white; border-top: 1px solid var(--border-glass);">
          <div class="flex gap-2 mb-3 overflow-x-auto pb-2" style="scrollbar-width: none;">
            <button class="label-caps" style="background: rgba(var(--accent-purple-rgb), 0.1); color: var(--accent-purple); padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 10px; white-space: nowrap; cursor: pointer; border: none;" onclick="setAIInput('Ньютон заңдары')">Ньютон заңдары</button>
            <button class="label-caps" style="background: rgba(var(--accent-cyan-rgb), 0.1); color: var(--accent-cyan); padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 10px; white-space: nowrap; cursor: pointer; border: none;" onclick="setAIInput('Ом заңы')">Ом заңы</button>
            <button class="label-caps" style="background: rgba(var(--accent-orange-rgb), 0.1); color: var(--accent-orange); padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 10px; white-space: nowrap; cursor: pointer; border: none;" onclick="setAIInput('Жылдамдық')">Жылдамдық</button>
          </div>
          <div class="flex gap-2">
            <input type="text" id="ai-chat-input" placeholder="Физика туралы сұра..." 
                   style="flex-grow: 1; padding: 1rem 1.5rem; border-radius: 16px; border: 1px solid var(--border-glass); background: #f8f9fa; outline: none; font-size: 1rem;"
                   onkeypress="if(event.key === 'Enter') sendAIMessage()">
            <button class="btn-primary" style="width: 50px; height: 50px; border-radius: 50%; padding: 0; display: flex; items-center; justify-content: center;" onclick="sendAIMessage()">
              <i data-lucide="send" size="20"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function setAIInput(text) {
  document.getElementById('ai-chat-input').value = text;
  sendAIMessage();
}

function sendAIMessage() {
  const input = document.getElementById('ai-chat-input');
  const query = input.value.trim();
  if (!query) return;

  addChatMessage('user', query);
  input.value = '';

  const messagesContainer = document.getElementById('chat-messages');
  const thinkingId = 'ai-thinking-' + Date.now();
  
  const thinkingHtml = `
    <div id="${thinkingId}" class="ai-message flex items-center gap-2" style="align-self: flex-start; background: rgba(255,255,255,0.5); padding: 0.8rem 1.2rem; border-radius: 4px 16px 16px 16px;">
      <div class="typing-dot"></div>
      <div class="typing-dot" style="animation-delay: 0.2s"></div>
      <div class="typing-dot" style="animation-delay: 0.4s"></div>
    </div>
  `;
  messagesContainer.insertAdjacentHTML('beforeend', thinkingHtml);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  setTimeout(() => {
    document.getElementById(thinkingId).remove();
    let response = getAIResponse(query);
    addChatMessage('ai', response);
    
    // Auto-speak the AI answer
    if (window.speak) window.speak(response.replace(/[#*`]/g, ''));
  }, 1200);
}

function getAIResponse(query) {
  const q = query.toLowerCase();
  for (let key in physicsKnowledgeBase) {
    if (q.includes(key)) {
      return physicsKnowledgeBase[key];
    }
  }
  return "Кешіріңіз, бұл тақырып бойынша әлі мәліметім жоқ. Бірақ мен үнемі үйреніп жатырмын! Басқа сұрақ қойып көріңіз (мысалы: Ньютон заңдары, Ом заңы, Энергия).";
}

function addChatMessage(role, text) {
  const container = document.getElementById('chat-messages');
  const isUser = role === 'user';
  
  const msgHtml = `
    <div class="animate-scale-in" style="align-self: ${isUser ? 'flex-end' : 'flex-start'}; max-width: 80%; border-radius: ${isUser ? '20px 4px 20px 20px' : '4px 20px 20px 20px'}; background: ${isUser ? 'var(--primary-gradient)' : 'white'}; color: ${isUser ? 'white' : 'var(--text-primary)'}; padding: 1rem 1.5rem; box-shadow: 0 5px 15px rgba(0,0,0,0.05); font-size: 1rem; line-height: 1.5;">
      ${text.replace(/\n/g, '<br>')}
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', msgHtml);
  container.scrollTop = container.scrollHeight;
  lucide.createIcons();
}

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

function showResourceLibrary(containerId = 'teacher-content', backFnName = 'renderTeacherDashboard') {
  const content = document.getElementById(containerId);
  if (!content) return;
  
  content.innerHTML = `
    <div class="animate-fade-in">
      <button class="btn-secondary voice-target v-center" onclick="${backFnName}()" style="margin-bottom: 2rem; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
        <i data-lucide="arrow-left" size="18"></i> Басты бетке қайту
      </button>
      <div class="glass-card text-center" style="padding: 4rem 2rem; border-radius: 24px;">
        <div style="background: rgba(242, 109, 33, 0.1); color: var(--accent-orange); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">
          <i data-lucide="library" size="40"></i>
        </div>
        <h2 class="heading-page" style="margin-bottom: 1rem; font-size: 2.2rem; font-weight: 800;">Электрондық оқулықтар</h2>
        <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 2.5rem; font-size: var(--font-base);">Okulyk.kz ресми порталынан қажетті физика оқулықтарын іздеңіз.</p>
        
        <form action="https://okulyk.kz/" target="_blank" method="GET" style="display: flex; gap: 1rem; max-width: 600px; margin: 0 auto; flex-wrap: wrap;">
           <input type="text" name="s" placeholder="Оқулықты іздеу..." class="glass-panel" style="flex: 1; padding: 1.2rem; border: 1px solid var(--border-glass); background: #fff; border-radius: 50px; outline: none; min-width: 250px;">
           <button type="submit" class="btn-primary" style="padding: 0 2.5rem; border-radius: 50px; height: 56px;"><i data-lucide="search"></i> Іздеу</button>
        </form>
      </div>
    </div>
  `;
  lucide.createIcons();
}
