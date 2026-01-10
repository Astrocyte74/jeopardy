# Jeop2 - Complete Architecture Guide

**For the next AI agent or developer taking over this project**

This document provides complete context for the Jeop2 project, including the Game Creator, AI integration, and all recent architectural decisions.

---

## Project Overview

Jeop2 is a **vanilla JavaScript** Jeopardy-style game board with a full-featured **Game Creator** and **AI-powered content generation**.

**Tech Stack:**
- Frontend: Plain HTML, CSS, JavaScript (ES6+) - no frameworks
- Backend: Node.js + Express (optional, only for AI features)
- Storage: localStorage (creatorData, customGames) + JSON files (games/)
- AI: OpenRouter API integration via proxy server

**Key Philosophy:** Monolithic but organized. Large files (`app.js` is ~4000 lines) but well-commented and functionally grouped.

---

## Quick Start

### Running the App

```bash
# Option 1: Simple HTTP server (no AI features)
python3 -m http.server 8735
open http://localhost:8735

# Option 2: With AI features enabled
node server.js &  # Start AI proxy on port 8001
python3 -m http.server 8735
open http://localhost:8735
```

### Environment Setup (for AI)

Create `.env` file:
```env
OR_API_KEY=your_openrouter_api_key_here
OR_MODELS=anthropic/claude-3.5-sonnet,openai/gpt-4o
AI_RPM=60
AI_CORS_ORIGIN=*
```

Install dependencies:
```bash
npm install express cors dotenv
```

---

## File Structure

### Core Files
```
/index.html          - Main HTML + embedded dialogs
/styles.css          - All styling (4000+ lines)
/app.js              - Main application logic (4000+ lines)
/server.js           - Express proxy for AI features
/.env                - API keys (not in git)
/package.json        - Dependencies
```

### AI Modules (newly added)
```
/ai-actions.js       - Business logic for AI operations
/ai-buttons.js       - AI button rendering & event handling
/ai-preview.js       - Preview dialog for destructive AI operations
/ai-prompts.js       - All AI prompt templates
/ai-service-frontend.js - API client + JSON parsing
/ai-toast.js         - Toast notifications + undo system
```

### Data Files
```
/game.json           - Default game (loaded if no selection)
/games/index.json    - Game manifest
/games/*.json        - Individual game files
```

### Documentation
```
/README.md           - Basic user guide
/GAME_CREATOR_ARCHITECTURE.md - This file
```

---

## Game Creator Architecture

### Overview

The Game Creator is a **3-column workspace** for creating and editing Jeopardy games:

```
┌─────────────┬─────────────┬──────────────────┐
│ Categories  │  Questions  │     Editor       │
│  (Column 1) │  (Column 2) │   (Column 3)    │
│             │             │                  │
│ • Category 1│ • $200      │ [Question input] │
│ • Category 2│ • $400      │ [Answer input]   │
│ • Category 3│ • $600      │                  │
│             │             │ [AI Actions]     │
└─────────────┴─────────────┴──────────────────┘
```

### Key Interaction Model

**Click-to-Select:**
1. Click category in Column 1 → Column 2 shows questions
2. Click question in Column 2 → Column 3 shows editor
3. Editor in Column 3 is always visible and updates based on selection

**Auto-Selection:**
- When Game Creator opens: Auto-selects first game
- When game loads: Auto-selects first category and first question
- Prevents blank states

### Visual Design Philosophy

**Color Strategy:**
- **Yellow (`#FCD34D`)** - ONLY for selection states
- **Dollar value badges** - Neutral gray, NOT yellow
- **Completion checkmarks** - Soft green, NOT yellow
- **AI buttons** - Purple outline, minimal design

**Visual Hierarchy:**
- Column 3 (Editor) is visually dominant
- Columns 1 & 2 should recede into background
- Consistent spacing: 20px gaps, 16-20px padding

---

## AI Integration

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Browser)                       │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ ai-buttons.js│  │ ai-actions.js │  │  ai-preview.js  │  │
│  │  (UI/events) │─→│  (business)   │─→│   (preview)     │  │
│  └──────────────┘  └───────────────┘  └─────────────────┘  │
│         │                    │                                 │
│         ↓                    ↓                                 │
│  ┌──────────────┐  ┌──────────────────────────────────┐   │
│  │ai-prompts.js │  │ ai-service-frontend.js            │   │
│  │ (templates)  │  │ (API client, JSON parsing, toast) │   │
│  └──────────────┘  └──────────────────────────────────┘   │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │ fetch()
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js Server)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ server.js - Express Proxy                            │   │
│  │  POST /api/ai/generate - Proxies to OpenRouter      │   │
│  │  GET /api/health - Health check                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP request
                            ↓
                    OpenRouter API (AI Models)
