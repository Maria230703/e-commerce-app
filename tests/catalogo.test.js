import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CATEGORIES,
  PRODUCTS,
  filterProducts,
  formatCurrency,
  calculateCartTotal,
  transitionCatalogView
} from '../catalog-logic.js';
import { renderProductDetailMarkup } from '../public/product-detail.js';
import { renderAddToCartButton } from '../public/cart-ui.js';
import {
  CART_STORAGE_KEY,
  isItemInCart,
  persistCart,
  restoreCart
} from '../public/cart-logic.js';
import { LOOK_SCENE_PRODUCTS, renderLookScene } from '../public/look-scene.js';
import {
  EMPTY_FAVORITES_MESSAGE,
  FAVORITES_STORAGE_KEY,
  readFavoriteIds,
  renderFavoriteButtonMarkup,
  renderFavoritesMarkup,
  toggleFavoriteId
} from '../public/favorites.js';

test('il catalogo contiene i 6 articoli di arredamento richiesti', () => {
  assert.equal(PRODUCTS.length, 6);
  assert.deepEqual(CATEGORIES.map(({ label }) => label), [
    'Tutti',
    'Arredo',
    'Oggettistica',
    'Cornici'
  ]);
  assert.deepEqual(
    PRODUCTS.map(({ name, category, price }) => ({ name, category, price })),
    [
      { name: 'Lampada Lume', category: 'arredo', price: 89 },
      { name: 'Specchio Orbita', category: 'arredo', price: 119 },
      { name: 'Portavaso Trama', category: 'arredo', price: 45 },
      { name: 'Vaso Duna', category: 'oggettistica', price: 34 },
      { name: 'Candela Vaniglia', category: 'oggettistica', price: 22 },
      { name: 'Cornice Atelier', category: 'cornici', price: 29 }
    ]
  );
  assert.equal(filterProducts(PRODUCTS, { category: 'cornici' }).length, 1);
});

