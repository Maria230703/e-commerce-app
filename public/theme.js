// §REQ:MDLT-GRN-NTT-72YRBW, §REQ:MDLT-GRN-NTT-9ANCZM, §REQ:MDLT-GRN-NTT-7J2URW, §REQ:MDLT-GRN-NTT-29KNY6
// Modalità giorno (chiara) e notte (scura) del sito, con il pulsante sotto il logo.

export const THEMES = ['light', 'dark'];
export const DEFAULT_THEME = 'light';
export const THEME_STORAGE_KEY = 'e-commerce-theme';

export function isTheme(theme) {
  return THEMES.includes(theme);
}

/** §REQ:MDLT-GRN-NTT-9ANCZM, §REQ:MDLT-GRN-NTT-7J2URW — da giorno a notte e viceversa */
export function getNextTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

/** §REQ:MDLT-GRN-NTT-29KNY6 — la modalità scelta resta dopo il ricaricamento e tra le pagine */
export function readTheme(storage) {
  const stored = storage.getItem(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : DEFAULT_THEME;
}

/** §REQ:MDLT-GRN-NTT-29KNY6 */
export function saveTheme(storage, theme) {
  storage.setItem(THEME_STORAGE_KEY, isTheme(theme) ? theme : DEFAULT_THEME);
}

/** Nome del pulsante per chi non lo vede: dice dove porta il tocco. */
export function getThemeToggleLabel(theme) {
  return theme === 'dark' ? 'Passa alla modalità giorno' : 'Passa alla modalità notte';
}

const SUN_RAYS = [
  [12, 5, 12, 2.5], [16.95, 7.05, 18.72, 5.28], [19, 12, 21.5, 12], [16.95, 16.95, 18.72, 18.72],
  [12, 19, 12, 21.5], [7.05, 16.95, 5.28, 18.72], [5, 12, 2.5, 12], [7.05, 7.05, 5.28, 5.28]
];

/** §REQ:MDLT-GRN-NTT-72YRBW (sole bianco: disco con otto raggi) · §REQ:MDLT-GRN-NTT-9ANCZM (spicchio di luna bianco) */
export function renderThemeIconMarkup(theme) {
  if (theme === 'dark') {
    return '<svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  }
  const rays = SUN_RAYS.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join('');
  return `<svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/>${rays}</svg>`;
}

/** §REQ:MDLT-GRN-NTT-72YRBW, §REQ:MDLT-GRN-NTT-9ANCZM, §REQ:MDLT-GRN-NTT-7J2URW, §REQ:MDLT-GRN-NTT-29KNY6 */
export function initTheme({ doc = document, storage = window.localStorage } = {}) {
  let theme = readTheme(storage);
  const button = doc.querySelector('#theme-button');

  function applyTheme() {
    doc.documentElement.dataset.theme = theme;
    if (button) {
      button.innerHTML = renderThemeIconMarkup(theme);
      button.setAttribute('aria-label', getThemeToggleLabel(theme));
    }
  }

  button?.addEventListener('click', () => {
    theme = getNextTheme(theme);
    saveTheme(storage, theme);
    applyTheme();
  });

  applyTheme();
  return { getTheme: () => theme };
}