```

### AI Features

**1. New Game Wizard**
- Flow: Theme input → Difficulty selection → Generate categories → Preview → Apply → Generate title
- Shows preview dialog before applying (destructive operations)
- "Try Again" button to re-run with previous settings
- Auto-saves game to both `creatorData` and `customGames`

**2. AI Buttons (✨ sparkle icon)**
- Game level: Generate all categories
- Category level: Rename, Fill missing clues, Replace all clues
- Question level: Generate new clue
- Editor level: Generate clue, Rewrite clue, Generate answer, Validate

**3. Difficulty Levels**
- Easy: Accessible, straightforward questions
- Normal: Balanced difficulty
- Hard: Challenging, niche details
- Affects both prompt instructions and model selection

**4. Preview System**
- Shown for destructive operations (generate all, replace all)
- Displays full preview of AI-generated content
- User can Apply, Cancel, or Try Again

**5. Undo System**
- Toast notifications include "Undo" button
- Snapshot-based undo (single item or full game)
- 5-minute expiration

### Prompt System

**Location:** `ai-prompts.js`

**Structure:**
```javascript
function buildPrompt(type, context, difficulty) {
  // Returns { system, user } prompt parts
}
```

**Prompt Types:**
- `game-title` - Generate title/subtitle from content or theme
- `categories-generate` - Generate all categories from theme
- `category-rename` - Suggest 3 alternative names
- `category-generate-clues` - Fill missing clues
- `category-replace-all` - Replace all clues (destructive)
- `questions-generate-five` - Generate 5 clues for category
- `question-generate-single` - Generate one clue
- `editor-generate-clue` - Generate clue + answer
- `editor-rewrite-clue` - Rewrite existing clue
- `editor-generate-answer` - Generate answer for clue
- `editor-validate` - Validate clue/answer pair

**Value Guidance (Normal difficulty):**
```
200: Obvious / very well-known facts
400: Common knowledge within topic
600: Requires familiarity with the topic
800: Niche or specific details
1000: Deep cuts / less obvious information
```

---

## Data Structures

### Game Object Structure

**Nested Structure (Critical!):**
```javascript
{
  id: 'game_1234567890-abc123',
  title: 'Game Title',           // ← Outer (for list display)
  subtitle: 'Game Subtitle',     // ← Outer (for list display)
  categoryId: 'custom',

  game: {                        // ← Nested (for gameplay)
    title: 'Game Title',         // Actual title used in gameplay
    subtitle: 'Game Subtitle',   // Actual subtitle used in gameplay
    categories: [                // ← Categories are HERE!
      {
        title: 'Category Name',
        clues: [
          {
            value: 200,
            clue: 'Question text',
            response: 'Answer text'
          }
        ]
      }
    ]
  }
}
```

**Important:** When accessing categories in renderEditor():
- For creator games: `game.game.game.categories` (nested 3 levels!)
- For file/custom games: `game.gameData.categories`

This is because `game.game` returns the wrapper object with `{id, title, game: {...}}`, so we need to access `.game` again to get the actual game data with categories.

### Storage Systems

**Two Parallel Storage Systems:**

1. **`creatorData`** (Game Creator internal)
   - Key: `localStorage.getItem('jeop2_creator_data')`
   - Contains: `{ categories: [], games: [] }`
   - Purpose: Game Creator workspace management

2. **`customGames`** (Main menu display)
   - Key: `localStorage.getItem('jeop2_custom_games')`
   - Contains: Array of game objects
   - Purpose: Main menu game listing

**Critical:** Both must be kept in sync. When a game is created or modified:
- Save to `creatorData.games` (for Game Creator)
- Save to `customGames` (for main menu visibility)

---

## Auto-Save System

### Architecture

```javascript
// Created in setupGameCreator()
const autoSave = createAutoSaveFunction();

