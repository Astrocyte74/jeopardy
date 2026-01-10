(function() {
  'use strict';

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

      // Initialize state
      GameCreatorState.state.creatorData = GameCreatorStorage.loadCreatorData();
      GameCreatorState.state.selectedCategoryId = GameCreatorState.state.creatorData.categories[0]?.id || null;
      GameCreatorState.state.selectedGameId = null;
      GameCreatorState.state.pendingDeleteGameId = null;
      GameCreatorState.state.dirty = false;
      GameCreatorState.state.allCreatorGames = [];

      // Create auto-save function (debounced, saves to both creatorData and customGames)
      GameCreatorState.state.autoSave = GameCreatorStorage.createAutoSaveFunction();

      // Load all games (file-based, custom, and creator games)
      await GameCreatorState.loadAllGames();

      // Setup search functionality
      searchInput?.addEventListener("input", () => {
        GameCreatorEditor.Render.games();
      });

      // Setup workspace listeners
      GameCreatorUI.setupWorkspaceListeners();

      // Add Category button in sidebar
      addCategoryBtn?.addEventListener("click", GameCreatorUI.showInlineAddCategory);

      // Add Game button in sidebar - creates a new blank game
      addGameBtn?.addEventListener("click", GameCreatorEditor.Actions.createNewGame);

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
          const creatorData = GameCreatorState.state.creatorData;
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

          GameCreatorStorage.saveCreatorData(creatorData);  // Save immediately

          // Reload all games to include imported ones
          await GameCreatorState.loadAllGames();
          GameCreatorEditor.Render.categories();
          GameCreatorEditor.Render.games();
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
        GameCreatorState.loadAllGames().then(() => {
          GameCreatorEditor.Render.categories();
          GameCreatorEditor.Render.games();

          // Default to first game if nothing selected (not blank template)
          if (!GameCreatorState.state.selectedGameId && GameCreatorState.state.allCreatorGames.length > 0) {
            GameCreatorState.state.selectedGameId = GameCreatorState.state.allCreatorGames[0].id;
            GameCreatorEditor.Render.games();
            GameCreatorEditor.Render.editor();
          } else if (!GameCreatorState.state.selectedGameId && GameCreatorState.state.allCreatorGames.length === 0) {
            // Only create blank template if no games exist at all
            GameCreatorEditor.Actions.createNewGame();
          } else {
            GameCreatorEditor.Render.editor();
          }

          dialog.showModal();
        });
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (GameCreatorState.state.menuTrigger && GameCreatorState.state.menuDropdown &&
            !GameCreatorState.state.menuTrigger.contains(e.target) && !GameCreatorState.state.menuDropdown.contains(e.target)) {
          GameCreatorState.state.menuDropdown.classList.remove("show");
        }
      });

      // Setup delete category dialog handlers
      const confirmDeleteCategoryBtn = document.getElementById("confirmDeleteCategoryBtn");
      const cancelDeleteCategoryBtn = document.getElementById("cancelDeleteCategoryBtn");

      confirmDeleteCategoryBtn?.addEventListener("click", () => {
        if (GameCreatorState.state.pendingDeleteCategoryIndex !== null && GameCreatorState.state.pendingDeleteCategoryData) {
          const creatorData = GameCreatorState.state.creatorData;
          // Move games to "All Games"
          creatorData.games.forEach(game => {
            if (game.categoryId === GameCreatorState.state.pendingDeleteCategoryData.id) {
              game.categoryId = creatorData.categories[0].id;
            }
          });
          creatorData.categories.splice(GameCreatorState.state.pendingDeleteCategoryIndex, 1);
          if (GameCreatorState.state.selectedCategoryId === GameCreatorState.state.pendingDeleteCategoryData.id) {
            GameCreatorState.state.selectedCategoryId = creatorData.categories[0]?.id || null;
          }
          GameCreatorStorage.saveCreatorData(creatorData);  // Save immediately
          GameCreatorEditor.Render.categories();
          GameCreatorEditor.Render.games();
        }
        GameCreatorState.state.pendingDeleteCategoryIndex = null;
        GameCreatorState.state.pendingDeleteCategoryData = null;
      });

      cancelDeleteCategoryBtn?.addEventListener("click", () => {
        GameCreatorState.state.pendingDeleteCategoryIndex = null;
        GameCreatorState.state.pendingDeleteCategoryData = null;
      });

      // Refresh main menu when dialog closes (if changes were saved)
      dialog.addEventListener("close", () => {
        if (GameCreatorState.state.dirty) {
          // Reload to show the changes - user can re-open to continue editing
          GameCreatorState.state.creatorData = GameCreatorStorage.loadCreatorData();
          GameCreatorState.state.dirty = false;

          // Trigger a menu refresh by dispatching a custom event
          window.dispatchEvent(new CustomEvent('jeop2:gamesUpdated'));
        }
        // Reload games when dialog reopens
        GameCreatorState.loadAllGames().then(() => {
          GameCreatorEditor.Render.categories();
          GameCreatorEditor.Render.games();

          // Default to first game if nothing selected
          if (!GameCreatorState.state.selectedGameId && GameCreatorState.state.allCreatorGames.length > 0) {
            GameCreatorState.state.selectedGameId = GameCreatorState.state.allCreatorGames[0].id;
            GameCreatorEditor.Render.games();
          } else if (!GameCreatorState.state.selectedGameId && GameCreatorState.state.allCreatorGames.length === 0) {
            // Only create blank template if no games exist
            GameCreatorEditor.Actions.createNewGame();
          }

          GameCreatorEditor.Render.editor();
        });
      });

      // Expose functions globally for the wizard and other code to use
      window.createNewGame = GameCreatorEditor.Actions.createNewGame;
      window.loadAllGames = GameCreatorState.loadAllGames;
      window.renderEditor = GameCreatorEditor.Render.editor;
      window.autoSave = GameCreatorState.state.autoSave;

      // Initial render
      GameCreatorEditor.Render.categories();
      GameCreatorEditor.Render.games();
      GameCreatorEditor.Render.editor();
    },
  };

  // Export setup function and also window globals for backward compatibility
  window.GameCreatorMain = GameCreatorMain;
  window.setupGameCreator = GameCreatorMain.setup.bind(GameCreatorMain);
})();
