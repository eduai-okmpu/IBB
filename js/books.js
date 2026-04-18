/**
 * PhysicsAccess - Book Fetching and Rendering
 */

const booksData = [
  {
    title: "Инклюзивті білім берудің теориясы мен практикасы",
    author: "Лиходедова Л.Н",
    details: "Қарағанды: ”Medet Group” ЖШС, 2021.- 194б.",
    year: "2021",
    url: "https://disk.yandex.ru/i/hCp9lofkb3kjXg",
    cover: "media/textbooks/image1.jpeg",
    category: "methodology"
  },
  {
    title: "Инклюзивті білім беру мазмұны және әдістемесі",
    author: "Оспанбаева М.П",
    details: "Алматы: Қазақ университеті, 2019.- 232б.",
    year: "2019",
    url: "https://disk.yandex.ru/i/KyxAO5H_4StchQ",
    cover: "media/textbooks/image2.jpeg",
    category: "methodology"
  },
  {
    title: "Физика",
    author: "Башарұлы Р.",
    details: "Алматы: Атамұра, 2017.- 208 б.",
    year: "2017",
    url: "https://disk.yandex.ru/i/TB2NFam9-n1ysQ",
    cover: "media/textbooks/image3.jpeg",
    category: "physics"
  },
  {
    title: "Физика",
    author: "Башарұлы Р., Ш.Шүйіншина, К.Сейфоллина",
    details: "Алматы: Атамұра, 2018.- 224 б.",
    year: "2018",
    url: "https://disk.yandex.ru/i/XVctrZRnrbtgEA",
    cover: "media/textbooks/image4.jpeg",
    category: "physics"
  },
  {
    title: "Физика",
    author: "Башарұлы Р., Ш.Шүйіншина, К.Сейфоллина",
    details: "Алматы: Атамұра, 2019.- 272 б.",
    year: "2019",
    url: "https://disk.yandex.ru/i/i-B_GfdkBv2hTg",
    cover: "media/textbooks/image5.jpeg",
    category: "physics"
  }
];

window.showResourceLibrary = function (containerId = 'student-content', backFnName = 'renderStudentDashboard') {
  const content = document.getElementById(containerId) || document.getElementById('student-view');
  if (!content) return;

  // Filter based on role: students only see physics books
  const isTeacher = state.user === 'teacher';
  const books = isTeacher ? booksData : booksData.filter(b => b.category === 'physics');

  content.innerHTML = `
    <div class="animate-fade-in" style="padding: 1rem;">
      <button class="btn-secondary voice-target v-center" onclick="${backFnName === 'renderStudentDashboard' ? "navigate('student')" : "navigate('teacher')"}" style="margin-bottom: 3rem; gap: 0.8rem; padding: 0.8rem 1.5rem; border-radius: 50px; font-weight: 700;">
        <i data-lucide="arrow-left" size="20"></i> Басты бетке қайту
      </button>

      <div class="flex flex-col items-center text-center" style="margin-bottom: 4rem;">
        <div style="background: rgba(var(--accent-orange-rgb), 0.1); color: var(--accent-orange); width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; border: 1px solid var(--border-glass);">
          <i data-lucide="book-marked" size="40"></i>
        </div>
        <h2 style="font-size: 3rem; font-weight: 900; color: var(--text-primary); margin-bottom: 1rem;">Электрондық оқулықтар</h2>
        <p style="color: var(--text-secondary); font-size: 1.2rem; max-width: 600px; line-height: 1.6;">
          ${isTeacher ? 'Мұғалімдер мен оқушыларға арналған барлық ресурстар жинағы.' : 'Физика пәні бойынша қажетті оқулықты таңдап, оны оқыңыз немесе жүктеп алыңыз.'}
        </p>
      </div>

      <div class="book-gallery">
        ${books.map(book => `
          <div class="book-card voice-target animate-scale-in" onclick="window.open('${book.url}', '_blank')">
            <div class="book-card-inner">
              <div class="book-cover-container">
                <div class="book-badge">${book.category === 'physics' ? 'ФИЗИКА' : 'ӘДІСТЕМЕ'}</div>
                <img src="${book.cover}" class="book-cover-img" alt="${book.title}" onerror="this.src='media/textbooks/basharuly_7.png'">
              </div>
              <div class="book-info">
                <h3 class="book-title" title="${book.title}">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <div class="book-footer">
                  <span class="book-year">${book.year} жыл</span>
                  <div class="btn-read">
                    Оқу <i data-lucide="external-link" size="14"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  if (window.lucide) lucide.createIcons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
