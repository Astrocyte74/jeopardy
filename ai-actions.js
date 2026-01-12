/**
 * AI Actions Module
 *
 * Business logic for all AI operations.
 * Centralized applyAIPatch function handles snapshot/undo, preview gating, apply, rerender.
 *
 * This module is separate from ai-buttons.js (rendering/events) for separation of concerns.
 */

// These will be set by app.js during Game Creator initialization
let getGameHeader = null;
let renderEditor = null;

/**
 * Initialize AI actions with Game Creator context
 * Called from app.js
 */
function initAIActions(context) {
  getGameHeader = context.getGameHeader;
  renderEditor = context.renderEditor;
}

/**
 * Centralized AI apply function
 * Handles snapshot/undo, preview gating, apply, rerender, preserves selection
 *
 * @param {object} options
 * @param {string} options.scope - 'game' | 'category' | 'clue' | 'editor'
 * @param {string} options.action - Prompt type identifier
 * @param {object} options.result - Parsed AI response
 * @param {string} options.mode - 'direct' | 'preview'
 * @param {object} options.context - Context for retry/cancel callbacks
 * @param {function} options.onRetry - Retry callback
 * @param {function} options.onCancel - Cancel callback (for cleanup)
 * @param {function} options.onConfirm - Optional callback to run after preview is confirmed
 */
