/**
 * PhysicsAccess - Student Logic
 */

/* --- NEW LESSON ENGINE --- */
let activeLessonIndex = 0;
let activeLessonState = { currentStage: 0, stagesCompleted: [false, false, false, false, false] };
let activeQuestionIndex = 0;

function playStudentLesson(lessonId) {
  activeLessonIndex = allLessonsData.findIndex(l => l.id === lessonId);
  if (activeLessonIndex === -1) return;
  
  const saved = localStorage.getItem(`lesson_progress_${lessonId}`);
  if (saved) {
    activeLessonState = JSON.parse(saved);
  } else {
    activeLessonState = { currentStage: 0, stagesCompleted: [false, false, false, false, false] };
  }
  
  // Hide other views and show our custom lesson view using navigate
  if (typeof navigate === 'function') {
    navigate('student-lesson-play');
  } else {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const playView = document.getElementById('student-lesson-play-view');
    if (playView) playView.classList.add('active');
  }
  
  renderLessonPlayView();
}

function processStageCompletion(stageIndex) {
  if (!activeLessonState.stagesCompleted[stageIndex]) {
    activeLessonState.stagesCompleted[stageIndex] = true;
    saveLessonProgressLocally();
    
    // Add points
    awardPoints(20);
  }
}

function awardPoints(points) {
  if (window.state && window.state.studentProfile) {
    window.state.studentProfile.score = (window.state.studentProfile.score || 0) + points;
  }
  
  // Call to Google Sheets conceptually
  saveProgressToSheets(points);
  
  // Refresh dashboard to display updated score if needed
}

async function saveProgressToSheets(points) {
  if (!window.state || !window.state.userEmail) return;
  
  try {
    const GOOGLE_SCRIPTS_AUTH_URL = 'https://script.google.com/macros/s/AKfycbzsHO8t7TM04Sohp6Lq6nuYzLoSvJOHy_fI4MA0wW7qv6tUxUkwpzUHXVpcmrNMtc_zfg/exec';
    const response = await fetch(GOOGLE_SCRIPTS_AUTH_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "saveScore",
        email: window.state.userEmail,
        scoreToAdd: points
      })
    });
    const data = await response.json();
    if (data.success && window.state.studentProfile) {
      window.state.studentProfile.score = data.newScore;
    }
  } catch (err) {
    console.log("Could not push score to sheets", err);
  }
}

function saveLessonProgressLocally() {
  const lesson = allLessonsData[activeLessonIndex];
  localStorage.setItem(`lesson_progress_${lesson.id}`, JSON.stringify(activeLessonState));
}

function goNextLessonStage() {
  if (activeLessonState.currentStage < 4) {
    activeLessonState.currentStage++;
    saveLessonProgressLocally();
    renderLessonPlayView();
  }
}

