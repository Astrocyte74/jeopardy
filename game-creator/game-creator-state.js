// game-creator-state.js
// State management for Game Creator
// Manages application state and provides data access methods

(function() {
  'use strict';

  console.log('[GameCreatorState] Module loading...');

  const GameCreatorState = {
    // ========================================
    // STATE OBJECT
    // ========================================
    state: {
      creatorData: null,
      selectedCategoryId: null,
      selectedGameId: null,
      selectedCategoryIndex: null,
      selectedClueIndex: null,
      pendingDeleteGameId: null,
      pendingDeleteCategoryIndex: null,
      pendingDeleteCategoryData: null,
      dirty: false,
      allCreatorGames: [],
      autoSave: null,
      menuTrigger: null,
      menuDropdown: null,
    },

    // ========================================
    // PUBLIC API
    // ========================================

    /**
     * Initialize state with data from storage
     */
    initialize() {
      // Ensure state object exists and is properly initialized
      if (!this.state) {
        this.state = {
          creatorData: null,
          selectedCategoryId: null,
          selectedGameId: null,
          selectedCategoryIndex: null,
          selectedClueIndex: null,
          pendingDeleteGameId: null,
          pendingDeleteCategoryIndex: null,
          pendingDeleteCategoryData: null,
          dirty: false,
          allCreatorGames: [],
          autoSave: null,
          menuTrigger: null,
          menuDropdown: null,
        };
      }

      this.state.creatorData = window.GameCreatorStorage.loadCreatorData();
      this.state.selectedCategoryId = this.state.creatorData.categories[0]?.id || null;
      this.state.autoSave = window.GameCreatorStorage.createAutoSaveFunction();
    },

    /**
     * Load all games from all sources (creator, file, custom)
     */
    async loadAllGames() {
      this.state.allCreatorGames = [];
      const creatorData = this.state.creatorData;

      // Add creator games (fully editable) - store direct references
      creatorData.games.forEach(game => {
        // game.game should have proper structure: {title, subtitle, categories: [...]}
        const gameData = game.game || { categories: [] };
        // Extract just the categories part for gameData (used internally by Game Creator)
        const categoriesData = { categories: gameData.categories || [] };

        this.state.allCreatorGames.push({
          id: game.id,
          title: game.title,
          subtitle: game.subtitle,
          categoryId: game.categoryId,
          game, // Store reference to original game object for updates
          gameData: categoriesData, // Internal format: {categories: [...]}
          editable: true,
          source: "creator"
        });
      });

      // Add file-based games (editable - changes save to localStorage)
      try {
        const { games: fileGames } = await window.getAvailableGames();
        fileGames.forEach(game => {
          if (game.source === "index" && !this.state.allCreatorGames.find(g => g.id === game.id)) {
            this.state.allCreatorGames.push({
              id: game.id,
              title: game.title,
              subtitle: game.subtitle,
              categoryId: creatorData.categories[0]?.id || "cat_all",
              gameData: null, // Will load on demand
              editable: true,
              source: "file",
              path: game.path
            });
          }
        });
      } catch (err) {
        console.error("Error loading file games:", err);
      }

      // Add custom imported games (fully editable)
      const customGames = window.loadCustomGames();
      customGames.forEach(game => {
        if (!this.state.allCreatorGames.find(g => g.id === game.id)) {
          this.state.allCreatorGames.push({
            id: game.id,
            title: game.title,
            subtitle: game.subtitle,
            categoryId: game.categoryId || creatorData.categories[0]?.id || "cat_all",
            gameData: game.game,
            editable: true,
            source: "custom"
          });
        }
      });

      // Refresh the game list UI
      if (window.GameCreatorEditor && window.GameCreatorEditor.Render) {
        window.GameCreatorEditor.Render.games();
      }
    },

    /**
     * Get creator data
     * @returns {Object} Creator data
     */
    getCreatorData() {
      return this.state.creatorData;
    },

    /**
     * Get all loaded games
     * @returns {Array} All games array
     */
    getAllGames() {
      return this.state.allCreatorGames;
    },

    /**
     * Get the currently selected game
     * @returns {Object|null} Selected game or null
     */
    getSelectedGame() {
      return this.state.allCreatorGames.find(g => g.id === this.state.selectedGameId);
    }
  };

  // Export to global scope
  window.GameCreatorState = GameCreatorState;
  console.log('[GameCreatorState] Module loaded successfully');

  // Export state object directly for easier access
  Object.defineProperty(window.GameCreatorState, 'data', {
    get() { return window.GameCreatorState.state; },
    enumerable: false,
    configurable: false
  });

})();
