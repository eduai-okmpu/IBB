/**
 * PhysicsAccess - Book Fetching and Rendering
 */

window.showResourceLibrary = async function(containerId = 'student-content', backFnName = 'renderStudentDashboard') {
  const content = document.getElementById(containerId) || document.getElementById('student-view');
  if (!content) return;

  // Show loading state
  content.innerHTML = `
    <div class="animate-fade-in" style="padding: 1rem; text-align: center; min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <i data-lucide="loader" class="animate-spin" size="48" style="color: var(--accent-orange); margin-bottom: 1rem;"></i>
      <h3 style="font-size: 1.5rem;">Кітаптар жүктелуде...</h3>
      <p style="color: var(--text-secondary); margin-top: 0.5rem;">Google Sheets серверімен байланысуда</p>
    </div>
  `;
  if (window.lucide) lucide.createIcons();

  let books = [];
  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    books = await response.json();
  } catch (error) {
    console.error('Кітаптарды жүктеу кезінде қателік кетті:', error);
    content.innerHTML = `
      <div class="animate-fade-in" style="padding: 1rem; text-align: center; display: flex; flex-direction: column; align-items: center;">
        <button class="btn-secondary voice-target v-center" onclick="${backFnName}()" style="margin-bottom: 2rem; gap: 0.8rem; padding: 0.8rem 1.5rem; border-radius: 50px; font-weight: 700; align-self: flex-start;">
          <i data-lucide="arrow-left" size="20"></i> Басты бетке қайту
        </button>
        <div style="background: rgba(229, 62, 62, 0.1); border: 1px solid rgba(229, 62, 62, 0.3); color: #e53e3e; padding: 2.5rem; border-radius: 20px; max-width: 500px; text-align: center;">
          <i data-lucide="alert-triangle" size="48" style="margin-bottom: 1rem; color: #e53e3e;"></i>
          <h3 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; color: #e53e3e;">Деректерді жүктеу қатесі</h3>
          <p style="color: #c53030;">Кітап тізімін алу мүмкін болмады. API сілтемесі дұрыс емес немесе интернет байланысы жоқ.</p>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  content.innerHTML = `
    <div class="animate-fade-in" style="padding: 1rem;">
      <button class="btn-secondary voice-target v-center" onclick="navigate(state.user)" style="margin-bottom: 3rem; gap: 0.8rem; padding: 0.8rem 1.5rem; border-radius: 50px; font-weight: 700;">
        <i data-lucide="arrow-left" size="20"></i> Басты бетке қайту
      </button>

      <div class="flex flex-col items-center text-center" style="margin-bottom: 4rem;">
        <div style="background: rgba(var(--accent-orange-rgb), 0.1); color: var(--accent-orange); width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
          <i data-lucide="book-marked" size="40"></i>
        </div>
        <h2 style="font-size: 3rem; font-weight: 900; color: var(--text-primary); margin-bottom: 1rem;">Электрондық оқулықтар</h2>
        <p style="color: var(--text-secondary); font-size: 1.2rem; max-width: 600px; line-height: 1.6;">Сізге қажетті оқулықты таңдап, оны онлайн оқыңыз немесе жүктеп алыңыз.</p>
      </div>

      <div class="book-gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 2rem;">
        ${books.map(book => `
          <div class="book-item-card voice-target animate-scale-in" onclick="window.open('${book.url || '#'}', '_blank')" style="cursor: pointer;">
            <div class="book-cover-wrapper" style="position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-bottom: 1rem; aspect-ratio: 2/3;">
              ${book.year ? `<div class="badge-year" style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; z-index: 2;">${book.year}</div>` : ''}
              <img src="${book.cover || 'media/textbooks/basharuly_7.png'}" class="book-cover-img" alt="${book.title || 'Кітап'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px; transition: transform 0.3s ease;">
              ${book.lang ? `<div class="badge-lang" style="position: absolute; bottom: 10px; right: 10px; background: rgba(242,109,33,0.9); color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; z-index: 2;">${book.lang}</div>` : ''}
            </div>
            <h3 class="book-item-title" style="font-size: 1.1rem; font-weight: 800; text-align: center; color: var(--text-primary); transition: color 0.2s;">${book.title || 'Атаусыз кітап'}</h3>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
};
