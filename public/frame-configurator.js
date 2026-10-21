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

export function renderFrameConfiguratorMarkup(selection) {
  const measure = FRAME_OPTIONS.measure.find(({ value }) => value === selection.measure);
  const finish = FRAME_OPTIONS.finish.find(({ value }) => value === selection.finish);
  const profile = FRAME_OPTIONS.profile.find(({ value }) => value === selection.profile);
  const mat = FRAME_OPTIONS.mat.find(({ value }) => value === selection.mat);
  const previewContent = `
    <div class="frame-photo">
      <span>La tua foto</span>
    </div>
  `;
  const preview = mat.color
    ? `<div class="frame-mat" style="--mat-color: ${mat.color}">${previewContent}</div>`
    : previewContent;

  return `
    <section class="frame-configurator" aria-labelledby="frame-configurator-title">
      <a class="back-button frame-back-link" href="/scopri">Torna a Scopri</a>
      <h2 id="frame-configurator-title">Crea la tua cornice</h2>
      <div class="frame-configurator-content">
        <div class="frame-preview-column">
          <div
            class="frame-preview"
            role="img"
            aria-label="Anteprima cornice ${finish.label}, profilo ${profile.label}, misura ${measure.label} cm${mat.color ? `, passe-partout ${mat.label}` : ', senza passe-partout'}"
            style="--frame-color: ${finish.color}; --frame-border-width: ${profile.borderWidth}px; --frame-ratio: ${measure.width} / ${measure.height}"
          >${preview}</div>
          <p class="frame-summary" aria-live="polite">${describeFrameSelection(selection)}</p>
        </div>
        <div class="frame-options">
          ${renderOptionGroup('measure', 'Misura (cm)', selection)}
          ${renderOptionGroup('finish', 'Finitura', selection)}
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
