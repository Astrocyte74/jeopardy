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
    // Show preview dialog first
    console.log('[applyAIPatch] Showing preview dialog, window.aiPreview:', window.aiPreview, 'result:', result);
    window.aiPreview.show(result, {
      type: action,
      data: result,
      context: context,
      onRetry: onRetry,
      onConfirm: async () => {
        // User confirmed - take snapshot and apply
        if (snapshotScope === 'game') {
          undoManager.saveSnapshot(snapshotId, 'game', { gameData, selections });
        } else {
          const item = getCurrentItem(scope, gameData, selections);
          undoManager.saveSnapshot(snapshotId, 'single', { item, selections });
        }
        applyResult(action, result, game, gameData, selections);
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
      },
      onCancel: () => {
        // Call cleanup callback if provided (e.g., for wizard cancel)
        if (onCancel) {
          onCancel();
        }
        aiToast.show({ message: 'Cancelled', type: 'info', duration: 2000 });
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
function applyResult(action, result, game, gameData, selections) {
  switch (action) {
    case 'game-title':
      game.title = result.titles[0].title;
      game.subtitle = result.titles[0].subtitle;
      // Also update nested game.title/subtitle if exists
      if (game.game) {
        game.game.title = result.titles[0].title;
        game.game.subtitle = result.titles[0].subtitle;
      }
      game.gameData = gameData;
      break;

    case 'categories-generate':
      gameData.categories = result.categories;
      game.gameData = gameData;
      // Also explicitly update nested game.categories if exists (for safety)
      if (game.game) {
        game.game.categories = result.categories;
      }
      // Reset selections to first items
      window.selectedCategoryIndex = 0;
      window.selectedClueIndex = 0;
      break;

    case 'category-rename':
      gameData.categories[selections.categoryIndex].title = result.names[0];
      game.gameData = gameData;
      break;

    case 'category-generate-clues':
    case 'category-replace-all':
      const catIndex = selections.categoryIndex;
      if (action === 'category-replace-all') {
        gameData.categories[catIndex].clues = result.category.clues;
      } else {
        // Merge - fill missing values
        const existingClues = gameData.categories[catIndex].clues;
        const existingValues = new Set(existingClues.map(c => c.value));
        result.clues.forEach(clue => {
          if (!existingValues.has(clue.value)) {
            existingClues.push(clue);
          }
        });
        // Sort by value
        existingClues.sort((a, b) => a.value - b.value);
      }
      game.gameData = gameData;
      break;

    case 'questions-generate-five':
      gameData.categories[selections.categoryIndex].clues = result.clues;
      game.gameData = gameData;
      window.selectedClueIndex = 0;
      break;

    case 'question-generate-single':
      const qCatIdx = selections.categoryIndex;
      const qClueIdx = selections.clueIndex;
      gameData.categories[qCatIdx].clues[qClueIdx] = result.clue;
      game.gameData = gameData;
      break;

    case 'editor-generate-clue':
      const eCatIdx = selections.categoryIndex;
      const eClueIdx = selections.clueIndex;
      gameData.categories[eCatIdx].clues[eClueIdx].clue = result.clue;
      gameData.categories[eCatIdx].clues[eClueIdx].response = result.response;
      game.gameData = gameData;
      break;

    case 'editor-rewrite-clue':
      gameData.categories[selections.categoryIndex].clues[selections.clueIndex].clue = result.clue;
      game.gameData = gameData;
      break;

    case 'editor-generate-answer':
      gameData.categories[selections.categoryIndex].clues[selections.clueIndex].response = result.response;
      game.gameData = gameData;
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
      return; // Don't re-render or mark dirty
  }

  // Mark as dirty and re-render
  window.dirty = true;
  const saveBtn = document.getElementById('creatorSaveBtn');
  if (saveBtn) saveBtn.disabled = false;

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

  // Mark dirty and re-render
  window.dirty = true;
  const saveBtn = document.getElementById('creatorSaveBtn');
  if (saveBtn) saveBtn.disabled = false;

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

    // Determine mode (preview vs direct)
    const mode = needsPreview(action) ? 'preview' : 'direct';
    console.log('[executeAIAction] Mode:', mode);

    // Determine scope
    const scope = getScope(action);
    console.log('[executeAIAction] Scope:', scope);

    // Apply via centralized function
    console.log('[executeAIAction] Calling applyAIPatch...');
    applyAIPatch({ scope, action, result: finalResult, mode, context: retryContext, onRetry, onCancel, onConfirm });
    console.log('[executeAIAction] Done');
    return true; // Return true to indicate success

  } catch (error) {
    console.error('[executeAIAction] Error:', error);
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
 */
function needsPreview(action) {
  return ['categories-generate', 'category-replace-all'].includes(action);
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
