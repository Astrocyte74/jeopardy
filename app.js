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
const embeddedGames = {
  "living-christ": {
    title: "The Living Christ",
    subtitle: "Faith-promoting quiz",
    categories: [
      {
        title: "Birth & Early Life",
        clues: [
          { value: 200, clue: "Where was Jesus born?", response: "Bethlehem" },
          { value: 400, clue: "Who was Jesus' mother?", response: "Mary" },
          { value: 600, clue: "What was Jesus' occupation?", response: "Carpenter" },
          { value: 800, clue: "Who baptized Jesus?", response: "John the Baptist" },
          { value: 1000, clue: "Where did Jesus grow up?", response: "Nazareth" },
        ],
      },
      {
        title: "Miracles",
        clues: [
          { value: 200, clue: "Jesus turned water into this at a wedding", response: "Wine" },
          { value: 400, clue: "Jesus walked on this body of water", response: "Sea of Galilee" },
          { value: 600, clue: "Jesus raised this friend from the dead", response: "Lazarus" },
          { value: 800, clue: "Jesus fed 5,000 with this amount of loaves and fishes", response: "5 loaves, 2 fishes" },
          { value: 1000, clue: "Jesus healed this man who was blind from birth", response: "The blind man" },
        ],
      },
      {
        title: "Teachings",
        clues: [
          { value: 200, clue: "This sermon is famous for the Beatitudes", response: "Sermon on the Mount" },
          { value: 400, clue: "Jesus taught us to love our _______", response: "Enemies / Neighbors" },
          { value: 600, clue: "The Golden Rule", response: "Do unto others..." },
          { value: 800, clue: "Jesus is the way, the truth, and the ____", response: "Life" },
          { value: 1000, clue: "This parable teaches about lost sheep", response: "Parable of the Lost Sheep" },
        ],
      },
      {
        title: "Atonement",
        clues: [
          { value: 200, clue: "Jesus suffered in this garden", response: "Garden of Gethsemane" },
          { value: 400, clue: "Jesus was crucified at this place", response: "Golgotha / Calvary" },
          { value: 600, clue: "This sign was placed above Jesus on the cross", response: "INRI (King of the Jews)" },
          { value: 800, clue: "Jesus died at this hour", response: "The 9th hour (3 PM)" },
          { value: 1000, clue: "This earthquake event occurred when Jesus died", response: "The veil of the temple rent" },
        ],
      },
      {
        title: "Resurrection",
        clues: [
          { value: 200, clue: "Jesus rose on this day", response: "The third day / Sunday" },
          { value: 400, clue: "This woman first saw the risen Lord", response: "Mary Magdalene" },
          { value: 600, clue: "The tomb was sealed with this", response: "A great stone" },
          { value: 800, clue: "Jesus appeared to these disciples on the road to Emmaus", response: "Two disciples" },
          { value: 1000, clue: "Jesus ascended to heaven from this place", response: "Mount of Olives / Bethany" },
        ],
      },
      {
        title: "Titles of Jesus",
        clues: [
          { value: 200, clue: "The Good _____", response: "Shepherd" },
          { value: 400, clue: "The _____ of God", response: "Lamb / Son" },
          { value: 600, clue: "The Light of the _____", response: "World" },
          { value: 800, clue: "The King of _____", response: "Kings" },
          { value: 1000, clue: "The Alpha and the _____", response: "Omega" },
        ],
      },
    ],
  },
  "general": {
    title: "General Knowledge",
    subtitle: "A mix of categories",
    categories: [
      {
        title: "Science",
        clues: [
          { value: 200, clue: "H2O is the chemical formula for this", response: "Water" },
          { value: 400, clue: "This planet is known as the Red Planet", response: "Mars" },
          { value: 600, clue: "The force that keeps us on the ground", response: "Gravity" },
          { value: 800, clue: "The largest mammal in the world", response: "Blue Whale" },
          { value: 1000, clue: "The closest star to Earth", response: "The Sun" },
        ],
      },
      {
        title: "Geography",
        clues: [
          { value: 200, clue: "The largest ocean on Earth", response: "Pacific Ocean" },
          { value: 400, clue: "The capital of France", response: "Paris" },
          { value: 600, clue: "The longest river in the world", response: "Nile River" },
          { value: 800, clue: "The smallest continent", response: "Australia" },
          { value: 1000, clue: "The country with the most people", response: "India / China" },
        ],
      },
      {
        title: "History",
        clues: [
          { value: 200, clue: "The first President of the United States", response: "George Washington" },
          { value: 400, clue: "The ancient civilization built the pyramids", response: "Egyptians" },
          { value: 600, clue: "World War II ended in this year", response: "1945" },
          { value: 800, clue: "The Wright brothers invented this", response: "Airplane" },
          { value: 1000, clue: "The Roman Empire fell in this century", response: "5th century (476 AD)" },
        ],
      },
      {
        title: "Literature",
        clues: [
          { value: 200, clue: "William Shakespeare wrote this play about Romeo & Juliet", response: "Romeo and Juliet" },
          { value: 400, clue: "This author wrote Harry Potter", response: "J.K. Rowling" },
          { value: 600, clue: "The author of 1984", response: "George Orwell" },
          { value: 800, clue: "This novel features a character named Atticus Finch", response: "To Kill a Mockingbird" },
          { value: 1000, clue: "The poet who wrote 'The Raven'", response: "Edgar Allan Poe" },
        ],
      },
    ],
  },
};

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
  const jsonInput = document.getElementById("menu-json-input");

  // Teams data - start with 2 teams
  let menuTeams = [
    { name: "Team 1" },
    { name: "Team 2" }
  ];

  // Load games
  const { games } = await getAvailableGames();
  menuSelectedGame = games[0];

  function renderGameList() {
    gameList.innerHTML = "";
    games.forEach(game => {
      const option = document.createElement("div");
      option.className = `game-option${game.id === menuSelectedGame.id ? " selected" : ""}`;
      option.innerHTML = `
        <span class="game-option-icon">🎮</span>
        <div class="game-option-info">
          <div class="game-option-title">${game.title}</div>
          <div class="game-option-subtitle">${game.subtitle || game.source}</div>
        </div>
      `;
      option.addEventListener("click", () => {
        menuSelectedGame = game;
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

  // Initial render
  renderTeamInputs();

  // Start button - pass the team names to startGame
  startBtn.addEventListener("click", () => {
    startGame(menuSelectedGame, menuTeams);
  });

  // JSON import
  jsonInput.addEventListener("change", async () => {
    const files = jsonInput.files;
    if (!files.length) return;

    for (const file of files) {
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
      } catch (err) {
        alert(`Error loading ${file.name}: ${err.message}`);
      }
    }

    // Reload games
    const { games: newGames } = await getAvailableGames();
    games.length = 0;
    games.push(...newGames);
    menuSelectedGame = games[0];
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

async function startGame(gameRef, teamNames = null) {
  hideMainMenu();

  const gameId = gameRef.id;
  let rawGame;

  if (gameRef.source === "custom" || gameRef.source === "embedded") {
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
    saveState(state);
  }

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

  if (gameRef.source === "custom" || gameRef.source === "embedded") {
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

main();
