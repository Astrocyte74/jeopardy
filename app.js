// ==================== THEME SYSTEM ====================
const THEME_KEY = "jeop2:theme";

const themes = {
  classic: {
    name: "Classic Blue",
    primary: "#0055a4",
    secondary: "#003366",
    accent: "#ffcc00",
    gold: "#ffd700",
    danger: "#dc3545",
    success: "#28a745",
    bgStart: "#0a0a20",
    bgMid: "#1a1a40",
    bgEnd: "#0a0a20",
  },
  sunset: {
    name: "Sunset Orange",
    primary: "#ff6b35",
    secondary: "#f7931e",
    accent: "#fff59d",
    gold: "#ffd54f",
    danger: "#c62828",
    success: "#2e7d32",
    bgStart: "#1a0a10",
    bgMid: "#2a1a20",
    bgEnd: "#1a0a10",
  },
  forest: {
    name: "Forest Green",
    primary: "#2d5a27",
    secondary: "#1a3a18",
    accent: "#aed581",
    gold: "#cddc39",
    danger: "#c62828",
    success: "#1b5e20",
    bgStart: "#0a1a08",
    bgMid: "#1a2a18",
    bgEnd: "#0a1a08",
  },
  purple: {
    name: "Royal Purple",
    primary: "#6b3fa0",
    secondary: "#4a2570",
    accent: "#ce93d8",
    gold: "#e1bee7",
    danger: "#c62828",
    success: "#2e7d32",
    bgStart: "#1a0a1e",
    bgMid: "#2a1a3e",
    bgEnd: "#1a0a1e",
  },
  ocean: {
    name: "Ocean Blue",
    primary: "#0077be",
    secondary: "#004466",
    accent: "#4dd0e1",
    gold: "#26c6da",
    danger: "#c62828",
    success: "#2e7d32",
    bgStart: "#0a1a1a",
    bgMid: "#0a2a3a",
    bgEnd: "#0a1a1a",
  },
  rose: {
    name: "Rose Pink",
    primary: "#e91e63",
    secondary: "#880e4f",
    accent: "#f48fb1",
    gold: "#f06292",
    danger: "#b71c1c",
    success: "#2e7d32",
    bgStart: "#1a0a12",
    bgMid: "#2a1a22",
    bgEnd: "#1a0a12",
  },
  ember: {
    name: "Ember Red",
    primary: "#d32f2f",
    secondary: "#b71c1c",
    accent: "#ffcc80",
    gold: "#ffa726",
    danger: "#b71c1c",
    success: "#1b5e20",
    bgStart: "#1a0808",
    bgMid: "#2a1818",
    bgEnd: "#1a0808",
  },
  midnight: {
    name: "Midnight Dark",
    primary: "#1a1a2e",
    secondary: "#16213e",
    accent: "#e94560",
    gold: "#ffd700",
    danger: "#e94560",
    success: "#00ff88",
    bgStart: "#050510",
    bgMid: "#0f0f23",
    bgEnd: "#050510",
  },
};

let currentTheme = localStorage.getItem(THEME_KEY) || "classic";

function applyTheme(themeKey) {
  const theme = themes[themeKey];
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty("--theme-primary", theme.primary);
  root.style.setProperty("--theme-secondary", theme.secondary);
  root.style.setProperty("--theme-accent", theme.accent);
  root.style.setProperty("--theme-gold", theme.gold);
  root.style.setProperty("--theme-danger", theme.danger);
  root.style.setProperty("--theme-success", theme.success);
  root.style.setProperty("--theme-bg-start", theme.bgStart);
  root.style.setProperty("--theme-bg-mid", theme.bgMid);
  root.style.setProperty("--theme-bg-end", theme.bgEnd);

  currentTheme = themeKey;
  localStorage.setItem(THEME_KEY, themeKey);
}

// ==================== CONFETTI SYSTEM ====================
class ConfettiSystem {
  constructor() {
    this.canvas = document.getElementById("confetti");
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.active = false;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  launch(count = 150, duration = 3000) {
    const colors = [
      "#ffcc00", "#ffd700", "#ff6b35", "#ff4757",
      "#2ed573", "#1e90ff", "#a55eea", "#fd79a8"
    ];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 5,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        friction: 0.98,
        gravity: 0.3,
        opacity: 1,
        decay: Math.random() * 0.01 + 0.005,
      });
    }

    if (!this.active) {
      this.active = true;
      this.animate();
    }

    setTimeout(() => {
      this.active = false;
    }, duration);
  }

  animate() {
    if (!this.active && this.particles.length === 0) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0) return false;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();

      return true;
    });

    if (this.particles.length > 0 || this.active) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiSystem();

// ==================== SCORE FLOAT ANIMATIONS ====================
function showScoreFloat(amount, x, y) {
  const container = document.getElementById("scoreFloats");
  const float = document.createElement("div");
  float.className = `score-float ${amount >= 0 ? "positive" : "negative"}`;
  float.textContent = amount >= 0 ? `+$${amount}` : `-$${Math.abs(amount)}`;
  float.style.left = `${x}px`;
  float.style.top = `${y}px`;
  container.appendChild(float);

  setTimeout(() => float.remove(), 1500);
}

// ==================== EMBEDDED GAMES (file:// fallback) ====================
const embeddedGames = {};

// ==================== CORE APP ====================
const LEGACY_STATE_KEY = "jeop:state:v1";
const STATE_PREFIX = "jeop2:state:v2";
const SELECTED_GAME_KEY = "jeop2:selectedGameId:v1";
const CUSTOM_GAMES_KEY = "jeop2:customGames:v1";
const GAMES_INDEX_URL = "games/index.json";

const app = {
  gameId: null,
  game: null,
  state: null,
  onGameStart: null,
  openClueFunc: null,
};

function stateKey(gameId) {
  return `${STATE_PREFIX}:${gameId}`;
}

function slugify(input) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadCustomGames() {
  const raw = localStorage.getItem(CUSTOM_GAMES_KEY);
  const parsed = typeof raw === "string" ? safeJsonParse(raw) : null;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((g) => g && typeof g === "object")
    .map((g) => ({
      id: String(g.id ?? ""),
      title: String(g.title ?? "Custom game"),
      subtitle: String(g.subtitle ?? ""),
      source: "custom",
      game: g.game ?? null,
    }))
    .filter((g) => g.id && g.game && typeof g.game === "object");
}

function saveCustomGames(list) {
  localStorage.setItem(CUSTOM_GAMES_KEY, JSON.stringify(list));
}

async function loadGamesIndex() {
  const response = await fetch(GAMES_INDEX_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${GAMES_INDEX_URL} (${response.status})`);
  const json = await response.json();
  const games = Array.isArray(json?.games) ? json.games : null;
  if (!games) throw new Error(`Invalid ${GAMES_INDEX_URL}: expected { "games": [...] }`);

  return games
    .filter((g) => g && typeof g === "object")
    .map((g) => ({
      id: String(g.id ?? ""),
      title: String(g.title ?? g.id ?? "Game"),
      subtitle: String(g.subtitle ?? ""),
      path: String(g.path ?? ""),
      source: "index",
    }))
    .filter((g) => g.id && g.path);
}

async function getAvailableGames() {
  const custom = loadCustomGames();
  let builtIn = [];
  let indexError = null;

  for (const [id, game] of Object.entries(embeddedGames)) {
    builtIn.push({
      id,
      title: game.title,
      subtitle: game.subtitle,
      source: "embedded",
      game,
    });
  }

  try {
    const indexGames = await loadGamesIndex();
    builtIn = [...indexGames, ...builtIn];
  } catch (err) {
    indexError = err;
  }

  return { games: [...builtIn, ...custom], indexError };
}

async function loadGameJsonFromPath(path) {
  let lastError = null;
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load ${path} (${response.status})`);
    return await response.json();
  } catch (err) {
    lastError = err;
  }

  throw new Error(
    `Unable to load ${path}. If you opened index.html as a file, use the embedded games or run a local server (e.g. \`python3 -m http.server 5858\`). Original error: ${String(
      lastError?.message ?? lastError,
    )}`,
  );
}

function validateGameShape(game) {
  if (!game || typeof game !== "object") throw new Error("Game JSON must be an object.");
  if (!Array.isArray(game.categories) || game.categories.length === 0) {
    throw new Error('Game JSON must include "categories" (non-empty array).');
  }
  for (const [categoryIndex, category] of game.categories.entries()) {
    if (!category || typeof category !== "object") throw new Error(`Category ${categoryIndex + 1} must be an object.`);
    if (typeof category.title !== "string" || !category.title.trim()) {
      throw new Error(`Category ${categoryIndex + 1} missing "title" string.`);
    }
    if (!Array.isArray(category.clues)) throw new Error(`Category ${categoryIndex + 1} missing "clues" array.`);
    for (const [clueIndex, clue] of category.clues.entries()) {
      if (!clue || typeof clue !== "object") throw new Error(`Category ${categoryIndex + 1} clue ${clueIndex + 1} must be an object.`);
      if (typeof clue.clue !== "string") throw new Error(`Category ${categoryIndex + 1} clue ${clueIndex + 1} missing "clue" string.`);
      if (typeof clue.response !== "string") throw new Error(`Category ${categoryIndex + 1} clue ${clueIndex + 1} missing "response" string.`);
      if (clue.value != null && !Number.isFinite(Number(clue.value))) {
        throw new Error(`Category ${categoryIndex + 1} clue ${clueIndex + 1} has invalid "value".`);
      }
    }
  }
}

function normalizeGame(game) {
  const categories = game.categories.map((category, categoryIndex) => {
    const clues = (category.clues ?? []).map((clue, rowIndex) => {
      const defaultValue = (rowIndex + 1) * 200;
      const value = Number.isFinite(clue.value) ? clue.value : defaultValue;
      return {
        clue: String(clue.clue ?? ""),
        response: String(clue.response ?? ""),
        value,
        dailyDouble: Boolean(clue.dailyDouble),
        id: `${categoryIndex}:${rowIndex}`,
      };
    });
    return { title: String(category.title ?? ""), clues };
  });

  const rows = Math.max(0, ...categories.map((c) => c.clues.length));
  return {
    title: String(game.title ?? "Jeop2"),
    subtitle: String(game.subtitle ?? ""),
    categories,
    rows,
  };
}

function defaultState(numTeams) {
  const teams = [];
  for (let i = 0; i < numTeams; i++) {
    teams.push({ id: `t${i + 1}`, name: `Team ${i + 1}`, score: 0 });
  }

  const used = {};
  return {
    teams,
    activeTeamId: teams[0]?.id ?? "t1",
    used,
    customTitle: null,
    customSubtitle: null,
  };
}

function loadState(game, gameId, numTeams) {
  try {
    const key = stateKey(gameId);
    let raw = localStorage.getItem(key);
    const legacyRaw = raw ? null : localStorage.getItem(LEGACY_STATE_KEY);
    if (!raw && !legacyRaw) return { state: defaultState(numTeams), migratedFromLegacy: false };
    if (!raw && legacyRaw) raw = legacyRaw;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { state: defaultState(numTeams), migratedFromLegacy: false };
    }

    const base = defaultState(numTeams);
    const teams = Array.isArray(parsed.teams) ? parsed.teams : base.teams;
    const sanitizedTeams = teams
      .map((t, index) => ({
        id: String(t.id ?? `t${index + 1}`),
        name: String(t.name ?? `Team ${index + 1}`),
        score: Number.isFinite(t.score) ? t.score : 0,
      }))
      .slice(0, 8);

    const used = { ...base.used };
    if (parsed.used && typeof parsed.used === "object") {
      for (const [id, value] of Object.entries(parsed.used)) {
        used[id] = Boolean(value);
      }
    }

    const activeTeamId = sanitizedTeams.some((t) => t.id === parsed.activeTeamId)
      ? parsed.activeTeamId
      : sanitizedTeams[0]?.id ?? "t1";

    return {
      migratedFromLegacy: Boolean(legacyRaw),
      state: {
        teams: sanitizedTeams,
        activeTeamId,
        used,
        customTitle: typeof parsed.customTitle === "string" ? parsed.customTitle : null,
        customSubtitle: typeof parsed.customSubtitle === "string" ? parsed.customSubtitle : null,
      },
    };
  } catch {
    return { state: defaultState(numTeams), migratedFromLegacy: false };
  }
}

function saveState(state) {
  if (!app.gameId) return;
  localStorage.setItem(stateKey(app.gameId), JSON.stringify(state));
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, String(value));
  }
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === "string") node.appendChild(document.createTextNode(child));
    else node.appendChild(child);
  }
  return node;
}

function money(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return "";
  return `$${Math.abs(Math.trunc(v))}`;
}

function renderTitle(game, state) {
  const title = state.customTitle ?? game.title;
  const subtitle = state.customSubtitle ?? game.subtitle;
  document.getElementById("gameTitle").textContent = title;
  const subtitleEl = document.getElementById("gameSubtitle");
  subtitleEl.textContent = subtitle;
}

function renderTeams(state) {
  const container = document.getElementById("teams");
  container.textContent = "";

  for (const team of state.teams) {
    const row = el(
      "div",
      { class: `teamRow${state.activeTeamId === team.id ? " active" : ""}`, role: "button", tabindex: "0" },
      el("div", {}, el("div", { class: "teamName" }, team.name)),
      el("div", { class: "teamScore" }, String(team.score)),
    );

    function selectTeam() {
      state.activeTeamId = team.id;
      saveState(state);
      renderTeams(state);
    }

    row.addEventListener("click", selectTeam);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTeam();
      }
    });

    container.appendChild(row);
  }
}

