/**
 * PhysicsAccess - Student Logic
 */

/* --- NEW LESSON ENGINE --- */
let activeLessonState = { 
  currentStage: 0, 
  stagesCompleted: [false, false, false, false, false, false],
  pointsPerStage: [0, 0, 0, 0, 0, 0],
  labAttempts: 0,
  sessionScore: 0,
  introViewed: false
};
let activeQuestionIndex = 0;


/**
 * Calculates total score based on progress of all 10 lessons in localStorage
 */
function calculateTotalStudentScore() {
  const p = window.state ? window.state.studentProfile : null;
  if (!p) return 0;
  
  let total = 0;
  
  // Calculate points from cloud-synced lesson progress
  if (p.lessonProgress) {
    for (const lessonId in p.lessonProgress) {
      const lessonState = p.lessonProgress[lessonId];
      // Count points from all completed stages in the lesson
      if (lessonState && lessonState.pointsPerStage) {
        total += lessonState.pointsPerStage.reduce((sum, pts) => sum + (pts || 0), 0);
      }
    }
  }
  
  // Add manual points and subtract spent points
  total += (p.assignmentPoints || 0);
  total -= (p.spentPoints || 0);
  
  return Math.max(0, total);
}

const LESSON_STAGE_NAMES = ["Түсіндірме", "Видео сабақ", "Тест", "Зертхана", "Ойын", "Сабақ аяқталды"];
const LESSON_STAGE_POINTS = [10, 10, 30, 25, 25, 0];
const LESSON_STAGE_ICONS = ["book-open", "play-circle", "help-circle", "flask-conical", "gamepad-2", "award"];

function playStudentLesson(lessonId) {
  activeLessonIndex = allLessonsData.findIndex(l => l.id === lessonId);
  if (activeLessonIndex === -1) return;
  
  const p = window.state.studentProfile;
  const cloudData = p && p.lessonProgress ? p.lessonProgress[lessonId] : null;
  const localData = localStorage.getItem(`lesson_progress_${lessonId}`);

  if (cloudData) {
    activeLessonState = cloudData;
  } else if (localData) {
    activeLessonState = JSON.parse(localData);
    // Migration: if we have local but no cloud, save to cloud
    saveLessonProgressLocally();
  } else {
    activeLessonState = { 
      currentStage: 0, 
      stagesCompleted: [false, false, false, false, false, false],
      pointsPerStage: [0, 0, 0, 0, 0, 0],
      labAttempts: 0,
      sessionScore: 0,
      isCompleted: false,
      introViewed: false
    };
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

function processStageCompletion(stageIndex, points = 20) {
  if (!activeLessonState.stagesCompleted[stageIndex]) {
    activeLessonState.stagesCompleted[stageIndex] = true;
    activeLessonState.pointsPerStage[stageIndex] = points;
    activeLessonState.sessionScore += points;
    
    // Check if entire lesson is finished (Stage 4 is Game)
    if (stageIndex === 4) {
      activeLessonState.isCompleted = true;
      // Also mark Stage 5 (Finish) as completed conceptually
      activeLessonState.stagesCompleted[5] = true;
      activeLessonState.pointsPerStage[5] = 0;
    }

    saveLessonProgressLocally();
    
    // Add points to global profile ONLY if lesson is completed
    if (activeLessonState.isCompleted) {
       awardPoints(points); // This will trigger calculateTotalStudentScore() which now filters by isCompleted
    }
  }
}

function awardPoints(points) {
  if (window.state && window.state.studentProfile) {
    const p = window.state.studentProfile;
    p.score = (p.score || 0) + points;
    
    // Update UI immediately (Optimistic UI)
    const scoreEls = document.querySelectorAll('.rating-score-value');
    scoreEls.forEach(el => el.innerText = p.score);
    
    // Save to server
    saveProgressToSheets(points);
    
    // Sync other profile data
    if (typeof syncProfileWithSheets === 'function') syncProfileWithSheets();
  }
}


async function saveProgressToSheets(points) {
  if (!window.state) return;
  const email = window.state.userEmail || (window.state.studentProfile ? window.state.studentProfile.email : null);
  if (!email) return;
  
  try {
    const url = window.GOOGLE_SCRIPTS_AUTH_URL;
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        action: "saveScore",
        email: email,
        scoreToAdd: points
      })
    });
    const data = await response.json();
    
    if (data.success && window.state.studentProfile) {
      window.state.studentProfile.score = data.newScore;
      
      // Update real-time UI
      const scoreEls = document.querySelectorAll('.rating-score-value');
      scoreEls.forEach(el => {
        el.innerText = data.newScore;
      });
      
      // Save locally
      if (typeof saveState === 'function') saveState();
    }
  } catch (err) {
    console.warn("Could not push score to sheets", err);
  }
}

function saveLessonProgressLocally() {
  const lesson = allLessonsData[activeLessonIndex];
  if (!lesson) return;
  
  // Save to LocalStorage as backup
  localStorage.setItem(`lesson_progress_${lesson.id}`, JSON.stringify(activeLessonState));
  
  // Save to State (Cloud)
  if (window.state && window.state.studentProfile) {
    if (!window.state.studentProfile.lessonProgress) window.state.studentProfile.lessonProgress = {};
    window.state.studentProfile.lessonProgress[lesson.id] = activeLessonState;
    
    // Trigger sync
    if (typeof syncProfileWithSheets === 'function') syncProfileWithSheets();
    if (typeof saveState === 'function') saveState();
  }
}

function goNextLessonStage() {
  if (activeLessonState.currentStage < 5) {
    activeLessonState.currentStage++;
  }
  saveLessonProgressLocally();
  renderLessonPlayView();
}

