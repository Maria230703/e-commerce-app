import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateFramePriceCents,
  describeFrameSelection,
  formatFramePrice,
  FRAME_OPTIONS,
  INITIAL_FRAME_SELECTION,
  MAX_FRAME_PHOTO_BYTES,
  validateFramePhoto,
  getFrameSelectionPriceCents
} from '../public/frame-logic.js';
import { renderFrameConfiguratorMarkup } from '../public/frame-configurator.js';
import {
  CART_STORAGE_KEY,
  createFrameCartItem,
  isItemInCart,
  restoreCart
} from '../public/cart-logic.js';

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

  assert.equal(calculateFramePriceCents(INITIAL_FRAME_SELECTION), 3090);
  assert.match(markup, /Misura \(cm\)/);
  assertOptionPressed(markup, '13x18', 'true');
  assertOptionPressed(markup, 'classico', 'true');
  assertOptionPressed(markup, 'bianco', 'true');
  assertOptionPressed(markup, '10x15', 'false');
  assert.doesNotMatch(markup, /Finitura|data-frame-option="finish"/);
  assert.match(markup, /<a class="back-button frame-back-link" href="\/scopri">Indietro<\/a>/);
  assert.match(markup, /30,90 €/);
});

test('il prezzo in centesimi segue tutte le misure con le scelte iniziali', () => {
  const prices = FRAME_OPTIONS.measure.map(({ value }) => [
    value,
    calculateFramePriceCents(selectionWith({ measure: value }))
  ]);

  assert.deepEqual(prices, [
    ['10x15', 2690],
    ['13x18', 3090],
    ['15x20', 3590],
    ['30x30', 5090],
    ['50x70', 9090]
  ]);
});

