// Shared session state and save persistence. Keep the storage key stable across releases.
/* Local-first game UI. No account, analytics or server required. */
const G = Moonward,
  KEY = "moonward-save-v1",
  $ = (id) => document.getElementById(id);
let state = G.fresh(),
  tab = "build",
  researchView = "industry",
  flying = false,
  toastTimer,
  lastTick = Date.now(),
  saveFailed = false;
// Migrate a saved game if possible; invalid data or unavailable storage falls back to fresh state.
function loadSavedGame() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return G.migrate(data) || G.fresh();
  } catch {
    // Invalid saves or blocked browser storage start a playable fresh session.
    return G.fresh();
  }
}
state = loadSavedGame();
let startupPending = true;
// Apply and persist earnings before presenting them. Dismissing a report awards nothing.
const welcome = G.offline(state);
let lastSave = Date.now(),
  knownResearch = state.tech.length;
// Store the whole session with a new last-seen timestamp and expose storage failures in the footer.
function save() {
  state.lastSeen = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    saveFailed = false;
  } catch {
    saveFailed = true;
  }
  $("save-status").textContent = saveFailed
    ? "Storage unavailable · keep this tab open"
    : "Progress saved on this device";
}
