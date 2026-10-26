import {
  CATEGORIES,
  PRODUCTS,
  filterProducts,
  formatCurrency,
  formatCurrencyCents,
  calculateCartTotalCents,
  transitionCatalogView
} from '/catalog-logic.js';
import { PRODUCT_GALLERY_IMAGES, renderProductDetailMarkup } from '/product-detail.js';
import { renderAddToCartButton } from '/cart-ui.js';
import { renderLookScene } from '/look-scene.js';
import {
  describeFrameSelection,
  INITIAL_FRAME_SELECTION,
  validateFramePhoto
} from '/frame-logic.js';
import { renderFrameConfiguratorMarkup } from '/frame-configurator.js';
import { validateCardPayment, validateShippingAddress } from '/payment-logic.js';
import { renderCartPageMarkup, renderPaymentPageMarkup } from '/payment-ui.js';
import {
  calculateDiscountedCartTotals,
  COUPON_CODE,
  COUPON_MINIMUM_SUBTOTAL_CENTS,
  validateCouponCode
} from '/coupon-logic.js';
import {
  createFrameCartItem,
  getFrameCartId,
  isItemInCart,
  persistCart as saveCart,
  restoreCart
} from '/cart-logic.js';
import {
  FAVORITES_STORAGE_KEY,
  readFavoriteIds,
  renderFavoriteButtonMarkup,
  renderFavoritesMarkup,
  toggleFavoriteId
} from '/favorites.js?v=20261025-favorites-black-2';

const state = {
  products: PRODUCTS,
  search: '',
  category: 'all',
  sort: 'featured',
  selectedProductId: null,
  selectedProductImageIndex: 0,
  frameSelection: { ...INITIAL_FRAME_SELECTION },
  framePhoto: null,
  framePhotoError: '',
  favoriteIds: readFavoriteIds(window.localStorage, PRODUCTS),
  cart: restoreCart(window.localStorage, PRODUCTS),
  selectedPaymentMethod: '',
  shippingAddress: {},
  paymentErrors: {},
  paymentStage: 'form',
  orderSubmitting: false,
  couponCode: window.localStorage.getItem('e-commerce-coupon') ?? '',
  couponInput: '',
  couponMessage: ''
};

const isFavoritesPage = window.location.pathname === '/preferiti';
const isFrameConfiguratorPage = window.location.pathname === '/configuratore-cornice';
const isCartPage = window.location.pathname === '/carrello';
const isPaymentPage = window.location.pathname === '/pagamento';
const isLandingPage = window.location.pathname === '/' || window.location.pathname === '/scopri';
document.body.classList.toggle('landing-page', isLandingPage);
const pageTitle = document.querySelector('#page-title');
const layout = document.querySelector('.layout');
const lookSceneContainer = document.querySelector('#look-scene-container');
const productList = document.querySelector('#product-list');
const cartPanel = document.querySelector('.cart-panel');
const categoryFilters = document.querySelector('#category-filters');
const toolbar = document.querySelector('.toolbar');
const searchInput = document.querySelector('#search-input');
const sortSelect = document.querySelector('#sort-select');
const cartItems = document.querySelector('#cart-items');
const subtotalEl = document.querySelector('#subtotal');
const shippingEl = document.querySelector('#shipping');
const totalEl = document.querySelector('#total');
const cartCountEl = document.querySelector('#cart-count');
const itemsCountEl = document.querySelector('#items-count');
const favoritesCountEl = document.querySelector('#favorites-count');
const checkoutButton = document.querySelector('#cart-checkout-button');
const couponContainer = document.querySelector('#coupon-container');
const couponCopy = document.querySelector('#coupon-copy');
const couponCopyFeedback = document.querySelector('#coupon-copy-feedback');

function persistCart() {
  saveCart(window.localStorage, state.cart);
}

function parseCartItemId(value) {
  return value.startsWith('frame:') ? value : Number(value);
}

function refreshCurrentCartView() {
  renderCart();
  if (isCartPage) {
    renderCartPage();
  } else if (isFrameConfiguratorPage) {
    renderFrameConfiguratorPage();
  } else if (!isPaymentPage && !isFavoritesPage) {
    renderProducts();
  }
}

function setCartQuantity(productId, change) {
  const item = state.cart.find(({ id }) => id === productId);
  if (!item) {
    return;
  }

  item.quantity += change;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(({ id }) => id !== productId);
  }
  persistCart();
  refreshCurrentCartView();
}

