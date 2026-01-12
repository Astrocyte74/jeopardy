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
    // Add title attribute for hover tooltip showing contentTopic if different from title
    const headerAttrs = {
      class: "cell cellHeader",
      role: "columnheader"
    };
    if (category.contentTopic && category.contentTopic !== category.title) {
      headerAttrs.title = category.contentTopic;
    }
    board.appendChild(el("div", headerAttrs, category.title));
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
  const resumeBtn = document.getElementById("resumeGameBtn");
  const themeToggle = document.getElementById("themeToggle");
  const themeContent = document.getElementById("themeContent");
  const advancedToggle = document.getElementById("advancedToggle");
  const advancedContent = document.getElementById("advancedContent");
  const menuGameTitle = document.getElementById("menuGameTitle");
  const menuGameSubtitle = document.getElementById("menuGameSubtitle");
  const menuGameTitleDisplay = document.getElementById("menuGameTitleDisplay");
  const menuGameSubtitleDisplay = document.getElementById("menuGameSubtitleDisplay");
  const menuGameTitleEditBtn = document.getElementById("menuGameTitleEditBtn");
  const menuGameSubtitleEditBtn = document.getElementById("menuGameSubtitleEditBtn");
  const categorySelect = document.getElementById("menuCategorySelect");
  const gameSearch = document.getElementById("menuGameSearch");
  const searchCount = document.getElementById("menuGameSearchCount");
  const menuNewGameBtn = document.getElementById("menuNewGameBtn");
  const viewToggleBtn = document.getElementById("menuViewToggle");
  const startStatus = document.getElementById("startStatus");
  const teamsStatus = document.getElementById("teamsStatus");
  const teamsCount = document.getElementById("teamsCount");

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

  menuSelectedGame = allGames[0] || null;

  // Initialize game settings with the first game's data (if any games exist)
  if (menuSelectedGame) {
    menuGameTitle.value = menuSelectedGame.title || "";
    menuGameSubtitle.value = menuSelectedGame.subtitle || "";
  } else {
    // No games exist - clear the form
    menuGameTitle.value = "";
    menuGameSubtitle.value = "";
  }

  // Populate category selector from Game Creator data
  creatorData.categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
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
      option.className = `game-option${menuSelectedGame && game.id === menuSelectedGame.id ? " selected" : ""}`;

      // Choose icon based on source - more descriptive icons
      const icon = game.source === "creator" ? "✨" :  // AI-generated
                   game.source === "custom" ? "📁" :   // Custom uploaded
                   game.source === "embedded" ? "🎮" :  // Built-in
                   "🧠";                                 // Trivia/default

      option.innerHTML = `
        <span class="game-card-icon">${icon}</span>
        <div class="game-option-info">
          <div class="game-card-title">${game.title}</div>
          <div class="game-card-subtitle">${game.subtitle || game.source}</div>
        </div>
      `;
      option.addEventListener("click", () => {
        menuSelectedGame = game;
        // Auto-populate game settings from the selected game
        menuGameTitle.value = game.title || "";
        menuGameSubtitle.value = game.subtitle || "";

        // Update display fields
        menuGameTitleDisplay.textContent = game.title || "Default";
        menuGameTitleDisplay.classList.remove("field-value-empty");

        if (game.subtitle) {
          menuGameSubtitleDisplay.textContent = game.subtitle;
          menuGameSubtitleDisplay.classList.remove("field-value-empty");
        } else {
          menuGameSubtitleDisplay.textContent = "No custom subtitle";
          menuGameSubtitleDisplay.classList.add("field-value-empty");
        }

        menuGameSettings.title = "";
        menuGameSettings.subtitle = "";
        renderGameList();
        updateStartButton();
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

      // Live preview on hover
      option.addEventListener("mouseenter", () => {
        if (themeKey !== menuSelectedTheme) {
          applyTheme(themeKey);
        }
      });

      // Restore selected theme on mouse leave
      option.addEventListener("mouseleave", () => {
        if (themeKey !== menuSelectedTheme) {
          applyTheme(menuSelectedTheme);
        }
      });

      option.addEventListener("click", () => {
        menuSelectedTheme = themeKey;
        applyTheme(themeKey);
        renderThemeGrid();
        renderTeamInputs(); // Refresh team colors
      });
      themeGrid.appendChild(option);
    }
  }

  // Render team inputs
  function renderTeamInputs() {
    teamsSetup.innerHTML = "";

    // Get team colors from current theme
    const currentTheme = themes[menuSelectedTheme] || themes.classic;
    const teamColors = [
      currentTheme.primary,
      currentTheme.secondary,
      currentTheme.accent,
      currentTheme.gold,
      currentTheme.success,
      currentTheme.danger
    ];

    menuTeams.forEach((team, index) => {
      const row = document.createElement("div");
      row.className = "team-input-row";

      // Auto-assign color if not already set
      if (!team.color) {
        team.color = teamColors[index % teamColors.length];
      }

      // Update color when theme changes
      const colorIndex = index % teamColors.length;
      const currentColor = teamColors[colorIndex];
      team.color = currentColor;

      row.innerHTML = `
        <span class="team-color-chip" style="background: ${currentColor}"></span>
        <span class="team-number">${index + 1}</span>
        <div class="team-input-wrapper">
          <input type="text" value="${team.name}" placeholder="Team name" data-index="${index}">
          <div class="team-ai-buttons">
            <button class="team-ai-btn" data-action="random" data-index="${index}" title="Generate random name">🎲</button>
            <button class="team-ai-btn sparkle" data-action="enhance" data-index="${index}" title="Enhance this name">✨</button>
          </div>
        </div>
        <button class="remove-team-btn" data-index="${index}" ${menuTeams.length <= 1 ? 'disabled' : ''}>✕</button>
      `;

      // Update team name on input
      const input = row.querySelector("input");
      input.addEventListener("input", () => {
        menuTeams[index].name = input.value || `Team ${index + 1}`;
      });

      // AI buttons
      row.querySelectorAll(".team-ai-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const action = btn.dataset.action;
          const teamIndex = parseInt(btn.dataset.index);
          const currentName = menuTeams[teamIndex].name;
          const inputField = row.querySelector("input");

          // Get other team names to avoid duplicates
          const otherTeamNames = menuTeams
            .map((t, i) => i === teamIndex ? null : t.name)
            .filter(n => n && n.trim());

          // Get game theme/topic if a game is selected
          const gameTopic = menuSelectedGame?.title || menuSelectedGame?.subtitle || null;

          // Show loading state
          btn.disabled = true;
          btn.style.opacity = "0.5";

          try {
            let promptType, context;

            if (action === "random") {
              promptType = 'team-name-random';
              context = {
                count: 1,
                existingNames: otherTeamNames,
                gameTopic: gameTopic
              };
            } else {
              promptType = 'team-name-enhance';
              context = {
                currentName: currentName,
                existingNames: otherTeamNames,
                gameTopic: gameTopic
              };
            }

            const rawResult = await window.generateAI(promptType, context, 'normal');

            // Parse the result - strip markdown and extract the name
            const cleaned = rawResult?.trim() || '';
            let result = cleaned;

            // Try to extract from JSON if present
            if (cleaned.includes('```')) {
              const stripped = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '').trim();
              try {
                const parsed = JSON.parse(stripped);
                if (action === "random") {
                  result = parsed.names && parsed.names[0] ? parsed.names[0] : result;
                } else {
                  result = parsed.name || result;
                }
              } catch (e) {
                result = stripped;
              }
            }

            // Clean up any quotes or extra text
            result = result.replace(/^["']|["']$/g, '').trim();

            if (result && result.length > 0) {
              menuTeams[teamIndex].name = result;
              inputField.value = result;
            }
          } catch (error) {
            console.error("AI team name error:", error);
            alert("Could not generate team name. Please try again.");
          } finally {
            // Restore button state
            btn.disabled = false;
            btn.style.opacity = "1";
          }
        });
      });

      // Remove team button
      const removeBtn = row.querySelector(".remove-team-btn");
      removeBtn.addEventListener("click", () => {
        if (menuTeams.length > 1) {
          menuTeams.splice(index, 1);
          renderTeamInputs();
          updateStartButton();
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
    updateStartButton();
  });

  // AI Generate All Teams button
  const teamsGenerateAllBtn = document.getElementById("teamsGenerateAllBtn");
  if (teamsGenerateAllBtn) {
    teamsGenerateAllBtn.addEventListener("click", async () => {
      // Get other team names to avoid duplicates (empty since we're generating all)
      const otherTeamNames = [];
      // Get game theme/topic if a game is selected
      const gameTopic = menuSelectedGame?.title || menuSelectedGame?.subtitle || null;

      // Show loading state
      teamsGenerateAllBtn.disabled = true;
      teamsGenerateAllBtn.style.opacity = "0.5";

      try {
        // Generate names for all teams
        for (let i = 0; i < menuTeams.length; i++) {
          const rawResult = await window.generateAI('team-name-random', {
            count: 1,
            existingNames: otherTeamNames,
            gameTopic: gameTopic
          }, 'normal');

          // Parse the result
          const cleaned = rawResult?.trim() || '';
          let result = cleaned;

          if (cleaned.includes('```')) {
            const stripped = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '').trim();
            try {
              const parsed = JSON.parse(stripped);
              result = parsed.names && parsed.names[0] ? parsed.names[0] : result;
            } catch (e) {
              result = stripped;
            }
          }

          result = result.replace(/^["']|["']$/g, '').trim();

          if (result && result.length > 0) {
            menuTeams[i].name = result;
            otherTeamNames.push(result); // Add to list to avoid duplicates
          }
        }

        // Re-render with new names
        renderTeamInputs();
      } catch (error) {
        console.error("AI team name error:", error);
        alert("Could not generate team names. Please try again.");
      } finally {
        // Restore button state
        teamsGenerateAllBtn.disabled = false;
        teamsGenerateAllBtn.style.opacity = "1";
      }
    });
  }

  // AI Enhance All Teams button
  const teamsEnhanceAllBtn = document.getElementById("teamsEnhanceAllBtn");
  if (teamsEnhanceAllBtn) {
    teamsEnhanceAllBtn.addEventListener("click", async () => {
      // Get game theme/topic if a game is selected
      const gameTopic = menuSelectedGame?.title || menuSelectedGame?.subtitle || null;

      // Show loading state
      teamsEnhanceAllBtn.disabled = true;
      teamsEnhanceAllBtn.style.opacity = "0.5";

      try {
        // Enhance all team names
        for (let i = 0; i < menuTeams.length; i++) {
          const currentName = menuTeams[i].name;
          const otherTeamNames = menuTeams
            .map((t, idx) => idx === i ? null : t.name)
            .filter(n => n && n.trim());

          const rawResult = await window.generateAI('team-name-enhance', {
            currentName: currentName,
            existingNames: otherTeamNames,
            gameTopic: gameTopic
          }, 'normal');

          // Parse the result
          const cleaned = rawResult?.trim() || '';
          let result = cleaned;

          if (cleaned.includes('```')) {
            const stripped = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '').trim();
            try {
              const parsed = JSON.parse(stripped);
              result = parsed.name || result;
            } catch (e) {
              result = stripped;
            }
          }

          result = result.replace(/^["']|["']$/g, '').trim();

          if (result && result.length > 0) {
            menuTeams[i].name = result;
          }
        }

        // Re-render with enhanced names
        renderTeamInputs();
      } catch (error) {
        console.error("AI team name error:", error);
        alert("Could not enhance team names. Please try again.");
      } finally {
        // Restore button state
        teamsEnhanceAllBtn.disabled = false;
        teamsEnhanceAllBtn.style.opacity = "1";
      }
    });
  }

  // Collapsible theme section
  themeToggle.addEventListener("click", () => {
    const isCollapsed = themeContent.classList.toggle("collapsed");
    themeToggle.classList.toggle("collapsed", isCollapsed);
  });

  // Collapsible advanced section
  advancedToggle.addEventListener("click", () => {
    const isCollapsed = advancedContent.classList.toggle("collapsed");
    advancedToggle.classList.toggle("collapsed", isCollapsed);
  });

  // Edit mode functions for title/subtitle
  const enableEditMode = (input, display, editBtn) => {
    input.style.display = "block";
    display.style.display = "none";
    editBtn.style.display = "none";
    input.focus();
  };

  const disableEditMode = (input, display, editBtn, value) => {
    input.style.display = "none";
    display.style.display = "inline";
    editBtn.style.display = "inline";
    if (value) {
      display.textContent = value;
      display.classList.remove("field-value-empty");
    } else {
      display.textContent = "No custom subtitle";
      display.classList.add("field-value-empty");
    }
  };

  // Title edit button
  menuGameTitleEditBtn.addEventListener("click", () => {
    enableEditMode(menuGameTitle, menuGameTitleDisplay, menuGameTitleEditBtn);
  });

  menuGameTitle.addEventListener("blur", () => {
    menuGameSettings.title = menuGameTitle.value;
    disableEditMode(menuGameTitle, menuGameTitleDisplay, menuGameTitleEditBtn, menuGameTitle.value);
  });

  menuGameTitle.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      menuGameTitle.blur();
    }
  });

  // Subtitle edit button
  menuGameSubtitleEditBtn.addEventListener("click", () => {
    enableEditMode(menuGameSubtitle, menuGameSubtitleDisplay, menuGameSubtitleEditBtn);
  });

  menuGameSubtitle.addEventListener("blur", () => {
    menuGameSettings.subtitle = menuGameSubtitle.value;
    disableEditMode(menuGameSubtitle, menuGameSubtitleDisplay, menuGameSubtitleEditBtn, menuGameSubtitle.value);
  });

  menuGameSubtitle.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      menuGameSubtitle.blur();
    }
  });

  // Game settings inputs (for hidden inputs that still work)
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
      menuSelectedGame = allGames[0] || null;
    }

    renderGameList();
  });

  // Start button - pass the team names and game settings to startGame
  startBtn.addEventListener("click", () => {
    // Check if ready to start
    const ready = isReadyToStart();

    if (!ready.hasGame) {
      // No game selected - show error and guide user
      alert("Please select a game first!");
      // Highlight the game section
      document.querySelector('.menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!ready.hasTeams) {
      // No teams - show error and guide user
      alert("Please add at least one team!");
      // Scroll to teams section
      document.getElementById('teamsSetup')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    startGame(menuSelectedGame, menuTeams, menuGameSettings);
  });

  // Resume button - resume saved game state
  if (resumeBtn) {
    resumeBtn.addEventListener("click", async () => {
      if (!menuSelectedGame) {
        alert("Please select a game first!");
        return;
      }

      // Check if there's saved state
      const savedState = localStorage.getItem(stateKey(menuSelectedGame.id));
      if (!savedState) {
        alert("No saved game found!");
        return;
      }

      // Resume the game with saved state
      try {
        await setCurrentGame(menuSelectedGame);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        alert(message);
      }
    });
  }

  // Function to check if ready to start and update button
  function isReadyToStart() {
    const hasGame = !!menuSelectedGame;
    const hasTeams = menuTeams.length >= 1;
    return { hasGame, hasTeams };
  }

  function updateStartButton() {
    const ready = isReadyToStart();
    const btn = document.getElementById('startGameBtn');

    // Update button
    if (!ready.hasGame) {
      btn.textContent = '▶ Select a Game';
      btn.disabled = true;
      btn.classList.remove('ready');
    } else if (!ready.hasTeams) {
      btn.textContent = '▶ Add at Least One Team';
      btn.disabled = true;
      btn.classList.remove('ready');
    } else {
      btn.textContent = '▶ Start Game';
      btn.disabled = false;
      btn.classList.add('ready');
    }

    // Update start status display in footer
    if (startStatus) {
      teamsStatus.classList.toggle('valid', ready.hasTeams);
      teamsCount.textContent = menuTeams.length;
    }

    // Show/hide resume button based on saved state
    if (resumeBtn) {
      const hasSavedState = menuSelectedGame && localStorage.getItem(stateKey(menuSelectedGame.id));
      if (hasSavedState) {
        resumeBtn.style.display = 'inline-block';
      } else {
        resumeBtn.style.display = 'none';
      }
    }
  }

  // Category select change
  categorySelect.addEventListener("change", () => {
    selectedCategory = categorySelect.value;
    renderGameList();
  });

  // ==================== VIEW TOGGLE FUNCTIONALITY ====================
  // View mode state - DEFAULT TO LIST VIEW
  const MENU_VIEW_KEY = 'jeop2:menuViewMode';
  let menuViewMode = localStorage.getItem(MENU_VIEW_KEY) || 'list';

  function initViewToggle() {
    if (!viewToggleBtn || !gameList) return;

    // Apply saved view mode (default list)
    gameList.classList.add(`${menuViewMode}-view`);
    viewToggleBtn.textContent = menuViewMode === 'list' ? '☰' : '▦';
    viewToggleBtn.title = menuViewMode === 'list' ? 'Switch to grid view' : 'Switch to list view';

    // Toggle handler
    viewToggleBtn.addEventListener("click", () => {
      menuViewMode = menuViewMode === 'list' ? 'grid' : 'list';
      gameList.classList.remove('grid-view', 'list-view');
      gameList.classList.add(`${menuViewMode}-view`);
      viewToggleBtn.textContent = menuViewMode === 'list' ? '☰' : '▦';
      viewToggleBtn.title = menuViewMode === 'list' ? 'Switch to grid view' : 'Switch to list view';
      localStorage.setItem(MENU_VIEW_KEY, menuViewMode);
    });
  }

  // Initialize view toggle
  initViewToggle();

  // New Game button handler
  if (menuNewGameBtn) {
    menuNewGameBtn.addEventListener("click", () => {
      // Trigger the existing create game button
      document.getElementById('createGameBtn')?.click();
    });
  }

  // Search input
  gameSearch.addEventListener("input", () => {
    renderGameList();
  });

  renderGameList();
  renderThemeGrid();
  updateStartButton();
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

async function main() {
  console.log('[main] Application starting...');

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
  await setupGameCreator();  // Wait for Game Creator to initialize and expose global functions

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

          // Create AI buttons container
          const aiButtons = el("div", { class: "settingsTeamAIBtns" });

          // Random button
          const randomBtn = el("button", {
            class: "team-ai-btn",
            type: "button",
            title: "Generate random team name"
          }, "🎲");
          randomBtn.addEventListener("click", async () => {
            const currentName = team.name;
            const otherNames = app.state.teams.filter((_, i) => i !== index).map(t => t.name);
            const gameTopic = app.game?.title || app.game?.subtitle || null;

            randomBtn.disabled = true;
            randomBtn.style.opacity = "0.5";

            try {
              const rawResult = await window.generateAI('team-name-random', {
                count: 1,
                existingNames: otherNames,
                gameTopic: gameTopic
              }, 'normal');

              const cleaned = rawResult?.trim() || '';
              let result = cleaned;

              if (cleaned.includes('```')) {
                const stripped = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '').trim();
                try {
                  const parsed = JSON.parse(stripped);
                  result = parsed.names && parsed.names[0] ? parsed.names[0] : result;
                } catch (e) {
                  result = stripped;
                }
              }

              result = result.replace(/^["']|["']$/g, '').trim();

              if (result && result.length > 0) {
                team.name = result;
                // Re-render settings
                document.querySelector("[data-action=\"settings\"]")?.click();
              }
            } catch (error) {
              console.error("AI team name error:", error);
              alert("Could not generate team name. Please try again.");
            } finally {
              randomBtn.disabled = false;
              randomBtn.style.opacity = "1";
            }
          });

          // Enhance button
          const enhanceBtn = el("button", {
            class: "team-ai-btn sparkle",
            type: "button",
            title: "Enhance this team name"
          }, "✨");
          enhanceBtn.addEventListener("click", async () => {
            const currentName = team.name;
            const otherNames = app.state.teams.filter((_, i) => i !== index).map(t => t.name);
            const gameTopic = app.game?.title || app.game?.subtitle || null;

            enhanceBtn.disabled = true;
            enhanceBtn.style.opacity = "0.5";

            try {
              const rawResult = await window.generateAI('team-name-enhance', {
                currentName: currentName,
                existingNames: otherNames,
                gameTopic: gameTopic
              }, 'normal');

              const cleaned = rawResult?.trim() || '';
              let result = cleaned;

              if (cleaned.includes('```')) {
                const stripped = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '').trim();
                try {
                  const parsed = JSON.parse(stripped);
                  result = parsed.name || result;
                } catch (e) {
                  result = stripped;
                }
              }

              result = result.replace(/^["']|["']$/g, '').trim();

              if (result && result.length > 0) {
                team.name = result;
                // Re-render settings
                document.querySelector("[data-action=\"settings\"]")?.click();
              }
            } catch (error) {
              console.error("AI team name error:", error);
              alert("Could not generate team name. Please try again.");
            } finally {
              enhanceBtn.disabled = false;
              enhanceBtn.style.opacity = "1";
            }
          });

          aiButtons.appendChild(randomBtn);
          aiButtons.appendChild(enhanceBtn);

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

              // Create AI buttons for this team
              const tAiButtons = el("div", { class: "settingsTeamAIBtns" });

              const tRandomBtn = el("button", { class: "team-ai-btn", type: "button", title: "Generate random team name" }, "🎲");
              tRandomBtn.addEventListener("click", async () => {
                const tCurrentName = t.name;
                const tOtherNames = app.state.teams.filter((_, ti) => ti !== i).map((tm) => tm.name);
                const tGameTopic = app.game?.title || app.game?.subtitle || null;

                tRandomBtn.disabled = true;
                tRandomBtn.style.opacity = "0.5";

                try {
                  const tRawResult = await window.generateAI('team-name-random', {
                    count: 1,
                    existingNames: tOtherNames,
                    gameTopic: tGameTopic
                  }, 'normal');

                  const tCleaned = tRawResult?.trim() || '';
                  let tResult = tCleaned;

                  if (tCleaned.includes('```')) {
                    const tStripped = tCleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '').trim();
                    try {
                      const tParsed = JSON.parse(tStripped);
                      tResult = tParsed.names && tParsed.names[0] ? tParsed.names[0] : tResult;
                    } catch (e) {
                      tResult = tStripped;
                    }
                  }

                  tResult = tResult.replace(/^["']|["']$/g, '').trim();

                  if (tResult && tResult.length > 0) {
                    t.name = tResult;
                    document.querySelector("[data-action=\"settings\"]")?.click();
                  }
                } catch (error) {
                  console.error("AI team name error:", error);
                  alert("Could not generate team name. Please try again.");
                } finally {
                  tRandomBtn.disabled = false;
                  tRandomBtn.style.opacity = "1";
                }
              });

              const tEnhanceBtn = el("button", { class: "team-ai-btn sparkle", type: "button", title: "Enhance this team name" }, "✨");
              tEnhanceBtn.addEventListener("click", async () => {
                const tCurrentName = t.name;
                const tOtherNames = app.state.teams.filter((_, ti) => ti !== i).map((tm) => tm.name);
                const tGameTopic = app.game?.title || app.game?.subtitle || null;

                tEnhanceBtn.disabled = true;
                tEnhanceBtn.style.opacity = "0.5";

                try {
                  const tRawResult = await window.generateAI('team-name-enhance', {
                    currentName: tCurrentName,
                    existingNames: tOtherNames,
                    gameTopic: tGameTopic
                  }, 'normal');

                  const tCleaned = tRawResult?.trim() || '';
                  let tResult = tCleaned;

                  if (tCleaned.includes('```')) {
                    const tStripped = tCleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '').trim();
                    try {
                      const tParsed = JSON.parse(tStripped);
                      tResult = tParsed.name || tResult;
                    } catch (e) {
                      tResult = tStripped;
                    }
                  }

                  tResult = tResult.replace(/^["']|["']$/g, '').trim();

                  if (tResult && tResult.length > 0) {
                    t.name = tResult;
                    document.querySelector("[data-action=\"settings\"]")?.click();
                  }
                } catch (error) {
                  console.error("AI team name error:", error);
                  alert("Could not generate team name. Please try again.");
                } finally {
                  tEnhanceBtn.disabled = false;
                  tEnhanceBtn.style.opacity = "1";
                }
              });

              tAiButtons.appendChild(tRandomBtn);
              tAiButtons.appendChild(tEnhanceBtn);

              const rb = el("button", { class: "iconBtn removeTeamBtn", type: "button" }, "🗑");
              rb.disabled = app.state.teams.length <= 1;
              rb.addEventListener("click", () => {
                app.state.teams.splice(i, 1);
                // Trigger re-render by clicking settings again
                document.querySelector("[data-action=\"settings\"]")?.click();
              });
              newList.appendChild(el("div", { class: "settingsTeamRow" }, ni, tAiButtons, si, rb));
            });
            settingsTeams.appendChild(newList);
          });

          // Create wrapper for name input and AI buttons
          const nameWrapper = el("div", { class: "settingsTeamNameWrapper" });
          nameWrapper.appendChild(nameInput);
          nameWrapper.appendChild(aiButtons);

          list.appendChild(el("div", { class: "settingsTeamRow" }, nameWrapper, scoreInput, removeBtn));
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
    // No resume dialog - always go to main menu
    // Resume button will appear in footer if saved state exists
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

// Category Edit Dialog - for editing display name and content topic
// @param {string} currentTitle - Current display name
// @param {string} currentTopic - Current content topic
// @returns {Promise} Resolves with {title, topic} or null if cancelled
function showCategoryEditDialog(currentTitle = "", currentTopic = "") {
  console.log('[showCategoryEditDialog] Called with:', currentTitle, currentTopic);
  return new Promise((resolve) => {
    const overlay = document.getElementById("categoryEditDialog");
    const titleInput = document.getElementById("categoryEditTitleInput");
    const topicInput = document.getElementById("categoryEditTopicInput");
    const confirmBtn = document.getElementById("categoryEditDialogConfirm");
    const cancelBtn = document.getElementById("categoryEditDialogCancel");
    const xBtn = document.getElementById("categoryEditDialogXBtn");

    if (!overlay) {
      console.error('[showCategoryEditDialog] Overlay not found!');
      resolve(null);
      return;
    }

    titleInput.value = currentTitle;
    topicInput.value = currentTopic;

    let resolved = false;
    const abortController = new AbortController();
    const signal = abortController.signal;

    const doResolve = (title, topic) => {
      if (!resolved) {
        resolved = true;
        abortController.abort();
        overlay.style.display = "none";
        console.log('[showCategoryEditDialog] Resolved with:', { title, topic });
        resolve({ title, topic });
      }
    };

    const confirmHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      doResolve(titleInput.value.trim(), topicInput.value.trim());
    };

    const cancelHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      doResolve(null, null); // null means cancelled
    };

    confirmBtn.addEventListener("click", confirmHandler, { signal, capture: true });
    cancelBtn.addEventListener("click", cancelHandler, { signal, capture: true });
    xBtn.addEventListener("click", cancelHandler, { signal, capture: true });

    // Allow Enter key to confirm from either field
    const handleEnter = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        doResolve(titleInput.value.trim(), topicInput.value.trim());
      }
    };
    titleInput.addEventListener("keydown", handleEnter, { signal, capture: true });
    topicInput.addEventListener("keydown", handleEnter, { signal, capture: true });

    overlay.style.display = "flex";
    titleInput.focus();
    titleInput.select();
  });
}

