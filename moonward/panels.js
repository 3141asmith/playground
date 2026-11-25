// Colony panel presentation. Simulation rules live in engine.js.
// Separate world-specific industry projects from upgrades that benefit every colony.
function fleetResearchNavigation() {
  const b = G.bonuses(state);
  return `<div class="research-navigation"><button data-research-view="industry" aria-pressed="${researchView === "industry"}">Local industry</button><button data-research-view="fleet" aria-pressed="${researchView === "fleet"}">Fleet upgrades</button></div>${researchView === "fleet" ? `<div class="fleet-summary"><strong>ALL COLONIES · PERMANENT UPGRADES</strong><p>Travel ×${b.speed.toFixed(2)} · Mining ×${b.mining.toFixed(2)} · Processing ×${b.processing.toFixed(2)}</p><small>Total gathering ×${G.gathering(state).toFixed(2)}. Speed and mining bonuses combine. Upgrade tiers within each branch add together.</small></div>` : ""}`;
}
// Identify source planets for cross-world upgrade costs and highlight affordable ingredients.
function upgradeMaterials(t) {
  const origins = [
    ...new Set(
      Object.keys(t.cost).map(
        (r) =>
          G.worlds.find((w) => [...w.resources, ...w.products].includes(r))
            .name,
      ),
    ),
  ];
  return `<div class="upgrade-materials"><small>SUPPLY FROM ${origins.join(" + ")}</small>${Object.entries(
    t.cost,
  )
    .map(
      ([r, n]) =>
        `<span class="${state.stock[r] >= n ? "ready" : ""}">${G.resources[r].name}: ${format(state.stock[r])} / ${n}</span>`,
    )
    .join("")}</div>`;
}
// Build the selected tab from live state; disabled buttons explain missing requirements before an action.
function renderPanel() {
  let html = "";
  const c = current();
  if (tab === "build") {
    html =
      '<p class="panel-kicker">A PLACE TO CALL HOME</p><h2 class="panel-title">Little colony. Big plans.</h2><p class="panel-description">Put down roots, put your drones to work.<br>Good things take a little building.</p>';
    for (const [key, b] of Object.entries(G.buildings).filter(
      ([key, b]) =>
        key === "drone" ||
        key === "solar" ||
        key === "fuelPlant" ||
        b.world === state.current,
    )) {
      const unlocked = !b.tech || state.tech.includes(b.tech),
        cost = c ? G.buildCost(c, key, state) : b.cost;
      html += `<article class="build-card" ${key !== "drone" ? `data-processor="${key}" tabindex="0"` : ""}><div class="card-head"><span class="building-icon">${b.icon}</span><div><h3>${b.name}</h3><small>${unlocked ? "COLONY INFRASTRUCTURE" : "RESEARCH REQUIRED"}</small></div><span class="level">${c ? (key === "drone" ? c.drones : c[key]) : 0} built</span></div><p>${key === "solar" ? `Each array generates ${Number((10 * G.solarProductivity(state, state.current)).toFixed(1))} kW here (${Math.round(G.solarProductivity(state, state.current) * 100)}% sunlight).` : key === "fuelPlant" ? `Up to 40 kW per plant. Burns up to 1 ${G.resources[G.worlds[state.current].products[1]].name} / min to cover power deficits. Uses rocket fuel; no burn when solar covers demand.` : b.description}${b.powerDraw ? `<br>Power: ${Number((b.powerDraw * G.bonuses(state).processing).toFixed(1))} kW per processor.` : ""}</p><button data-build="${key}" ${!c || !unlocked || !G.canPay(state, cost) ? "disabled" : ""}>${unlocked ? "Build +" : "Locked"} <span>${unlocked ? costText(cost) : G.techs[b.tech].name}</span></button></article>`;
    }
  }
  if (tab === "research") {
    html =
      '<p class="panel-kicker">IDEAS INTO POSSIBILITIES</p><h2 class="panel-title">A brighter tomorrow.</h2><p class="panel-description">One project at a time. Materials are paid up front.<br>Research continues at full speed while away.</p>';
    html += fleetResearchNavigation();
    for (const [key, t] of Object.entries(G.techs).filter(([, t]) =>
      researchView === "fleet"
        ? t.category === "fleet"
        : t.world === state.current && !t.requiresExpedition,
    )) {
      const done = state.tech.includes(key),
        ready =
          (!t.requires || state.tech.includes(t.requires)) &&
          G.researchAllowed(state, t),
        active = state.activeResearch?.key === key,
        busy = !!state.activeResearch;
      const progress = active
        ? Math.min(
            100,
            100 *
              (1 -
                state.activeResearch.remaining /
                  (state.activeResearch.total ||
                    G.researchDuration(state, key))),
          )
        : done
          ? 100
          : 0;
      html += `<article class="build-card research-card"><div class="card-head"><span class="building-icon">${t.icon}</span><h3>${t.name}</h3><span class="level">${done ? "✓" : researchTime(G.researchDuration(state, key))}</span></div><p>${t.description}</p>${t.category === "fleet" ? upgradeMaterials(t) : ""}${active ? `<div class="research-status"><span>Researching</span><strong>${researchTime(state.activeResearch.remaining)} remaining</strong></div><div class="mission-progress" role="progressbar" aria-label="${t.name} research" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.floor(progress)}"><div style="width:${progress}%"></div></div>` : ""}<button data-research="${key}" ${done || !state.started || !ready || busy || !G.canPay(state, t.cost) ? "disabled" : ""}>${done ? "Researched" : active ? "In progress" : !ready ? (!G.researchAllowed(state, t) ? "Requires " + G.worlds[t.requiresWorld].name + " colony" : "Requires " + G.techs[t.requires].name) : busy ? "Lab busy" : "Start research"}<span>${done ? "✓" : active ? Math.floor(progress) + "%" : costText(t.cost)}</span></button></article>`;
    }
  }
  if (tab === "combat") html = fleetPanelMarkup();
  if (tab === "mission") {
    const w = G.worlds[state.current],
      last = state.current === G.worlds.length - 1,
      next = G.worlds[state.current + 1],
      alreadyNext =
        !last && state.colonies.some((c) => c.world === state.current + 1),
      unlocked = state.tech.includes(w.rocketTech);
    const progress = Math.min(
      1,
      ...Object.entries(w.rocketCost).map(([k, n]) => state.stock[k] / n),
    );
    html = `<p class="panel-kicker">${w.name.toUpperCase()} DEPARTURE PROGRAM</p><h2 class="panel-title">${last ? "Beyond the charted stars." : "Next stop: " + next.name + "."}</h2><p class="panel-description">${last ? "Build an antimatter rocket for the final deep-space expedition." : "Develop " + w.name + " to build the rocket for " + next.name + "."} This rocket needs materials made here.</p><div class="mission-progress"><div style="width:${progress * 100}%"></div></div>`;
    for (const [k, n] of Object.entries(w.rocketCost))
      html += `<div class="mission-cost ${state.stock[k] >= n ? "ready" : ""}"><span>${G.resources[k].icon} ${G.resources[k].name}</span><span>${format(state.stock[k])} / ${n}</span></div>`;
    html += `<p class="panel-description">${unlocked ? "✓" : "Research required:"} ${G.techs[w.rocketTech].name}<br>${last ? state.expeditions + " deep-space expeditions launched." : "Launch from " + w.name + ". Earlier colonies cannot build this rocket for you."}</p>`;
    if (next?.hazard)
      html += `<div class="map-hazard"><strong>⚠ ${next.hazard}</strong><p>${state.tech.includes(next.protectionTech) ? "✓ Protection researched" : "Required before launch: " + G.techs[next.protectionTech].name}</p><small>Research on ${w.name} using local materials.</small></div>`;
    html += last
      ? `<button class="primary" id="launch-expedition" ${!unlocked || !G.canPay(state, w.rocketCost) ? "disabled" : ""}>Launch deep-space expedition ↗</button>`
      : `<button class="primary" id="choose-world">${alreadyNext ? "Visit your colonies" : "View route to " + next.name} ↗</button>`;
    html += `<button class="expedition-link" id="expedition-command">✧ Expedition command · ${state.meta.points} Discovery Points</button>`;
  }
  syncPanel(html);
}
