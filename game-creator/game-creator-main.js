(function() {
  'use strict';

  console.log('[GameCreatorMain] Module loading...');

  const GameCreatorMain = {
    // ========================================
    // SETUP - Main entry point
    // ========================================
    async setup() {
      const dialog = document.getElementById("gameCreatorDialog");
      const openBtn = document.getElementById("createGameBtn");
      const addCategoryBtn = document.getElementById("creatorAddCategoryBtn");
      const addGameBtn = document.getElementById("creatorAddGameBtn");
      const importInput = document.getElementById("creatorImportInput");
      const searchInput = document.getElementById("creatorSearchInput");

      // Note: State is already initialized by app.js (initialize() and loadAllGames())
      // This function only sets up event listeners and DOM elements

      // Setup search functionality
      searchInput?.addEventListener("input", () => {
        window.GameCreatorEditor.Render.games();
      });

      // Setup workspace listeners
      window.GameCreatorUI.setupWorkspaceListeners();

      // Add Category button in sidebar
      addCategoryBtn?.addEventListener("click", window.GameCreatorUI.showInlineAddCategory);

      // Add Game button in sidebar - creates a new blank game
      addGameBtn?.addEventListener("click", window.GameCreatorEditor.Actions.createNewGame);

      // Import file handler
      importInput.addEventListener("change", async () => {
        const file = importInput.files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const parsed = JSON.parse(text);

          // Validate structure
          if (!parsed || typeof parsed !== "object") {
            throw new Error("Invalid JSON: expected an object");
          }

          // Merge with existing data
          const creatorData = window.GameCreatorState.state.creatorData;
          if (Array.isArray(parsed.categories)) {
            // Add new categories (avoiding duplicate IDs)
            parsed.categories.forEach(cat => {
              if (!creatorData.categories.find(c => c.id === cat.id)) {
                creatorData.categories.push(cat);
              }
            });
          }

          if (Array.isArray(parsed.games)) {
            // Add new games (avoiding duplicate IDs)
            parsed.games.forEach(game => {
              if (!creatorData.games.find(g => g.id === game.id)) {
                creatorData.games.push(game);
              }
            });
          }

          window.GameCreatorStorage.saveCreatorData(creatorData);  // Save immediately

          // Reload all games to include imported ones
          await window.GameCreatorState.loadAllGames();
          window.GameCreatorEditor.Render.categories();
          window.GameCreatorEditor.Render.games();
          alert("Games imported successfully!");
        } catch (err) {
          alert(`Error importing games: ${err.message}`);
        } finally {
          importInput.value = "";
        }
      });

      // Open dialog
      openBtn.addEventListener("click", () => {
        // Reload games when opening the dialog
        window.GameCreatorState.loadAllGames().then(() => {
          window.GameCreatorEditor.Render.categories();
          window.GameCreatorEditor.Render.games();

          // Default to first game if nothing selected (not blank template)
          if (!window.GameCreatorState.state.selectedGameId && window.GameCreatorState.state.allCreatorGames.length > 0) {
            window.GameCreatorState.state.selectedGameId = window.GameCreatorState.state.allCreatorGames[0].id;
            window.GameCreatorEditor.Render.games();
            window.GameCreatorEditor.Render.editor();
          } else if (!window.GameCreatorState.state.selectedGameId && window.GameCreatorState.state.allCreatorGames.length === 0) {
            // Only create blank template if no games exist at all
            window.GameCreatorEditor.Actions.createNewGame();
          } else {
            window.GameCreatorEditor.Render.editor();
          }

          dialog.showModal();
        });
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (window.GameCreatorState.state.menuTrigger && window.GameCreatorState.state.menuDropdown &&
            !window.GameCreatorState.state.menuTrigger.contains(e.target) && !window.GameCreatorState.state.menuDropdown.contains(e.target)) {
          window.GameCreatorState.state.menuDropdown.classList.remove("show");
        }
      });

      // Setup delete category dialog handlers
      const confirmDeleteCategoryBtn = document.getElementById("confirmDeleteCategoryBtn");
      const cancelDeleteCategoryBtn = document.getElementById("cancelDeleteCategoryBtn");

      confirmDeleteCategoryBtn?.addEventListener("click", () => {
        if (window.GameCreatorState.state.pendingDeleteCategoryIndex !== null && window.GameCreatorState.state.pendingDeleteCategoryData) {
          const creatorData = window.GameCreatorState.state.creatorData;
          // Move games to "All Games"
          creatorData.games.forEach(game => {
            if (game.categoryId === window.GameCreatorState.state.pendingDeleteCategoryData.id) {
              game.categoryId = creatorData.categories[0].id;
            }
          });
          creatorData.categories.splice(window.GameCreatorState.state.pendingDeleteCategoryIndex, 1);
          if (window.GameCreatorState.state.selectedCategoryId === window.GameCreatorState.state.pendingDeleteCategoryData.id) {
            window.GameCreatorState.state.selectedCategoryId = creatorData.categories[0]?.id || null;
          }
          window.GameCreatorStorage.saveCreatorData(creatorData);  // Save immediately
          window.GameCreatorEditor.Render.categories();
          window.GameCreatorEditor.Render.games();
        }
        window.GameCreatorState.state.pendingDeleteCategoryIndex = null;
        window.GameCreatorState.state.pendingDeleteCategoryData = null;
      });

      cancelDeleteCategoryBtn?.addEventListener("click", () => {
        window.GameCreatorState.state.pendingDeleteCategoryIndex = null;
        window.GameCreatorState.state.pendingDeleteCategoryData = null;
      });

      // Refresh main menu when dialog closes (always, to show new/updated games)
      dialog.addEventListener("close", () => {
        // Always trigger a menu refresh when Game Creator closes
        // This ensures new games created via wizard, title changes, etc. appear in main menu
        window.dispatchEvent(new CustomEvent('jeop2:gamesUpdated'));

        // Reload games when dialog reopens
        window.GameCreatorState.loadAllGames().then(() => {
          window.GameCreatorEditor.Render.categories();
          window.GameCreatorEditor.Render.games();

          // Default to first game if nothing selected
          if (!window.GameCreatorState.state.selectedGameId && window.GameCreatorState.state.allCreatorGames.length > 0) {
            window.GameCreatorState.state.selectedGameId = window.GameCreatorState.state.allCreatorGames[0].id;
            window.GameCreatorEditor.Render.games();
          } else if (!window.GameCreatorState.state.selectedGameId && window.GameCreatorState.state.allCreatorGames.length === 0) {
            // Only create blank template if no games exist
            window.GameCreatorEditor.Actions.createNewGame();
          }

          window.GameCreatorEditor.Render.editor();
        });
      });

      // Expose functions globally for the wizard and other code to use
      window.createNewGame = window.GameCreatorEditor.Actions.createNewGame.bind(window.GameCreatorEditor.Actions);
      window.loadAllGames = window.GameCreatorState.loadAllGames.bind(window.GameCreatorState);
      window.renderEditor = window.GameCreatorEditor.Render.editor.bind(window.GameCreatorEditor.Render);
      window.autoSave = window.GameCreatorState.state.autoSave;

      // Expose state properties as globals for AI actions compatibility
      Object.defineProperties(window, {
        selectedCategoryIndex: {
          get() { return window.GameCreatorState.state.selectedCategoryIndex; },
          set(value) { window.GameCreatorState.state.selectedCategoryIndex = value; },
          enumerable: true,
          configurable: true
        },
        selectedClueIndex: {
          get() { return window.GameCreatorState.state.selectedClueIndex; },
          set(value) { window.GameCreatorState.state.selectedClueIndex = value; },
          enumerable: true,
          configurable: true
        }
      });

      // Initial render
      window.GameCreatorEditor.Render.categories();
      window.GameCreatorEditor.Render.games();
      window.GameCreatorEditor.Render.editor();
    },
  };

  // Export setup function and also window globals for backward compatibility
  window.GameCreatorMain = GameCreatorMain;
  window.setupGameCreator = GameCreatorMain.setup.bind(GameCreatorMain);
  console.log('[GameCreatorMain] Module loaded successfully');
})();