// Expose globally
window.showCategoryEditDialog = showCategoryEditDialog;

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

/**
 * Category AI dialog - shows editable theme and 2 action options
 * @param {string} currentTitle - Current category title (for display)
 * @param {string} currentContentTopic - Current content topic (for AI generation, pre-fills input)
 * @returns {Promise} Resolves with {action, theme, result} or null if cancelled
 */
function showCategoryAIDialog(currentTitle, currentContentTopic = null) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("inputDialog");
    const titleEl = document.getElementById("inputDialogTitle");
    const helperEl = document.getElementById("inputDialogHelper");
    const valueInput = document.getElementById("inputDialogValue");
    const confirmBtn = document.getElementById("inputDialogConfirm");
    const cancelBtn = document.getElementById("inputDialogCancel");
    const xBtn = document.getElementById("inputDialogXBtn");

    if (!overlay) {
      console.error('[showCategoryAIDialog] Overlay not found!');
      resolve(null);
      return;
    }

    // Set content
    titleEl.textContent = '✨ AI Assistant for Category';
    helperEl.innerHTML = ''; // Clear helper text

    // Hide the single input field - we'll create our own dual fields
    valueInput.style.display = 'none';

    // Hide default buttons
    confirmBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    // Create dual input fields container
    const inputsContainer = document.createElement('div');
    inputsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 16px; width: 100%; margin-bottom: 20px;';

    // Display Name field
    const titleField = document.createElement('div');
    titleField.className = 'input-dialog-field';
    titleField.innerHTML = `
      <label class="input-dialog-label">Display Name</label>
      <input id="aiDialogTitleInput" type="text" placeholder='e.g. "Bedrock Banter"' autocomplete="off" />
      <div class="input-dialog-hint">What players see on the game board</div>
    `;
    inputsContainer.appendChild(titleField);

    // Content Topic field
    const topicField = document.createElement('div');
    topicField.className = 'input-dialog-field';
    topicField.innerHTML = `
      <label class="input-dialog-label">Content Topic</label>
      <input id="aiDialogTopicInput" type="text" placeholder='e.g. "Flintstones Trivia"' autocomplete="off" />
      <div class="input-dialog-hint">What questions are actually about (for AI)</div>
    `;
    inputsContainer.appendChild(topicField);

    // Get references to the new inputs directly from the created HTML
    const titleInput = inputsContainer.querySelector('#aiDialogTitleInput');
    const topicInput = inputsContainer.querySelector('#aiDialogTopicInput');

    // Set initial values
    titleInput.value = currentTitle;
    topicInput.value = currentContentTopic || currentTitle;

    // Create action buttons container
    const actionsContainer = document.createElement('div');
    actionsContainer.id = 'categoryAIActions';
    actionsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%;';

    // Create results container (hidden initially)
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'categoryAIResults';
    resultsContainer.style.cssText = 'display: none; flex-direction: column; gap: 12px; width: 100%;';

    const renderButtons = () => {
      actionsContainer.innerHTML = '';
      actionsContainer.style.display = 'flex';
      resultsContainer.style.display = 'none';

      const topicValue = topicInput.value.trim() || currentTitle;

      const buttons = [
        {
          action: 'category-rename',
          icon: '✏️',
          title: 'Suggest better names',
          desc: `Get creative alternatives to "${titleInput.value}"`
        },
        {
          action: 'category-generate-smart',
          icon: '✨',
          title: 'Generate questions',
          desc: `Create questions using "${topicValue}" as the theme`
        }
      ];

      buttons.forEach(btn => {
        const btnEl = document.createElement('button');
        btnEl.className = 'selection-option';
        btnEl.innerHTML = `
          <span class="selection-option-icon">${btn.icon}</span>
          <div class="selection-option-content">
            <div class="selection-option-title">${btn.title}</div>
            <div class="selection-option-desc">${btn.desc}</div>
          </div>
        `;
        btnEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const theme = topicInput.value.trim() || topicValue;
          handleActionClick(btn.action, theme, btnEl);
        });
        actionsContainer.appendChild(btnEl);
      });
    };

    // Update button descriptions when inputs change
    titleInput.addEventListener('input', () => {
      if (actionsContainer.style.display !== 'none') {
        renderButtons();
      }
    });

    topicInput.addEventListener('input', () => {
      if (actionsContainer.style.display !== 'none') {
        renderButtons();
      }
    });

    const handleActionClick = async (action, theme, buttonEl) => {
      if (action === 'category-rename') {
        // Show loading state inline (above buttons, not hiding them)
        actionsContainer.style.display = 'none';
        resultsContainer.style.display = 'flex';
        resultsContainer.innerHTML = `
          <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
            <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
            <div>Generating name suggestions...</div>
          </div>
        `;

        // Generate names directly and show them
        try {
          const rawResult = await window.generateAI('category-rename', {
            currentTitle: theme,
            theme: theme || 'general'
          }, 'normal');

          // Parse the result
          const cleaned = rawResult?.trim() || '';
          const stripped = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/g, '').trim();
          const parsed = JSON.parse(stripped);

          if (parsed && parsed.names && Array.isArray(parsed.names)) {
            showNameSuggestionsInline(parsed.names, theme);
          } else {
            renderButtons();
          }
        } catch (e) {
          console.error('[CategoryAI] Failed to generate names:', e);
          renderButtons();
        }
      } else if (action === 'category-generate-smart') {
        // Save any changes to the category before generating
        const gameHeader = document.getElementById('creatorGameHeader');
        if (gameHeader && gameHeader._gameData) {
          const catIdx = window.selectedCategoryIndex;
          if (catIdx !== null && catIdx !== undefined) {
            gameHeader._gameData.categories[catIdx].title = titleInput.value.trim();
            gameHeader._gameData.categories[catIdx].contentTopic = topicInput.value.trim() || null;
            gameHeader._game.gameData = gameHeader._gameData;
            window.GameCreatorState.state.autoSave();
          }
        }

        // Show loading state
        actionsContainer.style.display = 'none';
        resultsContainer.style.display = 'flex';
        resultsContainer.innerHTML = `
          <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
            <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
            <div>Generating questions...</div>
            <div style="font-size: 12px; margin-top: 8px;">This may take a moment</div>
          </div>
        `;

        // Trigger the action - hide overlay before preview, cleanup after preview is handled
        resolve({
          action,
          theme,
          onClose: () => {
            // Only hide the overlay before preview, don't remove containers yet
            console.log('[showCategoryAIDialog] Hiding overlay before preview');
            overlay.style.display = 'none';
          },
          onPreviewDone: () => {
            // Full cleanup after preview is confirmed/cancelled
            console.log('[showCategoryAIDialog] Full cleanup after preview');
            cleanup();
          }
        });
      }
    };

    const showNameSuggestionsInline = (names, theme) => {
      // Show suggestions above the action buttons
      resultsContainer.style.display = 'flex';
      resultsContainer.innerHTML = `
        <div style="padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">✨ Suggested names (click to use):</div>
          ${names.map((name, i) => `
            <button
              class="name-suggestion-btn"
              data-name="${name}"
              style="display: inline-block; padding: 8px 12px; margin: 4px;
                     background: var(--bg-primary); border: 1px solid var(--border-color);
                     border-radius: 6px; cursor: pointer; transition: all 0.2s;
                     font-size: 13px;"
              onmouseover="this.style.background='var(--bg-hover)'"
              onmouseout="this.style.background='var(--bg-primary)'"
            >
              ${name}
            </button>
          `).join('')}
        </div>
      `;

      // Add click handlers for name suggestions
      resultsContainer.querySelectorAll('.name-suggestion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          // Don't update the input - keep the contentTopic
          // valueInput.value = btn.dataset.name; // Removed - preserve contentTopic
          // Apply the name change immediately
          applyNameChange(btn.dataset.name);
          // Clear suggestions and show main buttons again
          resultsContainer.style.display = 'none';
          actionsContainer.style.display = 'flex';
        });
      });
    };

    const applyNameChange = (newName) => {
      // Apply the name change to the category
      const gameHeader = document.getElementById('creatorGameHeader');
      if (!gameHeader || !gameHeader._gameData) return;

      const catIdx = window.selectedCategoryIndex;
      if (catIdx === null || catIdx === undefined) return;

      // Update title but preserve contentTopic
      gameHeader._gameData.categories[catIdx].title = newName;
      // Also save the contentTopic from the input
      gameHeader._gameData.categories[catIdx].contentTopic = topicInput.value.trim() || null;
      gameHeader._game.gameData = gameHeader._gameData;
      window.GameCreatorState.state.autoSave();

      // Update the display name input with the new name
      titleInput.value = newName;
      // Keep the content topic input as-is

      // Update currentTitle for display purposes
      currentTitle = newName;

      // Re-render to show the new name
      window.GameCreatorEditor.Render.categories();
      window.GameCreatorEditor.Render.categoriesColumn(gameHeader._gameData.categories);

      // Re-render buttons with new description
      renderButtons();
    };

    const cleanup = () => {
      console.log('[showCategoryAIDialog] cleanup() called');
      overlay.style.display = 'none';
      inputsContainer.remove();
      actionsContainer.remove();
      resultsContainer.remove();
      // Reset buttons
      confirmBtn.style.display = '';
      cancelBtn.style.display = '';
      valueInput.style.display = '';
      valueInput.style.marginBottom = '';
      console.log('[showCategoryAIDialog] cleanup() done, overlay display:', overlay.style.display);
    };

    // Insert containers - inputs first, then actions, then results
    valueInput.parentNode.insertBefore(inputsContainer, valueInput.nextSibling);
    valueInput.parentNode.insertBefore(actionsContainer, inputsContainer.nextSibling);
    valueInput.parentNode.insertBefore(resultsContainer, actionsContainer.nextSibling);

    let resolved = false;
    const abortController = new AbortController();
    const signal = abortController.signal;

    const doResolve = (value) => {
      if (!resolved && value !== null) {
        resolved = true;
        abortController.abort();
        // Don't cleanup here - cleanup will be called after preview is confirmed/cancelled
        resolve(value);
      }
    };

    xBtn.addEventListener("click", () => {
      cleanup();
      resolve(null);
    }, { signal });

    // Initial render
    renderButtons();

    // Show the overlay
    overlay.style.display = 'flex';
    titleInput.focus();
    titleInput.select();
  });
}

