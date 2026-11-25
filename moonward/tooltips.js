/* Shared hover, keyboard-focus and tap details for colony production. */
(() => {
  const tip = document.createElement("div");
  tip.id = "production-tooltip";
  tip.role = "tooltip";
  tip.hidden = true;
  document.body.append(tip);
  let target = null,
    point = null,
    described = null,
    touchMode = false;
  const rate = (n) => Number(n.toFixed(2)).toLocaleString();
  // Dismiss the tooltip and remove its accessibility link from the previously described element.
  function hide() {
    tip.hidden = true;
    target = null;
    if (described) {
      described.removeAttribute("aria-describedby");
      described = null;
    }
    $("scene").style.cursor = "";
  }
  // Build live production details for a resource, processor or utility using engine rates and power.
  function describe(item) {
    const colony = current();
    if (!state.started || !colony) return "";
    const bonuses = G.bonuses(state),
      gatherRate = G.gathering(state);
    if (item.kind === "hangar") {
      const yard = state.combat.yards[state.current],
        count = yard?.hangars || 0,
        grid = G.power(state, colony);
      return `<strong>Fleet hangars</strong><p>${count} hangars · ${yard?.queued || 0} fighters queued</p><p class="tooltip-rate">Construction: up to ${rate((count * bonuses.processing * grid.factor) / 2)} fighters / min</p><p>Power demand: ${rate(count * 8 * bonuses.processing)} kW · ${Math.floor(grid.factor * 100)}% supplied</p><small>Base construction: 120 powered seconds per fighter. Hangars build in parallel.</small>`;
    }
    if (item.kind === "resource") {
      const r = G.resources[item.key],
        colonies = item.global ? state.colonies : [colony];
      const recipe = Object.entries(G.buildings).find(
        ([, b]) => b.output?.[item.key],
      );
      if (recipe) {
        const [key, b] = recipe,
          count = colonies.reduce((sum, c) => sum + c[key], 0),
          capacity =
            ((colonies.reduce(
              (sum, c) => sum + c[key] * G.power(state, c).factor,
              0,
            ) *
              b.output[item.key]) /
              b.cycle) *
            bonuses.processing;
        return `<strong>${r.icon} ${r.name}</strong><small>${item.global ? "ALL COLONIES" : "THIS COLONY"}</small><p>${count} ${b.name} processors built</p><p class="tooltip-rate">Output: up to ${rate(capacity)} / sec · ${rate(capacity * 60)} / min</p><small>Base recipe: ${b.description}<br>Offline capacity: ${rate(capacity * 0.25)} / sec</small>`;
      }
      const drones = colonies.reduce(
        (sum, c) => sum + (c.assignments[item.key] || 0),
        0,
      );
      return `<strong>${r.icon} ${r.name}</strong><small>${item.global ? "ALL COLONIES" : "THIS COLONY"}</small><p>${drones} mining drone${drones === 1 ? "" : "s"} assigned</p><p class="tooltip-rate">Gathering: ${rate(drones * gatherRate)} / sec · ${rate(drones * gatherRate * 60)} / min</p><small>${drones ? rate(gatherRate) + " resources / sec per drone" : "Assign a drone to begin gathering."}<br>Offline gathering: ${rate(drones * gatherRate * 0.25)} / sec</small>`;
    }
    const key = item.key,
      b = G.buildings[key],
      count = colony[key],
      grid = G.power(state, colony);
    if (key === "fuelPlant")
      return `<strong>Fuel power plants</strong><p>${count} plants - ${rate(grid.capacity)} kW installed capacity</p><p class="tooltip-rate">Generating: ${rate(grid.thermal)} kW<br>Burning: ${rate(grid.burnRate * 60)} ${G.resources[grid.fuel].name} / min</p><small>Stock: ${rate(state.stock[grid.fuel])} ${G.resources[grid.fuel].name}<br>40 kW per plant; 1 fuel/min at full output. Burns only to cover the solar deficit. Fuel shortages reduce power.</small>`;
    if (key === "solar")
      return `<strong>Solar arrays</strong><p>${count} arrays built · ${Math.round(G.solarProductivity(state, colony.world) * 100)}% solar productivity</p><p class="tooltip-rate">Generation: ${rate(grid.solar)} kW<br>Processor demand: ${rate(grid.demand)} kW</p><small>Each array: ${rate(10 * G.solarProductivity(state, colony.world))} kW here.<br>Power supports ${Math.floor(grid.factor * 100)}% processor output.</small>`;
    const output = Object.keys(b.output)[0];
    const limited = Object.keys(b.input).some(
      (input) =>
        state.stock[input] < b.input[input] &&
        state.colonies.reduce(
          (sum, c) => sum + (c.assignments[input] || 0) * gatherRate,
          0,
        ) <
          state.colonies.reduce(
            (sum, c) =>
              sum +
              G.worlds[c.world].buildings.reduce(
                (n, k) =>
                  n +
                  ((c[k] * (G.buildings[k].input[input] || 0)) /
                    G.buildings[k].cycle) *
                    bonuses.processing *
                    G.power(state, c).factor,
                0,
              ),
            0,
          ),
    );
    const inputs = Object.entries(b.input)
      .map(
        ([r, n]) =>
          `${rate(((count * n) / b.cycle) * bonuses.processing * grid.factor)} ${G.resources[r].name} / sec`,
      )
      .join(" + ");
    return `<strong>${b.name}</strong><small>THIS COLONY</small><p>${count} processor${count === 1 ? "" : "s"} built</p><p class="tooltip-rate">Output: up to ${rate((count / b.cycle) * bonuses.processing * grid.factor)} ${G.resources[output].name} / sec<br>${rate(((count * 60) / b.cycle) * bonuses.processing * grid.factor)} / min at full capacity</p><p>Input: ${inputs}</p><p>Power demand: ${rate(count * b.powerDraw * bonuses.processing)} kW · ${Math.floor(grid.factor * 100)}% supplied</p><small>Base recipe: ${b.description}${limited && count ? "<br>Input limited — gather more local raw materials." : ""}<br>Offline capacity: ${rate((count / b.cycle) * 0.25 * bonuses.processing * grid.factor)} / sec</small>`;
  }
  // Refresh tooltip content and placement while its target remains valid.
  function update() {
    if (!target) return;
    if (flying || !$("modal").hidden || target.world !== state.current) {
      hide();
      return;
    }
    const html = describe(target);
    if (!html) {
      hide();
      return;
    }
    if (tip.innerHTML !== html) tip.innerHTML = html;
    tip.hidden = false;
    const width = tip.offsetWidth,
      height = tip.offsetHeight;
    tip.style.left =
      Math.max(8, Math.min(innerWidth - width - 8, point.x + 14)) + "px";
    const y = point.y + 18;
    tip.style.top =
      Math.max(8, y + height <= innerHeight - 8 ? y : point.y - height - 14) +
      "px";
  }
  // Record the pointer or focused element so one tooltip can serve mouse, keyboard and touch input.
  function show(item, x, y, element) {
    if (described && described !== element)
      described.removeAttribute("aria-describedby");
    described = element || null;
    if (described) described.setAttribute("aria-describedby", tip.id);
    target = { ...item, world: state.current };
    point = { x, y };
    update();
  }
  // Translate a DOM card or inventory item into a resource/processor tooltip target.
  function elementTarget(element) {
    const hangar = element.closest("[data-hangar]");
    if (hangar) return { kind: "hangar", element: hangar };
    const resource = element.closest("[data-deposit]");
    if (resource)
      return {
        kind: "resource",
        key: resource.dataset.deposit,
        element: resource,
      };
    const stock = element.closest("[data-stock]");
    if (stock)
      return {
        kind: "resource",
        key: stock.dataset.stock,
        global: true,
        element: stock,
      };
    const processor = element.closest("[data-processor]");
    if (processor)
      return {
        kind: "processor",
        key: processor.dataset.processor,
        element: processor,
      };
    return null;
  }
  // Hit-test canvas objects because drawn deposits and buildings are not separate DOM elements.
  function sceneTarget(event) {
    const rect = $("scene").getBoundingClientRect(),
      x = event.clientX - rect.left,
      y = event.clientY - rect.top;
    const processor = [
      ...colonyScene.processors,
      ...colonyScene.utilities,
    ].find((p) => Math.hypot(x - p.x, y - p.y) < p.radius);
    if (processor)
      return {
        kind: processor.key === "hangar" ? "hangar" : "processor",
        key: processor.key,
      };
    const deposit = colonyScene.deposits.find(
      (p) => Math.hypot(x - p.x, y - p.y) < p.radius,
    );
    return deposit ? { kind: "resource", key: deposit.resource } : null;
  }
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const item =
      event.target === $("scene")
        ? sceneTarget(event)
        : elementTarget(event.target);
    if (item) {
      show(item, event.clientX, event.clientY, item.element);
      if (event.target === $("scene")) $("scene").style.cursor = "pointer";
    } else hide();
  });
  document.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    const item =
      event.target === $("scene")
        ? sceneTarget(event)
        : elementTarget(event.target);
    if (item) {
      show(item, event.clientX, event.clientY, item.element);
      setTimeout(update, 0);
    } else hide();
  });
  document.addEventListener("focusin", (event) => {
    const item = elementTarget(event.target);
    if (item) {
      const rect = item.element.getBoundingClientRect();
      show(item, rect.left, rect.bottom, item.element);
    } else hide();
  });
  document.addEventListener("focusout", (event) => {
    if (
      !event.relatedTarget &&
      event.target.matches("[data-resource],[data-recall]")
    )
      return;
    hide();
  });
  document.addEventListener("click", (event) => {
    const item = elementTarget(event.target);
    if (item) {
      const rect = item.element.getBoundingClientRect();
      show(
        item,
        event.clientX || rect.left,
        event.clientY || rect.bottom,
        item.element,
      );
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hide();
  });
  document.documentElement.addEventListener("pointerleave", hide);
  document.addEventListener("pointerdown", (event) => {
    touchMode = event.pointerType === "touch" || event.pointerType === "pen";
  });
  window.addEventListener(
    "scroll",
    () => {
      if (touchMode && target && described?.isConnected) {
        const rect = described.getBoundingClientRect();
        point = { x: rect.left, y: rect.bottom };
        update();
      } else hide();
    },
    true,
  );
  window.addEventListener("resize", hide);
  setInterval(update, 250);
})();