function renderLessonPlayView() {
  const lesson = allLessonsData[activeLessonIndex];
  const playView = document.getElementById('student-lesson-play-view');
  const stageNames = ["Түсіндірме", "Видео сабақ", "Тест", "Зертхана", "Ойын"];
  const stageIcons = ["book-open", "play-circle", "help-circle", "flask-conical", "gamepad-2"];
  
  let sidebarHtml = `<div class="sidebar-panel glass-panel" style="width: 250px; flex-shrink: 0;">
    <h3 class="label-caps mb-4" style="color: var(--text-secondary);">Кезеңдер</h3>
    <ul class="flex flex-col gap-2" style="list-style: none; padding: 0;">
  `;
  for(let i=0; i<5; i++) {
    const isLocked = i > 0 && !activeLessonState.stagesCompleted[i-1];
    const isCompleted = activeLessonState.stagesCompleted[i];
    const isActive = activeLessonState.currentStage === i;
    
    let icon = isLocked ? 'lock' : (isCompleted ? 'check-circle' : stageIcons[i]);
    let color = isLocked ? 'var(--text-tertiary)' : (isActive ? 'var(--accent-orange)' : 'var(--text-primary)');
    let weight = isActive ? '800' : '500';
    let bg = isActive ? 'rgba(242, 109, 33, 0.05)' : 'transparent';
    if(isCompleted && !isActive) color = '#48bb78';

    sidebarHtml += `<li class="v-center gap-3" style="padding: 0.8rem; border-radius: 12px; background: ${bg}; cursor: ${isLocked ? 'not-allowed' : 'pointer'}; color: ${color}; font-weight: ${weight};" ${!isLocked ? `onclick="activeLessonState.currentStage=${i}; renderLessonPlayView();"` : ''}>
      <i data-lucide="${icon}" size="18"></i> ${stageNames[i]}
    </li>`;
  }
  sidebarHtml += `</ul>
    <button class="btn-secondary v-center gap-2" style="width: 100%; margin-top: 2rem;" onclick="navigate('student-lessons')">
      <i data-lucide="arrow-left" size="18"></i> Тізімге қайту
    </button>
  </div>`;

  let contentHtml = `<div class="content-panel glass-panel" style="flex: 1;" id="lesson-stage-content"></div>`;

  playView.innerHTML = `
    <div class="dashboard-container" style="align-items: stretch; grid-template-columns: 250px 1fr;">
      ${sidebarHtml}
      ${contentHtml}
    </div>
  `;
  
  lucide.createIcons();
  injectLessonStageContent();
}

function injectLessonStageContent() {
  const lesson = allLessonsData[activeLessonIndex];
  const stage = activeLessonState.currentStage;
  const contentArea = document.getElementById('lesson-stage-content');
  
  let html = `
    <div class="flex justify-between items-start mb-6 gap-4">
      <h2 class="gradient-text" style="margin: 0; line-height: 1.2;">${lesson.title}</h2>
      <button class="btn-primary flex-center" onclick="toggleCalculator()" style="width: 44px; height: 44px; border-radius: 12px; padding: 0; flex-shrink: 0; background: var(--primary-gradient); box-shadow: 0 4px 12px var(--glow-orange);">
        <i data-lucide="calculator" size="20"></i>
      </button>
    </div>
  `;
  
  if (stage === 0) {
    html += `
      <div class="glass-card" style="padding: 2rem; border-top: 4px solid var(--accent-orange); font-size: 1.1rem; line-height: 1.8;">
        ${lesson.theory}
      </div>
      <div style="margin-top: 2rem; text-align: right;">
        <button class="btn-primary" onclick="markStageCompleteAndNext(0)" style="padding: 1rem 2rem;">Теорияны оқыдым <i data-lucide="chevron-right"></i></button>
      </div>
    `;
  } else if (stage === 1) {
    html += `
      <div class="glass-card" style="padding: 1rem; background: #000; border-radius: 16px; overflow: hidden;">
        <iframe width="100%" height="500" src="${lesson.video}" frameborder="0" allowfullscreen></iframe>
      </div>
      <div style="margin-top: 2rem; text-align: right;">
        <button class="btn-primary" onclick="markStageCompleteAndNext(1)" style="padding: 1rem 2rem;">Видеоны көрдім <i data-lucide="chevron-right"></i></button>
      </div>
    `;
  } else if (stage === 2) {
    activeQuestionIndex = 0;
    html += `<div id="lesson-inline-quiz"></div>`;
    setTimeout(renderInlineQuiz, 0);
  } else if (stage === 3) {
    html += `
      <div class="glass-card" style="padding: 3rem; text-align: center;">
        <i data-lucide="flask-conical" size="64" style="color: var(--accent-cyan); margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Зертханалық жұмыс</h3>
        <p class="mb-6" style="color: var(--text-secondary);">Виртуалды зертхананы пайдаланып, тәжірибе жасаңыз. Нәтижесін төменге енгізіңіз. <br><br><b>Тапсырма:</b> ${lesson.labVerification ? lesson.labVerification.instruction : 'Мәліметтерді енгізіңіз'}</p>
        <div style="max-width: 400px; margin: 0 auto; display: flex; gap: 1rem;">
          <input type="text" id="inline-lab-input" class="glass-panel" placeholder="Жауап мұнда..." style="flex:1; padding: 1rem; border-radius: 12px; outline: none; border: 1px solid var(--border-glass);">
          <button class="btn-primary" onclick="verifyInlineLab()" style="padding: 0 2rem;">Тексеру</button>
        </div>
        <p id="inline-lab-feedback" class="mt-4" style="font-weight: 800; font-size: 1.1rem;"></p>
      </div>
    `;
  } else if (stage === 4) {
    html += `
      <div class="glass-card flex flex-col items-center justify-center" style="padding: 4rem 2rem; text-align: center; border-top: 4px solid #48bb78; min-height: 400px;">
        <div style="margin-bottom: 2rem; color: #48bb78;" class="animate-scale-in">
          <i data-lucide="award" size="100"></i>
        </div>
        <h2 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: 900;">Құттықтаймыз!</h2>
        <p style="font-size: 1.2rem; color: var(--text-secondary);">Сіз бұл сабақты толық аяқтадыңыз. Сізге <b style="color: var(--accent-orange);">100 балл</b> берілді!</p>
        <button class="btn-primary mt-8" onclick="markStageCompleteAndNext(4); navigate('student-lessons');" style="padding: 1rem 3rem; font-size: 1.1rem;">Аяқтау</button>
      </div>
    `;
  }
  
  contentArea.innerHTML = html;
  if(window.lucide) lucide.createIcons();
}