function clueAt(game, id) {
  const [c, r] = id.split(":").map((x) => Number.parseInt(x, 10));
  if (!Number.isFinite(c) || !Number.isFinite(r)) return null;
  const category = game.categories[c];
  const clue = category?.clues?.[r];
  if (!category || !clue) return null;
  return { categoryTitle: category.title, clue };
}

function renderBoard(game, state, onOpenClue) {
  const board = document.getElementById("board");
  board.textContent = "";

  const shownCategories = game.categories;
  board.style.setProperty("--cols", String(shownCategories.length));

  for (const category of shownCategories) {
    board.appendChild(el("div", { class: "cell cellHeader", role: "columnheader" }, category.title));
  }

  for (let rowIndex = 0; rowIndex < game.rows; rowIndex++) {
    for (let categoryIndex = 0; categoryIndex < shownCategories.length; categoryIndex++) {
      const category = shownCategories[categoryIndex];
      const clue = category.clues[rowIndex];
      const clueId = `${categoryIndex}:${rowIndex}`;
      const used = Boolean(state.used[clueId]);

      const btn = el(
        "button",
        { class: `clueBtn${used ? " used" : ""}`, type: "button" },
        clue ? money(clue.value) : "",
      );

      btn.disabled = used || !clue;
      btn.addEventListener("click", (e) => {
        if (!used && clue) onOpenClue(clueId, e);
      });

      board.appendChild(el("div", { class: "cell", role: "gridcell" }, btn));
    }
  }
}

function setupClueDialog() {
  const dialog = document.getElementById("clueDialog");
  const categoryEl = document.getElementById("clueCategory");
  const valueEl = document.getElementById("clueValue");
  const clueTextEl = document.getElementById("clueText");
  const responseEl = document.getElementById("responseText");
  const answeringTeamsEl = document.getElementById("answeringTeams");

  const showResponseBtn = document.getElementById("showResponseBtn");
  const markCorrectBtn = document.getElementById("markCorrectBtn");
  const markIncorrectBtn = document.getElementById("markIncorrectBtn");

  let activeClueId = null;
  let answeringTeamId = null;

  function renderAnsweringTeams() {
    if (!answeringTeamsEl) return;
    const state = app.state;
    if (!state) return;
    answeringTeamsEl.textContent = "";
    const current = answeringTeamId ?? state.activeTeamId;
    for (const team of state.teams) {
      const chip = el(
        "button",
        { type: "button", class: `teamChip${team.id === current ? " selected" : ""}` },
        team.name,
      );
      chip.addEventListener("click", () => {
        answeringTeamId = team.id;
        state.activeTeamId = team.id;
        saveState(state);
        renderTeams(state);
        renderAnsweringTeams();
      });
      answeringTeamsEl.appendChild(chip);
    }
  }

  function openClue(id, event) {
    const game = app.game;
    const state = app.state;
    if (!game || !state) return;
    const found = clueAt(game, id);
    if (!found) return;
    if (state.used[id]) return;

    activeClueId = id;
    answeringTeamId = state.activeTeamId;
    categoryEl.textContent = found.categoryTitle;
    valueEl.textContent = money(found.clue.value);
    clueTextEl.textContent = found.clue.clue;
    responseEl.textContent = found.clue.response;
    responseEl.classList.add("hidden");
    responseEl.classList.remove("visible");
    showResponseBtn.textContent = "Show Answer";

    // Reset the showingAnswer state
    document.querySelector(".dialogCardLarge")?.classList.remove("showingAnswer");

    renderAnsweringTeams();

    dialog.showModal();

    // Focus the "Show Answer" button for keyboard users
    setTimeout(() => showResponseBtn.focus(), 50);

    // Click anywhere on dialog card (except buttons) to show answer
    const dialogCard = dialog.querySelector(".dialogCardLarge");
    const showAnswerOnClick = (e) => {
      // Only handle if answer is still hidden and not clicking on buttons
      if (responseEl.classList.contains("hidden") &&
          !e.target.closest("button") &&
          !e.target.closest(".answeringTeams")) {
        e.preventDefault();
        showResponseBtn.click();
        // Remove the listener after showing answer
        dialogCard.removeEventListener("click", showAnswerOnClick);
      }
    };
    dialogCard.addEventListener("click", showAnswerOnClick);
  }

  function closeDialog() {
    activeClueId = null;
    dialog.close();
  }

  showResponseBtn.addEventListener("click", () => {
    const isHidden = responseEl.classList.toggle("hidden");
    const isVisible = !isHidden;
    showResponseBtn.textContent = isHidden ? "Show Answer" : "Hide Answer";

    // Toggle the showingAnswer class for animation
    const dialogCard = document.querySelector(".dialogCardLarge");
    if (isVisible) {
      dialogCard?.classList.add("showingAnswer");
    } else {
      dialogCard?.classList.remove("showingAnswer");
    }

    // Re-focus the button for keyboard users
    showResponseBtn.focus();
  });

  // Handle spacebar specifically - show answer instead of closing dialog
  dialog.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !e.repeat) {
      // Only handle spacebar if response is still hidden
      if (responseEl.classList.contains("hidden") && document.activeElement !== markCorrectBtn && document.activeElement !== markIncorrectBtn) {
        e.preventDefault();
        showResponseBtn.click();
      }
    }
  });

  function adjustScore(sign, event) {
    const game = app.game;
    const state = app.state;
    if (!game || !state) return;
    if (!activeClueId) return;
    const found = clueAt(game, activeClueId);
    if (!found) return;
    const value = Math.abs(Number(found.clue.value) || 0);
    const selected = answeringTeamId ?? state.activeTeamId;
    const team = state.teams.find((t) => t.id === selected);
    if (!team) return;

    // Show screen flash
    const flash = document.getElementById("screenFlash");
    flash.className = sign > 0 ? "flash-correct" : "flash-incorrect";
    setTimeout(() => flash.className = "", 500);

    // Show score float animation
    const rect = event.target.getBoundingClientRect();
    showScoreFloat(sign * value, rect.left + rect.width / 2, rect.top);

    // Launch confetti on correct answer
    if (sign > 0) {
      confetti.launch(80, 2000);
    }

    team.score = (Number(team.score) || 0) + sign * value;
    state.used[activeClueId] = true;
    saveState(state);
    renderTeams(state);
    renderBoard(game, state, openClue);
    closeDialog();
  }

  markCorrectBtn.addEventListener("click", (e) => adjustScore(+1, e));
  markIncorrectBtn.addEventListener("click", (e) => adjustScore(-1, e));

  dialog.addEventListener("close", () => {
    activeClueId = null;
  });

  return { openClue };
}

// Global wrapper for openClue
function openClue(id, event) {
  if (app.openClueFunc) {
    app.openClueFunc(id, event);
  }
}

function setupSettingsDialog(onAfterSave) {
  const dialog = document.getElementById("settingsDialog");
  const titleInput = document.getElementById("settingsGameTitle");
  const subtitleInput = document.getElementById("settingsGameSubtitle");
  const teamsContainer = document.getElementById("settingsTeams");

  function renderTeamInputs() {
    const state = app.state;
    if (!state) return;
    teamsContainer.textContent = "";
    const list = el("div", { class: "settingsTeamsList" });

    state.teams.forEach((team, index) => {
      const nameInput = el("input", { type: "text", value: team.name, autocomplete: "off" });
      nameInput.addEventListener("input", () => {
        team.name = nameInput.value;
      });

      const scoreInput = el("input", {
        type: "text",
        value: String(team.score),
        inputmode: "numeric",
        autocomplete: "off",
      });
      scoreInput.addEventListener("input", () => {
        const next = Number.parseInt(scoreInput.value.replace(/[^\d-]/g, ""), 10);
        if (Number.isFinite(next)) team.score = next;
        else team.score = 0;
      });

      const removeBtn = el("button", { class: "iconBtn removeTeamBtn", type: "button" }, "🗑");
      removeBtn.disabled = state.teams.length <= 1;
      removeBtn.addEventListener("click", () => {
        state.teams.splice(index, 1);
        if (!state.teams.some((t) => t.id === state.activeTeamId)) {
          state.activeTeamId = state.teams[0]?.id ?? state.activeTeamId;
        }
        renderTeamInputs();
      });

      list.appendChild(
        el(
          "div",
          { class: "settingsTeamRow" },
          nameInput,
          scoreInput,
          removeBtn,
        ),
      );
    });

    teamsContainer.appendChild(list);
  }

  // settingsBtn and addTeamBtn are now handled in main() via dropdown

  dialog.addEventListener("close", () => {
    if (!app.state) return;
    app.state.customTitle = titleInput.value.trim() || null;
    app.state.customSubtitle = subtitleInput.value.trim() || null;
    saveState(app.state);
    onAfterSave();
  });
}

