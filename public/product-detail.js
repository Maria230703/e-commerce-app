import { formatCurrency } from '../catalog-logic.js';
import { renderFavoriteButtonMarkup } from './favorites.js?v=20261025-favorites-black-2';

export const PRODUCT_GALLERY_IMAGES = {
  1: [
    '/images/lampada 1.jpg',
    '/images/lampada 2.jpg',
    '/images/lampada.jpg',
    '/images/lampada 4.jpg'
  ],
  2: ['/images/specchio 1.jpg', '/images/specchio 2.jpg'],
  3: ['/images/portavaso 1.jpg', '/images/portavaso 2.jpg', '/images/portavaso 3.jpg'],
  4: ['/images/vaso 1.jpg', '/images/vaso 2.jpg', '/images/vaso 3.jpg'],
  5: ['/images/candela 1.jpg', '/images/candela 2.jpg', '/images/candela 3.jpg'],
  6: ['/images/immagine cornice 1.jpg', '/images/immagine cornice 2.jpg']
};

const PRODUCT_MATERIALS = {
  1: 'lino, metallo, porta lampadina in acciaio inox',
  2: 'metallo, vetro, retro in truciolato',
  3: 'rattan naturale, fondo impermeabile',
  4: 'ceramica smaltata',
  5: 'cera vegetale, vasetto in vetro',
  6: 'plastica, vetro antiriflesso, retro in sughero, ganci in acciaio'
};

const PRODUCT_DIMENSIONS = {
  1: 'altezza 45 cm, diametro paralume 28 cm, diametro base 16 cm',
  2: 'diametro 100 cm',
  3: 'diametro esterno 34 cm, diametro interno 27 cm, altezza 33 cm',
  4: 'altezza 30 cm, diametro pancia 22 cm, imboccatura 13 cm, base 11 cm',
  5: 'altezza 10 cm, diametro 8,5 cm, peso della cera 275 g',
  6: '40 x 60 cm'
};

function renderProductGallery(product, activeImageIndex) {
  const images = PRODUCT_GALLERY_IMAGES[product.id];
  if (!images) {
    return '';
  }

  const selectedIndex = ((activeImageIndex % images.length) + images.length) % images.length;

  return `
    <section class="product-gallery" aria-label="Galleria immagini ${product.name}">
      <div class="product-gallery-main">
        <button class="product-gallery-arrow" type="button" data-gallery-action="previous" aria-label="Foto precedente">‹</button>
        <img
          class="product-gallery-image"
          src="${encodeURI(images[selectedIndex])}"
          alt="${product.name}, foto ${selectedIndex + 1} di ${images.length}"
          data-gallery-main-image
        >
        <button class="product-gallery-arrow" type="button" data-gallery-action="next" aria-label="Foto successiva">›</button>
      </div>
      <div class="product-gallery-thumbnails" aria-label="Seleziona una foto">
        ${images.map((image, index) => `
          <button
            class="product-gallery-thumbnail${index === selectedIndex ? ' is-selected' : ''}"
            type="button"
            data-gallery-index="${index}"
            aria-label="Mostra foto ${index + 1}"
            aria-pressed="${index === selectedIndex}"
          >
            <img src="${encodeURI(image)}" alt="">
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

export function renderProductDetailMarkup(product, isFavorite = false, isAddedToCart = false, activeImageIndex = 0) {
  return `
    <section class="product-detail" aria-labelledby="product-detail-title">
      <button class="back-button" type="button">Indietro</button>
      ${renderProductGallery(product, activeImageIndex)}
      <h2 id="product-detail-title">${product.name}</h2>
      <div class="product-detail-price-row">
        <p class="price">${formatCurrency(product.price)}</p>
        ${renderFavoriteButtonMarkup(product, isFavorite)}
      </div>
      <div class="product-detail-information" aria-label="Informazioni prodotto">
        <p class="product-detail-information-row"><strong>Descrizione:</strong> ${product.description}</p>
        <p class="product-detail-information-row"><strong>Materiali:</strong> ${PRODUCT_MATERIALS[product.id]}</p>
        <p class="product-detail-information-row"><strong>Dimensioni:</strong> ${PRODUCT_DIMENSIONS[product.id]}</p>
        <p class="product-detail-information-row">Made in Italy</p>
      </div>
      <button
        class="add-button product-detail-add-button${isAddedToCart ? ' is-added' : ''}"
        type="button"
        data-product-id="${product.id}"
        aria-label="Aggiungi ${product.name} al carrello"
      >${isAddedToCart ? '✓ Aggiunto' : 'Acquista'}</button>
    </section>
  `;
}
