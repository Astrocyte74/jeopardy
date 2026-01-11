/**
 * AI Preview Dialog Module
 *
 * Shows preview of AI-generated content before applying.
 * Used for destructive operations (replace all categories, replace all clues, etc.)
 *
 * NEW DESIGN: Checkbox model for selecting items to regenerate
 * - All checkboxes start unchecked (opt-in model)
 * - Check a category → auto-checks all its clues
 * - Individual clues can be unchecked even if category is checked
 * - Dynamic summary: "Regenerate X categories and Y questions"
 */

class AIPreviewDialog {
  constructor() {
    this.dialog = null;
    this.onConfirm = null;
    this.onCancel = null;
    this.onRegenerateSelected = null; // Callback for regenerating selected items
    this.onRegenerateAll = null; // Callback for regenerating all
    this.checkedItems = new Set(); // Track CHECKED items (items to regenerate)
    this.regeneratedItems = new Set(); // Track items that have been regenerated (for visual highlighting)
    this.previewData = null; // Store preview data for regeneration
  }

  /**
   * Show preview dialog
   * @param {object} data - AI-generated data
   * @param {object} options - Dialog options
   * @param {string} options.type - Prompt type identifier
   * @param {object} options.data - The actual data to preview
   * @param {function} options.onConfirm - Callback when user clicks Done
   * @param {function} options.onCancel - Callback when user clicks Cancel
   * @param {function} options.onRegenerateAll - Callback when user clicks Regenerate All
   * @param {function} options.onRegenerateSelected - Callback for regenerating selected items
   * @param {object} options.context - Context for retry (theme, difficulty, etc.)
   */
  show(data, { type, data: previewData, onConfirm, onCancel, onRegenerateAll, onRegenerateSelected, context }) {
    try {
      console.log('[aiPreview] show() called, type:', type, 'data:', data);
      this.onConfirm = onConfirm;
      this.onCancel = onCancel;
      this.onRegenerateAll = onRegenerateAll;
      this.onRegenerateSelected = onRegenerateSelected;
      this.context = context;
      this.selectedOption = null; // Reset selection
      this.dialogType = type; // Store dialog type
      this.previewData = previewData; // Store for regeneration
      this.checkedItems.clear(); // Start with all unchecked
      this.regeneratedItems.clear(); // Reset regenerated items

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

            ${type === 'categories-generate' ? `
              <div class="preview-regenerate-section">
                <div class="preview-regenerate-summary" id="regenerateSummary">
                  Check items above to regenerate them
                </div>
                <button class="btn btnSecondary" id="regenerateSelectedBtn" type="button" disabled>Regenerate Selected</button>
                ${this.onRegenerateAll ? '<button class="btn btnSecondary" id="regenerateAllBtn" type="button">Regenerate All</button>' : ''}
              </div>
            ` : ''}

            <div class="dialogActions">
              <button class="btn btnSecondary" value="cancel" type="button">Cancel</button>
              ${this.onRegenerateAll && type !== 'categories-generate' ? '<button class="btn btnSecondary" value="retry" type="button">Regenerate All</button>' : ''}
              <button class="btn btnPrimary" value="confirm" type="button" ${type === 'game-title' ? 'disabled' : ''}>Done</button>
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
    console.log('[renderCategoriesPreview] Rendering', categories.length, 'categories');
    console.log('[renderCategoriesPreview] regeneratedItems:', Array.from(this.regeneratedItems));
    console.log('[renderCategoriesPreview] checkedItems:', Array.from(this.checkedItems));

    const instructions = `
      <div class="preview-instructions">
        <p><strong>Review the generated content below:</strong></p>
        <ul>
          <li>All items will be applied when you click "Done"</li>
          <li>Check any categories or questions you want to regenerate with AI</li>
          <li>Click "Regenerate Selected" to regenerate checked items</li>
          <li>Click "Regenerate All" to start over with all new content</li>
        </ul>
      </div>
    `;

    const categoriesHtml = categories.map((cat, i) => {
      if (i === 0) {
        console.log('[renderCategoriesPreview] First category data:', cat);
        console.log('[renderCategoriesPreview] First category title:', cat.title);
        console.log('[renderCategoriesPreview] First category clues:', cat.clues);
      }
      const titleHtml = this.escapeHtml(cat.title);
      const topicHtml = cat.contentTopic && cat.contentTopic !== cat.title
        ? ` <span class="preview-topic" title="Content topic for AI generation">📝 ${this.escapeHtml(cat.contentTopic)}</span>`
        : '';
      const catId = `cat-${i}`;
      const isChecked = this.checkedItems.has(catId);
      const isRegenerated = this.regeneratedItems.has(catId);

      return `
      <div class="preview-category ${isRegenerated ? 'regenerated' : ''}" data-category-id="${catId}">
        <div class="preview-category-header">
          <label class="preview-checkbox-label">
            <input type="checkbox" class="preview-category-checkbox" data-category-id="${catId}" data-category-index="${i}" ${isChecked ? 'checked' : ''}>
            <span class="preview-checkbox-text"></span>
            <h4>${i + 1}. ${titleHtml}${topicHtml}</h4>
            ${isRegenerated ? '<span class="regenerated-badge">Regenerated</span>' : ''}
          </label>
        </div>
        <ul>
          ${cat.clues.map((clue, j) => {
            const clueId = `cat-${i}-clue-${j}`;
            const isClueChecked = this.checkedItems.has(clueId);
            const isClueRegenerated = this.regeneratedItems.has(clueId);
            return `
              <li class="${isClueRegenerated ? 'regenerated' : ''}" data-clue-id="${clueId}">
                <label class="preview-clue-checkbox-label">
                  <input type="checkbox" class="preview-clue-checkbox" data-clue-id="${clueId}" data-category-index="${i}" data-clue-index="${j}" ${isClueChecked ? 'checked' : ''}>
                  <div class="preview-clue-content">
                    <span class="clue-value">$${clue.value}</span>
                    <span class="clue-text">${this.escapeHtml(clue.clue)}</span>
                    ${isClueRegenerated ? '<span class="regenerated-badge-sm">✨ New</span>' : ''}
                  </div>
                </label>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `;
    }).join('');

    const finalHtml = instructions + categoriesHtml;
    console.log('[renderCategoriesPreview] Final HTML length:', finalHtml.length);
    console.log('[renderCategoriesPreview] First 200 chars:', finalHtml.substring(0, 200));
    return finalHtml;
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
    const regenerateAllBtn = this.dialog.querySelector('#regenerateAllBtn');
    const regenerateSelectedBtn = this.dialog.querySelector('#regenerateSelectedBtn');
    const closeBtn = this.dialog.querySelector('.iconBtn');
    const titleOptions = this.dialog.querySelectorAll('.preview-title-option');

    let cleanupCalled = false;

    // Handle title option selection
    titleOptions.forEach(option => {
      option.addEventListener('click', () => {
        titleOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        this.selectedOption = parseInt(option.dataset.titleIndex);
        if (confirmBtn) {
          confirmBtn.disabled = false;
        }
      });
    });

    // Handle category checkboxes
    this.dialog.querySelectorAll('.preview-category-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const catId = e.target.dataset.categoryId;
        const catIndex = parseInt(e.target.dataset.categoryIndex);

        if (e.target.checked) {
          // Add category and all its clues
          this.checkedItems.add(catId);
          const category = this.previewData.categories[catIndex];
          category.clues.forEach((_, j) => {
            this.checkedItems.add(`cat-${catIndex}-clue-${j}`);
          });
          // Check all clue checkboxes visually
          this.dialog.querySelectorAll(`.preview-clue-checkbox[data-category-index="${catIndex}"]`).forEach(cb => {
            cb.checked = true;
          });
        } else {
          // Remove category and all its clues
          this.checkedItems.delete(catId);
          const category = this.previewData.categories[catIndex];
          category.clues.forEach((_, j) => {
            this.checkedItems.delete(`cat-${catIndex}-clue-${j}`);
          });
          // Uncheck all clue checkboxes visually
          this.dialog.querySelectorAll(`.preview-clue-checkbox[data-category-index="${catIndex}"]`).forEach(cb => {
            cb.checked = false;
          });
        }
        this.updateRegenerateSummary();
      });
    });

    // Handle individual clue checkboxes
    this.dialog.querySelectorAll('.preview-clue-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const clueId = e.target.dataset.clueId;
        if (e.target.checked) {
          this.checkedItems.add(clueId);
        } else {
          this.checkedItems.delete(clueId);
        }
        this.updateRegenerateSummary();
      });
    });

    // Update summary
    this.updateRegenerateSummary();

    // Regenerate Selected button
    if (regenerateSelectedBtn && this.onRegenerateSelected) {
      regenerateSelectedBtn.addEventListener('click', async () => {
        await this.onRegenerateSelected(this.checkedItems);
      });
    }

    // Regenerate All button
    if (regenerateAllBtn && this.onRegenerateAll) {
      regenerateAllBtn.addEventListener('click', () => {
        cleanupCalled = true;
        this.dialog.close();
        if (this.onRegenerateAll) this.onRegenerateAll(this.context);
      });
    }

    confirmBtn.addEventListener('click', () => {
      cleanupCalled = true;
      this.dialog.close();
      // For game-title, pass the selected index; for categories-generate, pass checked items
      if (this.dialogType === 'game-title') {
        if (this.onConfirm) this.onConfirm(this.selectedOption);
      } else {
        if (this.onConfirm) this.onConfirm(this.checkedItems);
      }
    });

    // Retry button - re-run wizard with same context
    if (retryBtn && this.onRegenerateAll) {
      retryBtn.addEventListener('click', () => {
        cleanupCalled = true;
        this.dialog.close();
        if (this.onRegenerateAll) this.onRegenerateAll(this.context);
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
   * Update the regenerate summary based on checked items
   */
  updateRegenerateSummary() {
    const summaryEl = this.dialog.querySelector('#regenerateSummary');
    const regenerateBtn = this.dialog.querySelector('#regenerateSelectedBtn');
    if (!summaryEl || !regenerateBtn) return;

    // Count checked categories
    const checkedCategories = [];
    const checkedIndividualClues = [];

    this.previewData.categories.forEach((cat, i) => {
      const catId = `cat-${i}`;
      if (this.checkedItems.has(catId)) {
        // Category is checked - all clues are implicitly checked
        checkedCategories.push(cat);
      } else {
        // Category not checked - check for individual clues
        cat.clues.forEach((clue, j) => {
          const clueId = `cat-${i}-clue-${j}`;
          if (this.checkedItems.has(clueId)) {
            checkedIndividualClues.push({ category: cat, clue });
          }
        });
      }
    });

    const catCount = checkedCategories.length;
    const clueCount = checkedIndividualClues.length;

    let summaryText = '';
    if (catCount === 0 && clueCount === 0) {
      summaryText = 'Check items above to regenerate them';
      regenerateBtn.disabled = true;
    } else if (catCount > 0 && clueCount === 0) {
      summaryText = `Regenerate ${catCount} categor${catCount === 1 ? 'y' : 'ies'}`;
      regenerateBtn.disabled = false;
    } else if (catCount === 0 && clueCount > 0) {
      summaryText = `Regenerate ${clueCount} question${clueCount === 1 ? '' : 's'}`;
      regenerateBtn.disabled = false;
    } else {
      summaryText = `Regenerate ${catCount} categor${catCount === 1 ? 'y' : 'ies'} and ${clueCount} question${clueCount === 1 ? '' : 's'}`;
      regenerateBtn.disabled = false;
    }

    summaryEl.textContent = summaryText;
  }

  /**
   * Update the preview with new data (for regeneration)
   */
  updatePreview(newData, preserveCheckedItems = true) {
    console.log('[updatePreview] Called with', newData);
    console.log('[updatePreview] this.regeneratedItems before render:', Array.from(this.regeneratedItems));
    console.log('[updatePreview] this.checkedItems before render:', Array.from(this.checkedItems));
    console.log('[updatePreview] window.aiPreview.regeneratedItems before render:', Array.from(window.aiPreview.regeneratedItems));
    this.previewData = newData;
    const contentEl = this.dialog.querySelector('.preview-content');
    if (contentEl) {
      contentEl.innerHTML = this.renderPreview(this.dialogType, newData);
      console.log('[updatePreview] Content updated, reattaching listeners');
      // Re-attach event listeners
      this.setupActionListeners();
      // Restore checkbox states (but NOT for items that were just regenerated)
      this.dialog.querySelectorAll('.preview-category-checkbox').forEach(cb => {
        cb.checked = this.checkedItems.has(cb.dataset.categoryId);
      });
      this.dialog.querySelectorAll('.preview-clue-checkbox').forEach(cb => {
        cb.checked = this.checkedItems.has(cb.dataset.clueId);
      });
      this.updateRegenerateSummary();
      console.log('[updatePreview] Preview updated successfully');
    } else {
      console.error('[updatePreview] Content element not found!');
    }
  }

  /**
   * Setup action listeners for dynamically added content
   */
  setupActionListeners() {
    const confirmBtn = this.dialog.querySelector('[value="confirm"]');
    const regenerateSelectedBtn = this.dialog.querySelector('#regenerateSelectedBtn');

    // Handle category checkboxes
    this.dialog.querySelectorAll('.preview-category-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const catId = e.target.dataset.categoryId;
        const catIndex = parseInt(e.target.dataset.categoryIndex);

        if (e.target.checked) {
          this.checkedItems.add(catId);
          const category = this.previewData.categories[catIndex];
          category.clues.forEach((_, j) => {
            this.checkedItems.add(`cat-${catIndex}-clue-${j}`);
          });
          this.dialog.querySelectorAll(`.preview-clue-checkbox[data-category-index="${catIndex}"]`).forEach(cb => {
            cb.checked = true;
          });
        } else {
          this.checkedItems.delete(catId);
          const category = this.previewData.categories[catIndex];
          category.clues.forEach((_, j) => {
            this.checkedItems.delete(`cat-${catIndex}-clue-${j}`);
          });
          this.dialog.querySelectorAll(`.preview-clue-checkbox[data-category-index="${catIndex}"]`).forEach(cb => {
            cb.checked = false;
          });
        }
        this.updateRegenerateSummary();
      });
    });

    // Handle individual clue checkboxes
    this.dialog.querySelectorAll('.preview-clue-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const clueId = e.target.dataset.clueId;
        if (e.target.checked) {
          this.checkedItems.add(clueId);
        } else {
          this.checkedItems.delete(clueId);
        }
        this.updateRegenerateSummary();
      });
    });

    this.updateRegenerateSummary();
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
