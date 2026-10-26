export function renderAddToCartButton(product, isAdded, options = {}) {
  const className = options.className ? ` ${options.className}` : '';
  const ariaLabel = options.ariaLabel ?? (
    isAdded
      ? `Rimuovi ${product.name} dal carrello`
      : `Aggiungi ${product.name} al carrello`
  );
  return `
    <button
      class="add-button${isAdded ? ' is-added' : ''}${className}"
      type="button"
      data-product-id="${product.id}"
      aria-label="${ariaLabel}"
      aria-pressed="${isAdded}"
    >${isAdded
      ? '<svg class="add-button-check" aria-hidden="true" viewBox="0 0 16 16" focusable="false"><path d="m3 8 3.2 3.2L13 4.5"/></svg><span>Aggiunto</span>'
      : 'Aggiungi'}</button>
  `;
}