test('la scena Compra il look compare prima del catalogo con quattro pulsanti accessibili', () => {
  const markup = renderLookScene();

  assert.match(markup, /<h2 id="look-scene-title">Compra il look<\/h2>/);
  assert.match(markup, /<span>Angolo soggiorno<\/span>/);
  assert.match(markup, /Tocca i punti per scoprire gli oggetti della scena\./);
  assert.match(markup, /<svg class="look-room-drawing"/);
  assert.equal((markup.match(/class="look-hotspot look-hotspot-/g) ?? []).length, 4);
  assert.ok(
    LOOK_SCENE_PRODUCTS.every(({ id, name }) =>
      markup.includes(`data-product-id="${id}"`) && markup.includes(`aria-label="Scopri ${name}"`)
    )
  );
});

test('i punti della scena aprono le schede dei quattro articoli associati', () => {
  assert.deepEqual(
    LOOK_SCENE_PRODUCTS.map(({ id, name }) => {
      const product = PRODUCTS.find((item) => item.id === id);
      const detailMarkup = renderProductDetailMarkup(product);

      assert.ok(detailMarkup.includes(`<h2 id="product-detail-title">${name}</h2>`));
      assert.ok(detailMarkup.includes(formatCurrency(product.price)));
      return name;
    }),
    ['Cornice Atelier', 'Vaso Duna', 'Lampada Lume', 'Portavaso Trama']
  );
});

test('la scena resta sul catalogo e il ritorno dalla scheda ripristina Scopri con sei articoli', () => {
  const detailView = transitionCatalogView(
    { category: 'all', selectedProductId: null },
    { type: 'open-product', productId: 1 }
  );
  const catalogView = transitionCatalogView(detailView, { type: 'back-to-catalog' });

  assert.equal(PRODUCTS.length, 6);
  assert.equal(catalogView.selectedProductId, null);
  assert.equal(catalogView.category, 'all');
  assert.match(renderLookScene(), /Compra il look/);
});

test('filtra prodotti per categoria arredo', () => {
  const filtered = filterProducts(PRODUCTS, { category: 'arredo' });

  assert.equal(filtered.length, 3);
  assert.ok(filtered.every((product) => product.category === 'arredo'));
});

test('ricerca per nome del prodotto', () => {
  const filtered = filterProducts(PRODUCTS, { search: 'Vaso' });

  assert.equal(filtered.length, 2);
  assert.deepEqual(filtered.map((product) => product.name), ['Portavaso Trama', 'Vaso Duna']);
});

test('apre la scheda dell’articolo selezionato', () => {
  const view = transitionCatalogView(
    { category: 'oggettistica', selectedProductId: null },
    { type: 'open-product', productId: 4 }
  );

  assert.equal(view.selectedProductId, 4);
  assert.equal(view.category, 'oggettistica');
});

test('la scheda contiene nome, prezzo e descrizione del prodotto', () => {
  const product = PRODUCTS.find(({ id }) => id === 4);
  const markup = renderProductDetailMarkup(product);

  assert.match(markup, /<button class="back-button" type="button">Indietro<\/button>/);
  assert.match(markup, /<h2 id="product-detail-title">Vaso Duna<\/h2>/);
  assert.ok(markup.includes(`<p class="price">${formatCurrency(product.price)}</p>`));
  assert.match(markup, /<p class="product-detail-description">Ceramica smaltata a mano con finitura opaca\.<\/p>/);
});

test('le schede hanno Acquista con etichetta accessibile e riflettono lo stato aggiunto', () => {
  const product = PRODUCTS.find(({ id }) => id === 1);
  const inactiveMarkup = renderProductDetailMarkup(product);
  const addedMarkup = renderProductDetailMarkup(product, false, true);
  const cardButton = renderAddToCartButton(product, false);
  const addedCardButton = renderAddToCartButton(product, true);

  assert.match(inactiveMarkup, />Acquista<\/button>/);
  assert.match(inactiveMarkup, /aria-label="Aggiungi Lampada Lume al carrello"/);
  assert.match(addedMarkup, /class="add-button product-detail-add-button is-added"/);
  assert.match(addedMarkup, />✓ Aggiunto<\/button>/);
  assert.match(cardButton, /aria-label="Aggiungi Lampada Lume al carrello"/);
  assert.match(cardButton, />Acquista<\/button>/);
  assert.match(addedCardButton, /class="add-button is-added"/);
  assert.match(addedCardButton, />✓ Aggiunto<\/button>/);
});

test('lo stato Aggiunto resta sincronizzato col carrello persistente e torna Acquista a quantità zero', () => {
  const product = PRODUCTS.find(({ id }) => id === 2);
  const storage = {
    value: JSON.stringify([{ id: product.id, quantity: 1 }]),
    getItem(key) {
      return key === CART_STORAGE_KEY ? this.value : null;
    },
    setItem(key, value) {
      if (key === CART_STORAGE_KEY) this.value = value;
    }
  };
  const restoredCart = restoreCart(storage);

  assert.equal(isItemInCart(restoredCart, product.id), true);
  assert.match(renderAddToCartButton(product, isItemInCart(restoredCart, product.id)), /✓ Aggiunto/);

  persistCart(storage, []);
  const emptyCart = restoreCart(storage);
  assert.equal(isItemInCart(emptyCart, product.id), false);
  assert.match(renderAddToCartButton(product, isItemInCart(emptyCart, product.id)), />Acquista<\/button>/);
});

test('il cuore della scheda ha stato e nome accessibile e resta accanto al prezzo', () => {
  const product = PRODUCTS.find(({ id }) => id === 1);
  const inactiveMarkup = renderProductDetailMarkup(product);
  const activeMarkup = renderProductDetailMarkup(product, true);

  assert.match(inactiveMarkup, /class="favorite-button "/);
  assert.match(inactiveMarkup, /aria-label="Aggiungi Lampada Lume ai preferiti"/);
  assert.match(inactiveMarkup, /aria-pressed="false"/);
  assert.match(activeMarkup, /aria-label="Rimuovi Lampada Lume dai preferiti"/);
  assert.match(activeMarkup, /aria-pressed="true"/);
  assert.match(inactiveMarkup, /product-detail-price-row/);
  assert.ok(inactiveMarkup.indexOf('€') < inactiveMarkup.indexOf('favorite-button'));
});

test('il cuore del catalogo è un pulsante accessibile e gli articoli si aggiungono e rimuovono', () => {
  const product = PRODUCTS.find(({ id }) => id === 4);
  const inactiveMarkup = renderFavoriteButtonMarkup(product, false);
  const activeMarkup = renderFavoriteButtonMarkup(product, true);

  assert.match(inactiveMarkup, /<button/);
  assert.match(inactiveMarkup, /aria-label="Aggiungi Vaso Duna ai preferiti"/);
  assert.match(inactiveMarkup, /aria-pressed="false"/);
  assert.match(activeMarkup, /aria-label="Rimuovi Vaso Duna dai preferiti"/);
  assert.deepEqual(toggleFavoriteId([], product.id), [product.id]);
  assert.deepEqual(toggleFavoriteId([product.id], product.id), []);
});

test('i preferiti vengono mantenuti in localStorage e i prodotti rimossi dal catalogo vengono ignorati', () => {
  const storage = {
    values: new Map([[FAVORITES_STORAGE_KEY, JSON.stringify([4, 6, 999, 4])]]),
    getItem(key) {
      return this.values.get(key) ?? null;
    }
  };

  assert.deepEqual(readFavoriteIds(storage, PRODUCTS), [4, 6]);
  assert.deepEqual(readFavoriteIds({ getItem: () => null }, PRODUCTS), []);
});

test('la pagina Preferiti mostra nome e prezzo oppure il messaggio vuoto richiesto', () => {
  const markup = renderFavoritesMarkup(PRODUCTS.filter(({ id }) => [4, 6].includes(id)));

  assert.match(markup, /Vaso Duna/);
  assert.ok(markup.includes(formatCurrency(34)));
  assert.match(markup, /Cornice Atelier/);
  assert.ok(markup.includes(formatCurrency(29)));
  assert.equal(renderFavoritesMarkup([]), `<p class="empty-favorites">${EMPTY_FAVORITES_MESSAGE}</p>`);
});

test('la scheda di Lampada Lume mostra nome, prezzo di 89 euro e descrizione', () => {
  const product = PRODUCTS.find(({ name }) => name === 'Lampada Lume');
  const markup = renderProductDetailMarkup(product);

  assert.match(markup, /<h2 id="product-detail-title">Lampada Lume<\/h2>/);
  assert.ok(markup.includes(`<p class="price">${formatCurrency(89)}</p>`));
  assert.match(markup, /<p class="product-detail-description">Paralume in lino e base in metallo\. Luce calda e diffusa\.<\/p>/);
});

test('il catalogo usa le descrizioni aggiornate per tutti gli articoli', () => {
  assert.deepEqual(
    PRODUCTS.map(({ name, description }) => ({ name, description })),
    [
      { name: 'Lampada Lume', description: 'Paralume in lino e base in metallo. Luce calda e diffusa.' },
      { name: 'Specchio Orbita', description: 'Specchio tondo con bordo sottile in metallo.' },
      { name: 'Portavaso Trama', description: 'Intreccio in rattan naturale con fondo impermeabile.' },
      { name: 'Vaso Duna', description: 'Ceramica smaltata a mano con finitura opaca.' },
      { name: 'Candela Vaniglia', description: 'Cera vegetale in vasetto di vetro riutilizzabile.' },
      { name: 'Cornice Atelier', description: 'Profilo in legno con vetro antiriflesso.' }
    ]
  );
});

test('Indietro torna al catalogo mantenendo la categoria scelta', () => {
  const view = transitionCatalogView(
    { category: 'cornici', selectedProductId: 6 },
    { type: 'back-to-catalog' }
  );

  assert.equal(view.selectedProductId, null);
  assert.equal(view.category, 'cornici');
  assert.equal(filterProducts(PRODUCTS, { category: view.category }).length, 1);
});

test('ordina per prezzo crescente', () => {
  const filtered = filterProducts(PRODUCTS, { sort: 'price-asc' });

  assert.ok(filtered[0].price <= filtered[1].price);
});

test('calcola subtotale, spedizione e totale', () => {
  const cart = [
    { id: 1, name: 'Lampada Lume', price: 89, quantity: 1 },
    { id: 6, name: 'Cornice Atelier', price: 29, quantity: 1 }
  ];

  const totals = calculateCartTotal(cart);

  assert.equal(totals.subtotal, 118);
  assert.equal(totals.shipping, 0);
  assert.equal(totals.total, 118);
  assert.equal(totals.itemCount, 2);
});
