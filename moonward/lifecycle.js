// Browser and Android pause/resume handling, and the simulation heartbeat.
let nativePaused = false;
// Persist the departure timestamp before browser suspension or Android backgrounding.
function away() {
  save();
  lastTick = Date.now();
}
// Apply elapsed offline production once, save it and present the receipt after startup when necessary.
function resume() {
  const result = G.offline(state);
  lastTick = Date.now();
  save();
  render();
  researchCompleted();
  if (result.seconds >= 60) {
    if (startupPending) {
      welcome.seconds += result.seconds;
      for (const key of Object.keys(result.gains))
        welcome.gains[key] = (welcome.gains[key] || 0) + result.gains[key];
    } else offlineNotice(result);
  }
  if (audioContext) audioContext.resume();
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    away();
    if (audioContext) audioContext.suspend();
  } else if (!nativePaused) resume();
});
document.addEventListener("moonwardpause", () => {
  nativePaused = true;
  away();
  if (audioContext) audioContext.suspend();
});
document.addEventListener("moonwardresume", () => {
  // Avoid duplicate catch-up when native Android and browser visibility events both fire.
  if (nativePaused) {
    nativePaused = false;
    resume();
  }
});
window.addEventListener("pagehide", away);
// Detect newly finished research and refresh unlocks without repeating the completion notification.
function researchCompleted() {
  if (state.tech.length > knownResearch) {
    knownResearch = state.tech.length;
    save();
    render();
    notify(G.techs[state.tech.at(-1)].name + " research complete.");
  }
}
// Run the visible-game heartbeat; recover long timer gaps through the offline simulation.
function updateGame() {
  if (document.hidden || nativePaused) return;
  const now = Date.now(),
    dt = (now - lastTick) / 1000;
  lastTick = now;
  // Timer throttling can occur without a visibility event: treat long gaps as away time.
  if (dt > 10) {
    state.lastSeen = now - dt * 1000;
    G.offline(state, now);
  } else G.tick(state, dt);
  researchCompleted();
  inventory();
  renderPanel();
  $("sol").textContent =
    "MISSION DAY " +
    String(1 + Math.floor(state.elapsed / 120)).padStart(3, "0");
  if (now - lastSave > 5000) {
    save();
    lastSave = now;
  }
}
setInterval(updateGame, 500);
