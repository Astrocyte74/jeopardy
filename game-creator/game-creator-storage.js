// game-creator-storage.js
// Storage & persistence layer for Game Creator
// Handles localStorage operations for categories and games

(function() {
  'use strict';

  console.log('[GameCreatorStorage] Module loading...');

  const CREATOR_DATA_KEY = 'jeop2_creator_data';

  const GameCreatorStorage = {
    // ========================================
    // PUBLIC API
    // ========================================

    /**
     * Get default creator data structure
     */
    getDefaultCreatorData() {
      return {
        categories: [
          { id: "cat_all", name: "All Games", icon: "🎮" },
          { id: "cat_custom", name: "Custom", icon: "✏️" }
        ],
        games: [],
      };
    },

    /**
     * Load creator data from localStorage
     * @returns {Object} Creator data with categories and games
     */
    loadCreatorData() {
      try {
        const raw = localStorage.getItem(CREATOR_DATA_KEY);
        if (!raw) return this.getDefaultCreatorData();
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return this.getDefaultCreatorData();
        return {
          categories: Array.isArray(parsed.categories) ? parsed.categories : this.getDefaultCreatorData().categories,
          games: Array.isArray(parsed.games) ? parsed.games : [],
        };
      } catch {
        return this.getDefaultCreatorData();
      }
    },

    /**
     * Save creator data to localStorage
     * @param {Object} data - Creator data with categories and games
     */
    saveCreatorData(data) {
      // Clean circular references before saving (gameData, _game, _gameData, etc.)
      const cleanedData = {
        categories: data.categories || [],
        games: (data.games || []).map(game => {
          // Only save the essential properties, avoid circular references
          return {
            id: game.id,
            title: game.title,
            subtitle: game.subtitle,
            categoryId: game.categoryId,
            // Save the nested game object with categories
            game: {
              title: game.game?.title || game.title,
              subtitle: game.game?.subtitle || game.subtitle,
              categories: game.game?.categories || []
            }
          };
        })
      };
      localStorage.setItem(CREATOR_DATA_KEY, JSON.stringify(cleanedData));
    },

    /**
     * Create an auto-save function with debouncing
     * @returns {Function} Auto-save function that can be called
     */
    createAutoSaveFunction() {
      let saveTimeout = null;
      let isSaving = false;

      return async () => {
        // Clear any pending save
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }

        // Debounce: wait 500ms after last change before saving
        saveTimeout = setTimeout(async () => {
          if (isSaving) return; // Prevent concurrent saves

          const gameHeader = document.getElementById("creatorGameHeader");
          if (!gameHeader || !gameHeader._game || !gameHeader._gameData) return;

          isSaving = true;
          const game = gameHeader._game;
          const gameData = gameHeader._gameData;

          // Update the game's data
          game.gameData = gameData;

          // Build proper game structure for saving (categories at top level)
          const gameToSave = {
            title: game.title,
            subtitle: game.subtitle,
            ...gameData  // This spreads {categories: [...]}
          };

          // Save to appropriate storage
          if (game.source === "creator") {
            const creatorData = this.loadCreatorData();
            // Update in creatorData.games
            const creatorGame = creatorData.games.find(g => g.id === game.id);
            if (creatorGame) {
              creatorGame.game = gameToSave;
              creatorGame.gameData = gameData;
              creatorGame.title = game.title;
              creatorGame.subtitle = game.subtitle;
              creatorGame.categoryId = game.categoryId;
            }
            this.saveCreatorData(creatorData);

            // Also save to customGames so it appears in main menu
            const custom = window.loadCustomGames();
            const existingIndex = custom.findIndex(g => g.id === game.id);
            const customGame = {
              id: game.id,
              title: game.title,
              subtitle: game.subtitle,
              categoryId: game.categoryId,
              game: gameToSave,
              source: "creator"
            };

            if (existingIndex >= 0) {
              custom[existingIndex] = customGame;
            } else {
              custom.unshift(customGame);
            }
            window.saveCustomGames(custom);
          } else if (game.source === "custom") {
            // Update in custom games
            const custom = window.loadCustomGames();
            const customGame = custom.find(g => g.id === game.id);
            if (customGame) {
              customGame.game = gameToSave;
              customGame.title = game.title;
              customGame.subtitle = game.subtitle;
              if (game.categoryId) {
                customGame.categoryId = game.categoryId;
              }
              window.saveCustomGames(custom);
            }
          }

          isSaving = false;

          // Show subtle "Saved" indicator
          const saveIndicator = document.getElementById("creatorSaveIndicator");
          if (saveIndicator) {
            saveIndicator.textContent = "✓ Saved";
            saveIndicator.style.opacity = "1";
            setTimeout(() => {
              saveIndicator.style.opacity = "0.5";
            }, 1000);
          }
        }, 500);
      };
    }
  };

  // Export to global scope
  window.GameCreatorStorage = GameCreatorStorage;
  console.log('[GameCreatorStorage] Module loaded successfully');

})();
