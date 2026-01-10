(function() {
  'use strict';

  console.log('[GameCreatorEditor] Module loading...');

  const GameCreatorEditor = {
    Render: {
      categories() {
        const categoriesList = document.getElementById("creatorCategoriesList");
        if (!categoriesList) return;

        categoriesList.innerHTML = "";
        const creatorData = window.GameCreatorState.state.creatorData;

        creatorData.categories.forEach((category, index) => {
          const item = document.createElement("div");
          item.className = `creator-category-item${category.id === window.GameCreatorState.state.selectedCategoryId ? " selected" : ""}`;
          item.innerHTML = `
            <div class="creator-category-header">
              <span class="creator-category-icon">${category.icon || "📁"}</span>
              <span class="creator-category-name">${category.name}</span>
              <div class="creator-category-actions">
                ${index > 0 ? `
                  <button class="creator-action-btn creator-up-btn" title="Move up" type="button">↑</button>
                  <button class="creator-action-btn creator-down-btn" title="Move down" type="button">↓</button>
                  <button class="creator-action-btn creator-rename-btn" title="Rename" type="button">✏️</button>
                  <button class="creator-action-btn creator-delete-btn" title="Delete" type="button">🗑</button>
                ` : ""}
              </div>
            </div>
          `;

          // Select category (only when clicking the header, not the actions)
          const header = item.querySelector(".creator-category-header");
          header.addEventListener("click", (e) => {
            if (!e.target.closest(".creator-category-actions")) {
              window.GameCreatorState.state.selectedCategoryId = category.id;
              window.GameCreatorEditor.Render.categories();
              window.GameCreatorEditor.Render.games();
            }
          });

          // Up button
          const upBtn = item.querySelector(".creator-up-btn");
          if (upBtn) {
            upBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              if (index > 0) {
                [creatorData.categories[index - 1], creatorData.categories[index]] =
                [creatorData.categories[index], creatorData.categories[index - 1]];
                window.GameCreatorStorage.saveCreatorData(creatorData);  // Save immediately
                window.GameCreatorEditor.Render.categories();
              }
            });
          }

          // Down button
          const downBtn = item.querySelector(".creator-down-btn");
          if (downBtn) {
            downBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              if (index < creatorData.categories.length - 1) {
                [creatorData.categories[index], creatorData.categories[index + 1]] =
                [creatorData.categories[index + 1], creatorData.categories[index]];
                window.GameCreatorStorage.saveCreatorData(creatorData);  // Save immediately
                window.GameCreatorEditor.Render.categories();
              }
            });
          }

          // Rename button - inline edit
          const renameBtn = item.querySelector(".creator-rename-btn");
          if (renameBtn) {
            renameBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              window.GameCreatorUI.showInlineRename(item, category.name, (newName) => {
                if (newName) {
                  category.name = newName.trim();
                  window.GameCreatorStorage.saveCreatorData(window.GameCreatorState.state.creatorData);  // Save immediately
                  window.GameCreatorEditor.Render.categories();
                }
              });
            });
          }

          // Delete button
          const deleteBtn = item.querySelector(".creator-delete-btn");
          if (deleteBtn) {
            deleteBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              window.GameCreatorUI.showDeleteCategoryDialog(category, index);
            });
          }

          categoriesList.appendChild(item);
        });
      },

      games() {
        const gamesList = document.getElementById("creatorGamesList");
        const searchInput = document.getElementById("creatorSearchInput");
        const searchCount = document.getElementById("creatorSearchCount");
        if (!gamesList) return;

        gamesList.innerHTML = "";
        const searchTerm = searchInput.value.toLowerCase().trim();

        // Filter games by search term only (no category filtering in Game Creator)
        // Category filtering happens on the main menu
        let filteredGames = window.GameCreatorState.state.allCreatorGames.filter(game => {
          // Get live title/subtitle from the game reference (not stale copied values)
          const displayTitle = game.source === "creator" && game.game ? game.game.title : game.title;
          const displaySubtitle = game.source === "creator" && game.game ? game.game.subtitle : game.subtitle;
          const searchMatch = !searchTerm ||
            displayTitle.toLowerCase().includes(searchTerm) ||
            displaySubtitle.toLowerCase().includes(searchTerm);
          return searchMatch;
        });

        searchCount.textContent = filteredGames.length;

        // Add "New Game" card as first item
        const addGameCard = document.createElement("div");
        addGameCard.className = "creator-game-item creator-game-add";
        addGameCard.innerHTML = `
          <div class="creator-game-title">+ New Game</div>
          <div class="creator-game-subtitle">Create with AI wizard</div>
          <div class="creator-game-actions">
            <span class="creator-game-hint">✨ Theme → Difficulty → Generate</span>
          </div>
        `;

        addGameCard.addEventListener("click", async () => {
          const success = await runNewGameWizard();
          if (success) {
            // Wizard completed successfully - game will be auto-selected
            console.log('[NewGameCard] Wizard completed, game created');
          }
        });

        gamesList.appendChild(addGameCard);

        // Divider after add card
        const divider = document.createElement("div");
        divider.className = "creator-game-divider";
        divider.innerHTML = '<div class="divider-line"></div>';
        gamesList.appendChild(divider);

        filteredGames.forEach(game => {
          const item = document.createElement("div");
          item.className = `creator-game-item${game.id === window.GameCreatorState.state.selectedGameId ? " selected" : ""}`;

          // Get live title/subtitle from the game reference (not stale copied values)
          // For creator games, use game.game.title (live reference)
          // For file/custom games, use game.title (these are the actual values)
          const displayTitle = game.source === "creator" && game.game ? game.game.title : game.title;
          const displaySubtitle = game.source === "creator" && game.game ? game.game.subtitle : game.subtitle;

          item.innerHTML = `
            <div class="creator-game-info">
              <div class="creator-game-title">${displayTitle}</div>
              <div class="creator-game-subtitle">${displaySubtitle || "No subtitle"}</div>
            </div>
            <div class="creator-game-actions">
              <button class="row-action-btn creator-game-edit-btn" title="Edit game" type="button">✏️</button>
              <button class="row-action-btn creator-game-delete-btn" title="Delete game" type="button">🗑</button>
            </div>
          `;

          // Select game
          item.addEventListener("click", (e) => {
            if (!e.target.closest(".creator-game-actions")) {
              window.GameCreatorState.state.selectedGameId = game.id;
              window.GameCreatorEditor.Render.games();
              window.GameCreatorEditor.Render.editor();
            }
          });

          // Edit button - inline edit for game title
          const editBtn = item.querySelector(".creator-game-edit-btn");
          editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const displayTitle = game.source === "creator" && game.game ? game.game.title : game.title;
            window.GameCreatorUI.showInlineRename(item, displayTitle, (newTitle) => {
              if (newTitle) {
                game.title = newTitle.trim();
                // Update in creatorData if it's a creator game
                if (game.source === "creator") {
                  const creatorData = window.GameCreatorState.state.creatorData;
                  const creatorGame = creatorData.games.find(g => g.id === game.id);
                  if (creatorGame) {
                    creatorGame.title = newTitle.trim();
                    // Also update the nested game.game.title
                    if (creatorGame.game) {
                      creatorGame.game.title = newTitle.trim();
                    }
                  }
                  window.GameCreatorStorage.saveCreatorData(creatorData);  // Save immediately
                }
                // Update in custom games if applicable
                if (game.source === "custom" || game.source === "file") {
                  const custom = window.loadCustomGames();
                  const customGame = custom.find(g => g.id === game.id);
                  if (customGame) {
                    customGame.title = newTitle.trim();
                    window.saveCustomGames(custom);
                  }
                }
                window.GameCreatorState.state.autoSave();  // Auto-save on change
                window.GameCreatorEditor.Render.games();
              }
            });
          });

          // Delete button (two-step)
          const deleteBtn = item.querySelector(".creator-game-delete-btn");
          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (window.GameCreatorState.state.pendingDeleteGameId === game.id) {
              // Confirmed delete
              window.GameCreatorEditor.Actions.deleteGame(game);
            } else {
              // First click - show confirmation
              window.GameCreatorState.state.pendingDeleteGameId = game.id;
              deleteBtn.textContent = "⚠️";
              deleteBtn.title = "Click again to confirm";
              setTimeout(() => {
                if (window.GameCreatorState.state.pendingDeleteGameId === game.id) {
                  window.GameCreatorState.state.pendingDeleteGameId = null;
                  deleteBtn.textContent = "🗑";
                  deleteBtn.title = "Delete";
                }
              }, 3000);
            }
          });

          gamesList.appendChild(item);
        });

        // Show empty state
        if (filteredGames.length === 0) {
          gamesList.innerHTML = `
            <div class="creator-empty-state">
              <div class="creator-empty-icon">🎮</div>
              <div class="creator-empty-text">
                ${searchTerm ? "No games match your search" : "No games yet. Click + to add one!"}
              </div>
            </div>
          `;
        }
      },

      async editor() {
        const gameHeader = document.getElementById("creatorGameHeader");
        const workspaceGrid = document.getElementById("creatorWorkspaceGrid");

        // Always show workspace grid for consistent height
        if (workspaceGrid) workspaceGrid.style.display = "grid";

        if (!window.GameCreatorState.state.selectedGameId) {
          // Select first available game instead of creating blank template
          if (window.GameCreatorState.state.allCreatorGames.length > 0) {
            window.GameCreatorState.state.selectedGameId = window.GameCreatorState.state.allCreatorGames[0].id;
            window.GameCreatorState.state.selectedCategoryIndex = 0;
            window.GameCreatorState.state.selectedClueIndex = null;
            window.GameCreatorEditor.Render.games();
          } else {
            // No games exist - show empty state
            if (gameHeader) {
              gameHeader.innerHTML = `
                <div class="creator-empty-state">
                  <div class="creator-empty-icon">🎮</div>
                  <div class="creator-empty-title">No games yet</div>
                  <div class="creator-empty-text">Click + next to "Games" to create one</div>
                </div>
              `;
            }
            return;
          }
        }

        const game = window.GameCreatorState.state.allCreatorGames.find(g => g.id === window.GameCreatorState.state.selectedGameId);
        if (!game) {
          window.GameCreatorState.state.selectedGameId = null;
          window.GameCreatorEditor.Render.editor();
          return;
        }

        // For file-based games, load the data on demand
        // For creator games, use live reference from game.game (not stale gameData snapshot)
        let gameData;
        if (game.source === "creator" && game.game) {
          // Use live game object with current categories (not stale snapshot)
          // Note: game.game has nested structure: {id, title, game: {title, subtitle, categories}}
          // We need the inner game object which has categories
          gameData = game.game.game || game.game;
        } else {
          // For file/custom games, use gameData (may need loading)
          gameData = game.gameData;
        }

        if (game.source === "file" && !gameData && game.path) {
          try {
            gameData = await loadGameJsonFromPath(game.path);
          } catch (err) {
            if (gameHeader) {
              gameHeader.innerHTML = `
                <div class="creator-empty-state">
                  <div class="creator-empty-icon">⚠️</div>
                  <div class="creator-empty-title">Error loading game</div>
                  <div class="creator-empty-text">${err.message}</div>
                </div>
              `;
            }
            return;
          }
        }

        // Normalize game data to have categories array
        const categories = gameData?.categories || [];

        // Auto-select first category and first question if nothing is selected
        // OR if selected index is out of bounds (safety for switching games)
        if (window.GameCreatorState.state.selectedCategoryIndex === null || window.GameCreatorState.state.selectedCategoryIndex >= categories.length) {
          if (categories.length > 0) {
            window.GameCreatorState.state.selectedCategoryIndex = 0;
            window.GameCreatorState.state.selectedClueIndex = null;  // Reset clue index when changing category
          }
        }
        if (window.GameCreatorState.state.selectedClueIndex === null && window.GameCreatorState.state.selectedCategoryIndex !== null) {
          const category = categories[window.GameCreatorState.state.selectedCategoryIndex];
          if (category?.clues && category.clues.length > 0) {
            window.GameCreatorState.state.selectedClueIndex = 0;
          }
        }

        // Calculate game stats
        const categoryCount = categories.length;
        const cluesCount = categories.reduce((sum, cat) => sum + (cat.clues?.length || 0), 0);

        // Build category options for game-level category assignment
        const creatorData = window.GameCreatorState.state.creatorData;
        const gameCategoryId = game.categoryId || window.GameCreatorState.state.selectedCategoryId || creatorData.categories[0]?.id || "";
        const categoryOptions = creatorData.categories.map(cat =>
          `<option value="${cat.id}" ${cat.id === gameCategoryId ? 'selected' : ''}>${cat.name}</option>`
        ).join('');

        // Show game header
        if (gameHeader) {
          gameHeader.innerHTML = `
            <div class="game-header">
              <div class="game-header-main">
                <input id="editorTitle" type="text" value="${game.title || ""}" placeholder="Untitled Game" autocomplete="off" />
                <input id="editorSubtitle" type="text" value="${game.subtitle || ""}" placeholder="Add a description..." autocomplete="off" />
                <div class="game-category-assign">
                  <label class="game-category-label">Folder:</label>
                  <select id="editorGameCategory" class="game-category-select" title="Assign this game to a folder">
                    ${categoryOptions}
                  </select>
                </div>
                <div class="game-stats">${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'} • ${cluesCount} ${cluesCount === 1 ? 'clue' : 'clues'}</div>
              </div>
              <div class="game-metadata">
                <!-- AI Pill - single unit containing all AI controls -->
                <div class="ai-pill">
                  <div class="ai-action-menu" data-menu-id="ai-menu-game">
                    <button class="ai-pill-trigger" data-ai-trigger="dropdown" aria-label="AI controls for this game" title="AI: Generate game content">
                      <span class="ai-pill-icon">✨</span>
                      <span class="ai-pill-label">AI</span>
                      <span class="ai-pill-difficulty" id="aiPillDifficulty">Normal</span>
                    </button>
                    <div class="ai-action-dropdown" id="ai-menu-game">
                      <div class="ai-action-dropdown-header">AI for this game</div>
                      <button class="ai-action-item" data-ai-action="game-title" title="Smart title generation: analyzes your game content or asks for a theme">
                        <span class="ai-action-icon">📝</span>
                        Generate title & subtitle
                      </button>
                      <button class="ai-action-item" data-ai-action="categories-generate" title="Generate complete game from a theme - all categories and questions">
                        <span class="ai-action-icon">🎯</span>
                        Generate full game (categories & questions)
                      </button>
                      <div class="ai-action-divider"></div>
                      <div class="ai-action-difficulty-section">
                        <div class="ai-action-section-title">Difficulty</div>
                        <div class="ai-difficulty-options" id="aiDifficultyOptions">
                          <label class="ai-difficulty-option">
                            <input type="radio" name="aiDifficulty" value="easy">
                            <span class="ai-difficulty-label-text">Easy</span>
                          </label>
                          <label class="ai-difficulty-option">
                            <input type="radio" name="aiDifficulty" value="normal" checked>
                            <span class="ai-difficulty-label-text">Normal</span>
                          </label>
                          <label class="ai-difficulty-option">
                            <input type="radio" name="aiDifficulty" value="hard">
                            <span class="ai-difficulty-label-text">Hard</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Separator -->
                <div class="header-zone-divider"></div>

                <!-- System Zone (neutral, de-emphasized) -->
                <div class="header-zone header-zone-system">
                  <div class="action-menu">
                    <button class="action-menu-trigger" id="creatorMenuTrigger" type="button" title="File options">💾</button>
                    <div class="action-menu-dropdown" id="creatorMenuDropdown">
                      <button class="action-menu-item" id="creatorImportBtn" type="button">
                        <span class="action-menu-icon">📥</span>
                        <span>Import JSON</span>
                      </button>
                      <button class="action-menu-item" id="creatorExportBtn" type="button">
                        <span class="action-menu-icon">📤</span>
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `;
        }

        // Show workspace grid
        if (workspaceGrid) workspaceGrid.style.display = "grid";

        // Store game data for updates
        gameHeader._gameData = gameData;
        gameHeader._game = game;

        // Render categories (left column)
        window.GameCreatorEditor.Render.categoriesColumn(categories);

        // Render clues (middle column)
        window.GameCreatorEditor.Render.cluesColumn(categories);

        // Render editor (right column)
        window.GameCreatorEditor.Render.editorPanel(categories);

        // Setup menu listeners for the newly rendered menu
        window.GameCreatorUI.setupMenuListeners();

        // Setup header event listeners
        window.GameCreatorUI.setupHeaderEventListeners(gameHeader, game, gameData);

        // Initialize AI actions with Game Creator context
        if (typeof initAIActions === 'function') {
          initAIActions({
            getGameHeader: () => gameHeader,
            renderEditor: window.GameCreatorEditor.Render.editor
          });
        }

        // Setup AI button handlers
        if (typeof setupAIButtonHandlers === 'function') {
          setupAIButtonHandlers();
        }
      },

      categoriesColumn(categories) {
        const categoriesList = document.getElementById("workspaceCategoriesList");
        const categoriesCountValueEl = document.getElementById("categoriesCountValue");
        if (!categoriesList) return;

        // Update the categories count display
        if (categoriesCountValueEl) {
          categoriesCountValueEl.textContent = categories.length.toString();
        }

        if (categories.length === 0) {
          categoriesList.innerHTML = `
            <div class="editor-empty-state">
              <div class="editor-empty-text">No categories yet</div>
            </div>
          `;
          return;
        }

        categoriesList.innerHTML = categories.map((cat, index) => {
          const clueCount = (cat.clues || []).length;
          const isComplete = clueCount >= 5;
          const isSelected = window.GameCreatorState.state.selectedCategoryIndex === index;

          return `
            <div class="category-card-item ${isSelected ? 'selected' : ''}" data-category-index="${index}">
              <span class="category-card-number">${index + 1}</span>
              <div class="category-card-info">
                <div class="category-card-title" data-category-title="${index}">${cat.title || '(Untitled)'}</div>
                ${cat.contentTopic ? `<div class="category-card-topic" title="Content topic for AI">📝 ${cat.contentTopic}</div>` : ''}
                <div class="category-card-count">${clueCount} ${clueCount === 1 ? 'clue' : 'clues'}${isComplete ? ' • ✔' : ''}</div>
              </div>
              <div class="category-card-actions">
                <button type="button" class="row-action-btn category-card-edit-btn" data-category-index="${index}" title="Edit category name">✏️</button>
              </div>
            </div>
          `;
        }).join('');

        // Add click listeners for category selection
        categoriesList.querySelectorAll(".category-card-item").forEach((item, catIndex) => {
          // Single click to select category
          item.addEventListener("click", (e) => {
            // Don't select if clicking on edit button
            if (e.target.closest('.category-card-edit-btn')) return;

            // Always select the category (even when clicking AI button)
            window.GameCreatorState.state.selectedCategoryIndex = catIndex;
            window.GameCreatorState.state.selectedClueIndex = null; // Reset clue selection when changing category
            window.GameCreatorEditor.Render.editor();
          });

          // Edit button click handler
          const editBtn = item.querySelector('.category-card-edit-btn');
          if (editBtn) {
            editBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              const category = categories[catIndex];
              const currentTitle = category.title || '';
              const currentTopic = category.contentTopic || '';

              // Show dialog with both fields
              window.showCategoryEditDialog(currentTitle, currentTopic).then((result) => {
                if (!result || (result.title === null && result.topic === null)) return; // User cancelled

                const gameHeader = document.getElementById("creatorGameHeader");
                if (!gameHeader || !gameHeader._gameData) return;

                const newTitle = result.title;
                const newTopic = result.topic;

                // Update title if changed
                if (newTitle !== undefined && newTitle !== currentTitle) {
                  category.title = newTitle;
                }

                // Update content topic if changed
                if (newTopic !== undefined && newTopic !== currentTopic) {
                  category.contentTopic = newTopic;
                }

                gameHeader._game.gameData = gameHeader._gameData;
                window.GameCreatorState.state.autoSave();
                window.GameCreatorEditor.Render.categoriesColumn(categories);
              });
            });
          }
        });

        // Inject AI buttons for each category
        if (typeof injectCategoryAIButtons === 'function') {
          categoriesList.querySelectorAll(".category-card-item").forEach((item, index) => {
            injectCategoryAIButtons(item, index);
          });
        }
      },

      cluesColumn(categories) {
        const cluesList = document.getElementById("workspaceCluesList");
        const metaEl = document.getElementById("cluesColumnMeta");
        const countValueEl = document.getElementById("questionsCountValue");
        if (!cluesList) return;

        // Update the questions count display to show minimum across all categories
        if (countValueEl && categories.length > 0) {
          const minCount = Math.min(...categories.map(cat => cat.clues?.length || 0));
          countValueEl.textContent = minCount.toString();
        }

        if (window.GameCreatorState.state.selectedCategoryIndex === null || !categories[window.GameCreatorState.state.selectedCategoryIndex]) {
          if (metaEl) metaEl.textContent = "";
          cluesList.innerHTML = `
            <div class="editor-empty-state">
              <div class="editor-empty-icon">📂</div>
              <div class="editor-empty-text">Select a category</div>
            </div>
          `;
          return;
        }

        const category = categories[window.GameCreatorState.state.selectedCategoryIndex];
        const clues = category.clues || [];

        if (metaEl) metaEl.textContent = `${clues.length} questions`;

        if (clues.length === 0) {
          cluesList.innerHTML = `
            <div class="editor-empty-state">
              <div class="editor-empty-text">No questions yet</div>
            </div>
          `;
          return;
        }

        cluesList.innerHTML = clues.map((clue, index) => {
          const isSelected = window.GameCreatorState.state.selectedClueIndex === index;
          const isComplete = clue.clue && clue.response;

          return `
            <div class="clue-card-item ${isSelected ? 'selected' : ''}" data-clue-index="${index}">
              <span class="clue-value-badge">$${clue.value || 200}</span>
              <span class="clue-card-preview${!clue.clue ? ' empty' : ''}">${clue.clue || '(No question yet)'}</span>
              ${isComplete ? '<span class="clue-card-complete">✔</span>' : ''}
              <div class="clue-card-actions"></div>
            </div>
          `;
        }).join('');

        // Add click listeners
        cluesList.querySelectorAll(".clue-card-item").forEach(item => {
          item.addEventListener("click", (e) => {
            // Always select the clue (even when clicking AI button)
            const clueIndex = parseInt(item.dataset.clueIndex);
            window.GameCreatorState.state.selectedClueIndex = clueIndex;
            window.GameCreatorEditor.Render.editor();
          });
        });

        // Inject AI buttons for each question
        if (typeof injectQuestionAIButtons === 'function') {
          cluesList.querySelectorAll(".clue-card-item").forEach((item) => {
            injectQuestionAIButtons(item);
          });
        }
      },

      editorPanel(categories) {
        const editorPanel = document.getElementById("workspaceEditorPanel");
        if (!editorPanel) return;

        if (window.GameCreatorState.state.selectedCategoryIndex === null || window.GameCreatorState.state.selectedClueIndex === null) {
          editorPanel.innerHTML = `
            <div class="editor-empty-state">
              <div class="editor-empty-icon">✏️</div>
              <div class="editor-empty-text">Select a clue to edit</div>
            </div>
          `;
          return;
        }

        const category = categories[window.GameCreatorState.state.selectedCategoryIndex];
        const clue = category.clues?.[window.GameCreatorState.state.selectedClueIndex];

        if (!clue) {
          editorPanel.innerHTML = `
            <div class="editor-empty-state">
              <div class="editor-empty-text">Clue not found</div>
            </div>
          `;
          return;
        }

        editorPanel.innerHTML = `
          <form class="editor-form" id="clueEditorForm">
            <div class="editor-form-row">
              <label>Value</label>
              <input type="number" id="clueValueInput" value="${clue.value || 200}" placeholder="200" />
            </div>

            <div class="editor-form-row">
              <div class="editor-form-header">
                <label>Question</label>
                <div class="editor-field-actions" data-field="question"></div>
              </div>
              <textarea id="clueQuestionInput" placeholder="Enter question..." rows="3">${clue.clue || ''}</textarea>
            </div>

            <div class="editor-form-row">
              <div class="editor-form-header">
                <label>Answer</label>
                <div class="editor-field-actions" data-field="answer"></div>
              </div>
              <textarea id="clueAnswerInput" placeholder="Enter answer..." rows="2">${clue.response || ''}</textarea>
            </div>
          </form>

          <div class="editor-footer">
            <button type="button" class="editor-footer-btn danger" id="deleteClueBtn">
              <span class="btn-icon">🗑️</span>
              Delete
            </button>
          </div>
        `;

        // Setup form listeners
        window.GameCreatorUI.setupClueEditorListeners(editorPanel, categories, category, clue);

        // Inject AI buttons in editor panel
        if (typeof injectEditorAIButtons === 'function') {
          injectEditorAIButtons();
        }
      },
    },

    Actions: {
      async createNewGame() {
        const creatorData = window.GameCreatorState.state.creatorData;

        // Find or create "Custom" category
        let customCategory = creatorData.categories.find(c => c.id === "custom");
        if (!customCategory) {
          customCategory = {
            id: "custom",
            name: "Custom",
            icon: "📁"
          };
          creatorData.categories.push(customCategory);
        }

        // Create new game with default structure
        const newGame = {
          id: `game_${window.GameCreatorUtils.generateId()}`,
          title: "New Game",
          subtitle: "",
          categoryId: customCategory.id, // Assign to Custom category
          game: {
            title: "New Game",
            subtitle: "",
            categories: [
              { title: "", contentTopic: "", clues: [
                { value: 200, clue: "", response: "" },
                { value: 400, clue: "", response: "" },
                { value: 600, clue: "", response: "" },
                { value: 800, clue: "", response: "" },
                { value: 1000, clue: "", response: "" }
              ]},
              { title: "", clues: [
                { value: 200, clue: "", response: "" },
                { value: 400, clue: "", response: "" },
                { value: 600, clue: "", response: "" },
                { value: 800, clue: "", response: "" },
                { value: 1000, clue: "", response: "" }
              ]},
              { title: "", clues: [
                { value: 200, clue: "", response: "" },
                { value: 400, clue: "", response: "" },
                { value: 600, clue: "", response: "" },
                { value: 800, clue: "", response: "" },
                { value: 1000, clue: "", response: "" }
              ]},
              { title: "", clues: [
                { value: 200, clue: "", response: "" },
                { value: 400, clue: "", response: "" },
                { value: 600, clue: "", response: "" },
                { value: 800, clue: "", response: "" },
                { value: 1000, clue: "", response: "" }
              ]},
              { title: "", clues: [
                { value: 200, clue: "", response: "" },
                { value: 400, clue: "", response: "" },
                { value: 600, clue: "", response: "" },
                { value: 800, clue: "", response: "" },
                { value: 1000, clue: "", response: "" }
              ]},
              { title: "", clues: [
                { value: 200, clue: "", response: "" },
                { value: 400, clue: "", response: "" },
                { value: 600, clue: "", response: "" },
                { value: 800, clue: "", response: "" },
                { value: 1000, clue: "", response: "" }
              ]}
            ]
          }
        };

        // Add to creator data
        creatorData.games.push(newGame);
        window.GameCreatorStorage.saveCreatorData(creatorData);  // Save immediately

        // Also save to customGames so it appears in main menu
        const custom = loadCustomGames();
        const customGame = {
          id: newGame.id,
          title: newGame.title,
          subtitle: newGame.subtitle,
          categoryId: newGame.categoryId,
          game: newGame.game,  // Flat structure with title, subtitle, categories
          source: "creator"
        };
        // Don't duplicate if already exists
        if (!custom.find(g => g.id === newGame.id)) {
          custom.unshift(customGame);
        }
        saveCustomGames(custom);

        // Reload allCreatorGames to include the new game
        await window.GameCreatorState.loadAllGames();

        // Select the Custom category and the new game
        window.GameCreatorState.state.selectedCategoryId = customCategory.id;
        window.GameCreatorState.state.selectedGameId = newGame.id;

        // Re-render
        window.window.GameCreatorEditor.Render.categories();
        window.window.GameCreatorEditor.Render.games();
        window.window.GameCreatorEditor.Render.editor();
      },

      async deleteGame(game) {
        const creatorData = window.GameCreatorState.state.creatorData;
        if (game.source === "creator") {
          creatorData.games = creatorData.games.filter(g => g.id !== game.id);
        } else if (game.source === "custom" || game.source === "file") {
          // Remove from custom games (file games become custom when edited)
          const custom = loadCustomGames();
          saveCustomGames(custom.filter(g => g.id !== game.id));
        }
        // Reload games
        await window.GameCreatorState.loadAllGames();
        if (window.GameCreatorState.state.selectedGameId === game.id) {
          window.GameCreatorState.state.selectedGameId = null;
          window.GameCreatorEditor.Render.editor();
        }
        window.GameCreatorState.state.pendingDeleteGameId = null;
        window.GameCreatorStorage.saveCreatorData(creatorData);  // Save immediately
        window.GameCreatorEditor.Render.games();
      },

      addCategory() {
        const gameHeader = document.getElementById("creatorGameHeader");
        const game = gameHeader._game;
        const gameData = gameHeader._gameData;

        if (!gameData.categories) gameData.categories = [];
        gameData.categories.push({
          title: "",
          contentTopic: "",  // What the category is actually about (for AI generation)
          clues: [
            { value: 200, clue: "", response: "" },
            { value: 400, clue: "", response: "" },
            { value: 600, clue: "", response: "" },
            { value: 800, clue: "", response: "" },
            { value: 1000, clue: "", response: "" }
          ]
        });
        game.gameData = gameData;
        window.GameCreatorState.state.autoSave();  // Auto-save
        window.GameCreatorState.state.selectedCategoryIndex = gameData.categories.length - 1;
        window.GameCreatorState.state.selectedClueIndex = null;
        window.GameCreatorEditor.Render.editor();
      },

      removeCategory(index) {
        const gameHeader = document.getElementById("creatorGameHeader");
        const gameData = gameHeader._gameData;
        gameData.categories.splice(index, 1);
        window.GameCreatorState.state.autoSave();
        window.GameCreatorEditor.Render.editor();
      },

      renameCategory(index, newName) {
        const gameHeader = document.getElementById("creatorGameHeader");
        const gameData = gameHeader._gameData;
        gameData.categories[index].title = newName;
        window.GameCreatorState.state.autoSave();
        window.GameCreatorEditor.Render.editor();
      },

      moveCategoryUp(index) {
        const gameHeader = document.getElementById("creatorGameHeader");
        const gameData = gameHeader._gameData;
        if (index > 0) {
          [gameData.categories[index - 1], gameData.categories[index]] =
          [gameData.categories[index], gameData.categories[index - 1]];
          window.GameCreatorState.state.autoSave();
          window.GameCreatorEditor.Render.editor();
        }
      },

      moveCategoryDown(index) {
        const gameHeader = document.getElementById("creatorGameHeader");
        const gameData = gameHeader._gameData;
        if (index < gameData.categories.length - 1) {
          [gameData.categories[index], gameData.categories[index + 1]] =
          [gameData.categories[index + 1], gameData.categories[index]];
          window.GameCreatorState.state.autoSave();
          window.GameCreatorEditor.Render.editor();
        }
      },

      addClue(categoryIndex) {
        const gameHeader = document.getElementById("creatorGameHeader");
        const game = gameHeader._game;
        const gameData = gameHeader._gameData;

        if (categoryIndex === null) return;

        const category = gameData.categories[categoryIndex];
        if (!category.clues) category.clues = [];

        const existingClues = category.clues;
        const maxValue = existingClues.length > 0 ? Math.max(...existingClues.map(c => c.value || 0)) : 0;

        category.clues.push({
          value: maxValue + 200,
          clue: "",
          response: ""
        });

        game.gameData = gameData;
        window.GameCreatorState.state.autoSave();  // Auto-save
        window.GameCreatorState.state.selectedClueIndex = category.clues.length - 1; // Select the new question
        window.GameCreatorEditor.Render.editor();
      },

      deleteClue(categoryIndex, clueIndex) {
        const gameHeader = document.getElementById("creatorGameHeader");
        const gameData = gameHeader._gameData;
        const category = gameData.categories[categoryIndex];
        category.clues.splice(clueIndex, 1);
        window.GameCreatorState.state.autoSave();
        window.GameCreatorState.state.selectedClueIndex = null;
        window.GameCreatorEditor.Render.editor();
      },

      resizeCategories(newCount) {
        const gameHeader = document.getElementById("creatorGameHeader");
        const game = gameHeader._game;
        const gameData = gameHeader._gameData;

        if (!gameData.categories) gameData.categories = [];
        const currentCount = gameData.categories.length;

        // Warn if going above 6
        if (newCount > 6) {
          const message = `Jeopardy games typically have 6 categories. You're about to create ${newCount} categories. Continue?`;
          if (!confirm(message)) return;
        }

        // Warn if reducing would remove categories
        if (newCount < currentCount) {
          const toRemove = currentCount - newCount;
          const categoriesBeingRemoved = gameData.categories.slice(newCount);

          let message = `Reducing to ${newCount} categor${newCount === 1 ? 'y' : 'ies'} will remove:\n\n`;
          categoriesBeingRemoved.forEach((cat, i) => {
            const cluesCount = cat.clues?.length || 0;
            message += `• ${cat.title || '(Untitled)'}: ${cluesCount} question${cluesCount === 1 ? '' : 's'}\n`;
          });
          message += `\nContinue?`;

          if (!confirm(message)) return;
        }

        if (newCount > currentCount) {
          // Add categories
          for (let i = currentCount; i < newCount; i++) {
            gameData.categories.push({
              title: "",
              contentTopic: "",  // What the category is actually about (for AI generation)
              clues: [
                { value: 200, clue: "", response: "" },
                { value: 400, clue: "", response: "" },
                { value: 600, clue: "", response: "" },
                { value: 800, clue: "", response: "" },
                { value: 1000, clue: "", response: "" }
              ]
            });
          }
        } else if (newCount < currentCount) {
          // Remove categories from the end
          gameData.categories = gameData.categories.slice(0, newCount);
        }

        // Reset selection if needed
        if (window.GameCreatorState.state.selectedCategoryIndex !== null && window.GameCreatorState.state.selectedCategoryIndex >= newCount) {
          window.GameCreatorState.state.selectedCategoryIndex = newCount > 0 ? newCount - 1 : null;
          window.GameCreatorState.state.selectedClueIndex = null;
        }

        game.gameData = gameData;
        window.GameCreatorState.state.autoSave();  // Auto-save
        window.GameCreatorEditor.Render.editor();
      },

      resizeClues(newCount) {
        const gameHeader = document.getElementById("creatorGameHeader");
        const game = gameHeader._game;
        const gameData = gameHeader._gameData;

        if (!gameData.categories || gameData.categories.length === 0) return;

        // Get current minimum questions per category
        const currentMinCount = Math.min(...gameData.categories.map(cat => cat.clues?.length || 0));

        if (newCount < currentMinCount) {
          // Warn user that questions will be removed
          const categoriesLosingQuestions = gameData.categories.filter(cat =>
            (cat.clues?.length || 0) > newCount
          );

          let message = `Reducing to ${newCount} question${newCount === 1 ? '' : 's'} per category will remove questions from:\n\n`;
          categoriesLosingQuestions.forEach(cat => {
            const currentCount = cat.clues?.length || 0;
            const toRemove = currentCount - newCount;
            message += `• ${cat.title || '(Untitled)'}: ${toRemove} question${toRemove === 1 ? '' : 's'}\n`;
          });
          message += `\nContinue?`;

          if (!confirm(message)) return;
        }

        // Apply new count to all categories
        gameData.categories.forEach(category => {
          if (!category.clues) category.clues = [];

          if (newCount > category.clues.length) {
            // Add questions
            const existingCount = category.clues.length;
            const maxValue = existingCount > 0 ? Math.max(...category.clues.map(c => c.value || 0)) : 0;

            for (let i = existingCount; i < newCount; i++) {
              category.clues.push({
                value: maxValue + (i + 1) * 200,
                clue: "",
                response: ""
              });
            }
          } else if (newCount < category.clues.length) {
            // Remove questions from the end
            category.clues = category.clues.slice(0, newCount);
          }
        });

        game.gameData = gameData;
        window.GameCreatorState.state.autoSave();  // Auto-save

        // Reset selection if the selected question was removed
        if (window.GameCreatorState.state.selectedCategoryIndex !== null && window.GameCreatorState.state.selectedClueIndex !== null) {
          const category = gameData.categories[window.GameCreatorState.state.selectedCategoryIndex];
          if (category.clues.length <= window.GameCreatorState.state.selectedClueIndex) {
            window.GameCreatorState.state.selectedClueIndex = category.clues.length > 0 ? category.clues.length - 1 : null;
          }
        }

        window.GameCreatorEditor.Render.editor();
      },
    },
  };

  window.GameCreatorEditor = GameCreatorEditor;
  console.log('[GameCreatorEditor] Module loaded successfully');
})();
