/**
 * AI Preview Dialog Module
 *
 * Shows preview of AI-generated content before applying.
 * Used for destructive operations (replace all categories, replace all clues, etc.)
 */

class AIPreviewDialog {
  constructor() {
    this.dialog = null;
    this.onConfirm = null;
    this.onCancel = null;
  }

  /**
   * Show preview dialog
   * @param {object} data - AI-generated data
   * @param {object} options - Dialog options
   * @param {string} options.type - Prompt type identifier
   * @param {object} options.data - The actual data to preview
   * @param {function} options.onConfirm - Callback when user clicks Apply
   * @param {function} options.onCancel - Callback when user clicks Cancel
   */
  show(data, { type, data: previewData, onConfirm, onCancel }) {
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;

    // Remove existing dialog if present
    const existing = document.getElementById('aiPreviewDialog');
    if (existing) existing.remove();

    // Create dialog HTML
    const dialogHTML = `
      <dialog id="aiPreviewDialog" class="dialog ai-preview-dialog">
        <form method="dialog" class="dialogCard">
          <div class="dialogHeader">
            <div class="dialogMeta">
              <div class="dialogCategory">🪄 AI Preview</div>
              <div class="preview-type">${this.getTypeLabel(type)}</div>
            </div>
            <button class="iconBtn" value="cancel" type="button" aria-label="Close">✕</button>
          </div>

          <div class="preview-content">
            ${this.renderPreview(type, previewData)}
          </div>

          <div class="dialogActions">
            <button class="btn btnSecondary" value="cancel" type="button">Cancel</button>
            <button class="btn btnPrimary" value="confirm" type="button">Apply</button>
          </div>
        </form>
      </dialog>
    `;

    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    this.dialog = document.getElementById('aiPreviewDialog');
    this.setupListeners();
    this.dialog.showModal();
  }

  getTypeLabel(type) {
    const labels = {
      'categories-generate': 'Generate All Categories',
      'category-replace-all': 'Replace All Clues',
      'category-generate-clues': 'Generate Missing Clues',
      'questions-generate-five': 'Generate 5 Questions',
    };
    return labels[type] || 'AI Generation';
  }

  renderPreview(type, data) {
    switch (type) {
      case 'categories-generate':
        return this.renderCategoriesPreview(data.categories);

      case 'category-replace-all':
        return this.renderSingleCategoryPreview(data.category);

      case 'category-generate-clues':
        return this.renderCluesListPreview(data.clues);

      case 'questions-generate-five':
        return this.renderCluesListPreview(data.clues);

      default:
        return `<pre>${this.escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
    }
  }

  renderCategoriesPreview(categories) {
    return categories.map((cat, i) => `
      <div class="preview-category">
        <h4>${i + 1}. ${this.escapeHtml(cat.title)}</h4>
        <ul>
          ${cat.clues.map(clue => `
            <li>
              <span class="clue-value">$${clue.value}</span>
              <span class="clue-text">${this.escapeHtml(clue.clue)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');
  }

  renderSingleCategoryPreview(category) {
    return `
      <div class="preview-category">
        <h4>${this.escapeHtml(category.title)}</h4>
        <ul>
          ${category.clues.map(clue => `
            <li>
              <span class="clue-value">$${clue.value}</span>
              <span class="clue-text">${this.escapeHtml(clue.clue)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  renderCluesListPreview(clues) {
    return `
      <div class="preview-category">
        <ul>
          ${clues.map(clue => `
            <li>
              <span class="clue-value">$${clue.value}</span>
              <span class="clue-text">${this.escapeHtml(clue.clue)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  setupListeners() {
    const confirmBtn = this.dialog.querySelector('[value="confirm"]');
    const cancelBtn = this.dialog.querySelector('[value="cancel"]');
    const closeBtn = this.dialog.querySelector('.iconBtn');

    confirmBtn.addEventListener('click', () => {
      this.dialog.close();
      if (this.onConfirm) this.onConfirm();
    });

    const cancelHandler = () => {
      this.dialog.close();
      if (this.onCancel) this.onCancel();
    };

    cancelBtn.addEventListener('click', cancelHandler);
    closeBtn.addEventListener('click', cancelHandler);

    this.dialog.addEventListener('close', () => {
      setTimeout(() => {
        if (this.dialog && this.dialog.parentNode) {
          this.dialog.remove();
        }
      }, 100);
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Singleton instance
const aiPreview = new AIPreviewDialog();