// Expose globally
window.showCategoryAIDialog = showCategoryAIDialog;

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

      // Generate title using the game-title action with preview
      // We need to handle the selected title from the preview dialog
      const titleResult = await new Promise((resolve) => {
        executeAIAction('game-title', titleContext, difficulty, null, null, null, async (selectedIndex) => {
          console.log('[generateGameWithAI] Title selected, index:', selectedIndex);
          // Title has already been applied by executeAIAction
          // Just resolve the promise
          resolve(true);
        });
      });

      if (titleResult) {
        console.log('[generateGameWithAI] Title generated successfully');
        // Explicitly save the game immediately to ensure title/subtitle are persisted
        if (window.autoSave) {
          console.log('[generateGameWithAI] Triggering immediate save...');
          await window.autoSave(true); // Pass true for immediate save
        }
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
// ================================
// Game Creator Module
// ================================
// Reorganized into namespace pattern for better maintainability
// See REFACTORING_PLAN.md for details

// ================================
// Game Creator Module System
// ================================
// The Game Creator has been refactored into separate modular files.
// See game-creator/ directory for the modular implementation.
// This file now serves as the main entry point and coordination layer.

// Setup Game Creator using modular system
async function setupGameCreator() {
  try {
    console.log('[setupGameCreator] Starting...');

    // Check if modules are loaded
    if (!window.GameCreatorStorage) {
      console.error('[setupGameCreator] GameCreatorStorage not loaded!');
      return;
    }
    if (!window.GameCreatorUtils) {
      console.error('[setupGameCreator] GameCreatorUtils not loaded!');
      return;
    }
    if (!window.GameCreatorState) {
      console.error('[setupGameCreator] GameCreatorState not loaded!');
      return;
    }
    if (!window.GameCreatorMain) {
      console.error('[setupGameCreator] GameCreatorMain not loaded!');
      return;
    }

    console.log('[setupGameCreator] All modules loaded successfully');

    // Expose backward-compatible global functions for external code
    window.loadCreatorData = window.GameCreatorStorage.loadCreatorData.bind(window.GameCreatorStorage);
    window.saveCreatorData = window.GameCreatorStorage.saveCreatorData.bind(window.GameCreatorStorage);
    window.getDefaultCreatorData = window.GameCreatorStorage.getDefaultCreatorData.bind(window.GameCreatorStorage);
    window.generateId = window.GameCreatorUtils.generateId.bind(window.GameCreatorUtils);

    console.log('[setupGameCreator] Backward-compatible globals exposed');

    // Initialize state
    await window.GameCreatorState.initialize();
    console.log('[setupGameCreator] State initialized');

    await window.GameCreatorState.loadAllGames();
    console.log('[setupGameCreator] Games loaded:', window.GameCreatorState.state.allCreatorGames.length);

    // Initialize the Game Creator UI and event listeners
    await window.GameCreatorMain.setup();
    console.log('[setupGameCreator] Setup complete');
  } catch (err) {
    console.error('[setupGameCreator] Error:', err);
    throw err;
  }
}

// Start the application
main().catch((err) => {
  console.error('[main] Fatal error:', err);
});

