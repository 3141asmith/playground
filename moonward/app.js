// DOM updates, player actions, scene setup, and optional ambient audio.
// Replace the current short-lived status message and restart its dismissal timer.
function notify(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 4000);
}
// Keep inventory numbers compact; exact fractional amounts remain available in detailed reports.
function format(n) {
  return n >= 10000
    ? (n / 1000).toFixed(1) + "k"
    : Math.floor(n).toLocaleString();
}
// Display a duration in minutes and seconds, rounding up so unfinished work never shows zero early.
function researchTime(seconds) {
  const n = Math.ceil(seconds);
  return Math.floor(n / 60) + "m " + String(n % 60).padStart(2, "0") + "s";
}
// Translate resource keys in an engine recipe into player-facing material names.
function costText(cost) {
  return Object.entries(cost)
    .map(([k, v]) => `${v} ${G.resources[k].name}`)
    .join(" · ");
}
// Resolve the viewed colony; before the first launch there is no colony yet.
function current() {
  return state.colonies.find((c) => c.world === state.current);
}
// Present the engine’s power calculation rather than maintaining a separate UI power model.
function renderPower() {
  const c = current();
  $("colony-power").hidden = !c;
  if (!c) return;
  const p = G.power(state, c),
    n = (v) => Number(v.toFixed(1));
  $("colony-power").classList.toggle("power-low", p.factor < 1);
  syncPanel(
    `<strong>⚡ COLONY POWER</strong><span>${c.solar} arrays · ${c.fuelPlant} fuel plants · ${Math.round(G.solarProductivity(state, c.world) * 100)}% sunlight</span><span>${n(p.generated)} kW generated / ${n(p.demand)} kW demand · ${n(p.solar)} solar + ${n(p.thermal)} fuel</span><b>${p.factor < 1 ? Math.floor(p.factor * 100) + "% output · add power or refuel plants" : "Processors fully powered"}</b>`,
    $("colony-power"),
  );
}
// Show the current world’s materials while calculating drone rates from all active colonies.
function inventory() {
  renderPower();
  const rates = {};
  for (const c of state.colonies)
    for (const [r, n] of Object.entries(c.assignments))
      rates[r] = (rates[r] || 0) + n * G.gathering(state);
  syncPanel(
    Object.entries(G.resources)
      .filter(([k]) =>
        [
          ...G.worlds[state.current].resources,
          ...G.worlds[state.current].products,
        ].includes(k),
      )
      .map(
        ([k, r]) =>
          `<div class="stock" data-stock="${k}" tabindex="0"><span class="mineral" style="--tone:${r.color}">${r.icon}</span><div><small>${r.name}</small><strong>${format(state.stock[k])}</strong>${rates[k] ? `<em>+${Number(rates[k].toFixed(2))}/s</em>` : ""}</div></div>`,
      )
      .join(""),
    $("inventory"),
  );
}
// Patch existing DOM nodes instead of replacing the panel, preserving focus and hover during refreshes.
function syncPanel(html, container = $("panel")) {
  const template = document.createElement("template");
  template.innerHTML = html;
  // Walk corresponding nodes recursively, updating only changed text, attributes and children.
  function sync(parent, source) {
    const old = [...parent.childNodes],
      fresh = [...source.childNodes];
    for (let i = 0; i < Math.max(old.length, fresh.length); i++) {
      const a = old[i],
        b = fresh[i];
      if (!b) {
        a.remove();
        continue;
      }
      if (!a) {
        parent.appendChild(b.cloneNode(true));
        continue;
      }
      if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) {
        a.replaceWith(b.cloneNode(true));
        continue;
      }
      if (a.nodeType === 3) {
        if (a.textContent !== b.textContent) a.textContent = b.textContent;
      } else if (a.nodeType === 1) {
        for (const at of [...a.attributes])
          if (at.name !== "aria-describedby" && !b.hasAttribute(at.name))
            a.removeAttribute(at.name);
        for (const at of [...b.attributes])
          if (a.getAttribute(at.name) !== at.value)
            a.setAttribute(at.name, at.value);
        sync(a, b);
      }
    }
  }
  sync(container, template.content);
}
// Refresh shared colony UI after an action; individual panels and the canvas have their own renderers.
function render() {
  $("fleet-tab").hidden = !state.combat.encountered;
  inventory();
  renderPanel();
  const active = state.started,
    w = G.worlds[state.current],
    c = current();
  $("world-name").textContent = active
    ? w.name + " outpost"
    : "Mission control";
  $("coordinates").textContent = active
    ? w.coords
    : "EARTH · LAUNCH COMPLEX 01";
  $("colony-count").textContent = state.colonies.length;
  $("sector").textContent = active ? w.coords : "YOUR JOURNEY STARTS HERE";
  $("scene-title").textContent = active
    ? "Your little corner of " + w.name + "."
    : "One small launch.";
  $("scene-copy").textContent = active
    ? "Use ▼ to recall drones, then ▲ to deploy them."
    : "A new world is waiting for its first visitor.";
  $("launch-panel").hidden = active || flying;
  $("resource-picker").hidden = !active || flying;
  $("drone-status").textContent = active
    ? `● ${c.drones - G.idle(c)} DEPLOYED · ${G.idle(c)} AVAILABLE`
    : "● FLIGHT SYSTEMS READY";
  $("sol").textContent =
    "MISSION DAY " +
    String(1 + Math.floor(state.elapsed / 120)).padStart(3, "0");
  if (active)
    syncPanel(
      w.resources
        .map(
          (r) =>
            `<div data-deposit="${r}" class="resource-box ${c.assignments[r] ? "active" : ""}"><strong>${G.resources[r].icon} ${G.resources[r].name}</strong><div class="deployment-controls"><button data-recall="${r}" aria-label="Recall one drone from ${G.resources[r].name}" ${c.assignments[r] === 0 ? "disabled" : ""}>▼</button><output aria-label="Drones deployed to ${G.resources[r].name}">${c.assignments[r]}</output><button data-resource="${r}" aria-label="Deploy one drone to ${G.resources[r].name}" ${G.idle(c) === 0 ? "disabled" : ""}>▲</button></div><small>${Number((c.assignments[r] * G.gathering(state)).toFixed(2))} / sec</small></div>`,
        )
        .join(""),
      $("resource-picker"),
    );
  $("tip").textContent = !active
    ? "Every great colony starts with a brave little launch."
    : `${w.name} has its own industry. Mine ${w.resources.map((r) => G.resources[r].name).join(", ")}, then research ${G.techs[w.techs.find((k) => !state.tech.includes(k)) || w.rocketTech].name}. See Mission for local rocket requirements.`;
}
// Reuse one dialog container for maps, help, offline receipts and progression screens.
function openModal(html) {
  $("modal")
    .querySelector(".modal")
    .classList.toggle("solar-modal", html.includes("solar-system"));
  $("modal-content").innerHTML = html;
  $("modal").hidden = false;
  $("close-modal").focus();
}
let modalReturn = null;
// Hide the shared dialog and restore keyboard focus to its opener when one was recorded.
function closeModal() {
  $("modal").hidden = true;
  if (modalReturn) modalReturn.focus();
  else $("map-button").focus();
}
// Open the orbital chart with the viewed colony selected, then centre it after the DOM exists.
function map() {
  modalReturn = document.activeElement;
  selectedMapWorld = state.current;
  openModal(starMapMarkup());
  updateStarMap();
  requestAnimationFrame(centerStarMap);
}
// Commit the engine action before playing the landing transition, so animation cannot award a second colony.
function launch(id) {
  if (flying) return;
  const first = !state.started;
  if (!G.settle(state, id))
    return notify(
      "Launch from the previous world with its local flight research and rocket materials.",
    );
  flying = true;
  $("modal").hidden = true;
  $("flight").hidden = false;
  $("launch-panel").hidden = true;
  save();
  setTimeout(
    () => {
      flying = false;
      $("flight").hidden = true;
      render();
      notify(
        first
          ? "Touchdown! Two drones are already gathering local resources."
          : "Welcome to " + G.worlds[id].name + ". Your new outpost is online.",
      );
    },
    matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 2200,
  );
}
// Record the final rocket launch and direct the player toward the prestige command screen.
function finishExpedition() {
  if (!G.expedition(state)) return;
  save();
  render();
  openModal(
    `<p class="eyebrow">MISSION ACCOMPLISHED</p><h2 id="modal-title">A little further than ever.</h2><p>Your Erebus-built rocket has reached deep space. You developed eight distinct worlds and launched ${state.expeditions} expedition${state.expeditions === 1 ? "" : "s"} beyond the charted system.</p><p>Your colonies remain active. Research the Wormhole Drive to begin a new expedition.</p><button class="primary" id="expedition-command">Open expedition command ↗</button>`,
  );
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b || b.disabled) return;
  if (b.dataset.researchView) {
    researchView = b.dataset.researchView;
    renderPanel();
  }
  if (b.dataset.tab) {
    tab = b.dataset.tab;
    document
      .querySelectorAll("nav button")
      .forEach((n) => n.classList.toggle("active", n === b));
    renderPanel();
  }
  if (b.dataset.build) {
    const name = G.buildings[b.dataset.build].name;
    if (G.build(state, b.dataset.build)) {
      save();
      render();
      notify(name + " ready for work.");
    }
  }
  if (b.dataset.research) {
    if (G.research(state, b.dataset.research)) {
      save();
      render();
      notify(G.techs[b.dataset.research].name + " research started.");
    }
  }
  if (b.dataset.resource || b.dataset.recall) {
    const r = b.dataset.resource || b.dataset.recall;
    if (G.adjust(state, r, b.dataset.recall ? -1 : 1)) {
      colonyScene.dispatch(r);
      save();
      render();
    }
  }
  if (b.dataset.visit !== undefined) {
    if (G.visit(state, Number(b.dataset.visit))) {
      closeModal();
      save();
      render();
    } else notify("This planet is locked. Settle it in route order first.");
  }
  if (b.dataset.settle !== undefined) launch(Number(b.dataset.settle));
  if (b.id === "choose-world") map();
  if (b.id === "launch-expedition") finishExpedition();
});
$("launch").onclick = () => launch(0);
$("map-button").onclick = map;
$("close-modal").onclick = closeModal;
$("modal").onclick = (e) => {
  if (e.target === $("modal")) closeModal();
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("modal").hidden) closeModal();
  if (e.key === "Tab" && !$("modal").hidden) {
    const elements = [
        ...$("modal").querySelectorAll("button:not(:disabled),a[href]"),
      ],
      first = elements[0],
      last = elements.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
$("help").onclick = () => {
  modalReturn = $("help");
  openModal(
    '<p class="eyebrow">THE COLONIST’S FIELD GUIDE</p><h2 id="modal-title">Small steps. New worlds.</h2>' +
      [
        [
          "01",
          "Launch to Selene. Your outpost arrives with two mining drones gathering iron.",
        ],
        [
          "02",
          "Use the down arrow to recall a drone, then the up arrow on another resource to deploy it. Keep iron, moon rock and water ice flowing.",
        ],
        [
          "03",
          "Research Metallurgy, then build a foundry. Research Cryochemistry and build a fuel refinery. Processing consumes raw resources automatically.",
        ],
        [
          "04",
          "Research Interplanetary flight. Build an alloy rocket on Selene, then develop each frontier world to build its next rocket. Research drone protection before visiting hazardous planets. Each world has its own research and processors.",
        ],
        [
          "05",
          "Every colony keeps producing. Progress saves on this browser; away time earns 25% production for up to eight hours.",
        ],
      ]
        .map(([n, t]) => `<div class="guide-step"><b>${n}</b><p>${t}</p></div>`)
        .join(""),
  );
};
let audioContext = null;
const audioNodes = [];
$("sound").onclick = () => {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
    audioNodes.length = 0;
    $("sound").setAttribute("aria-label", "Enable ambient sound");
    $("sound").style.color = "";
    return;
  }
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gain = audioContext.createGain();
    gain.gain.value = 0.018;
    gain.connect(audioContext.destination);
    [110, 164.81, 220].forEach((f) => {
      const o = audioContext.createOscillator();
      o.frequency.value = f;
      o.type = "sine";
      o.connect(gain);
      o.start();
      audioNodes.push(o);
    });
    $("sound").setAttribute("aria-label", "Disable ambient sound");
    $("sound").style.color = "var(--mint)";
  } catch {
    notify("Ambient audio is unavailable in this browser.");
  }
};
const colonyScene = new ColonyScene($("scene"), () => state);
$("scene").addEventListener("click", (event) => {
  if (flying) return;
  const rect = $("scene").getBoundingClientRect(),
    x = event.clientX - rect.left,
    y = event.clientY - rect.top;
  const deposit = colonyScene.deposits.find(
    (d) => Math.hypot(x - d.x, y - d.y) < d.radius,
  );
  if (deposit) {
    if (G.assign(state, deposit.resource)) {
      colonyScene.dispatch(deposit.resource);
      save();
      render();
      notify("Drone dispatched to " + G.resources[deposit.resource].name + ".");
    } else notify("All drones are already assigned here.");
  }
});
const motionButton = document.createElement("button");
motionButton.id = "drone-motion";
// Keep the animation toggle’s text and accessibility state consistent with the canvas setting.
function updateMotionButton() {
  motionButton.textContent = colonyScene.animate ? "Ⅱ Drones" : "▶ Drones";
  motionButton.setAttribute(
    "aria-label",
    colonyScene.animate ? "Pause drone animation" : "Play drone animation",
  );
  motionButton.setAttribute("aria-pressed", String(colonyScene.animate));
}
motionButton.onclick = () => {
  colonyScene.animate = !colonyScene.animate;
  updateMotionButton();
};
updateMotionButton();
$("map-button").before(motionButton);
const flightRocket = document.createElement("div");
flightRocket.className = "flight-rocket";
flightRocket.setAttribute("aria-hidden", "true");
$("flight").prepend(flightRocket);
if (location.hostname === "moonward.local") $("android-download").hidden = true;
render();
save();
