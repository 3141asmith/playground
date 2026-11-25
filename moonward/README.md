# Moonward

A mobile-friendly colony game prototype with original canvas illustrations. Open `index.html` through a local server, or run `node ../serve.cjs` from this directory and visit http://127.0.0.1:4185/playground/moonward/.

Every load opens with a Moonward title screen and original rocket-and-moon logo. Continue opens an offline production receipt when a returning colony has been away for at least one minute. The receipt lists net materials gained and consumed, at the existing 25% rate and eight-hour cap. Earnings are applied and saved before the receipt appears; dismissing it grants nothing. Android background/resume uses the same receipt. Fresh games proceed directly from the splash to the red Launch button.

## Source guide

The source is formatted as readable JavaScript, HTML and CSS; there is no bundler or required runtime dependency. `index.html` declares the script loading order. The UI scripts share one session in browser script scope; they are not independent ES modules.

| File | Responsibility |
| --- | --- |
| `engine.js` | DOM-free game rules, content definitions, simulation, save migration and offline accounting. Also exported through CommonJS for model tests. |
| `session.js` | Shared state, loading the existing save key, persistence and the initial offline calculation. |
| `panels.js` | Build, research and mission panel markup. |
| `app.js` | Rendering shared UI, handling player actions, dialogs, scene setup and ambient audio. |
| `lifecycle.js` | Named simulation heartbeat and browser/Android pause and resume events. |
| `startup.js` | Splash interaction and the offline receipt; no production or reward calculations. |
| `scene.js` | Canvas colony artwork, drones and their travel animation. |
| `starmap.js`, `tooltips.js` | Solar system map and production details. |
| `prestige.js`, `combat.js` | Specialized prestige and fleet interfaces; their rules remain in the engine. |
| `style.css` | Layout, component styles and startup branding. |

To change balance, start in `engine.js`. To change a panel, start in `panels.js`. Keep state changes in engine actions, then call `save()` and `render()` from the UI. `syncPanel()` updates existing DOM nodes so focus and hover survive timer-driven refreshes. Saves retain schema version 7 and the `moonward-save-v1` storage key.

`../tests/moonward-startup-browser.cjs` covers splash/report ordering, gains and consumption, mobile fit and duplicate-credit prevention. Other `moonward*.cjs` tests cover the simulation and existing gameplay. Android packaging in `../../moonward/build.ps1` explicitly lists the same source files as the page; add new files there when extending the game.

Progress through **Selene → Ember → Nacre → Vesper → Helion → Abyss → Zephyr → Erebus → deep space**. Each world has three exclusive raw resources, two local processing buildings, three industry/flight technologies and a different departure rocket. Cargo is shared; older colonies keep producing. The inventory shows the five resources relevant to the current world.

Only the first uncolonised world can be settled. It requires departure from its immediately preceding colony, that colony's flight research and rocket cargo, and any destination protection research. The star map shows a numbered route, greys out later worlds as locked, highlights the next destination and explains the current missing requirement. Locked worlds remain inspectable, but cannot be visited or launched to. Existing colonies can be revisited freely. Older saves with a gap retain their colonies; the missing world must be settled before expansion continues. `moonward-progression.cjs` and `moonward-progression-browser.cjs` test these rules, lock messages, sequential unlocks and mobile layout.

| World | Raw resources | Processing buildings | Rocket cargo total |
| --- | --- | --- | --- |
| Selene | Iron ore, moon rock, water ice | Alloy foundry, fuel refinery | 100 |
| Ember | Basalt, sulfur, crystal | Magma kiln, plasma crucible | 200 |
| Nacre | Frost quartz, cobalt, xenon clathrate | Cryogenic forge, ion distillery | 400 |
| Vesper | Spore ore, amber resin, chlorite | Polymer vat, biofuel digester | 800 |
| Helion | Uranite, leadstone, helium crystals | Shielding foundry, fusion breeder | 1,600 |
| Abyss | Trench ore, dense brine, pearlstone | Abyssal forge, brine electrolyser | 3,200 |
| Zephyr | Stormglass, flux ore, aero deposits | Flux annealer, storm capacitor | 6,400 |
| Erebus | Void ore, acidstone, dark crystal | Void furnace, antimatter stabiliser | 12,800 |

