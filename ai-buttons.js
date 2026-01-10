/**
 * AI Buttons Module
 *
 * Button rendering and event handling only.
 * Delegates business logic to ai-actions.js for separation of concerns.
 */

let currentDifficulty = 'normal';
let aiHandlersInitialized = false;

// ==================== RENDERING FUNCTIONS ====================

/**
 * Create an AI button
 * @param {object} options
 * @param {string} options.action - AI action type
 * @param {string} options.title - Tooltip text
 * @param {string} options.icon - Button icon (default: wand)
 * @param {string} options.size - 'sm' or 'md'
 */
function createAIButton({ action, title, icon = '🪄', size = 'sm' }) {
  return `
    <button
      class="btn ai-btn ai-btn-${size}"
      data-ai-action="${action}"
      data-ai-title="${title}"
      type="button"
      title="${title}"
    >
      <span class="ai-btn-icon">${icon}</span>
      <span class="ai-btn-text">AI</span>
      <span class="ai-btn-spinner" style="display: none;">⏳</span>
    </button>
  `;
}

/**
 * Update difficulty in pill display and sync with ai-buttons.js
 * Called from app.js when difficulty radio buttons change
 */
function updateAIDifficulty(newDifficulty) {
  currentDifficulty = newDifficulty;
  // Update pill display if it exists
  const pillDifficulty = document.getElementById('aiPillDifficulty');
  if (pillDifficulty) {
    pillDifficulty.textContent = newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1);
  }
  // Sync radio buttons if they exist
  const radio = document.querySelector(`input[name="aiDifficulty"][value="${newDifficulty}"]`);
  if (radio) {
    radio.checked = true;
  }
}

/**
 * Inject all AI buttons into the Game Creator UI
 * Note: Game header AI pill is now inline in app.js, not injected here
 */
function injectAIButtons() {
  // Game header area - no longer injected, now inline in app.js
  // This section is kept for reference but does nothing

  // Categories column header - sparkle menu
  const categoriesPlaceholder = document.querySelector('.creator-categories-column .column-ai-menu-placeholder');
  if (categoriesPlaceholder) {
    categoriesPlaceholder.innerHTML = `
      <div class="ai-action-menu" data-menu-id="ai-menu-categories">
        <button class="row-action-btn ai-sparkle" data-ai-trigger="dropdown" aria-label="AI actions" title="AI actions">
          ✨
        </button>
        <div class="ai-action-dropdown" id="ai-menu-categories">
          <button class="ai-action-item" data-ai-action="categories-generate">
            <span class="ai-action-icon">🎯</span>
            Generate all categories
          </button>
        </div>
      </div>
    `;
  }

  // Questions column header - sparkle menu
  const questionsPlaceholder = document.querySelector('.creator-clues-column .column-ai-menu-placeholder');
  if (questionsPlaceholder) {
    questionsPlaceholder.innerHTML = `
      <div class="ai-action-menu" data-menu-id="ai-menu-questions">
        <button class="row-action-btn ai-sparkle" data-ai-trigger="dropdown" aria-label="AI actions" title="AI actions">
          ✨
        </button>
        <div class="ai-action-dropdown" id="ai-menu-questions">
          <button class="ai-action-item" data-ai-action="questions-generate-five">
            <span class="ai-action-icon">➕</span>
            Generate 5 clues
          </button>
        </div>
      </div>
    `;
  }
}

/**
 * Inject per-category AI buttons (called from renderCategoriesColumn)
 * Uses sparkle icon + dropdown menu pattern
 * @param {HTMLElement} categoryItem - The category card element
 * @param {number} categoryIndex - Index of the category
 */
function injectCategoryAIButtons(categoryItem, categoryIndex) {
  const actionsDiv = categoryItem.querySelector('.category-card-actions');
  if (!actionsDiv) {
    console.error('[injectCategoryAIButtons] No .category-card-actions found for category', categoryIndex);
    return;
  }

  console.log('[injectCategoryAIButtons] Injecting for category', categoryIndex);

  // Simple sparkle button that opens a modal/dialog with actions
  const aiMenuHTML = `
    <button class="row-action-btn ai-sparkle" data-ai-action="category-menu" data-category-index="${categoryIndex}" aria-label="AI actions for this category">
      ✨
    </button>
  `;

  actionsDiv.insertAdjacentHTML('beforeend', aiMenuHTML);
  console.log('[injectCategoryAIButtons] Added sparkle button for category', categoryIndex);
}