function applyAIPatch({ scope, action, result, mode, context = null, onRetry = null, onCancel = null, onConfirm = null }) {
  const gameHeader = getGameHeader();
  console.log('[applyAIPatch] gameHeader:', gameHeader);
  console.log('[applyAIPatch] gameHeader._game:', gameHeader?._game);
  console.log('[applyAIPatch] gameHeader._gameData:', gameHeader?._gameData);
  console.log('[applyAIPatch] All properties on gameHeader:', gameHeader ? Object.keys(gameHeader).filter(k => k.startsWith('_')) : 'N/A');

  if (!gameHeader || !gameHeader._gameData) {
    console.error('[applyAIPatch] No game loaded or gameData missing', { gameHeader, hasGame: !!gameHeader?._game, hasGameData: !!gameHeader?._gameData });
    aiToast.show({ message: 'No game loaded', type: 'error', duration: 3000 });
    return;
  }

  const game = gameHeader._game;
  const gameData = gameHeader._gameData;

  // Capture current selection state
  const selections = {
    categoryIndex: window.selectedCategoryIndex,
    clueIndex: window.selectedClueIndex
  };

  // Determine snapshot scope
  const snapshotScope = (scope === 'game' || action === 'categories-generate' ||
                        action === 'category-replace-all') ? 'game' : 'single';

  // Take snapshot before applying
  const snapshotId = `${action}-${Date.now()}`;

  if (mode === 'preview') {
    // Close category AI dialog before showing preview
    if (context && context._onClose) {
      console.log('[applyAIPatch] Closing category AI dialog before preview');
      context._onClose();
      delete context._onClose;
    }

    // Show preview dialog first
    console.log('[applyAIPatch] Showing preview dialog, window.aiPreview:', window.aiPreview, 'result:', result);

    if (!result) {
      console.error('[applyAIPatch] ERROR: result is undefined, cannot show preview');
      aiToast.show({ message: 'AI returned no data. Check server connection.', type: 'error', duration: 5000 });
      return;
    }

    window.aiPreview.show(result, {
      type: action,
      data: result,
      context: context,
      onRegenerateAll: onRetry, // Renamed from onRetry for clarity
      onRegenerateSelected: async (checkedItems) => {
        console.log('[applyAIPatch] Regenerating selected items:', checkedItems);
        // Regenerate all checked items (items marked for regeneration)
        const regenResult = await handleRegenerateSelectedItems(action, checkedItems, result, context);

        if (regenResult) {
          console.log('[applyAIPatch] Regeneration complete, updating preview');
          // Update preview with new data
          window.aiPreview.updatePreview(result);
          console.log('[applyAIPatch] Preview update called');
        }

        return regenResult;
      },
      onConfirm: async (selectedIndexOrCheckedItems = 0) => {
        console.log('[applyAIPatch] onConfirm called, selectedIndexOrCheckedItems:', selectedIndexOrCheckedItems);
        // User confirmed - take snapshot and apply
        if (snapshotScope === 'game') {
          undoManager.saveSnapshot(snapshotId, 'game', { gameData, selections });
        } else {
          const item = getCurrentItem(scope, gameData, selections);
          undoManager.saveSnapshot(snapshotId, 'single', { item, selections });
        }
        // Pass checked items if this is a categories-generate action (checked items are excluded from applying)
        const checkedItems = (typeof selectedIndexOrCheckedItems === 'object' && selectedIndexOrCheckedItems instanceof Set)
          ? selectedIndexOrCheckedItems
          : null;
        applyResult(action, result, game, gameData, selections, selectedIndexOrCheckedItems, checkedItems);
        // Re-render the editor to show updated content
        // Use global renderEditor if available, otherwise use scoped version
        if (window.renderEditor) {
          window.renderEditor();
        } else if (renderEditor) {
          renderEditor();
        }
        showUndoToast(snapshotId, action);

        // Call custom onConfirm callback if provided (e.g., for wizard title generation)
        if (onConfirm) {
          console.log('[applyAIPatch] Calling custom onConfirm callback');
          await onConfirm();
        }

        // Call onPreviewDone to cleanup category AI dialog
        console.log('[applyAIPatch] context:', context, 'has onPreviewDone:', !!context?.onPreviewDone);
        if (context && context.onPreviewDone) {
          console.log('[applyAIPatch] Calling onPreviewDone cleanup');
          context.onPreviewDone();
        } else {
          console.log('[applyAIPatch] WARNING: onPreviewDone not available, cleanup may not happen!');
        }
      },
      onCancel: () => {
        // Call cleanup callback if provided (e.g., for wizard cancel)
        if (onCancel) {
          onCancel();
        }
        aiToast.show({ message: 'Cancelled', type: 'info', duration: 2000 });

        // Call onPreviewDone to cleanup category AI dialog
        if (context && context.onPreviewDone) {
          console.log('[applyAIPatch] Calling onPreviewDone cleanup after cancel');
          context.onPreviewDone();
        }
      }
    });
  } else {
    // Direct apply - take snapshot then apply
    if (snapshotScope === 'game') {
      undoManager.saveSnapshot(snapshotId, 'game', { gameData, selections });
    } else {
      const item = getCurrentItem(scope, gameData, selections);
      undoManager.saveSnapshot(snapshotId, 'single', { item, selections });
    }

    applyResult(action, result, game, gameData, selections);
    // Re-render the editor to show updated content
    if (window.renderEditor) {
      window.renderEditor();
    } else if (renderEditor) {
      renderEditor();
    }
    showUndoToast(snapshotId, action);
  }
}

/**
 * Get current item based on scope
 */
function getCurrentItem(scope, gameData, selections) {
  switch (scope) {
    case 'category':
      return gameData.categories[selections.categoryIndex];
    case 'clue':
    case 'editor':
      return gameData.categories[selections.categoryIndex].clues[selections.clueIndex];
    default:
      return null;
  }
}

/**
 * Apply AI result to game data
 */
