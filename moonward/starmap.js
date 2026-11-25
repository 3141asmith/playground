/* Interactive orbital chart; gameplay still uses the engine's launch rules. */
// Inspecting a world does not visit it or bypass the engine?s launch requirements.
let selectedMapWorld = 0;
// Scroll the oversized chart so the selected world stays reachable on small screens.
function centerStarMap() {
  const windowEl = document.querySelector(".solar-chart-window"),
    planet = document.querySelector(`[data-map-world="${selectedMapWorld}"]`);
  if (!windowEl || !planet) return;
  windowEl.scrollTo({
    left: planet.offsetLeft - windowEl.clientWidth / 2,
    top: planet.offsetTop - windowEl.clientHeight / 2,
  });
}
// Show the required settlement order even though the chart arranges worlds around the sun.
function routeMarkup() {
  return `<div class="planet-route" aria-label="Required progression order">${G.worlds.map((w, id) => `<span class="${G.worldAccess(state, id).status}">${id + 1}. ${w.name}</span>`).join('<b aria-hidden="true">→</b>')}</div>`;
}
// Create the chart’s stable layout; updateStarMap supplies changing production and launch details.
function starMapMarkup() {
  // Fixed angles spread labels apart; this chart illustrates the system rather than simulating orbits.
  const angles = [-40, 140, 55, 210, -25, 140, -40, 210];
  const points = G.worlds.map((w, i) => {
    const a = (angles[i] * Math.PI) / 180;
    // Convert the 1000 ? 700 SVG positions to percentages for overlaid planet buttons.
    return [
      (500 + (90 + i * 52) * Math.cos(a)) / 10,
      (350 + (70 + i * 32) * Math.sin(a)) / 7,
    ];
  });
  const orbits = G.worlds
    .map(
      (w, i) =>
        `<ellipse cx="500" cy="350" rx="${90 + i * 52}" ry="${70 + i * 32}" opacity=".2"/>`,
    )
    .join("");
  // Deterministic star positions keep the background stable when the chart is reopened.
  const stars = Array.from(
    { length: 75 },
    (_, i) =>
      `<circle cx="${(i * 137.51) % 1000}" cy="${(i * 83.37) % 700}" r="${i % 7 === 0 ? 1.8 : 0.9}" fill="#bad2d2" opacity="${i % 3 === 0 ? 0.5 : 0.22}"/>`,
  ).join("");
  return `<div class="solar-heading"><p class="eyebrow">THE MOONWARD EXPEDITION / SECTOR 01</p><h2 id="modal-title">Your place among the stars.</h2><p>Swipe the chart or select a world to inspect its flight plan.</p><label class="map-select-label">DESTINATION <select id="map-destination" aria-label="Choose a world">${G.worlds.map((w, i) => `<option value="${i}">${i + 1}. ${w.name}${w.hazard ? " · hazardous" : ""}</option>`).join("")}</select></label>${routeMarkup()}<p class="route-guidance" id="route-guidance"></p></div><div class="solar-layout"><div class="solar-chart-window" tabindex="0" aria-label="Scrollable orbital chart. Swipe or scroll to explore eight worlds."><div class="solar-system" aria-label="Solar system with eight selectable worlds"><svg class="orbit-chart" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true">${stars}<g fill="none" stroke="#9ebdad" stroke-width="1.5">${orbits}</g></svg><div class="system-sun" aria-hidden="true"><span></span><small>SOL</small></div>${G.worlds.map((w, i) => `<button class="solar-world" data-map-world="${i}" style="--world-x:${points[i][0]}%;--world-y:${points[i][1]}%;--planet:${w.color}" aria-pressed="false" aria-label="Inspect ${w.name}"><span class="orbital-planet planet-${i}" aria-hidden="true"></span><strong>${w.name}</strong><small class="orbital-status"></small></button>`).join("")}<span class="solar-corner">MOONWARD SYSTEM<br>08 CHARTED WORLDS · SWIPE TO EXPLORE</span><span class="solar-scale">✦ NOT TO SCALE</span></div></div><section id="world-details" aria-label="Selected world details"></section></div><div class="solar-legend"><span><i></i> Colony established</span><span>○ Uncharted world</span><span>8 worlds · escalating rockets · protected drones</span></div>`;
}
// Refresh the selected world and route readiness without rebuilding the scrollable orbital chart.
function updateStarMap() {
  if ($("modal").hidden || !$("world-details")) return;
  const id = selectedMapWorld,
    w = G.worlds[id],
    c = state.colonies.find((c) => c.world === id),
    origin = id > 0 ? G.worlds[id - 1] : null,
    ready = G.canLaunch(state, id);
  document.querySelectorAll("[data-map-world]").forEach((button) => {
    const n = Number(button.dataset.mapWorld),
      colonised = state.colonies.some((c) => c.world === n);
    button.setAttribute("aria-pressed", String(n === id));
    button.classList.toggle("colonised", colonised);
    const access = G.worldAccess(state, n);
    button.classList.toggle("world-locked", access.status === "locked");
    button.classList.toggle(
      "next-world",
      access.status === "next" || access.status === "ready",
    );
    button.setAttribute(
      "aria-label",
      "Inspect " + G.worlds[n].name + ". " + access.reason,
    );
    button.querySelector(".orbital-status").textContent = colonised
      ? state.current === n
        ? "YOU ARE HERE"
        : "COLONY ONLINE"
      : access.status === "locked"
        ? "LOCKED"
        : access.status === "ready"
          ? "READY TO LAUNCH"
          : "NEXT DESTINATION";
  });
  let html = `<p class="panel-kicker">${w.type} / 0${id + 1}</p><h3>${w.name}<span>${c ? "COLONY ONLINE" : "UNCHARTED"}</span></h3><p class="world-flavour">${w.tag}.<br>Solar productivity: ${Math.round(G.solarProductivity(state, id) * 100)}% · ${Number((G.solarProductivity(state, id) * 10).toFixed(1))} kW per array</p>${w.hazard ? `<div class="map-hazard"><strong>⚠ ${w.hazard}</strong><p>${state.tech.includes(w.protectionTech) ? "✓ Drones protected" : "○ Requires " + G.techs[w.protectionTech].name}</p><small>Research on ${G.worlds[id - 1].name} before departure.</small></div>` : ""}`;
  const access = G.worldAccess(state, id);
  if (access.status === "locked")
    html += `<div class="planet-lock"><strong>🔒 PLANET LOCKED</strong><p>${access.reason}</p></div>`;
  else if (!c)
    html += `<div class="planet-next"><strong>NEXT DESTINATION</strong><p>${access.reason}</p></div>`;
  if (c) {
    html += `<div class="map-section-title">LIVE COLONY PRODUCTION</div>${w.resources.map((r) => `<div class="map-rate"><span style="color:${G.resources[r].color}">${G.resources[r].icon} ${G.resources[r].name}</span><strong>+${Number((c.assignments[r] * G.gathering(state)).toFixed(2))}/s</strong></div>`).join("")}<p class="map-drone-count">${c.drones} drones · ${G.idle(c)} available</p>`;
    const power = G.power(state, c);
    html += `<p class="map-hint">⚡ ${c.solar} arrays + ${c.fuelPlant} fuel plants · ${Number(power.generated.toFixed(1))} / ${Number(power.demand.toFixed(1))} kW · ${Math.floor(power.factor * 100)}% processor power<br>${Number(power.thermal.toFixed(1))} kW thermal · ${Number((power.burnRate * 60).toFixed(2))} ${G.resources[power.fuel].name}/min burned</p>`;
    html += w.buildings
      .map((key) => {
        const b = G.buildings[key],
          r = Object.keys(b.output)[0];
        return `<div class="map-processor"><span>${c[key]} × ${b.name}</span><small>Up to ${((c[key] / b.cycle) * G.bonuses(state).processing * G.power(state, c).factor).toFixed(2)} ${G.resources[r].name}/s</small></div>`;
      })
      .join("");
    html += `<button class="primary" data-visit="${id}">${state.current === id ? "Return to colony" : "Visit colony"} ↗</button><p class="map-hint">Production continues while you explore. Offline output runs at 25% for up to 8 hours.</p>`;
  } else {
    html += `<div class="map-section-title">RESOURCES TO DISCOVER</div><p class="map-discoveries">${w.resources.map((r) => G.resources[r].icon + " " + G.resources[r].name).join("<br>")}</p>`;
    if (origin) {
      html += `<div class="map-section-title">FLIGHT PLAN · FROM ${origin.name.toUpperCase()}</div><p class="map-research ${state.tech.includes(origin.rocketTech) ? "ready" : ""}">${state.tech.includes(origin.rocketTech) ? "✓" : "○"} ${G.techs[origin.rocketTech].name}</p>${Object.entries(
        origin.rocketCost,
      )
        .map(
          ([r, n]) =>
            `<div class="map-rate ${state.stock[r] >= n ? "ready" : ""}"><span>${G.resources[r].name}</span><strong>${format(state.stock[r])} / ${n}</strong></div>`,
        )
        .join("")}`;
    }
    html += `<button class="primary" data-settle="${id}" ${ready ? "" : "disabled"}>${ready ? (id === 0 ? "Launch first mission" : "Launch from " + origin.name) + " ↗" : access.status === "locked" ? "Locked · settle " + G.worlds[G.nextWorld(state)].name + " first" : "Prepare " + origin.name + " rocket"}</button>${origin && state.current !== id - 1 ? `<p class="map-hint">${state.colonies.some((c) => c.world === id - 1) ? "Visit" : "Establish"} ${origin.name} to prepare this departure.</p>` : ""}`;
  }
  syncPanel(html, $("world-details"));
  const route = $("route-guidance");
  if (route) {
    const next = G.nextWorld(state);
    route.textContent =
      next < 0
        ? "All eight worlds settled. Prepare your final expedition on Erebus."
        : "Next destination: " +
          G.worlds[next].name +
          ". " +
          G.worldAccess(state, next).reason;
  }
  const destination = $("map-destination");
  if (destination) {
    destination.value = String(selectedMapWorld);
    for (const option of destination.options) {
      const n = Number(option.value),
        a = G.worldAccess(state, n);
      option.textContent =
        n +
        1 +
        ". " +
        G.worlds[n].name +
        " · " +
        (a.status === "colony"
          ? "colonised"
          : a.status === "locked"
            ? "locked"
            : "next destination");
    }
  }
}
document.addEventListener("change", (event) => {
  if (event.target.id === "map-destination") {
    selectedMapWorld = Number(event.target.value);
    updateStarMap();
    centerStarMap();
  }
});
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-map-world]");
  if (button) {
    selectedMapWorld = Number(button.dataset.mapWorld);
    updateStarMap();
  }
});
// Refresh readiness while inspecting; updateStarMap exits immediately when the dialog is closed.
setInterval(updateStarMap, 500);