// Returns debounced function:
async () => {
  // Wait 500ms after last change
  // Save to both creatorData and customGames
  // Show "✓ Saved" indicator
}
```

### Auto-Save Triggers

**Debounced (500ms):**
- Editor input changes (question, answer, value, title, subtitle)
- AI operations (generate, rewrite, etc.)
- Add/remove categories or clues
- Undo operations

**Immediate (no debounce):**
- Category management (move, rename, delete)
- Game management (create, delete, import)
- These save to `creatorData` immediately

### Save Indicator

```html
<span class="action-bar-save" id="creatorSaveIndicator">
  All changes saved automatically
</span>
```

- Shows "✓ Saved" briefly when auto-save completes
- No save button needed!

---

## Recent Bug Fixes & Architectural Decisions

### 1. Nested Game Structure (Latest Fix)

**Problem:** Clicking games in left panel didn't load categories/questions.

**Root Cause:** Game object has nested structure where categories are at `game.game.game.categories`, not `game.game.categories`.

**Solution:**
```javascript
// In renderEditor()
if (game.source === "creator" && game.game) {
  gameData = game.game.game || game.game;  // Access nested .game
}
```

### 2. Live References vs Stale Copies

**Problem:** AI-generated titles appeared in editor but not in game list until clicked.

**Root Cause:** `allCreatorGames` array was copying title/subtitle values at load time. When AI updated the game, the copied values remained stale.

**Solution:**
```javascript
// Render from live reference, not stale copy
const displayTitle = game.source === "creator" && game.game
  ? game.game.title  // Live reference
  : game.title;      // Actual value
```

### 3. Circular Reference Error

**Problem:** `JSON.stringify(data)` failed with "Converting circular structure to JSON" when saving.

**Root Cause:** `game.gameData` pointed back to `game`, creating circular reference.

**Solution:** Clean data before saving:
```javascript
function saveCreatorData(data) {
  const cleanedData = {
    categories: data.categories,
    games: data.games.map(game => ({
      id: game.id,
      title: game.title,
      subtitle: game.subtitle,
      game: {
        title: game.game?.title,
        subtitle: game.game?.subtitle,
        categories: game.game?.categories || []
      }
    }))
  };
  localStorage.setItem(CREATOR_DATA_KEY, JSON.stringify(cleanedData));
}
```

### 4. Selection Reset Causing Blank Editor

**Problem:** After aggressive selection reset, clicking games didn't load content.

**Root Cause:** Resetting `selectedCategoryIndex = null` when clicking games caused editor to show blank.

**Solution:** Smart bounds checking instead of reset:
```javascript
// Only reset if out of bounds
if (selectedCategoryIndex === null || selectedCategoryIndex >= categories.length) {
  selectedCategoryIndex = 0;
}
```

---

## Main Menu vs Game Creator

### Main Menu (Home Screen)

**Purpose:** Browse and play games

**Features:**
- Small game cards (140px min-width)
- Category filter dropdown (PRIMARY filtering location)
- Import button (one-off games)
- Create button → Opens Game Creator
- Manage button (⚙️) → Opens Game Creator for selected game

### Game Creator (Workspace)

**Purpose:** Create and edit games

**Features:**
- Left sidebar: Categories (manage folders) + Games (all games, no filtering)
- Main workspace: 3-column editor
- AI-powered content generation
- Auto-save (no save button needed)
- Export/Import via kebab menu (⋮)

**Important Distinction:**
- Main menu: Filter games by category
- Game Creator: Show ALL games (no category filtering)

---

## Critical Gotchas

### DO NOT:

- Use yellow for anything except selection states
- Access `game.game.categories` directly (use `game.game.game.categories` for creator games)
- Forget to save to both `creatorData` AND `customGames`
- Filter games by category within Game Creator
- Let sections appear blank (use auto-selection)
- Remove the `.env` file (contains API keys)
- Commit `node_modules/` or `.env` to git

### DO:

- Keep the editor panel visually dominant
- Maintain consistent spacing (20px gaps)
- Use the nested game structure correctly
- Call `autoSave()` after any game modification
- Warn before destructive operations
- Auto-select first available items when loading games
- Test both standalone mode (no server) and AI mode (with server)

---

## Code Entry Points

### When You Need To...

**Add a new AI feature:**
1. Add prompt to `ai-prompts.js`
2. Add validator to `window.validators` in `ai-prompts.js`
3. Add button in `ai-buttons.js`
4. Add action handler in `ai-actions.js`

**Modify the UI layout:**
1. Check `styles.css` for `.creator-` classes
2. Check `index.html` for dialog structure
3. Check `app.js` for render functions

**Debug a game not loading:**
1. Check `renderEditor()` - does it get the right `gameData`?
2. Check `game.game.game.categories` structure
3. Check console for errors

**Add new storage:**
1. Follow the pattern of `creatorData` and `customGames`
2. Save to both systems if needed for visibility
3. Use `loadAllGames()` to refresh

---

## Testing Checklist

Before deploying changes:

**Game Creator:**
- [ ] Opening Game Creator auto-loads first game
- [ ] Loading a game auto-selects first category and question
- [ ] Clicking games in left panel loads correctly
- [ ] Editor inputs work and auto-save
- [ ] AI features work (if server running)
- [ ] Preview dialog shows for destructive operations
- [ ] Undo system works from toast
- [ ] Categories and questions render in all columns

**Main Menu:**
- [ ] Games appear after creation (check customGames)
- [ ] Category filter works
- [ ] Import works
- [ ] Manage button opens Game Creator

**Data Persistence:**
- [ ] Games save to localStorage
- [ ] Games appear on main menu
- [ ] Reloading page preserves games

---

## Common Tasks

### Adding a New AI Prompt

```javascript
// In ai-prompts.js
'new-prompt-type': {
  system: SYSTEM_INSTRUCTION,
  user: `Prompt template here with ${context.variable}`
}