/**
 * Inject per-question AI buttons (called from renderCluesColumn)
 * Uses sparkle icon button
 * @param {HTMLElement} questionItem - The question card element
 */
function injectQuestionAIButtons(questionItem) {
  const actionsDiv = questionItem.querySelector('.clue-card-actions');
  if (!actionsDiv) return;

  // Get clue index from parent
  const clueIndex = questionItem.dataset.clueIndex;
  const menuId = `ai-menu-clue-${clueIndex}`;

  const aiMenuHTML = `
    <div class="ai-action-menu" data-menu-id="${menuId}">
      <button class="row-action-btn ai-sparkle" data-ai-action="question-generate-single" aria-label="Generate new clue">
        ✨
      </button>
    </div>
  `;

  actionsDiv.insertAdjacentHTML('beforeend', aiMenuHTML);
}

/**
 * Inject editor panel AI buttons (called from renderEditorPanel)
 * Injects field-specific AI actions into each field's action area
 */
function injectEditorAIButtons() {
  const editorForm = document.querySelector('.editor-form');
  if (!editorForm) return;

  // Question field actions (Generate, Rewrite)
  const questionActions = editorForm.querySelector('.editor-field-actions[data-field="question"]');
  if (questionActions) {
    questionActions.innerHTML = `
      <button class="field-action-btn" data-ai-action="editor-generate-clue" title="Generate question + answer">
        <span>✨</span>
      </button>
      <button class="field-action-btn" data-ai-action="editor-rewrite-clue" title="Rewrite question">
        <span>✏️</span>
      </button>
    `;
  }

  // Answer field actions (Generate, Validate)
  const answerActions = editorForm.querySelector('.editor-field-actions[data-field="answer"]');
  if (answerActions) {
    answerActions.innerHTML = `
      <button class="field-action-btn" data-ai-action="editor-generate-answer" title="Generate answer">
        <span>✨</span>
      </button>
      <button class="field-action-btn" data-ai-action="editor-validate" title="Validate clue & answer">
        <span>✓</span>
      </button>
    `;
  }
}

// ==================== EVENT HANDLERS ====================

/**
 * Setup global AI button click handler
 * Handles both dropdown triggers and direct AI action buttons
 */