function applyResult(action, result, game, gameData, selections, selectedIndex = 0, checkedItems = null) {
  console.log('[applyResult] action:', action, 'result:', result, 'selectedIndex:', selectedIndex, 'checkedItems:', checkedItems);

  switch (action) {
    case 'game-title':
      if (!result || !result.titles || !result.titles[selectedIndex]) {
        console.error('[applyResult] Invalid result for game-title:', result);
        return;
      }
      const titleIndex = selectedIndex ?? 0;
      const newTitle = result.titles[titleIndex].title;
      const newSubtitle = result.titles[titleIndex].subtitle;

      // Update game object title/subtitle
      game.title = newTitle;
      game.subtitle = newSubtitle;

      // Also update nested game.title/subtitle if exists
      if (game.game) {
        game.game.title = newTitle;
        game.game.subtitle = newSubtitle;
      }

      // Update gameData to include title/subtitle along with categories
      game.gameData = {
        title: newTitle,
        subtitle: newSubtitle,
        ...gameData  // This spreads {categories: [...]}
      };

      console.log('[applyResult] game-title applied:', { newTitle, newSubtitle, gameTitle: game.title, gameSubtitle: game.subtitle });
      break;

    case 'categories-generate':
      if (!result || !result.categories || !Array.isArray(result.categories)) {
        console.error('[applyResult] Invalid result for categories-generate:', result);
        return;
      }
      // Filter categories by checked items if provided (checked items are excluded)
      let categoriesToApply = result.categories;

      if (checkedItems && checkedItems instanceof Set) {
        categoriesToApply = result.categories.filter((cat, i) => {
          const catId = `cat-${i}`;
          // Exclude if the category itself is checked (marked for regeneration)
          // (individual clue checks are handled below)
          return !checkedItems.has(catId);
        }).map(cat => {
          // Filter clues within each category (exclude checked clues)
          const catIdx = result.categories.indexOf(cat);
          const uncheckedClues = cat.clues.filter((clue, j) => {
            const clueId = `cat-${catIdx}-clue-${j}`;
            return !checkedItems.has(clueId);
          });

          // If no clues remain after filtering, exclude the category entirely
          if (uncheckedClues.length === 0) {
            return null;
          }

          return {
            ...cat,
            clues: uncheckedClues
          };
        }).filter(cat => cat !== null);
      }

      // Ensure each category has contentTopic (use AI-provided or fallback to title)
      categoriesToApply.forEach(cat => {
        if (!cat.contentTopic || cat.contentTopic === '') {
          cat.contentTopic = cat.title;
        }
      });
      gameData.categories = categoriesToApply;
      // Preserve title/subtitle when updating gameData
      game.gameData = {
        title: game.title || gameData.title || "",
        subtitle: game.subtitle || gameData.subtitle || "",
        categories: categoriesToApply
      };
      // Also explicitly update nested game.categories if exists (for safety)
      if (game.game) {
        game.game.categories = categoriesToApply;
        // Ensure nested game has title/subtitle too
        if (!game.game.title) game.game.title = game.title;
        if (!game.game.subtitle) game.game.subtitle = game.subtitle;
      }
      // Reset selections to first items
      window.selectedCategoryIndex = 0;
      window.selectedClueIndex = 0;
      break;

    case 'category-rename':
      gameData.categories[selections.categoryIndex].title = result.names[0];
      game.gameData = {
        title: game.title || gameData.title || "",
        subtitle: game.subtitle || gameData.subtitle || "",
        categories: gameData.categories
      };
      break;

    case 'category-generate-clues':
    case 'category-replace-all':
      const catIndex = selections.categoryIndex;
      if (action === 'category-replace-all') {
        gameData.categories[catIndex].clues = result.category.clues;
      } else {
        // Fill empty questions or add missing values
        const existingClues = gameData.categories[catIndex].clues;
        const existingValues = new Set(existingClues.map(c => c.value));
        result.clues.forEach(clue => {
          const existingClue = existingClues.find(c => c.value === clue.value);
          if (existingClue) {
            // Replace if the existing clue is empty
            if (!existingClue.clue || !existingClue.clue.trim()) {
              existingClue.clue = clue.clue;
              existingClue.response = clue.response;
            }
          } else {
            // Add new clue for this value
            existingClues.push(clue);
          }
        });
        // Sort by value
        existingClues.sort((a, b) => a.value - b.value);
      }
      game.gameData = {
        title: game.title || gameData.title || "",
        subtitle: game.subtitle || gameData.subtitle || "",
        categories: gameData.categories
      };
      break;

    case 'questions-generate-five':
      gameData.categories[selections.categoryIndex].clues = result.clues;
      game.gameData = {
        title: game.title || gameData.title || "",
        subtitle: game.subtitle || gameData.subtitle || "",
        categories: gameData.categories
      };
      window.selectedClueIndex = 0;
      break;

    case 'question-generate-single':
      const qCatIdx = selections.categoryIndex;
      const qClueIdx = selections.clueIndex;
      gameData.categories[qCatIdx].clues[qClueIdx] = result.clue;
      game.gameData = {
        title: game.title || gameData.title || "",
        subtitle: game.subtitle || gameData.subtitle || "",
        categories: gameData.categories
      };
      break;

    case 'editor-generate-clue':
      const eCatIdx = selections.categoryIndex;
      const eClueIdx = selections.clueIndex;
      gameData.categories[eCatIdx].clues[eClueIdx].clue = result.clue;
      gameData.categories[eCatIdx].clues[eClueIdx].response = result.response;
      game.gameData = {
        title: game.title || gameData.title || "",
        subtitle: game.subtitle || gameData.subtitle || "",
        categories: gameData.categories
      };
      break;

    case 'editor-rewrite-clue':
      gameData.categories[selections.categoryIndex].clues[selections.clueIndex].clue = result.clue;
      game.gameData = {
        title: game.title || gameData.title || "",
        subtitle: game.subtitle || gameData.subtitle || "",
        categories: gameData.categories
      };
      break;

    case 'editor-generate-answer':
      gameData.categories[selections.categoryIndex].clues[selections.clueIndex].response = result.response;
      game.gameData = {
        title: game.title || gameData.title || "",
        subtitle: game.subtitle || gameData.subtitle || "",
        categories: gameData.categories
      };
      break;

    case 'editor-validate':
      // Validation doesn't modify data
      const validation = result;
      if (validation.valid) {
        aiToast.show({ message: '✓ Valid!', type: 'success', duration: 2000 });
      } else {
        const issues = validation.issues.join(', ');
        aiToast.show({ message: `Issues: ${issues}`, type: 'error', duration: 5000 });
      }
      return; // Don't re-render or save
  }

  // Auto-save after AI changes
  if (window.autoSave) {
    window.autoSave();
  }

  // Re-render editor
  if (renderEditor) {
    renderEditor();
  }
}

