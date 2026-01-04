# Jeop2 Game Creator - Architecture Guide

**For the next GLM model taking over this project**

This document provides context for the Game Creator feature that was built in a previous session. Read this to understand the architecture before making any changes.

---

## Overview

The Game Creator is a custom-built interface for creating and editing Jeopardy games. It replaced an earlier "data editor" approach with a more intuitive "creator workspace" design.

### Key Architecture Decision

**3-Column Workspace Layout:**
- Column 1: Categories (list of categories in the game)
- Column 2: Questions (clues in the selected category)
- Column 3: Answers (editor panel for the selected question)

**Important:** This is a **click-to-select model**. Users click to select a category, then click to select a question. The editor panel (Column 3) is always visible and updates based on the selected question.

---

## Visual Design Philosophy

### Color Strategy
- **Yellow (`#FCD34D`)** is used **ONLY** for selection states (selected category, selected question)
- Dollar value badges are **neutral gray** (`rgba(255, 255, 255, 0.5)`) - NOT yellow
- Completion checkmarks are **soft green** (`#34D399`) - NOT yellow
- If you find yellow anywhere else, it's likely wrong

### Visual Hierarchy
- **Column 3 (Answers/Editor)** is visually dominant:
  - Lighter background (`rgba(255, 255, 255, 0.04)`)
  - Stronger border and subtle glow
  - Larger inputs (12px 16px padding, 14px font)
- Columns 1 and 2 should recede into the background

### Spacing
- Workspace grid gap: `20px`
- Workspace grid padding: `20px`
- Column list padding: `16px`, gap: `10px`
- Card padding: `14px 16px`
- Editor form gap: `20px`

**If it feels cramped, increase these values.**

---

## File Locations

### HTML Structure
`index.html` contains the Game Creator dialog structure:
- `#gameCreatorDialog` - The main dialog
- `.creator-sidebar` - Left sidebar with Categories and Games lists
- `.creator-main` - Main workspace area
- `.creator-workspace-grid` - The 3-column layout

### CSS Styles
`styles.css` contains all Game Creator styles. Search for:
- `.creator-` prefix for all Game Creator styles
- `.column-` prefix for column-specific styles
- `.questions-count-control` for the +/- counter

### JavaScript Logic
`app.js` contains all Game Creator logic. Key functions:
- `openGameCreator(game, gameData)` - Opens the creator for a game
- `renderEditor()` - Main render function (auto-selects first category/question)
- `renderCategoriesColumn()` - Renders Column 1
- `renderCluesColumn()` - Renders Column 2
- `renderEditorPanel()` - Renders Column 3 (the answer editor)
- `updateQuestionsCount(newCount)` - Handles the global question count control

---

## Critical Features

### 1. Auto-Selection Behavior
When the Game Creator is opened (via Manage button), the system **automatically loads the first game** in the list, preventing a blank state. When a game is loaded, it also **automatically selects** the first category and first question.

```javascript
// In openBtn.addEventListener (when opening Game Creator)
if (!selectedGameId && allCreatorGames.length > 0) {
  selectedGameId = allCreatorGames[0].id;
  renderGames();
  renderEditor();
}

// In renderEditor()
if (selectedCategoryIndex === null && categories.length > 0) {
  selectedCategoryIndex = 0;
}
if (selectedClueIndex === null && selectedCategoryIndex !== null) {
  const category = categories[selectedCategoryIndex];
  if (category?.clues && category.clues.length > 0) {
    selectedClueIndex = 0;
  }
}
```

### 2. Global Questions Count Control
The Questions column header has a `+` / `−` control that sets the number of questions **uniformly across all categories**.

**Important:** When decreasing the count:
1. Check if questions would be removed
2. Show a warning dialog listing affected categories
3. Only proceed if user confirms

Range: 1-10 questions per category

### 3. Data Structure
Each game follows this structure:
```javascript
{
  "title": "Game Title",
  "subtitle": "Optional subtitle",
  "categories": [
    {
      "title": "Category Name",
      "clues": [
        {
          "value": 200,
          "clue": "Question text",
          "response": "Answer text"
        }
      ]
    }
  ]
}
```