test('i profili e i passe-partout espongono opzioni e supplementi corretti', () => {
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

test('il profilo aggiorna supplemento e dettagli dell’anteprima', () => {
  const classicMarkup = renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION);
  const modernMarkup = renderFrameConfiguratorMarkup(selectionWith({ profile: 'contemporaneo' }));

  assert.equal(calculateFramePriceCents(selectionWith({ profile: 'contemporaneo' })), 3290);
  assert.match(classicMarkup, /--frame-color: #6B4A32/);
  assert.match(classicMarkup, /--frame-border-width: 12px/);
  assert.match(modernMarkup, /--frame-border-width: 6px/);
});

test('il passe-partout aggiorna prezzo e anteprima; Nessuno lo rimuove', () => {
  const noMatSelection = selectionWith({ mat: 'nessuno' });
  const noMatMarkup = renderFrameConfiguratorMarkup(noMatSelection);
  const greenMarkup = renderFrameConfiguratorMarkup(selectionWith({ mat: 'verde-smeraldo' }));
  const redMarkup = renderFrameConfiguratorMarkup(selectionWith({ mat: 'rosso-carminio' }));

  assert.equal(calculateFramePriceCents(noMatSelection), 2500);
  assert.match(noMatMarkup, /senza passe-partout/);
  assert.doesNotMatch(noMatMarkup, /class="frame-mat"/);
  assert.equal(calculateFramePriceCents(selectionWith({ mat: 'verde-smeraldo' })), 3090);
  assert.match(greenMarkup, /--mat-color: #50C878/);
  assert.match(redMarkup, /--mat-color: #960018/);
  assert.match(renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION), /--mat-color: #FBFAF7/);
});

test('la combinazione richiesta aggiorna riepilogo e prezzo e rispetta la proporzione', () => {
  const selection = {
    measure: '50x70',
    profile: 'contemporaneo',
    mat: 'rosso-carminio'
  };
  const markup = renderFrameConfiguratorMarkup(selection);

  assert.equal(
    describeFrameSelection(selection),
    '50x70 cm, Contemporaneo, passe-partout Rosso carminio'
  );
  assert.equal(calculateFramePriceCents(selection), 9290);
  assert.equal(formatFramePrice(calculateFramePriceCents(selection)), '92,90 €');
  assert.match(markup, /50x70 cm, Contemporaneo, passe-partout Rosso carminio/);
  assert.match(markup, /--frame-ratio: 50 \/ 70/);
  assert.match(markup, /aria-pressed="false"/);
  assert.match(markup, /<button/);
  assert.match(markup, /class="add-button frame-add-button"/);
  assert.match(markup, />\s*Aggiungi\s*<\/button>/);
});

test('aggiunge una cornice configurata al carrello e mantiene lo stato Aggiunto', () => {
  const frame = createFrameCartItem(INITIAL_FRAME_SELECTION);
  const cart = [frame];

  assert.equal(frame.name, 'Cornice su misura');
  assert.equal(frame.price, 30.9);
  assert.equal(frame.frameDescription, '13x18 cm, Classico, passe-partout Bianco');
  assert.equal(isItemInCart(cart, frame.id), true);
  assert.equal(getFrameSelectionPriceCents(frame.frameSelection), 3090);
});

test('ripristina i carrelli salvati con la vecchia scelta di finitura', () => {
  const storage = {
    getItem(key) {
      return key === CART_STORAGE_KEY
        ? JSON.stringify([{
            id: 'frame:13x18|noce|classico|bianco',
            quantity: 1,
            frameSelection: {
              measure: '13x18',
              finish: 'noce',
              profile: 'classico',
              mat: 'bianco'
            }
          }])
        : null;
    }
  };

  const [frame] = restoreCart(storage);

  assert.equal(frame.id, 'frame:13x18|classico|bianco');
  assert.equal(frame.price, 30.9);
  assert.deepEqual(frame.frameSelection, {
    measure: '13x18',
    profile: 'classico',
    mat: 'bianco'
  });
});

test('la validazione accetta JPG, PNG e WebP fino a 10 MiB', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
    assert.equal(
      validateFramePhoto({ type, size: MAX_FRAME_PHOTO_BYTES }),
      null
    );
  }
});

test('la validazione rifiuta formati non supportati e file oltre 10 MiB', () => {
  assert.equal(
    validateFramePhoto({ type: 'application/pdf', size: 100 }),
    'Formato non supportato. Carica un\'immagine JPG, PNG o WebP.'
  );
  assert.equal(
    validateFramePhoto({ type: 'image/jpeg', size: MAX_FRAME_PHOTO_BYTES + 1 }),
    'La foto supera i 10 MB. Scegline una più leggera.'
  );
});

test('la foto appare nell’anteprima e nel riepilogo senza modificare il prezzo', () => {
  const priceBefore = calculateFramePriceCents(INITIAL_FRAME_SELECTION);
  const markup = renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION, {
    name: 'mare.jpg',
    url: 'blob:photo-preview'
  });

  assert.match(markup, /<img src="blob:photo-preview" alt="La tua foto nella cornice">/);
  assert.match(markup, /Foto: mare\.jpg/);
  assert.match(markup, /Stampa foto su carta fotografica: omaggio/);
  assert.match(markup, /Tipo di stampa: Carta fotografica/);
  assert.match(markup, /Rimuovi foto/);
  assert.doesNotMatch(markup, /<(?:select|option)(?:\s|>)/);
  assert.equal(calculateFramePriceCents(INITIAL_FRAME_SELECTION), priceBefore);

  const emptyMarkup = renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION);
  assert.match(emptyMarkup, /La tua foto/);
  assert.match(emptyMarkup, /Carica la tua foto/);
  assert.match(emptyMarkup, /Stampa su carta fotografica inclusa nel prezzo/);
  assert.match(emptyMarkup, /role="alert" hidden><\/p>/);
  assert.doesNotMatch(emptyMarkup, /Stampa foto su carta fotografica: omaggio/);
  assert.doesNotMatch(emptyMarkup, /Tipo di stampa: Carta fotografica/);
});

test('gli errori della foto sono annunciati e il nome file viene escapato', () => {
  const errorMarkup = renderFrameConfiguratorMarkup(
    INITIAL_FRAME_SELECTION,
    null,
    'Formato non supportato. Carica un\'immagine JPG, PNG o WebP.'
  );
  const unsafeFilenameMarkup = renderFrameConfiguratorMarkup(INITIAL_FRAME_SELECTION, {
    name: '<img src=x onerror=alert(1)>.jpg',
    url: 'blob:photo-preview'
  });

  assert.match(
    errorMarkup,
    /role="alert">Formato non supportato\. Carica un&#39;immagine JPG, PNG o WebP\.<\/p>/
  );
  assert.match(unsafeFilenameMarkup, /&lt;img src=x onerror=alert\(1\)&gt;\.jpg/);
  assert.doesNotMatch(unsafeFilenameMarkup, /<p class="frame-photo-name"><img/);
});
