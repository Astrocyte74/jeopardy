# Game Creator Refactoring Plan

**Branch:** `experiment-new-direction`
**Date:** 2026-01-09
**Goal:** Refactor Game Creator from monolithic to modular architecture

---

## Problem Statement

The Game Creator code in `app.js` is ~4000 lines with all functionality in a single closure-based function. This makes it:
- Hard to navigate and find specific functionality
- Difficult for new AI agents or developers to understand
- Increasingly cumbersome as we add more features
- Risky to modify due to intertwined dependencies

---

## Solution: Two-Phase Refactoring

### Phase 1: Namespace Pattern (Path B) ✅ CURRENT PHASE

**Objective:** Reorganize code within `app.js` using a namespace pattern

**Approach:**
- Keep all code in `app.js` (no file changes)
- Reorganize into `GameCreator` namespace object
- Group related functions by responsibility
- Add clear section dividers and documentation

**Benefits:**
- ✅ Immediate organization improvements
- ✅ Low risk - easy to test and rollback
- ✅ Can continue adding features during refactoring
- ✅ Creates mental model for eventual module split
- ✅ Functions become: `GameCreator.Storage.loadCreatorData()`

**Structure:**
```javascript
// ================================
// Game Creator Module
// ================================

const GameCreator = {
  // State
  state: {
    creatorData: null,
    selectedCategoryId: null,
    selectedGameId: null,
    selectedCategoryIndex: null,
    selectedClueIndex: null,
    pendingDeleteGameId: null,
    allCreatorGames: [],
    // ...
  },

  // Storage & Persistence
  Storage: {
    getDefaultCreatorData() { ... },
    loadCreatorData() { ... },
    saveCreatorData(data) { ... },
    createAutoSaveFunction() { ... },
  },

  // Data Accessors
  Data: {
    getCreatorData() { ... },
    getAllGames() { ... },
    getSelectedGame() { ... },
    // ...
  },

  // Render Functions (3-column layout)
  Render: {
    categories() { ... },        // Left sidebar categories
    games() { ... },              // Left sidebar games list
    editor() { ... },             // Main editor orchestrator
    categoriesColumn() { ... },    // Column 1: Categories
    cluesColumn() { ... },         // Column 2: Questions
    editorPanel() { ... },         // Column 3: Editor form
  },

  // Actions (state modification)
  Actions: {
    createNewGame() { ... },
    deleteGame() { ... },
    addCategory() { ... },
    removeCategory() { ... },
    moveCategory() { ... },
    renameCategory() { ... },
    addClue() { ... },
    deleteClue() { ... },
    resizeCategories() { ... },
    resizeClues() { ... },
  },

  // UI Helpers
  UI: {
    showInlineRename() { ... },
    showInlineAddCategory() { ... },
    showDeleteCategoryDialog() { ... },
    setupMenuListeners() { ... },
    setupWorkspaceListeners() { ... },
  },

  // Initialization
  setup() {
    // Main entry point
    // Replaces current setupGameCreator()
  }
};

window.GameCreator = GameCreator;
```

**Completion Criteria:**
- [ ] All Game Creator functions in `GameCreator` namespace
- [ ] Clear section comments and organization
- [ ] All functionality tested and working
- [ ] Can add/edit/delete games, categories, clues
- [ ] AI features still work
- [ ] Auto-save works
- [ ] Export/import works

**Commit Message:**
```
reorg: namespace Game Creator functions

- Reorganized Game Creator code into GameCreator namespace object
- Grouped functions by responsibility (Storage, Data, Render, Actions, UI)
- Added clear section dividers and documentation
- All functionality preserved and tested
```

---

### Phase 2: Extract to Modules (Path A) ⏳ NEXT PHASE

**Objective:** Split `GameCreator` namespace into separate module files

**Prerequisite:** Phase 1 complete and tested

**File Structure:**
```
game-creator/
├── game-creator-storage.js    # Data persistence (localStorage)
├── game-creator-state.js      # State management & data accessors
├── game-creator-utils.js      # Helper utilities
├── game-creator-categories.js # Left sidebar (Categories list)
├── game-creator-games.js      # Games list (left panel)
├── game-creator-editor.js     # 3-column workspace renderer
├── game-creator-workspace.js  # Workspace controls (add, resize)
├── game-creator-main.js       # Main entry point & orchestration
```

**Dependencies:**
```
game-creator-main.js
    ↓
game-creator-state.js ← game-creator-storage.js
    ↓                      ↓
game-creator-editor.js ← game-creator-utils.js
    ↓
game-creator-categories.js
game-creator-games.js
game-creator-workspace.js
```

**Extraction Order (least → most dependent):**
1. `game-creator-storage.js` - No dependencies
2. `game-creator-utils.js` - No dependencies
3. `game-creator-state.js` - Depends on storage
4. `game-creator-categories.js` - Depends on state
5. `game-creator-games.js` - Depends on state
6. `game-creator-editor.js` - Depends on state, utils
7. `game-creator-workspace.js` - Depends on state
8. `game-creator-main.js` - Orchestrates all

