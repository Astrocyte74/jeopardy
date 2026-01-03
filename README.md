# Jeop (offline Jeopardy-style board)

This repo is a simple Jeopardy-style game board you can adapt with your own categories and clues.

## Run

Because the app loads JSON files via `fetch()`, you should run a tiny local web server (browsers often block `fetch()` from `file://`).

- `python3 -m http.server 8000`
- Open `http://localhost:8000/`

Edit `game.json` to change categories, clues, and responses (use `game.template.json` as a starting point).

## Multiple games

Games shown under **Games** come from `games/index.json`.

- Add a new JSON file anywhere in the repo (common: `games/my-game.json`)
- Add an entry in `games/index.json`:

```json
{
  "id": "my-game",
  "title": "My Game",
  "subtitle": "Optional",
  "path": "games/my-game.json"
}
```

You can also use **Games → Load JSON file** to upload a one-off game (it’s saved to `localStorage` as a “custom game” on that browser).

## Data format (`game.json`)

`game.json` looks like:

```json
{
  "title": "My Game",
  "subtitle": "Optional",
  "categories": [
    {
      "title": "Category name",
      "clues": [{ "value": 200, "clue": "Clue text", "response": "Response text" }]
    }
  ]
}
```

Notes:
- If `value` is omitted, it defaults to `200, 400, 600...` by row (per category).
- The app stores “used clues” + scores in `localStorage`. Use the **Reset** button to clear it.