Departure recipes require **40 structural material + 30 fuel + 30 local raw material, multiplied by 2^worldIndex** (Selene is index 0). Mission and the star map list exact resources and quantities. Each launch must originate on the preceding world with its flight technology researched. Later-world factories, drones, research costs and research durations also increase. More processors and drones help handle the growing rocket budgets. Erebus builds the final antimatter expedition rocket; all eight colonies remain playable afterwards.

Five environmental protection technologies are researched on the **preceding world**, using its processed materials. This prevents a deadlock where inaccessible local resources would be needed to protect the first drones. Protection requires that origin world's flight research and must finish before departure. The engine also blocks unprotected active/offline drone mining and deployment.

| Destination | Hazard | Protection | Research location | Time |
| --- | --- | --- | --- | --- |
| Vesper | Toxic atmosphere | Sealed drone chassis | Nacre | 25 min |
| Helion | Intense radiation | Radiation shielding | Vesper | 30 min |
| Abyss | Crushing pressure | Pressure-rated hulls | Helion | 35 min |
| Zephyr | Electrical superstorms | Storm grounding grids | Abyss | 40 min |
| Erebus | Corrosive acid atmosphere | Acid-proof drone armour | Zephyr | 45 min |

The star map shows eight orbital paths and selectable worlds. Swipe/scroll the chart or use its destination selector; the view centres on your current colony when opened. The detail panel shows live production, hazard/protection status and exact launch requirements. Readiness updates while open. Keyboard and touch controls work on the planet buttons and selector. Orbital distances are illustrative.

Save format 7 automatically migrates versions 1–6. Existing cargo, technologies, research timers, colonies, drones, solar arrays, lifetime launches, Discovery Points, permanent ranks, prestige history and existing combat fleets/missions remain. New fuel power plant counts start at zero. Older versions receive the previously documented solar, prestige and combat defaults as applicable.

Progress saves to this browser or Android app every five seconds and after actions. Offline production is 25% for up to eight hours and includes processing. No cloud account or cross-device sync. Clearing site/app data removes progress. Ambient audio is optional. Reduced-motion settings suppress decorative motion and shorten launch transitions. Assigned drones travel continuously by default.

Each resource box has ▼ and ▲ controls around its deployed-drone count. ▼ recalls exactly one drone into the available pool; ▲ deploys exactly one available drone without reducing any other resource's count. Limits disable the relevant arrows. Newly built drones start available, and idle drones do not gather. The scene status shows deployed and available totals. Existing saves retain their assignments; available drones also persist. Clicking a deposit on the scene remains a quick-assignment shortcut. `node ../tests/moonward-deployment.cjs` and `node ../tests/moonward-deployment-browser.cjs` verify allocation, saving, limits and touch controls.

Drones return to the hub before changing routes, drive out, pause to mine, and bring visible cargo back to unload. Recalled drones return and park at the hub. Animation uses elapsed time rather than display frame rate. The Drones control pauses or plays these trips; trips run by default even when decorative motion is reduced. Only manually paused or unassigned drones stop travelling. These trips illustrate the resource assignments; production uses the existing per-second economy. `node ../tests/moonward-drones.cjs` checks the complete trip and selection methods.

Research runs one project at a time, with materials spent up front and unlocks granted only on completion. Selene: Metallurgy 1 minute, Cryochemistry 3 minutes, Interplanetary flight 10 minutes. Ember: Volcanic ceramics 3 minutes, Plasma containment 8 minutes, Thermal propulsion 15 minutes. Nacre: Cryogenic conductors 5 minutes, Xenon ionisation 15 minutes, Deep-space navigation 25 minutes. Research must start at its home colony; travelling elsewhere does not interrupt it. The panel shows duration, progress and remaining time. Active research persists in saves and continues at full speed offline (resource generation remains at 25%). `node ../tests/moonward-research.cjs` checks timing, costs, prerequisites, save recovery and offline completion.

Research has **Local industry** and **Fleet upgrades** views. Nine optional permanent upgrades apply to every existing and future colony. They use the same single research slot and pay materials up front. Each branch requires the preceding tier, and higher tiers require an established colony on the later supply world; imported materials alone cannot bypass this condition. Fleet upgrades can be started from any established colony once their prerequisites are met.

