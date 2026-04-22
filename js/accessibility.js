/**
 * PhysicsAccess - Accessibility Logic
 */

const a11yState = {
  isTtsEnabled: false, // Permanently disabled
  contrast: localStorage.getItem('contrast') || 'default',
  size: localStorage.getItem('size') || 'medium',
  isMenuCollapsed: localStorage.getItem('a11y-menu-collapsed') !== 'false', // Default to true
  synth: window.speechSynthesis,
  kazakhVoice: null
};

// Voice initialization disabled as feature removed
function initVoices() {
  /* Disabled */
}

function speak(text) {
  /* Feature disabled permanently */
}

/* TTS functionality removed */

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

  // speak() calls removed
});

// Increase Font Size
document.getElementById('increase-font').addEventListener('click', () => {
  const sizes = ['medium', 'large', 'extra-large'];
  let currIdx = sizes.indexOf(a11yState.size);
  a11yState.size = sizes[(currIdx + 1) % sizes.length];
  document.documentElement.setAttribute('data-size', a11yState.size);
  localStorage.setItem('size', a11yState.size);

  updateFontSizeUI();
  // speak() calls removed
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
  const bar = document.getElementById('a11y-panel');
  a11yState.isMenuCollapsed = !a11yState.isMenuCollapsed;
  localStorage.setItem('a11y-menu-collapsed', a11yState.isMenuCollapsed);

  if (a11yState.isMenuCollapsed) {
    bar.classList.add('collapsed');
  } else {
    bar.classList.remove('collapsed');
  }
});

// Hover event listeners for TTS removed

// Restore settings on load
window.addEventListener('DOMContentLoaded', () => {
  document.body.setAttribute('data-theme', a11yState.contrast);
  document.documentElement.setAttribute('data-size', a11yState.size);

  // TTS Restore removed

  // Contrast Restore
  const contrastBtn = document.getElementById('toggle-contrast');
  if (contrastBtn) {
    if (a11yState.contrast === 'high-contrast') {
      contrastBtn.classList.add('active');
    }
  }

  // Font Size Restore
  updateFontSizeUI();

  // Menu State Restore
  const bar = document.getElementById('a11y-panel');
  if (bar && a11yState.isMenuCollapsed) {
    bar.classList.add('collapsed');
  }

  lucide.createIcons();
});
