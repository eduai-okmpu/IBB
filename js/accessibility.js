/**
 * PhysicsAccess - Accessibility Logic
 */

const a11yState = {
  isTtsEnabled: localStorage.getItem('tts') === 'true',
  contrast: localStorage.getItem('contrast') || 'default',
  size: localStorage.getItem('size') || 'medium',
  isMenuCollapsed: localStorage.getItem('a11y-menu-collapsed') === 'true' || window.innerWidth <= 768,
  synth: window.speechSynthesis,
  kazakhVoice: null
};

// Initialize voices
function initVoices() {
  const voices = a11yState.synth.getVoices();
  a11yState.kazakhVoice = voices.find(voice => voice.lang.startsWith('kk') || voice.lang.includes('Kazakh')) || voices[0];
  console.log('Voice selected:', a11yState.kazakhVoice ? a11yState.kazakhVoice.name : 'None');
}

if (a11yState.synth.onvoiceschanged !== undefined) {
  a11yState.synth.onvoiceschanged = initVoices;
}
initVoices();

function speak(text) {
  if (!a11yState.isTtsEnabled) return;
  
  // Cancel current speaking
  a11yState.synth.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = a11yState.kazakhVoice;
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;
  
  console.log('Speaking:', text); // Added for debugging
  a11yState.synth.speak(utterance);
}

// Toggle TTS
document.getElementById('toggle-tts').addEventListener('click', () => {
  a11yState.isTtsEnabled = !a11yState.isTtsEnabled;
  localStorage.setItem('tts', a11yState.isTtsEnabled);
  
  const btn = document.getElementById('toggle-tts');
  const icon = btn.querySelector('i');
  
  if (a11yState.isTtsEnabled) {
    btn.classList.add('active');
    icon.setAttribute('data-lucide', 'volume-2');
    btn.setAttribute('aria-label', 'Дыбыстық сүйемелдеуді өшіру');
    speak("Мәтінді дыбыстау қосылды");
  } else {
    btn.classList.remove('active');
    icon.setAttribute('data-lucide', 'volume-x');
    btn.setAttribute('aria-label', 'Дыбыстық сүйемелдеуді қосу');
  }
  lucide.createIcons();
});

// Toggle Contrast
document.getElementById('toggle-contrast').addEventListener('click', () => {
  a11yState.contrast = a11yState.contrast === 'default' ? 'high-contrast' : 'default';
  document.body.setAttribute('data-theme', a11yState.contrast);
  localStorage.setItem('contrast', a11yState.contrast);
  
  const btn = document.getElementById('toggle-contrast');
  if (a11yState.contrast === 'high-contrast') {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
  
  speak(a11yState.contrast === 'high-contrast' ? "Жоғары контраст режимі қосылды" : "Қалыпты режим");
});

// Increase Font Size
document.getElementById('increase-font').addEventListener('click', () => {
  const sizes = ['medium', 'large', 'extra-large'];
  let currIdx = sizes.indexOf(a11yState.size);
  a11yState.size = sizes[(currIdx + 1) % sizes.length];
  document.documentElement.setAttribute('data-size', a11yState.size);
  localStorage.setItem('size', a11yState.size);
  
  updateFontSizeUI();
  if (a11yState.isTtsEnabled) {
    speak(`Мәтін өлшемі өзгертілді: ${a11yState.size === 'extra-large' ? 'Өте үлкен' : a11yState.size === 'large' ? 'Үлкен' : 'Қалыпты'}`);
  }
});

function updateFontSizeUI() {
  const btn = document.getElementById('increase-font');
  const levelIndicator = btn.querySelector('.size-level') || document.createElement('span');
  
  if (!btn.querySelector('.size-level')) {
    levelIndicator.className = 'size-level';
    btn.appendChild(levelIndicator);
  }

  if (a11yState.size === 'medium') {
    btn.classList.remove('active');
    levelIndicator.innerText = 'A';
  } else if (a11yState.size === 'large') {
    btn.classList.add('active');
    levelIndicator.innerText = 'A+';
  } else if (a11yState.size === 'extra-large') {
    btn.classList.add('active');
    levelIndicator.innerText = 'A++';
  }
}

// Toggle Accessibility Menu
document.getElementById('toggle-a11y-menu').addEventListener('click', () => {
  const bar = document.getElementById('a11y-bar');
  a11yState.isMenuCollapsed = !a11yState.isMenuCollapsed;
  localStorage.setItem('a11y-menu-collapsed', a11yState.isMenuCollapsed);
  
  if (a11yState.isMenuCollapsed) {
    bar.classList.add('collapsed');
  } else {
    bar.classList.remove('collapsed');
  }
});

// Hover event listeners for TTS
document.addEventListener('mouseover', (e) => {
  if (!a11yState.isTtsEnabled) return;
  
  const target = e.target.closest('.voice-target, button, a, h1, h2, h3, p');
  if (target) {
    // Avoid double speaking for nested elements
    e.stopPropagation();
    
    // Get text content or aria-label
    let textToSpeak = target.getAttribute('aria-label') || target.innerText || target.textContent;
    
    if (textToSpeak && textToSpeak.length < 200) { // Limit long texts
      // Debounce speaking to avoid stuttering on quick movement
      clearTimeout(window.ttsTimeout);
      window.ttsTimeout = setTimeout(() => {
        speak(textToSpeak);
      }, 500);
    }
  }
});

// Restore settings on load
window.addEventListener('DOMContentLoaded', () => {
  document.body.setAttribute('data-theme', a11yState.contrast);
  document.documentElement.setAttribute('data-size', a11yState.size);
  
  // TTS Restore
  const ttsBtn = document.getElementById('toggle-tts');
  const ttsIcon = ttsBtn.querySelector('i');
  if (a11yState.isTtsEnabled) {
    ttsBtn.classList.add('active');
    ttsIcon.setAttribute('data-lucide', 'volume-2');
    ttsBtn.setAttribute('aria-label', 'Дыбыстық сүйемелдеуді өшіру');
  } else {
    ttsBtn.classList.remove('active');
    ttsIcon.setAttribute('data-lucide', 'volume-x');
    ttsBtn.setAttribute('aria-label', 'Дыбыстық сүйемелдеуді қосу');
  }

  // Contrast Restore
  const contrastBtn = document.getElementById('toggle-contrast');
  if (a11yState.contrast === 'high-contrast') {
    contrastBtn.classList.add('active');
  }

  // Font Size Restore
  updateFontSizeUI();

  // Menu State Restore
  const bar = document.getElementById('a11y-bar');
  if (a11yState.isMenuCollapsed) {
    bar.classList.add('collapsed');
  }
  
  lucide.createIcons();
});