function renderFavoriteCount() {
  favoritesCountEl.textContent = String(state.favoriteIds.length);
}

function renderFavoritesPage() {
  pageTitle.textContent = 'Preferiti';
  lookSceneContainer.hidden = true;
  toolbar.hidden = true;
  categoryFilters.hidden = true;
  productList.innerHTML = `
    <div class="favorites-page">
      ${renderFavoritesMarkup(
        state.products.filter((product) => state.favoriteIds.includes(product.id))
      )}
      <a class="back-button favorites-back-link" href="/scopri">Torna a Scopri</a>
    </div>
  `;
}

function toggleFavorite(productId) {
  state.favoriteIds = toggleFavoriteId(state.favoriteIds, productId);
  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.favoriteIds));
  renderFavoriteCount();
  renderProducts();
}

function renderCategoryFilters() {
  categoryFilters.innerHTML = `${CATEGORIES.map(
    (category) => `
      <button
        type="button"
        class="filter-chip ${state.category === category.value ? 'active' : ''}"
        data-category="${category.value}"
      >
        ${category.label}
      </button>
    `
  ).join('')}
    <a class="frame-configurator-link" href="/configuratore-cornice">Crea la tua cornice</a>
  `;

  categoryFilters.querySelectorAll('.filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderCategoryFilters();
      renderProducts();
    });
  });
}

function renderFrameConfiguratorPage() {
  pageTitle.textContent = 'Crea la tua cornice';
  lookSceneContainer.hidden = true;
  toolbar.hidden = true;
  categoryFilters.hidden = true;
  cartPanel.hidden = true;
  layout.classList.add('frame-configurator-layout');
  productList.classList.add('frame-configurator-container');
  productList.innerHTML = renderFrameConfiguratorMarkup(
    state.frameSelection,
    state.framePhoto,
    state.framePhotoError
  );

  productList.querySelectorAll('.frame-option').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.frameOption;
      state.frameSelection[group] = button.dataset.frameValue;
      renderFrameConfiguratorPage();
    });
  });

  const photoInput = productList.querySelector('.frame-photo-input');
  productList.querySelector('.frame-upload-photo').addEventListener('click', () => {
    photoInput.click();
  });

  photoInput.addEventListener('change', () => {
    const [file] = photoInput.files;

    if (!file) {
      return;
    }

    const validationError = validateFramePhoto(file);

    if (validationError) {
      state.framePhotoError = validationError;
      renderFrameConfiguratorPage();
      return;
    }

    if (state.framePhoto) {
      URL.revokeObjectURL(state.framePhoto.url);
    }

    state.framePhoto = {
      name: file.name,
      url: URL.createObjectURL(file)
    };
    state.framePhotoError = '';
    renderFrameConfiguratorPage();
  });

  productList.querySelector('.frame-remove-photo')?.addEventListener('click', () => {
    URL.revokeObjectURL(state.framePhoto.url);
    state.framePhoto = null;
    state.framePhotoError = '';
    renderFrameConfiguratorPage();
  });

  const frameId = getFrameCartId(state.frameSelection);
  const frameInCart = isItemInCart(state.cart, frameId);
  const addFrameButton = productList.querySelector('.frame-add-button');
  addFrameButton.classList.toggle('is-added', frameInCart);
  addFrameButton.innerHTML = frameInCart
    ? '<svg class="add-button-check" aria-hidden="true" viewBox="0 0 16 16" focusable="false"><path d="m3 8 3.2 3.2L13 4.5"/></svg><span>Aggiunto</span>'
    : 'Aggiungi';
  addFrameButton.setAttribute('aria-label', frameInCart
    ? 'Rimuovi cornice su misura dal carrello'
    : 'Aggiungi cornice su misura al carrello');
  addFrameButton.setAttribute('aria-pressed', String(frameInCart));
  addFrameButton.addEventListener('click', () => {
    const selection = { ...state.frameSelection };
    const id = getFrameCartId(selection);
    const existingItem = state.cart.find((item) => item.id === id);
    if (existingItem) {
      state.cart = state.cart.filter((item) => item.id !== id);
    } else {
      state.cart.push(createFrameCartItem(selection));
    }
    persistCart();
    renderCart();
    renderFrameConfiguratorPage();
  });
}

