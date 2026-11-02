// Minimal interactions — no dependencies, no animation library.
const nav = document.getElementById('primary-nav');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main > section')];
const progress = document.querySelector('.reading-progress');
const toast = document.getElementById('copy-toast');
const discord = document.querySelector('[data-copy]');
let toastTimeout;

function closeMenu() {
  nav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}

menuButton.addEventListener('click', () => {
  const open = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navLinks.forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', (event) => {
  if (nav.classList.contains('is-open') && !nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});

function onScroll() {
  const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.width = `${Math.min(100, Math.max(0, window.scrollY / total * 100))}%`;
  const marker = window.scrollY + Math.min(window.innerHeight * .45, 390);
  let active = sections[0];
  for (const section of sections) {
    if (section.offsetTop <= marker) active = section;
  }
  const activeNav = active.dataset.section;
  navLinks.forEach(link => {
    const selected = link.dataset.nav === activeNav;
    link.classList.toggle('is-active', selected);
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
onScroll();

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2700);
}

async function copyUsername() {
  const username = discord.dataset.copy;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(username);
    } else {
      const input = document.createElement('textarea');
      input.value = username;
      input.setAttribute('readonly', '');
      input.style.cssText = 'position:fixed;left:-9999px;opacity:0';
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand('copy');
      input.remove();
      if (!copied) throw new Error('Clipboard blocked');
    }
    showToast(`Copied ${username} to clipboard`);
  } catch (error) {
    showToast(`Discord: ${username} — select and copy`);
    // Make the username available for manual selection if the browser blocks clipboard access.
    window.prompt('Copy Discord username:', username);
  }
}
discord.addEventListener('click', copyUsername);

// Music: one on/off button. It only ever starts when someone clicks it.
const music = document.getElementById('site-music');
const musicButton = document.getElementById('music-toggle');
music.volume = 0.5;

function setMusicLabel(on) {
  musicButton.textContent = on ? 'music: on' : 'music: off';
}

function musicFailed() {
  setMusicLabel(false);
  showToast('Music file not found: assets/music.mp3');
}

musicButton.addEventListener('click', async () => {
  if (!music.paused) {
    music.pause();
    setMusicLabel(false);
    return;
  }
  try {
    await music.play();
    setMusicLabel(true);
  } catch (error) {
    musicFailed();
  }
});

// Dark mode: remembers the visitor's choice, otherwise follows their device.
const themeButton = document.getElementById('theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeColor.content = theme === 'dark' ? '#181818' : '#f2f2f2';
  themeButton.textContent = `theme: ${theme}`;
}

applyTheme(document.documentElement.dataset.theme);

themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('theme', next); } catch (error) { /* private window: just don't remember */ }
});