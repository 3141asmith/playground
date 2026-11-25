/* Optional combat expeditions unlock upon establishing the fifth colony. */
let knownCombatReports = state.combat.nextReport;
// Render hangars, fighter queues, mission choices and saved combat reports from engine state.
function fleetPanelMarkup() {
  const f = state.combat,
    c = current(),
    yard = f.yards[state.current],
    grid = c ? G.power(state, c) : null;
  if (!f.encountered)
    return '<h2 class="panel-title">Quiet skies.</h2><p class="panel-description">Explore five worlds to make first contact.</p>';
  const shipRate = yard
      ? yard.hangars * G.bonuses(state).processing * grid.factor
      : 0,
    eta = shipRate ? (120 - (yard?.progress || 0)) / shipRate : 0;
  let html = `<p class="panel-kicker">THE HOLLOW / FLEET COMMAND</p><h2 class="panel-title">Hold the frontier.</h2><p class="panel-description">Combat expeditions are optional. The Hollow will not destroy your colonies. Fighters are shared across your hangars.</p><div class="fleet-summary"><strong>${f.fighters} FIGHTERS AVAILABLE · ${f.mission?.ships || 0} DEPLOYED</strong><p>${f.victories} victories this run · ${state.meta.combatWins} lifetime</p></div><article class="build-card" data-hangar tabindex="0"><div class="card-head"><span class="building-icon">⌂</span><h3>Fleet hangar · ${G.worlds[state.current].name}</h3><span class="level">${yard?.hangars || 0} built</span></div><p>Build fighters in 120 powered seconds each. More hangars build in parallel. Each hangar requires ${8 * G.bonuses(state).processing} kW; factory upgrades speed construction and increase demand.</p><button id="build-hangar" ${!G.canPay(state, G.hangarCost(state)) || (yard?.hangars || 0) >= 100 ? "disabled" : ""}>Build hangar +<span>${costText(G.hangarCost(state))}</span></button>${yard ? `<p>${yard.queued} fighters queued · ${Math.floor(grid.factor * 100)}% power<br>${yard.queued ? (shipRate ? "Next fighter in " + researchTime(eta) : "Construction paused · build solar arrays") : "Queue construction to launch your first squadron."}</p>${yard.queued ? `<div class="mission-progress" role="progressbar" aria-label="Fighter construction" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.floor((yard.progress / 120) * 100)}"><div style="width:${(yard.progress / 120) * 100}%"></div></div>` : ""}<button data-queue-fighters="1" ${yard.queued >= 50 || !G.canPay(state, G.fighterCost(state)) ? "disabled" : ""}>Queue fighter<span>${costText(G.fighterCost(state))}</span></button><button data-queue-fighters="5" ${yard.queued > 45 || !G.canPay(state, G.fighterCost(state, state.current, 5)) ? "disabled" : ""}>Queue 5 fighters<span>${costText(G.fighterCost(state, state.current, 5))}</span></button>` : ""}</article>`;
  if (Object.keys(f.yards).length > 1)
    html += `<p class="panel-description">Shipyards: ${Object.entries(f.yards)
      .map(
        ([id, y]) =>
          G.worlds[id].name +
          " (" +
          y.hangars +
          " hangars, " +
          y.queued +
          " queued)",
      )
      .join(" · ")}</p>`;
  if (f.mission) {
    const m = G.combatMissions[f.mission.key];
    html += `<article class="build-card combat-active"><h3>Combat expedition underway</h3><p>${m.name} · ${f.mission.ships} fighters<br>${researchTime(f.mission.remaining)} remaining</p><div class="mission-progress" role="progressbar" aria-label="Combat expedition" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.floor((1 - f.mission.remaining / f.mission.total) * 100)}"><div style="width:${100 * (1 - f.mission.remaining / f.mission.total)}%"></div></div><p>Missions travel at full speed while away. Ship construction runs at 25% offline.</p></article>`;
  }
  html += '<p class="panel-kicker combat-section-label">COMBAT EXPEDITIONS</p>';
  for (const [key, m] of Object.entries(G.combatMissions)) {
    const field = document.querySelector(`[data-squadron="${key}"]`),
      ships = field ? Number(field.value) : Math.ceil(m.strength / 10),
      p = G.combatPreview(state, key, ships),
      unlocked = state.colonies.length >= m.worlds && f.victories >= m.wins;
    html += `<article class="build-card combat-target"><h3>${m.name}</h3><p>Enemy strength ${m.strength} · ${researchTime(m.duration)}<br>Recommended: ${Math.ceil(m.strength / 10)} fighters</p><p>Victory cargo: ${costText(m.rewards)}</p>${unlocked ? `<label class="squadron-label">Send fighters<input data-squadron="${key}" type="number" min="1" max="${Math.max(1, f.fighters)}" step="1" value="${ships}" aria-label="Fighters for ${m.name}"></label><p class="${p?.win ? "combat-favourable" : "combat-warning"}">${!p ? "Enter a whole number of fighters." : p.win ? "Victory expected · " + p.losses + " ships lost, " + p.survivors + " return." : "Defeat expected · " + p.losses + " ships lost; no cargo reward."}</p><button data-combat-mission="${key}" ${!p?.canDispatch ? "disabled" : ""}>Send combat expedition ↗</button>` : `<p class="combat-warning">Requires ${m.worlds} colonies and ${m.wins} victories.</p>`}</article>`;
  }
  if (f.reports.length)
    html += `<div class="combat-reports"><p class="panel-kicker">COMBAT REPORTS</p>${f.reports
      .slice()
      .reverse()
      .map(
        (r) =>
          `<article class="build-card"><h3>${r.win ? "Victory" : "Defeat"} · ${G.combatMissions[r.key].name}</h3><p>${r.ships} dispatched · ${r.losses} lost · ${r.ships - r.losses} returned<br>${r.win ? "Cargo delivered: " + costText(r.rewards) : "No cargo recovered."}</p></article>`,
      )
      .join("")}</div>`;
  return html;
}
// Mark first contact as seen and move the player into the newly unlocked Fleet tab.
function acknowledgeHostiles() {
  state.combat.announced = true;
  save();
  closeModal();
  tab = "combat";
  document
    .querySelectorAll("nav [data-tab]")
    .forEach((b) => b.classList.toggle("active", b.dataset.tab === "combat"));
  render();
}
document.addEventListener("click", (event) => {
  const b = event.target.closest("button");
  if (!b || b.disabled) return;
  if (b.id === "acknowledge-hostiles") acknowledgeHostiles();
  if (b.id === "build-hangar" && G.buildHangar(state)) {
    save();
    render();
    notify("Fleet hangar built. Queue fighters and check your solar capacity.");
  }
  if (
    b.dataset.queueFighters &&
    G.queueFighters(state, Number(b.dataset.queueFighters))
  ) {
    save();
    render();
    notify("Fighter construction queued.");
  }
  if (b.dataset.combatMission) {
    const key = b.dataset.combatMission,
      count = Number(document.querySelector(`[data-squadron="${key}"]`).value);
    if (G.sendCombatMission(state, key, count)) {
      save();
      render();
      notify("Squadron dispatched against " + G.combatMissions[key].name + ".");
    }
  }
});
document.addEventListener("change", (event) => {
  if (event.target.matches("[data-squadron]")) renderPanel();
});
setInterval(() => {
  if (startupPending) return;
  if (!state.combat.encountered) {
    knownCombatReports = state.combat.nextReport;
    return;
  }
  if (state.combat.nextReport > knownCombatReports) {
    knownCombatReports = state.combat.nextReport;
    save();
    const r = state.combat.reports.at(-1);
    if (r)
      notify(
        (r.win
          ? "Victory! Cargo delivered. "
          : "Squadron returned after defeat. ") +
          r.losses +
          " fighter" +
          (r.losses === 1 ? "" : "s") +
          " lost.",
      );
  }
  if (!state.combat.announced && !flying && $("modal").hidden) {
    state.combat.announced = true;
    save();
    openModal(
      '<p class="eyebrow">FIRST CONTACT / FIFTH COLONY</p><h2 id="modal-title">You are not alone.</h2><p>Helion’s scanners have detected the Hollow: an abandoned war fleet guarding the outer worlds. Their patrols carry valuable salvage.</p><p>Fleet hangars are now available. Build hangars, queue fighters, and send combat expeditions against increasingly powerful enemies. These missions are optional and separate from prestige expeditions.</p><button class="primary" id="acknowledge-hostiles">Open fleet command ↗</button>',
    );
  }
}, 500);