// Add validator
window.validators['new-prompt-type'] = (data) => {
  // Return true if valid, false otherwise
};
```

### Modifying the Game Creator Layout

```javascript
// In app.js
function renderEditor() {
  // Main render logic
}

function renderCategoriesColumn() {
  // Column 1
}

function renderCluesColumn() {
  // Column 2
}

function renderEditorPanel() {
  // Column 3
}
```

### Debugging Data Flow

```javascript
// Add console.log to trace data
console.log('[FunctionName] Variable:', variable);

// Check game structure
console.log('[renderEditor] gameData:', gameData);
console.log('[renderEditor] categories:', gameData?.categories);
```

---

## Server Setup (AI Features Only)

**server.js** - Express proxy for OpenRouter

```javascript
// Endpoints:
POST /api/ai/generate  - Generate content (proxies to OpenRouter)
GET  /api/health        - Health check

// Configuration:
// Reads from .env file
// OR_API_KEY - OpenRouter API key
// OR_MODELS - Comma-separated model list
// AI_RPM - Rate limit (requests per minute)
// AI_CORS_ORIGIN - CORS origin (default: *)
```

**Start server:**
```bash
node server.js
# Runs on port 8001
```

**Test server:**
```bash
curl http://localhost:8001/api/health
```

---

## Performance Considerations

**Large Files:**
- `app.js` is ~4000 lines - consider splitting if adding major features
- `styles.css` is ~4000 lines - well-organized with comments

**localStorage Limits:**
- Typically 5-10 MB limit
- Each game ~5-50 KB
- Can store 100-1000 games safely

**Auto-Save Debouncing:**
- 500ms debounce prevents excessive saves
- Only saves when actually needed

---

## Future Improvements

**Code Organization:**
- Split `app.js` into modules (game-creator, main-menu, gameplay, etc.)
- Use ES6 modules for better organization
- Consider TypeScript for type safety

**Features:**
- Team play (already partially implemented)
- Audio/video support
- Image support for clues
- Multi-round games
- Timer functionality

---

## Questions?

**Check these first:**
1. `app.js` - Search for function name (well-commented)
2. `styles.css` - Search for `.creator-` classes
3. `index.html` - Check dialog structure
4. Console logs - Use browser dev tools
5. Git history - Recent commits have detailed messages

**Key Files to Understand:**
- `app.js` lines 2200-4000: Game Creator logic
- `ai-actions.js`: AI business logic
- `ai-prompts.js`: Prompt templates
- `server.js`: AI proxy server

---

**Last updated:** 2026-01-09
**Recent work:** AI integration, auto-save system, wizard flow, bug fixes for nested game structure
**Architecture:** Vanilla JS, 3-column workspace, modular AI system
**Maintainer:** Human + AI collaboration
