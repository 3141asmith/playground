/* Original canvas art: a small, softly shaded isometric lunar diorama. */
window.ColonyScene = function (canvas, getState) {
  // Read state through a callback so a prestige reset can replace the save object safely.
  const scene = this;
  scene.deposits = [];
  scene.processors = [];
  scene.utilities = [];
  scene.drones = [];
  const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
  // Drone trips are core gameplay feedback and run unless explicitly paused.
  // Reduced-motion preferences still suppress decorative smoke/launch motion.
  scene.animate = true;
  scene.reset = () => {
    scene.drones = [];
    scene.deposits = [];
    scene.processors = [];
    scene.utilities = [];
    fleetWorld = -1;
  };
  const ctx = canvas.getContext("2d");
  let w = 800,
    h = 530,
    frame = 0,
    lastTime = null,
    fleetWorld = -1,
    nextDrone = 0,
    selected = null,
    selectionTime = 0;
  const reduced = motionPreference.matches,
    hub = { x: 0, y: 40 };
  // Match visual drones to saved assignments, reusing recalled drones so they return through the hub.
  function reconcile(c) {
    if (fleetWorld !== c.world) {
      scene.drones = [];
      fleetWorld = c.world;
      selected = null;
    }
    // Reuse recalled drones at their current positions instead of teleporting them to the hub.
    const spare = scene.drones.filter((d) => d.resource === null);
    for (const r of Object.keys(c.assignments)) {
      const assigned = scene.drones.filter((d) => d.resource === r);
      spare.push(...assigned.slice(c.assignments[r]));
    }
    scene.drones = scene.drones.filter((d) => !spare.includes(d));
    for (const [r, count] of Object.entries(c.assignments)) {
      const missing =
        count - scene.drones.filter((d) => d.resource === r).length;
      for (let i = 0; i < missing; i++) {
        const d = spare.shift();
        if (d) {
          d.resource = r;
          d.phase = "returning";
          d.wait = 0;
          scene.drones.push(d);
        } else
          scene.drones.push({
            id: nextDrone++,
            resource: r,
            x: hub.x,
            y: hub.y,
            phase: "unloading",
            wait: i * 0.35,
            cargo: null,
          });
      }
    }
    for (const d of spare) {
      if (d.resource !== null) d.phase = "returning";
      d.resource = null;
      scene.drones.push(d);
    }
    while (scene.drones.length < c.drones)
      scene.drones.push({
        id: nextDrone++,
        resource: null,
        x: hub.x,
        y: hub.y,
        phase: "idle",
        wait: 0,
        cargo: null,
      });
  }
  scene.dispatch = function (resource) {
    const s = getState(),
      c = s.colonies.find((c) => c.world === s.current);
    if (!c) return;
    reconcile(c);
    selected = resource;
    selectionTime = 3;
  };
  // Animate the outbound → mining → returning → unloading loop; resource income belongs to engine.tick.
  function advanceDrones(c, dt) {
    reconcile(c);
    selectionTime = Math.max(0, selectionTime - dt);
    const moveSpeed = 55 * Moonward.bonuses(getState()).speed;
    for (const d of scene.drones) {
      if (d.phase === "idle") continue;
      const node =
        nodes[Moonward.worlds[c.world].resources.indexOf(d.resource)];
      if (d.phase === "mining" || d.phase === "unloading") {
        d.wait -= dt;
        if (d.wait > 0) continue;
        if (d.phase === "mining") {
          d.cargo = d.resource;
          d.phase = "returning";
        } else {
          d.cargo = null;
          d.phase = d.resource ? "outbound" : "idle";
          if (d.phase === "idle") continue;
        }
      }
      // Reassigned drones return through the hub; only outbound trips aim at the deposit.
      const target =
        d.phase === "outbound" ? { x: node.x, y: node.y + 12 } : hub;
      const dx = target.x - d.x,
        dy = target.y - d.y,
        distance = Math.hypot(dx, dy),
        step = moveSpeed * dt;
      if (distance <= step) {
        d.x = target.x;
        d.y = target.y;
        d.phase = d.phase === "outbound" ? "mining" : "unloading";
        d.wait = d.phase === "mining" ? 1 : 0.55;
      } else if (distance) {
        d.x += (dx / distance) * step;
        d.y += (dy / distance) * step;
      }
      d.facing = dx < 0 ? -1 : 1;
    }
  }
  const stars = Array.from({ length: 65 }, (_, i) => ({
    x: ((i * 137.508) % 997) / 997,
    y: ((i * 73.1) % 499) / 499,
    r: i % 5 === 0 ? 1.3 : 0.6,
  }));
  const nodes = [
    { x: -158, y: 32, r: "iron" },
    { x: 160, y: -28, r: "rock" },
    { x: 105, y: 115, r: "ice" },
  ];
  // Draw a filled ellipse, used for shadows, craters and rounded parts of the scenery.
  function ellipse(x, y, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Draw a filled polygon with an optional outline for the isometric art primitives.
  function poly(points, color, stroke) {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  // Draw a single stroke using an explicit colour and width.
  function line(x, y, x2, y2, color, width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  // Build an isometric block from separately shaded top and side faces.
  function box(x, y, sx, sy, z, top, left, right) {
    poly(
      [
        [x - sx, y],
        [x, y - sy],
        [x + sx, y],
        [x, y + sy],
      ],
      top,
    );
    poly(
      [
        [x - sx, y],
        [x, y + sy],
        [x, y + sy + z],
        [x - sx, y + z],
      ],
      left,
    );
    poly(
      [
        [x, y + sy],
        [x + sx, y],
        [x + sx, y + z],
        [x, y + sy + z],
      ],
      right,
    );
  }
  // Draw a mineral deposit using a small faceted silhouette.
  function rock(x, y, size, color) {
    ellipse(x, y + size * 0.35, size * 0.85, size * 0.4, "#27364055");
    poly(
      [
        [x - size, y],
        [x - size * 0.6, y - size * 0.7],
        [x + size * 0.3, y - size],
        [x + size, y - size * 0.2],
        [x + size * 0.7, y + size * 0.4],
        [x - size * 0.2, y + size * 0.5],
      ],
      color,
    );
    poly(
      [
        [x - size * 0.6, y - size * 0.7],
        [x - size * 0.1, y],
        [x + size * 0.7, y + size * 0.4],
        [x + size * 0.3, y - size],
      ],
      "#ffffff22",
    );
    line(x - size * 0.1, y, x - size * 0.2, y + size * 0.5, "#0002");
  }
  // Draw the rocket at the supplied position and scale, with optional launch effects.
  function rocket(x, y, scale, launched = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ellipse(0, 9, 31, 13, "#25363a55");
    poly(
      [
        [-12, -35],
        [-28, 0],
        [-12, -7],
      ],
      "#de7359",
    );
    poly(
      [
        [12, -35],
        [28, 0],
        [12, -7],
      ],
      "#bc5c4e",
    );
    if (launched) {
      poly(
        [
          [-10, 0],
          [0, 65 + Math.sin(frame * 0.2) * 15],
          [10, 0],
        ],
        "#f4a55e",
      );
      poly(
        [
          [-6, 0],
          [0, 40],
          [6, 0],
        ],
        "#ffdd8b",
      );
    }
    ctx.fillStyle = "#ece7d4";
    ctx.beginPath();
    ctx.moveTo(-13, 0);
    ctx.lineTo(-13, -53);
    ctx.quadraticCurveTo(-12, -78, 0, -89);
    ctx.quadraticCurveTo(12, -78, 13, -53);
    ctx.lineTo(13, 0);
    ctx.closePath();
    ctx.fill();
    poly(
      [
        [0, -89],
        [9, -73],
        [-9, -73],
      ],
      "#e17b64",
    );
    ctx.fillStyle = "#c9c8b8";
    ctx.fillRect(5, -57, 8, 57);
    ellipse(0, -47, 8, 9, "#294a57");
    ellipse(-2, -49, 3, 4, "#7eb5bf");
    ctx.fillStyle = "#d47861";
    ctx.fillRect(-13, -19, 26, 7);
    box(0, 0, 9, 3, 5, "#748887", "#495b60", "#344950");
    ctx.restore();
  }
  // Draw the central outpost that serves as the drones’ home hub.
  function habitat(x, y) {
    ellipse(x, y + 24, 70, 27, "#293b3b55");
    box(x, y - 6, 48, 24, 26, "#e4e2c9", "#bbbfae", "#8c9d96");
    ctx.save();
    ctx.translate(x, y - 22);
    ctx.scale(1, 0.55);
    ctx.fillStyle = "#e9e7cf";
    ctx.beginPath();
    ctx.arc(0, 0, 44, Math.PI, 0);
    ctx.fill();
    ctx.restore();
    poly(
      [
        [x - 32, y - 20],
        [x - 8, y - 11],
        [x - 8, y + 7],
        [x - 32, y - 2],
      ],
      "#416777",
    );
    poly(
      [
        [x + 7, y - 11],
        [x + 31, y - 22],
        [x + 31, y - 4],
        [x + 7, y + 8],
      ],
      "#365867",
    );
    line(x + 11, y - 10, x + 27, y - 17, "#84b7bd", 2);
    poly(
      [
        [x - 7, y + 15],
        [x + 7, y + 9],
        [x + 7, y + 28],
        [x - 7, y + 34],
      ],
      "#3b5358",
    );
    box(x + 1, y + 33, 15, 7, 3, "#c0c5b1", "#8c9d91", "#6f8681");
    line(x, y - 44, x, y - 68, "#aebdaf", 2);
    ellipse(x, y - 68, 3, 3, "#e2996d");
    ctx.fillStyle = "#eb9b73";
    ctx.fillRect(x - 17, y - 36, 10, 4);
  }
  // Draw one solar array with its panel grid and support.
  function solar(x, y) {
    line(x, y, x, y + 28, "#899a8e", 4);
    ellipse(x, y + 31, 24, 8, "#24393944");
    box(x, y - 8, 29, 15, 3, "#456f81", "#2b4a5a", "#294657");
    for (let i = -2; i <= 2; i++)
      line(
        x + i * 9 - 14,
        y - 8 - i * 4.7,
        x + i * 9 + 14,
        y + 7 - i * 4.7,
        "#84acb055",
      );
    for (let i = -1; i <= 1; i++)
      line(
        x - 28 + i * 9,
        y - 8 + i * 4.7,
        x + 1 + i * 9,
        y - 23 + i * 4.7,
        "#84acb055",
      );
  }
  // Draw a processor building with details selected by its factory type.
  function factory(x, y, type) {
    const recipe = Moonward.buildings[type],
      accent = Moonward.resources[Object.keys(recipe.output)[0]].color;
    ellipse(x, y + 15, 36, 16, "#26373855");
    box(x, y - 15, 29, 16, 29, "#bcc5b2", "#81978b", "#657e79");
    box(x + 7, y - 30, 16, 9, 15, accent, "#718b80", "#506e6b");
    ctx.fillStyle = accent;
    ctx.fillRect(x - 19, y - 3, 10, 6);
    if (recipe.world === 1) {
      poly(
        [
          [x - 12, y - 35],
          [x - 1, y - 52],
          [x + 10, y - 35],
        ],
        accent,
      );
    }
    if (recipe.world === 2) {
      ellipse(x - 12, y - 28, 9, 14, accent);
      line(x - 12, y - 38, x - 12, y - 19, "#f2ffff", 2);
    }
    line(x + 13, y - 35, x + 13, y - 52, "#a9baab", 8);
    if (!reduced)
      for (let i = 0; i < 3; i++) {
        const t = (frame * 0.012 + i * 0.32) % 1;
        ellipse(
          x + 13 + t * 9,
          y - 52 - t * 30,
          4 + t * 5,
          3 + t * 3,
          `rgba(190,211,201,${(1 - t) * 0.24})`,
        );
      }
  }
  // Draw an animated drone at its current position, including cargo on its return trip.
  function drone(d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.scale(1.3 * (d.facing || 1), 1.3);
    ellipse(0, 8, 13, 5, "#293d3b66");
    ellipse(-8, 6, 4, 5, "#2c4247");
    ellipse(8, 6, 4, 5, "#2c4247");
    box(0, -2, 11, 6, 7, "#e4daba", "#a5ad98", "#6f8983");
    box(0, -7, 6, 3, 4, "#c8d6bc", "#9daf99", "#748f84");
    line(5, -10, 8, -17, "#95ac9a", 1.5);
    ellipse(8, -17, 2, 2, "#e8ba80");
    if (d.cargo) rock(-3, -8, 6, Moonward.resources[d.cargo].color);
    if (d.phase === "mining") {
      line(9, 0, 17, 5, "#526b66", 2);
      ellipse(18, 5, 2, 2, "#f7d791");
    }
    ctx.restore();
  }
  // Draw the colony’s fleet construction area and ship-count details.
  function fleetHangar(x, y, count, fighters) {
    ellipse(x, y + 25, 48, 18, "#293b3b55");
    box(x, y - 15, 38, 20, 35, "#c1c8b5", "#82998b", "#506e71");
    poly(
      [
        [x - 27, y - 11],
        [x + 21, y - 33],
        [x + 21, y + 1],
        [x - 27, y + 23],
      ],
      "#203a49",
    );
    line(x - 23, y - 6, x + 17, y - 25, "#92bec5", 3);
    ctx.font = "600 8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#273f40";
    ctx.fillText("HANGAR ×" + count, x, y + 50);
    for (let i = 0; i < Math.min(fighters, 3); i++) {
      const px = x - 19 + i * 17,
        py = y + 27 + i * 3;
      poly(
        [
          [px, py - 11],
          [px + 9, py + 8],
          [px, py + 4],
          [px - 9, py + 8],
        ],
        "#bdda9e",
      );
      line(px, py - 5, px, py + 4, "#4e777d", 2);
    }
  }
  // Draw thermal power infrastructure, showing whether it is currently generating.
  function fuelStation(x, y, count, running) {
    ellipse(x, y + 16, 32, 15, "#293b3b55");
    box(x, y - 12, 26, 15, 29, "#bdbaa2", "#83927e", "#5a7775");
    box(x + 8, y - 28, 8, 5, 30, "#9baca0", "#60746e", "#435e5b");
    ellipse(x - 10, y - 16, 10, 5, "#b79c75");
    ctx.fillStyle = running ? "#edb96b" : "#4e6764";
    ctx.fillRect(x - 17, y - 2, 12, 7);
    ctx.font = "600 8px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#263e3b";
    ctx.fillText("POWER ×" + count, x, y + 38);
    if (running && !reduced) {
      const t = (frame * 0.013) % 1;
      ellipse(
        x + 8 + t * 7,
        y - 53 - t * 20,
        4 + t * 4,
        3 + t * 3,
        `rgba(211,207,181,${(1 - t) * 0.3})`,
      );
    }
  }
  // Render one animation frame from current game state and publish hit areas for clicks and tooltips.
  function draw(time) {
    const s = getState();
    const dt =
      lastTime === null
        ? 0
        : Math.min(0.1, Math.max(0, (time - lastTime) / 1000));
    lastTime = time;
    frame++;
    // Cap pixel density to keep the canvas sharp without excessive mobile GPU work.
    const dpr = Math.min(devicePixelRatio || 1, 2),
      rect = canvas.getBoundingClientRect();
    if (rect.width !== w || rect.height !== h) {
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    let bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#1b2d39");
    bg.addColorStop(1, "#263c43");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    stars.forEach((st) =>
      ellipse(st.x * w, st.y * h * 0.66, st.r, st.r, "#bbd0cb55"),
    );
    // A distant, sunlit home and an orbital arc.
    ctx.strokeStyle = "#8ba69818";
    ctx.beginPath();
    ctx.ellipse(w * 0.76, h * 0.18, w * 0.33, h * 0.24, -0.4, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(w * 0.79, h * 0.17, 29, 29, "#6b9290");
    ellipse(w * 0.8, h * 0.16, 22, 25, "#809e8a");
    poly(
      [
        [w * 0.79 - 16, h * 0.17 - 18],
        [w * 0.79 + 5, h * 0.17 - 24],
        [w * 0.79 + 17, h * 0.17 - 7],
        [w * 0.79 + 1, h * 0.17 + 3],
        [w * 0.79 - 12, h * 0.17 - 3],
      ],
      "#b3bea0",
    );
    ctx.save();
    const scale = Math.min(w / 650, 1.2);
    ctx.translate(w * 0.49, h * (s.started ? 0.54 : 0.48));
    ctx.scale(scale, scale);
    const id = s.current || 0;
    const palettes = [
      ["#a7b4a2", "#879b8d", "#607c76"],
      ["#b68c77", "#98745f", "#6e5e56"],
      ["#abc9c6", "#7fa8ad", "#5a828c"],
    ];
    const colors = s.started
      ? palettes[id] || [Moonward.worlds[id].color, "#63796b", "#3f5c53"]
      : palettes[0];
    // Floating geological cross-section, faceted edge and a broad cratered surface.
    const rim = [
      [-275, -18],
      [-192, -104],
      [-50, -146],
      [112, -124],
      [245, -56],
      [283, 26],
      [205, 115],
      [35, 163],
      [-132, 127],
      [-257, 62],
    ];
    poly(
      rim.map(([x, y]) => [x, y + 35]),
      colors[2],
    );
    poly(
      [
        [-257, 62],
        [-132, 127],
        [35, 163],
        [205, 115],
        [205, 149],
        [35, 200],
        [-132, 160],
        [-257, 91],
      ],
      colors[2],
    );
    poly(rim, colors[0]);
    poly(
      [
        [-275, -18],
        [-192, -104],
        [-50, -146],
        [112, -124],
        [17, -95],
        [-172, -63],
        [-244, 14],
      ],
      "#ffffff0b",
    );
    for (let i = 0; i < 48; i++) {
      let x = Math.sin(i * 23.3) * 235,
        y = Math.cos(i * 14.4) * 90;
      if (Math.abs(x) < 70 && Math.abs(y) < 65) continue;
      ellipse(x, y, 2 + (i % 3), 1.3, "#516f6a33");
    }
    [
      [-181, -65, 27, 12],
      [193, 65, 29, 13],
      [-58, 111, 21, 10],
      [88, -88, 16, 7],
    ].forEach(([x, y, rx, ry]) => {
      ellipse(x, y, rx + 2, ry + 2, "#c9ceba55");
      ellipse(x, y + 2, rx, ry, "#71897b55");
      ellipse(x + 3, y + 3, rx - 4, ry - 3, colors[0]);
    });
    // Tread trails from outpost to deposits.
    if (s.started) {
      nodes.forEach((n, j) => {
        const active =
          selectionTime > 0 && Moonward.worlds[id].resources[j] === selected;
        ctx.setLineDash(active ? [5, 5] : [2, 6]);
        line(
          hub.x,
          hub.y,
          n.x,
          n.y + 12,
          active ? "#eef6cbbb" : "#657d7166",
          active ? 3 : 2,
        );
        if (active) {
          ctx.setLineDash([]);
          ctx.strokeStyle = "#e7f1bd";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(n.x, n.y + 8, 34, 17, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.setLineDash([]);
    }
    const world = Moonward.worlds[id];
    if (world.hazard) {
      ellipse(0, 18, 260, 120, world.color + "18");
    }
    nodes.forEach((n, j) => {
      const r = s.started ? world.resources[j] : ["iron", "rock", "ice"][j];
      const color = Moonward.resources[r].color;
      for (let i = 0; i < 6; i++) {
        const dx = Math.sin(i * 9) * 18,
          dy = Math.cos(i * 7) * 9;
        rock(n.x + dx, n.y + dy, 8 + (i % 3) * 3, color);
      }
      if (s.started) {
        ctx.font = "600 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#283d3d";
        ctx.fillText(Moonward.resources[r].name.toUpperCase(), n.x, n.y + 34);
      }
    });
    if (!s.started) {
      box(0, 33, 70, 32, 7, "#7c9390", "#536e6c", "#456265");
      ctx.setLineDash([6, 4]);
      line(-55, 34, 0, 7, "#bfccae99", 2);
      line(0, 7, 55, 34, "#bfccae99", 2);
      ctx.setLineDash([]);
      rocket(0, 13, 1.3);
      solar(-98, 4);
      solar(98, 27);
    } else {
      const c = s.colonies.find((c) => c.world === id);
      for (let i = 0; i < Math.min(c.solar, 8); i++)
        solar(-80 - (i % 2) * 37, -44 + Math.floor(i / 2) * 24 + (i % 2) * 21);
      habitat(0, 0);
      if (c[world.buildings[0]]) factory(-70, 67, world.buildings[0]);
      if (c[world.buildings[1]]) factory(55, 63, world.buildings[1]);
      rocket(82, -45, 0.55);
      if (c.fuelPlant)
        fuelStation(-180, -38, c.fuelPlant, Moonward.power(s, c).thermal > 0);
      if (s.combat.yards[id]?.hangars)
        fleetHangar(144, 45, s.combat.yards[id].hangars, s.combat.fighters);
      if (s.combat.mission) {
        const px = reduced ? -120 : -210 + (frame % 500) * 0.84;
        poly(
          [
            [px, -107],
            [px - 10, -91],
            [px, -96],
            [px + 10, -91],
          ],
          "#bddaa2",
        );
      }
      advanceDrones(
        c,
        scene.animate && Moonward.protectedWorld(s, id) ? dt : 0,
      );
      [...scene.drones].sort((a, b) => a.y - b.y).forEach(drone);
    }
    scene.deposits = s.started
      ? nodes.map((n, j) => ({
          x: w * 0.49 + n.x * scale,
          y: h * 0.54 + n.y * scale,
          resource: world.resources[j],
          radius: 38 * scale,
        }))
      : [];
    scene.processors = s.started
      ? [
          [world.buildings[0], -70, 67],
          [world.buildings[1], 55, 63],
        ]
          .filter(([key]) => s.colonies.find((c) => c.world === id)[key] > 0)
          .map(([key, x, y]) => ({
            key,
            x: w * 0.49 + x * scale,
            y: h * 0.54 + (y - 15) * scale,
            radius: 35 * scale,
          }))
      : [];
    scene.utilities = s.started
      ? Array.from(
          { length: Math.min(s.colonies.find((c) => c.world === id).solar, 8) },
          (_, i) => ({
            key: "solar",
            x: w * 0.49 + (-80 - (i % 2) * 37) * scale,
            y: h * 0.54 + (-52 + Math.floor(i / 2) * 24 + (i % 2) * 21) * scale,
            radius: 26 * scale,
          }),
        )
      : [];
    if (s.started && s.colonies.find((c) => c.world === id).fuelPlant)
      scene.utilities.push({
        key: "fuelPlant",
        x: w * 0.49 - 180 * scale,
        y: h * 0.54 - 45 * scale,
        radius: 32 * scale,
      });
    if (s.started && s.combat.yards[id]?.hangars)
      scene.utilities.push({
        key: "hangar",
        x: w * 0.49 + 144 * scale,
        y: h * 0.54 + 40 * scale,
        radius: 40 * scale,
      });
    ctx.restore();
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
};
