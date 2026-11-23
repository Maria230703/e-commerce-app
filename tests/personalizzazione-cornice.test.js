import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  calculateFramePriceCents,
  describeFrameSelection,
  formatFramePrice,
  FRAME_OPTIONS,
  INITIAL_FRAME_SELECTION
} from '../public/frame-logic.js';
import { renderFrameConfiguratorMarkup } from '../public/frame-configurator.js';
import { PRODUCTS } from '../catalog-logic.js';

const indexHtml = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

function selectionWith(overrides = {}) {
  return { ...INITIAL_FRAME_SELECTION, ...overrides };
}

function price(selection) {
  return formatFramePrice(calculateFramePriceCents(selection));
}

/** §REQ:PRSN-CRNC-TMM-010 — dalla pagina Scopri il collegamento porta al configuratore con anteprima e "Indietro". */
test('PRSN-CRNC-TMM-010: il collegamento di Scopri apre il configuratore con anteprima e Indietro', () => {
  const link = indexHtml.match(/<a[^>]*id="frame-configurator-link"[^>]*>([^<]*)<\/a>/);
  assert.ok(link, 'collegamento al configuratore assente in Scopri');
  assert.equal(link[1], 'Crea la tua cornice');
  assert.match(link[0], /href="\/configuratore-cornice"/);

  const markup = renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION);
  assert.match(markup, /<h2 id="frame-configurator-title">Crea la tua cornice<\/h2>/);
  assert.match(markup, /class="frame-preview"/);
  assert.match(markup, /<a class="back-button frame-back-link" href="\/scopri">Indietro<\/a>/);
});

/** §REQ:PRSN-CRNC-TMM-020 — con 6 articoli il collegamento compare una sola volta, sotto il titolo "Scopri". */
test('PRSN-CRNC-TMM-020: il collegamento appare una sola volta, sotto il titolo Scopri', () => {
  assert.equal(PRODUCTS.length, 6);
  assert.equal(indexHtml.split('Crea la tua cornice').length - 1, 1);
  assert.equal(indexHtml.split('id="frame-configurator-link"').length - 1, 1);
  assert.ok(
    indexHtml.indexOf('id="page-title"') < indexHtml.indexOf('id="frame-configurator-link"'),
    'il collegamento deve stare dopo il titolo Scopri'
  );
  assert.match(indexHtml, /<h1 id="page-title" class="catalog-title">Scopri<\/h1>/);
});

/** §REQ:PRSN-CRNC-TMM-030 — selezione iniziale 13x18, Classico, Bianco, nessuna finitura, 30,90 €. */
test('PRSN-CRNC-TMM-030: selezione iniziale e prezzo', () => {
  assert.deepEqual(INITIAL_FRAME_SELECTION, { measure: '13x18', profile: 'classico', mat: 'bianco' });
  assert.equal(price(INITIAL_FRAME_SELECTION), '30,90 €');

  const markup = renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION);
  for (const [value, pressed] of [['13x18', 'true'], ['classico', 'true'], ['bianco', 'true'], ['10x15', 'false']]) {
    const button = [...markup.matchAll(/<button[\s\S]*?<\/button>/g)]
      .map(([m]) => m)
      .find((m) => m.includes(`data-frame-value="${value}"`));
    assert.ok(button, `opzione ${value} non trovata`);
    assert.ok(button.includes(`aria-pressed="${pressed}"`), `${value} dovrebbe avere aria-pressed=${pressed}`);
  }
  assert.match(markup, /--frame-color: #6B4A32/);
  assert.doesNotMatch(markup, /Finitura|data-frame-option="finish"/);
  assert.match(markup, /30,90 €/);
});

/** §REQ:PRSN-CRNC-TMM-040 — il prezzo segue la misura scelta. */
test('PRSN-CRNC-TMM-040: cambiare la misura aggiorna il prezzo', () => {
  const examples = [['10x15', '26,90 €'], ['13x18', '30,90 €'], ['15x20', '35,90 €'], ['30x30', '50,90 €'], ['50x70', '90,90 €']];
  assert.deepEqual(FRAME_OPTIONS.measure.map(({ value }) => value), examples.map(([m]) => m));
  for (const [measure, expected] of examples) {
    const selection = selectionWith({ measure });
    assert.equal(price(selection), expected, `misura ${measure}`);
    assert.match(renderFrameConfiguratorMarkup(selection), new RegExp(`<strong>${expected}</strong>`));
  }
});

/** §REQ:PRSN-CRNC-TMM-050 — il profilo cambia prezzo e anteprima. */
test('PRSN-CRNC-TMM-050: cambiare il profilo aggiorna prezzo e anteprima', () => {
  const examples = [['classico', 'Classico', '30,90 €', '12px'], ['contemporaneo', 'Contemporaneo', '32,90 €', '6px']];
  for (const [value, label, expected, border] of examples) {
    const selection = selectionWith({ profile: value });
    const markup = renderFrameConfiguratorMarkup(selection);
    assert.equal(price(selection), expected);
    assert.match(markup, new RegExp(`aria-label="Anteprima cornice, profilo ${label},`));
    assert.match(markup, new RegExp(`--frame-border-width: ${border}`));
  }
});

/** §REQ:PRSN-CRNC-TMM-060 — il passe-partout cambia prezzo e anteprima; Nessuno lo toglie. */
test('PRSN-CRNC-TMM-060: cambiare il passe-partout aggiorna prezzo e anteprima', () => {
  const examples = [
    ['nessuno', 'Nessuno', '25,00 €', null],
    ['bianco', 'Bianco', '30,90 €', '#FBFAF7'],
    ['verde-smeraldo', 'Verde smeraldo', '30,90 €', '#50C878'],
    ['rosso-carminio', 'Rosso carminio', '30,90 €', '#960018']
  ];
  for (const [value, label, expected, color] of examples) {
    const selection = selectionWith({ mat: value });
    const markup = renderFrameConfiguratorMarkup(selection);
    assert.equal(price(selection), expected, label);
    if (color) {
      assert.match(markup, new RegExp(`--mat-color: ${color}`));
      assert.match(markup, new RegExp(`passe-partout ${label}`));
    } else {
      assert.doesNotMatch(markup, /class="frame-mat"/);
      assert.match(markup, /senza passe-partout/);
    }
  }
});

/** §REQ:PRSN-CRNC-TMM-070 — misura, profilo e passe-partout combinati: riepilogo e prezzo. */
test('PRSN-CRNC-TMM-070: la combinazione di più scelte dà riepilogo e prezzo corretti', () => {
  const selection = { measure: '50x70', profile: 'contemporaneo', mat: 'rosso-carminio' };

  assert.equal(describeFrameSelection(selection), '50x70 cm, Contemporaneo, passe-partout Rosso carminio');
  assert.equal(price(selection), '92,90 €');
  assert.match(
    renderFrameConfiguratorMarkup(selection),
    /<p class="frame-summary" aria-live="polite">50x70 cm, Contemporaneo, passe-partout Rosso carminio<\/p>/
  );
});