| Branch | Tier I | Tier II | Tier III | Maximum effect |
| --- | --- | --- | --- | --- |
| Drivetrains | Efficient drivetrains: +25%, 2 min | Cryogenic bearings: +35%, 8 min | Quantum traction: +50%, 25 min | 2.1× visible travel speed and gathering throughput |
| Mining equipment | Expanded cargo bays: +25%, 3 min | Bio-adaptive excavators: +35%, 12 min | Antimatter mining heads: +40%, 35 min | 2× mining output |
| Factory automation | Factory calibration: +20%, 4 min | Fusion automation: +30%, 15 min | Void assembly networks: +50%, 45 min | 2× processing speed and input demand |

Bonuses within each branch add. Travel and mining multipliers combine for up to 4.2× gathering. Costs rise by tier and combine planetary materials: Cryogenic bearings uses Ember heat ceramic and Nacre superconductors; Quantum traction uses Abyss pressure alloy, Zephyr storm cells and Erebus void alloy. Research cards identify supply worlds and show owned/required amounts. All inventory, deposit, processor and star-map rates include upgrades. Input shortages still limit processors. Saved completed/active upgrades need no new save fields. Offline production remains 25%; simulation splits at research completion so a new bonus only affects the remaining time away.

`node ../tests/moonward-upgrades.cjs` checks all nine tiers, cost/duration growth, global bonuses, prerequisite/colony gates, processing inputs and exact offline timing. `node ../tests/moonward-upgrades-browser.cjs` checks the research view, timed unlock, measured drone travel speed, displayed rates, save recovery and mobile layout.

Processors need solar power. Every colony starts with two arrays, and more can be built from its first two raw resources without research or power, avoiding a resource deadlock. An array produces 10 kW multiplied by that planet's solar productivity. Each additional array costs more local materials. The colony power strip shows array count, sunlight, generated/required kW and brownout warnings; build cards, hover details and the star map show the same power model.

| Planet | Solar productivity | kW per array |
| --- | --- | --- |
| Selene | 100% | 10 |
| Ember | 130% | 13 |
| Nacre | 65% | 6.5 |
| Vesper | 45% | 4.5 |
| Helion | 115% | 11.5 |
| Abyss | 30% | 3 |
| Zephyr | 60% | 6 |
| Erebus | 20% | 2 |

The two processor types on world index `i` draw `6 + 2i` and `8 + 2i` kW each. Processing-speed research increases both speed and power demand. Demand reserves capacity for installed processors, including input-starved machines. If generation is short, all processors run at `generation / demand` of their upgraded speed; input consumption and output decline together. Zero power stops processing. Mining and research operate independently of this factory grid. Power is local to each colony, constant through the illustrative day, and uses the same limits during offline production before applying the 25% offline factor. Solar farms render up to eight representative arrays; tooltips show the full built count.

`node ../tests/moonward-power.cjs` checks generation, proportional brownouts, zero power, input/output accounting, upgraded demand, planet differences, offline production and migration. `node ../tests/moonward-power-browser.cjs` checks construction, live warnings/recovery, tooltips, map details, persistence and mobile layout. Eight-world progression tests build solar capacity as industry expands.

## Expeditions / prestige

Open **Mission → Expedition command** to view the permanent shop and discovery journal. Prestige requires all eight colonies, an Erebus expedition rocket launched in the current run, and completed **Wormhole Drive** research on Erebus. The Drive costs 1,000 void alloy, 800 antimatter cells and 400 flux conductors and takes 30 minutes before permanent research bonuses. Normal play continues until a separate reset preview is explicitly confirmed. Cancelling the preview changes nothing.

Discovery Points reward first-time milestones: each previously unclaimed world awards `2 × (worldIndex + 1)` points and each newly claimed technology awards 2 points. Completion grants `20 + floor(completed technologies / 5)` points. An Unstable frontier multiplies that run's total by 1.25, rounded down. The preview shows the exact breakdown. Repeated full routes retain the smaller completion reward but cannot repeatedly claim novelty points; additional rocket launches in the same run do not increase the reward. Early partial resets are unavailable. If research completion changes the reward while reviewing it, the player must review the new total before confirming.