function renderCartPage() {
  pageTitle.textContent = 'Il tuo carrello';
  lookSceneContainer.hidden = true;
  toolbar.hidden = true;
  categoryFilters.hidden = true;
  cartPanel.hidden = true;
  layout.classList.add('payment-layout');
  productList.classList.add('payment-page-container');
  productList.innerHTML = renderCartPageMarkup(state.cart, state.couponCode);

  productList.querySelectorAll('[data-cart-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = parseCartItemId(button.dataset.productId);
      if (button.dataset.cartAction === 'remove') {
        state.cart = state.cart.filter(({ id }) => id !== productId);
        persistCart();
        renderCart();
        renderCartPage();
      } else {
        setCartQuantity(productId, button.dataset.cartAction === 'increase' ? 1 : -1);
      }
    });
  });
}

function renderCouponAvailability(subtotalCents) {
  const hasEligibleSubtotal = subtotalCents > COUPON_MINIMUM_SUBTOTAL_CENTS;
  if (state.couponCode && (!hasEligibleSubtotal || validateCouponCode(state.couponCode, subtotalCents))) {
    state.couponCode = '';
    window.localStorage.removeItem('e-commerce-coupon');
  }
  if (!hasEligibleSubtotal) {
    state.couponEntryOpen = false;
    state.couponMessage = '';
  }

  couponContainer.hidden = !isLandingPage || state.selectedProductId !== null || !hasEligibleSubtotal;
}

function showOrderConfirmation(order) {
  state.cart = [];
  persistCart();
  renderCart();
  state.paymentStage = 'confirmation';
  state.paymentErrors = {
    orderNumber: order.number,
    orderStatus: order.status,
    totalCents: order.totalCents,
    customerName: order.address.name,
    customerSurname: order.address.surname,
    customerAddress: order.address.address,
    customerPostalCode: order.address.postalCode,
    customerCity: order.address.city,
    customerPhonePrefix: order.address.phonePrefix,
    customerPhone: order.address.phone,
    customerEmail: order.address.email,
    bankTransfer: order.paymentMethod === 'bank-transfer'
  };
  renderPaymentPage();
}

async function createOrder(paymentMethod) {
  if (state.orderSubmitting) {
    return;
  }

  state.orderSubmitting = true;
  state.paymentErrors = {};

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: state.cart.map(({ id, quantity, frameSelection }) => ({
          id,
          quantity,
          frameSelection
        })),
        address: state.shippingAddress,
        paymentMethod,
        couponCode: state.couponCode
      })
    });
    const result = await response.json();

    if (!response.ok) {
      state.orderSubmitting = false;
      state.paymentErrors.request = result.error || 'Non è stato possibile salvare l’ordine. Riprova.';
      state.paymentStage = 'form';
      renderPaymentPage();
      return;
    }

    showOrderConfirmation(result.order);
  } catch {
    state.orderSubmitting = false;
    state.paymentErrors.request = 'Non è stato possibile contattare il server. Riprova.';
    state.paymentStage = 'form';
    renderPaymentPage();
  }
}

