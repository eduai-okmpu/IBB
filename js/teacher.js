/**
 * PhysicsAccess - Teacher Logic (Premium UI & 120 Questions)
 */

function showAIAssistant() {
  const content = document.getElementById('teacher-content');
  content.innerHTML = `
    <button class="btn-secondary voice-target" onclick="renderTeacherDashboard()" style="margin-bottom: 2rem; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
      <i data-lucide="arrow-left" size="18"></i> Басты бетке қайту
    </button>
    <div class="glass-card animate-fade-in" style="padding: 3rem;">
        <h2 class="voice-target heading-page" style="margin-bottom: 2rem;">AI Көмекші — Сабақ жоспары</h2>
        <div class="flex flex-col gap-6">
          <p class="voice-target" style="font-size: 1.1rem; color: var(--text-secondary);">Кез келмелген физика тақырыбын енгізіңіз (мысалы: "Кинематика", "Ньютон заңдары"):</p>
          <div style="display: flex; gap: 1rem;">
            <input type="text" id="ai-input" placeholder="Тақырып атауын жазыңыз..." class="glass-panel" style="flex: 1; padding: 1.2rem; border-radius: 12px; border: 1px solid var(--border-glass); background: var(--bg-glass-bright); font-size: 1.1rem;">
            <button class="btn-primary" style="padding: 0 2.5rem; font-size: 1.1rem;" onclick="generateAIContent()">Жасау</button>
          </div>
          <div id="ai-output" style="margin-top: 1rem;"></div>
        </div>
    </div>
  `;
  lucide.createIcons();
}

function generateAIContent() {
  const topic = document.getElementById('ai-input').value;
  if (!topic) return;
  const output = document.getElementById('ai-output');
  output.innerHTML = `<div class="flex items-center gap-3 py-4"><div class="animate-spin" style="width: 24px; height: 24px; border: 3px solid var(--accent-orange); border-top-color: transparent; border-radius: 50%;"></div><p class="voice-target">AI мазмұн жасалуда... Күте тұрыңыз.</p></div>`;
  
  setTimeout(() => {
    output.innerHTML = `
      <div class="animate-fade-in flex flex-col gap-8 mt-4">
        <article class="glass-card" style="border-left: 4px solid var(--accent-orange);">
          <div class="flex justify-between items-center" style="margin-bottom: 1.5rem;">
            <h3 class="gradient-text" style="font-size: 1.4rem;">Қысқа мерзімді жоспар (ҚМЖ)</h3>
            <button class="btn-secondary" style="padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem;"><i data-lucide="download" size="16"></i> PDF</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
             <p><strong>Тақырып:</strong> ${topic}</p>
             <p><strong>Оқу мақсаттары:</strong><br>• ${topic} заңдылықтарын түсіндіру.<br>• Формулаларды есептерде қолдану.</p>
          </div>
        </article>
      </div>
    `;
    lucide.createIcons();
    speak("AI мазмұн сәтті жасалды.");
  }, 1500);
}