Reset clears colonies, stock, buildings, drones, ordinary industry/protection/fleet research, active research and mission time. It returns the player to the launch pad. Discovery Points, permanent ranks, achievements, world/research discoveries, lifetime launch count and expedition history survive. The journal keeps all discovered worlds and technologies and the last 20 prestige run summaries. Achievements recognise a first colony, all eight worlds, a final rocket and a first prestige reset.

| Permanent upgrade | Initial DP cost | Benefit per rank |
| --- | --- | --- |
| Expedition cargo | 12 | +1 drone and 20 iron / 15 rock / 10 ice on the next Selene launch |
| Improved photovoltaics | 10 | +15% solar generation everywhere |
| Research archives | 12 | +20% research speed |
| Standardised equipment | 10 | −6% drone and processor construction costs (solar arrays excluded) |
| Atmospheric expertise | 8 | +30% research speed for protection technologies discovered in earlier runs |

Each permanent upgrade has five ranks; rank costs double. Research time divides by the archive-speed bonus and, for previously discovered protection technologies, the atmospheric expertise bonus. Bonuses apply when a project starts, so purchases do not retroactively alter an active timer. Permanent upgrades can be purchased before relaunching or during an expedition.

Each prestige selects the next system: **Mineral-rich** gives +25% gathering; **Bright-star** gives +30% solar generation; **Unstable frontier** gives +25% Discovery Points, 20% less solar output and 25% longer protection research. The first expedition uses the balanced home system. Permanent and system solar modifiers multiply. These choices affect the existing eight-world route without discarding the journal.

`node ../tests/moonward-prestige.cjs` checks reward novelty, reset boundaries, duplicate-claim rejection, upgrades, conditions, save validation and migration. `node ../tests/moonward-prestige-browser.cjs` checks launch/Drive gates, preview/cancel/confirmation, system choice, permanent purchases, retained journal, save/reload and the stronger restart on mobile.

## The Hollow / combat expeditions

Establishing the **fifth colony (Helion)** triggers first contact with the Hollow, an abandoned war fleet. The **Fleet** panel unlocks for this run. Combat is optional: enemies do not destroy colonies or block the mining/research route. Combat expeditions are separate from prestige expeditions.

Build local fleet hangars from that colony's two processed materials and first raw resource: base cost 40 / 25 / 50, multiplied by 1.5 for each existing local hangar. Hangars can be built on any established world after the encounter. Each hangar reserves **8 kW**, increased by processor-speed research, and constructs a fighter in **120 powered seconds**. More hangars build in parallel; power shortages reduce construction proportionally. Queue 1 or 5 ships, paying 10 structural material, 8 fuel and 15 first raw resource per ship up front. Each shipyard queues up to 50 fighters; the API accepts batches up to 20. Available fighters are shared across colonies. Construction runs at 25% offline speed.

| Combat expedition | Enemy strength | Time | Unlock | Victory cargo |
| --- | --- | --- | --- | --- |
| Hollow scout patrol | 20 | 2 min | 5 colonies | 35 shield plating, 25 fusion cells, 80 uranite |
| Raider salvage convoy | 50 | 5 min | 5 colonies, 1 victory | 100 biopolymer, 80 plasma cells, 70 shield plating |
| Hollow listening post | 100 | 8 min | 6 colonies, 2 victories | 160 pressure alloy, 120 hydrofuel, 100 trench ore |
| Storm dreadnought | 180 | 12 min | 7 colonies, 4 victories | 260 flux conductors, 200 storm cells |
| Hollow command hive | 300 | 20 min | 8 colonies, 6 victories | 450 void alloy, 350 antimatter cells |

Each fighter contributes 10 strength. Results are deterministic and previewed before dispatch: meeting enemy strength wins, losing `floor(enemyStrength / 60)` fighters; an under-strength attack loses `ceil(sentShips × 0.6)` and recovers no cargo. One mission can run at a time. Sending reserves the ships immediately; surviving ships return automatically. Mission time advances at full real-time speed while away (within the existing eight-hour offline cap). Rewards credit once on completion; ship losses, victory cargo and the last 20 reports persist through reload. Mission locks ensure reward materials belong to already reachable worlds.