function setupAIButtonHandlers() {
  // Only set up handlers once
  if (aiHandlersInitialized) {
    return;
  }
  aiHandlersInitialized = true;

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.ai-action-menu')) {
      document.querySelectorAll('.ai-action-dropdown.show').forEach(dropdown => {
        dropdown.classList.remove('show');
      });
    }
  });

  // Handle AI button clicks
  document.addEventListener('click', async (e) => {
    const sparkleBtn = e.target.closest('.row-action-btn.ai-sparkle');
    const aiPillTrigger = e.target.closest('.ai-pill-trigger');
    const aiActionItem = e.target.closest('.ai-action-item');
    const legacyAiBtn = e.target.closest('.ai-btn');
    const fieldActionBtn = e.target.closest('.field-action-btn');

    // Debug: Log what was clicked
    if (sparkleBtn || aiPillTrigger || aiActionItem || legacyAiBtn || fieldActionBtn) {
      console.log('[AI Event] Click detected:', {
        sparkleBtn: !!sparkleBtn,
        aiPillTrigger: !!aiPillTrigger,
        aiActionItem: !!aiActionItem,
        legacyAiBtn: !!legacyAiBtn,
        fieldActionBtn: !!fieldActionBtn,
        target: e.target
      });
    }

    // Handle AI pill trigger dropdown toggle (game header)
    if (aiPillTrigger) {
      e.preventDefault();
      e.stopPropagation();

      const menu = aiPillTrigger.closest('.ai-action-menu');
      const dropdown = menu?.querySelector('.ai-action-dropdown');

      // Close other dropdowns
      document.querySelectorAll('.ai-action-dropdown.show').forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
      });

      // Toggle this dropdown
      if (dropdown) {
        dropdown.classList.toggle('show');
        console.log('[AI Event] Pill dropdown toggled:', dropdown.classList.contains('show'));
      }
      return;
    }

    // Handle sparkle button dropdown toggle (rows/columns)
    if (sparkleBtn) {
      e.preventDefault();
      e.stopPropagation();

      const menu = sparkleBtn.closest('.ai-action-menu');
      const dropdown = menu?.querySelector('.ai-action-dropdown');

      // Close other dropdowns
      document.querySelectorAll('.ai-action-dropdown.show').forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
      });

      // Toggle this dropdown
      if (dropdown) {
        const isShown = dropdown.classList.contains('show');

        if (!isShown) {
          // Show the dropdown and position it near the mouse click
          dropdown.classList.add('show');
          dropdown.style.position = 'fixed';
          dropdown.style.top = `${e.clientY + 8}px`;
          dropdown.style.left = `${e.clientX - 100}px`;

          console.log('[AI Event] Dropdown positioned at click coordinates:', {
            top: dropdown.style.top,
            left: dropdown.style.left,
            clickX: e.clientX,
            clickY: e.clientY
          });

          // Check if dropdown is off-screen and adjust
          requestAnimationFrame(() => {
            const dropdownRect = dropdown.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            console.log('[AI Event] Dropdown rect details:', {
              x: dropdownRect.x,
              y: dropdownRect.y,
              width: dropdownRect.width,
              height: dropdownRect.height,
              top: dropdownRect.top,
              left: dropdownRect.left,
              bottom: dropdownRect.bottom,
              right: dropdownRect.right
            });
            console.log('[AI Event] Dropdown classes:', dropdown.className);
            console.log('[AI Event] Dropdown ID:', dropdown.id);

            const computedStyle = window.getComputedStyle(dropdown);
            console.log('[AI Event] Dropdown display:', computedStyle.display);
            console.log('[AI Event] Dropdown position:', computedStyle.position);
            console.log('[AI Event] Dropdown visibility:', computedStyle.visibility);
            console.log('[AI Event] Dropdown opacity:', computedStyle.opacity);
            console.log('[AI Event] Dropdown width (computed):', computedStyle.width);
            console.log('[AI Event] Dropdown height (computed):', computedStyle.height);

            console.log('[AI Event] Dropdown innerHTML:', dropdown.innerHTML);
            console.log('[AI Event] Dropdown children count:', dropdown.children.length);

            // Check if .show class is working
            console.log('[AI Event] Has show class:', dropdown.classList.contains('show'));

            // Try forcing display and position inline
            console.log('[AI Event] Forcing inline styles...');
            dropdown.style.display = 'flex';
            dropdown.style.position = 'fixed';
            dropdown.style.minWidth = '200px';

            const newRect = dropdown.getBoundingClientRect();
            console.log('[AI Event] Dropdown rect after forcing:', {
              width: newRect.width,
              height: newRect.height
            });

            if (dropdownRect.right > viewportWidth) {
              dropdown.style.left = `${e.clientX - dropdownRect.width}px`;
            }
            if (dropdownRect.bottom > viewportHeight) {
              dropdown.style.top = `${e.clientY - dropdownRect.height - 8}px`;
            }
          });
        } else {
          // Just hide it
          dropdown.classList.remove('show');
        }
      } else {
        // No dropdown - check if this is a direct action button
        const action = sparkleBtn.dataset.aiAction;
        if (action) {
          console.log('[AI Event] Direct action button, action:', action);
          // Execute the action directly
          executeAIActionClick(e, action, sparkleBtn);
        } else {
          console.log('[AI Event] No dropdown and no action - nothing to do');
        }
      }
      return;
    }

    // Handle AI action item clicks from dropdown
    if (aiActionItem) {
      e.preventDefault();
      e.stopPropagation();

      const action = aiActionItem.dataset.aiAction;
      console.log('[AI Event] Action item clicked, action:', action);
      if (!action) {
        console.error('[AI Event] No action data attribute found');
        return;
      }

      console.log('[AI Event] Executing action:', action, 'item:', aiActionItem);

      // Close dropdown
      const dropdown = aiActionItem.closest('.ai-action-dropdown');
      if (dropdown) dropdown.classList.remove('show');

      // Execute action
      await executeAIActionClick(e, action);
      return;
    }

    // Handle legacy AI buttons (for header buttons etc)
    if (legacyAiBtn) {
      e.preventDefault();
      e.stopPropagation();

      const action = legacyAiBtn.dataset.aiAction;
      if (!action) return;

      await executeAIActionClick(e, action, legacyAiBtn);
      return;
    }

    // Handle field action buttons (editor panel)
    if (fieldActionBtn) {
      e.preventDefault();
      e.stopPropagation();

      const action = fieldActionBtn.dataset.aiAction;
      if (!action) return;

      await executeAIActionClick(e, action, fieldActionBtn);
      return;
    }
  });
}

/**
 * Execute an AI action with loading state
 */