/**
 * Show toast with undo button
 */
function showUndoToast(snapshotId, action) {
  const actionLabels = {
    'game-title': 'Title updated',
    'categories-generate': 'Categories generated',
    'category-rename': 'Category renamed',
    'category-generate-clues': 'Clues generated',
    'category-replace-all': 'Clues replaced',
    'questions-generate-five': 'Questions generated',
    'question-generate-single': 'Question generated',
    'editor-generate-clue': 'Clue generated',
    'editor-rewrite-clue': 'Clue rewritten',
    'editor-generate-answer': 'Answer generated',
  };

  aiToast.show({
    message: actionLabels[action] || 'Applied',
    type: 'success',
    undo: () => undoSnapshot(snapshotId),
    duration: 5000
  });
}

/**
 * Undo a snapshot
 */
function undoSnapshot(snapshotId) {
  const snapshot = undoManager.restore(snapshotId);
  if (!snapshot) {
    aiToast.show({ message: 'Undo expired', type: 'error', duration: 2000 });
    return;
  }

  const gameHeader = getGameHeader();
  if (!gameHeader || !gameHeader._game) {
    aiToast.show({ message: 'Cannot undo: game changed', type: 'error', duration: 3000 });
    return;
  }

  const game = gameHeader._game;

  if (snapshot.scope === 'game') {
    // Restore full game
    game.gameData = snapshot.gameData;
    window.selectedCategoryIndex = snapshot.selections.categoryIndex;
    window.selectedClueIndex = snapshot.selections.clueIndex;
  } else {
    // Restore single item
    const { categoryIndex, clueIndex } = snapshot.selections;
    if (clueIndex !== null) {
      game.gameData.categories[categoryIndex].clues[clueIndex] = snapshot.item;
    } else {
      game.gameData.categories[categoryIndex] = snapshot.item;
    }
    window.selectedCategoryIndex = categoryIndex;
    window.selectedClueIndex = clueIndex;
  }

  // Auto-save after undo
  if (window.autoSave) {
    window.autoSave();
  }

  if (renderEditor) {
    renderEditor();
  }

  undoManager.clear(snapshotId);
  aiToast.show({ message: 'Undone', type: 'success', duration: 2000 });
}

