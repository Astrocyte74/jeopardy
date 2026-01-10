(function() {
  'use strict';

  const GameCreatorUI = {
    showInlineRename(item, currentValue, onSave) {
      const nameEl = item.querySelector(".creator-category-name");
      const header = item.querySelector(".creator-category-header");

      // Create inline input
      const input = document.createElement("input");
      input.type = "text";
      input.value = currentValue;
      input.className = "creator-inline-input";
      input.autocomplete = "off";

      // Replace name with input in the header
      nameEl.style.display = "none";
      header.insertBefore(input, nameEl.nextSibling);
      input.focus();
      input.select();

      // Handle save/cancel
      const finish = (save) => {
        if (save && input.value.trim()) {
          onSave(input.value.trim());
        } else {
          nameEl.style.display = "";
          input.remove();
        }
      };

      input.addEventListener("blur", () => finish(true));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          input.blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          finish(false);
        }
      });
    },

    showInlineAddCategory() {
      const categoriesList = document.getElementById("creatorCategoriesList");
      if (!categoriesList) return;

      // Create new item with input
      const item = document.createElement("div");
      item.className = "creator-category-item creator-category-item-new";
      item.innerHTML = `
        <div class="creator-category-header">
          <span class="creator-category-icon">📁</span>
          <input type="text" class="creator-inline-input" placeholder="New category name..." autocomplete="off" />
          <div class="creator-category-actions">
            <button class="creator-action-btn creator-save-btn" title="Save" type="button">✓</button>
            <button class="creator-action-btn creator-cancel-btn" title="Cancel" type="button">✕</button>
          </div>
        </div>
      `;

      categoriesList.appendChild(item);

      // Get input and focus it
      const input = item.querySelector(".creator-inline-input");
      input.focus();

      // Handle save
      const localSaveBtn = item.querySelector(".creator-save-btn");
      const cancelBtn = item.querySelector(".creator-cancel-btn");

      const finish = (save) => {
        if (save && input.value.trim()) {
          const newCategory = {
            id: `cat_${GameCreatorUtils.generateId()}`,
            name: input.value.trim(),
            icon: "📁",
          };

          GameCreatorState.state.creatorData.categories.push(newCategory);
          GameCreatorStorage.saveCreatorData(GameCreatorState.state.creatorData);  // Save immediately
          GameCreatorEditor.Render.categories();
        } else {
          item.remove();
        }
      };

      localSaveBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        finish(true);
      });

      cancelBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        finish(false);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          finish(true);
        } else if (e.key === "Escape") {
          e.preventDefault();
          finish(false);
        }
      });
    },

    showDeleteCategoryDialog(category, index) {
      const dialog = document.getElementById("deleteCategoryDialog");
      const messageEl = document.getElementById("deleteCategoryMessage");
      if (!dialog || !messageEl) return;

      messageEl.textContent = `Delete "${category.name}"? Games in this category will move to "All Games".`;
      GameCreatorState.state.pendingDeleteCategoryIndex = index;
      GameCreatorState.state.pendingDeleteCategoryData = category;

      dialog.showModal();
    },

    setupMenuListeners() {
      const menuTrigger = document.getElementById("creatorMenuTrigger");
      const menuDropdown = document.getElementById("creatorMenuDropdown");

      if (!menuTrigger || !menuDropdown) return;

      GameCreatorState.state.menuTrigger = menuTrigger;
      GameCreatorState.state.menuDropdown = menuDropdown;

      menuTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        menuDropdown.classList.toggle("show");
      });

      // Setup export/import listeners for the newly rendered buttons
      const newExportBtn = document.getElementById("creatorExportBtn");
      const newImportBtn = document.getElementById("creatorImportBtn");

      if (newExportBtn) {
        newExportBtn.addEventListener("click", async () => {
          const gameHeader = document.getElementById("creatorGameHeader");
          if (!gameHeader || !gameHeader._game) {
            alert('No game to export');
            return;
          }

          const game = gameHeader._game;
          const gameData = gameHeader._gameData;

          // Build proper game structure for export
          const gameToExport = {
            title: game.title,
            subtitle: game.subtitle,
            ...gameData  // Spreads {categories: [...]}
          };

          // Create filename from title
          const filename = game.title.trim() || 'game';
          const safeFilename = filename.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json';

          const dataStr = JSON.stringify(gameToExport, null, 2);
          const blob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = safeFilename;
          a.click();
          URL.revokeObjectURL(url);
          menuDropdown.classList.remove("show");

          // Show HTML export instructions dialog
          await showExportInstructions(safeFilename, game.id, game.title, game.subtitle);
        });
      }

      if (newImportBtn) {
        newImportBtn.addEventListener("click", () => {
          const importInput = document.getElementById("creatorImportInput");
          if (importInput) {
            importInput.click();
          }
          menuDropdown.classList.remove("show");
        });
      }
    },

    setupWorkspaceListeners() {
      const workspaceGrid = document.getElementById("creatorWorkspaceGrid");
      if (!workspaceGrid) return;

      // Add category button
      const addCategoryBtn = document.getElementById("workspaceAddCategoryBtn");
      addCategoryBtn?.addEventListener("click", () => {
        GameCreatorEditor.Actions.addCategory();
      });

      // Add question button (single question to selected category)
      const addQuestionBtn = document.getElementById("workspaceAddQuestionBtn");
      addQuestionBtn?.addEventListener("click", () => {
        GameCreatorEditor.Actions.addClue(GameCreatorState.state.selectedCategoryIndex);
      });

      // Questions count control (+/-) - affects all categories uniformly
      const decreaseBtn = document.getElementById("questionsDecreaseBtn");
      const increaseBtn = document.getElementById("questionsIncreaseBtn");

      decreaseBtn?.addEventListener("click", () => {
        const countValue = document.getElementById("questionsCountValue");
        const currentCount = parseInt(countValue.textContent) || 5;
        if (currentCount > 1) {
          GameCreatorEditor.Actions.resizeClues(currentCount - 1);
        }
      });

      increaseBtn?.addEventListener("click", () => {
        const countValue = document.getElementById("questionsCountValue");
        const currentCount = parseInt(countValue.textContent) || 5;
        if (currentCount < 10) {
          GameCreatorEditor.Actions.resizeClues(currentCount + 1);
        }
      });

      // Categories count control (+/-)
      const categoriesDecreaseBtn = document.getElementById("categoriesDecreaseBtn");
      const categoriesIncreaseBtn = document.getElementById("categoriesIncreaseBtn");

      categoriesDecreaseBtn?.addEventListener("click", () => {
        const countValue = document.getElementById("categoriesCountValue");
        const currentCount = parseInt(countValue.textContent) || 6;
        if (currentCount > 1) {
          GameCreatorEditor.Actions.resizeCategories(currentCount - 1);
        }
      });

      categoriesIncreaseBtn?.addEventListener("click", () => {
        const countValue = document.getElementById("categoriesCountValue");
        const currentCount = parseInt(countValue.textContent) || 6;
        if (currentCount < 12) {
          GameCreatorEditor.Actions.resizeCategories(currentCount + 1);
        }
      });
    },

    setupHeaderEventListeners(gameHeader, game, gameData) {
      // Title input
      const titleInput = gameHeader.querySelector("#editorTitle");
      titleInput?.addEventListener("input", () => {
        game.title = titleInput.value;
        GameCreatorState.state.autoSave();  // Auto-save on change
        GameCreatorEditor.Render.games();
      });

      // Subtitle input
      const subtitleInput = gameHeader.querySelector("#editorSubtitle");
      subtitleInput?.addEventListener("input", () => {
        game.subtitle = subtitleInput.value;
        GameCreatorState.state.autoSave();  // Auto-save on change
        GameCreatorEditor.Render.games();
      });

      // Game category dropdown (folder assignment)
      const categorySelect = gameHeader.querySelector("#editorGameCategory");
      categorySelect?.addEventListener("change", (e) => {
        const newCategoryId = e.target.value;
        game.categoryId = newCategoryId;
        // Update selected category in sidebar
        GameCreatorState.state.selectedCategoryId = newCategoryId;
        GameCreatorState.state.autoSave();  // Auto-save on change
        GameCreatorEditor.Render.categories();
        GameCreatorEditor.Render.games();
      });

      // Difficulty radio buttons
      const difficultyRadios = gameHeader.querySelectorAll("input[name='aiDifficulty']");
      const pillDifficulty = gameHeader.querySelector("#aiPillDifficulty");
      difficultyRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
          const newDifficulty = e.target.value;
          // Update pill label
          if (pillDifficulty) {
            pillDifficulty.textContent = newDifficulty.charAt(0).toUpperCase() + newDifficulty.slice(1);
          }
          // Trigger AI action difficulty update
          if (typeof window !== 'undefined' && window.updateAIDifficulty) {
            window.updateAIDifficulty(newDifficulty);
          }
          // Close dropdown after selection
          const dropdown = gameHeader.querySelector(".ai-action-dropdown");
          if (dropdown) dropdown.classList.remove("show");
        });
      });

      // Setup AI button handlers
      if (typeof setupAIButtonHandlers === 'function') {
        setupAIButtonHandlers();
      }
    },

    setupClueEditorListeners(editorPanel, categories, category, clue) {
      const gameHeader = document.getElementById("creatorGameHeader");
      const game = gameHeader._game;
      const gameData = gameHeader._gameData;

      // Value input
      const valueInput = editorPanel.querySelector("#clueValueInput");
      valueInput?.addEventListener("input", () => {
        clue.value = parseInt(valueInput.value) || 200;
        game.gameData = gameData;
        GameCreatorState.state.autoSave();  // Auto-save on change
        GameCreatorEditor.Render.cluesColumn(categories);
      });

      // Question input
      const questionInput = editorPanel.querySelector("#clueQuestionInput");
      questionInput?.addEventListener("input", () => {
        clue.clue = questionInput.value;
        game.gameData = gameData;
        GameCreatorState.state.autoSave();  // Auto-save on change
        GameCreatorEditor.Render.cluesColumn(categories);
      });

      // Answer input
      const answerInput = editorPanel.querySelector("#clueAnswerInput");
      answerInput?.addEventListener("input", () => {
        clue.response = answerInput.value;
        game.gameData = gameData;
        GameCreatorState.state.autoSave();  // Auto-save on change
        GameCreatorEditor.Render.cluesColumn(categories);
      });

      // Delete clue button
      const deleteBtn = editorPanel.querySelector("#deleteClueBtn");
      deleteBtn?.addEventListener("click", () => {
        if (confirm("Delete this question?")) {
          GameCreatorEditor.Actions.deleteClue(GameCreatorState.state.selectedCategoryIndex, GameCreatorState.state.selectedClueIndex);
        }
      });
    },
  };

  window.GameCreatorUI = GameCreatorUI;
})();