async function executeAIActionClick(e, action, buttonEl = null) {
  console.log('[AI] Action clicked:', action);

  // Check server availability first
  const available = await checkAIServer();
  console.log('[AI] Server available:', available);

  if (!available) {
    console.error('[AI] Server not available');
    aiToast.show({
      message: 'Start AI server first: node server.js',
      type: 'error',
      duration: 4000
    });
    return;
  }

  // Find button element if not provided
  if (!buttonEl) {
    buttonEl = e.target.closest('.row-action-btn') || e.target.closest('.ai-btn') || e.target.closest('.field-action-btn');
  }

  console.log('[AI] Button element:', buttonEl);

  // Show loading state
  if (buttonEl) {
    buttonEl.classList.add('loading');
    buttonEl.disabled = true;
    buttonEl.dataset.originalText = buttonEl.textContent;
    buttonEl.textContent = '⏳';
    console.log('[AI] Loading state set');
  }

  try {
    console.log('[AI] Building context...');
    // Capture category index from button if present
    const categoryIndex = buttonEl?.dataset?.categoryIndex ? parseInt(buttonEl.dataset.categoryIndex) : null;
    console.log('[AI] Category index from button:', categoryIndex);
    // Build context based on action (async for input dialogs)
    const result = await buildContext(action, categoryIndex);
    console.log('[AI] Context built:', result);

    // User cancelled input dialog
    if (!result) {
      console.log('[AI] User cancelled or empty context');
      return;
    }

    // result can be {action, context} for menu selections, or just context for direct actions
    const actualAction = result.action || action;
    const context = result.context || result;

    console.log('[AI] Executing AI action:', actualAction, context, currentDifficulty);
    // Execute via ai-actions.js
    await executeAIAction(actualAction, context, currentDifficulty);
    console.log('[AI] Action completed successfully');

  } catch (error) {
    console.error('[AI] Error:', error);
    aiToast.show({
      message: error.message || 'AI generation failed',
      type: 'error',
      duration: 5000
    });
  } finally {
    // Reset button state
    if (buttonEl) {
      buttonEl.classList.remove('loading');
      buttonEl.disabled = false;
      if (buttonEl.dataset.originalText) {
        buttonEl.textContent = buttonEl.dataset.originalText;
      } else {
        buttonEl.textContent = '✨';
      }
      console.log('[AI] Button state reset');
    }
  }
}

/**
 * Build context object for AI action
 * Async to support input dialogs
 * @param {string} action - The AI action type
 * @param {number} explicitCategoryIndex - Optional explicit category index (from button data attribute)
 */