**Module Pattern (from zimage):**
```javascript
// game-creator-storage.js
const GameCreatorStorage = {
  // State
  data: {
    CREATOR_DATA_KEY: 'jeop2_creator_data',
  },

  // Functions
  getDefaultCreatorData() { ... },
  loadCreatorData() { ... },
  saveCreatorData(data) { ... },

  // Export
  init() {
    window.GameCreatorStorage = this;
  }
};

// Auto-initialize when loaded
GameCreatorStorage.init();
```

**index.html script order:**
```html
<!-- Game Creator Modules (load in dependency order) -->
<script src="game-creator/game-creator-storage.js"></script>
<script src="game-creator/game-creator-utils.js"></script>
<script src="game-creator/game-creator-state.js"></script>
<script src="game-creator/game-creator-categories.js"></script>
<script src="game-creator/game-creator-games.js"></script>
<script src="game-creator/game-creator-editor.js"></script>
<script src="game-creator/game-creator-workspace.js"></script>
<script src="game-creator/game-creator-main.js"></script>

<!-- AI Modules -->
<script src="ai-prompts.js"></script>
<script src="ai-service-frontend.js"></script>
<script src="ai-toast.js"></script>
<script src="ai-preview.js"></script>
<script src="ai-actions.js"></script>
<script src="ai-buttons.js"></script>

<!-- Main App (reduced) -->
<script src="app.js"></script>
```

**Completion Criteria:**
- [ ] All modules created and loaded
- [ ] All functionality tested and working
- [ ] No circular dependencies
- [ ] Clean module interfaces
- [ ] Original app.js reduced by ~1600 lines

**Commit Message:**
```
refactor: split Game Creator into modules

- Extracted Game Creator into 8 focused modules
- Each module has single responsibility
- Clean interfaces and dependency management
- Reduced app.js by ~1600 lines
- All functionality preserved and tested

Modules:
- game-creator-storage.js: Data persistence
- game-creator-utils.js: Helper utilities
- game-creator-state.js: State management
- game-creator-categories.js: Category management
- game-creator-games.js: Game list management
- game-creator-editor.js: 3-column workspace
- game-creator-workspace.js: Workspace controls
- game-creator-main.js: Orchestration
```

---

## Current Code Structure (Before Refactoring)

**Location:** `app.js` lines 2141-3916 (~1775 lines)

**Main Function:** `setupGameCreator()` at line 2292

**State Variables (in closure):**
- `creatorData` - Categories and games from localStorage
- `selectedCategoryId` - Currently selected category
- `selectedGameId` - Currently selected game
- `selectedCategoryIndex` - Currently selected category in editor
- `selectedClueIndex` - Currently selected clue in editor
- `pendingDeleteGameId` - Two-step delete confirmation
- `allCreatorGames` - All games (creator + file + custom)
- `dirty` - Unused (auto-save enabled)

**Key Functions:**
- `getDefaultCreatorData()` - Default data structure
- `loadCreatorData()` - Load from localStorage
- `saveCreatorData(data)` - Save to localStorage
- `createAutoSaveFunction()` - Debounced auto-save
- `loadAllGames()` - Load all game sources
- `renderCategories()` - Render left sidebar categories
- `renderGames()` - Render left sidebar games
- `renderEditor()` - Main editor orchestrator
- `renderCategoriesColumn()` - Column 1 renderer
- `renderCluesColumn()` - Column 2 renderer
- `renderEditorPanel()` - Column 3 renderer
- `setupHeaderEventListeners()` - Game header inputs
- `setupWorkspaceListeners()` - Workspace buttons
- `setupClueEditorListeners()` - Editor form inputs
- `createNewGame()` - Create new blank game
- `showInlineRename()` - Inline category rename
- `showInlineAddCategory()` - Inline category add
- `showDeleteCategoryDialog()` - Category delete confirmation

**Nested Structure:**
```
setupGameCreator() {
  // All functions are nested inside, sharing closure state

  function loadAllGames() { ... }
  function renderCategories() { ... }
  function renderGames() { ... }
  function renderEditor() { ... }
  // ... 20+ more functions

  // Event listeners
  openBtn.addEventListener("click", ...);
  // ... many more listeners
}
```

---

## Key Architectural Decisions

### 1. State Management

**Current:** Closure-based state
```javascript
async function setupGameCreator() {
  let creatorData = loadCreatorData();
  let selectedCategoryId = null;
  // Functions share these variables via closure
}
```

**Phase 1 (Namespace):** Object-based state
```javascript
const GameCreator = {
  state: {
    creatorData: null,
    selectedCategoryId: null,
  },
  // Functions access via this.state or GameCreator.state
};
```

