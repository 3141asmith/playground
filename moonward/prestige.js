/* Expedition management and the explicit, reviewable reset flow. */
let expeditionView = "upgrades";
let reviewedPrestigeReward = null;
const achievementNames = {
  "first-footprint": "First footprint",
  "system-pioneer": "System pioneer",
  "beyond-the-stars": "Beyond the stars",
  "new-horizons": "New horizons",
  "hollow-hunter": "Hollow hunter",
};
// Show persistent discovery progress, permanent upgrades and the requirements for a new run.
function openExpeditionCommand() {
  const m = state.meta,
    preview = G.prestigePreview(state),
    t = G.techs.wormhole,
    active = state.activeResearch?.key === "wormhole",
    ready = G.researchAllowed(state, t) && state.tech.includes(t.requires);
  let html = `<p class="eyebrow">EXPEDITION ${String(m.runs + 1).padStart(2, "0")} / ${m.system === "balanced" ? "HOME SYSTEM" : G.systems[m.system].name.toUpperCase()}</p><h2 id="modal-title">A new horizon awaits.</h2><div class="discovery-balance"><strong>${m.points}</strong><span>DISCOVERY POINTS<br>${m.totalPoints} earned across ${m.runs} prestige resets</span></div><div class="research-navigation"><button data-expedition-view="upgrades" aria-pressed="${expeditionView === "upgrades"}">Permanent upgrades</button><button data-expedition-view="journal" aria-pressed="${expeditionView === "journal"}">Expedition journal</button></div>`;
  if (expeditionView === "upgrades") {
    html +=
      '<p>Permanent upgrades survive resets and benefit every future expedition. Five ranks per upgrade; each rank costs twice the previous one.</p><div class="permanent-grid">';
    for (const [key, u] of Object.entries(G.permanentUpgrades)) {
      const rank = m.upgrades[key],
        cost = G.permanentCost(state, key);
      html += `<article class="build-card"><div class="card-head"><h3>${u.name}</h3><span class="level">${rank} / 5</span></div><p>${u.description}</p><button data-permanent="${key}" ${rank >= 5 || m.points < cost ? "disabled" : ""}>${rank >= 5 ? "Maximum rank" : "Upgrade"}<span>${rank >= 5 ? "✓" : cost + " DP"}</span></button></article>`;
    }
    html += "</div>";
  } else {
    const visited = [
        ...new Set([...m.visited, ...state.colonies.map((c) => c.world)]),
      ],
      research = [...new Set([...m.research, ...state.tech])];
    html += `<div class="journal-block"><h3>Worlds discovered · ${visited.length} / ${G.worlds.length}</h3><p>${visited.length ? visited.map((id) => G.worlds[id].name).join(" · ") : "Your first launch is still ahead."}</p><h3>Research archive · ${research.length} discoveries</h3><p>${research.length ? research.map((k) => G.techs[k].name).join(" · ") : "Completed research is recorded here."}</p><h3>Combat record</h3><p>${m.combatWins} lifetime victories against the Hollow.</p><h3>Achievements</h3><p>${m.achievements.length ? m.achievements.map((k) => "✦ " + achievementNames[k]).join("<br>") : "Launch your first colony to earn an achievement."}</p><h3>Past expeditions</h3>${
      m.history.length
        ? m.history
            .slice()
            .reverse()
            .map(
              (h) =>
                `<p>Expedition ${h.run}: +${h.reward} DP · ${h.worlds} worlds · ${h.research} technologies · ${h.system === "balanced" ? "Home system" : G.systems[h.system].name}</p>`,
            )
            .join("")
        : "<p>Completed prestige runs will appear here.</p>"
    }</div>`;
  }
  html += `<section class="prestige-gate"><h3>Wormhole Drive</h3><p>Launch a final rocket from Erebus this run, then complete this research. Your current colonies keep working until you explicitly confirm a reset.</p><p>${state.tech.includes("wormhole") ? "✓ Wormhole Drive complete" : active ? "Researching · " + researchTime(state.activeResearch.remaining) + " remaining" : costText(t.cost) + " · " + researchTime(G.researchDuration(state, "wormhole"))}</p><button id="research-wormhole" ${state.tech.includes("wormhole") || state.activeResearch || !ready || !G.canPay(state, t.cost) ? "disabled" : ""}>${state.tech.includes("wormhole") ? "Researched" : active ? "Research in progress" : !ready ? "Requires an Erebus launch and flight research" : "Research Wormhole Drive"}</button><p>${preview.eligible ? "Ready to begin a new expedition. Your exact reward is " + preview.reward + " Discovery Points." : "Prestige requires all eight colonies, an Erebus rocket launched this run, and a completed Wormhole Drive."}</p><button class="primary" id="preview-prestige" ${preview.eligible ? "" : "disabled"}>Review new expedition ${preview.eligible ? "· +" + preview.reward + " DP" : "↗"}</button></section>`;
  openModal(html);
}
// Present a read-only reward and reset preview before the separate confirmation action.
function previewPrestige() {
  const p = G.prestigePreview(state);
  if (!p.eligible) return;
  reviewedPrestigeReward = p.reward;
  openModal(
    `<p class="eyebrow">REVIEW YOUR NEXT EXPEDITION</p><h2 id="modal-title">Begin again. Go further.</h2><div class="discovery-balance"><strong>+${p.reward}</strong><span>DISCOVERY POINTS<br>Available after reset: ${state.meta.points + p.reward} DP</span></div><p>New worlds: ${p.worldPoints} DP · New technologies: ${p.researchPoints} DP · Completion: ${p.completion} DP${p.multiplier !== 1 ? " · " + p.multiplier + "× system reward" : ""}. Previously rewarded discoveries do not earn their novelty reward again.</p><div class="reset-comparison"><div><h3>Resets</h3><p>All colonies, buildings, drones, hangars, fighters, combat queues/missions, stored resources, ordinary research (including fleet upgrades), active research and mission time.</p></div><div><h3>You keep</h3><p>Discovery Points, permanent upgrade ranks, achievements, your world/research journal, expedition history and lifetime rocket launches.</p></div></div><fieldset class="system-choices"><legend>Choose the next system</legend>${Object.entries(
      G.systems,
    )
      .map(
        ([key, system], i) =>
          `<label><input type="radio" name="next-system" value="${key}" ${i === 0 ? "checked" : ""}><span><strong>${system.name}</strong><small>${system.description}</small></span></label>`,
      )
      .join(
        "",
      )}</fieldset><p>Your current expedition will be replaced. You will return to the launch pad and can spend Discovery Points before launching again.</p><button class="primary" id="confirm-prestige">Confirm reset & begin expedition ↗</button><button class="cancel-prestige" id="cancel-prestige">Keep playing this expedition</button>`,
  );
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  if (button.id === "expedition-command") openExpeditionCommand();
  if (button.dataset.expeditionView) {
    expeditionView = button.dataset.expeditionView;
    openExpeditionCommand();
  }
  if (button.dataset.permanent) {
    if (G.buyPermanent(state, button.dataset.permanent)) {
      save();
      render();
      openExpeditionCommand();
      notify(
        G.permanentUpgrades[button.dataset.permanent].name +
          " upgraded permanently.",
      );
    }
  }
  if (button.id === "research-wormhole") {
    if (G.research(state, "wormhole")) {
      save();
      render();
      openExpeditionCommand();
      notify("Wormhole Drive research started.");
    }
  }
  if (button.id === "preview-prestige") previewPrestige();
  if (button.id === "cancel-prestige") openExpeditionCommand();
  if (button.id === "confirm-prestige") {
    const system = document.querySelector(
        'input[name="next-system"]:checked',
      )?.value,
      reward = G.prestigePreview(state).reward;
    if (reward !== reviewedPrestigeReward) {
      previewPrestige();
      notify(
        "Your reward changed as research completed. Review the updated total before confirming.",
      );
      return;
    }
    if (G.prestige(state, system)) {
      lastTick = Date.now();
      knownResearch = 0;
      tab = "build";
      researchView = "industry";
      colonyScene.reset();
      document
        .querySelectorAll("nav [data-tab]")
        .forEach((n) =>
          n.classList.toggle("active", n.dataset.tab === "build"),
        );
      save();
      render();
      expeditionView = "upgrades";
      openExpeditionCommand();
      notify(
        "New expedition ready. Earned " +
          reward +
          " Discovery Points. Spend them, then launch!",
      );
    }
  }
});
setInterval(() => {
  if (!$("modal").hidden && $("research-wormhole")) {
    const p = G.prestigePreview(state);
    $("preview-prestige").disabled = !p.eligible;
    $("preview-prestige").textContent = p.eligible
      ? "Review new expedition · +" + p.reward + " DP"
      : "Review new expedition ↗";
    if (state.activeResearch?.key === "wormhole")
      $("research-wormhole").textContent =
        "Researching · " + researchTime(state.activeResearch.remaining);
    else if (state.tech.includes("wormhole")) {
      $("research-wormhole").textContent = "Wormhole Drive complete";
      $("research-wormhole").disabled = true;
    }
  }
}, 500);