Prestige resets hangars, queued/available/deployed fighters, combat missions and current-run reports/victories. Lifetime combat victories and the **Hollow hunter** achievement remain in the expedition journal. Existing permanent upgrades and Discovery Points survive migration unchanged.

`node ../tests/moonward-combat.cjs` checks unlock gates, power/construction, mission outcomes, atomic costs, reward idempotency, offline progress, save validation, prestige boundaries and v5 migration. `node ../tests/moonward-combat-browser.cjs` checks the encounter, Fleet controls, hangar/queue/dispatch flow, timer restore, victory reports and mobile layout.

## Fuel power plants

Every world can construct a **Fuel power plant** in Build, using its local structural product and second raw resource. Base quantities are `50 + 10 × worldIndex` structural material and `40 + 5 × worldIndex` raw material; cost grows 30% per existing plant. Utility plants are excluded from the permanent equipment discount, like solar arrays. No additional research is required, though the structural product must be produced first.

Each plant supplies up to **40 kW**, independent of sunlight, by consuming up to **1 local fuel per minute**. The fuel is the colony's second processed product: fuel, plasma cells, ion fuel, biofuel, fusion cells, hydrofuel, storm cells or antimatter cells. Solar power takes priority. Plants cover only the remaining installed demand, burning proportionally; if solar covers demand, plants burn nothing. Fuel is shared with rocket construction, so spending it on power can delay departure. Fuel shortages reduce thermal output, then processors and hangars throttle according to the remaining total power.

Power strips show solar/thermal output separately; plant cards, scene tooltips and star-map details show thermal capacity and fuel burn. Plants power both processing and fighter production, survive saves and reset with the colony on prestige. Permanent solar improvements affect panels, not thermal generation.

Fuel consumption and powered production use a common grid snapshot in effective-time steps no longer than one second. Fuel already in storage is reserved before production, so a refinery cannot create and burn the same fuel in the same step. An empty, solar-free fuel refinery cannot bootstrap itself; adding solar or importing its local fuel restores power. Raw resources are still consumed normally, preventing free-resource loops. Offline processing and fuel consumption both run at 25%; offline calculation uses the same bounded steps and existing eight-hour cap.

`node ../tests/moonward-fuel-power.cjs` checks fuel/energy conservation, solar priority, exhaustion, safe recovery, offline accounting, hangar supply, local costs and v6 migration. `node ../tests/moonward-fuel-power-browser.cjs` checks construction, power/burn displays, tooltips, map details, persistence and mobile layout.

The Android wrapper is in `../../moonward/android`. Run `../../moonward/build.ps1` to bundle these sources and build the debug APK with the workspace Android SDK and JDK. The debug APK is for local testing, not a signed Play Store release.

Hover a resource deposit, resource button or inventory resource to see assigned drone counts and gathering rates per second/minute. Inventory totals include all colonies; deposits and buttons describe the current colony. Hover a built processor or its build card for the local count, input demand and output capacity, including an input-shortage note. Rates update while the tooltip is open. Touch users can tap; resource taps still assign a drone. Inventory resources, resource buttons and processor cards also support keyboard focus, with Escape to dismiss. `node ../tests/moonward-tooltips.cjs` checks hover, live updates, keyboard and touch behavior.

Checks: `node ../tests/moonward.cjs`, `node ../tests/moonward-worlds.cjs` and, with the playground server running, `node ../tests/moonward-browser.cjs` and `node ../tests/moonward-worlds-browser.cjs`. World progression tests play all eight production chains without injecting resources, check skip/origin locks and migration, and verify local panels, rocket costs and the final expedition in the browser. Browser tests use the workspace Playwright and installed Edge.

Additional checks: node ../tests/moonward-hazards.cjs validates exponential costs, all five protection gates, active/offline mining and v2 migration. node ../tests/moonward-hazards-browser.cjs checks hazard warnings, timed protection, blocked/ready departure and protected mining. node ../tests/moonward-starmap.cjs checks the eight-world orbital map and mobile controls.


