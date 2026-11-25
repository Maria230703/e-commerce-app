import { COUNTRIES, PATTERNS, PHRASES, UNCHANGED } from './i18n-dictionaries.js';

// §REQ:LNG-7ZCWHN, §REQ:LNG-9ERFZM, §REQ:LNG-7WEBWK — la sigla sul pulsante: ITA, ENG, ESP
export const LANGUAGES = [
  { code: 'ita', label: 'ITA', name: 'Italiano', htmlLang: 'it' },
  { code: 'eng', label: 'ENG', name: 'Inglese', htmlLang: 'en' },
  { code: 'esp', label: 'ESP', name: 'Spagnolo', htmlLang: 'es' }
];

export const DEFAULT_LANGUAGE = 'ita';
export const LANGUAGE_STORAGE_KEY = 'e-commerce-language';

const LANGUAGE_COLUMN = { eng: 1, esp: 2 };
const TRANSLATED_ATTRIBUTES = ['aria-label', 'alt', 'placeholder', 'title'];

export function isLanguageCode(code) {
  return LANGUAGES.some((language) => language.code === code);
}

/** §REQ:LNG-7ZCWHN, §REQ:LNG-9ERFZM, §REQ:LNG-7WEBWK */
export function getLanguageLabel(code) {
  return (LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0]).label;
}

/** §REQ:LNG-674RJD, §REQ:LNG-3Q3RDZ — la barra offre le altre due lingue */
export function getOtherLanguages(code) {
  return LANGUAGES.filter((language) => language.code !== code);
}

/** §REQ:LNG-674RJD, §REQ:LNG-3Q3RDZ */
export function renderLanguageMenuMarkup(code) {
  return getOtherLanguages(code)
    .map(({ code: optionCode, name }) => `<button class="language-option" type="button" role="option" data-language="${optionCode}">${name}</button>`)
    .join('');
}

/** §REQ:LNG-6AEYMD — la lingua scelta resta dopo il ricaricamento e tra le pagine */
export function readLanguage(storage) {
  const stored = storage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguageCode(stored) ? stored : DEFAULT_LANGUAGE;
}

/** §REQ:LNG-6AEYMD */
export function saveLanguage(storage, code) {
  storage.setItem(LANGUAGE_STORAGE_KEY, isLanguageCode(code) ? code : DEFAULT_LANGUAGE);
}

const phraseIndex = new Map([...PHRASES, ...COUNTRIES].map(([ita, eng, esp]) => [ita, [eng, esp]]));
const unchangedWords = new Set(UNCHANGED);
const wordLike = /\p{L}/u;
const codeLike = /^[A-Z0-9][A-Z0-9 \-/.]*$/;
const emailLike = /^\S+@\S+$/;
const numberLike = /^[\d\s.,x×%€−+\-/]+$/i;

function isNeutral(core) {
  return !wordLike.test(core) || unchangedWords.has(core) || codeLike.test(core) || emailLike.test(core) || numberLike.test(core);
}

// Restituisce { text, complete }: `complete` è vero quando ogni parte del testo ha una traduzione nota.
function resolveCore(core, column) {
  const phrase = phraseIndex.get(core);
  if (phrase) {
    return { text: phrase[column - 1], complete: true };
  }

  if (isNeutral(core)) {
    return { text: core, complete: true };
  }

  for (const [pattern, ...templates] of PATTERNS) {
    const match = core.match(pattern);
    if (match) {
      const text = templates[column - 1].replace(/\$(\d)/g, (_, index) => resolveCore(match[Number(index)], column).text);
      return { text, complete: true };
    }
  }

  if (core.endsWith(':')) {
    const inner = resolveCore(core.slice(0, -1), column);
    if (inner.complete) {
      return { text: `${inner.text}:`, complete: true };
    }
  }

  const parts = core.split(/(, | — )/);
  if (parts.length > 1) {
    const resolved = parts.map((part, index) => (index % 2 ? { text: part, complete: true } : resolveCore(part, column)));
    return { text: resolved.map(({ text }) => text).join(''), complete: resolved.every(({ complete }) => complete) };
  }

  return { text: core, complete: false };
}

function resolve(text, language) {
  const [, lead, core, trail] = String(text).match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!core) {
    return { text, complete: true };
  }
  if (language === DEFAULT_LANGUAGE || !LANGUAGE_COLUMN[language]) {
    return { text, complete: true };
  }
  const resolved = resolveCore(core, LANGUAGE_COLUMN[language]);
  return { text: lead + resolved.text + trail, complete: resolved.complete };
}

