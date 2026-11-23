import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  INITIAL_FRAME_SELECTION,
  validateFramePhoto
} from '../public/frame-logic.js';
import { renderFrameConfiguratorMarkup } from '../public/frame-configurator.js';

const appJs = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const SELECTION = { ...INITIAL_FRAME_SELECTION };
const PRINT_NOTE = 'Stampa foto su carta fotografica: omaggio';
const PLACEHOLDER = '<span>La tua foto</span>';
const photo = (name) => ({ name, url: `blob:${name}` });
const priceOf = (markup) => markup.match(/<p class="frame-price"[\s\S]*?<strong>([^<]*)<\/strong>/)[1];
const summaryOf = (markup) => markup.match(/<p class="frame-summary"[^>]*>([^<]*)<\/p>/)[1];

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-010 — senza foto: segnaposto, pulsante di caricamento e frase di stampa inclusa. */
test('STMP-DLL-PRPR-FOTO-JUL-010: anteprima senza foto', () => {
  const markup = renderFrameConfiguratorMarkup(SELECTION);
  assert.equal(SELECTION.measure, '13x18');
  assert.match(markup, /<div class="frame-photo"><span>La tua foto<\/span><\/div>/);
  assert.match(markup, />Carica la tua foto<\/button>/);
  assert.match(markup, /Stampa su carta fotografica inclusa nel prezzo/);
});

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-020 — una foto JPG, PNG o WebP valida compare in anteprima con il suo nome. */
for (const [file, type] of [['mare.jpg', 'image/jpeg'], ['mare.png', 'image/png'], ['mare.webp', 'image/webp']]) {
  test(`STMP-DLL-PRPR-FOTO-JUL-020: carico ${file}`, () => {
    assert.equal(validateFramePhoto({ name: file, type, size: 1024 }), null);
    const markup = renderFrameConfiguratorMarkup(SELECTION, photo(file));
    assert.match(markup, new RegExp(`<img src="blob:${file}" alt="La tua foto nella cornice">`));
    assert.ok(!markup.includes(PLACEHOLDER), 'il segnaposto non deve più essere visibile');
    assert.match(markup, new RegExp(`Foto: ${file.replace('.', '\\.')}`));
  });
}

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-030 — un formato non accettato mostra il messaggio e lascia il segnaposto. */
test('STMP-DLL-PRPR-FOTO-JUL-030: formato non accettato', () => {
  const error = validateFramePhoto({ name: 'documento.pdf', type: 'application/pdf', size: 1024 });
  assert.equal(error, 'Formato non supportato. Carica un\'immagine JPG, PNG o WebP.');
  const markup = renderFrameConfiguratorMarkup(SELECTION, null, error);
  assert.match(markup, /role="alert">Formato non supportato\. Carica un&#39;immagine JPG, PNG o WebP\.<\/p>/);
  assert.ok(markup.includes(PLACEHOLDER));
});

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-040 — una foto oltre 10 MB mostra il messaggio e lascia il segnaposto. */
test('STMP-DLL-PRPR-FOTO-JUL-040: foto troppo pesante', () => {
  const error = validateFramePhoto({ name: 'panorama.jpg', type: 'image/jpeg', size: 12 * 1024 * 1024 });
  assert.equal(error, 'La foto supera i 10 MB. Scegline una più leggera.');
  assert.equal(validateFramePhoto({ name: 'ok.jpg', type: 'image/jpeg', size: 10 * 1024 * 1024 }), null);
  const markup = renderFrameConfiguratorMarkup(SELECTION, null, error);
  assert.match(markup, /role="alert">La foto supera i 10 MB\. Scegline una più leggera\.<\/p>/);
  assert.ok(markup.includes(PLACEHOLDER));
});

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-050 — la stampa è un omaggio: il riepilogo lo dice e il prezzo resta 30,90 €. */
test('STMP-DLL-PRPR-FOTO-JUL-050: omaggio, prezzo invariato', () => {
  const markup = renderFrameConfiguratorMarkup(SELECTION, photo('mare.jpg'));
  assert.ok(summaryOf(markup).includes(PRINT_NOTE));
  assert.equal(priceOf(markup), '30,90 €');
  assert.equal(priceOf(markup), priceOf(renderFrameConfiguratorMarkup(SELECTION)));
});

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-060 — il tipo di stampa è Carta fotografica e non c'è scelta del tipo di carta. */
test('STMP-DLL-PRPR-FOTO-JUL-060: carta fotografica unica', () => {
  const markup = renderFrameConfiguratorMarkup(SELECTION, photo('mare.jpg'));
  assert.match(markup, /<p class="frame-print-type">Tipo di stampa: Carta fotografica<\/p>/);
  assert.doesNotMatch(markup, /<(?:select|option)(?:\s|>)/);
  assert.doesNotMatch(markup, /data-frame-option="(?:paper|carta|print)/);
});

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-070 — senza foto il riepilogo non mostra la voce di stampa. */
test('STMP-DLL-PRPR-FOTO-JUL-070: senza foto nessuna voce di stampa', () => {
  const markup = renderFrameConfiguratorMarkup(SELECTION);
  assert.ok(!summaryOf(markup).includes(PRINT_NOTE));
  assert.ok(!markup.includes(PRINT_NOTE));
  assert.doesNotMatch(markup, /Tipo di stampa:/);
});

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-080 — cambiando profilo e passe-partout la foto resta e il prezzo segue (32,90 €). */
test('STMP-DLL-PRPR-FOTO-JUL-080: la foto resta cambiando le scelte', () => {
  const changed = { ...SELECTION, profile: 'contemporaneo', mat: 'rosso-carminio' };
  const markup = renderFrameConfiguratorMarkup(changed, photo('mare.jpg'));
  assert.match(markup, /<img src="blob:mare\.jpg" alt="La tua foto nella cornice">/);
  assert.match(markup, /--frame-border-width: 6px/);
  assert.match(markup, /--mat-color: #960018/);
  assert.equal(priceOf(markup), '32,90 €');
  const handler = appJs.match(/querySelectorAll\('\.frame-option'\)[\s\S]*?\n  \}\);/)[0];
  assert.doesNotMatch(handler, /framePhoto/, 'cambiare opzione non deve toccare la foto');
});

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-090 — caricare un'altra foto sostituisce la precedente e ne mostra il nome. */
test('STMP-DLL-PRPR-FOTO-JUL-090: sostituire la foto', () => {
  const markup = renderFrameConfiguratorMarkup(SELECTION, photo('montagna.jpg'));
  assert.match(markup, /<img src="blob:montagna\.jpg"/);
  assert.doesNotMatch(markup, /blob:mare\.jpg/);
  assert.match(markup, /Foto: montagna\.jpg/);
  const upload = appJs.match(/photoInput\.addEventListener\('change'[\s\S]*?\n  \}\);/)[0];
  assert.match(upload, /revokeObjectURL\(state\.framePhoto\.url\)/);
  assert.match(upload, /state\.framePhoto = \{\s*name: file\.name/);
});

/** §REQ:STMP-DLL-PRPR-FOTO-JUL-100 — "Rimuovi foto" riporta il segnaposto e toglie la voce di stampa. */
test('STMP-DLL-PRPR-FOTO-JUL-100: togliere la foto', () => {
  assert.match(renderFrameConfiguratorMarkup(SELECTION, photo('mare.jpg')), />Rimuovi foto<\/button>/);
  const remove = appJs.match(/frame-remove-photo'\)\?\.addEventListener[\s\S]*?\n  \}\);/)[0];
  assert.match(remove, /state\.framePhoto = null/);
  const markup = renderFrameConfiguratorMarkup(SELECTION, null);
  assert.ok(markup.includes(PLACEHOLDER));
  assert.ok(!markup.includes(PRINT_NOTE));
  assert.doesNotMatch(markup, /Rimuovi foto/);
});
