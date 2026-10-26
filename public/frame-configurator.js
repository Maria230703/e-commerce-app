import {
  calculateFramePriceCents,
  describeFrameSelection,
  formatFramePrice,
  FRAME_OPTIONS
} from './frame-logic.js';

function renderOptionGroup(group, title, selection) {
  const options = FRAME_OPTIONS[group].map(({ value, label }) => `
    <button
      class="frame-option${selection[group] === value ? ' is-selected' : ''}"
      type="button"
      data-frame-option="${group}"
      data-frame-value="${value}"
      aria-pressed="${selection[group] === value}"
    >${label}</button>
  `).join('');

  return `
    <fieldset class="frame-option-group">
      <legend>${title}</legend>
      <div class="frame-option-list">${options}</div>
    </fieldset>
  `;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

export function renderFrameConfiguratorMarkup(selection, photo = null, photoError = '') {
  const measure = FRAME_OPTIONS.measure.find(({ value }) => value === selection.measure);
  const profile = FRAME_OPTIONS.profile.find(({ value }) => value === selection.profile);
  const mat = FRAME_OPTIONS.mat.find(({ value }) => value === selection.mat);
  const previewContent = photo
    ? `<div class="frame-photo"><img src="${photo.url}" alt="La tua foto nella cornice"></div>`
    : '<div class="frame-photo"><span>La tua foto</span></div>';
  const preview = mat.color
    ? `<div class="frame-mat" style="--mat-color: ${mat.color}">${previewContent}</div>`
    : previewContent;
  const summary = photo
    ? `${describeFrameSelection(selection)}, Stampa foto su carta fotografica: omaggio`
    : describeFrameSelection(selection);

  return `
    <section class="frame-configurator" aria-labelledby="frame-configurator-title">
      <a class="back-button frame-back-link" href="/scopri">Indietro</a>
      <h2 id="frame-configurator-title">Crea la tua cornice</h2>
      <div class="frame-configurator-content">
        <div class="frame-preview-column">
          <div
            class="frame-preview"
            role="img"
            aria-label="Anteprima cornice, profilo ${profile.label}, misura ${measure.label} cm${mat.color ? `, passe-partout ${mat.label}` : ', senza passe-partout'}"
            style="--frame-color: #6B4A32; --frame-border-width: ${profile.borderWidth}px; --frame-ratio: ${measure.width} / ${measure.height}"
          >${preview}</div>
          <p class="frame-summary" aria-live="polite">${summary}</p>
          ${photo ? `
            <p class="frame-photo-name">Foto: ${escapeHtml(photo.name)}</p>
            <p class="frame-print-type">Tipo di stampa: Carta fotografica</p>
            <button class="back-button frame-remove-photo" type="button">Rimuovi foto</button>
          ` : ''}
          <input class="frame-photo-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Scegli una foto">
          <button class="back-button frame-upload-photo" type="button">Carica la tua foto</button>
          <p class="frame-print-included">Stampa su carta fotografica inclusa nel prezzo</p>
          <p class="frame-photo-error" role="alert"${photoError ? '' : ' hidden'}>${escapeHtml(photoError)}</p>
          <button class="add-button frame-add-button" type="button" aria-label="Aggiungi cornice su misura al carrello" aria-pressed="false">
            Aggiungi
          </button>
        </div>
        <div class="frame-options">
          ${renderOptionGroup('measure', 'Misura (cm)', selection)}
          ${renderOptionGroup('profile', 'Profilo', selection)}
          ${renderOptionGroup('mat', 'Passe-partout', selection)}
          <p class="frame-price" aria-live="polite">
            <span>Prezzo</span>
            <strong>${formatFramePrice(calculateFramePriceCents(selection))}</strong>
          </p>
        </div>
      </div>
    </section>
  `;
}
