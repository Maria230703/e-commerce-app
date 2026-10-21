import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateFramePriceCents,
  describeFrameSelection,
  formatFramePrice,
  FRAME_OPTIONS,
  INITIAL_FRAME_SELECTION
} from '../public/frame-logic.js';
import { renderFrameConfiguratorMarkup } from '../public/frame-configurator.js';

function selectionWith(overrides = {}) {
  return { ...INITIAL_FRAME_SELECTION, ...overrides };
}

function assertOptionPressed(markup, value, pressed) {
  const button = [...markup.matchAll(/<button[\s\S]*?<\/button>/g)]
    .map(([buttonMarkup]) => buttonMarkup)
    .find((buttonMarkup) => buttonMarkup.includes(`data-frame-value="${value}"`));

  assert.ok(button, `opzione ${value} non trovata`);
  assert.ok(button.includes(`aria-pressed="${pressed}"`));
}

test('il configuratore apre con le scelte iniziali e il prezzo corretto', () => {
  const markup = renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION);

  assert.equal(calculateFramePriceCents(INITIAL_FRAME_SELECTION), 3890);
  assert.match(markup, /Misura \(cm\)/);
  assertOptionPressed(markup, '13x18', 'true');
  assertOptionPressed(markup, 'noce', 'true');
  assertOptionPressed(markup, 'classico', 'true');
  assertOptionPressed(markup, 'bianco', 'true');
  assertOptionPressed(markup, '10x15', 'false');
  assert.match(markup, /38,90 €/);
});

test('il prezzo in centesimi segue tutte le misure con le scelte iniziali', () => {
  const prices = FRAME_OPTIONS.measure.map(({ value }) => [
    value,
    calculateFramePriceCents(selectionWith({ measure: value }))
  ]);

  assert.deepEqual(prices, [
    ['10x15', 3490],
    ['13x18', 3890],
    ['15x20', 4390],
    ['30x30', 5890],
    ['50x70', 9890]
  ]);
});

test('le finiture, i profili e i passe-partout espongono opzioni e supplementi corretti', () => {
  assert.deepEqual(
    FRAME_OPTIONS.finish.map(({ label, color, priceCents }) => ({ label, color, priceCents })),
    [
      { label: 'Noce', color: '#6B4A32', priceCents: 800 },
      { label: 'Oro spazzolato', color: '#B89A55', priceCents: 1200 }
    ]
  );
  assert.deepEqual(
    FRAME_OPTIONS.profile.map(({ label, borderWidth, priceCents }) => ({ label, borderWidth, priceCents })),
    [
      { label: 'Classico', borderWidth: 12, priceCents: 600 },
      { label: 'Contemporaneo', borderWidth: 6, priceCents: 800 }
    ]
  );
  assert.deepEqual(
    FRAME_OPTIONS.mat.map(({ label, color, priceCents }) => ({ label, color, priceCents })),
    [
      { label: 'Nessuno', color: null, priceCents: 0 },
      { label: 'Bianco', color: '#FBFAF7', priceCents: 590 },
      { label: 'Verde smeraldo', color: '#50C878', priceCents: 590 },
      { label: 'Rosso carminio', color: '#960018', priceCents: 590 }
    ]
  );
});

test('finitura e profilo aggiornano supplemento e dettagli dell’anteprima', () => {
  const goldMarkup = renderFrameConfiguratorMarkup(selectionWith({ finish: 'oro-spazzolato' }));
  const classicMarkup = renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION);
  const modernMarkup = renderFrameConfiguratorMarkup(selectionWith({ profile: 'contemporaneo' }));

  assert.equal(calculateFramePriceCents(selectionWith({ finish: 'oro-spazzolato' })), 4290);
  assert.match(goldMarkup, /--frame-color: #B89A55/);
  assert.equal(calculateFramePriceCents(selectionWith({ profile: 'contemporaneo' })), 4090);
  assert.match(classicMarkup, /--frame-border-width: 12px/);
  assert.match(modernMarkup, /--frame-border-width: 6px/);
});

test('il passe-partout aggiorna prezzo e anteprima; Nessuno lo rimuove', () => {
  const noMatSelection = selectionWith({ mat: 'nessuno' });
  const noMatMarkup = renderFrameConfiguratorMarkup(noMatSelection);
  const greenMarkup = renderFrameConfiguratorMarkup(selectionWith({ mat: 'verde-smeraldo' }));
  const redMarkup = renderFrameConfiguratorMarkup(selectionWith({ mat: 'rosso-carminio' }));

  assert.equal(calculateFramePriceCents(noMatSelection), 3300);
  assert.match(noMatMarkup, /senza passe-partout/);
  assert.doesNotMatch(noMatMarkup, /class="frame-mat"/);
  assert.equal(calculateFramePriceCents(selectionWith({ mat: 'verde-smeraldo' })), 3890);
  assert.match(greenMarkup, /--mat-color: #50C878/);
  assert.match(redMarkup, /--mat-color: #960018/);
  assert.match(renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION), /--mat-color: #FBFAF7/);
});

test('la combinazione richiesta aggiorna riepilogo e prezzo e rispetta la proporzione', () => {
  const selection = {
    measure: '50x70',
    finish: 'oro-spazzolato',
    profile: 'contemporaneo',
    mat: 'rosso-carminio'
  };
  const markup = renderFrameConfiguratorMarkup(selection);

  assert.equal(
    describeFrameSelection(selection),
    '50x70 cm, Oro spazzolato, Contemporaneo, passe-partout Rosso carminio'
  );
  assert.equal(calculateFramePriceCents(selection), 10490);
  assert.equal(formatFramePrice(calculateFramePriceCents(selection)), '104,90 €');
  assert.match(markup, /50x70 cm, Oro spazzolato, Contemporaneo, passe-partout Rosso carminio/);
  assert.match(markup, /--frame-ratio: 50 \/ 70/);
  assert.match(markup, /aria-pressed="false"/);
  assert.match(markup, /<button/);
  assert.doesNotMatch(markup, /Aggiungi al carrello|type="file"/);
});