function renderLessonIntroMap(container, lesson) {
  const stages = [
    { name: "Теория", pts: 10, icon: "book-open", desc: "Мәтінді мұқият оқып шығыңыз." },
    { name: "Бейнематериал", pts: 10, icon: "play-circle", desc: "Сабаққа қатысты видеоны толық көріңіз." },
    { name: "Тест", pts: 30, icon: "help-circle", desc: "Әр сұраққа 6 балл. Жалпы 5 сұрақ. Қате жауап берсеңіз, балл берілмейді." },
    { name: "Зертхана", pts: 25, icon: "flask-conical", desc: "5 мүмкіндік бар. Әр қате үшін -5 балл. Тәжірибені дұрыс орындаңыз." },
    { name: "Ойын", pts: 25, icon: "gamepad-2", desc: "Ойын тапсырмасын орындап, біліміңізді бекітіңіз." }
  ];

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in" style="padding: 2rem;">
      <div class="glass-card" style="width: 100%; max-width: 800px; padding: 3rem; border-radius: 40px; border: 2px solid var(--accent-orange);">
        <div class="flex flex-col items-center text-center mb-10">
          <div style="width: 80px; height: 80px; background: rgba(242, 109, 33, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--accent-orange); margin-bottom: 1.5rem;">
            <i data-lucide="map" size="40"></i>
          </div>
          <h2 class="gradient-text" style="font-size: 2.5rem; font-weight: 900; margin-bottom: 0.5rem;">Сабақ картасы</h2>
          <p style="color: var(--text-secondary); font-size: 1.2rem;">${lesson.title}</p>
        </div>

        <div class="grid gap-6" style="margin-bottom: 2.5rem;">
          ${stages.map((s, idx) => `
            <div class="glass-panel flex items-center gap-6" style="padding: 1.8rem; border-radius: 24px; background: white; border: 1.2px solid var(--border-glass); transition: transform 0.2s ease;">
              <div style="width: 55px; height: 55px; border-radius: 18px; background: rgba(242, 109, 33, 0.05); display: flex; align-items: center; justify-content: center; color: var(--accent-orange); flex-shrink: 0;">
                <i data-lucide="${s.icon}" size="26"></i>
              </div>
              <div style="flex: 1;">
                <div class="flex justify-between items-center mb-1">
                  <h4 style="font-weight: 800; font-size: 1.15rem; margin: 0;">${idx + 1}. ${s.name}</h4>
                  <span style="font-weight: 800; color: #48bb78; font-size: 0.95rem;">+${s.pts} БАЛЛ</span>
                </div>
                <p style="font-size: 0.95rem; color: var(--text-tertiary); margin: 0; line-height: 1.5;">${s.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="flex flex-col items-center gap-8">
          <div style="padding: 1.2rem 2.5rem; background: #fffcf0; border: 1.5px dashed #fbbf24; border-radius: 20px; color: #92400e; font-size: 1rem; text-align: center; max-width: 600px; line-height: 1.5;">
            <i data-lucide="info" size="18" style="vertical-align: middle; margin-right: 8px;"></i>
            <strong>Назар аударыңыз:</strong> Сабақ соңында жалпы 100 балл жинауға болады. Барлық тапсырмаларды мұқият орындаңыз!
          </div>
          
          <button class="btn-primary" onclick="confirmIntroAndStart()" style="padding: 1.3rem 4rem; font-size: 1.25rem; border-radius: 50px; box-shadow: 0 12px 30px rgba(242, 109, 33, 0.3); width: 100%; max-width: 440px;">ТАНЫСТЫМ, САБАҚТЫ БАСТАУ</button>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
}

window.confirmIntroAndStart = function() {
  activeLessonState.introViewed = true;
  saveLessonProgressLocally();
  renderLessonPlayView();
};

function renderLessonPlayView() {
  const lesson = allLessonsData[activeLessonIndex];
  const playView = document.getElementById('student-lesson-play-view');
  
  // 1. Check if we need to show the intro roadmap
  if (!activeLessonState.introViewed) {
    renderLessonIntroMap(playView, lesson);
    return;
  }
  
  let sidebarHtml = `<div class="sidebar-panel glass-panel" style="width: 250px; flex-shrink: 0;">
    <h3 class="label-caps mb-4" style="color: var(--text-secondary);">Кезеңдер</h3>
    <ul class="flex flex-col gap-2 mt-2" style="list-style: none; padding: 0;">
  `;

  // Determine stage count - show 6th stage
  const totalDisplayStages = 6;

  for(let i=0; i < totalDisplayStages; i++) {
    const isLocked = i > 0 && !activeLessonState.stagesCompleted[i-1];
    const isCompleted = activeLessonState.stagesCompleted[i];
    const isActive = activeLessonState.currentStage === i;
    
    let icon = isLocked ? 'lock' : (isCompleted ? 'check-circle' : LESSON_STAGE_ICONS[i]);
    let color = isLocked ? 'var(--text-tertiary)' : (isActive ? 'var(--accent-orange)' : 'var(--text-primary)');
    let weight = isActive ? '800' : '500';
    let bg = isActive ? 'rgba(242, 109, 33, 0.05)' : 'transparent';
    if(isCompleted && !isActive) color = '#48bb78';

    const pointsEarned = activeLessonState.pointsPerStage[i] || 0;
    const pointsLabel = isCompleted ? `${pointsEarned} б` : `${LESSON_STAGE_POINTS[i]} б`;

    sidebarHtml += `<li class="v-center justify-between sidebar-nav-item" style="padding: 0.8rem; border-radius: 12px; background: ${bg}; cursor: ${isLocked ? 'not-allowed' : 'pointer'}; color: ${color}; font-weight: ${weight}; transition: all 0.2s;" ${!isLocked ? `onclick="activeLessonState.currentStage=${i}; renderLessonPlayView();"` : ''}>
      <div class="v-center gap-3">
        <i data-lucide="${icon}" size="18"></i> 
        <span>${LESSON_STAGE_NAMES[i]}</span>
      </div>
      ${i < 5 ? `<span style="font-size: 0.7rem; opacity: 0.7; font-weight: 700;">${pointsLabel}</span>` : ''}
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
  
  // AUTO-FIX: If a stage is completed but has 0 points (and it shouldn't), attempt to fix it
  for (let i = 0; i < 5; i++) {
    if (activeLessonState.stagesCompleted[i] && (activeLessonState.pointsPerStage[i] || 0) === 0) {
      let repairPoints = 0;
      if (i === 0) repairPoints = 10; // Theory
      if (i === 1) repairPoints = 10; // Video
      if (i === 4) repairPoints = 25; // Game
      if (i === 3 && activeLessonState.labAttempts < 5) repairPoints = 25; // Lab (full if not too many attempts)
      
      if (repairPoints > 0) {
        activeLessonState.pointsPerStage[i] = repairPoints;
        activeLessonState.sessionScore += repairPoints;
        awardPoints(repairPoints);
        saveLessonProgressLocally();
      }
    }
  }

  lucide.createIcons();
  injectLessonStageContent();
}

function injectLessonStageContent() {
  const lesson = allLessonsData[activeLessonIndex];
  const stage = activeLessonState.currentStage;
  const contentArea = document.getElementById('lesson-stage-content');
  
  let html = `
    <div class="flex justify-between items-center gap-4" style="background: rgba(255,255,255,0.4); padding: 1.2rem 1.5rem; border-radius: 20px; border: 1px solid var(--border-glass); margin-bottom: 1.8rem;">
      <div>
         <div class="label-caps" style="color: var(--accent-orange); font-size: 0.7rem; margin-bottom: 0.2rem;">${LESSON_STAGE_NAMES[stage]}</div>
         <h2 class="gradient-text" style="margin: 0; line-height: 1.2; font-size: 1.6rem;">${lesson.title}</h2>
      </div>
      <div class="flex items-center gap-3">
         ${stage < 5 ? `
         <div style="background: #e6fffa; color: #234e52; padding: 0.5rem 1.2rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; border: 1.5px solid #b2f5ea; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="award" size="16"></i>
            <span>${activeLessonState.stagesCompleted[stage] ? `${activeLessonState.pointsPerStage[stage]} БАЛЛ АЛЫНДЫ` : `ОСЫ БӨЛІМ: ${LESSON_STAGE_POINTS[stage]} БАЛЛ`}</span>
         </div>
         ` : ''}
      </div>
    </div>
  `;
  
  if (stage === 0) {
    html += `
      <div class="glass-card no-hover-scale" style="padding: 2rem; border-top: 4px solid var(--accent-orange); font-size: 1.1rem; line-height: 1.8;">
        ${lesson.theory}
      </div>
      <div style="margin-top: 2rem; text-align: right;">
        <button class="btn-primary" onclick="markStageCompleteAndNext(0)" style="padding: 1rem 2rem;">Теорияны оқыдым <i data-lucide="chevron-right"></i></button>
      </div>
    `;
  } else if (stage === 1) {
    html += `
      <div class="glass-card no-hover-scale" style="padding: 1rem; background: #000; border-radius: 16px; overflow: hidden;">
        <iframe width="100%" height="500" src="https://www.youtube.com/embed/${lesson.videoId}" frameborder="0" allowfullscreen></iframe>
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
    // Stage 3: Dynamic Laboratory Integration
    const labRendererMap = {
      1: window.renderFreeFallLab,
      2: window.renderImpulseLab,
      3: window.renderHookeLab,
      4: window.renderNewton1Lab,
      5: window.renderNewton2Lab,
      6: window.renderNewton3Lab,
      7: window.renderGravityLab,
      8: window.renderDensityLab,
      9: window.renderPressureLab,
      10: window.renderArchimedesLab
    };

    const renderer = labRendererMap[lesson.id];
    
    // We define a success callback for the interactive labs
    window.onInteractiveLabSuccess = () => {
      // Award points for interactive lab success
      const points = Math.max(5, 25 - (activeLessonState.labAttempts * 5));
      
      // Small delay to let the user see the "Correct" feedback in the lab
      setTimeout(() => {
        markStageCompleteAndNext(3, points);
        window.onInteractiveLabSuccess = null; // Clear to prevent accidental double triggers
      }, 1500);
    };

    if (renderer) {
      html += `
        <div class="glass-card no-hover-scale" style="padding: 1rem; border-radius: 20px; background: white;">
          <div id="interactive-lab-workspace" class="animate-fade-in">
            ${renderer()}
          </div>
        </div>
      `;
      // We need to re-initialize lab state or sim after injection
      // Some labs use setTimeouts in their renderers, which is fine since they are in app.js
    } else {
      // Fallback for lessons without specific labs
      html += `
        <div class="glass-card no-hover-scale" style="padding: 3rem; text-align: center;">
          <i data-lucide="flask-conical" size="64" style="color: var(--accent-cyan); margin-bottom: 1rem;"></i>
          <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Зертханалық жұмыс</h3>
          <p class="mb-6" style="color: var(--text-secondary);">Виртуалды зертхананы пайдаланып, тәжірибе жасаңыз. Нәтижесін төменге енгізіңіз. <br><br><b>Тапсырма:</b> ${lesson.labVerification ? lesson.labVerification.instruction : 'Мәліметтерді енгізіңіз'}</p>
          <div style="max-width: 400px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
            <input type="text" id="inline-lab-input" class="glass-panel" placeholder="Жауап мұнда..." style="flex: 1 1 250px; padding: 1rem; border-radius: 12px; outline: none; border: 1px solid var(--border-glass);">
            <button class="btn-primary" onclick="verifyInlineLab()" style="padding: 0 2rem; min-height: 50px; border-radius: 12px;">Тексеру</button>
          </div>
          <p id="inline-lab-feedback" class="mt-4" style="font-weight: 800; font-size: 1.1rem; min-height: 1.5rem;"></p>
        </div>
      `;
    }
  } else if (stage === 4) {
    if (lesson.customGame === 'maze') {
      html += `
        <div class="glass-card no-hover-scale flex flex-col items-center" style="padding: 1.5rem; text-align: center; border-radius: 20px; background: white; min-height: 600px;">
          <h3 class="mb-4" style="font-weight: 800; color: var(--accent-orange);"><i data-lucide="gamepad-2" style="vertical-align: middle; margin-right: 8px;"></i> Сабақты бекіту ойыны: Лабиринт</h3>
          <div id="maze-game-container" style="width: 100%; margin-bottom: 2rem;"></div>
          ${!activeLessonState.stagesCompleted[4] ? `<button class="btn-primary" id="maze-complete-btn" onclick="markStageCompleteAndNext(4, 25)" style="padding: 1rem 3rem; background: #f97316; font-weight: 800; opacity: 0.5;" disabled>ОЙЫНДЫ АЯҚТАДЫМ</button>` : `<div class="p-4 bg-green-50 text-green-600 rounded-xl font-bold">Ойын аяқталды! Келесі кезеңге өтіңіз.</div>`}
        </div>
      `;
      setTimeout(() => initMazeGame('#maze-game-container'), 100);
    } else if (lesson.gameUrl) {
      html += `
        <div class="glass-card no-hover-scale flex flex-col items-center" style="padding: 1.5rem; text-align: center; border-radius: 20px; background: white; min-height: 500px;">
          <h3 class="mb-4" style="font-weight: 800; color: var(--accent-orange);"><i data-lucide="gamepad-2" style="vertical-align: middle; margin-right: 8px;"></i> Сабақты бекіту ойыны</h3>
          <div style="width: 100%; height: 500px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-glass); background: #f8fafc; margin-bottom: 1.5rem;">
            <iframe src="${lesson.gameUrl}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>
          </div>
          
          <div id="game-confirm-area" class="animate-fade-in" style="width: 100%; padding: 1.5rem; background: rgba(242, 109, 33, 0.05); border-radius: 16px; border: 1.5px dashed var(--accent-orange);">
            <p style="margin-bottom: 1rem; font-weight: 700; color: var(--text-primary);">Ойынды аяқтаған соң төмендегі батырманы басыңыз:</p>
            <button class="btn-primary" onclick="confirmGameFinished()" style="padding: 0.8rem 2rem; font-weight: 800;">
              МЕН ОЙЫНДЫ АЯҚТАДЫМ
            </button>
          </div>
        </div>
      `;
    } else if (lesson.gameContent) {
      html += `<div id="internal-game-container"></div>`;
      setTimeout(() => renderInternalGame(lesson.gameContent), 100);
    }
  } else if (stage === 5) {
    // Stage 5 is the NEW "Lesson Finished" screen
    html += `
      <div class="glass-card flex flex-col items-center justify-center animate-scale-in" style="padding: 4rem 2rem; text-align: center; border-top: 4px solid #48bb78; min-height: 500px; background: white; border-radius: 28px;">
        <div style="margin-bottom: 2rem; color: #48bb78;">
          <i data-lucide="award" size="100"></i>
        </div>
        <h2 style="font-size: 2.5rem; margin-bottom: 1.5rem; font-weight: 900; color: var(--text-primary);">Құттықтаймыз!</h2>
        <p style="font-size: 1.2rem; color: var(--text-secondary); max-width: 500px;">Сіз бүгінгі сабақ пен барлық тапсырмаларды сәтті аяқтадыңыз. Жетістіктеріңізбен мақтанамыз!</p>
        
        <div class="flex-center flex-col gap-3 mt-10 mb-12" style="padding: 2.5rem; background: rgba(72, 187, 120, 0.05); border-radius: 30px; border: 2px solid rgba(72, 187, 120, 0.15); width: 100%; max-width: 500px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);">
           <div style="font-size: 1.1rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Сіздің жинаған баллыңыз:</div>
           <div style="font-size: 2.5rem; font-weight: 900; color: #2d3748; margin-top: 0.5rem;">
              <span style="color: #48bb78;">${activeLessonState.sessionScore} балл</span>
           </div>
           <div style="font-size: 1.2rem; font-weight: 700; color: var(--accent-orange); background: #fff; padding: 0.5rem 1.5rem; border-radius: 50px; border: 1px solid var(--border-glass); margin-top: 0.5rem;">
              ${activeLessonState.sessionScore} PA Point
           </div>
        </div>

        <div class="flex flex-row gap-4 px-4" style="width: 100%; justify-content: center; margin-top: 2.5rem;">
          <button class="btn-primary" onclick="navigate('student-lessons')" style="flex: 1; max-width: 220px; background: #f97316; padding: 1.2rem; border-radius: 16px; font-weight: 800; font-size: 1rem;">
             САБАҚТЫ АЯҚТАУ
          </button>
          <button class="btn-secondary" onclick="restartLesson()" style="flex: 1; max-width: 220px; padding: 1.2rem; border-radius: 16px; font-weight: 800; font-size: 1rem; border: 2px solid var(--accent-orange); color: var(--accent-orange); background: white; display: flex; align-items: center; justify-content: center; gap: 8px;">
             <i data-lucide="rotate-ccw" size="18"></i> ҚАЙТАДАН БАСТАУ
          </button>
        </div>
      </div>
    `;
  }
  
  contentArea.innerHTML = html;
  if(window.lucide) lucide.createIcons();
}

window.restartLesson = function() {
  if (confirm("Сабақты басынан бастағыңыз келе ме? Жиналған барлық баллдар жойылады.")) {
    const lesson = allLessonsData[activeLessonIndex];
    
    // REDUCE TOTAL SCORE
    const pointsToRemove = activeLessonState.sessionScore || 0;
    if (window.state && window.state.studentProfile && pointsToRemove > 0) {
      window.state.studentProfile.score = Math.max(0, (window.state.studentProfile.score || 0) - pointsToRemove);
      if (typeof saveProgressToSheets === 'function') saveProgressToSheets(-pointsToRemove); 
    }

    activeLessonState = { 
      currentStage: 0, 
      stagesCompleted: [false, false, false, false, false, false],
      pointsPerStage: [0, 0, 0, 0, 0, 0],
      labAttempts: 0,
      sessionScore: 0
    };
    activeQuestionIndex = 0;
    saveLessonProgressLocally();
    renderLessonPlayView();
  }
};

function markStageCompleteAndNext(stageIdx, forcedPoints = null) {
  let points = 20;
  if (stageIdx === 0) points = 10; // Theory
  if (stageIdx === 1) points = 10; // Video
  if (stageIdx === 4) points = 25; // Game
  if (stageIdx === 3) {
    // Lab points: if forcedPoints provided, use them; otherwise use current calculated points
    points = (forcedPoints !== null) ? forcedPoints : Math.max(5, 25 - (activeLessonState.labAttempts * 5));
  }
  if (stageIdx === 2) {
    // Quiz points are awarded per question, so we take what's recorded
    points = activeLessonState.pointsPerStage[2] || 0;
  }
  
  // For other stages, if forcedPoints is provided, use it
  if (forcedPoints !== null) points = forcedPoints;

  processStageCompletion(stageIdx, points);
  goNextLessonStage();
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
        <div style="background: rgba(242, 109, 33, 0.1); padding: 4px 12px; border-radius: 20px; color: var(--accent-orange); font-size: 0.8rem; font-weight: 800;">+6 БАЛЛ</div>
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
      <div id="inline-quiz-feedback" class="animate-fade-in" style="margin-top: 2rem;"></div>
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
    
    // Award 6 points for correct answer to session state
    activeLessonState.pointsPerStage[2] += 6;
    activeLessonState.sessionScore += 6;
    saveLessonProgressLocally();
    
    setTimeout(() => renderInlineFeedback(true), 400);
  } else {
    btn.style.borderColor = "#f56565";
    btn.style.background = "#fff5f5";
    btn.querySelector('.option-circle').style.borderColor = "#f56565";
    btn.querySelector('.option-circle').style.background = "#f56565";
    btn.querySelector('.option-circle').style.color = "white";
    
    // Highlight correct answer
    const allButtons = btn.parentElement.querySelectorAll('.quiz-option-btn-new');
    if (allButtons[qObj.c]) {
      allButtons[qObj.c].style.borderColor = "#48bb78";
      allButtons[qObj.c].style.background = "rgba(72, 187, 120, 0.05)";
    }

    if (window.playSound) window.playSound('wrong');
    setTimeout(() => renderInlineFeedback(false, qObj.a[qObj.c]), 400);
  }
};

function renderInlineFeedback(isCorrect, correctText = '') {
  const container = document.getElementById('inline-quiz-feedback');
  if (!container) return;

  const phrases = isCorrect ? motivationPhrases.correct : motivationPhrases.wrong;
  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  let subtext = isCorrect ? "Сіз дұрыс жауап бердіңіз!" : "Бұл жолы қателестіңіз, бірақ ештеңе етпейді.";
  if (!isCorrect && correctText) {
    subtext += `<br><span style="color: #48bb78; font-weight: 700; margin-top: 5px; display: block;">Дұрыс жауап: ${correctText}</span>`;
  }
  
  const bgColor = isCorrect ? "rgba(72, 187, 120, 0.1)" : "rgba(245, 101, 101, 0.1)";
  const borderColor = isCorrect ? "#48bb78" : "#f56565";
  const icon = isCorrect ? "🌟" : "💡";

  container.innerHTML = `
    <div class="glass-card animate-slide-in" style="background: ${bgColor}; border: 2px solid ${borderColor}; padding: 1.5rem; border-radius: 20px; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">${icon}</div>
      <h4 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 0.2rem; color: var(--text-primary);">${randomPhrase}</h4>
      <p style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 1.2rem; line-height: 1.4;">${subtext}</p>
      <button class="btn-primary" style="width: 100%; border-radius: 12px; padding: 0.8rem;" onclick="continueFromFeedback(${isCorrect})">ЖАЛҒАСТЫРУ</button>
    </div>
  `;
}

window.continueFromFeedback = function(isCorrect) {
  const lesson = allLessonsData[activeLessonIndex];
  // Always move to next, no retry as requested
  if (activeQuestionIndex < lesson.quiz.length - 1) {
    activeQuestionIndex++;
    renderInlineQuiz();
  } else {
    // Stage 2 (quiz) is complete (points were awarded per question)
    activeLessonState.stagesCompleted[2] = true;
    saveLessonProgressLocally();
    goNextLessonStage();
  }
};



window.verifyInlineLab = function() {
  const lesson = allLessonsData[activeLessonIndex];
  const input = document.getElementById('inline-lab-input').value.trim().toLowerCase();
  const feedback = document.getElementById('inline-lab-feedback');
  
  if (lesson.labVerification && input === String(lesson.labVerification.correctAnswer).toLowerCase()) {
    // Success! Award points based on attempts
    const points = Math.max(0, 25 - (activeLessonState.labAttempts * 5));
    feedback.style.color = '#48bb78';
    feedback.innerText = `Дұрыс! ${points} балл қосылды.`;
    if (window.playSound) window.playSound('correct');
    
    setTimeout(() => {
      processStageCompletion(3, points);
      goNextLessonStage();
    }, 1500);
  } else {
    activeLessonState.labAttempts++;
    saveLessonProgressLocally();
    
    if (activeLessonState.labAttempts >= 5) {
      feedback.style.color = 'var(--accent-orange)';
      feedback.innerText = "Мүмкіндіктер таусылды. Келесі бөлімге өтеміз (0 балл).";
      if (window.playSound) window.playSound('wrong');
      setTimeout(() => {
        processStageCompletion(3, 0);
        goNextLessonStage();
      }, 2000);
    } else {
      feedback.style.color = 'var(--accent-red)';
      feedback.innerText = `Қате жауап. Қалды: ${5 - activeLessonState.labAttempts} мүмкіндік.`;
      if (window.playSound) window.playSound('wrong');
    }
  }
};

// --- Internal Lesson Games ---
function renderInternalGame(config) {
  const container = document.getElementById('internal-game-container');
  if(!container) return;

  if (config.type === 'matching') {
    renderMatchingGame(config, container);
  } else if (config.type === 'scramble') {
    renderScrambleGame(config, container);
  }
}

function renderMatchingGame(config, container) {
  let items = [...config.items];
  let leftSide = [...items].sort(() => Math.random() - 0.5);
  let rightSide = [...items].sort(() => Math.random() - 0.5);
  let matchesFound = 0;

  window.handleStudentMatchSelection = function(btn, side) {
    if (!window.studentMatchState) window.studentMatchState = { left: null, right: null };
    const parent = btn.parentElement;
    parent.querySelectorAll('.match-btn').forEach(b => { if(!b.disabled) b.style.borderColor = 'var(--border-glass)'; });
    
    window.studentMatchState[side] = btn;
    btn.style.borderColor = 'var(--accent-orange)';
    btn.style.background = 'rgba(242, 109, 33, 0.05)';

    if (window.studentMatchState.left && window.studentMatchState.right) {
      if (window.studentMatchState.left.getAttribute('data-term') === window.studentMatchState.right.getAttribute('data-term')) {
        if(window.playSound) window.playSound('correct');
        window.studentMatchState.left.style.borderColor = '#4ADE80'; 
        window.studentMatchState.left.style.background = 'rgba(74, 222, 128, 0.1)';
        window.studentMatchState.right.style.borderColor = '#4ADE80'; 
        window.studentMatchState.right.style.background = 'rgba(74, 222, 128, 0.1)';
        window.studentMatchState.left.disabled = true; 
        window.studentMatchState.right.disabled = true;
        matchesFound++;
        if (matchesFound === items.length) {
          setTimeout(() => finishLessonGame(), 1000);
        }
      } else {
        if(window.playSound) window.playSound('wrong');
        const l = window.studentMatchState.left, r = window.studentMatchState.right;
        l.style.borderColor = '#F87171'; r.style.borderColor = '#F87171';
        setTimeout(() => {
          if(!l.disabled) { l.style.borderColor = ''; l.style.background = ''; }
          if(!r.disabled) { r.style.borderColor = ''; r.style.background = ''; }
        }, 500);
      }
      window.studentMatchState.left = null; window.studentMatchState.right = null;
    }
  };

  container.innerHTML = `
    <div class="glass-card animate-fade-in" style="padding: 2rem; background: white; border-radius: 28px;">
      <div style="padding: 1rem; background: #fffcf0; border: 1px dashed #fbbf24; border-radius: 12px; margin-bottom: 2rem; display: flex; align-items: flex-start; gap: 10px;">
        <i data-lucide="info" size="20" style="color: #d97706; margin-top: 3px;"></i>
        <div style="font-size: 0.9rem; color: #92400e;">
          <strong>Ойын ережесі:</strong> Сол жақтағы терминге оң жақтан сәйкес келетін анықтаманы табыңыз. Екеуін кезекпен бассаңыз, олар жасыл түске боялады. Барлық жұпты тапқанда ойын аяқталады.
        </div>
      </div>
      <h3 class="mb-6" style="font-weight: 800; color: var(--accent-orange); text-align: center;">Сәйкестендіру ойыны: Тұрақтылар мен анықтамалар</h3>
      <p class="mb-8 text-center" style="color: var(--text-secondary);">Сол жақтан терминді, оң жақтан оның мағынасын таңдаңыз.</p>
      <div class="grid gap-6" style="grid-template-columns: 1fr 1fr; align-items: stretch;">
        <div id="smatch-left" class="flex flex-col gap-3">
          ${leftSide.map(m => `<button class="match-btn flex-center animate-slide-in" data-term="${m.term}" onclick="handleStudentMatchSelection(this, 'left')" style="padding: 1.2rem; border-radius: 16px; border: 2px solid var(--border-glass); background: #f8fafc; font-weight: 800; cursor: pointer; transition: all 0.3s; min-height: 80px; font-size: 1rem;">${m.term}</button>`).join('')}
        </div>
        <div id="smatch-right" class="flex flex-col gap-3">
          ${rightSide.map(m => `<button class="match-btn flex-center animate-slide-in" data-term="${m.term}" onclick="handleStudentMatchSelection(this, 'right')" style="padding: 1.2rem; border-radius: 16px; border: 2px solid var(--border-glass); background: #f8fafc; font-weight: 600; cursor: pointer; transition: all 0.3s; min-height: 80px; font-size: 0.9rem; line-height: 1.4;">${m.def}</button>`).join('')}
        </div>
      </div>
    </div>
  `;
  if(window.lucide) lucide.createIcons();
}

function renderScrambleGame(config, container) {
  let wordIndex = 0;
  const words = config.words;
  
  window.checkScrambleWord = function() {
    const input = document.getElementById('scramble-input').value.trim().toUpperCase();
    const feedback = document.getElementById('scramble-feedback');
    const target = words[wordIndex];
    
    if (input === target) {
      if(window.playSound) window.playSound('correct');
      feedback.style.color = '#4ADE80';
      feedback.innerText = "Дұрыс! Келесі сөз...";
      setTimeout(() => {
        wordIndex++;
        if (wordIndex < words.length) {
          nextScramble();
        } else {
          finishLessonGame();
        }
      }, 1200);
    } else {
      if(window.playSound) window.playSound('wrong');
      feedback.style.color = '#F87171';
      feedback.innerText = "Қате жауап, қайта байқап көр.";
      const inputEl = document.getElementById('scramble-input');
      inputEl.classList.add('shake');
      setTimeout(() => inputEl.classList.remove('shake'), 500);
    }
  };

  function nextScramble() {
    const target = words[wordIndex];
    const scrambled = target.split('').sort(() => Math.random() - 0.5).join('');
    
    container.innerHTML = `
      <div class="glass-card animate-scale-in" style="padding: 2.5rem; background: white; border-radius: 28px; text-align: center;">
        <div style="padding: 1rem; background: #f0f9ff; border: 1px dashed #0284c7; border-radius: 12px; margin-bottom: 2rem; display: flex; align-items: flex-start; gap: 10px; text-align: left;">
          <i data-lucide="info" size="20" style="color: #0284c7; margin-top: 3px;"></i>
          <div style="font-size: 0.9rem; color: #0369a1;">
            <strong>Ойын ережесі:</strong> Төменде физикалық терминнің әріптері араласып берілген. Әріптерді дұрыс ретпен басып, сөзді құрастырыңыз. Қателессеңіз, «Тазалау» батырмасын басыңыз.
          </div>
        </div>
        <h3 class="mb-2" style="font-weight: 800; color: var(--accent-orange);">Жасырын сөзді табу</h3>
        <p class="mb-4" style="color: var(--text-tertiary);">Сөз (${wordIndex + 1} / ${words.length})</p>
        
        <div class="flex-center" style="gap: 12px; flex-wrap: wrap; margin-bottom: 1.2rem;">
          ${scrambled.split('').map(char => `<div class="glass-panel flex-center" style="width: 50px; height: 60px; font-size: 1.8rem; font-weight: 900; background: var(--primary-gradient); color: white; border-radius: 12px; box-shadow: 0 5px 15px rgba(242, 109, 33, 0.2); transition: transform 0.2s;">${char}</div>`).join('')}
        </div>
        
        <div class="flex flex-col gap-4" style="max-width: 400px; margin: 0 auto;">
          <input type="text" id="scramble-input" class="glass-panel" placeholder="Жауапты жазыңыз..." autocomplete="off" spellcheck="false" style="width: 100%; padding: 1.2rem; border-radius: 16px; font-size: 1.2rem; text-align: center; text-transform: uppercase; font-weight: 800; border: 2px solid var(--border-glass); outline: none;" onkeypress="if(event.key === 'Enter') checkScrambleWord()">
          <button class="btn-primary" onclick="checkScrambleWord()" style="padding: 1.2rem; border-radius: 16px; font-weight: 800; font-size: 1.1rem;">ТЕКСЕРУ</button>
          <p id="scramble-feedback" style="font-weight: 800; min-height: 24px;"></p>
        </div>
      </div>
    `;
    document.getElementById('scramble-input').focus();
    if(window.lucide) lucide.createIcons();
  }

  nextScramble();
}

function finishLessonGame() {
  if (window.playSound) window.playSound('complete');
  if (typeof triggerSalute === 'function') triggerSalute();
  
  // Properly award points and advance
  markStageCompleteAndNext(4, 25);
}

// Student AI Assistant Logic
let studentChatMessages = [
  { role: 'ai', text: 'Сәлем! Мен саған физиканы түсінуге көмектесемін. Формулалар, заңдар немесе есептер бойынша сұрақтарың болса, қоя бер!', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
];

window.showStudentAIAssistant = showStudentAIAssistant;
function showStudentAIAssistant() {
  const view = document.getElementById('student-ai-view');
  if (!view) return;
  
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

window.clearStudentAIChat = clearStudentAIChat;
function clearStudentAIChat() {
  studentChatMessages = [
    { role: 'ai', text: 'Сәлем! Мен саған физиканы түсінуге көмектесемін. Формулалар, заңдар немесе есептер бойынша сұрақтарың болса, қоя бер!', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ];
  renderStudentChatMessages();
}

window.renderStudentChatMessages = renderStudentChatMessages;
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

window.sendStudentAIMessage = sendStudentAIMessage;
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
      /* speak() notification removed */
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
          const p = window.state.studentProfile;
          const lessonProgress = (p && p.lessonProgress) ? p.lessonProgress[lesson.id] : null;
          const completed = lessonProgress && lessonProgress.isCompleted;
          const progress = lessonProgress ? (lessonProgress.stagesCompleted.filter(s => s).length / 5) * 100 : 0;

          return `
            <div class="lesson-topic-card voice-target" onclick="playStudentLesson(${lesson.id})" style="position: relative;">
              <div class="topic-num">${lesson.id}</div>
              <div class="topic-content">
                <div class="flex justify-between items-start" style="margin-bottom: 0.5rem;">
                   <span class="label-caps" style="color: var(--accent-orange); font-size: 0.7rem;">${lesson.category}</span>
                   ${progress > 0 ? `
                   <button onclick="event.stopPropagation(); window.restartLessonFromList(${lesson.id})" class="btn-icon" title="Қайтадан бастау" style="background: rgba(0,0,0,0.05); width: 32px; height: 32px; border-radius: 8px; color: var(--text-tertiary); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.2s;">
                      <i data-lucide="rotate-ccw" size="14"></i>
                   </button>` : ''}
                </div>
                <h3 style="font-size: 1.2rem; font-weight: 800; margin: 0 0 1rem; line-height: 1.3;">${lesson.title}</h3>
                
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

window.restartLessonFromList = function(lessonId) {
  if (confirm("Бұл сабақты басынан бастағыңыз келе ме? Жиналған барлық баллдар жойылады.")) {
    // 1. Reduce total score
    const saved = localStorage.getItem(`lesson_progress_${lessonId}`);
    if (saved) {
      const stateData = JSON.parse(saved);
      const pointsToRemove = stateData.sessionScore || 0;
      if (window.state && window.state.studentProfile && pointsToRemove > 0) {
        window.state.studentProfile.score = Math.max(0, (window.state.studentProfile.score || 0) - pointsToRemove);
        if (typeof saveProgressToSheets === 'function') saveProgressToSheets(-pointsToRemove); 
      }
    }
    
    // 2. Remove progress
    localStorage.removeItem(`lesson_progress_${lessonId}`);
    
    // 3. Identify active container and re-render
    const lessonsView = document.getElementById('student-lessons-view');
    const studentContent = document.getElementById('student-content');
    
    if (lessonsView && lessonsView.classList.contains('active')) {
      window.showStudentLessons('student-lessons-view', "navigate('student')");
    } else if (studentContent) {
      // If we're on the dashboard or another view that shows lessons
      if (typeof renderStudentDashboard === 'function') renderStudentDashboard();
      // Also try to refresh the specific lessons list if it exists inside content
      window.showStudentLessons('student-content', "navigate('student')");
    } else {
      // Fallback
      window.showStudentLessons();
    }

    if (window.playSound) window.playSound('correct');
  }
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

window.buyShopItem = function(type, itemId) {
  let collection;
  if (type === 'avatar') collection = SHOP_CATALOG.avatars;
  else if (type === 'frame') collection = SHOP_CATALOG.frames;
  else collection = SHOP_CATALOG.titles;

  const item = collection.find(i => i.id === itemId);
  if (!item) return;

  const p = window.state.studentProfile;
  if (!p.inventory) p.inventory = [];

  if (p.inventory.includes(itemId)) {
    return alert('Бұл зат сізде бұрыннан бар!');
  }

  if ((p.score || 0) < item.price) {
    return alert(`Қаражатыңыз жетпейді! Сізге тағы ${item.price - (p.score || 0)} PA Point қажет.`);
  }

  if (confirm(`${item.name} сатып алу үшін ${item.price} PA Point жұмсайсыз ба?`)) {
    // Instead of p.score -= item.price, we increment spentPoints
    p.spentPoints = (p.spentPoints || 0) + item.price;
    p.inventory.push(itemId);
    
    // Subtract from local score immediately (Optimistic UI)
    p.score = Math.max(0, (p.score || 0) - item.price);
    
    // Sync subtraction to cloud
    saveProgressToSheets(-item.price);

    // Automatically equip after buy
    if (type === 'avatar') p.activeIcon = item.icon;
    else if (type === 'frame') p.activeFrame = item.style;
    else p.activeTitle = item.name;

    if (typeof saveState === 'function') saveState();
    if (typeof syncProfileWithSheets === 'function') syncProfileWithSheets();
    
    // Refresh shop and dashboard
    if (typeof renderShop === 'function') renderShop();
    if (typeof renderStudentDashboard === 'function') renderStudentDashboard();
    
    alert('Сәтті сатып алынды! Профиліңіз жаңартылды.');
  }
};

window.equipShopItem = function(type, itemId) {
  const p = window.state.studentProfile;
  let collection;
  if (type === 'avatar') collection = SHOP_CATALOG.avatars;
  else if (type === 'frame') collection = SHOP_CATALOG.frames;
  else collection = SHOP_CATALOG.titles;

  const item = collection.find(i => i.id === itemId);
  if (!item) return;

  if (type === 'avatar') {
    p.activeIcon = item.icon;
  } else if (type === 'frame') {
    p.activeFrame = item.style;
  } else {
    p.activeTitle = item.name;
  }

  if (typeof saveState === 'function') saveState();
  if (typeof syncProfileWithSheets === 'function') syncProfileWithSheets();
  if (typeof renderShop === 'function') renderShop();
  if (typeof renderStudentDashboard === 'function') renderStudentDashboard();
};