// ==================== ACTION HANDLERS ====================
// Called by ai-buttons.js events

/**
 * Generate AI result and apply (unified handler)
 * @param {string} action - The AI action type
 * @param {object} context - Context for the AI prompt
 * @param {string} difficulty - Difficulty level
 * @param {object} retryContext - Optional context for retry (theme, difficulty)
 * @param {function} onRetry - Optional callback for retry button
 * @param {function} onCancel - Optional callback for cancel button (cleanup)
 * @param {function} onConfirm - Optional callback to run after preview is confirmed
 */
async function executeAIAction(action, context, difficulty, retryContext = null, onRetry = null, onCancel = null, onConfirm = null) {
  console.log('[executeAIAction] Starting:', action, context, difficulty);

  // Get appropriate loading message for the action
  const loadingMessages = {
    'categories-generate': '⏳ Generating full game... This may take a moment...',
    'game-title': '⏳ Generating title options...',
    'category-generate-clues': '⏳ Generating clues...',
    'category-replace-all': '⏳ Replacing all clues...',
    'questions-generate-five': '⏳ Generating 5 questions...',
    'editor-generate-clue': '⏳ Generating question...',
    'editor-rewrite-clue': '⏳ Enhancing question...',
    'editor-generate-answer': '⏳ Generating answer...',
  };

  const loadingMsg = loadingMessages[action] || '⏳ Generating...';
  const loader = aiToast.loading(loadingMsg);

  try {
    // Call AI service (server-side has prompts)
    console.log('[executeAIAction] Calling generateAI...');
    const rawResult = await generateAI(action, context, difficulty);
    console.log('[executeAIAction] Raw result from AI, length:', rawResult?.length);
    console.log('[executeAIAction] Raw result preview:', rawResult?.substring(0, 200));

    // Strip markdown manually here since safeJsonParse might be cached
    let cleaned = rawResult?.trim() || '';
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/g, '');
    cleaned = cleaned.trim();
    console.log('[executeAIAction] Cleaned preview:', cleaned.substring(0, 200));

    // Try manual parse first
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
      console.log('[executeAIAction] Manual parse success, keys:', Object.keys(parsed));
    } catch (e) {
      console.error('[executeAIAction] Manual parse failed:', e);
    }

    // Parse with schema validation
    console.log('[executeAIAction] Parsing with validator, exists?:', typeof window.validators[action]);
    const result = safeJsonParse(rawResult, window.validators[action]);
    console.log('[executeAIAction] Parsed result from safeJsonParse:', result);

    // If safeJsonParse returned null, use our manual parse
    const finalResult = result || parsed;
    console.log('[executeAIAction] Final result:', finalResult);

    // Determine mode (preview vs direct) - pass context to check if all empty
    const mode = needsPreview(action, context) ? 'preview' : 'direct';
    console.log('[executeAIAction] Mode:', mode);

    // Determine scope
    const scope = getScope(action);
    console.log('[executeAIAction] Scope:', scope);

    // Apply via centralized function
    console.log('[executeAIAction] Calling applyAIPatch...');
    applyAIPatch({ scope, action, result: finalResult, mode, context, retryContext, onRetry, onCancel, onConfirm });
    console.log('[executeAIAction] Done');

    // Dismiss loading toast - success will be shown by showUndoToast
    loader.dismiss();
    return true; // Return true to indicate success

  } catch (error) {
    console.error('[executeAIAction] Error:', error);
    loader.dismiss();

    if (error instanceof AISchemaError) {
      error.showDialog();
    } else {
      aiToast.show({
        message: error.message || 'AI generation failed',
        type: 'error',
        duration: 5000
      });
    }
    return false; // Return false to indicate failure
  }
}