function renderPaymentPage() {
  pageTitle.textContent = 'Pagamento';
  lookSceneContainer.hidden = true;
  toolbar.hidden = true;
  categoryFilters.hidden = true;
  cartPanel.hidden = true;
  layout.classList.add('payment-layout');
  productList.classList.add('payment-page-container');
  productList.innerHTML = renderPaymentPageMarkup({
    items: state.cart,
    selectedMethod: state.selectedPaymentMethod,
    errors: state.paymentErrors,
    stage: state.paymentStage,
    address: state.shippingAddress,
    couponCode: state.couponCode,
    couponInput: state.couponInput,
    couponError: state.couponMessage
  });

  if (state.paymentStage === 'confirmation' || !state.cart.length) {
    return;
  }

  const form = productList.querySelector('#payment-form');
  if (form) {
    const couponForm = productList.querySelector('#payment-coupon-form');
    const couponInput = couponForm.querySelector('[name="couponCode"]');
    couponForm.addEventListener('input', () => {
      state.couponInput = couponInput.value;
      state.couponMessage = '';
    });
    couponForm.addEventListener('submit', (event) => {
      event.preventDefault();
      state.couponInput = couponInput.value;
      const subtotalCents = calculateCartTotalCents(state.cart).subtotalCents;
      const error = validateCouponCode(state.couponInput, subtotalCents);
      if (error) {
        state.couponMessage = error;
        renderPaymentPage();
        return;
      }

      state.couponCode = COUPON_CODE;
      state.couponInput = COUPON_CODE;
      state.couponMessage = '';
      window.localStorage.setItem('e-commerce-coupon', COUPON_CODE);
      renderPaymentPage();
    });
    productList.querySelector('#coupon-remove')?.addEventListener('click', () => {
      state.couponCode = '';
      state.couponInput = '';
      state.couponMessage = '';
      window.localStorage.removeItem('e-commerce-coupon');
      renderPaymentPage();
    });

    form.querySelectorAll('#shipping-name, #shipping-surname, #shipping-address, #shipping-city, #shipping-postalCode, #shipping-phonePrefix, #shipping-phone, #shipping-email').forEach((input) => {
      const updateShippingAddress = () => {
        state.shippingAddress[input.name] = input.value;
        const fieldErrors = validateShippingAddress(state.shippingAddress);
        const error = input.id === 'shipping-phonePrefix'
          ? form.querySelector('#shipping-phone-prefix-error')
          : form.querySelector(`#${input.id === 'shipping-phone' ? 'shipping-phone-error' : input.id} + [role="alert"]`);
        if (error) {
          const errorMessage = input.name === 'phonePrefix' ? fieldErrors.phonePrefix : fieldErrors[input.name];
          error.textContent = errorMessage ?? '';
          error.hidden = !errorMessage;
        }
      };
      input.addEventListener('input', updateShippingAddress);
      input.addEventListener('change', updateShippingAddress);
    });

    form.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        state.selectedPaymentMethod = radio.value;
        state.paymentErrors = {};
        renderPaymentPage();
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      state.shippingAddress = {
        name: formData.get('name')?.toString() ?? '',
        surname: formData.get('surname')?.toString() ?? '',
        address: formData.get('address')?.toString() ?? '',
        city: formData.get('city')?.toString() ?? '',
        postalCode: formData.get('postalCode')?.toString() ?? '',
        phonePrefix: formData.get('phonePrefix')?.toString() ?? '',
        phone: formData.get('phone')?.toString() ?? '',
        email: formData.get('email')?.toString() ?? ''
      };
      state.selectedPaymentMethod = formData.get('paymentMethod')?.toString() ?? '';
      state.paymentErrors = validateShippingAddress(state.shippingAddress);

      if (!state.selectedPaymentMethod) {
        state.paymentErrors.paymentMethod = 'Scegli un metodo di pagamento';
      }

      if (Object.keys(state.paymentErrors).length > 0) {
        renderPaymentPage();
        return;
      }

      if (state.selectedPaymentMethod === 'card') {
        const cardError = validateCardPayment({
          number: formData.get('cardNumber')?.toString() ?? '',
          expiry: formData.get('cardExpiry')?.toString() ?? '',
          code: formData.get('cardCode')?.toString() ?? ''
        });
        if (cardError) {
          const alert = form.querySelector('.payment-card-general-error');
          alert.textContent = cardError;
          alert.hidden = false;
          return;
        }
        createOrder('card');
      } else if (state.selectedPaymentMethod === 'paypal') {
        state.paymentStage = 'paypal-approval';
        renderPaymentPage();
      } else {
        createOrder('bank-transfer');
      }
    });
  }

  productList.querySelector('.paypal-approve')?.addEventListener('click', () => {
    createOrder('paypal');
  });
}