### 4. State Management
Key state variables (in `app.js`):
- `selectedCategoryIndex` - Currently selected category (0-based index)
- `selectedClueIndex` - Currently selected question (0-based index)
- `dirty` - Whether changes have been made (affects Save button)

### 5. Save System
- Save button shows "Saved ✓" when no changes
- Save button shows "Save" (enabled) when `dirty = true`
- Auto-saves to both `games/index.json` and the individual game file

---

## Main Menu Integration

### Game Selection
- Game cards are now **smaller** (1/3 the original size)
- Uses CSS Grid: `grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))`
- Vertical card layout (icon, title, subtitle stacked)

### Category Filter
- Dropdown defaults to "All Games"
- Already implemented - no changes needed

### Manage Button
- Changed from "🎮 Create" to "⚙️ Manage"
- Opens the Game Creator for the selected game

### Import Functionality
- Removed from main menu (redundant)
- Import/Export already exists in Game Creator's kebab menu (⋮)

---

## Recent Changes Summary

### Visual Polish (ChatGPT Feedback)
1. **Editor panel made visually dominant** - Higher contrast, larger inputs
2. **Yellow usage reduced by 50%** - Now only for selection states
3. **Action buttons clarified** - Primary vs secondary, better spacing
4. **Breathing room added** - Increased spacing throughout
5. **Close button de-emphasized** - Smaller, darker, lower opacity

### Terminology Updates
- Column 2: "Clues" → "Questions"
- Column 3: "Editor" → "Answers"
- Added "+" button to Questions column header

### New Features
- **Global questions count control** - `+`/`−` interface in Questions header
- **Auto-selection** - Automatically loads first game, first category, and first question
- **Smaller game cards** - 1/3 size, responsive grid layout
- **Category filtering on main menu only** - Game Creator shows all games

### Category Filtering - Important!
- **Main menu** has the category filter (`menuCategorySelect`) - this is the PRIMARY place for filtering games
- **Game Creator** does NOT filter games by category - it shows ALL games regardless of category
- The Categories section in the Game Creator sidebar is for managing categories (create/rename/delete), not for filtering games
- Games can be assigned to categories via the dropdown in the game header when editing

---

## Gotchas and Common Pitfalls

### DO NOT:
- Use yellow for anything except selection states
- Make the editor panel blend in with the other columns
- Let sections appear blank when loading a game (use auto-selection)
- Apply question count changes to individual categories (must be uniform)
- Remove questions without warning the user
- Filter games by category within the Game Creator (category filtering happens on main menu only)

### DO:
- Keep the editor panel visually dominant
- Maintain consistent spacing (20px gaps)
- Warn before destructive operations
- Auto-select first available items when loading games
- Use neutral colors for non-selection UI elements
- Show ALL games in the Game Creator (no category filtering)

---

## Testing Checklist

Before deploying changes, verify:
- [ ] Selection states use yellow, everything else uses neutral colors
- [ ] Editor panel is visually dominant (lighter background, stronger border)
- [ ] Auto-selection works when opening Game Creator (loads first game)
- [ ] Auto-selection works when loading a game (first category and question)
- [ ] Questions count control warns before removing questions
- [ ] All three columns update correctly when selecting items
- [ ] Save button state changes correctly (dirty tracking)
- [ ] Spacing feels consistent and not cramped
- [ ] Main menu category filter works correctly
- [ ] Game Creator shows ALL games (not filtered by category)

---

## Files Modified in This Session

- `index.html` - Added Game Creator dialog structure, main menu updates
- `styles.css` - All Game Creator styles, main menu card sizing
- `app.js` - All Game Creator logic, event handlers, state management
- `games/index.json` - Updated game metadata
- `games/living-christ.json` - Example game with custom structure
- `games/general-knowledge.json` - Another example game

---

## Questions or Issues?

If you encounter something not covered here, check:
1. The actual implementation in `app.js` (search for the function name)
2. The CSS in `styles.css` (search for `.creator-` classes)
3. The HTML structure in `index.html` (search for `gameCreatorDialog`)

The code is well-commented and should be self-explanatory once you understand the 3-column architecture.

---

**Last updated:** 2026-01-03
**Built by:** GLM-4.7 model
**Architecture:** 3-column workspace (Categories → Questions → Answers)