function markStageCompleteAndNext(stageIdx) {
  processStageCompletion(stageIdx);
  if (stageIdx < 4) {
    goNextLessonStage();
  }
}

function renderInlineQuiz() {
  const lesson = allLessonsData[activeLessonIndex];
  const qContainer = document.getElementById('lesson-inline-quiz');
  if(!qContainer || !lesson.quiz) return;
  
  const qObj = lesson.quiz[activeQuestionIndex];
  qContainer.innerHTML = `
    <div class="glass-card animate-scale-in" style="padding: 3rem; border-radius: 28px;">
      <div class="flex justify-between items-center mb-6">
        <div class="label-caps" style="color: var(--accent-orange); font-size: 0.9rem; font-weight: 800;">Сұрақ ${activeQuestionIndex + 1} / ${lesson.quiz.length}</div>
        <div style="background: rgba(242, 109, 33, 0.1); padding: 4px 12px; border-radius: 20px; color: var(--accent-orange); font-size: 0.8rem; font-weight: 800;">+20 БАЛЛ</div>
      </div>
      <h3 class="mb-8" style="font-size: 1.6rem; line-height: 1.4; font-weight: 700; color: var(--text-primary);">${qObj.q}</h3>
      <div class="grid gap-4">
        ${qObj.a.map((opt, idx) => `
          <button class="quiz-option-btn-new" style="width: 100%; text-align: left; padding: 1.2rem 1.5rem; border-radius: 16px; border: 1.5px solid var(--border-glass); background: white; transition: all 0.2s; cursor: pointer; font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 15px;" 
                  onclick="checkInlineQuiz(${idx}, this)">
            <div class="option-circle" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--border-glass); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; color: var(--text-tertiary);">${String.fromCharCode(65 + idx)}</div>
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
    <style>
      .quiz-option-btn-new:hover { border-color: var(--accent-orange) !important; background: rgba(242, 109, 33, 0.02) !important; transform: translateX(5px); }
      .quiz-option-btn-new:hover .option-circle { border-color: var(--accent-orange) !important; color: var(--accent-orange) !important; }
    </style>
  `;
  if(window.lucide) lucide.createIcons();
}

window.playSound = function(type) {
  const sound = document.getElementById(type === 'correct' ? 'sound-success' : 'sound-error');
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Audio play failed", e));
  }
};

const motivationPhrases = {
  correct: ["Керемет!", "Жарайсың!", "Өте жақсы!", "Алға!", "Сен мықтысың!", "Тамаша жұмыс!"],
  wrong: ["Қайта байқап көр!", "Келесі жолы болады!", "Кішкене ойлан!", "Сен жасай аласың!", "Қателесу - үйренудің басы!"]
};

window.checkInlineQuiz = function(selectedIdx, btn) {
  const lesson = allLessonsData[activeLessonIndex];
  const qObj = lesson.quiz[activeQuestionIndex];
  
  // Prevent multiple clicks
  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => b.style.pointerEvents = 'none');

  if (selectedIdx === qObj.c) {
    btn.style.borderColor = "#48bb78";
    btn.style.background = "#f0fdf4";
    btn.querySelector('.option-circle').style.borderColor = "#48bb78";
    btn.querySelector('.option-circle').style.background = "#48bb78";
    btn.querySelector('.option-circle').style.color = "white";
    
    if (window.playSound) window.playSound('correct');
    if (typeof triggerSalute === 'function') triggerSalute();
    
    setTimeout(() => showMotivationPopup(true), 600);
  } else {
    btn.style.borderColor = "#f56565";
    btn.style.background = "#fff5f5";
    btn.querySelector('.option-circle').style.borderColor = "#f56565";
    btn.querySelector('.option-circle').style.background = "#f56565";
    btn.querySelector('.option-circle').style.color = "white";
    
    if (window.playSound) window.playSound('wrong');
    setTimeout(() => showMotivationPopup(false), 600);
  }
};

function showMotivationPopup(isCorrect) {
  const modal = document.getElementById('motivation-modal');
  const icon = document.getElementById('motivation-icon');
  const title = document.getElementById('motivation-text');
  const subtext = document.getElementById('motivation-subtext');
  
  const phrases = isCorrect ? motivationPhrases.correct : motivationPhrases.wrong;
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  
  icon.innerText = isCorrect ? "🌟" : "💡";
  title.innerText = randomPhrase;
  subtext.innerText = isCorrect ? "Сіз дұрыс жауап бердіңіз!" : "Бұл жолы қателестіңіз, бірақ ештеңе етпейді. Қайталап көріңіз!";
  
  modal.style.display = 'flex';
  modal.classList.add('show');
  
  // Store result for continuing
  modal.dataset.isCorrect = isCorrect;
}

window.hideMotivation = function() {
  const modal = document.getElementById('motivation-modal');
  modal.classList.remove('show');
  setTimeout(() => modal.style.display = 'none', 300);
  
  const isCorrect = modal.dataset.isCorrect === 'true';
  const lesson = allLessonsData[activeLessonIndex];

  if (isCorrect) {
    if (activeQuestionIndex < lesson.quiz.length - 1) {
      activeQuestionIndex++;
      renderInlineQuiz();
    } else {
      // Stage 2 (quiz) is fully complete
      markStageCompleteAndNext(2);
    }
  } else {
    // If wrong, just re-render current question to allow retry
    renderInlineQuiz();
  }
};

window.verifyInlineLab = function() {
  const lesson = allLessonsData[activeLessonIndex];
  const input = document.getElementById('inline-lab-input').value.trim().toLowerCase();
  const feedback = document.getElementById('inline-lab-feedback');
  
  if (lesson.labVerification && input === String(lesson.labVerification.correctAnswer).toLowerCase()) {
    feedback.style.color = '#48bb78';
    feedback.innerText = "Дұрыс! 20 балл қосылды.";
    if (window.playSound) window.playSound('correct');
    setTimeout(() => {
      markStageCompleteAndNext(3);
    }, 1500);
  } else {
    feedback.style.color = 'var(--accent-red)';
    feedback.innerText = "Қате жауап. Қайта есептеңіз.";
    if (window.playSound) window.playSound('wrong');
  }
};

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


/**
 * Renders the list of 10 physics lessons for student.
 * Clicking a lesson opens lessons.html with the corresponding ID.
 */
window.showStudentLessons = function (containerId = 'student-content', backFnName = "navigate('student')") {
  const content = document.getElementById(containerId) || document.getElementById('student-view');
  if (!content) return;

  // Use lessonsData from js/lessons_data.js
  const lessons = typeof allLessonsData !== 'undefined' ? allLessonsData : [];

  content.innerHTML = `
    <div class="animate-fade-in" style="padding: 1rem;">
      <div class="flex justify-between items-center mb-10">
        <div>
          <h2 class="gradient-text" style="font-size: 2.5rem; font-weight: 900; margin: 0;">Сабақтар тізімі</h2>
          <p style="color: var(--text-secondary); margin-top: 0.5rem;">Әрбір сабақты кезең-кезеңімен аяқтап, біліміңді тексер.</p>
        </div>
        <button class="btn-secondary v-center gap-2" onclick="${backFnName}" style="padding: 0.8rem 1.5rem; border-radius: 50px; font-weight: 700;">
          <i data-lucide="arrow-left" size="20"></i> Артқа
        </button>
      </div>

      <div class="lesson-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem;">
        ${lessons.map(lesson => {
          // Check progress from localStorage
          const saved = localStorage.getItem(`lesson_progress_${lesson.id}`);
          const state = saved ? JSON.parse(saved) : null;
          const completed = state && state.stagesCompleted[4];
          const progress = state ? (state.stagesCompleted.filter(s => s).length / 5) * 100 : 0;

          return `
            <div class="lesson-topic-card voice-target" onclick="playStudentLesson(${lesson.id})">
              <div class="topic-num">${lesson.id}</div>
              <div class="topic-content">
                <span class="label-caps" style="color: var(--accent-orange); font-size: 0.7rem;">${lesson.category}</span>
                <h3 style="font-size: 1.2rem; font-weight: 800; margin: 0.5rem 0 1rem; line-height: 1.3;">${lesson.title}</h3>
                
                <div style="height: 6px; background: rgba(0,0,0,0.05); border-radius: 10px; overflow: hidden; margin-bottom: 1rem;">
                  <div style="height: 100%; background: var(--primary-gradient); width: ${progress}%"></div>
                </div>

                <div class="flex justify-between items-center">
                  <span style="font-size: 0.8rem; font-weight: 700; color: ${completed ? '#48bb78' : 'var(--text-secondary)'}">
                    ${completed ? 'АЯҚТАЛДЫ' : (progress > 0 ? `${progress}% ОРЫНДАЛДЫ` : 'БАСТАУ')}
                  </span>
                  <i data-lucide="${completed ? 'check-circle' : 'chevron-right'}" size="18" style="color: ${completed ? '#48bb78' : 'var(--accent-orange)'}"></i>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;


  if (window.lucide) lucide.createIcons();
};

/**
 * Finalizes the lesson, shows celebration and returns to dashboard.
 */
function finishLesson() {
  processStageCompletion(4); // Mark last stage
  triggerSalute();
  
  if (window.speakText) window.speakText('Сабақты сәтті аяқтадыңыз! Жетістігіңіз құтты болсын.');
  
  setTimeout(() => {
    if (typeof navigate === 'function') {
      navigate('student');
    } else {
      // Fallback
      document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
      document.getElementById('student-view').style.display = 'block';
    }
    
    // Refresh score display
    if (typeof renderStudentDashboard === 'function') renderStudentDashboard();
  }, 3000);
}

/**
 * Visual celebration effect
 */
function triggerSalute() {
  const canvas = document.createElement('canvas');
  canvas.id = 'celebration-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

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

    if (alive) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();
}

