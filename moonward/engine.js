(function (root) {
  "use strict";
  // Shorthand: s = whole save state, c = one colony, r = resource key.
  // Stock is shared between worlds; buildings and drone assignments are local.
  // Content definitions: resources, worlds, buildings, and research.
  const resources = {
    iron: { name: "Iron ore", icon: "◆", color: "#d99778" },
    rock: { name: "Moon rock", icon: "⬟", color: "#b6b9bc" },
    ice: { name: "Water ice", icon: "◈", color: "#92cddb" },
    metal: { name: "Alloy", icon: "▰", color: "#c9d8bd" },
    fuel: { name: "Fuel", icon: "◒", color: "#e7c27f" },
    crystal: { name: "Crystal", icon: "✦", color: "#beabe1" },
  };
  const worlds = [
    {
      name: "Selene",
      type: "MOON",
      tag: "A quiet beginning",
      color: "#b6bfaf",
      resources: ["iron", "rock", "ice"],
      coords: "SECTOR 01 · LUNAR HIGHLANDS",
    },
    {
      name: "Ember",
      type: "VOLCANIC PLANET",
      tag: "A warmer welcome",
      color: "#e49770",
      resources: ["iron", "rock", "crystal"],
      coords: "SECTOR 02 · CINDER BASIN",
    },
    {
      name: "Nacre",
      type: "FROZEN PLANET",
      tag: "Beyond the blue",
      color: "#85c9d4",
      resources: ["ice", "crystal", "iron"],
      coords: "SECTOR 03 · FROST FRONTIER",
    },
  ];
  const buildings = {
    drone: {
      name: "Mining drone",
      icon: "▣",
      description: "One more pair of wheels. Collects 1 resource / second.",
      cost: { iron: 12, rock: 8 },
    },
    smelter: {
      name: "Alloy foundry",
      icon: "♜",
      description: "Turns 2 iron ore into 1 alloy every 4 seconds.",
      cost: { iron: 20, rock: 15 },
      tech: "smelting",
    },
    refinery: {
      name: "Fuel refinery",
      icon: "♧",
      description: "Turns 2 water ice into 1 fuel every 4 seconds.",
      cost: { metal: 10, rock: 20 },
      tech: "chemistry",
    },
  };
  const techs = {
    smelting: {
      name: "Metallurgy",
      duration: 60,
      icon: "◇",
      description:
        "Unlock the alloy foundry. Stronger materials, bigger ideas.",
      cost: { iron: 15, rock: 10 },
    },
    chemistry: {
      name: "Cryochemistry",
      duration: 180,
      icon: "◈",
      description: "Unlock the fuel refinery. Turn water ice into rocket fuel.",
      cost: { metal: 8, ice: 10 },
      requires: "smelting",
    },
    rocketry: {
      name: "Interplanetary flight",
      duration: 600,
      icon: "↗",
      description: "Unlock colony rockets and chart a course to new worlds.",
      cost: { metal: 15, fuel: 10 },
      requires: "chemistry",
    },
  };
  const rocketCost = { metal: 40, fuel: 30, rock: 30 };
  // World-specific progression data. Resource cargo remains shared between colonies.
  Object.assign(resources, {
    basalt: { name: "Basalt", icon: "⬟", color: "#b47f66" },
    sulfur: { name: "Sulfur", icon: "◆", color: "#ebd376" },
    ceramic: { name: "Heat ceramic", icon: "▰", color: "#e2b18c" },
    plasma: { name: "Plasma cells", icon: "◒", color: "#f79a70" },
    frost: { name: "Frost quartz", icon: "◈", color: "#9ce1df" },
    cobalt: { name: "Cobalt", icon: "◆", color: "#82a5e2" },
    xenon: { name: "Xenon clathrate", icon: "⬟", color: "#c4ade8" },
    superconductor: { name: "Superconductors", icon: "▰", color: "#acded7" },
    ionfuel: { name: "Ion fuel", icon: "◒", color: "#c7b6f4" },
  });
  Object.assign(worlds[0], {
    products: ["metal", "fuel"],
    buildings: ["smelter", "refinery"],
    techs: ["smelting", "chemistry", "rocketry"],
    rocketTech: "rocketry",
    rocketCost,
    droneCost: { iron: 12, rock: 8 },
  });
  Object.assign(worlds[1], {
    resources: ["basalt", "sulfur", "crystal"],
    products: ["ceramic", "plasma"],
    buildings: ["kiln", "plasmaForge"],
    techs: ["ceramics", "plasmaPhysics", "thermalFlight"],
    rocketTech: "thermalFlight",
    rocketCost: { ceramic: 50, plasma: 40, crystal: 35 },
    droneCost: { basalt: 16, sulfur: 10 },
  });
  Object.assign(worlds[2], {
    resources: ["frost", "cobalt", "xenon"],
    products: ["superconductor", "ionfuel"],
    buildings: ["cryoforge", "ionRefinery"],
    techs: ["superconductivity", "ionChemistry", "deepSpace"],
    rocketTech: "deepSpace",
    rocketCost: { superconductor: 60, ionfuel: 50, cobalt: 40 },
    droneCost: { frost: 20, cobalt: 12 },
  });
  Object.assign(buildings.smelter, {
    world: 0,
    input: { iron: 2 },
    output: { metal: 1 },
    cycle: 4,
  });
  Object.assign(buildings.refinery, {
    world: 0,
    input: { ice: 2 },
    output: { fuel: 1 },
    cycle: 4,
  });
  Object.assign(buildings, {
    kiln: {
      world: 1,
      name: "Magma kiln",
      icon: "♜",
      description: "3 basalt → 1 heat ceramic every 6 seconds.",
      cost: { basalt: 30, sulfur: 15 },
      tech: "ceramics",
      input: { basalt: 3 },
      output: { ceramic: 1 },
      cycle: 6,
    },
    plasmaForge: {
      world: 1,
      name: "Plasma crucible",
      icon: "♧",
      description: "2 sulfur + 1 crystal → 1 plasma cell every 8 seconds.",
      cost: { ceramic: 12, crystal: 15 },
      tech: "plasmaPhysics",
      input: { sulfur: 2, crystal: 1 },
      output: { plasma: 1 },
      cycle: 8,
    },
    cryoforge: {
      world: 2,
      name: "Cryogenic forge",
      icon: "♜",
      description:
        "2 frost quartz + 1 cobalt → 1 superconductor every 8 seconds.",
      cost: { frost: 35, cobalt: 20 },
      tech: "superconductivity",
      input: { frost: 2, cobalt: 1 },
      output: { superconductor: 1 },
      cycle: 8,
    },
    ionRefinery: {
      world: 2,
      name: "Ion distillery",
      icon: "♧",
      description: "3 xenon clathrate → 1 ion fuel every 10 seconds.",
      cost: { superconductor: 15, xenon: 25 },
      tech: "ionChemistry",
      input: { xenon: 3 },
      output: { ionfuel: 1 },
      cycle: 10,
    },
  });
  for (const t of Object.values(techs)) t.world = 0;
  Object.assign(techs, {
    ceramics: {
      world: 1,
      name: "Volcanic ceramics",
      duration: 180,
      icon: "◇",
      description: "Unlock magma kilns to fire basalt into heat ceramic.",
      cost: { basalt: 25, sulfur: 15 },
    },
    plasmaPhysics: {
      world: 1,
      name: "Plasma containment",
      duration: 480,
      icon: "✦",
      description: "Unlock plasma crucibles to stabilise sulfur and crystal.",
      cost: { ceramic: 10, crystal: 20 },
      requires: "ceramics",
    },
    thermalFlight: {
      world: 1,
      name: "Thermal propulsion",
      duration: 900,
      icon: "↗",
      description: "Build a heat-shielded rocket from Ember to Nacre.",
      cost: { ceramic: 20, plasma: 12 },
      requires: "plasmaPhysics",
    },
    superconductivity: {
      world: 2,
      name: "Cryogenic conductors",
      duration: 300,
      icon: "◇",
      description: "Unlock cryogenic forges for frost quartz and cobalt.",
      cost: { frost: 30, cobalt: 20 },
    },
    ionChemistry: {
      world: 2,
      name: "Xenon ionisation",
      duration: 900,
      icon: "◈",
      description: "Unlock ion distilleries to refine xenon clathrate.",
      cost: { superconductor: 12, xenon: 25 },
      requires: "superconductivity",
    },
    deepSpace: {
      world: 2,
      name: "Deep-space navigation",
      duration: 1500,
      icon: "↗",
      description:
        "Build an ion rocket for an expedition beyond the charted worlds.",
      cost: { superconductor: 25, ionfuel: 15 },
      requires: "ionChemistry",
    },
  });
  const frontier = [
    {
      name: "Vesper",
      type: "TOXIC PLANET",
      color: "#9abd79",
      hazard: "Toxic atmosphere",
      protection: "Sealed drone chassis",
      raw: ["spore", "resin", "chlorite"],
      names: ["Spore ore", "Amber resin", "Chlorite"],
      products: ["biopolymer", "biofuel"],
      productNames: ["Biopolymer", "Biofuel"],
      factories: ["Polymer vat", "Biofuel digester"],
    },
    {
      name: "Helion",
      type: "IRRADIATED PLANET",
      color: "#cfad64",
      hazard: "Intense radiation",
      protection: "Radiation shielding",
      raw: ["uranite", "leadstone", "helium"],
      names: ["Uranite", "Leadstone", "Helium crystals"],
      products: ["shieldplate", "fusioncell"],
      productNames: ["Shield plating", "Fusion cells"],
      factories: ["Shielding foundry", "Fusion breeder"],
    },
    {
      name: "Abyss",
      type: "HIGH-PRESSURE PLANET",
      color: "#699db7",
      hazard: "Crushing atmospheric pressure",
      protection: "Pressure-rated hulls",
      raw: ["trenchore", "brine", "pearlstone"],
      names: ["Trench ore", "Dense brine", "Pearlstone"],
      products: ["pressurealloy", "hydrofuel"],
      productNames: ["Pressure alloy", "Hydrofuel"],
      factories: ["Abyssal forge", "Brine electrolyser"],
    },
    {
      name: "Zephyr",
      type: "STORM PLANET",
      color: "#b49cd7",
      hazard: "Electrical superstorms",
      protection: "Storm grounding grids",
      raw: ["stormglass", "fluxore", "aerogel"],
      names: ["Stormglass", "Flux ore", "Aero deposits"],
      products: ["fluxconductor", "stormcell"],
      productNames: ["Flux conductors", "Storm cells"],
      factories: ["Flux annealer", "Storm capacitor"],
    },
    {
      name: "Erebus",
      type: "CORROSIVE PLANET",
      color: "#ba7a91",
      hazard: "Corrosive acid atmosphere",
      protection: "Acid-proof drone armour",
      raw: ["voidore", "acidstone", "darkcrystal"],
      names: ["Void ore", "Acidstone", "Dark crystal"],
      products: ["voidalloy", "antimatter"],
      productNames: ["Void alloy", "Antimatter cells"],
      factories: ["Void furnace", "Antimatter stabiliser"],
    },
  ];
  for (const spec of frontier) {
    const i = worlds.length,
      [a, b, c] = spec.raw,
      [p, q] = spec.products,
      first = "process" + i,
      second = "refine" + i,
      flight = "flight" + i,
      protect = "protect" + i,
      kiln = "forge" + i,
      refinery = "refinery" + i;
    spec.raw.forEach(
      (key, j) =>
        (resources[key] = {
          name: spec.names[j],
          icon: ["◆", "⬟", "◈"][j],
          color: [spec.color, "#c4ba9c", "#a4cdd5"][j],
        }),
    );
    spec.products.forEach(
      (key, j) =>
        (resources[key] = {
          name: spec.productNames[j],
          icon: j ? "◒" : "▰",
          color: spec.color,
        }),
    );
    worlds.push({
      name: spec.name,
      type: spec.type,
      color: spec.color,
      tag: spec.hazard + " — prepare before landing",
      coords:
        "SECTOR 0" + (i + 1) + " · " + spec.name.toUpperCase() + " FRONTIER",
      resources: spec.raw,
      products: spec.products,
      buildings: [kiln, refinery],
      techs: [first, second, flight],
      rocketTech: flight,
      rocketCost: { [p]: 1, [q]: 1, [c]: 1 },
      droneCost: { [a]: 24 + i * 8, [b]: 16 + i * 5 },
      hazard: spec.hazard,
      protectionTech: protect,
    });
    buildings[kiln] = {
      world: i,
      name: spec.factories[0],
      icon: "♜",
      description: `3 ${spec.names[0]} + 1 ${spec.names[1]} → 1 ${spec.productNames[0]} every ${6 + i * 2} seconds.`,
      cost: { [a]: 40 + i * 10, [b]: 25 + i * 5 },
      tech: first,
      input: { [a]: 3, [b]: 1 },
      output: { [p]: 1 },
      cycle: 6 + i * 2,
    };
    buildings[refinery] = {
      world: i,
      name: spec.factories[1],
      icon: "♧",
      description: `3 ${spec.names[2]} → 1 ${spec.productNames[1]} every ${8 + i * 2} seconds.`,
      cost: { [p]: 20 + i * 8, [c]: 30 + i * 10 },
      tech: second,
      input: { [c]: 3 },
      output: { [q]: 1 },
      cycle: 8 + i * 2,
    };
    techs[first] = {
      world: i,
      name: spec.productNames[0] + " engineering",
      duration: 240 + i * 120,
      icon: "◇",
      description: "Unlock the " + spec.factories[0] + ".",
      cost: { [a]: 30 + i * 10, [b]: 20 + i * 5 },
    };
    techs[second] = {
      world: i,
      name: spec.productNames[1] + " synthesis",
      duration: 600 + i * 300,
      icon: "◈",
      description: "Unlock the " + spec.factories[1] + ".",
      cost: { [p]: 15 + i * 6, [c]: 25 + i * 10 },
      requires: first,
    };
    techs[flight] = {
      world: i,
      name: spec.name + " propulsion",
      duration: 600 + i * 600,
      icon: "↗",
      description:
        i === 7
          ? "Build the final deep-space rocket."
          : "Unlock the next frontier rocket.",
      cost: { [p]: 30 + i * 10, [q]: 20 + i * 8 },
      requires: second,
    };
    const previous = worlds[i - 1];
    techs[protect] = {
      world: i - 1,
      name: spec.protection,
      duration: 600 + i * 300,
      icon: "⬡",
      description: `Protect all drones against ${spec.hazard.toLowerCase()} on ${spec.name}. Required before departure.`,
      cost: {
        [previous.products[0]]: 20 + i * 10,
        [previous.products[1]]: 15 + i * 8,
      },
      requires: previous.rocketTech,
    };
    previous.techs.push(protect);
  }
  for (const [i, w] of worlds.entries()) {
    const keys = Object.keys(w.rocketCost);
    w.rocketCost = Object.fromEntries(
      keys.map((r, j) => [r, [40, 30, 30][j] * 2 ** i]),
    );
  }
  techs.deepSpace.description =
    "Unlock the ion rocket from Nacre to Vesper. Research Sealed drone chassis before departure.";
  // A hazardous colony can mine only after its required protection research is complete.
  function protectedWorld(s, id) {
    return (
      !worlds[id].protectionTech || s.tech.includes(worlds[id].protectionTech)
    );
  }
  const sunlight = [1, 1.3, 0.65, 0.45, 1.15, 0.3, 0.6, 0.2];
  worlds.forEach((w, i) => {
    w.solarEfficiency = sunlight[i];
    for (const [j, key] of w.buildings.entries())
      buildings[key].powerDraw = 6 + i * 2 + j * 2;
  });
  buildings.solar = {
    name: "Solar array",
    icon: "☀",
    description: "Generates 10 kW at 100% sunlight. Output varies by planet.",
    cost: { iron: 15, rock: 10 },
    utility: true,
  };
  buildings.fuelPlant = {
    name: "Fuel power plant",
    icon: "♨",
    description:
      "Supplies up to 40 kW by burning local processed fuel. Uses up to 1 fuel per minute; burns only to cover a power deficit.",
    cost: { metal: 50, rock: 40 },
    utility: true,
  };
  // Colony power allocation and production bonuses.
  // Compute one colony’s supply, fuel burn and shared processor power fraction for this time slice.
  function power(s, c, seconds = 1) {
    const solar = c.solar * 10 * solarProductivity(s, c.world),
      demand =
        worlds[c.world].buildings.reduce(
          (sum, k) => sum + c[k] * buildings[k].powerDraw,
          0,
        ) *
          bonuses(s).processing +
        8 * (s.combat?.yards[c.world]?.hangars || 0) * bonuses(s).processing,
      fuel = worlds[c.world].products[1],
      capacity = (c.fuelPlant || 0) * 40,
      // One fuel supplies 40 kW for 60 seconds (2,400 kW-seconds).
      // Limit generation by capacity, unmet demand and fuel available for this slice.
      thermal = Math.max(
        0,
        Math.min(
          capacity,
          demand - solar,
          ((s.stock[fuel] || 0) * 2400) / Math.max(seconds, 1e-9),
        ),
      ),
      generated = solar + thermal;
    return {
      solar,
      thermal,
      capacity,
      fuel,
      burnRate: thermal / 2400,
      generated,
      demand,
      factor: demand ? Math.min(1, generated / demand) : 1,
    };
  }
  const upgradeBranches = {
    speed: {
      names: [
        "Efficient drivetrains",
        "Cryogenic bearings",
        "Quantum traction",
      ],
      bonuses: [0.25, 0.35, 0.5],
      times: [120, 480, 1500],
      costs: [
        { iron: 40, rock: 25 },
        { ceramic: 60, superconductor: 40 },
        { pressurealloy: 200, stormcell: 150, voidalloy: 80 },
      ],
      worlds: [0, 2, 7],
      requires: "smelting",
    },
    mining: {
      names: [
        "Expanded cargo bays",
        "Bio-adaptive excavators",
        "Antimatter mining heads",
      ],
      bonuses: [0.25, 0.35, 0.4],
      times: [180, 720, 2100],
      costs: [
        { metal: 40, ice: 30 },
        { biopolymer: 80, plasma: 60 },
        { pressurealloy: 180, antimatter: 120 },
      ],
      worlds: [0, 3, 7],
      requires: "smelting",
    },
    processing: {
      names: [
        "Factory calibration",
        "Fusion automation",
        "Void assembly networks",
      ],
      bonuses: [0.2, 0.3, 0.5],
      times: [240, 900, 2700],
      costs: [
        { metal: 50, fuel: 30 },
        { shieldplate: 90, superconductor: 70 },
        { fluxconductor: 220, voidalloy: 180 },
      ],
      worlds: [0, 4, 7],
      requires: "chemistry",
    },
  };
  for (const [effect, branch] of Object.entries(upgradeBranches))
    for (let i = 0; i < 3; i++) {
      const key = effect + "Upgrade" + (i + 1),
        bonus = branch.bonuses[i];
      techs[key] = {
        world: null,
        category: "fleet",
        effect,
        bonus,
        requiresWorld: branch.worlds[i],
        name: branch.names[i],
        duration: branch.times[i],
        cost: branch.costs[i],
        requires: i ? effect + "Upgrade" + i : branch.requires,
        icon: effect === "speed" ? "↠" : effect === "mining" ? "▣" : "⚙",
        description:
          effect === "speed"
            ? `+${Math.round(bonus * 100)}% drone travel speed and gathering throughput across all colonies.`
            : effect === "mining"
              ? `+${Math.round(bonus * 100)}% mining output across all colonies.`
              : `+${Math.round(bonus * 100)}% processor speed across all colonies. Input consumption rises with output.`,
      };
    }
  // Combine prestige and research upgrades into the multipliers used by the simulation and UI.
  function bonuses(s) {
    const result = { speed: 1, mining: 1, processing: 1 };
    for (const key of s.tech) {
      const t = techs[key];
      if (t?.effect) result[t.effect] += t.bonus;
    }
    return result;
  }
  // Drone travel upgrades also improve mining throughput; this is output per assigned drone per second.
  function gathering(s) {
    const b = bonuses(s);
    return b.speed * b.mining * (s.meta?.system === "minerals" ? 1.25 : 1);
  }
  // Apply the world’s sunlight modifier and the selected expedition system’s solar conditions.
  function solarProductivity(s, id) {
    return (
      worlds[id].solarEfficiency *
      (1 + 0.15 * (s.meta?.upgrades.solar || 0)) *
      (s.meta?.system === "sunlight"
        ? 1.3
        : s.meta?.system === "discoveries"
          ? 0.8
          : 1)
    );
  }
  // Check colony ownership and special progression gates separately from payment and prerequisites.
  function researchAllowed(s, t) {
    if (t.requiresExpedition && !s.meta?.runLaunches) return false;
    return t.world === null
      ? s.colonies.some((c) => c.world === t.requiresWorld)
      : s.current === t.world;
  }
  const permanentUpgrades = {
    cargo: {
      name: "Expedition cargo",
      cost: 12,
      description:
        "+1 starting drone, 20 iron, 15 rock and 10 ice per rank on Selene.",
    },
    solar: {
      name: "Improved photovoltaics",
      cost: 10,
      description: "+15% solar generation per rank on every world.",
    },
    archives: {
      name: "Research archives",
      cost: 12,
      description: "+20% research speed per rank.",
    },
    equipment: {
      name: "Standardised equipment",
      cost: 10,
      description: "Drone and processor construction costs fall 6% per rank.",
    },
    atmosphere: {
      name: "Atmospheric expertise",
      cost: 8,
      description:
        "+30% research speed per rank for previously completed protection research.",
    },
  };
  const systems = {
    minerals: {
      name: "Mineral-rich system",
      description: "+25% mining output.",
    },
    sunlight: { name: "Bright-star system", description: "+30% solar output." },
    discoveries: {
      name: "Unstable frontier",
      description:
        "+25% Discovery Points; 20% less solar output and 25% longer protection research.",
    },
  };
  techs.wormhole = {
    world: 7,
    name: "Wormhole Drive",
    duration: 1800,
    icon: "✧",
    description:
      "Open the route to a new expedition. Requires an Erebus rocket launched this run.",
    cost: { voidalloy: 1000, antimatter: 800, fluxconductor: 400 },
    requires: "flight7",
    requiresExpedition: true,
  };
  // Persistent discovery rewards and prestige resets.
  // Create progression that survives prestige: discovery records, permanent upgrades and run history.
  function freshMeta() {
    return {
      points: 0,
      totalPoints: 0,
      runs: 0,
      upgrades: Object.fromEntries(
        Object.keys(permanentUpgrades).map((k) => [k, 0]),
      ),
      visited: [],
      research: [],
      claimedWorlds: [],
      claimedTechs: [],
      history: [],
      achievements: [],
      combatWins: 0,
      runLaunches: 0,
      system: "balanced",
    };
  }
  // Update the lifetime journal and achievements as milestones are reached.
  function recordDiscovery(s) {
    const m = s.meta;
    if (!m) return;
    m.visited = [...new Set([...m.visited, ...s.colonies.map((c) => c.world)])];
    m.research = [...new Set([...m.research, ...s.tech])];
    for (const [id, earned] of [
      ["first-footprint", m.visited.includes(0)],
      ["system-pioneer", m.visited.length === worlds.length],
      ["beyond-the-stars", s.expeditions > 0],
      ["new-horizons", m.runs > 0],
    ])
      if (earned && !m.achievements.includes(id)) m.achievements.push(id);
  }
  // Use the project’s base duration with applicable research-time and system modifiers.
  function researchDuration(s, key) {
    const t = techs[key],
      m = s.meta,
      protection = key.startsWith("protect"),
      archive = 1 + 0.2 * (m?.upgrades.archives || 0),
      expert =
        protection && m?.research.includes(key)
          ? 1 + 0.3 * m.upgrades.atmosphere
          : 1;
    return Math.ceil(
      (t.duration / archive / expert) *
        (protection && m?.system === "discoveries" ? 1.25 : 1),
    );
  }
  // Increase the Discovery Point price with each purchased rank.
  function permanentCost(s, key) {
    return Object.hasOwn(permanentUpgrades, key)
      ? permanentUpgrades[key].cost * 2 ** s.meta.upgrades[key]
      : Infinity;
  }
  // Validate the rank and balance before spending points and applying a permanent upgrade.
  function buyPermanent(s, key) {
    if (!Object.hasOwn(permanentUpgrades, key) || s.meta.upgrades[key] >= 5)
      return false;
    const cost = permanentCost(s, key);
    if (s.meta.points < cost) return false;
    s.meta.points -= cost;
    s.meta.upgrades[key]++;
    return true;
  }
  // Calculate reset rewards without changing state, so cancelling the preview is safe.
  function prestigePreview(s) {
    const m = s.meta,
      eligible =
        s.started &&
        s.colonies.length === worlds.length &&
        m.runLaunches > 0 &&
        s.tech.includes("wormhole");
    const worldPoints = s.colonies
        .filter((c) => !m.claimedWorlds.includes(c.world))
        .reduce((sum, c) => sum + 2 * (c.world + 1), 0),
      researchPoints =
        s.tech.filter((k) => !m.claimedTechs.includes(k)).length * 2,
      completion = 20 + Math.floor(s.tech.length / 5),
      multiplier = m.system === "discoveries" ? 1.25 : 1;
    return {
      eligible,
      worldPoints,
      researchPoints,
      completion,
      multiplier,
      reward: eligible
        ? Math.floor((worldPoints + researchPoints + completion) * multiplier)
        : 0,
    };
  }
  // Commit a prestige reset: retain meta progression and replace the ordinary colony run.
  function prestige(s, system) {
    const preview = prestigePreview(s);
    if (!preview.eligible || !Object.hasOwn(systems, system)) return false;
    recordDiscovery(s);
    const m = s.meta;
    m.points += preview.reward;
    m.totalPoints += preview.reward;
    m.runs++;
    m.claimedWorlds = [
      ...new Set([...m.claimedWorlds, ...s.colonies.map((c) => c.world)]),
    ];
    m.claimedTechs = [...new Set([...m.claimedTechs, ...s.tech])];
    m.history.push({
      run: m.runs,
      reward: preview.reward,
      system: m.system,
      worlds: s.colonies.length,
      research: s.tech.length,
    });
    m.history = m.history.slice(-20);
    m.runLaunches = 0;
    m.system = system;
    const launches = s.expeditions;
    Object.assign(s, fresh(), { meta: m, expeditions: launches });
    recordDiscovery(s);
    return true;
  }
  const combatMissions = {
    patrol: {
      name: "Hollow scout patrol",
      strength: 20,
      duration: 120,
      worlds: 5,
      wins: 0,
      rewards: { shieldplate: 35, fusioncell: 25, uranite: 80 },
    },
    raiders: {
      name: "Raider salvage convoy",
      strength: 50,
      duration: 300,
      worlds: 5,
      wins: 1,
      rewards: { biopolymer: 100, plasma: 80, shieldplate: 70 },
    },
    outpost: {
      name: "Hollow listening post",
      strength: 100,
      duration: 480,
      worlds: 6,
      wins: 2,
      rewards: { pressurealloy: 160, hydrofuel: 120, trenchore: 100 },
    },
    dreadnought: {
      name: "Storm dreadnought",
      strength: 180,
      duration: 720,
      worlds: 7,
      wins: 4,
      rewards: { fluxconductor: 260, stormcell: 200 },
    },
    hive: {
      name: "The Hollow command hive",
      strength: 300,
      duration: 1200,
      worlds: 8,
      wins: 6,
      rewards: { voidalloy: 450, antimatter: 350 },
    },
  };
  // Fighter construction, expeditions, and combat reports.
  // Keep fleet queues, active missions and returned reports in the save rather than in UI timers.
  function freshCombat() {
    return {
      encountered: false,
      announced: false,
      fighters: 0,
      yards: {},
      mission: null,
      reports: [],
      victories: 0,
      nextReport: 1,
    };
  }
  // Scale hangar construction costs using the selected world’s local materials.
  function hangarCost(s, id = s.current) {
    const w = worlds[id],
      n = s.combat.yards[id]?.hangars || 0;
    return {
      [w.products[0]]: Math.ceil(40 * 1.5 ** n),
      [w.products[1]]: Math.ceil(25 * 1.5 ** n),
      [w.resources[0]]: Math.ceil(50 * 1.5 ** n),
    };
  }
  // Require the hostile encounter and sufficient cargo before adding a powered construction hangar.
  function buildHangar(s) {
    if (
      !s.combat.encountered ||
      !s.colonies.some((c) => c.world === s.current) ||
      (s.combat.yards[s.current]?.hangars || 0) >= 100 ||
      !pay(s, hangarCost(s))
    )
      return false;
    const yard =
      s.combat.yards[s.current] ||
      (s.combat.yards[s.current] = { hangars: 0, queued: 0, progress: 0 });
    if (yard.hangars >= 100) return false;
    yard.hangars++;
    return true;
  }
  // Return the local-material bill for a requested batch of fighters.
  function fighterCost(s, id = s.current, count = 1) {
    const w = worlds[id];
    return {
      [w.products[0]]: 10 * count,
      [w.products[1]]: 8 * count,
      [w.resources[0]]: 15 * count,
    };
  }
  // Pay for fighters once when queued; construction progress is advanced later by the simulation.
  function queueFighters(s, count = 1) {
    const yard = s.combat.yards[s.current];
    if (
      !s.combat.encountered ||
      !yard?.hangars ||
      !Number.isInteger(count) ||
      count < 1 ||
      count > 20 ||
      yard.queued + count > 50 ||
      !pay(s, fighterCost(s, s.current, count))
    )
      return false;
    yard.queued += count;
    return true;
  }
  // Calculate the deterministic outcome and risk before the player commits ships.
  function combatPreview(s, key, ships) {
    const m = combatMissions[key];
    if (!m || !Number.isInteger(ships) || ships < 1 || ships > 10000)
      return null;
    const unlocked =
        s.combat.encountered &&
        s.colonies.length >= m.worlds &&
        s.combat.victories >= m.wins,
      win = ships * 10 >= m.strength,
      losses = win
        ? Math.min(ships, Math.floor(m.strength / 60))
        : Math.ceil(ships * 0.6);
    return {
      unlocked,
      canDispatch: unlocked && !s.combat.mission && ships <= s.combat.fighters,
      win,
      losses,
      survivors: ships - losses,
      strength: ships * 10,
      recommended: Math.ceil(m.strength / 10),
      rewards: win ? m.rewards : {},
    };
  }
  // Reserve the dispatched ships immediately so they cannot join a second mission.
  function sendCombatMission(s, key, ships) {
    const p = combatPreview(s, key, ships);
    if (!p?.canDispatch) return false;
    s.combat.fighters -= ships;
    const m = combatMissions[key];
    s.combat.mission = { key, ships, remaining: m.duration, total: m.duration };
    return true;
  }
  // Advance powered fighter construction and mission travel, then settle completed missions once.
  function advanceCombat(s, seconds, factor, grids) {
    const fleet = s.combat;
    if (!fleet.encountered) return;
    for (const [id, yard] of Object.entries(fleet.yards)) {
      if (!yard.queued) continue;
      const c = s.colonies.find((c) => c.world === Number(id));
      if (!c) continue;
      yard.progress +=
        seconds *
        factor *
        yard.hangars *
        bonuses(s).processing *
        (grids?.[c.world] || power(s, c)).factor;
      const completed = Math.min(yard.queued, Math.floor(yard.progress / 120));
      yard.queued -= completed;
      fleet.fighters += completed;
      yard.progress = yard.queued ? yard.progress - completed * 120 : 0;
    }
    const mission = fleet.mission;
    if (!mission) return;
    mission.remaining = Math.max(0, mission.remaining - seconds);
    if (mission.remaining) return;
    const p = combatPreview(s, mission.key, mission.ships);
    fleet.fighters += p.survivors;
    for (const [r, n] of Object.entries(p.rewards)) s.stock[r] += n;
    if (p.win) {
      fleet.victories++;
      s.meta.combatWins++;
      if (!s.meta.achievements.includes("hollow-hunter"))
        s.meta.achievements.push("hollow-hunter");
    }
    fleet.reports.push({
      id: fleet.nextReport++,
      key: mission.key,
      ships: mission.ships,
      win: p.win,
      losses: p.losses,
      rewards: { ...p.rewards },
    });
    fleet.reports = fleet.reports.slice(-20);
    fleet.mission = null;
  }
  // Reject malformed fleet data so invalid queues, ships or reports cannot enter a loaded session.
  function validCombat(s) {
    const f = s.combat;
    return !!(
      f &&
      typeof f.encountered === "boolean" &&
      typeof f.announced === "boolean" &&
      f.encountered === s.colonies.length >= 5 &&
      ["fighters", "victories"].every(
        (k) => Number.isSafeInteger(f[k]) && f[k] >= 0,
      ) &&
      Number.isSafeInteger(f.nextReport) &&
      f.nextReport >= 1 &&
      f.yards &&
      Object.entries(f.yards).every(
        ([id, y]) =>
          String(Number(id)) === id &&
          s.colonies.some((c) => c.world === Number(id)) &&
          Number.isInteger(y.hangars) &&
          y.hangars > 0 &&
          y.hangars <= 100 &&
          Number.isInteger(y.queued) &&
          y.queued >= 0 &&
          y.queued <= 50 &&
          Number.isFinite(y.progress) &&
          y.progress >= 0 &&
          y.progress < 120,
      ) &&
      (!f.mission ||
        (combatMissions[f.mission.key] &&
          Number.isInteger(f.mission.ships) &&
          f.mission.ships > 0 &&
          f.mission.ships <= 10000 &&
          Number.isFinite(f.mission.remaining) &&
          f.mission.remaining > 0 &&
          f.mission.remaining <= combatMissions[f.mission.key].duration &&
          f.mission.total === combatMissions[f.mission.key].duration)) &&
      Array.isArray(f.reports) &&
      f.reports.length <= 20 &&
      new Set(f.reports.map((r) => r.id)).size === f.reports.length &&
      f.reports.every(
        (r) =>
          Number.isSafeInteger(r.id) &&
          r.id > 0 &&
          r.id < f.nextReport &&
          combatMissions[r.key] &&
          typeof r.win === "boolean" &&
          Number.isInteger(r.ships) &&
          r.ships > 0 &&
          Number.isInteger(r.losses) &&
          r.losses >= 0 &&
          r.losses <= r.ships &&
          r.rewards &&
          Object.entries(r.rewards).every(
            ([key, n]) =>
              Object.hasOwn(resources, key) && Number.isFinite(n) && n >= 0,
          ),
      ) &&
      (f.encountered ||
        (!f.fighters &&
          !f.victories &&
          !f.mission &&
          !f.reports.length &&
          !Object.keys(f.yards).length))
    );
  }
  // Save state and player actions. These functions have no DOM dependencies.
  // Create a complete new-run save with defaults for every game subsystem.
  function fresh() {
    return {
      version: 7,
      combat: freshCombat(),
      meta: freshMeta(),
      started: false,
      current: 0,
      colonies: [],
      stock: Object.fromEntries(Object.keys(resources).map((k) => [k, 0])),
      tech: [],
      activeResearch: null,
      expeditions: 0,
      lastSeen: Date.now(),
      elapsed: 0,
    };
  }
  // Create one world’s local buildings, drone pool and resource assignments.
  function colony(world) {
    return {
      world,
      drones: 2,
      assignments: Object.fromEntries(
        worlds[world].resources.map((r, i) => [r, i === 0 ? 2 : 0]),
      ),
      ...Object.fromEntries(
        Object.keys(buildings)
          .filter((k) => k !== "drone")
          .map((k) => [k, 0]),
      ),
      solar: 2,
    };
  }
  // Cargo is shared across colonies; every resource in a recipe must be affordable.
  function canPay(s, cost) {
    return Object.entries(cost).every(([k, n]) => s.stock[k] >= n);
  }
  // Check the whole bill before deducting anything, preventing partial payment on failure.
  function pay(s, cost) {
    if (!canPay(s, cost)) return false;
    for (const [k, n] of Object.entries(cost)) s.stock[k] -= n;
    return true;
  }
  // Validate the local building unlock, pay its cost and update its count.
  function build(s, key) {
    const c = s.colonies.find((c) => c.world === s.current),
      b = buildings[key];
    if (
      !s.started ||
      !c ||
      !b ||
      (key !== "drone" &&
        key !== "solar" &&
        key !== "fuelPlant" &&
        b.world !== c.world) ||
      (b.tech && !s.tech.includes(b.tech))
    )
      return false;
    const cost = buildCost(c, key, s);
    if (!pay(s, cost)) return false;
    if (key === "drone") c.drones++;
    else c[key]++;
    return true;
  }
  // Derive the next building price from local development and applicable discounts.
  function buildCost(c, key, s) {
    const n =
        key === "drone"
          ? c.drones - 2
          : key === "solar"
            ? Math.max(0, c.solar - 2)
            : c[key],
      w = worlds[c.world],
      cost =
        key === "drone"
          ? w.droneCost
          : key === "fuelPlant"
            ? {
                [w.products[0]]: 50 + c.world * 10,
                [w.resources[1]]: 40 + c.world * 5,
              }
            : key === "solar"
              ? {
                  [w.resources[0]]: 15 + c.world * 3,
                  [w.resources[1]]: 10 + c.world * 2,
                }
              : buildings[key].cost;
    return Object.fromEntries(
      Object.entries(cost).map(([r, v]) => [
        r,
        Math.ceil(
          v *
            (key !== "solar" && key !== "fuelPlant"
              ? 1 - 0.06 * (s?.meta?.upgrades.equipment || 0)
              : 1) *
            Math.pow(key === "solar" ? 1.18 : 1.3, n),
        ),
      ]),
    );
  }
  // Start the single research slot, paying materials upfront and saving its remaining duration.
  function research(s, key) {
    const t = techs[key];
    if (
      !s.started ||
      !t ||
      !researchAllowed(s, t) ||
      s.activeResearch ||
      s.tech.includes(key) ||
      (t.requires && !s.tech.includes(t.requires)) ||
      !pay(s, t.cost)
    )
      return false;
    s.activeResearch = {
      key,
      remaining: researchDuration(s, key),
      total: researchDuration(s, key),
    };
    return true;
  }
  // Finish a timed project once and record the newly unlocked technology.
  function advanceResearch(s, seconds) {
    const project = s.activeResearch;
    if (!project) return;
    project.remaining = Math.max(0, project.remaining - seconds);
    if (project.remaining === 0) {
      s.tech.push(project.key);
      s.activeResearch = null;
      recordDiscovery(s);
    }
  }
  // Convenience action for selecting a deposit: deploy an available drone, or reassign one if needed.
  function assign(s, r) {
    const c = s.colonies.find((c) => c.world === s.current);
    if (!c || !(r in c.assignments) || !protectedWorld(s, c.world))
      return false;
    if (idle(c) > 0) {
      c.assignments[r]++;
      return true;
    }
    const donor = Object.keys(c.assignments)
      .filter((k) => k !== r && c.assignments[k] > 0)
      .sort((a, b) => c.assignments[b] - c.assignments[a])[0];
    if (!donor) return false;
    c.assignments[donor]--;
    c.assignments[r]++;
    return true;
  }
  // Unassigned drones remain in the colony’s pool and can be deployed elsewhere.
  function idle(c) {
    return (
      c.drones - Object.values(c.assignments).reduce((sum, n) => sum + n, 0)
    );
  }
  // Move exactly one drone between a deposit and the idle pool, respecting assignment limits.
  function adjust(s, r, delta) {
    const c = s.colonies.find((c) => c.world === s.current);
    if (!c || !(r in c.assignments) || ![-1, 1].includes(delta)) return false;
    if (delta === 1 && !protectedWorld(s, c.world)) return false;
    if (
      (delta === 1 && idle(c) <= 0) ||
      (delta === -1 && c.assignments[r] <= 0)
    )
      return false;
    c.assignments[r] += delta;
    return true;
  }
  // Find the first gap in the ordered route, including gaps in older saves.
  function nextWorld(s) {
    return worlds.findIndex((_, id) => !s.colonies.some((c) => c.world === id));
  }
  // Provide the UI’s lock status and explanation from the same progression rules used for launches.
  function worldAccess(s, id) {
    if (!Number.isInteger(id) || !worlds[id])
      return { status: "locked", reason: "Unknown world." };
    if (s.colonies.some((c) => c.world === id))
      return { status: "colony", reason: "Colony established." };
    const next = nextWorld(s);
    if (id !== next)
      return {
        status: "locked",
        reason:
          "Settle " + worlds[next].name + " first. Follow the route in order.",
      };
    if (id === 0)
      return { status: "next", reason: "Launch your first mission to Selene." };
    const origin = worlds[id - 1];
    if (s.current !== id - 1)
      return {
        status: "next",
        reason: "Visit " + origin.name + " to prepare this departure.",
      };
    if (!s.tech.includes(origin.rocketTech))
      return {
        status: "next",
        reason:
          "Research " +
          techs[origin.rocketTech].name +
          " on " +
          origin.name +
          ".",
      };
    if (!protectedWorld(s, id))
      return {
        status: "next",
        reason:
          "Research " +
          techs[worlds[id].protectionTech].name +
          " before departure.",
      };
    if (!canPay(s, origin.rocketCost))
      return {
        status: "next",
        reason: "Gather the rocket materials on " + origin.name + ".",
      };
    return {
      status: "ready",
      reason: "Rocket ready. Launch from " + origin.name + ".",
    };
  }
  // Switch the active view only to a world that already has a colony.
  function visit(s, id) {
    if (!Number.isInteger(id) || !s.colonies.some((c) => c.world === id))
      return false;
    s.current = id;
    return true;
  }
  // Require the next destination, correct departure colony, flight tech, protection and full rocket bill.
  function canLaunch(s, id) {
    if (
      !Number.isInteger(id) ||
      id < 0 ||
      id >= worlds.length ||
      s.colonies.some((c) => c.world === id) ||
      id !== nextWorld(s)
    )
      return false;
    if (!s.started) return id === 0;
    const origin = worlds[s.current];
    return (
      id === s.current + 1 &&
      s.colonies.some((c) => c.world === s.current) &&
      s.tech.includes(origin.rocketTech) &&
      protectedWorld(s, id) &&
      canPay(s, origin.rocketCost)
    );
  }
  // Commit a valid launch, pay its local rocket cost and establish the destination’s starter outpost.
  function settle(s, id) {
    if (!canLaunch(s, id)) return false;
    if (s.started) pay(s, worlds[s.current].rocketCost);
    s.started = true;
    s.current = id;
    s.colonies.push(colony(id));
    if (id === 0 && s.meta.upgrades.cargo) {
      const c = s.colonies.at(-1),
        rank = s.meta.upgrades.cargo;
      c.drones += rank;
      c.assignments.iron += rank;
      for (const [r, n] of Object.entries({ iron: 20, rock: 15, ice: 10 }))
        s.stock[r] += n * rank;
    }
    if (s.colonies.length >= 5) s.combat.encountered = true;
    recordDiscovery(s);
    return true;
  }
  // Spend the final world’s rocket cargo to record a deep-space launch without deleting colonies.
  function expedition(s) {
    const w = worlds[s.current];
    if (
      !s.started ||
      s.current !== worlds.length - 1 ||
      !s.tech.includes(w.rocketTech) ||
      !pay(s, w.rocketCost)
    )
      return false;
    s.expeditions++;
    s.meta.runLaunches++;
    recordDiscovery(s);
    return true;
  }
  // Advance simulation by real seconds; factor reduces production offline while research and travel use real time.
  function tick(s, seconds, factor = 1) {
    if (!s.started || seconds <= 0) return;
    // Split at research completion so new bonuses affect only time after unlocking.
    if (s.activeResearch && seconds > s.activeResearch.remaining) {
      const before = s.activeResearch.remaining;
      tick(s, before, factor);
      tick(s, seconds - before, factor);
      return;
    }
    // Small steps prevent plants using fuel their powered refineries have not made yet.
    if (seconds * factor > 1 && s.colonies.some((c) => c.fuelPlant > 0)) {
      let left = seconds;
      while (left > 1e-9) {
        const step = Math.min(left, 1 / factor);
        tick(s, step, factor);
        left -= step;
      }
      return;
    }
    // Snapshot power before burning fuel or producing materials for consistent accounting.
    const grids = Object.fromEntries(
      s.colonies.map((c) => [c.world, power(s, c, seconds * factor)]),
    );
    for (const c of s.colonies) {
      const grid = grids[c.world];
      s.stock[grid.fuel] = Math.max(
        0,
        s.stock[grid.fuel] - grid.burnRate * seconds * factor,
      );
    }
    const dt = seconds * factor,
      bns = bonuses(s),
      gatherRate = bns.speed * bns.mining;
    s.elapsed += dt;
    for (const c of s.colonies)
      if (protectedWorld(s, c.world))
        for (const [r, n] of Object.entries(c.assignments))
          s.stock[r] += n * dt * gatherRate;
    for (const c of s.colonies)
      for (const key of worlds[c.world].buildings) {
        const b = buildings[key];
        let cycles =
          ((c[key] * dt) / b.cycle) * bns.processing * grids[c.world].factor;
        for (const [r, n] of Object.entries(b.input))
          // The scarcest ingredient limits the complete recipe; fractional cycles keep output smooth.
          cycles = Math.min(cycles, s.stock[r] / n);
        for (const [r, n] of Object.entries(b.input))
          s.stock[r] = Math.max(0, s.stock[r] - cycles * n);
        for (const [r, n] of Object.entries(b.output)) s.stock[r] += cycles * n;
      }
    advanceCombat(s, seconds, factor, grids);
    advanceResearch(s, seconds);
  }
  // Offline production uses the same simulation at one quarter speed.
  // Cap away time at eight hours and report net stock differences, including consumed inputs and fuel.
  function offline(s, now = Date.now()) {
    const seconds = Math.min(28800, Math.max(0, (now - s.lastSeen) / 1000));
    const before = { ...s.stock };
    tick(s, seconds, 0.25);
    s.lastSeen = now;
    return {
      seconds,
      gains: Object.fromEntries(
        Object.keys(resources).map((k) => [k, s.stock[k] - before[k]]),
      ),
    };
  }
  // Ensure a restored project has a valid unlock, prerequisites and a plausible remaining timer.
  function validResearch(s) {
    const r = s.activeResearch;
    return (
      r == null ||
      !!(
        s.started &&
        r &&
        techs[r.key] &&
        (!techs[r.key].requiresExpedition || s.meta.runLaunches > 0) &&
        (techs[r.key].world === null
          ? s.colonies.some((c) => c.world === techs[r.key].requiresWorld)
          : s.colonies.some((c) => c.world === techs[r.key].world)) &&
        (r.total == null ||
          (Number.isFinite(r.total) &&
            r.total >= r.remaining &&
            r.total <=
              techs[r.key].duration *
                (r.key.startsWith("protect") ? 1.25 : 1))) &&
        Number.isFinite(r.remaining) &&
        r.remaining > 0 &&
        r.remaining <=
          techs[r.key].duration * (r.key.startsWith("protect") ? 1.25 : 1) &&
        !s.tech.includes(r.key) &&
        (!techs[r.key].requires || s.tech.includes(techs[r.key].requires))
      )
    );
  }
  // Validate persistent currencies, upgrade ranks and discovery records before trusting a save.
  function validMeta(s) {
    const m = s.meta;
    return !!(
      m &&
      ["points", "totalPoints", "runs", "runLaunches", "combatWins"].every(
        (k) => Number.isSafeInteger(m[k]) && m[k] >= 0,
      ) &&
      m.points <= m.totalPoints &&
      m.upgrades &&
      Object.keys(permanentUpgrades).every(
        (k) =>
          Number.isInteger(m.upgrades[k]) &&
          m.upgrades[k] >= 0 &&
          m.upgrades[k] <= 5,
      ) &&
      ["visited", "claimedWorlds"].every(
        (k) =>
          Array.isArray(m[k]) &&
          new Set(m[k]).size === m[k].length &&
          m[k].every((id) => Number.isInteger(id) && worlds[id]),
      ) &&
      ["research", "claimedTechs"].every(
        (k) =>
          Array.isArray(m[k]) &&
          new Set(m[k]).size === m[k].length &&
          m[k].every((key) => Object.hasOwn(techs, key)),
      ) &&
      Array.isArray(m.achievements) &&
      m.achievements.every((k) =>
        [
          "first-footprint",
          "system-pioneer",
          "beyond-the-stars",
          "new-horizons",
          "hollow-hunter",
        ].includes(k),
      ) &&
      Array.isArray(m.history) &&
      m.history.length <= 20 &&
      m.history.every(
        (h) =>
          Number.isSafeInteger(h.run) &&
          h.run > 0 &&
          Number.isSafeInteger(h.reward) &&
          h.reward >= 0 &&
          ["balanced", ...Object.keys(systems)].includes(h.system) &&
          h.worlds === worlds.length &&
          Number.isInteger(h.research) &&
          h.research >= 0,
      ) &&
      ["balanced", ...Object.keys(systems)].includes(m.system)
    );
  }
  // Validate the complete current save schema before it becomes the live game state.
  function valid(s) {
    try {
      return !!(
        s &&
        s.version === 7 &&
        validCombat(s) &&
        validMeta(s) &&
        typeof s.started === "boolean" &&
        Number.isInteger(s.current) &&
        worlds[s.current] &&
        Number.isFinite(s.lastSeen) &&
        Number.isFinite(s.elapsed) &&
        s.elapsed >= 0 &&
        Number.isInteger(s.expeditions) &&
        s.expeditions >= 0 &&
        s.stock &&
        Object.keys(resources).every(
          (k) => Number.isFinite(s.stock[k]) && s.stock[k] >= 0,
        ) &&
        Array.isArray(s.tech) &&
        s.tech.every((k) => Object.hasOwn(techs, k)) &&
        new Set(s.tech).size === s.tech.length &&
        Array.isArray(s.colonies) &&
        s.colonies.length <= worlds.length &&
        new Set(s.colonies.map((c) => c.world)).size === s.colonies.length &&
        s.colonies.every(
          (c) =>
            c &&
            Number.isInteger(c.world) &&
            worlds[c.world] &&
            Number.isInteger(c.drones) &&
            c.drones >= 2 &&
            c.drones <= 1000 &&
            Object.keys(buildings)
              .filter((k) => k !== "drone")
              .every(
                (k) =>
                  Number.isInteger(c[k]) &&
                  c[k] >= 0 &&
                  (k === "solar" ||
                    k === "fuelPlant" ||
                    buildings[k].world === c.world ||
                    c[k] === 0),
              ) &&
            c.assignments &&
            Object.keys(c.assignments).length ===
              worlds[c.world].resources.length &&
            worlds[c.world].resources.every(
              (r) =>
                Number.isInteger(c.assignments[r]) && c.assignments[r] >= 0,
            ) &&
            idle(c) >= 0,
        ) &&
        (!s.started
          ? s.colonies.length === 0
          : s.colonies.some((c) => c.world === s.current)) &&
        validResearch(s)
      );
    } catch {
      return false;
    }
  }
  // Upgrade supported older saves and supply missing defaults, then validate the resulting state.
  function migrate(raw) {
    if (!raw || ![1, 2, 3, 4, 5, 6, 7].includes(raw.version)) return null;
    if (raw.version === 7) return valid(raw) ? raw : null;
    try {
      const s = JSON.parse(JSON.stringify(raw)),
        legacyResources = [
          ["iron", "rock", "ice"],
          ["iron", "rock", "crystal"],
          ["ice", "crystal", "iron"],
        ];
      if (
        !Array.isArray(s.colonies) ||
        !s.stock ||
        !["iron", "rock", "ice", "metal", "fuel", "crystal"].every(
          (k) => Number.isFinite(s.stock[k]) && s.stock[k] >= 0,
        )
      )
        return null;
      s.version = 7;
      if (raw.version !== 6) {
        s.combat = freshCombat();
        s.combat.encountered = s.colonies.length >= 5;
      }
      if (raw.version < 5) {
        s.meta = freshMeta();
        s.meta.runLaunches = s.expeditions > 0 ? 1 : 0;
      } else s.meta.combatWins ??= 0;
      s.expeditions ??= 0;
      s.activeResearch ??= null;
      for (const key of Object.keys(resources))
        if (!(key in s.stock)) s.stock[key] = 0;
      for (const c of s.colonies) {
        if (
          raw.version === 2 ||
          raw.version === 3 ||
          raw.version === 4 ||
          raw.version === 5 ||
          raw.version === 6
        ) {
          if (raw.version < 4) c.solar = 2;
          for (const key of Object.keys(buildings))
            if (key !== "drone" && !(key in c)) c[key] = 0;
          continue;
        }
        const w = worlds[c.world],
          old = legacyResources[c.world];
        if (
          !w ||
          !c.assignments ||
          !old.every(
            (r) => Number.isInteger(c.assignments[r]) && c.assignments[r] >= 0,
          )
        )
          return null;
        const assignments = Object.fromEntries(
          w.resources.map((r, i) => [r, c.assignments[old[i]]]),
        );
        const smelter = c.smelter,
          refinery = c.refinery,
          drones = c.drones;
        Object.assign(c, colony(c.world), { drones, assignments });
        c[w.buildings[0]] = smelter;
        c[w.buildings[1]] = refinery;
        if (c.world > 0)
          for (let i = 0; i < 2; i++)
            if (c[w.buildings[i]] > 0 && !s.tech.includes(w.techs[i]))
              s.tech.push(w.techs[i]);
      }
      recordDiscovery(s);
      return valid(s) ? s : null;
    } catch {
      return null;
    }
  }
  const api = {
    resources,
    worlds,
    buildings,
    techs,
    rocketCost,
    fresh,
    canPay,
    buildCost,
    build,
    research,
    assign,
    idle,
    adjust,
    nextWorld,
    worldAccess,
    visit,
    canLaunch,
    settle,
    expedition,
    tick,
    offline,
    valid,
    migrate,
    protectedWorld,
    bonuses,
    gathering,
    researchAllowed,
    power,
    permanentUpgrades,
    systems,
    permanentCost,
    buyPermanent,
    prestigePreview,
    prestige,
    researchDuration,
    solarProductivity,
    combatMissions,
    hangarCost,
    buildHangar,
    fighterCost,
    queueFighters,
    combatPreview,
    sendCombatMission,
  };
  if (typeof module !== "undefined") module.exports = api;
  else root.Moonward = api;
})(typeof window !== "undefined" ? window : globalThis);
