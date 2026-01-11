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
    this.onRegenerateItem = null; // Callback for regenerating individual items
    this.acceptedItems = new Set(); // Track accepted items by ID
    this.rejectedItems = new Set(); // Track rejected items by ID
    this.previewData = null; // Store preview data for regeneration
  }

  /**
   * Show preview dialog
   * @param {object} data - AI-generated data
   * @param {object} options - Dialog options
   * @param {string} options.type - Prompt type identifier
   * @param {object} options.data - The actual data to preview
   * @param {function} options.onConfirm - Callback when user clicks Apply
   * @param {function} options.onCancel - Callback when user clicks Cancel
   * @param {function} options.onRetry - Callback when user clicks Try Again (optional)
   * @param {function} options.onRegenerateItem - Callback for regenerating individual items
   * @param {object} options.context - Context for retry (theme, difficulty, etc.)
   */
  show(data, { type, data: previewData, onConfirm, onCancel, onRetry, onRegenerateItem, context }) {
    try {
      console.log('[aiPreview] show() called, type:', type, 'data:', data);
      this.onConfirm = onConfirm;
      this.onCancel = onCancel;
      this.onRetry = onRetry;
      this.onRegenerateItem = onRegenerateItem;
      this.context = context;
      this.selectedOption = null; // Reset selection
      this.dialogType = type; // Store dialog type
      this.previewData = previewData; // Store for regeneration
      this.acceptedItems.clear(); // Reset accepted items
      this.rejectedItems.clear(); // Reset rejected items

      // Auto-accept all items by default for better UX
      if (type === 'categories-generate') {
        previewData.categories.forEach((cat, i) => {
          this.acceptedItems.add(`cat-${i}`);
        });
      }

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
              ${this.onRetry ? '<button class="btn btnSecondary" value="retry" type="button">Try Again</button>' : ''}
              <button class="btn btnPrimary" value="confirm" type="button" ${type === 'game-title' ? 'disabled' : ''}>Apply</button>
            </div>
          </form>
        </dialog>
      `;

      document.body.insertAdjacentHTML('beforeend', dialogHTML);
      this.dialog = document.getElementById('aiPreviewDialog');
      console.log('[aiPreview] Dialog element:', this.dialog);
      this.setupListeners();
      console.log('[aiPreview] About to call showModal()');
      this.dialog.showModal();
      console.log('[aiPreview] showModal() completed');
    } catch (error) {
      console.error('[aiPreview] Error showing dialog:', error);
    }
  }

  getTypeLabel(type) {
    const labels = {
      'game-title': 'Generate Title & Subtitle',
      'categories-generate': 'Generate All Categories',
      'category-replace-all': 'Replace All Clues',
      'category-generate-clues': 'Generate Missing Clues',
      'questions-generate-five': 'Generate 5 Questions',
    };
    return labels[type] || 'AI Generation';
  }

  renderPreview(type, data) {
    switch (type) {
      case 'game-title':
        return this.renderTitlesPreview(data.titles);

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
    return categories.map((cat, i) => {
      const titleHtml = this.escapeHtml(cat.title);
      const topicHtml = cat.contentTopic && cat.contentTopic !== cat.title
        ? ` <span class="preview-topic" title="Content topic for AI generation">📝 ${this.escapeHtml(cat.contentTopic)}</span>`
        : '';
      const catId = `cat-${i}`;
      const isAccepted = this.acceptedItems.has(catId);

      return `
      <div class="preview-category ${isAccepted ? 'accepted' : 'rejected'}" data-category-id="${catId}">
        <div class="preview-category-header">
          <h4>${i + 1}. ${titleHtml}${topicHtml}</h4>
          <div class="preview-item-actions">
            <button class="preview-action-btn preview-keep-btn" data-action="accept-category" data-category-index="${i}" title="Keep this category">
              ✓ Keep
            </button>
            <button class="preview-action-btn preview-regen-btn" data-action="regenerate-category" data-category-index="${i}" title="Regenerate this category">
              🔄 Regenerate
            </button>
          </div>
        </div>
        <ul>
          ${cat.clues.map((clue, j) => {
            const clueId = `cat-${i}-clue-${j}`;
            const isClueAccepted = this.acceptedItems.has(clueId);
            return `
              <li class="${isClueAccepted ? 'accepted' : 'rejected'}" data-clue-id="${clueId}">
                <div class="preview-clue-content">
                  <span class="clue-value">$${clue.value}</span>
                  <span class="clue-text">${this.escapeHtml(clue.clue)}</span>
                </div>
                <div class="preview-clue-actions">
                  <button class="preview-action-btn preview-keep-btn-sm" data-action="accept-clue" data-category-index="${i}" data-clue-index="${j}" title="Keep this question">
                    ✓
                  </button>
                  <button class="preview-action-btn preview-regen-btn-sm" data-action="regenerate-clue" data-category-index="${i}" data-clue-index="${j}" title="Regenerate this question">
                    🔄
                  </button>
                </div>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `;
    }).join('');
  }

  renderTitlesPreview(titles) {
    return `
      <div class="preview-titles">
        <div style="margin-bottom: 16px; color: var(--muted); font-size: 14px;">Choose a title for your game:</div>
        ${titles.map((titleOption, i) => `
          <div class="preview-title-option" data-title-index="${i}">
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">
              ${this.escapeHtml(titleOption.title)}
            </div>
            <div style="font-size: 14px; color: var(--muted);">
              ${this.escapeHtml(titleOption.subtitle)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderSingleCategoryPreview(category) {
    const titleHtml = this.escapeHtml(category.title);
    const topicHtml = category.contentTopic && category.contentTopic !== category.title
      ? ` <span class="preview-topic" title="Content topic for AI generation">📝 ${this.escapeHtml(category.contentTopic)}</span>`
      : '';
    return `
      <div class="preview-category">
        <h4>${titleHtml}${topicHtml}</h4>
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
    const retryBtn = this.dialog.querySelector('[value="retry"]');
    const closeBtn = this.dialog.querySelector('.iconBtn');
    const titleOptions = this.dialog.querySelectorAll('.preview-title-option');

    let cleanupCalled = false;

    // Handle title option selection
    titleOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        titleOptions.forEach(opt => opt.classList.remove('selected'));
        // Add selected class to clicked option
        option.classList.add('selected');
        // Store the selected index
        this.selectedOption = parseInt(option.dataset.titleIndex);
        // Enable confirm button when a title is selected
        if (confirmBtn) {
          confirmBtn.disabled = false;
        }
      });
    });

    // Handle category and clue action buttons
    this.dialog.querySelectorAll('.preview-action-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const catIndex = parseInt(btn.dataset.categoryIndex);
        const clueIndex = btn.dataset.clueIndex ? parseInt(btn.dataset.clueIndex) : null;

        if (action === 'accept-category') {
          const catId = `cat-${catIndex}`;
          if (this.acceptedItems.has(catId)) {
            this.acceptedItems.delete(catId);
          } else {
            this.acceptedItems.add(catId);
          }
          this.updateCategoryVisualState(catId);
        } else if (action === 'accept-clue') {
          const clueId = `cat-${catIndex}-clue-${clueIndex}`;
          if (this.acceptedItems.has(clueId)) {
            this.acceptedItems.delete(clueId);
          } else {
            this.acceptedItems.add(clueId);
          }
          this.updateClueVisualState(clueId);
        } else if (action === 'regenerate-category') {
          if (this.onRegenerateItem) {
            btn.disabled = true;
            btn.textContent = '⏳...';
            await this.onRegenerateItem('category', catIndex, this.context);
            // Dialog will be re-rendered by the callback
          }
        } else if (action === 'regenerate-clue') {
          if (this.onRegenerateItem) {
            btn.disabled = true;
            btn.textContent = '⏳';
            await this.onRegenerateItem('clue', catIndex, clueIndex, this.context);
            // Dialog will be re-rendered by the callback
          }
        }
      });
    });

    confirmBtn.addEventListener('click', () => {
      cleanupCalled = true;
      this.dialog.close();
      // For categories-generate, pass the accepted items set
      // For game-title, pass the selected index
      if (this.dialogType === 'categories-generate') {
        if (this.onConfirm) this.onConfirm(this.acceptedItems);
      } else if (this.dialogType === 'game-title') {
        if (this.onConfirm) this.onConfirm(this.selectedOption);
      } else {
        if (this.onConfirm) this.onConfirm();
      }
    });

    // Retry button - re-run wizard with same context
    if (retryBtn && this.onRetry) {
      retryBtn.addEventListener('click', () => {
        cleanupCalled = true;
        this.dialog.close();
        if (this.onRetry) this.onRetry(this.context);
      });
    }

    const cancelHandler = () => {
      cleanupCalled = true;
      this.dialog.close();
      if (this.onCancel) this.onCancel();
    };

    cancelBtn.addEventListener('click', cancelHandler);
    closeBtn.addEventListener('click', cancelHandler);

    this.dialog.addEventListener('close', () => {
      // Call onCancel if not already called by button handlers
      // This handles Escape key and programmatic close()
      if (!cleanupCalled && this.onCancel) {
        this.onCancel();
      }

      setTimeout(() => {
        if (this.dialog && this.dialog.parentNode) {
          this.dialog.remove();
        }
      }, 100);
    });
  }

  /**
   * Update visual state of a category (accepted/rejected)
   */
  updateCategoryVisualState(catId) {
    const catEl = this.dialog.querySelector(`[data-category-id="${catId}"]`);
    if (catEl) {
      const isAccepted = this.acceptedItems.has(catId);
      catEl.classList.toggle('accepted', isAccepted);
      catEl.classList.toggle('rejected', !isAccepted);

      // Update button text
      const keepBtn = catEl.querySelector('[data-action="accept-category"]');
      if (keepBtn) {
        keepBtn.textContent = isAccepted ? '✓ Keep' : '✕ Reject';
        keepBtn.classList.toggle('preview-keep-btn', isAccepted);
        keepBtn.classList.toggle('preview-reject-btn', !isAccepted);
      }
    }
  }

  /**
   * Update visual state of a clue (accepted/rejected)
   */
  updateClueVisualState(clueId) {
    const clueEl = this.dialog.querySelector(`[data-clue-id="${clueId}"]`);
    if (clueEl) {
      const isAccepted = this.acceptedItems.has(clueId);
      clueEl.classList.toggle('accepted', isAccepted);
      clueEl.classList.toggle('rejected', !isAccepted);

      // Update button icon
      const keepBtn = clueEl.querySelector('[data-action="accept-clue"]');
      if (keepBtn) {
        keepBtn.textContent = isAccepted ? '✓' : '✕';
        keepBtn.classList.toggle('preview-keep-btn-sm', isAccepted);
        keepBtn.classList.toggle('preview-reject-btn-sm', !isAccepted);
      }
    }
  }

  /**
   * Update the preview with new data (for regeneration)
   */
  updatePreview(newData) {
    this.previewData = newData;
    const contentEl = this.dialog.querySelector('.preview-content');
    if (contentEl) {
      contentEl.innerHTML = this.renderPreview(this.dialogType, newData);
      // Re-attach event listeners for the new content
      this.setupActionListeners();
    }
  }

  /**
   * Setup action listeners for dynamically added content
   */
  setupActionListeners() {
    // Re-attach listeners for action buttons
    this.dialog.querySelectorAll('.preview-action-btn').forEach(btn => {
      // Remove existing listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
    });

    // Add fresh listeners
    this.dialog.querySelectorAll('.preview-action-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const catIndex = parseInt(btn.dataset.categoryIndex);
        const clueIndex = btn.dataset.clueIndex ? parseInt(btn.dataset.clueIndex) : null;

        if (action === 'accept-category') {
          const catId = `cat-${catIndex}`;
          if (this.acceptedItems.has(catId)) {
            this.acceptedItems.delete(catId);
          } else {
            this.acceptedItems.add(catId);
          }
          this.updateCategoryVisualState(catId);
        } else if (action === 'accept-clue') {
          const clueId = `cat-${catIndex}-clue-${clueIndex}`;
          if (this.acceptedItems.has(clueId)) {
            this.acceptedItems.delete(clueId);
          } else {
            this.acceptedItems.add(clueId);
          }
          this.updateClueVisualState(clueId);
        } else if (action === 'regenerate-category') {
          if (this.onRegenerateItem) {
            btn.disabled = true;
            btn.textContent = '⏳...';
            await this.onRegenerateItem('category', catIndex, this.context);
            // Dialog will be re-rendered by the callback
          }
        } else if (action === 'regenerate-clue') {
          if (this.onRegenerateItem) {
            btn.disabled = true;
            btn.textContent = '⏳';
            await this.onRegenerateItem('clue', catIndex, clueIndex, this.context);
            // Dialog will be re-rendered by the callback
          }
        }
      });
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

// Expose globally for other modules to use
window.aiPreview = aiPreview;