/** §REQ:LNG-6A3P6V, §REQ:LNG-5R75GQ — traduce una parola o una frase del sito; il testo ignoto resta com'è */
export function translateText(text, language) {
  return resolve(text, language).text;
}

/** §REQ:LNG-6A3P6V — vero se il testo ha una traduzione in ogni parte (o è un nome, un numero, un codice) */
export function hasTranslation(text) {
  return resolve(text, 'eng').complete && resolve(text, 'esp').complete;
}

// ---- Parte del browser: traduzione automatica della pagina ----

const textState = new WeakMap();
const attributeState = new WeakMap();

function createTranslator(doc, getLanguage) {
  const skip = (node) => ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement?.tagName);

  function syncText(node) {
    if (skip(node)) {
      return;
    }
    let entry = textState.get(node);
    if (!entry || node.data !== entry.out) {
      entry = { orig: node.data, out: node.data };
    }
    entry.out = translateText(entry.orig, getLanguage());
    textState.set(node, entry);
    if (node.data !== entry.out) {
      node.data = entry.out;
    }
  }

  function syncAttribute(element, name) {
    const value = element.getAttribute(name);
    if (value === null) {
      return;
    }
    const entries = attributeState.get(element) ?? {};
    let entry = entries[name];
    if (!entry || value !== entry.out) {
      entry = { orig: value, out: value };
    }
    entry.out = translateText(entry.orig, getLanguage());
    entries[name] = entry;
    attributeState.set(element, entries);
    if (value !== entry.out) {
      element.setAttribute(name, entry.out);
    }
  }

  function translateTree(root) {
    if (root.nodeType === 3) {
      syncText(root);
      return;
    }
    if (root.nodeType !== 1) {
      return;
    }
    const walker = doc.createTreeWalker(root, 1 | 4);
    let node = walker.currentNode;
    while (node) {
      if (node.nodeType === 3) {
        syncText(node);
      } else {
        TRANSLATED_ATTRIBUTES.forEach((name) => syncAttribute(node, name));
      }
      node = walker.nextNode();
    }
  }

  return { syncText, syncAttribute, translateTree };
}

/**
 * §REQ:LNG-7ZCWHN, §REQ:LNG-7T2YSF, §REQ:LNG-674RJD, §REQ:LNG-9ERFZM, §REQ:LNG-7WEBWK, §REQ:LNG-3Q3RDZ,
 * §REQ:LNG-6A3P6V, §REQ:LNG-9NBEVB, §REQ:LNG-6AEYMD
 */
export function initLanguage({ doc = document, storage = window.localStorage, isLandingPage }) {
  let language = readLanguage(storage);
  const originalTitle = doc.title;
  const switcher = doc.querySelector('#language-switcher');
  const button = doc.querySelector('#language-button');
  const menu = doc.querySelector('#language-menu');
  const translator = createTranslator(doc, () => language);

  function renderSwitcher() {
    if (!switcher) {
      return;
    }
    switcher.hidden = !isLandingPage;
    button.textContent = getLanguageLabel(language);
    menu.innerHTML = renderLanguageMenuMarkup(language);
    translator.translateTree(menu);
  }

  function closeMenu() {
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
  }

  function applyLanguage() {
    doc.documentElement.lang = LANGUAGES.find(({ code }) => code === language).htmlLang;
    doc.title = translateText(originalTitle, language);
    translator.translateTree(doc.body);
  }

  function chooseLanguage(code) {
    if (!isLanguageCode(code)) {
      return;
    }
    language = code;
    saveLanguage(storage, language);
    renderSwitcher();
    applyLanguage();
    closeMenu();
    button.focus();
  }

  if (switcher) {
    button.addEventListener('click', () => {
      const willOpen = menu.hidden;
      menu.hidden = !willOpen;
      button.setAttribute('aria-expanded', String(willOpen));
    });
    menu.addEventListener('click', (event) => {
      const option = event.target.closest('[data-language]');
      if (option) {
        chooseLanguage(option.dataset.language);
      }
    });
    doc.addEventListener('click', (event) => {
      if (!switcher.contains(event.target)) {
        closeMenu();
      }
    });
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  }

  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'childList') {
        record.addedNodes.forEach((node) => translator.translateTree(node));
      } else if (record.type === 'characterData') {
        translator.syncText(record.target);
      } else if (record.type === 'attributes') {
        translator.syncAttribute(record.target, record.attributeName);
      }
    }
  }).observe(doc.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: TRANSLATED_ATTRIBUTES
  });

  renderSwitcher();
  applyLanguage();

  return { getLanguage: () => language, setLanguage: chooseLanguage };
}