/**
 * Determine if action needs preview (destructive operations)
 * For category-replace-all, skip preview if all questions are empty
 */
function needsPreview(action, context = null) {
  if (action === 'game-title') return true;
  if (action === 'categories-generate') return true;

  if (action === 'category-replace-all' && context?.existingClues) {
    // Check if all clues are empty
    const allEmpty = context.existingClues.every(clue =>
      !clue.clue || !clue.clue.trim()
    );
    // Skip preview if all questions are empty (acts like fill empty)
    return !allEmpty;
  }

  return false;
}

/**
 * Determine scope of action
 */
function getScope(action) {
  // Explicit game-level actions
  if (action === 'categories-generate' || action.startsWith('game-')) return 'game';
  if (action.startsWith('category-')) return 'category';
  if (action.startsWith('questions-')) return 'category';
  if (action.startsWith('question-')) return 'clue';
  if (action.startsWith('editor-')) return 'editor';
  return 'editor';
}

/**
 * Handle regeneration of individual category or clue
 */
async function handleRegenerateItem(action, itemType, catIndex, clueIndex, context) {
  try {
    const gameHeader = getGameHeader();
    if (!gameHeader || !gameHeader._gameData) {
      console.error('[handleRegenerateItem] No game loaded');
      aiToast.show({ message: 'No game loaded', type: 'error', duration: 3000 });
      return null;
    }

    const gameData = gameHeader._gameData;
    const category = gameData.categories[catIndex];

    let promptType;
    let itemContext;
    let result;

    if (itemType === 'category') {
      // Regenerate entire category - use category-replace-all to get all 5 clues
      promptType = 'category-replace-all';
      itemContext = {
        categoryTitle: category.title,
        contentTopic: category.contentTopic,
        theme: getCategoryForAI(catIndex),
        existingClues: category.clues
      };
    } else if (itemType === 'clue') {
      // Regenerate single clue
      promptType = 'question-generate-single';
      itemContext = {
        categoryTitle: category.title,
        contentTopic: category.contentTopic,
        value: category.clues[clueIndex].value,
        theme: getCategoryForAI(catIndex),
        existingClues: category.clues
      };
    }

    if (!promptType) {
      console.error('[handleRegenerateItem] Unknown item type:', itemType);
      return null;
    }

    // Call AI service
    const rawResult = await generateAI(promptType, itemContext, context?.difficulty || 'normal');
    const parsedResult = safeJsonParse(rawResult, window.validators[promptType]);

    if (!parsedResult) {
      console.error('[handleRegenerateItem] Failed to parse AI result');
      aiToast.show({ message: 'Failed to generate. Please try again.', type: 'error', duration: 3000 });
      return null;
    }

    return { itemType, catIndex, clueIndex, result: parsedResult };
  } catch (error) {
    console.error('[handleRegenerateItem] Error:', error);
    aiToast.show({
      message: error.message || 'Regeneration failed',
      type: 'error',
      duration: 3000
    });
    return null;
  }
}

/**
 * Get category for AI (using contentTopic or title)
 */
function getCategoryForAI(catIdx) {
  const gameHeader = getGameHeader();
  if (!gameHeader || !gameHeader._gameData) return '';

  const category = gameHeader._gameData.categories[catIdx];
  return category?.contentTopic || category?.title || '';
}