**Phase 2 (Modules):** Shared state module
```javascript
// game-creator-state.js
const GameCreatorState = {
  data: {
    creatorData: null,
    selectedCategoryId: null,
  },
  get(key) { return this.data[key]; },
  set(key, value) { this.data[key] = value; },
};
```

### 2. Function Naming

**Current:** Direct function names
```javascript
function renderEditor() { ... }
```

**Phase 1+:** Namespaced functions
```javascript
GameCreator.Render.editor()
// or
GameCreator.renderEditor()
```

### 3. Inter-Function Calls

**Current:** Direct calls (closure-scoped)
```javascript
function renderEditor() {
  renderCategoriesColumn(categories);
  renderCluesColumn(categories);
  renderEditorPanel(categories);
}
```

**Phase 1+:** Explicit namespace calls
```javascript
GameCreator.Render.editor = function() {
  GameCreator.Render.categoriesColumn(categories);
  GameCreator.Render.cluesColumn(categories);
  GameCreator.Render.editorPanel(categories);
};
```

### 4. Event Handlers

**Current:** Inline, closure-scoped
```javascript
openBtn.addEventListener("click", () => {
  loadAllGames().then(() => { ... });
});
```

**Phase 1+:** Namespace-scoped
```javascript
openBtn.addEventListener("click", () => {
  GameCreator.Data.loadAllGames().then(() => { ... });
});
```

---

## Testing Checklist

After each phase, verify:

### Core Functionality
- [ ] Open Game Creator dialog
- [ ] Create new blank game
- [ ] Edit game title and subtitle
- [ ] Add category to game
- [ ] Add question to category
- [ ] Edit question value, text, answer
- [ ] Delete question
- [ ] Delete category
- [ ] Switch between games
- [ ] Switch between categories
- [ ] Switch between questions
- [ ] Auto-save works (check localStorage)

### AI Features (if server running)
- [ ] Generate title/subtitle
- [ ] Generate full game
- [ ] Generate category content
- [ ] Generate single question
- [ ] Rewrite question
- [ ] Generate answer

### Import/Export
- [ ] Export game to JSON
- [ ] Import game from JSON
- [ ] Export shows instructions

### Persistence
- [ ] Game saves to creatorData localStorage
- [ ] Game appears in customGames localStorage
- [ ] Game appears on main menu
- [ ] Reloading page preserves games

### UI Behavior
- [ ] Category selection works
- [ ] Question selection works
- [ ] Inline rename works
- [ ] Two-step delete works
- [ ] Add/remove category buttons work
- [ ] Add/remove question buttons work
- [ ] Resize categories/questions works

---

## Risks & Mitigation

### Risk 1: Breaking Closure State
**Mitigation:** Convert to `GameCreator.state` object in Phase 1, test thoroughly

### Risk 2: Breaking Function Calls
**Mitigation:** Use full namespace paths (`GameCreator.Render.editor()`), not relative calls

### Risk 3: Script Loading Order
**Mitigation:** Load modules in dependency order, use window globals for Phase 2

### Risk 4: Losing Functionality
**Mitigation:** Test checklist after each phase, git commits at each safe point

### Risk 5: AI Integration Breakage
**Mitigation:** Maintain `window.renderEditor` and other AI hooks

---

## Rollback Plan

If something goes wrong:

1. **Phase 1 rollback:**
   ```bash
   git reset --hard HEAD~1  # Undo namespace reorg
   ```

2. **Phase 2 rollback:**
   ```bash
   git reset --hard HEAD~1  # Undo module split
   # Then re-apply Phase 1 commit if needed
   ```

3. **Safe points to commit:**
   - After Phase 1 complete and tested
   - After each module extraction in Phase 2

---

## Success Metrics

- [ ] Code is easier to navigate (can find functions quickly)
- [ ] Adding new features is simpler (clear where to add code)
- [ ] New AI agents can understand structure faster
- [ ] No functionality broken
- [ ] All tests pass
- [ ] File size of app.js reduced (Phase 2)

---

## References

- **Architecture inspiration:** `projects/zimage/frontend/main.js` (Recipe Manager)
- **Current architecture:** `GAME_CREATOR_ARCHITECTURE.md`
- **AI modules:** Already split (ai-actions.js, ai-buttons.js, etc.)

---

## Notes for Future Agents

**Why this approach?**
- User wants to keep developing features actively
- Monolith will get more cumbersome over time
- Two-phase approach balances organization with continued development
- Path B (Namespace) is low-risk stepping stone to Path A (Modules)

**Key principle:** Maintain working functionality at all times. Test after each change.

**Context loss recovery:** If context is lost during refactoring:
1. Read this document
2. Check git log for recent commits
3. Read GAME_CREATOR_ARCHITECTURE.md for system overview
4. Continue from last completed phase

**Current status:**
- Phase 1: In Progress (About to start)
- Phase 2: Not started
