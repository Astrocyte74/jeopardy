// game-creator-utils.js
// Utility functions for Game Creator
// Helper functions used throughout the Game Creator

(function() {
  'use strict';

  const GameCreatorUtils = {
    // ========================================
    // PUBLIC API
    // ========================================

    /**
     * Generate a unique ID
     * @returns {string} Unique ID combining timestamp and random string
     */
    generateId() {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  // Export to global scope
  window.GameCreatorUtils = GameCreatorUtils;

})();