function showClassManager() {
  const content = document.getElementById('teacher-content');
  
  // Parse teacher's classes for filtering
  const teacherClassesRaw = state.teacherProfile.classes || '';
  const teacherClasses = teacherClassesRaw.split(',').map(c => c.trim().replace(/"/g, ''));
  
  // Available classes for filtering (from teacher's profile)
  const availableClasses = teacherClassesRaw.split(',').map(c => c.trim());
  
  content.innerHTML = `
    <button class="btn-secondary voice-target" onclick="renderTeacherDashboard()" style="margin-bottom: 2rem; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
      <i data-lucide="arrow-left" size="18"></i> Басты бетке қайту
    </button>
    
    <div class="glass-card animate-fade-in" style="padding: 2.5rem;">
      <div class="flex justify-between items-center" style="margin-bottom: 2.5rem;">
        <div>
          <h2 class="voice-target gradient-text" style="font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem;">Сынып менеджері</h2>
          <p style="color: var(--text-secondary);">Оқушыларыңыздың үлгерімін бақылаңыз</p>
        </div>
        <div class="flex items-center gap-3">
          <label class="label-caps" style="margin-bottom: 0;">Сынып:</label>
          <select id="teacher-class-filter" class="glass-panel" style="padding: 0.6rem 1.5rem; border-radius: 12px; outline: none; border: 1px solid var(--border-glass); cursor: pointer;" onchange="filterClassManager()">
            <option value="all">Барлық сыныптар</option>
            ${availableClasses.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
            <thead>
              <tr class="label-caps" style="text-align: left; opacity: 0.6;">
                <th style="padding: 0 1rem 1rem 1rem;">Оқушы</th>
                <th style="padding: 0 1rem 1rem 1rem;">Сынып</th>
                <th style="padding: 0 1rem 1rem 1rem;">Тақырып</th>
                <th style="padding: 0 1rem 1rem 1rem;">Нәтиже</th>
                <th style="padding: 0 1rem 1rem 1rem;">Күні</th>
              </tr>
            </thead>
            <tbody id="class-manager-tbody">
              <!-- Content generated by filterClassManager() -->
            </tbody>
          </table>
      </div>
    </div>
  `;
  
  filterClassManager();
  lucide.createIcons();
}

function filterClassManager() {
  const filterVal = document.getElementById('teacher-class-filter').value;
  const tbody = document.getElementById('class-manager-tbody');
  
  // Results filtered by teacher's classes
  const teacherClassesRaw = state.teacherProfile.classes || '';
  const teacherClasses = teacherClassesRaw.split(',').map(c => c.trim());
  
  let filteredResults = state.quizResults.filter(res => {
    const resGrade = res.grade.trim();
    // Must be in teacher's classes
    if (!teacherClasses.some(tc => tc.trim() === resGrade)) return false;
    // Follow the specific filter
    if (filterVal !== 'all' && resGrade !== filterVal) return false;
    return true;
  });

  if (filteredResults.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-tertiary);">
          <i data-lucide="info" size="48" style="margin-bottom: 1rem; opacity: 0.2;"></i>
          <p>Мәліметтер табылмады</p>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = filteredResults.map(res => {
    const percentage = Math.round((res.score / res.maxScore) * 100);
    let scoreColor = '#4CAF50';
    if (percentage < 50) scoreColor = '#F44336';
    else if (percentage < 85) scoreColor = '#FFC107';

    return `
      <tr style="background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); border-radius: 16px; margin-bottom: 10px; transition: transform 0.2s ease;" class="voice-target">
        <td style="padding: 1.2rem; border-radius: 16px 0 0 16px; font-weight: 700; color: var(--text-primary);">${res.studentName}</td>
        <td style="padding: 1.2rem; color: var(--text-secondary);">${res.grade}</td>
        <td style="padding: 1.2rem; font-size: 0.9rem; color: var(--text-secondary);">${res.topic}</td>
        <td style="padding: 1.2rem;">
          <div class="flex items-center gap-3">
             <div style="flex: 1; height: 8px; background: rgba(0,0,0,0.05); border-radius: 10px; overflow: hidden; width: 100px;">
                <div style="width: ${percentage}%; height: 100%; background: ${scoreColor}; border-radius: 10px;"></div>
             </div>
             <span style="font-weight: 800; color: ${scoreColor}; min-width: 45px;">${res.score}/${res.maxScore}</span>
          </div>
        </td>
        <td style="padding: 1.2rem; border-radius: 0 16px 16px 0; color: var(--text-tertiary); font-size: 0.8rem;">${res.date}</td>
      </tr>
    `;
  }).join('');
  
  lucide.createIcons();
}


const physicsDb = {
  questions: {
    "Механика": [
        { q: "Күштің өлшем бірлігі қандай?", options: ["Ньютон (Н)", "Паскаль (Па)", "Джоуль (Дж)", "Ватт (Вт)"], answer: 0 },
        { q: "Энергияның физикалық мағынасы қандай?", options: ["Дененің жұмыс істеу қабілеті", "Қозғалыс жылдамдығы", "Дененің массасы", "Кедергі күші"], answer: 0 },
        { q: "Архимед заңы қандай параметрлерге байланысты?", options: ["Сұйықтың тығыздығы мен батқан бөліктің көлеміне", "Сұйықтың массасына", "Дененің пішініне", "Ауа қысымына"], answer: 0 },
        { q: "Үдеудің өлшем бірлігі?", options: ["м/с²", "м/с", "м", "кг"], answer: 0 },
        { q: "Ньютонның екінші заңы?", options: ["F = ma", "F = m/a", "a = F*m", "P = mv"], answer: 0 },
        { q: "Жұмыс формуласы?", options: ["A = Fs", "A = P/t", "A = mgh", "A = v/t"], answer: 0 },
        { q: "Кинетикалық энергия формуласы?", options: ["Ek = mv²/2", "Ep = mgh", "Ek = ma", "Ek = mv"], answer: 0 },
        { q: "Қысым формуласы?", options: ["P = F/S", "P = S/F", "P = m/V", "P = v*t"], answer: 0 },
        { q: "Еркін түсу үдеуі шамамен қаншаға тең (g)?", options: ["9.8 м/с²", "10 м/с²", "8.9 м/с²", "11 м/с²"], answer: 0 },
        { q: "Импульс формуласы?", options: ["p = mv", "p = m/v", "p = Ft", "p = ma"], answer: 0 },
        { q: "Траектория дегеніміз не?", options: ["Нүктенің қозғалыс кезінде қалдырған ізі", "Қозғалыс жылдамдығы", "Орын ауыстыру", "Физикалық үдеріс"], answer: 0 },
        { q: "Күш моменті формуласы?", options: ["M = Fd", "M = Fs", "M = ma", "M = mgh"], answer: 0 },
        { q: "Гук заңының формуласы?", options: ["F = -kx", "F = ma", "F = mg", "F = Gmm/r²"], answer: 0 },
        { q: "Қуаттың өлшем бірлігі қандай?", options: ["Ватт (Вт)", "Джоуль (Дж)", "Ньютон (Н)", "Паскаль (Па)"], answer: 0 },
        { q: "Инерция дегеніміз не?", options: ["Дененің қозғалыс күйін сақтау қасиеті", "Қозғалыс жылдамдығы", "Үйкеліс күші", "Дененің тоқтауы"], answer: 0 },
        { q: "Серпімділік күші қай кезде пайда болады?", options: ["Дене деформацияланғанда", "Дене қозғалғанда", "Дене тыныштықта болғанда", "Дене қызғанда"], answer: 0 },
        { q: "Салмақ дегеніміз не?", options: ["Дененің тірекке немесе аспаға әсер ету күші", "Дененің массасы", "Жердің тарту күші", "Дененің көлемі"], answer: 0 },
        { q: "Потенциалдық энергия формуласы?", options: ["Ep = mgh", "Ek = mv²/2", "E = mc²", "A = Fs"], answer: 0 },
        { q: "Орташа жылдамдықтың формуласы?", options: ["v = S_барлық / t_барлық", "v = S * t", "v = t / S", "v = a * t"], answer: 0 },
        { q: "Бірқалыпты емес қозғалыс кезіндегі үдеу?", options: ["жылдамдықтың өзгеру жылдамдығы", "тұрақты жылдамдық", "жолдың ұзындығы", "күштің шамасы"], answer: 0 },
        { q: "Атмосфералық қысымды өлшейтін құрал?", options: ["Барометр", "Термометр", "Манометр", "Динамометр"], answer: 0 },
        { q: "Манометр не үшін қолданылады?", options: ["Сұйық немесе газдың қысымын өлшеу үшін", "Температураны өлшеу үшін", "Күшті өлшеу үшін", "Массаны өлшеу үшін"], answer: 0 },
        { q: "Көлбеу жазықтық не береді?", options: ["Күштен ұтыс", "Жолдан ұтыс", "Жұмыстан ұтыс", "Ешқандай ұтыс бермейді"], answer: 0 },
        { q: "Қатты денелердегі үйкеліс түрлері?", options: ["Сырғанау, домалау, тыныштық", "Сулы, құрғақ", "Жылдам, баяу", "Күшті, әлсіз"], answer: 0 },
        { q: "Дененің тығыздығы формуласы?", options: ["ρ = m/V", "ρ = V/m", "ρ = m*V", "ρ = m+V"], answer: 0 },
        { q: "Механикалық тербеліс жиілігінің өлшем бірлігі?", options: ["Герц (Гц)", "Секунд (с)", "Метр (м)", "Ньютон (Н)"], answer: 0 },
        { q: "Математикалық маятниктің тербеліс периоды?", options: ["Жіптің ұзындығына байланысты", "Массаға байланысты", "Амплитудаға байланысты", "Пішінге байланысты"], answer: 0 },
        { q: "Бүкіләлемдік тартылыс заңы кімдікі?", options: ["Исаак Ньютон", "Галилео Галилей", "Рене Декарт", "Альберт Эйнштейн"], answer: 0 },
        { q: "Пайдалы әсер коэффициенті (ПӘК) әрқашан?", options: ["100%-дан кіші", "100%-дан үлкен", "100%-ға тең", "200%-ға тең"], answer: 0 },
        { q: "Дыбыстың ауадағы жылдамдығы шамамен?", options: ["340 м/с", "300 000 км/с", "1500 м/с", "100 м/с"], answer: 0 }
    ],
    "Термодинамика": [
        { q: "Температураның абсолют нөлі?", options: ["-273.15 °C", "0 °C", "-100 °C", "-373.15 °C"], answer: 0 },
        { q: "Термодинамиканың бірінші заңы?", options: ["Q = ΔU + A", "Q = ΔU - A", "U = Q + A", "ΔU = Q / A"], answer: 0 },
        { q: "Заттың үш күйі?", options: ["Қатты, сұйық, газ", "Су, мұз, бу", "От, су, жер", "Металл, бейметалл"], answer: 0 },
        { q: "Қайнау температурасы (қалыпты жағдайда)?", options: ["100 °C", "0 °C", "50 °C", "373 K"], answer: 0 },
        { q: "Газ заңдары (Изобаралық)?", options: ["V/T = const", "P/T = const", "PV = const", "P/V = const"], answer: 0 },
        { q: "Менделеев-Клапейрон теңдеуі?", options: ["PV = nRT", "PV = T", "P/T = R", "V = nRT"], answer: 0 },
        { q: "Ішкі энергия дегеніміз не?", options: ["Молекулалардың жылулық қозғалысы мен өзара әрекеттесу энергиясы", "Кинетикалық энергия", "Потенциалдық энергия", "Орташа жылдамдық"], answer: 0 },
        { q: "Жылулық сыйымдылық бірлігі?", options: ["Дж/(кг·К)", "Дж", "Вт", "Кельвин"], answer: 0 },
        { q: "Идеал газдың ішкі энергиясы тек неге байланысты?", options: ["Температураға", "Көлемге", "Қысымға", "Пішінге"], answer: 0 },
        { q: "Булану кезінде температура қалай өзгереді?", options: ["Тұрақты болып қалады", "Өседі", "Кемиді", "0-ге дейін түседі"], answer: 0 },
        { q: "Жылу қозғалтқыштарының ПӘК-і әрқашан?", options: ["1-ден кіші", "1-ден үлкен", "1-ге тең", "0-ге тең"], answer: 0 },
        { q: "Конвекция қай жерде жүруі мүмкін?", options: ["Сұйықтар мен газдарда", "Қатты денелерде", "Вакуумде", "Тек металдарда"], answer: 0 },
        { q: "Сәуле шығару арқылы жылу берілу?", options: ["Вакуумде де жүреді", "Тек ауада жүреді", "Тек жанасу арқылы", "Тек су арқылы"], answer: 0 },
        { q: "Отынның жану жылуы формуласы?", options: ["Q = qm", "Q = cmΔt", "Q = Lm", "Q = λm"], answer: 0 },
        { q: "Меншікті балқу жылуының белгіленуі?", options: ["λ (лямбда)", "c", "q", "L"], answer: 0 },
        { q: "Парциал қысым дегеніміз не?", options: ["Қоспа құрамындағы жеке газдың қысымы", "Жалпы қысым", "Атмосфералық қысым", "Сұйық қысымы"], answer: 0 },
        { q: "Салыстырмалы ылғалдылықты өлшейтін құрал?", options: ["Психрометр", "Термометр", "Барометр", "Манометр"], answer: 0 },
        { q: "Суның үштік нүктесі?", options: ["Мұз, су және бу тепе-теңдікте болатын күй", "Қайнау нүктесі", "Балқу нүктесі", "Булану нүктесі"], answer: 0 },
        { q: "Изотермиялық процесс?", options: ["T = const", "V = const", "P = const", "Q = 0"], answer: 0 },
        { q: "Изохоралық процесс?", options: ["V = const", "T = const", "P = const", "U = const"], answer: 0 },
        { q: "Адиабаталық процесс?", options: ["Q = 0", "T = const", "V = const", "P = const"], answer: 0 },
        { q: "Кельвин шкаласы бойынша 0 градус Цельсий?", options: ["273.15 K", "0 K", "-273.15 K", "100 K"], answer: 0 },
        { q: "Меншікті булану жылуының бірлігі?", options: ["Дж/кг", "Дж", "Дж/(кг·К)", "Вт"], answer: 0 },
        { q: "Диффузия дегеніміз?", options: ["Заттардың бір-біріне өздігінен араласуы", "Қайнау", "Сыну", "Шағылысу"], answer: 0 },
        { q: "Броундық қозғалыс немен дәлелденеді?", options: ["Молекулалардың үздіксіз хаосты қозғалысымен", "Дененің қызуымен", "Дененің массасымен", "Күшпен"], answer: 0 },
        { q: "Жылулық тепе-теңдік?", options: ["Жанасқан денелердің температураларының теңесуі", "Массалардың теңесуі", "Көлемдердің теңесуі", "Қысымдардың теңесуі"], answer: 0 },
        { q: "Судың 4 °C-тағы қасиеті?", options: ["Ең жоғары тығыздыққа ие", "Қайнайды", "Балқиды", "Ең төмен тығыздық"], answer: 0 },
        { q: "Психрометрдің екі термометрі?", options: ["Құрғақ және ылғалды", "Сұйық және газды", "Металл және шыны", "Сынапты және спиртті"], answer: 0 },
        { q: "Идеал газ моделі?", options: ["Молекулалар өлшемі ескерілмейтін газ", "Су буы", "Ауа", "Нақты газ"], answer: 0 },
        { q: "Қаныққан бу?", options: ["Өз сұйығымен динамикалық тепе-теңдіктегі бу", "Сулы бу", "Ыстық бу", "Мөлдір бу"], answer: 0 }
    ],
    "Электр және магнетизм": [
        { q: "Кернеудің өлшем бірлігі?", options: ["Вольт (В)", "Ампер (А)", "Ом", "Ватт (Вт)"], answer: 0 },
        { q: "Ток күшіның формуласы?", options: ["I = U/R", "U = I/R", "R = U*I", "I = q*t"], answer: 0 },
        { q: "Қарсыласудың өлшем бірлігі?", options: ["Ом", "Фарадей", "Генри", "Тесла"], answer: 0 },
        { q: "Кулон заңы?", options: ["F = k*q1*q2/r²", "F = ma", "F = mg", "F = BIl"], answer: 0 },
        { q: "Электр сыйымдылығы бірлігі?", options: ["Фарадей (Ф)", "Кулон (Кл)", "Вольт (В)", "Генри (Гн)"], answer: 0 },
        { q: "Тізбектей жалғау формуласы (R)?", options: ["R = R1 + R2", "1/R = 1/R1 + 1/R2", "R = R1*R2", "R = R1/R2"], answer: 0 },
        { q: "Магнит индукциясының өлшем бірлігі?", options: ["Тесла (Тл)", "Вебер (Вб)", "Генри (Гн)", "Ом (Ω)"], answer: 0 },
        { q: "Джоуль-Ленц заңы?", options: ["Q = I²Rt", "Q = UIt", "Q = IRt", "Q = P t"], answer: 0 },
        { q: "Электр тізбегінің қуат формуласы?", options: ["P = UI", "P = U/I", "P = I²R", "P = F v"], answer: 0 },
        { q: "Лоренц күші дегеніміз?", options: ["Магнит өрісіндегі қозғалыстағы зарядқа әсер ететін күш", "Тогы бар өткізгішке әсер ететін күш", "Серпімділік күші", "Үйкеліс күші"], answer: 0 },
        { q: "Ампер күші формуласы?", options: ["F = BIl sin(α)", "F = qvB sin(α)", "F = ma", "F = k q/r²"], answer: 0 },
        { q: "Тұрақты магниттің неше полюсі бар?", options: ["Екі (Солтүстік және Оңтүстік)", "Бір", "Төрт", "Полюсі болмайды"], answer: 0 },
        { q: "Электр тогының химиялық әсері байқалады?", options: ["Электролиттерде", "Металдарда", "Газдарда", "Вакуумде"], answer: 0 },
        { q: "Диэлектриктер дегеніміз?", options: ["Электр тогын өткізбейтін заттар", "Жақсы өткізгіштер", "Тек магниттер", "Сұйықтар"], answer: 0 },
        { q: "Өткізгіштердің параллель жалғануында не тұрақты?", options: ["Кернеу (U)", "Ток күші (I)", "Қарсыласу (R)", "Қуат (P)"], answer: 0 },
        { q: "Электромагниттің күшін қалай арттыруға болады?", options: ["Орам санын көбейту арқылы", "Орам санын азайту арқылы", "Ток күшін азайту арқылы", "Магнитті алып тастау арқылы"], answer: 0 },
        { q: "Амперметр тізбекке қалай жалғанады?", options: ["Тізбектей", "Параллель", "Аралас", "Жалғанбайды"], answer: 0 },
        { q: "Вольтметр тізбекке қалай жалғанады?", options: ["Параллель", "Тізбектей", "Кездейсоқ", "Тікелей"], answer: 0 },
        { q: "Қысқа тұйықталу кезінде ток күші?", options: ["Шексіз артады", "Кемиді", "Өзгермейді", "Нөлге тең болады"], answer: 0 },
        { q: "Трансформатордың қызметі қандай?", options: ["Кернеуді өзгерту", "Токты тудыру", "Энергияны сақтау", "Кедергіні жою"], answer: 0 },
        { q: "Электр өрісінің кернеулігі бірлігі?", options: ["В/м", "Н", "Кл", "Ом"], answer: 0 },
        { q: "Магнит ағынының өлшем бірлігі?", options: ["Вебер (Вб)", "Тесла", "Генри", "Фарадей"], answer: 0 },
        { q: "Өздік индукция құбылысы?", options: ["Тізбектегі ток өзгергенде қосымша токтың пайда болуы", "Магниттің қозғалысы", "Жарықтың сынуы", "Химиялық реакция"], answer: 0 },
        { q: "Индуктивтілік бірлігі?", options: ["Генри (Гн)", "Вебер", "Тесла", "Вольт"], answer: 0 },
        { q: "Конденсатор не үшін қолданылады?", options: ["Электр зарядын жинақтау үшін", "Токты арттыру үшін", "Кедергіні азайту үшін", "Жарық шығару үшін"], answer: 0 },
        { q: "Ом заңы (тізбек бөлігі үшін)?", options: ["I = U/R", "U = IR", "R = U/I", "P = UI"], answer: 0 },
        { q: "Жартылай өткізгіштердегі негізгі заряд тасушылар?", options: ["Электрондар мен кемтіктер", "Тек протондар", "Иондар", "Нейтрондар"], answer: 0 },
        { q: "Электромагниттік индукция заңын ашқан?", options: ["Майкл Фарадей", "Джеймс Максвелл", "Алессандро Вольта", "Андре Ампер"], answer: 0 },
        { q: "Ток күшін өлшейтін құрал?", options: ["Амперметр", "Вольтметр", "Омметр", "Ваттметр"], answer: 0 }
    ],
    "Оптика": [
        { q: "Жарық жылдамдығы вакуумде қаншаға тең?", options: ["300 000 км/с", "150 000 км/с", "300 м/с", "1000 км/с"], answer: 0 },
        { q: "Шағылысу заңы?", options: ["Түсу бұрышы шағылысу бұрышына тең", "Сыну бұрышы үлкен", "Түсу бұрышы 90 градус", "Сәулелер тоғысады"], answer: 0 },
        { q: "Жарықтың сыну көрсеткіші?", options: ["n = c/v", "n = v/c", "n = sin(r)/sin(i)", "n = d/f"], answer: 0 },
        { q: "Жұқа линза формуласы?", options: ["1/F = 1/d + 1/f", "F = d + f", "1/F = 1/d - 1/f", "D = 1/F"], answer: 0 },
        { q: "Линзаның оптикалық күші?", options: ["Диоптрия (дптр)", "Метр (м)", "Ватт (Вт)", "Люкс (лк)"], answer: 0 },
        { q: "Дифракция дегеніміз не?", options: ["Жарықтың бөгеттерді орап өтуі", "Жарықтың сынуы", "Жарықтың шағылысуы", "Жарықтың түсі"], answer: 0 },
        { q: "Жарық дисперсиясы дегеніміз?", options: ["Жарықтың спектрге жіктелуі", "Жарықтың шағылысуы", "Жарықтың жұтылуы", "Жарықтың түзу сызықты қозғалысы"], answer: 0 },
        { q: "Жақыннан көргіштік кезінде қандай линза қолданылады?", options: ["Шашыратқыш (ойыс)", "Жинағыш (дөңес)", "Цилиндрлік", "Призмалық"], answer: 0 },
        { q: "Күн сәулесінің жеті түске бөлінуін алғаш зерттеген кім?", options: ["Исаак Ньютон", "Альберт Эйнштейн", "Галилео Галилей", "Макс Планк"], answer: 0 },
        { q: "Жарықтың толық ішкі шағылысуы қайда қолданылады?", options: ["Талшықты оптикада", "Айнада", "Линзада", "Көзілдірікте"], answer: 0 },
        { q: "Кемпірқосақ қандай құбылысқа жатады?", options: ["Дисперсия", "Дифракция", "Интерференция", "Поляризация"], answer: 0 },
        { q: "Көздің торлы қабығында кескін қалай пайда болады?", options: ["Шын, кішірейтілген, төңкерілген", "Жалған, үлкейтілген", "Тура, шын", "Кескін пайда болмайды"], answer: 0 },
        { q: "Лупа ретінде қандай линза қолданылады?", options: ["Жинағыш линза", "Шашыратқыш линза", "Жай шыны", "Айна"], answer: 0 },
        { q: "Көлеңке қалай пайда болады?", options: ["Жарықтың түзу сызықты таралуынан", "Жарықтың сынуынан", "Жарықтың жұтылуынан", "Жарықтың шағылысуынан"], answer: 0 },
        { q: "Интерференция дегеніміз?", options: ["Толқындардың қабаттасуы нәтижесінде күшеюі немесе әлсіреуі", "Сыну", "Шағылысу", "Жұтылу"], answer: 0 },
        { q: "Жарық кванты қалай аталады?", options: ["Фотон", "Электрон", "Протон", "Нейтрон"], answer: 0 },
        { q: "Алыстан көргіштік кезінде қандай линза қолданылады?", options: ["Жинағыш", "Шашыратқыш", "Тегіс", "Призма"], answer: 0 },
        { q: "Жарықтың электромагниттік теориясын жасаған?", options: ["Джеймс Максвелл", "Исаак Ньютон", "Христиан Гюйгенс", "Томас Юнг"], answer: 0 },
        { q: "Көрінетін жарық спектріндегі ең ұзын толқын?", options: ["Қызыл", "Күлгін", "Жасыл", "Сары"], answer: 0 },
        { q: "Көрінетін жарық спектріндегі ең қысқа толқын?", options: ["Күлгін", "Қызыл", "Көк", "Сарғылт"], answer: 0 },
        { q: "Микроскоп не үшін қажет?", options: ["Өте кішкентай нысандарды үлкейтіп көру үшін", "Алысты көру үшін", "Жарықты өлшеу үшін", "Түр түсті ажырату үшін"], answer: 0 },
        { q: "Телескоптың қызметі?", options: ["Аспан денелерін бақылау", "Кішкентай заттарды көру", "Жарықтың жылдамдығын өлшеу", "Дыбысты есту"], answer: 0 },
        { q: "Көлеңке мен жартылай көлеңке немен түсіндіріледі?", options: ["Жарықтың түзу сызықты таралуымен", "Дифракциямен", "Дисперсиямен", "Сынумен"], answer: 0 },
        { q: "Поляризация құбылысы жарықтың қандай толқын екенін дәлелдейді?", options: ["Көлденең", "Бойлық", "Дыбыстық", "Механикалық"], answer: 0 },
        { q: "Ультракүлгін сәулелердің қасиеті?", options: ["Химиялық белсенділігі жоғары", "Көзге көрінеді", "Жылуды көп бөледі", "Дыбыс шығарады"], answer: 0 },
        { q: "Инфрақызыл сәулелердің екінші атауы?", options: ["Жылулық сәулелер", "Рентген сәулелері", "Көрінбейтін жарық", "Радиотолқындар"], answer: 0 },
        { q: "Жарық толқынының жиілігі артқанда толқын ұзындығы?", options: ["Кемиді", "Артады", "Өзгермейді", "Нөлге тең болады"], answer: 0 },
        { q: "Толқын ұзындығының өлшем бірлігі?", options: ["Метр (м)", "Герц", "Вакуум", "Секунд"], answer: 0 },
        { q: "Фотоэффект құбылысын түсіндіргені үшін Нобель сыйлығын алған?", options: ["Альберт Эйнштейн", "Нильс Бор", "Макс Планк", "Эрнест Резерфорд"], answer: 0 },
        { q: "Линзаның фокус аралығының өлшем бірлігі?", options: ["Метр (м)", "Диоптрия", "Ватт", "Джоуль"], answer: 0 }
    ]
  },
  matches: [
    { term: "Масса", def: "Дененің инерттілігінің өлшемі" },
    { term: "Жылдамдық", def: "Уақыт бірлігіндегі орын ауыстыру" },
    { term: "Қысым", def: "Бетке түсетін күштің ауданға қатынасы" },
    { term: "Кедергі", def: "Өткізгіштің тоққа жасайтын бөгеті" },
    { term: "Күш", def: "Денелердің өзара әрекеттесу өлшемі" },
    { term: "Температура", def: "Дененің жылулық күйінің сипаттамасы" }
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

function showMyClassGroup() {
  const content = document.getElementById('teacher-content');
  const teacherClassesRaw = state.teacherProfile.classes || '';
  const availableClasses = teacherClassesRaw.split(',').map(c => c.trim());

  content.innerHTML = `
    <button class="btn-secondary voice-target" onclick="renderTeacherDashboard()" style="margin-bottom: 2rem; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 50px;">
      <i data-lucide="arrow-left" size="18"></i> Басты бетке қайту
    </button>
    
    <div class="glass-card animate-fade-in" style="padding: 2.5rem;">
      <div class="flex justify-between items-center" style="margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1.5rem;">
        <div>
          <h2 class="voice-target gradient-text" style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem;">Менің сыныбым</h2>
          <p style="color: var(--text-secondary);">Оқушылардың жеке мәліметтері мен жалпы үлгерімі</p>
        </div>
        <div class="flex items-center gap-4 flex-wrap">
          <div class="v-center glass-panel" style="padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid var(--border-glass); background: #fff;">
            <i data-lucide="search" size="18" style="color: var(--text-tertiary); margin-right: 0.5rem;"></i>
            <input type="text" id="student-search-input" placeholder="Оқушыны іздеу..." style="border: none; outline: none; background: transparent; font-size: 0.95rem; width: 180px;" oninput="filterMyClassGroup()">
          </div>
          <select id="my-class-filter" class="glass-panel" style="padding: 0.6rem 1.5rem; border-radius: 12px; outline: none; border: 1px solid var(--border-glass); cursor: pointer;" onchange="filterMyClassGroup()">
            <option value="all">Барлық сыныптар</option>
            ${availableClasses.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid gap-4" id="students-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
         <!-- Content generated by filterMyClassGroup() -->
      </div>
    </div>
  `;
  
  filterMyClassGroup();
  lucide.createIcons();
}

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