function renderProducts() {
  renderCouponAvailability(calculateCartTotalCents(state.cart).subtotalCents);
  if (isFavoritesPage) {
    renderFavoritesPage();
    return;
  }

  if (isFrameConfiguratorPage) {
    renderFrameConfiguratorPage();
    return;
  }

  if (isCartPage) {
    renderCartPage();
    return;
  }

  if (isPaymentPage) {
    renderPaymentPage();
    return;
  }

  if (state.selectedProductId !== null) {
    const product = state.products.find((item) => item.id === state.selectedProductId);

    if (product) {
      lookSceneContainer.hidden = true;
      renderProductDetail(product);
      return;
    }

    state.selectedProductId = null;
  }

  pageTitle.textContent = 'Scopri';
  productList.classList.remove('product-detail-list');
  lookSceneContainer.hidden = false;
  toolbar.hidden = false;
  categoryFilters.hidden = false;
  cartPanel.hidden = true;
  layout.classList.add('cart-panel-hidden');
  layout.classList.remove('frame-configurator-layout');
  productList.classList.remove('frame-configurator-container');

  const filteredProducts = filterProducts(state.products, {
    search: state.search,
    category: state.category,
    sort: state.sort
  });

  if (!filteredProducts.length) {
    productList.innerHTML = '<div class="empty-cart">Nessun prodotto trovato con i filtri correnti.</div>';
    return;
  }

  productList.innerHTML = filteredProducts.map((product) => {
    const mainImage = PRODUCT_GALLERY_IMAGES[product.id]?.[0];

    return `
      <article class="product-card">
        <button class="product-detail-button" type="button" data-product-id="${product.id}">
          <div class="product-image" data-product-id="${product.id}">
            ${mainImage ? `<img src="${encodeURI(mainImage)}" alt="">` : ''}
          </div>
          <div class="product-body">
            <div class="product-top">
              <span class="badge">${product.badge}</span>
            </div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
          </div>
        </button>
        <div class="product-footer">
          <span class="price">${formatCurrency(product.price)}</span>
          <div class="product-footer-actions">
            ${renderAddToCartButton(product, isItemInCart(state.cart, product.id))}
            ${renderFavoriteButtonMarkup(product, state.favoriteIds.includes(product.id))}
          </div>
        </div>
      </article>
    `;
  }).join('');

  productList.querySelectorAll('.product-detail-button').forEach((button) => {
    button.addEventListener('click', () => {
      Object.assign(
        state,
        transitionCatalogView(state, {
          type: 'open-product',
          productId: Number(button.dataset.productId)
        })
      );
      state.selectedProductImageIndex = 0;
      renderProducts();
    });
  });

  productList.querySelectorAll('.add-button').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = parseCartItemId(button.dataset.productId);
      const product = state.products.find((item) => item.id === productId);

      if (!product) {
        return;
      }

      toggleProductInCart(product);
      renderProducts();
    });
  });

  productList.querySelectorAll('.favorite-button').forEach((button) => {
    button.addEventListener('click', () => {
      toggleFavorite(Number(button.dataset.favoriteProductId));
    });
  });
}

function openProduct(productId) {
  Object.assign(
    state,
    transitionCatalogView(state, {
      type: 'open-product',
      productId
    })
  );
  state.selectedProductImageIndex = 0;
  renderProducts();
}

function renderProductDetail(product) {
  pageTitle.textContent = product.name;
  productList.classList.add('product-detail-list');
  toolbar.hidden = true;
  categoryFilters.hidden = true;

  productList.innerHTML = renderProductDetailMarkup(
    product,
    state.favoriteIds.includes(product.id),
    isItemInCart(state.cart, product.id),
    state.selectedProductImageIndex
  );

  const galleryImages = PRODUCT_GALLERY_IMAGES[product.id] ?? [];
  const selectGalleryImage = (index) => {
    if (!galleryImages.length) {
      return;
    }

    state.selectedProductImageIndex = (index + galleryImages.length) % galleryImages.length;
    const mainImage = productList.querySelector('[data-gallery-main-image]');
    mainImage.src = encodeURI(galleryImages[state.selectedProductImageIndex]);
    mainImage.alt = `${product.name}, foto ${state.selectedProductImageIndex + 1} di ${galleryImages.length}`;

    productList.querySelectorAll('[data-gallery-index]').forEach((thumbnail) => {
      const selected = Number(thumbnail.dataset.galleryIndex) === state.selectedProductImageIndex;
      thumbnail.classList.toggle('is-selected', selected);
      thumbnail.setAttribute('aria-pressed', String(selected));
    });
  };

  productList.querySelectorAll('[data-gallery-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.galleryAction === 'next' ? 1 : -1;
      selectGalleryImage(state.selectedProductImageIndex + direction);
    });
  });

  productList.querySelectorAll('[data-gallery-index]').forEach((button) => {
    button.addEventListener('click', () => {
      selectGalleryImage(Number(button.dataset.galleryIndex));
    });
  });

  productList.querySelector('.back-button').addEventListener('click', () => {
    Object.assign(state, transitionCatalogView(state, { type: 'back-to-catalog' }));
    renderProducts();
  });

  productList.querySelector('.favorite-button').addEventListener('click', () => {
    toggleFavorite(product.id);
  });

  productList.querySelector('.product-detail-add-button').addEventListener('click', () => {
    toggleProductInCart(product);
    renderProductDetail(product);
  });
}