/**
 * Handle regeneration of multiple selected items (categories and clues)
 * @param {string} action - The original AI action
 * @param {Set} checkedItems - Set of checked item IDs (items to regenerate)
 * @param {object} result - The current result object to update
 * @param {object} context - AI context (difficulty, theme, etc.)
 */
async function handleRegenerateSelectedItems(action, checkedItems, result, context) {
  try {
    const gameHeader = getGameHeader();
    if (!gameHeader || !gameHeader._gameData) {
      console.error('[handleRegenerateSelectedItems] No game loaded');
      aiToast.show({ message: 'No game loaded', type: 'error', duration: 3000 });
      return null;
    }

    const gameData = gameHeader._gameData;

    // Separate checked items into categories and individual clues
    const checkedCategories = [];
    const checkedClues = [];

    result.categories.forEach((cat, i) => {
      const catId = `cat-${i}`;
      if (checkedItems.has(catId)) {
        checkedCategories.push({ index: i, category: cat });
      } else {
        // Category not checked - check for individual clues
        cat.clues.forEach((clue, j) => {
          const clueId = `cat-${i}-clue-${j}`;
          if (checkedItems.has(clueId)) {
            checkedClues.push({ catIndex: i, clueIndex: j, clue });
          }
        });
      }
    });

    const totalItems = checkedCategories.length + checkedClues.length;
    let completedItems = 0;

    // Show loading toast
    aiToast.show({ message: `Regenerating ${totalItems} item${totalItems > 1 ? 's' : ''}...`, type: 'info', duration: 0 });

    // Regenerate checked categories
    for (const { index: catIndex, category } of checkedCategories) {
      console.log('[handleRegenerateSelectedItems] Regenerating category:', catIndex);

      const promptType = 'category-replace-all';
      const itemContext = {
        categoryTitle: category.title,
        contentTopic: category.contentTopic,
        theme: category.contentTopic || category.title,
        existingClues: category.clues
      };

      const rawResult = await generateAI(promptType, itemContext, context?.difficulty || 'normal');

      console.log('[handleRegenerateSelectedItems] Category rawResult length:', rawResult.length);
      console.log('[handleRegenerateSelectedItems] Category rawResult preview:', rawResult.substring(0, 300));

      // Try to parse with validator first
      let parsedResult = safeJsonParse(rawResult, window.validators[promptType]);

      console.log('[handleRegenerateSelectedItems] Category parsedResult with validator:', parsedResult);

      // If validator fails, try manual parse
      if (!parsedResult) {
        console.log('[handleRegenerateSelectedItems] Validator failed, trying manual parse...');
        try {
          // Strip markdown and parse manually
          let cleaned = rawResult.trim();
          cleaned = cleaned.replace(/^```json\s*/i, '');
          cleaned = cleaned.replace(/^```\s*/i, '');
          cleaned = cleaned.replace(/\s*```$/g, '');
          cleaned = cleaned.trim();
          parsedResult = JSON.parse(cleaned);
          console.log('[handleRegenerateSelectedItems] Manual parse succeeded:', parsedResult);
        } catch (e) {
          console.error('[handleRegenerateSelectedItems] Manual parse also failed:', e);
          completedItems++;
          continue; // Skip this item
        }
      }

      // Handle both wrapped and unwrapped responses
      const categoryData = parsedResult?.category || parsedResult;
      if (categoryData && categoryData.title && categoryData.clues) {
        result.categories[catIndex] = categoryData;
        const catId = `cat-${catIndex}`;
        // Mark as regenerated (for visual highlighting)
        console.log('[handleRegenerateSelectedItems] Adding catId to regeneratedItems:', catId);
        window.aiPreview.regeneratedItems.add(catId);
        console.log('[handleRegenerateSelectedItems] regeneratedItems size:', window.aiPreview.regeneratedItems.size);
        // Uncheck this category (it's been regenerated and should be shown as fresh)
        window.aiPreview.checkedItems.delete(catId);
        // Also uncheck and mark all its clues as regenerated
        categoryData.clues.forEach((_, j) => {
          window.aiPreview.checkedItems.delete(`cat-${catIndex}-clue-${j}`);
          const clueId = `cat-${catIndex}-clue-${j}`;
          window.aiPreview.regeneratedItems.add(clueId);
        });
        console.log('[handleRegenerateSelectedItems] After adding clues, regeneratedItems size:', window.aiPreview.regeneratedItems.size);
      } else {
        console.log('[handleRegenerateSelectedItems] categoryData invalid:', categoryData);
      }
      completedItems++;
    }

    // Regenerate checked individual clues
    for (const { catIndex, clueIndex, clue } of checkedClues) {
      console.log('[handleRegenerateSelectedItems] Regenerating clue:', catIndex, clueIndex);

      const category = result.categories[catIndex];
      const promptType = 'question-generate-single';
      const itemContext = {
        categoryTitle: category.title,
        contentTopic: category.contentTopic,
        value: clue.value,
        theme: category.contentTopic || category.title,
        existingClues: category.clues
      };

      const rawResult = await generateAI(promptType, itemContext, context?.difficulty || 'normal');

      console.log('[handleRegenerateSelectedItems] Clue rawResult length:', rawResult.length);

      // Try to parse with validator first
      let parsedResult = safeJsonParse(rawResult, window.validators[promptType]);

      console.log('[handleRegenerateSelectedItems] Clue parsedResult with validator:', parsedResult);

      // If validator fails, try manual parse
      if (!parsedResult) {
        console.log('[handleRegenerateSelectedItems] Validator failed for clue, trying manual parse...');
        try {
          // Strip markdown and parse manually
          let cleaned = rawResult.trim();
          cleaned = cleaned.replace(/^```json\s*/i, '');
          cleaned = cleaned.replace(/^```\s*/i, '');
          cleaned = cleaned.replace(/\s*```$/g, '');
          cleaned = cleaned.trim();
          parsedResult = JSON.parse(cleaned);
          console.log('[handleRegenerateSelectedItems] Manual parse succeeded for clue:', parsedResult);
        } catch (e) {
          console.error('[handleRegenerateSelectedItems] Manual parse also failed for clue:', e);
          completedItems++;
          continue; // Skip this item
        }
      }

      // Handle both wrapped and unwrapped responses
      const clueData = parsedResult?.clue || parsedResult;
      if (clueData && clueData.clue && clueData.response) {
        result.categories[catIndex].clues[clueIndex] = clueData;
        const clueId = `cat-${catIndex}-clue-${clueIndex}`;
        // Mark as regenerated (for visual highlighting)
        console.log('[handleRegenerateSelectedItems] Adding clueId to regeneratedItems:', clueId);
        window.aiPreview.regeneratedItems.add(clueId);
        console.log('[handleRegenerateSelectedItems] regeneratedItems size:', window.aiPreview.regeneratedItems.size);
        // Uncheck this clue (it's been regenerated)
        window.aiPreview.checkedItems.delete(clueId);
      } else {
        console.log('[handleRegenerateSelectedItems] clueData invalid:', clueData);
      }
      completedItems++;
    }

    // Show success toast
    aiToast.show({ message: `Regenerated ${completedItems} item${completedItems > 1 ? 's' : ''}!`, type: 'success', duration: 2000 });

    console.log('[handleRegenerateSelectedItems] Final regeneratedItems:', Array.from(window.aiPreview.regeneratedItems));
    console.log('[handleRegenerateSelectedItems] Complete, updated result:', result);
    return { success: true };
  } catch (error) {
    console.error('[handleRegenerateSelectedItems] Error:', error);
    aiToast.show({
      message: error.message || 'Regeneration failed',
      type: 'error',
      duration: 3000
    });
    return null;
  }
}