function setupGamesDialog(onPickGame) {
  const dialog = document.getElementById("gamesDialog");
  const listEl = document.getElementById("gamesList");
  const fileInput = document.getElementById("gamesFileInput");
  const helpText = document.getElementById("gamesHelpText");
  const playBtn = document.getElementById("playSelectedGameBtn");
  const removeCustomBtn = document.getElementById("removeCustomGameBtn");

  let available = [];
  let selectedId = null;

  function renderList() {
    listEl.textContent = "";

    if (available.length === 0) {
      listEl.appendChild(
        el(
          "div",
          { class: "gameRow" },
          el("div", { class: "gameRowTitle" }, "No games found"),
          el("div", { class: "gameRowMeta" }, "Upload a JSON game to add custom games."),
        ),
      );
      playBtn.disabled = true;
      removeCustomBtn.disabled = true;
      return;
    }

    for (const game of available) {
      const row = el(
        "div",
        { class: `gameRow${game.id === selectedId ? " selected" : ""}`, role: "listitem", tabindex: "0" },
        el("div", { class: "gameRowTitle" }, game.title),
        el(
          "div",
          { class: "gameRowMeta" },
          game.subtitle || (game.source === "custom" ? "Custom upload" : game.source === "embedded" ? "Built-in" : game.path),
        ),
      );

      function select() {
        selectedId = game.id;
        playBtn.disabled = false;
        removeCustomBtn.disabled = game.source !== "custom";
        renderList();
      }

      row.addEventListener("click", select);
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      });

      listEl.appendChild(row);
    }
  }

  async function refresh() {
    const { games, indexError } = await getAvailableGames();
    available = games;
    if (helpText) {
      if (indexError) {
        helpText.innerHTML = "Using embedded games. Add entries to <code>games/index.json</code> and run a local server to add more.";
      } else {
        helpText.innerHTML = "Add entries to <code>games/index.json</code> to show more built-in games, or upload a JSON file.";
      }
    }

    if (!selectedId) selectedId = app.gameId || localStorage.getItem(SELECTED_GAME_KEY);
    if (selectedId && !available.some((g) => g.id === selectedId)) selectedId = available[0]?.id ?? null;
    playBtn.disabled = !selectedId;
    removeCustomBtn.disabled = !selectedId || available.find((g) => g.id === selectedId)?.source !== "custom";
    renderList();
  }

  playBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const selected = available.find((g) => g.id === selectedId);
    if (!selected) return;
    onPickGame(selected);
    dialog.close();
  });

  removeCustomBtn.addEventListener("click", () => {
    const selected = available.find((g) => g.id === selectedId);
    if (!selected || selected.source !== "custom") return;
    const existing = loadCustomGames();
    const next = existing.filter((g) => g.id !== selected.id);
    saveCustomGames(next);
    selectedId = null;
    refresh();
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      validateGameShape(parsed);

      const title = String(parsed.title ?? file.name.replace(/\.json$/i, "")).trim() || "Custom game";
      const subtitle = String(parsed.subtitle ?? "").trim();
      const id = `custom:${slugify(title) || "game"}:${Date.now()}`;
      const custom = loadCustomGames();
      custom.unshift({ id, title, subtitle, source: "custom", game: parsed });
      saveCustomGames(custom);

      selectedId = id;
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Could not load JSON: ${message}`);
    } finally {
      fileInput.value = "";
    }
  });

  return { refresh };
}

function setupThemeDialog() {
  const dialog = document.getElementById("themeDialog");
  const themeGrid = document.getElementById("themeGrid");

  function renderThemeGrid() {
    themeGrid.textContent = "";

    for (const [themeKey, theme] of Object.entries(themes)) {
      const option = el("div", {
        class: `themeOption${currentTheme === themeKey ? " selected" : ""}`,
        dataset: { theme: themeKey },
        "data-name": theme.name,
        role: "button",
        tabindex: "0",
      });

      option.addEventListener("click", () => selectTheme(themeKey));
      option.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectTheme(themeKey);
        }
      });

      themeGrid.appendChild(option);
    }
  }

  function selectTheme(themeKey) {
    applyTheme(themeKey);
    renderThemeGrid();
  }

  return { renderThemeGrid };
}

// ==================== MAIN MENU ====================
let menuSelectedGame = null;
let menuSelectedTheme = currentTheme;

async function initMainMenu() {
  const gameList = document.getElementById("menuGameList");
  const themeGrid = document.getElementById("menuThemeGrid");
  const teamsSetup = document.getElementById("teamsSetup");
  const addTeamBtn = document.getElementById("menuAddTeamBtn");
  const startBtn = document.getElementById("startGameBtn");
  const gameSettingsToggle = document.getElementById("gameSettingsToggle");
  const gameSettingsContent = document.getElementById("gameSettingsContent");
  const menuGameTitle = document.getElementById("menuGameTitle");
  const menuGameSubtitle = document.getElementById("menuGameSubtitle");
  const categorySelect = document.getElementById("menuCategorySelect");
  const gameSearch = document.getElementById("menuGameSearch");
  const searchCount = document.getElementById("menuGameSearchCount");
  const menuCreateGameBtn = document.getElementById("menuCreateGameBtn");

  // Teams data - start with 2 teams
  let menuTeams = [
    { name: "Team 1" },
    { name: "Team 2" }
  ];

  // Game settings data
  let menuGameSettings = {
    title: "",
    subtitle: ""
  };

  // Load games
  const { games } = await getAvailableGames();
  let allGames = games;
  let selectedCategory = "all";

  // Add categoryId to existing games that don't have one
  const creatorData = loadCreatorData();

  allGames.forEach(game => {
    if (!game.categoryId) {
      // All games go to "All Games" by default
      game.categoryId = creatorData.categories[0]?.id || "cat_all";
    }
  });

  // Also load games from Game Creator data
  creatorData.games.forEach(creatorGame => {
    // Check if this game already exists in the list
    if (!allGames.find(g => g.id === creatorGame.id)) {
      // Build proper game structure: {title, subtitle, categories: [...]}
      const gameData = creatorGame.game || creatorGame.gameData || { categories: [] };
      const gameForMenu = {
        title: creatorGame.title,
        subtitle: creatorGame.subtitle,
        ...gameData  // Spreads {categories: [...]}
      };

      // Convert creator game to the format expected by main menu
      allGames.push({
        id: creatorGame.id,
        title: creatorGame.title,
        subtitle: creatorGame.subtitle,
        source: "creator",
        categoryId: creatorGame.categoryId,
        game: gameForMenu,  // Proper structure with title/subtitle/categories
      });
    }
  });

  menuSelectedGame = allGames[0];

  // Initialize game settings with the first game's data
  menuGameTitle.value = menuSelectedGame.title || "";
  menuGameSubtitle.value = menuSelectedGame.subtitle || "";

  // Populate category selector from Game Creator data
  creatorData.categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });

  // Create game button triggers the hidden createGameBtn (opens Game Creator)
  menuCreateGameBtn.addEventListener("click", () => {
    document.getElementById("createGameBtn").click();
  });

  function renderGameList() {
    gameList.innerHTML = "";
    const searchTerm = gameSearch.value.toLowerCase().trim();

    // Filter games by category and search term
    const filteredGames = allGames.filter(game => {
      // Category filter - if "all" is selected, show everything
      // Note: Currently main menu games don't have categoryId, so we show all unless filtering by creator games
      const categoryMatch = selectedCategory === "all" || game.categoryId === selectedCategory;

      // Search filter
      const searchMatch = !searchTerm ||
        game.title.toLowerCase().includes(searchTerm) ||
        game.subtitle.toLowerCase().includes(searchTerm);

      return categoryMatch && searchMatch;
    });

    searchCount.textContent = filteredGames.length;

    filteredGames.forEach(game => {
      const option = document.createElement("div");
      option.className = `game-option${game.id === menuSelectedGame.id ? " selected" : ""}`;

      // Choose icon based on source
      const icon = game.source === "creator" ? "✏️" :
                   game.source === "custom" ? "📤" :
                   game.source === "embedded" ? "📦" : "🎮";

      option.innerHTML = `
        <span class="game-option-icon">${icon}</span>
        <div class="game-option-info">
          <div class="game-option-title">${game.title}</div>
          <div class="game-option-subtitle">${game.subtitle || game.source}</div>
        </div>
      `;
      option.addEventListener("click", () => {
        menuSelectedGame = game;
        // Auto-populate game settings from the selected game
        menuGameTitle.value = game.title || "";
        menuGameSubtitle.value = game.subtitle || "";
        menuGameSettings.title = "";
        menuGameSettings.subtitle = "";
        renderGameList();
      });
      gameList.appendChild(option);
    });
  }

  // Render themes
  function renderThemeGrid() {
    themeGrid.innerHTML = "";
    for (const [themeKey, theme] of Object.entries(themes)) {
      const option = document.createElement("div");
      option.className = `themeOption${themeKey === menuSelectedTheme ? " selected" : ""}`;
      option.dataset.theme = themeKey;
      option.setAttribute("data-name", theme.name);
      option.addEventListener("click", () => {
        menuSelectedTheme = themeKey;
        applyTheme(themeKey);
        renderThemeGrid();
      });
      themeGrid.appendChild(option);
    }
  }

  // Render team inputs
  function renderTeamInputs() {
    teamsSetup.innerHTML = "";
    menuTeams.forEach((team, index) => {
      const row = document.createElement("div");
      row.className = "team-input-row";
      row.innerHTML = `
        <span class="team-number">${index + 1}</span>
        <input type="text" value="${team.name}" placeholder="Team name" data-index="${index}">
        <button class="remove-team-btn" data-index="${index}" ${menuTeams.length <= 1 ? 'disabled' : ''}>✕</button>
      `;

      // Update team name on input
      const input = row.querySelector("input");
      input.addEventListener("input", () => {
        menuTeams[index].name = input.value || `Team ${index + 1}`;
      });

      // Remove team button
      const removeBtn = row.querySelector(".remove-team-btn");
      removeBtn.addEventListener("click", () => {
        if (menuTeams.length > 1) {
          menuTeams.splice(index, 1);
          renderTeamInputs();
        }
      });

      teamsSetup.appendChild(row);
    });
  }

  // Add team button
  addTeamBtn.addEventListener("click", () => {
    const newIndex = menuTeams.length + 1;
    menuTeams.push({ name: `Team ${newIndex}` });
    renderTeamInputs();
  });

  // Collapsible game settings
  gameSettingsToggle.addEventListener("click", () => {
    const isCollapsed = gameSettingsContent.classList.toggle("collapsed");
    gameSettingsToggle.classList.toggle("collapsed", isCollapsed);
  });

  // Game settings inputs
  menuGameTitle.addEventListener("input", () => {
    menuGameSettings.title = menuGameTitle.value;
  });

  menuGameSubtitle.addEventListener("input", () => {
    menuGameSettings.subtitle = menuGameSubtitle.value;
  });

  // Initial render
  renderTeamInputs();

  // Listen for games updated event from Game Creator
  window.addEventListener('jeop2:gamesUpdated', async () => {
    // Reload games
    const { games: newGames } = await getAvailableGames();
    allGames = newGames;

    // Re-assign categories to games that don't have one
    const refreshedCreatorData = loadCreatorData();

    allGames.forEach(game => {
      if (!game.categoryId) {
        // All games go to "All Games" by default since we removed "Built-in"
        game.categoryId = refreshedCreatorData.categories[0]?.id || "cat_all";
      }
    });

    // Add creator games
    refreshedCreatorData.games.forEach(creatorGame => {
      if (!allGames.find(g => g.id === creatorGame.id)) {
        // Build proper game structure: {title, subtitle, categories: [...]}
        const gameData = creatorGame.game || creatorGame.gameData || { categories: [] };
        const gameForMenu = {
          title: creatorGame.title,
          subtitle: creatorGame.subtitle,
          ...gameData  // Spreads {categories: [...]}
        };

        allGames.push({
          id: creatorGame.id,
          title: creatorGame.title,
          subtitle: creatorGame.subtitle,
          source: "creator",
          categoryId: creatorGame.categoryId,
          game: gameForMenu,  // Proper structure with title/subtitle/categories
        });
      }
    });

    // Keep the current selection if it still exists
    if (!allGames.find(g => g.id === menuSelectedGame?.id)) {
      menuSelectedGame = allGames[0];
    }

    renderGameList();
  });

  // Start button - pass the team names and game settings to startGame
  startBtn.addEventListener("click", () => {
    startGame(menuSelectedGame, menuTeams, menuGameSettings);
  });

  // Category select change
  categorySelect.addEventListener("change", () => {
    selectedCategory = categorySelect.value;
    renderGameList();
  });

  // Search input
  gameSearch.addEventListener("input", () => {
    renderGameList();
  });

  renderGameList();
  renderThemeGrid();
}

function showMainMenu() {
  document.getElementById("mainMenu").classList.remove("hidden");
  document.getElementById("gameContainer").classList.add("hidden");
}

function hideMainMenu() {
  document.getElementById("mainMenu").classList.add("hidden");
  document.getElementById("gameContainer").classList.remove("hidden");
}

async function startGame(gameRef, teamNames = null, gameSettings = null) {
  hideMainMenu();

  const gameId = gameRef.id;
  let rawGame;

  if (gameRef.source === "custom" || gameRef.source === "embedded" || gameRef.source === "creator") {
    rawGame = gameRef.game;
  } else {
    rawGame = await loadGameJsonFromPath(gameRef.path);
  }

  validateGameShape(rawGame);
  const game = normalizeGame(rawGame);
  const loaded = loadState(game, gameId, teamNames ? teamNames.length : 2);
  const state = loaded.state;

  // If team names were provided, use them
  if (teamNames && teamNames.length > 0) {
    state.teams.forEach((team, index) => {
      if (teamNames[index]) {
        team.name = teamNames[index].name || team.name;
      }
    });
  }

  // If game settings were provided, use them
  if (gameSettings) {
    if (gameSettings.title) {
      state.customTitle = gameSettings.title;
    }
    if (gameSettings.subtitle) {
      state.customSubtitle = gameSettings.subtitle;
    }
  }

  saveState(state);

  app.gameId = gameId;
  app.game = game;
  app.state = state;
  localStorage.setItem(SELECTED_GAME_KEY, gameId);

  if (loaded.migratedFromLegacy) saveState(state);

  renderTitle(game, state);
  renderTeams(state);
  renderBoard(game, state, (id, e) => {
    if (app.openClueFunc) app.openClueFunc(id, e);
  });

  // Confetti celebration on game start
  confetti.launch(100, 2000);
}

async function setCurrentGame(gameRef) {
  const gameId = gameRef.id;
  let rawGame;

  if (gameRef.source === "custom" || gameRef.source === "embedded" || gameRef.source === "creator") {
    rawGame = gameRef.game;
  } else {
    rawGame = await loadGameJsonFromPath(gameRef.path);
  }

  validateGameShape(rawGame);

  const game = normalizeGame(rawGame);
  // Use current number of teams if available, otherwise default to 2
  const numTeams = app.state?.teams?.length || 2;
  const loaded = loadState(game, gameId, numTeams);
  const state = loaded.state;

  app.gameId = gameId;
  app.game = game;
  app.state = state;
  localStorage.setItem(SELECTED_GAME_KEY, gameId);

  if (loaded.migratedFromLegacy) saveState(state);

  renderTitle(game, state);
  renderTeams(state);
  renderBoard(game, state, (id, e) => {
    if (app.openClueFunc) app.openClueFunc(id, e);
  });
}

function main() {
  // Apply saved theme
  applyTheme(currentTheme);

  // Setup dialogs
  setupThemeDialog();
  const { openClue } = setupClueDialog();
  app.openClueFunc = openClue;

  function rerenderAll() {
    if (!app.game || !app.state) return;
    renderTitle(app.game, app.state);
    renderTeams(app.state);
    renderBoard(app.game, app.state, (id, e) => {
      if (app.openClueFunc) app.openClueFunc(id, e);
    });
  }

  setupSettingsDialog(rerenderAll);
  setupResetDialog(rerenderAll);
  setupGameCreator();

  const gamesDialog = setupGamesDialog((picked) => {
    setCurrentGame(picked).catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      alert(message);
    });
  });

  // Setup top menu dropdown
  const topMenuDropdown = document.getElementById("topMenuDropdown");
  const topMenuBtn = document.getElementById("topMenuBtn");

  function toggleTopMenu() {
    topMenuDropdown.classList.toggle("open");
  }

  function closeTopMenu() {
    topMenuDropdown.classList.remove("open");
  }

  topMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTopMenu();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!topMenuDropdown.contains(e.target)) {
      closeTopMenu();
    }
  });

  // Render theme circles in dropdown
  const themeCircles = document.getElementById("themeCircles");
  for (const [themeKey, theme] of Object.entries(themes)) {
    const circle = document.createElement("div");
    circle.className = `theme-circle${currentTheme === themeKey ? " selected" : ""}`;
    circle.style.background = `linear-gradient(145deg, ${theme.primary}, ${theme.secondary})`;
    circle.dataset.theme = themeKey;
    circle.title = theme.name;

    circle.addEventListener("click", (e) => {
      e.stopPropagation();
      applyTheme(themeKey);
      // Update selected state
      document.querySelectorAll(".theme-circle").forEach(c => c.classList.remove("selected"));
      circle.classList.add("selected");
      // Keep menu open for visual feedback
    });

    themeCircles.appendChild(circle);
  }

  // Handle menu item clicks
  topMenuDropdown.addEventListener("click", (e) => {
    const item = e.target.closest(".menu-dropdown-item");
    if (!item) return;

    const action = item.dataset.action;
    closeTopMenu();

    switch (action) {
      case "settings":
        // Trigger the settings dialog setup
        if (!app.state || !app.game) return;
        const settingsDialog = document.getElementById("settingsDialog");
        const settingsTitle = document.getElementById("settingsGameTitle");
        const settingsSubtitle = document.getElementById("settingsGameSubtitle");
        const settingsTeams = document.getElementById("settingsTeams");
        settingsTitle.value = app.state.customTitle ?? app.game.title;
        settingsSubtitle.value = app.state.customSubtitle ?? app.game.subtitle;
        // Render team inputs
        settingsTeams.textContent = "";
        const list = el("div", { class: "settingsTeamsList" });
        app.state.teams.forEach((team, index) => {
          const nameInput = el("input", { type: "text", value: team.name, autocomplete: "off" });
          nameInput.addEventListener("input", () => {
            team.name = nameInput.value;
          });
          const scoreInput = el("input", {
            type: "text",
            value: String(team.score),
            inputmode: "numeric",
            autocomplete: "off",
          });
          scoreInput.addEventListener("input", () => {
            const next = Number.parseInt(scoreInput.value.replace(/[^\d-]/g, ""), 10);
            if (Number.isFinite(next)) team.score = next;
            else team.score = 0;
          });
          const removeBtn = el("button", { class: "iconBtn removeTeamBtn", type: "button" }, "🗑");
          removeBtn.disabled = app.state.teams.length <= 1;
          removeBtn.addEventListener("click", () => {
            app.state.teams.splice(index, 1);
            if (!app.state.teams.some((t) => t.id === app.state.activeTeamId)) {
              app.state.activeTeamId = app.state.teams[0]?.id ?? app.state.activeTeamId;
            }
            // Re-render
            settingsTeams.textContent = "";
            const newList = el("div", { class: "settingsTeamsList" });
            app.state.teams.forEach((t, i) => {
              const ni = el("input", { type: "text", value: t.name, autocomplete: "off" });
              ni.addEventListener("input", () => { t.name = ni.value; });
              const si = el("input", { type: "text", value: String(t.score), inputmode: "numeric", autocomplete: "off" });
              si.addEventListener("input", () => {
                const n = Number.parseInt(si.value.replace(/[^\d-]/g, ""), 10);
                t.score = Number.isFinite(n) ? n : 0;
              });
              const rb = el("button", { class: "iconBtn removeTeamBtn", type: "button" }, "🗑");
              rb.disabled = app.state.teams.length <= 1;
              rb.addEventListener("click", () => {
                app.state.teams.splice(i, 1);
                // Trigger re-render by clicking settings again
                document.querySelector("[data-action=\"settings\"]")?.click();
              });
              newList.appendChild(el("div", { class: "settingsTeamRow" }, ni, si, rb));
            });
            settingsTeams.appendChild(newList);
          });
          list.appendChild(el("div", { class: "settingsTeamRow" }, nameInput, scoreInput, removeBtn));
        });
        settingsTeams.appendChild(list);
        settingsDialog.showModal();
        break;
      case "reset":
        if (!app.game || !app.state || !app.gameId) return;
        document.getElementById("resetDialog").showModal();
        break;
      case "mainmenu":
        showMainMenu();
        break;
    }
  });

  window.addEventListener("resize", () => rerenderAll());

  // Setup add team button for settings dialog
  document.getElementById("addTeamBtn").addEventListener("click", () => {
    if (!app.state) return;
    const nextIndex = app.state.teams.length + 1;
    app.state.teams.push({ id: `t${Date.now()}`, name: `Team ${nextIndex}`, score: 0 });
    // Re-render settings by clicking settings again
    document.querySelector("[data-action=\"settings\"]")?.click();
  });

  // Initialize main menu
  initMainMenu().then(() => {
    // Check if there's a saved game preference
    const preferred = localStorage.getItem(SELECTED_GAME_KEY);
    if (preferred) {
      getAvailableGames().then(({ games }) => {
        const saved = games.find((g) => g.id === preferred);
        if (saved) {
          showResumeDialog(saved);
        }
      });
    }
  });
}

// ==================== RESUME DIALOG ====================
function showResumeDialog(game) {
  const dialog = document.getElementById("resumeDialog");
  const titleEl = document.getElementById("resumeGameTitle");
  const resumeBtn = document.getElementById("resumeGameBtn");
  const newGameBtn = document.getElementById("newGameBtn");

  titleEl.textContent = game.title;

  // Clean up any existing listeners
  const newResume = resumeBtn.cloneNode(true);
  const newNewGame = newGameBtn.cloneNode(true);
  resumeBtn.parentNode.replaceChild(newResume, resumeBtn);
  newGameBtn.parentNode.replaceChild(newNewGame, newGameBtn);

  // Resume button
  newResume.addEventListener("click", () => {
    dialog.close();
    startGame(game);
  });

  // New game button - just close dialog and stay on menu
  newNewGame.addEventListener("click", () => {
    dialog.close();
  });

  dialog.showModal();
}

// ==================== RESET DIALOG ====================
function setupResetDialog(onReset) {
  const dialog = document.getElementById("resetDialog");
  const confirmBtn = document.getElementById("confirmResetBtn");
  const cancelBtn = document.getElementById("cancelResetBtn");

  confirmBtn.addEventListener("click", () => {
    if (!app.game || !app.state || !app.gameId) return;
    localStorage.removeItem(stateKey(app.gameId));
    const next = defaultState(app.state.teams.length);
    Object.assign(app.state, next);
    if (onReset) onReset();
    dialog.close();
  });

  // Cancel and close button just close the dialog
  cancelBtn.addEventListener("click", () => {
    dialog.close();
  });
}

// ==================== GAME CREATOR ====================
const CREATOR_DATA_KEY = "jeop2:creatorData:v1";

// Helper function to show input dialog (custom overlay to avoid interference with parent dialogs)
// @param {string} title - Short title for the dialog
// @param {string} defaultValue - Default value for the input
// @param {string} helperText - Optional helper text below title
function showInputDialog(title, defaultValue = "", helperText = null, confirmButtonText = "Create game") {
  console.log('[showInputDialog] Called with:', title, defaultValue, helperText);
  return new Promise((resolve) => {
    const overlay = document.getElementById("inputDialog");
    const titleEl = document.getElementById("inputDialogTitle");
    const helperEl = document.getElementById("inputDialogHelper");
    const valueInput = document.getElementById("inputDialogValue");
    const confirmBtn = document.getElementById("inputDialogConfirm");
    const cancelBtn = document.getElementById("inputDialogCancel");
    const xBtn = document.getElementById("inputDialogXBtn");
    const errorEl = document.getElementById("inputDialogError");

    console.log('[showInputDialog] Elements found:', {
      overlay: !!overlay,
      titleEl: !!titleEl,
      helperEl: !!helperEl,
      valueInput: !!valueInput,
      confirmBtn: !!confirmBtn,
      cancelBtn: !!cancelBtn
    });

    if (!overlay) {
      console.error('[showInputDialog] Overlay not found!');
      resolve(null);
      return;
    }

    titleEl.textContent = title;
    if (helperText && helperEl) {
      helperEl.textContent = helperText;
    } else if (helperEl) {
      helperEl.style.display = 'none';
    }
    valueInput.value = defaultValue;
    confirmBtn.textContent = confirmButtonText;
    errorEl.textContent = "";

    let resolved = false;

    // Use AbortController to clean up all event listeners at once
    const abortController = new AbortController();
    const signal = abortController.signal;

    const doResolve = (value) => {
      if (!resolved) {
        resolved = true;
        abortController.abort(); // Remove all event listeners
        overlay.style.display = "none"; // Hide the overlay
        console.log('[showInputDialog] Resolved with:', value);
        resolve(value);
      }
    };

    const confirmHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      // Allow blank input (empty string) for "random" option
      doResolve(valueInput.value.trim());
    };

    const cancelHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      doResolve(null); // null means cancelled
    };

    // Add event listeners with the abort signal
    confirmBtn.addEventListener("click", confirmHandler, { signal, capture: true });
    cancelBtn.addEventListener("click", cancelHandler, { signal, capture: true });
    xBtn.addEventListener("click", cancelHandler, { signal, capture: true });

    // Allow Enter key to confirm
    valueInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        doResolve(valueInput.value.trim());
      }
    }, { signal, capture: true });

    // Show the overlay
    console.log('[showInputDialog] Setting display to flex');
    overlay.style.display = "flex";
    valueInput.focus();
    valueInput.select();
  });
}

// Expose globally for AI modules
window.showInputDialog = showInputDialog;

// Selection dialog for choosing from options (e.g., difficulty)
// @param {string} title - Dialog title
// @param {string} helperText - Helper text below title
// @param {Array} options - Array of {value, icon, title, desc} objects
// @returns {Promise} Resolves with selected value or null if cancelled
function showSelectionDialog(title, helperText, options, defaultValue = null, showBackButton = false) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("selectionDialog");
    const titleEl = document.getElementById("selectionDialogTitle");
    const helperEl = document.getElementById("selectionDialogHelper");
    const optionsContainer = document.getElementById("selectionDialogOptions");
    const backBtn = document.getElementById("selectionDialogBack");
    const confirmBtn = document.getElementById("selectionDialogConfirm");
    const xBtn = document.getElementById("selectionDialogXBtn");

    if (!overlay) {
      console.error('[showSelectionDialog] Overlay not found!');
      resolve(null);
      return;
    }

    // Set content
    titleEl.textContent = title;
    helperEl.textContent = helperText;

    // Show/hide back button based on parameter
    if (backBtn) {
      backBtn.style.display = showBackButton ? 'inline-block' : 'none';
    }

    // Build options
    optionsContainer.innerHTML = '';
    // Use defaultValue if provided, otherwise use first option
    let selectedValue = defaultValue || options[0]?.value || null;

    options.forEach((opt, index) => {
      const isSelected = opt.value === selectedValue;
      const optionEl = document.createElement('div');
      optionEl.className = `selection-option${isSelected ? ' selected' : ''}`;
      optionEl.dataset.value = opt.value;
      optionEl.innerHTML = `
        ${opt.icon ? `<span class="selection-option-icon">${opt.icon}</span>` : ''}
        <div class="selection-option-content">
          <div class="selection-option-title">${opt.title}</div>
          ${opt.desc ? `<div class="selection-option-desc">${opt.desc}</div>` : ''}
        </div>
        <div class="selection-option-radio"></div>
      `;

      optionEl.addEventListener('click', () => {
        // Update selection visual only
        optionsContainer.querySelectorAll('.selection-option').forEach(el => {
          el.classList.remove('selected');
        });
        optionEl.classList.add('selected');
        selectedValue = opt.value;
        // Don't auto-confirm - wait for button click
      });

      optionsContainer.appendChild(optionEl);
    });

    let resolved = false;
    const abortController = new AbortController();
    const signal = abortController.signal;

    const doResolve = (value) => {
      if (!resolved) {
        resolved = true;
        abortController.abort();
        overlay.style.display = "none";
        resolve(value);
      }
    };

    const backHandler = (e) => {
      e.preventDefault();
      // Return special value 'back' to indicate going back
      doResolve('back');
    };

    const cancelHandler = (e) => {
      e.preventDefault();
      // Return null to indicate cancellation
      doResolve(null);
    };

    const confirmHandler = (e) => {
      e.preventDefault();
      doResolve(selectedValue);
    };

    // Only add back button listener if button exists and is visible
    if (backBtn && showBackButton) {
      backBtn.addEventListener("click", backHandler, { signal });
    }
    confirmBtn.addEventListener("click", confirmHandler, { signal });
    xBtn.addEventListener("click", cancelHandler, { signal });

    // Show the overlay
    overlay.style.display = "flex";

    // Focus continue button
    if (confirmBtn) {
      confirmBtn.focus();
    }
  });
}

// Expose globally
window.showSelectionDialog = showSelectionDialog;

// ==================== NEW GAME WIZARD ====================
/**
 * Run the New Game Wizard - walks user through creating a game with AI
 * @returns {Promise<boolean>} true if game was created, false if cancelled
 */
/**
 * Run the New Game Wizard
 * @param {object} previousContext - Optional context from previous run { theme, difficulty }
 * @returns {Promise<boolean>} true if successful, false if cancelled
 */
async function runNewGameWizard(previousContext = null) {
  console.log('[NewGameWizard] Starting wizard...', { previousContext });

  // Step 1: Theme (pre-fill if retrying)
  let theme = await showInputDialog(
    "Let's create your game",
    previousContext?.theme || '',
    'What theme would you like? Leave blank for a random theme',
    'Next' // Custom button text for wizard
  );

  if (theme === null) {
    console.log('[NewGameWizard] User cancelled at theme step');
    return false; // Cancelled (no game created yet, so no cleanup needed)
  }

  // Step 2: Difficulty (pre-select if retrying)
  const difficultyOptions = [
    {
      value: 'easy',
      icon: '🟢',
      title: 'Easy',
      desc: 'Accessible, well-known facts - great for beginners'
    },
    {
      value: 'normal',
      icon: '🟡',
      title: 'Normal',
      desc: 'Balanced mix - a fun challenge for everyone'
    },
    {
      value: 'hard',
      icon: '🔴',
      title: 'Hard',
      desc: 'Niche details and deep cuts - for trivia experts'
    }
  ];

  let difficulty = await showSelectionDialog(
    'Choose difficulty',
    'How challenging should the questions be?',
    difficultyOptions,
    previousContext?.difficulty || null,
    true // Show back button
  );

  // Handle "Back" - go back to theme step
  if (difficulty === 'back') {
    console.log('[NewGameWizard] User clicked Back, returning to theme step');
    // Re-run wizard with current theme as default
    return await runNewGameWizard({ theme });
  }

  // Handle cancel (X button)
  if (difficulty === null) {
    console.log('[NewGameWizard] User cancelled at difficulty step');
    return false; // Cancelled (no game created yet, so no cleanup needed)
  }

  console.log('[NewGameWizard] Wizard complete:', { theme, difficulty });

  // Step 3: NOW create the blank game and generate with AI
  // We only create the game after user has confirmed theme and difficulty
  console.log('[NewGameWizard] Creating new blank game...');
  await window.createNewGame();
  console.log('[NewGameWizard] Blank game created and loaded');

  // Helper function to reset if user cancels at preview stage
  const cleanupOnCancel = () => {
    console.log('[NewGameWizard] User cancelled at preview, cleaning up...');
    // Reload from file to reset state (removes the in-memory blank game)
    window.loadAllGames && window.loadAllGames();
    window.renderEditor && window.renderEditor();
  };

  // Generate the game using AI (pass context for retry and cleanup)
  const result = await generateGameWithAI(theme, difficulty, cleanupOnCancel);

  // If generation failed, clean up the blank game
  if (!result) {
    console.log('[NewGameWizard] Generation failed, cleaning up blank game');
    cleanupOnCancel();
  }

  return result;
}

/**
 * Generate a game using AI with the given theme and difficulty
 * @param {string} theme - Game theme (empty string for random)
 * @param {string} difficulty - 'easy', 'normal', or 'hard'
 * @param {function} onCancel - Optional cleanup callback for cancel
 * @returns {Promise<boolean>} true if successful, false if failed
 */
async function generateGameWithAI(theme, difficulty, onCancel = null) {
  console.log('[GenerateGame] Starting AI generation:', { theme, difficulty });

  // Show loading dialog
  showLoadingDialog('Creating your game...', 'Connecting to AI...');

  try {
    // Check if AI is available
    updateLoadingDialog('Checking AI availability...');
    const isAvailable = await checkAIServer();
    if (!isAvailable) {
      hideLoadingDialog();
      aiToast.show({
        message: 'AI server is not available. Please start the AI server.',
        type: 'error',
        duration: 5000
      });
      return false;
    }

    // Build context for categories-generate
    const context = {
      theme: theme || 'random interesting trivia',
      count: 6 // Always generate 6 categories
    };

    // Create retry callback that re-runs wizard with same settings
    const retryContext = { theme, difficulty };
    const onRetry = async (context) => {
      console.log('[GenerateGame] Retry clicked, re-running wizard with:', context);
      // Re-run wizard with previous context
      await runNewGameWizard(context);
    };

    // Update status and execute AI generation
    updateLoadingDialog('Generating your game...');

    // Hide loading dialog when preview appears
    const originalPreviewShow = window.aiPreview?.show;
    if (originalPreviewShow) {
      window.aiPreview.show = function(...args) {
        console.log('[generateGameWithAI] Preview shown, hiding loading dialog');
        hideLoadingDialog();
        return originalPreviewShow.apply(this, args);
      };
    }

    // Create a wrapped onConfirm that will be called after user clicks Apply
    // This will generate the title AFTER the categories are applied
    const onConfirmWithExtraAction = async () => {
      console.log('[generateGameWithAI] User clicked Apply, now generating title...');

      // Build context for game-title action (needs sample content from generated categories)
      const gameHeader = document.getElementById('creatorGameHeader');
      const gameData = gameHeader?._gameData;
      const game = gameHeader?._game;

      let titleContext;
      if (gameData && game) {
        // Build sample content from the first 3 categories, first 2 clues each
        const sampleContent = gameData.categories
          .filter(cat => cat.clues && cat.clues.some(c => c.clue && c.clue.trim()))
          .slice(0, 3)
          .map(cat => ({
            category: cat.title || 'Untitled',
            clues: cat.clues
              .filter(c => c.clue && c.clue.trim())
              .slice(0, 2)
              .map(c => ({ question: c.clue, answer: c.response }))
          }));

        titleContext = {
          hasContent: true,
          sampleContent: JSON.stringify(sampleContent),
          currentTitle: game.title,
          currentSubtitle: game.subtitle
        };
      } else {
        // Fallback - use theme directly
        titleContext = {
          hasContent: false,
          theme: theme || 'random',
          currentTitle: 'New Game',
          currentSubtitle: ''
        };
      }

      console.log('[generateGameWithAI] Title context:', titleContext);

      // Generate title using the game-title action (direct mode, no preview)
      const titleResult = await executeAIAction('game-title', titleContext, difficulty, null, null, null);

      if (titleResult) {
        console.log('[generateGameWithAI] Title generated successfully');
        // Refresh game list to show updated title
        await window.loadAllGames();
        aiToast.show({
          message: 'Game created successfully!',
          type: 'success',
          duration: 3000
        });
      } else {
        console.warn('[generateGameWithAI] Title generation failed, but game was created');
        // Still refresh game list even if title failed
        await window.loadAllGames();
        aiToast.show({
          message: 'Game created! (Title generation failed)',
          type: 'warning',
          duration: 3000
        });
      }
    };

    // Call executeAIAction with our custom onConfirm callback
    const result = await executeAIAction('categories-generate', context, difficulty, retryContext, onRetry, onCancel, onConfirmWithExtraAction);

    // In preview mode, executeAIAction returns true immediately
    // The actual work (including title generation) happens in onConfirmWithExtraAction when user clicks Apply
    // In direct mode (not applicable here), the result indicates success/failure
    if (result) {
      return result;
    } else {
      hideLoadingDialog();
      aiToast.show({
        message: 'Failed to generate game',
        type: 'error',
        duration: 5000
      });
      return false;
    }
  } catch (error) {
    console.error('[GenerateGame] Error:', error);
    hideLoadingDialog();
    aiToast.show({
      message: error.message || 'Failed to generate game',
      type: 'error',
      duration: 5000
    });
    return false;
  }
}

// Expose wizard function
window.runNewGameWizard = runNewGameWizard;

// ==================== LOADING DIALOG ====================
/**
 * Show the loading dialog with optional status update
 * @param {string} status - Status text to display
 */
function showLoadingDialog(title = 'Creating your game...', status = 'Connecting to AI...') {
  const overlay = document.getElementById("loadingDialog");
  const titleEl = document.getElementById("loadingDialogTitle");
  const statusEl = document.getElementById("loadingDialogStatus");

  if (overlay && titleEl && statusEl) {
    titleEl.textContent = title;
    statusEl.textContent = status;
    overlay.style.display = "flex";
  }
}

/**
 * Update the loading dialog status text
 * @param {string} status - New status text
 */
function updateLoadingDialog(status) {
  const statusEl = document.getElementById("loadingDialogStatus");
  if (statusEl) {
    statusEl.textContent = status;
  }
}

/**
 * Hide the loading dialog
 */
function hideLoadingDialog() {
  const overlay = document.getElementById("loadingDialog");
  console.log('[hideLoadingDialog] Called, overlay found:', !!overlay, 'current display:', overlay?.style.display);
  if (overlay) {
    overlay.style.display = "none";
    console.log('[hideLoadingDialog] Set display to none, new value:', overlay.style.display);
  }
}

// Expose globally
window.showLoadingDialog = showLoadingDialog;
window.updateLoadingDialog = updateLoadingDialog;
window.hideLoadingDialog = hideLoadingDialog;

// Helper function to show export instructions dialog
function showExportInstructions(filename, gameId, gameTitle, gameSubtitle) {
  return new Promise((resolve) => {
    // Create dialog overlay dynamically
    const overlay = document.createElement('div');
    overlay.className = 'input-dialog-overlay';
    overlay.style.cssText = 'display: flex;';

    overlay.innerHTML = `
      <div class="dialogCard">
        <div class="dialogHeader">
          <div class="dialogMeta">
            <div class="dialogCategory">Game Exported</div>
          </div>
          <button class="iconBtn" id="exportCloseXBtn" aria-label="Close" type="button">✕</button>
        </div>
        <div class="inputDialogContent">
          <p style="margin: 0 0 16px 0; color: rgba(255,255,255,0.9);">
            <strong>Exported:</strong> <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${filename}</code>
          </p>

          <div style="margin-bottom: 16px;">
            <div style="font-weight: 500; color: rgba(255,255,255,0.7); margin-bottom: 8px;">To add to main menu:</div>
            <ol style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.85); line-height: 1.6;">
              <li style="margin-bottom: 8px;">Move <code>${filename}</code> to:<br><code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">/Users/markdarby/projects/jeop2/games/</code></li>
              <li>Add to <code>games/index.json</code>:
                <pre style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin: 8px 0; font-size: 12px; overflow-x: auto;">{
  "id": "${gameId}",
  "title": "${gameTitle}",
  "subtitle": "${gameSubtitle}",
  "path": "games/${filename}"
}</pre>
              </li>
            </ol>
          </div>

          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5);">
            💡 Tip: Your game is also saved in localStorage and works immediately.
          </p>
        </div>
        <div class="dialogActions">
          <button id="exportCloseBtn" class="btn btnPrimary" type="button">Got it</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('#exportCloseBtn');
    const xBtn = overlay.querySelector('#exportCloseXBtn');

    const close = () => {
      overlay.remove();
      resolve();
    };

    closeBtn.addEventListener('click', close);
    xBtn.addEventListener('click', close);

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', escapeHandler);
        close();
      }
    };
    document.addEventListener('keydown', escapeHandler);
  });
}