function toggleProductInCart(product) {
  const existingItem = state.cart.find((item) => item.id === product.id);
  if (existingItem) {
    state.cart = state.cart.filter((item) => item.id !== product.id);
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }
  persistCart();
  renderCart();
}

lookSceneContainer.innerHTML = renderLookScene();
lookSceneContainer.querySelectorAll('.look-hotspot').forEach((button) => {
  button.addEventListener('click', () => {
    openProduct(Number(button.dataset.productId));
  });
});

function renderCart() {
  const itemCount = state.cart.reduce((count, item) => count + item.quantity, 0);
  const { subtotalCents } = calculateCartTotalCents(state.cart);
  renderCouponAvailability(subtotalCents);
  const { shippingCents, discountCents, totalCents } = calculateDiscountedCartTotals(
    state.cart,
    state.couponCode
  );

  if (!state.cart.length) {
    cartItems.innerHTML = '<div class="empty-cart">Il carrello è vuoto.</div>';
  } else {
    cartItems.innerHTML = state.cart.map((item) => `
      <div class="cart-item">
        <div class="cart-item-name">
          <strong>${item.name}</strong>
          ${item.frameDescription ? `<span>${item.frameDescription}</span>` : ''}
          <span>Qtà: ${item.quantity}</span>
        </div>
        <div class="cart-item-price">
          <strong>${formatCurrencyCents(Math.round(item.price * 100) * item.quantity)}</strong>
          <button class="cart-quantity-button" type="button" data-cart-action="decrease" data-product-id="${item.id}" aria-label="Diminuisci ${item.name}">−</button>
          <button class="cart-quantity-button" type="button" data-cart-action="increase" data-product-id="${item.id}" aria-label="Aumenta ${item.name}">+</button>
          <button class="cart-remove-button" type="button" data-cart-action="remove" data-product-id="${item.id}">Rimuovi</button>
        </div>
      </div>
      `).join('');
  }

  subtotalEl.textContent = formatCurrencyCents(subtotalCents);
  shippingEl.textContent = formatCurrencyCents(shippingCents);
  let discountRow = document.querySelector('#cart-discount');
  if (discountCents > 0) {
    if (!discountRow) {
      discountRow = document.createElement('div');
      discountRow.id = 'cart-discount';
      discountRow.className = 'row';
      discountRow.innerHTML = '<span>Sconto coupon</span><strong></strong>';
      totalEl.closest('.totals').insertBefore(discountRow, totalEl.closest('.total-row'));
    }
    discountRow.querySelector('strong').textContent = `−${formatCurrencyCents(discountCents)}`;
  } else {
    discountRow?.remove();
  }
  totalEl.textContent = formatCurrencyCents(totalCents);
  cartCountEl.textContent = String(itemCount);
  itemsCountEl.textContent = `${itemCount} articoli`;
  checkoutButton.hidden = state.cart.length === 0;

  cartItems.querySelectorAll('[data-cart-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const productId = parseCartItemId(button.dataset.productId);
        if (button.dataset.cartAction === 'remove') {
          state.cart = state.cart.filter(({ id }) => id !== productId);
          persistCart();
          refreshCurrentCartView();
        } else {
          setCartQuantity(productId, button.dataset.cartAction === 'increase' ? 1 : -1);
        }
      });
  });
}

searchInput.addEventListener('input', (event) => {
  state.search = event.target.value;
  renderProducts();
});

sortSelect.addEventListener('change', (event) => {
  state.sort = event.target.value;
  renderProducts();
});

renderCategoryFilters();
renderFavoriteCount();
renderProducts();
renderCart();

couponCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(COUPON_CODE);
    couponCopyFeedback.textContent = 'Codice ESEMPIO10 copiato. Incollalo nella pagina di pagamento.';
    couponCopyFeedback.hidden = false;
  } catch {
    couponCopyFeedback.textContent = 'Non è stato possibile copiare il codice. Inserisci ESEMPIO10 nella pagina di pagamento.';
    couponCopyFeedback.hidden = false;
  }
});