async function buildContext(action, explicitCategoryIndex = null) {
  const gameHeader = document.getElementById('creatorGameHeader');
  if (!gameHeader || !gameHeader._game) {
    throw new Error('No game loaded');
  }

  const game = gameHeader._game;
  const gameData = gameHeader._gameData;
  // Use explicit category index if provided, otherwise fall back to global selection
  const catIdx = explicitCategoryIndex !== null ? explicitCategoryIndex : window.selectedCategoryIndex;
  const clueIdx = window.selectedClueIndex;

  // Debug logging for category actions
  if (action.startsWith('category-')) {
    console.log('[buildContext] Category action:', action);
    console.log('[buildContext] Explicit category index:', explicitCategoryIndex);
    console.log('[buildContext] Global selectedCategoryIndex:', window.selectedCategoryIndex);
    console.log('[buildContext] Using catIdx:', catIdx);
    console.log('[buildContext] Category title:', gameData.categories[catIdx]?.title);
  }

  switch (action) {
    case 'category-menu':
      // Use selection dialog for better UX
      const choice = await window.showSelectionDialog(
        '✨ AI Assistant for Category',
        'What would you like AI to do?',
        [
          {
            value: 'category-rename',
            icon: '✏️',
            title: 'Suggest better names',
            desc: 'Get creative category name suggestions (e.g., "World Capitals" → "Around the World")'
          },
          {
            value: 'category-generate-clues',
            icon: '➕',
            title: 'Fill empty questions',
            desc: 'Generate questions only for blank spots. Keeps your existing content intact.'
          },
          {
            value: 'category-replace-all',
            icon: '🔄',
            title: 'Replace all questions',
            desc: 'Generate all new questions for this category. Replaces everything with fresh content.'
          }
        ]
      );

      if (!choice) return null; // User cancelled

      console.log('[AI] User chose category action:', choice);
      // Get the context for the chosen action and return both action and context
      // Pass through the explicit category index to use the correct category
      const context = await buildContext(choice, explicitCategoryIndex);
      return { action: choice, context };

    case 'game-title':
      // Check if game has content already
      const hasContent = gameData.categories.some(cat =>
        cat.clues && cat.clues.some(clue => clue.clue && clue.clue.trim())
      );

      if (hasContent) {
        // Build sample content from the game (first 3 categories, first 2 clues each)
        const sampleContent = gameData.categories
          .filter(cat => cat.clues && cat.clues.some(c => c.clue && c.clue.trim()))
          .slice(0, 3)
          .map(cat => ({
            category: cat.title || 'Untitled',
            clues: cat.clues
              .filter(c => c.clue && c.clue.trim())
              .slice(0, 2)
              .map(c => ({ question: c.clue, answer: c.response }))
          }));

        return {
          hasContent: true,
          sampleContent: JSON.stringify(sampleContent),
          currentTitle: game.title,
          currentSubtitle: game.subtitle
        };
      } else {
        // No content - ask for theme
        const theme = await window.showInputDialog(
          'Create a new game',
          '',
          'Enter a theme to get started, or leave blank for a random theme'
        );
        if (theme === null) {
          return null;
        }
        return {
          hasContent: false,
          theme: theme || 'random',
          currentTitle: game.title,
          currentSubtitle: game.subtitle
        };
      }

    case 'categories-generate':
      // Use HTML input dialog instead of browser prompt
      console.log('[AI] Calling showInputDialog, function exists:', typeof window.showInputDialog);
      const theme = await window.showInputDialog(
        'Generate full game',
        game.title || '',
        'Enter a theme to generate all categories and questions'
      );
      console.log('[AI] Dialog result:', theme);
      // User cancelled
      if (theme === null) {
        return null;
      }
      return {
        theme: theme || 'general',
        count: gameData.categories.length
      };

    case 'category-rename':
      return {
        currentTitle: gameData.categories[catIdx].title,
        theme: game.title || 'general'
      };

    case 'category-generate-clues':
      return {
        categoryTitle: gameData.categories[catIdx].title,
        existingClues: gameData.categories[catIdx].clues
      };

    case 'category-replace-all':
      return {
        categoryTitle: gameData.categories[catIdx].title,
        theme: game.title || gameData.categories[catIdx].title,
        count: gameData.categories[catIdx].clues.length
      };

    case 'questions-generate-five':
      return {
        categoryTitle: gameData.categories[catIdx].title,
        theme: game.title || gameData.categories[catIdx].title
      };

    case 'question-generate-single':
      return {
        categoryTitle: gameData.categories[catIdx].title,
        value: gameData.categories[catIdx].clues[clueIdx].value,
        theme: game.title || gameData.categories[catIdx].title
      };

    case 'editor-generate-clue':
      return {
        categoryTitle: gameData.categories[catIdx].title,
        value: gameData.categories[catIdx].clues[clueIdx].value,
        theme: game.title || 'general'
      };

    case 'editor-rewrite-clue':
      return {
        currentClue: gameData.categories[catIdx].clues[clueIdx].clue,
        categoryTitle: gameData.categories[catIdx].title,
        value: gameData.categories[catIdx].clues[clueIdx].value
      };

    case 'editor-generate-answer':
      return {
        clue: gameData.categories[catIdx].clues[clueIdx].clue,
        categoryTitle: gameData.categories[catIdx].title,
        value: gameData.categories[catIdx].clues[clueIdx].value
      };

    case 'editor-validate':
      return {
        clue: gameData.categories[catIdx].clues[clueIdx].clue,
        response: gameData.categories[catIdx].clues[clueIdx].response,
        categoryTitle: gameData.categories[catIdx].title,
        value: gameData.categories[catIdx].clues[clueIdx].value
      };

    default:
      return {};
  }
}

/**
 * Update AI buttons state based on server availability
 * @param {boolean} available - Whether server is available
 */
function updateAIButtonsState(available) {
  const aiButtons = document.querySelectorAll('.ai-btn');
  aiButtons.forEach(btn => {
    if (available) {
      btn.disabled = false;
      btn.title = btn.dataset.aiTitle || 'AI action';
      btn.classList.remove('ai-btn-unavailable');
    } else {
      btn.disabled = true;
      btn.title = 'AI server not running. Start with: node server.js';
      btn.classList.add('ai-btn-unavailable');
    }
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  setupAIButtonHandlers();

  // Update button states when server status changes
  checkAIServer().then(available => {
    updateAIButtonsState(available);
  });

  // Re-check server status periodically
  setInterval(() => {
    checkAIServer().then(available => {
      updateAIButtonsState(available);
    });
  }, 30000); // Every 30 seconds
});

// Expose updateAIDifficulty globally for app.js to call
window.updateAIDifficulty = updateAIDifficulty;
