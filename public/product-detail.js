import { formatCurrency, PRODUCTS } from '../catalog-logic.js';
import { renderFavoriteButtonMarkup } from './favorites.js';

const lampGalleryImages = [
  '/product-images/lampada-lume-1.svg',
  '/product-images/lampada-lume-2.svg',
  '/product-images/lampada-lume-3.svg',
  '/product-images/lampada-lume-4.svg'
];

const galleryPalettes = [
  { background: '#e9e5db', surface: '#c9bba5', accent: '#52604d' },
  { background: '#e5ddd2', surface: '#b99875', accent: '#39463b' },
  { background: '#e4e8dd', surface: '#c5b9a6', accent: '#46553a' },
  { background: '#eee8dc', surface: '#bfae98', accent: '#665747' }
];

const productIllustrations = {
  2: `
    <ellipse cx="320" cy="360" rx="112" ry="16" fill="#6b675f" opacity=".2"/>
    <circle cx="320" cy="210" r="112" fill="#b99d76"/>
    <circle cx="320" cy="210" r="96" fill="#f4f0e8"/>
    <circle cx="320" cy="210" r="82" fill="#d9e1dc"/>
    <path d="M320 292v48m-38 13h76" stroke="#7b684f" stroke-width="12" stroke-linecap="round"/>
    <path d="M258 170c34-42 91-53 128-19" fill="none" stroke="#fff" stroke-width="7" opacity=".45"/>
  `,
  3: `
    <path d="M320 195c-42-57-79-57-93-52 8 48 43 73 93 66m0-14c33-68 75-75 94-67-7 49-42 78-94 81m0-21c-15-87 12-124 31-136 23 45 15 91-31 136" fill="#718568"/>
    <path d="M320 190v97m0-64-39-48m41 41 44-52" stroke="#52604d" stroke-width="7" stroke-linecap="round"/>
    <path d="M236 270h168l-17 104H253z" fill="#b7875e"/>
    <path d="M250 289h141M255 315h132M260 341h122M274 275l-9 91m48-91-3 98m44-98 5 95" stroke="#e2c49c" stroke-width="6" opacity=".8"/>
  `,
  4: `
    <ellipse cx="320" cy="370" rx="95" ry="15" fill="#6b675f" opacity=".2"/>
    <path d="M292 155c0 41-25 55-43 89-25 47-12 124 71 124s96-77 71-124c-18-34-43-48-43-89z" fill="#c58d68"/>
    <ellipse cx="320" cy="155" rx="28" ry="9" fill="#8d644e"/>
    <path d="M282 282c22 16 54 18 78 3m-73 28c21 13 47 16 68 5" fill="none" stroke="#e8c5a5" stroke-width="6" opacity=".65"/>
    <path d="M320 155v-54m0 39-45-35m45 24 42-42" stroke="#52604d" stroke-width="5" stroke-linecap="round"/>
    <path d="M275 140c-22-3-31-19-26-34 19-3 32 9 34 29m68-26c4-19 19-28 34-22 0 18-12 29-31 30m-33 2c-12-18-8-36 7-44 14 12 14 28 2 44" fill="#78896c"/>
  `,
  5: `
    <ellipse cx="320" cy="370" rx="74" ry="13" fill="#6b675f" opacity=".2"/>
    <path d="M320 116c-33 39-28 62 0 82 28-20 33-43 0-82z" fill="#d99550"/>
    <path d="M320 143c-14 20-12 31 0 40 12-9 14-20 0-40z" fill="#f5d58b"/>
    <rect x="259" y="198" width="122" height="158" rx="24" fill="#e8dfcf" opacity=".85"/>
    <ellipse cx="320" cy="201" rx="61" ry="13" fill="#c6b69e"/>
    <path d="M270 233h100v92H270z" fill="#f4ede1" opacity=".7"/>
    <path d="M286 267h68m-56 17h44" stroke="#b29b7a" stroke-width="5" stroke-linecap="round"/>
    <path d="M283 349h74" stroke="#9c8970" stroke-width="7" stroke-linecap="round"/>
  `,
  6: `
    <ellipse cx="320" cy="370" rx="124" ry="16" fill="#6b675f" opacity=".2"/>
    <rect x="207" y="93" width="226" height="270" rx="7" fill="#9a7553"/>
    <rect x="226" y="112" width="188" height="232" fill="#f3eee4"/>
    <rect x="239" y="125" width="162" height="206" fill="#d9e1dc"/>
    <path d="M239 277c36-63 61-72 83-27 18-37 47-42 79 9v72H239z" fill="#87927a"/>
    <circle cx="348" cy="184" r="22" fill="#e9d6ae"/>
    <path d="M239 291c39-19 75-18 112 0m-79 21c24-11 48-11 71 0" fill="none" stroke="#f3eee4" stroke-width="5" opacity=".8"/>
  `
};

function createGalleryIllustration(productId, imageIndex) {
  const palette = galleryPalettes[imageIndex];
  const rotation = [-4, -1, 2, 5][imageIndex];
  const illustration = productIllustrations[productId];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <rect width="640" height="480" rx="24" fill="${palette.background}"/>
      <rect y="380" width="640" height="100" fill="${palette.surface}"/>
      <path d="M0 380h640" stroke="#fff" stroke-width="5" opacity=".24"/>
      <g transform="rotate(${rotation} 320 260)">
        ${illustration.replaceAll('#52604d', palette.accent)}
      </g>
      <path d="M44 58h130" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".35"/>
      <circle cx="568" cy="72" r="28" fill="#fff" opacity=".14"/>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const PRODUCT_GALLERY_IMAGES = Object.fromEntries(
  PRODUCTS.map((product) => [
    product.id,
    product.id === 1
      ? lampGalleryImages
      : Array.from({ length: 4 }, (_, index) => createGalleryIllustration(product.id, index))
  ])
);

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
          src="${images[selectedIndex]}"
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
            <img src="${image}" alt="">
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
      <p class="product-detail-description">${product.description}</p>
      <button
        class="add-button product-detail-add-button${isAddedToCart ? ' is-added' : ''}"
        type="button"
        data-product-id="${product.id}"
        aria-label="Aggiungi ${product.name} al carrello"
      >${isAddedToCart ? '✓ Aggiunto' : 'Acquista'}</button>
    </section>
  `;
}