// Default creator data structure
function getDefaultCreatorData() {
  return {
    categories: [
      { id: "cat_all", name: "All Games", icon: "🎮" },
      { id: "cat_custom", name: "Custom", icon: "✏️" }
    ],
    games: [],
  };
}

// Load creator data from localStorage
function loadCreatorData() {
  try {
    const raw = localStorage.getItem(CREATOR_DATA_KEY);
    if (!raw) return getDefaultCreatorData();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return getDefaultCreatorData();
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : getDefaultCreatorData().categories,
      games: Array.isArray(parsed.games) ? parsed.games : [],
    };
  } catch {
    return getDefaultCreatorData();
  }
}

// Save creator data to localStorage
function saveCreatorData(data) {
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
}

// Generate unique ID
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Auto-save with debouncing (called from Game Creator)
// Returns a function that can be called to trigger auto-save
function createAutoSaveFunction() {
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
        const creatorData = loadCreatorData();
        // Update in creatorData.games
        const creatorGame = creatorData.games.find(g => g.id === game.id);
        if (creatorGame) {
          creatorGame.game = gameToSave;
          creatorGame.gameData = gameData;
          creatorGame.title = game.title;
          creatorGame.subtitle = game.subtitle;
          creatorGame.categoryId = game.categoryId;
        }
        saveCreatorData(creatorData);

        // Also save to customGames so it appears in main menu
        const custom = loadCustomGames();
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
        saveCustomGames(custom);
      } else if (game.source === "custom") {
        // Update in custom games
        const custom = loadCustomGames();
        const customGame = custom.find(g => g.id === game.id);
        if (customGame) {
          customGame.game = gameToSave;
          customGame.title = game.title;
          customGame.subtitle = game.subtitle;
          if (game.categoryId) {
            customGame.categoryId = game.categoryId;
          }
          saveCustomGames(custom);
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

// Setup Game Creator
async function setupGameCreator() {
  const dialog = document.getElementById("gameCreatorDialog");
  const openBtn = document.getElementById("createGameBtn");
  const categoriesList = document.getElementById("creatorCategoriesList");
  const gamesList = document.getElementById("creatorGamesList");
  const editorContent = document.getElementById("creatorEditorContent");
  const searchInput = document.getElementById("creatorSearchInput");
  const searchCount = document.getElementById("creatorSearchCount");
  const addCategoryBtn = document.getElementById("creatorAddCategoryBtn");
  const addGameBtn = document.getElementById("creatorAddGameBtn");
  const saveBtn = document.getElementById("creatorSaveBtn");
  // Note: export/import buttons are now dynamically created in renderEditor()
  const importInput = document.getElementById("creatorImportInput");

  let creatorData = loadCreatorData();
  let selectedCategoryId = creatorData.categories[0]?.id || null;
  let selectedGameId = null;
  let pendingDeleteGameId = null;
  let dirty = false;
  let allCreatorGames = [];

  // Create auto-save function (debounced, saves to both creatorData and customGames)
  const autoSave = createAutoSaveFunction();

  // Load all games (file-based, custom, and creator games)
  async function loadAllGames() {
    allCreatorGames = [];

    // Add creator games (fully editable) - store direct references
    creatorData.games.forEach(game => {
      // game.game should have proper structure: {title, subtitle, categories: [...]}
      const gameData = game.game || { categories: [] };
      // Extract just the categories part for gameData (used internally by Game Creator)
      const categoriesData = { categories: gameData.categories || [] };

      allCreatorGames.push({
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
      const { games: fileGames } = await getAvailableGames();
      fileGames.forEach(game => {
        if (game.source === "index" && !allCreatorGames.find(g => g.id === game.id)) {
          allCreatorGames.push({
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
    const customGames = loadCustomGames();
    customGames.forEach(game => {
      if (!allCreatorGames.find(g => g.id === game.id)) {
        allCreatorGames.push({
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
    renderGames();
  }

  // Initial load
  await loadAllGames();

  // Render categories list
  function renderCategories() {
    categoriesList.innerHTML = "";
    creatorData.categories.forEach((category, index) => {
      const item = document.createElement("div");
      item.className = `creator-category-item${category.id === selectedCategoryId ? " selected" : ""}`;
      item.innerHTML = `
        <div class="creator-category-header">
          <span class="creator-category-icon">${category.icon || "📁"}</span>
          <span class="creator-category-name">${category.name}</span>
          <div class="creator-category-actions">
            ${index > 0 ? `
              <button class="creator-action-btn creator-up-btn" title="Move up" type="button">↑</button>
              <button class="creator-action-btn creator-down-btn" title="Move down" type="button">↓</button>
              <button class="creator-action-btn creator-rename-btn" title="Rename" type="button">✏️</button>
              <button class="creator-action-btn creator-delete-btn" title="Delete" type="button">🗑</button>
            ` : ""}
          </div>
        </div>
      `;

      // Select category (only when clicking the header, not the actions)
      const header = item.querySelector(".creator-category-header");
      header.addEventListener("click", (e) => {
        if (!e.target.closest(".creator-category-actions")) {
          selectedCategoryId = category.id;
          renderCategories();
          renderGames();
        }
      });

      // Up button
      const upBtn = item.querySelector(".creator-up-btn");
      if (upBtn) {
        upBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (index > 0) {
            [creatorData.categories[index - 1], creatorData.categories[index]] =
            [creatorData.categories[index], creatorData.categories[index - 1]];
            saveCreatorData(creatorData);  // Save immediately
            renderCategories();
          }
        });
      }

      // Down button
      const downBtn = item.querySelector(".creator-down-btn");
      if (downBtn) {
        downBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (index < creatorData.categories.length - 1) {
            [creatorData.categories[index], creatorData.categories[index + 1]] =
            [creatorData.categories[index + 1], creatorData.categories[index]];
            saveCreatorData(creatorData);  // Save immediately
            renderCategories();
          }
        });
      }

      // Rename button - inline edit
      const renameBtn = item.querySelector(".creator-rename-btn");
      if (renameBtn) {
        renameBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          showInlineRename(item, category.name, (newName) => {
            if (newName) {
              category.name = newName.trim();
              saveCreatorData(creatorData);  // Save immediately
              renderCategories();
            }
          });
        });
      }

      // Delete button
      const deleteBtn = item.querySelector(".creator-delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          showDeleteCategoryDialog(category, index);
        });
      }

      categoriesList.appendChild(item);
    });
  }

  // Show inline rename input
  function showInlineRename(item, currentValue, onSave) {
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
  }

  // Show inline add new category input
  function showInlineAddCategory() {
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
          id: `cat_${generateId()}`,
          name: input.value.trim(),
          icon: "📁",
        };

        creatorData.categories.push(newCategory);
        saveCreatorData(creatorData);  // Save immediately
        renderCategories();
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
  }

  // Show delete category confirmation dialog
  let pendingDeleteCategoryIndex = null;
  let pendingDeleteCategoryData = null;

  function showDeleteCategoryDialog(category, index) {
    const dialog = document.getElementById("deleteCategoryDialog");
    const messageEl = document.getElementById("deleteCategoryMessage");
    const confirmBtn = document.getElementById("confirmDeleteCategoryBtn");

    messageEl.textContent = `Delete "${category.name}"? Games in this category will move to "All Games".`;
    pendingDeleteCategoryIndex = index;
    pendingDeleteCategoryData = category;

    dialog.showModal();
  }

  // Setup delete category dialog handlers
  const confirmDeleteCategoryBtn = document.getElementById("confirmDeleteCategoryBtn");
  const cancelDeleteCategoryBtn = document.getElementById("cancelDeleteCategoryBtn");

  confirmDeleteCategoryBtn.addEventListener("click", () => {
    if (pendingDeleteCategoryIndex !== null && pendingDeleteCategoryData) {
      // Move games to "All Games"
      creatorData.games.forEach(game => {
        if (game.categoryId === pendingDeleteCategoryData.id) {
          game.categoryId = creatorData.categories[0].id;
        }
      });
      creatorData.categories.splice(pendingDeleteCategoryIndex, 1);
      if (selectedCategoryId === pendingDeleteCategoryData.id) {
        selectedCategoryId = creatorData.categories[0]?.id || null;
      }
      saveCreatorData(creatorData);  // Save immediately
      renderCategories();
      renderGames();
    }
    pendingDeleteCategoryIndex = null;
    pendingDeleteCategoryData = null;
  });

  cancelDeleteCategoryBtn.addEventListener("click", () => {
    pendingDeleteCategoryIndex = null;
    pendingDeleteCategoryData = null;
  });

  // Render games list
  function renderGames() {
    gamesList.innerHTML = "";
    const searchTerm = searchInput.value.toLowerCase().trim();

    // Filter games by search term only (no category filtering in Game Creator)
    // Category filtering happens on the main menu
    let filteredGames = allCreatorGames.filter(game => {
      // Get live title/subtitle from the game reference (not stale copied values)
      const displayTitle = game.source === "creator" && game.game ? game.game.title : game.title;
      const displaySubtitle = game.source === "creator" && game.game ? game.game.subtitle : game.subtitle;
      const searchMatch = !searchTerm ||
        displayTitle.toLowerCase().includes(searchTerm) ||
        displaySubtitle.toLowerCase().includes(searchTerm);
      return searchMatch;
    });

    searchCount.textContent = filteredGames.length;

    // Add "New Game" card as first item
    const addGameCard = document.createElement("div");
    addGameCard.className = "creator-game-item creator-game-add";
    addGameCard.innerHTML = `
      <div class="creator-game-title">+ New Game</div>
      <div class="creator-game-subtitle">Create with AI wizard</div>
      <div class="creator-game-actions">
        <span class="creator-game-hint">✨ Theme → Difficulty → Generate</span>
      </div>
    `;

    addGameCard.addEventListener("click", async () => {
      const success = await runNewGameWizard();
      if (success) {
        // Wizard completed successfully - game will be auto-selected
        console.log('[NewGameCard] Wizard completed, game created');
      }
    });

    gamesList.appendChild(addGameCard);

    // Divider after add card
    const divider = document.createElement("div");
    divider.className = "creator-game-divider";
    divider.innerHTML = '<div class="divider-line"></div>';
    gamesList.appendChild(divider);

    filteredGames.forEach(game => {
      const item = document.createElement("div");
      item.className = `creator-game-item${game.id === selectedGameId ? " selected" : ""}`;

      // Get live title/subtitle from the game reference (not stale copied values)
      // For creator games, use game.game.title (live reference)
      // For file/custom games, use game.title (these are the actual values)
      const displayTitle = game.source === "creator" && game.game ? game.game.title : game.title;
      const displaySubtitle = game.source === "creator" && game.game ? game.game.subtitle : game.subtitle;

      item.innerHTML = `
        <div class="creator-game-title">${displayTitle}</div>
        <div class="creator-game-subtitle">${displaySubtitle || "No subtitle"}</div>
        <div class="creator-game-actions">
          <button class="creator-action-btn creator-game-edit-btn" title="Edit" type="button">✏️</button>
          <button class="creator-action-btn creator-game-delete-btn" title="Delete" type="button">🗑</button>
        </div>
      `;

      // Select game
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".creator-game-actions")) {
          // Reset category/clue selection when switching games
          selectedGameId = game.id;
          selectedCategoryIndex = null;
          selectedClueIndex = null;
          renderGames();
          renderEditor();
        }
      });

      // Edit button
      const editBtn = item.querySelector(".creator-game-edit-btn");
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        // Reset category/clue selection when switching games
        selectedGameId = game.id;
        selectedCategoryIndex = null;
        selectedClueIndex = null;
        renderGames();
        renderEditor();
      });

      // Delete button (two-step)
      const deleteBtn = item.querySelector(".creator-game-delete-btn");
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (pendingDeleteGameId === game.id) {
          // Confirmed delete
          if (game.source === "creator") {
            creatorData.games = creatorData.games.filter(g => g.id !== game.id);
          } else if (game.source === "custom" || game.source === "file") {
            // Remove from custom games (file games become custom when edited)
            const custom = loadCustomGames();
            saveCustomGames(custom.filter(g => g.id !== game.id));
          }
          // Reload games
          loadAllGames().then(() => {
            if (selectedGameId === game.id) {
              selectedGameId = null;
              renderEditor();
            }
            pendingDeleteGameId = null;
            saveCreatorData(creatorData);  // Save immediately
            renderGames();
          });
        } else {
          // First click - show confirmation
          pendingDeleteGameId = game.id;
          deleteBtn.textContent = "⚠️";
          deleteBtn.title = "Click again to confirm";
          setTimeout(() => {
            if (pendingDeleteGameId === game.id) {
              pendingDeleteGameId = null;
              deleteBtn.textContent = "🗑";
              deleteBtn.title = "Delete";
            }
          }, 3000);
        }
      });

      gamesList.appendChild(item);
    });

    // Show empty state
    if (filteredGames.length === 0) {
      gamesList.innerHTML = `
        <div class="creator-empty-state">
          <div class="creator-empty-icon">🎮</div>
          <div class="creator-empty-text">
            ${searchTerm ? "No games match your search" : "No games yet. Click + to add one!"}
          </div>
        </div>
      `;
    }
  }

  // Render editor panel
  // Track selected category and clue (for 3-column layout)
  let selectedCategoryIndex = null;
  let selectedClueIndex = null;

  async function renderEditor() {
    const gameHeader = document.getElementById("creatorGameHeader");
    const workspaceGrid = document.getElementById("creatorWorkspaceGrid");

    // Always show workspace grid for consistent height
    if (workspaceGrid) workspaceGrid.style.display = "grid";

    if (!selectedGameId) {
      // Select first available game instead of creating blank template
      if (allCreatorGames.length > 0) {
        selectedGameId = allCreatorGames[0].id;
        selectedCategoryIndex = 0;
        selectedClueIndex = null;
        renderGames();
      } else {
        // No games exist - show empty state
        if (gameHeader) {
          gameHeader.innerHTML = `
            <div class="creator-empty-state">
              <div class="creator-empty-icon">🎮</div>
              <div class="creator-empty-title">No games yet</div>
              <div class="creator-empty-text">Click + next to "Games" to create one</div>
            </div>
          `;
        }
        return;
      }
    }

    const game = allCreatorGames.find(g => g.id === selectedGameId);
    if (!game) {
      selectedGameId = null;
      renderEditor();
      return;
    }

    // For file-based games, load the data on demand
    // For creator games, use live reference from game.game (not stale gameData snapshot)
    let gameData;
    if (game.source === "creator" && game.game) {
      // Use live game object with current categories (not stale snapshot)
      gameData = game.game;
    } else {
      // For file/custom games, use gameData (may need loading)
      gameData = game.gameData;
    }

    if (game.source === "file" && !gameData && game.path) {
      try {
        gameData = await loadGameJsonFromPath(game.path);
      } catch (err) {
        if (gameHeader) {
          gameHeader.innerHTML = `
            <div class="creator-empty-state">
              <div class="creator-empty-icon">⚠️</div>
              <div class="creator-empty-title">Error loading game</div>
              <div class="creator-empty-text">${err.message}</div>
            </div>
          `;
        }
        return;
      }
    }

    // Normalize game data to have categories array
    const categories = gameData?.categories || [];

    // Auto-select first category and first question if nothing is selected
    if (selectedCategoryIndex === null && categories.length > 0) {
      selectedCategoryIndex = 0;
    }
    if (selectedClueIndex === null && selectedCategoryIndex !== null) {
      const category = categories[selectedCategoryIndex];
      if (category?.clues && category.clues.length > 0) {
        selectedClueIndex = 0;
      }
    }

    // Calculate game stats
    const categoryCount = categories.length;
    const cluesCount = categories.reduce((sum, cat) => sum + (cat.clues?.length || 0), 0);

    // Build category options for game-level category assignment
    const gameCategoryId = game.categoryId || selectedCategoryId || creatorData.categories[0]?.id || "";
    const categoryOptions = creatorData.categories.map(cat =>
      `<option value="${cat.id}" ${cat.id === gameCategoryId ? 'selected' : ''}>${cat.name}</option>`
    ).join('');

    // Show game header
    if (gameHeader) {
      gameHeader.innerHTML = `
        <div class="game-header">
          <div class="game-header-main">
            <input id="editorTitle" type="text" value="${game.title || ""}" placeholder="Untitled Game" autocomplete="off" />
            <input id="editorSubtitle" type="text" value="${game.subtitle || ""}" placeholder="Add a description..." autocomplete="off" />
            <div class="game-category-assign">
              <label class="game-category-label">Folder:</label>
              <select id="editorGameCategory" class="game-category-select" title="Assign this game to a folder">
                ${categoryOptions}
              </select>
            </div>
            <div class="game-stats">${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'} • ${cluesCount} ${cluesCount === 1 ? 'clue' : 'clues'}</div>
          </div>
          <div class="game-metadata">
            <!-- AI Pill - single unit containing all AI controls -->
            <div class="ai-pill">
              <div class="ai-action-menu" data-menu-id="ai-menu-game">
                <button class="ai-pill-trigger" data-ai-trigger="dropdown" aria-label="AI controls for this game" title="AI: Generate game content">
                  <span class="ai-pill-icon">✨</span>
                  <span class="ai-pill-label">AI</span>
                  <span class="ai-pill-difficulty" id="aiPillDifficulty">Normal</span>
                </button>
                <div class="ai-action-dropdown" id="ai-menu-game">
                  <div class="ai-action-dropdown-header">AI for this game</div>
                  <button class="ai-action-item" data-ai-action="game-title" title="Smart title generation: analyzes your game content or asks for a theme">
                    <span class="ai-action-icon">📝</span>
                    Generate title & subtitle
                  </button>
                  <button class="ai-action-item" data-ai-action="categories-generate" title="Generate complete game from a theme - all categories and questions">
                    <span class="ai-action-icon">🎯</span>
                    Generate full game (categories & questions)
                  </button>
                  <div class="ai-action-divider"></div>
                  <div class="ai-action-difficulty-section">
                    <div class="ai-action-section-title">Difficulty</div>
                    <div class="ai-difficulty-options" id="aiDifficultyOptions">
                      <label class="ai-difficulty-option">
                        <input type="radio" name="aiDifficulty" value="easy">
                        <span class="ai-difficulty-label-text">Easy</span>
                      </label>
                      <label class="ai-difficulty-option">
                        <input type="radio" name="aiDifficulty" value="normal" checked>
                        <span class="ai-difficulty-label-text">Normal</span>
                      </label>
                      <label class="ai-difficulty-option">
                        <input type="radio" name="aiDifficulty" value="hard">
                        <span class="ai-difficulty-label-text">Hard</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Separator -->
            <div class="header-zone-divider"></div>

            <!-- System Zone (neutral, de-emphasized) -->
            <div class="header-zone header-zone-system">
              <div class="action-menu">
                <button class="action-menu-trigger" id="creatorMenuTrigger" type="button" title="File options">💾</button>
                <div class="action-menu-dropdown" id="creatorMenuDropdown">
                  <button class="action-menu-item" id="creatorImportBtn" type="button">
                    <span class="action-menu-icon">📥</span>
                    <span>Import JSON</span>
                  </button>
                  <button class="action-menu-item" id="creatorExportBtn" type="button">
                    <span class="action-menu-icon">📤</span>
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Show workspace grid
    if (workspaceGrid) workspaceGrid.style.display = "grid";

    // Store game data for updates
    gameHeader._gameData = gameData;
    gameHeader._game = game;

    // Render categories (left column)
    renderCategoriesColumn(categories);

    // Render clues (middle column)
    renderCluesColumn(categories);

    // Render editor (right column)
    renderEditorPanel(categories);

    // Setup menu listeners for the newly rendered menu
    setupMenuListeners();

    // Setup header event listeners
    setupHeaderEventListeners(gameHeader, game, gameData);

    // Initialize AI actions with Game Creator context
    if (typeof initAIActions === 'function') {
      initAIActions({
        getGameHeader: () => gameHeader,
        renderEditor: renderEditor
      });
    }

    // Setup AI button handlers
    if (typeof setupAIButtonHandlers === 'function') {
      setupAIButtonHandlers();
    }
  }

  // Render categories in left column
  function renderCategoriesColumn(categories) {
    const categoriesList = document.getElementById("workspaceCategoriesList");
    const categoriesCountValueEl = document.getElementById("categoriesCountValue");
    if (!categoriesList) return;

    // Update the categories count display
    if (categoriesCountValueEl) {
      categoriesCountValueEl.textContent = categories.length.toString();
    }

    if (categories.length === 0) {
      categoriesList.innerHTML = `
        <div class="editor-empty-state">
          <div class="editor-empty-text">No categories yet</div>
        </div>
      `;
      return;
    }

    categoriesList.innerHTML = categories.map((cat, index) => {
      const clueCount = (cat.clues || []).length;
      const isComplete = clueCount >= 5;
      const isSelected = selectedCategoryIndex === index;

      return `
        <div class="category-card-item ${isSelected ? 'selected' : ''}" data-category-index="${index}">
          <span class="category-card-number">${index + 1}</span>
          <div class="category-card-info">
            <div class="category-card-title">${cat.title || '(Untitled)'}</div>
            <div class="category-card-count">${clueCount} ${clueCount === 1 ? 'clue' : 'clues'}${isComplete ? ' • ✔' : ''}</div>
          </div>
          <div class="category-card-actions"></div>
        </div>
      `;
    }).join('');

    // Add click listeners
    categoriesList.querySelectorAll(".category-card-item").forEach(item => {
      item.addEventListener("click", (e) => {
        // Don't select if clicking on AI button
        if (e.target.closest('.ai-btn')) return;

        const catIndex = parseInt(item.dataset.categoryIndex);
        selectedCategoryIndex = catIndex;
        selectedClueIndex = null; // Reset clue selection when changing category
        renderEditor();
      });
    });

    // Inject AI buttons for each category
    if (typeof injectCategoryAIButtons === 'function') {
      categoriesList.querySelectorAll(".category-card-item").forEach((item, index) => {
        injectCategoryAIButtons(item, index);
      });
    }
  }

  // Render clues in middle column
  function renderCluesColumn(categories) {
    const cluesList = document.getElementById("workspaceCluesList");
    const metaEl = document.getElementById("cluesColumnMeta");
    const countValueEl = document.getElementById("questionsCountValue");
    if (!cluesList) return;

    // Update the questions count display to show minimum across all categories
    if (countValueEl && categories.length > 0) {
      const minCount = Math.min(...categories.map(cat => cat.clues?.length || 0));
      countValueEl.textContent = minCount.toString();
    }

    if (selectedCategoryIndex === null || !categories[selectedCategoryIndex]) {
      if (metaEl) metaEl.textContent = "";
      cluesList.innerHTML = `
        <div class="editor-empty-state">
          <div class="editor-empty-icon">📂</div>
          <div class="editor-empty-text">Select a category</div>
        </div>
      `;
      return;
    }

    const category = categories[selectedCategoryIndex];
    const clues = category.clues || [];

    if (metaEl) metaEl.textContent = `${clues.length} questions`;

    if (clues.length === 0) {
      cluesList.innerHTML = `
        <div class="editor-empty-state">
          <div class="editor-empty-text">No questions yet</div>
        </div>
      `;
      return;
    }

    cluesList.innerHTML = clues.map((clue, index) => {
      const isSelected = selectedClueIndex === index;
      const isComplete = clue.clue && clue.response;

      return `
        <div class="clue-card-item ${isSelected ? 'selected' : ''}" data-clue-index="${index}">
          <span class="clue-value-badge">$${clue.value || 200}</span>
          <span class="clue-card-preview${!clue.clue ? ' empty' : ''}">${clue.clue || '(No question yet)'}</span>
          ${isComplete ? '<span class="clue-card-complete">✔</span>' : ''}
          <div class="clue-card-actions"></div>
        </div>
      `;
    }).join('');

    // Add click listeners
    cluesList.querySelectorAll(".clue-card-item").forEach(item => {
      item.addEventListener("click", (e) => {
        // Don't select if clicking on AI button
        if (e.target.closest('.ai-btn')) return;

        const clueIndex = parseInt(item.dataset.clueIndex);
        selectedClueIndex = clueIndex;
        renderEditor();
      });
    });

    // Inject AI buttons for each question
    if (typeof injectQuestionAIButtons === 'function') {
      cluesList.querySelectorAll(".clue-card-item").forEach((item) => {
        injectQuestionAIButtons(item);
      });
    }
  }

  // Render editor panel in right column
  function renderEditorPanel(categories) {
    const editorPanel = document.getElementById("workspaceEditorPanel");
    if (!editorPanel) return;

    if (selectedCategoryIndex === null || selectedClueIndex === null) {
      editorPanel.innerHTML = `
        <div class="editor-empty-state">
          <div class="editor-empty-icon">✏️</div>
          <div class="editor-empty-text">Select a clue to edit</div>
        </div>
      `;
      return;
    }

    const category = categories[selectedCategoryIndex];
    const clue = category.clues?.[selectedClueIndex];

    if (!clue) {
      editorPanel.innerHTML = `
        <div class="editor-empty-state">
          <div class="editor-empty-text">Clue not found</div>
        </div>
      `;
      return;
    }

    editorPanel.innerHTML = `
      <form class="editor-form" id="clueEditorForm">
        <div class="editor-form-row">
          <label>Value</label>
          <input type="number" id="clueValueInput" value="${clue.value || 200}" placeholder="200" />
        </div>

        <div class="editor-form-row">
          <div class="editor-form-header">
            <label>Question</label>
            <div class="editor-field-actions" data-field="question"></div>
          </div>
          <textarea id="clueQuestionInput" placeholder="Enter question..." rows="3">${clue.clue || ''}</textarea>
        </div>

        <div class="editor-form-row">
          <div class="editor-form-header">
            <label>Answer</label>
            <div class="editor-field-actions" data-field="answer"></div>
          </div>
          <textarea id="clueAnswerInput" placeholder="Enter answer..." rows="2">${clue.response || ''}</textarea>
        </div>
      </form>

      <div class="editor-footer">
        <button type="button" class="editor-footer-btn danger" id="deleteClueBtn">
          <span class="btn-icon">🗑️</span>
          Delete
        </button>
      </div>
    `;

    // Setup form listeners
    setupClueEditorListeners(editorPanel, categories, category, clue);

    // Inject AI buttons in editor panel
    if (typeof injectEditorAIButtons === 'function') {
      injectEditorAIButtons();
    }
  }

  // Setup clue editor event listeners
  function setupClueEditorListeners(editorPanel, categories, category, clue) {
    const gameHeader = document.getElementById("creatorGameHeader");
    const game = gameHeader._game;
    const gameData = gameHeader._gameData;

    // Value input
    const valueInput = editorPanel.querySelector("#clueValueInput");
    valueInput?.addEventListener("input", () => {
      clue.value = parseInt(valueInput.value) || 200;
      game.gameData = gameData;
      autoSave();  // Auto-save on change
      renderCluesColumn(categories);
    });

    // Question input
    const questionInput = editorPanel.querySelector("#clueQuestionInput");
    questionInput?.addEventListener("input", () => {
      clue.clue = questionInput.value;
      game.gameData = gameData;
      autoSave();  // Auto-save on change
      renderCluesColumn(categories);
    });

    // Answer input
    const answerInput = editorPanel.querySelector("#clueAnswerInput");
    answerInput?.addEventListener("input", () => {
      clue.response = answerInput.value;
      game.gameData = gameData;
      autoSave();  // Auto-save on change
      renderCluesColumn(categories);
    });

    // Delete clue button
    const deleteBtn = editorPanel.querySelector("#deleteClueBtn");
    deleteBtn?.addEventListener("click", () => {
      if (confirm("Delete this question?")) {
        category.clues.splice(selectedClueIndex, 1);
        game.gameData = gameData;
        autoSave();  // Auto-save on delete
        selectedClueIndex = null;
        renderEditor();
      }
    });
  }

  // Setup header event listeners
  function setupHeaderEventListeners(gameHeader, game, gameData) {
    // Title input
    const titleInput = gameHeader.querySelector("#editorTitle");
    titleInput?.addEventListener("input", () => {
      game.title = titleInput.value;
      autoSave();  // Auto-save on change
      renderGames();
    });

    // Subtitle input
    const subtitleInput = gameHeader.querySelector("#editorSubtitle");
    subtitleInput?.addEventListener("input", () => {
      game.subtitle = subtitleInput.value;
      autoSave();  // Auto-save on change
      renderGames();
    });

    // Game category dropdown (folder assignment)
    const categorySelect = gameHeader.querySelector("#editorGameCategory");
    categorySelect?.addEventListener("change", (e) => {
      const newCategoryId = e.target.value;
      game.categoryId = newCategoryId;
      // Update selected category in sidebar
      selectedCategoryId = newCategoryId;
      autoSave();  // Auto-save on change
      renderCategories();
      renderGames();
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
  }

  // Setup event listeners for the workspace (add category, etc)
  function setupWorkspaceListeners() {
    const workspaceGrid = document.getElementById("creatorWorkspaceGrid");
    if (!workspaceGrid) return;

    // Add category button
    const addCategoryBtn = document.getElementById("workspaceAddCategoryBtn");
    addCategoryBtn?.addEventListener("click", () => {
      const gameHeader = document.getElementById("creatorGameHeader");
      const game = gameHeader._game;
      const gameData = gameHeader._gameData;

      if (!gameData.categories) gameData.categories = [];
      gameData.categories.push({
        title: "",
        clues: [
          { value: 200, clue: "", response: "" },
          { value: 400, clue: "", response: "" },
          { value: 600, clue: "", response: "" },
          { value: 800, clue: "", response: "" },
          { value: 1000, clue: "", response: "" }
        ]
      });
      game.gameData = gameData;
      autoSave();  // Auto-save
      selectedCategoryIndex = gameData.categories.length - 1;
      selectedClueIndex = null;
      renderEditor();
    });

    // Add question button (single question to selected category)
    const addQuestionBtn = document.getElementById("workspaceAddQuestionBtn");
    addQuestionBtn?.addEventListener("click", () => {
      const gameHeader = document.getElementById("creatorGameHeader");
      const game = gameHeader._game;
      const gameData = gameHeader._gameData;

      if (selectedCategoryIndex === null) return;

      const category = gameData.categories[selectedCategoryIndex];
      if (!category.clues) category.clues = [];

      const existingClues = category.clues;
      const maxValue = existingClues.length > 0 ? Math.max(...existingClues.map(c => c.value || 0)) : 0;

      category.clues.push({
        value: maxValue + 200,
        clue: "",
        response: ""
      });

      game.gameData = gameData;
      autoSave();  // Auto-save
      selectedClueIndex = category.clues.length - 1; // Select the new question
      renderEditor();
    });

    // Questions count control (+/-) - affects all categories uniformly
    const decreaseBtn = document.getElementById("questionsDecreaseBtn");
    const increaseBtn = document.getElementById("questionsIncreaseBtn");
    const countValue = document.getElementById("questionsCountValue");

    const updateQuestionsCount = (newCount) => {
      const gameHeader = document.getElementById("creatorGameHeader");
      const game = gameHeader._game;
      const gameData = gameHeader._gameData;

      if (!gameData.categories || gameData.categories.length === 0) return;

      // Get current minimum questions per category
      const currentMinCount = Math.min(...gameData.categories.map(cat => cat.clues?.length || 0));

      if (newCount < currentMinCount) {
        // Warn user that questions will be removed
        const categoriesLosingQuestions = gameData.categories.filter(cat =>
          (cat.clues?.length || 0) > newCount
        );

        let message = `Reducing to ${newCount} question${newCount === 1 ? '' : 's'} per category will remove questions from:\n\n`;
        categoriesLosingQuestions.forEach(cat => {
          const currentCount = cat.clues?.length || 0;
          const toRemove = currentCount - newCount;
          message += `• ${cat.title || '(Untitled)'}: ${toRemove} question${toRemove === 1 ? '' : 's'}\n`;
        });
        message += `\nContinue?`;

        if (!confirm(message)) return;
      }

      // Apply new count to all categories
      gameData.categories.forEach(category => {
        if (!category.clues) category.clues = [];

        if (newCount > category.clues.length) {
          // Add questions
          const existingCount = category.clues.length;
          const maxValue = existingCount > 0 ? Math.max(...category.clues.map(c => c.value || 0)) : 0;

          for (let i = existingCount; i < newCount; i++) {
            category.clues.push({
              value: maxValue + (i + 1) * 200,
              clue: "",
              response: ""
            });
          }
        } else if (newCount < category.clues.length) {
          // Remove questions from the end
          category.clues = category.clues.slice(0, newCount);
        }
      });

      game.gameData = gameData;
      autoSave();  // Auto-save

      // Reset selection if the selected question was removed
      if (selectedCategoryIndex !== null && selectedClueIndex !== null) {
        const category = gameData.categories[selectedCategoryIndex];
        if (category.clues.length <= selectedClueIndex) {
          selectedClueIndex = category.clues.length > 0 ? category.clues.length - 1 : null;
        }
      }

      renderEditor();
    };

    decreaseBtn?.addEventListener("click", () => {
      const countValue = document.getElementById("questionsCountValue");
      const currentCount = parseInt(countValue.textContent) || 5;
      if (currentCount > 1) {
        updateQuestionsCount(currentCount - 1);
      }
    });

    increaseBtn?.addEventListener("click", () => {
      const countValue = document.getElementById("questionsCountValue");
      const currentCount = parseInt(countValue.textContent) || 5;
      if (currentCount < 10) {
        updateQuestionsCount(currentCount + 1);
      }
    });

    // Categories count control (+/-)
    const categoriesDecreaseBtn = document.getElementById("categoriesDecreaseBtn");
    const categoriesIncreaseBtn = document.getElementById("categoriesIncreaseBtn");
    const categoriesCountValue = document.getElementById("categoriesCountValue");

    const updateCategoriesCount = (newCount) => {
      const gameHeader = document.getElementById("creatorGameHeader");
      const game = gameHeader._game;
      const gameData = gameHeader._gameData;

      if (!gameData.categories) gameData.categories = [];
      const currentCount = gameData.categories.length;

      // Warn if going above 6
      if (newCount > 6) {
        const message = `Jeopardy games typically have 6 categories. You're about to create ${newCount} categories. Continue?`;
        if (!confirm(message)) return;
      }

      // Warn if reducing would remove categories
      if (newCount < currentCount) {
        const toRemove = currentCount - newCount;
        const categoriesBeingRemoved = gameData.categories.slice(newCount);

        let message = `Reducing to ${newCount} categor${newCount === 1 ? 'y' : 'ies'} will remove:\n\n`;
        categoriesBeingRemoved.forEach((cat, i) => {
          const cluesCount = cat.clues?.length || 0;
          message += `• ${cat.title || '(Untitled)'}: ${cluesCount} question${cluesCount === 1 ? '' : 's'}\n`;
        });
        message += `\nContinue?`;

        if (!confirm(message)) return;
      }

      if (newCount > currentCount) {
        // Add categories
        for (let i = currentCount; i < newCount; i++) {
          gameData.categories.push({
            title: "",
            clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]
          });
        }
      } else if (newCount < currentCount) {
        // Remove categories from the end
        gameData.categories = gameData.categories.slice(0, newCount);
      }

      // Reset selection if needed
      if (selectedCategoryIndex !== null && selectedCategoryIndex >= newCount) {
        selectedCategoryIndex = newCount > 0 ? newCount - 1 : null;
        selectedClueIndex = null;
      }

      game.gameData = gameData;
      autoSave();  // Auto-save
      renderEditor();
    };

    categoriesDecreaseBtn?.addEventListener("click", () => {
      const countValue = document.getElementById("categoriesCountValue");
      const currentCount = parseInt(countValue.textContent) || 6;
      if (currentCount > 1) {
        updateCategoriesCount(currentCount - 1);
      }
    });

    categoriesIncreaseBtn?.addEventListener("click", () => {
      const countValue = document.getElementById("categoriesCountValue");
      const currentCount = parseInt(countValue.textContent) || 6;
      if (currentCount < 12) {
        updateCategoriesCount(currentCount + 1);
      }
    });
  }

  // Legacy setupEditorEventListeners (no longer needed)
  function setupEditorEventListeners(editorContent) {
    // This function is deprecated - listeners are now set up inline
  }

  // Action menu toggle variables
  let menuTrigger = null;
  let menuDropdown = null;

  // Setup menu listeners - hoisted function declaration
  function setupMenuListeners() {
    menuTrigger = document.getElementById("creatorMenuTrigger");
    menuDropdown = document.getElementById("creatorMenuDropdown");

    if (!menuTrigger || !menuDropdown) return;

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
        importInput.click();
        menuDropdown.classList.remove("show");
      });
    }
  }

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (menuTrigger && menuDropdown &&
        !menuTrigger.contains(e.target) && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.remove("show");
    }
  });

  // Setup workspace listeners
  setupWorkspaceListeners();

  // Note: Save button removed - auto-save is now enabled

  // Import file handler (shared - called from dynamically created import button)
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

      saveCreatorData(creatorData);  // Save immediately

      // Reload all games to include imported ones
      loadAllGames().then(() => {
        renderCategories();
        renderGames();
        alert("Games imported successfully!");
      });
    } catch (err) {
      alert(`Error importing games: ${err.message}`);
    } finally {
      importInput.value = "";
    }
  });

  // Open dialog
  openBtn.addEventListener("click", () => {
    // Reload games when opening the dialog
    loadAllGames().then(() => {
      renderCategories();
      renderGames();

      // Default to first game if nothing selected (not blank template)
      if (!selectedGameId && allCreatorGames.length > 0) {
        selectedGameId = allCreatorGames[0].id;
        renderGames();
        renderEditor();
      } else if (!selectedGameId && allCreatorGames.length === 0) {
        // Only create blank template if no games exist at all
        const defaultCategoryId = creatorData.categories[0]?.id || "custom";
        const blankGameData = {
          categories: [
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]}
          ]
        };

        const blankGame = {
          id: `game_${generateId()}`,
          title: "",
          subtitle: "",
          categoryId: defaultCategoryId,
          gameData: blankGameData, // Store as gameData for renderEditor
          editable: true,
          source: "creator",
          _isNew: true
        };

        allCreatorGames.push(blankGame);
        selectedGameId = blankGame.id;
        selectedCategoryIndex = 0;
        selectedClueIndex = null;
        renderGames();
        renderEditor();
      } else {
        renderEditor();
      }

      dialog.showModal();
    });
  });

  // Refresh main menu when dialog closes (if changes were saved)
  dialog.addEventListener("close", () => {
    if (dirty) {
      // Reload to show the changes - user can re-open to continue editing
      creatorData = loadCreatorData();
      dirty = false;

      // Trigger a menu refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('jeop2:gamesUpdated'));
    }
    // Reload games when dialog reopens
    loadAllGames().then(() => {
      renderCategories();
      renderGames();

      // Default to first game if nothing selected
      if (!selectedGameId && allCreatorGames.length > 0) {
        selectedGameId = allCreatorGames[0].id;
        renderGames();
      } else if (!selectedGameId && allCreatorGames.length === 0) {
        // Only create blank template if no games exist
        const defaultCategoryId = creatorData.categories[0]?.id || "custom";
        const blankGameData = {
          categories: [
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]},
            { title: "", clues: [
              { value: 200, clue: "", response: "" },
              { value: 400, clue: "", response: "" },
              { value: 600, clue: "", response: "" },
              { value: 800, clue: "", response: "" },
              { value: 1000, clue: "", response: "" }
            ]}
          ]
        };

        const blankGame = {
          id: `game_${generateId()}`,
          title: "",
          subtitle: "",
          categoryId: defaultCategoryId,
          gameData: blankGameData,
          editable: true,
          source: "creator",
          _isNew: true
        };

        allCreatorGames.push(blankGame);
        selectedGameId = blankGame.id;
        selectedCategoryIndex = 0;
        selectedClueIndex = null;
        renderGames();
      }

      renderEditor();
    });
  });

  // Create new blank game
  async function createNewGame() {
    // Find or create "Custom" category
    let customCategory = creatorData.categories.find(c => c.id === "custom");
    if (!customCategory) {
      customCategory = {
        id: "custom",
        name: "Custom",
        icon: "📁"
      };
      creatorData.categories.push(customCategory);
    }

    // Create new game with default structure
    const newGame = {
      id: `game_${generateId()}`,
      title: "New Game",
      subtitle: "",
      categoryId: customCategory.id, // Assign to Custom category
      game: {
        title: "New Game",
        subtitle: "",
        categories: [
          { title: "", clues: [
            { value: 200, clue: "", response: "" },
            { value: 400, clue: "", response: "" },
            { value: 600, clue: "", response: "" },
            { value: 800, clue: "", response: "" },
            { value: 1000, clue: "", response: "" }
          ]},
          { title: "", clues: [
            { value: 200, clue: "", response: "" },
            { value: 400, clue: "", response: "" },
            { value: 600, clue: "", response: "" },
            { value: 800, clue: "", response: "" },
            { value: 1000, clue: "", response: "" }
          ]},
          { title: "", clues: [
            { value: 200, clue: "", response: "" },
            { value: 400, clue: "", response: "" },
            { value: 600, clue: "", response: "" },
            { value: 800, clue: "", response: "" },
            { value: 1000, clue: "", response: "" }
          ]},
          { title: "", clues: [
            { value: 200, clue: "", response: "" },
            { value: 400, clue: "", response: "" },
            { value: 600, clue: "", response: "" },
            { value: 800, clue: "", response: "" },
            { value: 1000, clue: "", response: "" }
          ]},
          { title: "", clues: [
            { value: 200, clue: "", response: "" },
            { value: 400, clue: "", response: "" },
            { value: 600, clue: "", response: "" },
            { value: 800, clue: "", response: "" },
            { value: 1000, clue: "", response: "" }
          ]},
          { title: "", clues: [
            { value: 200, clue: "", response: "" },
            { value: 400, clue: "", response: "" },
            { value: 600, clue: "", response: "" },
            { value: 800, clue: "", response: "" },
            { value: 1000, clue: "", response: "" }
          ]}
        ]
      }
    };

    // Add to creator data
    creatorData.games.push(newGame);
    saveCreatorData(creatorData);  // Save immediately

    // Reload allCreatorGames to include the new game
    await loadAllGames();

    // Select the Custom category and the new game, reset category/clue selection
    selectedCategoryId = customCategory.id;
    selectedGameId = newGame.id;
    selectedCategoryIndex = null;
    selectedClueIndex = null;

    // Re-render
    renderCategories();
    renderGames();
    renderEditor();
  }

  // Expose createNewGame globally for the wizard to use
  window.createNewGame = createNewGame;
  window.loadAllGames = loadAllGames;
  window.renderEditor = renderEditor;
  window.autoSave = autoSave;

  // Add Game button in sidebar - creates a new blank game (if button exists)
  addGameBtn?.addEventListener("click", createNewGame);

  // Initial render
  renderCategories();
  renderGames();
  renderEditor();
}

main();
