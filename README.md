# Playground

A static home for browser experiments: electron diffraction, Quickdraw, Motion Lab, Moments Lab, Capacitor Lab, Stellar atlas, Vector Lab, and Wave Lab. No build step or server API is needed.

## Wave Lab

Open `waves/` for a progressive sinusoidal transverse wave. An orange particle stays at a fixed x coordinate and oscillates vertically on a dashed guide. Other medium particles also keep their horizontal positions. Pause/play, reverse direction without a displacement jump, step through paused motion, restart, and change playback speed. Adjust amplitude, wavelength, frequency and the selected particle's x position. Wave speed and period use v = fλ and T = 1/f.

The wave is y = A sin(2πx/λ − phase), with phase advancing at ±2πf per simulated second. It represents an unbounded medium without reflections or damping. Parameter edits preserve phase; restart resets phase and time while preserving controls. Hidden tabs suspend playback, and reduced-motion preferences start it paused. `tests/waves.cjs` checks propagation direction, fixed particle positions, pause/reverse/step, parameters, playback speed, mobile layout and navigation.

## Vector Lab

Open `vectors/`. Start with A and B, then use Add vector to include up to eight independently draggable vectors (A to H). Each extra vector has component controls and a Remove button. Drag an input vector while holding the others fixed. Drag resultant R to distribute its change equally across all n vectors, preserving pairwise differences and enforcing R as their sum. All arrows share a common origin. Component projections show resolution; addition guides show a parallelogram for two vectors or a head-to-tail chain for more. Both can be toggled. Numeric x/y inputs and focusable arrow endpoints provide keyboard access. Magnitudes and anticlockwise directions update live; a zero vector has undefined direction. Values use arbitrary units and endpoints stay within the selected grid. Reset removes extra vectors; removing a cancelling vector expands the grid if needed without altering the others. Reset returns to A = (4, 2), B = (−1, 3), and a ±10 grid. `tests/vectors.cjs` checks dragging, inverse adjustment, components, keyboard and mobile touch behavior.

## Stellar atlas

Open `hr/` for an interactive Hertzsprung–Russell diagram of 185 named stellar/substellar objects from Stellar Catalog and all 131 composite spectral templates in the ESO-hosted Pickles library. Hover, tap, focus a point, or use the selector for source and physical details. Search names, aliases and spectral types, or filter by source. Colours represent spectral classes, including white dwarfs and brown-dwarf types. Both axes are logarithmic; temperature decreases to the right. Dot sizes use a labelled compressed radius scale by default, with an option for exact radius proportions. Dwarfs become tiny in proportional mode; accessible hit targets and the selector keep them reachable.

The static diagram includes dashed horizontal and vertical Sun reference lines, crossing at the Sol catalogue entry (5,700 K, 1 L☉). They remain visible when filters exclude Sol and are hidden during animation.

Animate scatters the visible stars into an illustrative night sky, then moves them horizontally by temperature and vertically by luminosity, ending at their exact H–R coordinates. The seven-second sequence preserves colours, sizes and physical data; hover details follow the moving dots. Skip animation returns immediately to the diagram. Changing the source, search or mobile layout cancels playback. Random sky positions do not represent real celestial coordinates. Check playback with `tests/hr-animation.cjs`.

The named-star import is partial: 160 of 11,126 linked profile pages were retrieved before source rate limiting, yielding 198 unique components; 13 lack sufficient data to plot. The UI displays this coverage. Catalogue IDs and canonical names prevent repeated objects; shared system aliases do not merge distinct binary components. A missing T, L or R is derived from the other two and labelled. ESO luminosities and radii derive from Pickles' indicative bolometric magnitudes and calibrated temperatures. See `hr/data/SOURCES.md` for sources, formulas and reproducibility. Run `node hr/build-data.cjs` then `node hr/build-catalogue.cjs` to rebuild the bundled data. Run `tests/hr-data.cjs` and `tests/hr.cjs` with the workspace Node for data and browser checks.

## Capacitor Lab

Open `capacitor/`. Adjust resistance and either set C directly or derive it from plate overlap area, separation, and dielectric permittivity. Stacked charge, voltage–time and current–time graphs show both charging and discharging curves, with synchronized live cursors and time constant markers. Playback controls sit above all three graphs. Current is positive when charging and negative when discharging, with magnitude falling to 36.8% after one time constant. The shared time axis stays fixed when circuit parameters change; Fit 5τ rescales it on demand. Playback runs at one time constant per real second, or 0.1 with Slow motion enabled, with physical elapsed time labelled. Changing parameters restarts the experiment. Discharge starts at the full 6 V supply voltage.

Uses C = ε₀εrA/d, τ = RC, Q = CV, and exponential RC voltage/current laws, with SI conversions from cm², mm, MΩ, and nF. Materials use representative relative permittivities. The parallel-plate model assumes full dielectric filling and neglects fringing and leakage. The physical units and plot are accurate; plate dimensions and current dots are schematic.

Run `tests/capacitor.cjs` with the workspace Node while the local preview server is running, or set `PLAYGROUND_URL` to check a deployed site.

## Moments Lab

**Game mode** adds ten fictional scenarios: an overhanging book, seesaw, wardrobe, market scales, builders' plank, crane, bridge, mobile, camera boom, and festival sign. Each defines editable masses/pivots and locks its fixed loads. Some require adding a specific counterweight. Check balance accepts a difference of at most 0.2 N m, with both opposing moments nonzero and the beam horizontal. Hints and retries are unlimited; completing a level unlocks the next. Progress lasts for the current page session. Switching back to Sandbox restores its saved loads.

Game diagrams render the actual scenario objects and supports in the interactive SVG. Books, riders, wardrobes, baskets, tools, crane loads, trolleys, ornaments, cameras, and lanterns sit at the same horizontal coordinates used by the moment calculations. Unlocked objects can be dragged directly; force arrows pass pointer events through to the objects beneath. Object sizes are illustrative, while the ruler and force application positions preserve the model distances. The sandbox retains its plain beam diagram.

With the local server running, browser checks are in `tests/moments.cjs` and `tests/moments-game.cjs`. Run them with the workspace Node. They use the workspace Playwright installation and Edge; set `PLAYGROUND_URL` to test another deployment. The game check solves all ten levels through the UI and verifies progression and sandbox restoration. Screenshots are written to ignored `artifacts/`.

Open `moments/`. Drag the beam to place it, drag the pivot along it, and add, move, edit or remove up to eight attached masses. Numeric controls provide keyboard access to beam length, beam mass, pivot position, and each load. Toggle force and moment arrows, inspect the individual moments in the table, or release the beam to watch it rotate.

Weights use g = 9.81 m/s². Moments use the horizontal (perpendicular) distance to each vertical weight. Positive torque is clockwise in screen coordinates. Angular motion integrates torque divided by the point-mass and uniform-beam moment of inertia at 120 Hz, with light pivot damping. The pivot is fixed and masses stay attached; no collisions are modelled. Editing the setup holds the beam level again. A zero-inertia configuration does not rotate.

## Motion Lab

Open `ball/`. Drag the ball and release to throw it, or focus the simulation and use arrow keys. Gravity and bounciness are adjustable. Pause freezes simulation time; Reset clears the graphs and returns the ball to its starting point, preserving the gravity and bounciness settings.

The distance graph measures ball centre height above the floor. Velocity and acceleration are vertical components, positive upwards. Physics runs at 120 fixed steps per simulated second; graphs retain 12 seconds sampled at 60 Hz. Acceleration is the change in vertical velocity per plotted interval, including collisions and dragging. Its graph stays scaled around gravity, with a dashed ?g reference and edge triangles for spikes outside the displayed range. Bounces apply a restitution coefficient; low-energy contacts settle on the floor. There is no air resistance. Hidden tabs suspend time.

## Preview

Serve this folder with any static web server. From the workspace:

```powershell
& ../.runtime/node-v24.13.0-win-x64/node.exe serve.cjs
```

Open http://localhost:4185/playground/.

## Publish on GitHub Pages

Push this directory as a repository named `playground` on the `main` branch. In the repository's **Settings → Pages**, select **GitHub Actions** as the source. The included workflow deploys the site after every push to `main`.

Expected address for 3141asmith: https://3141asmith.github.io/playground/

## Add projects

Add another project card in `index.html`. Link to a hosted project or add its static files in a new subdirectory and use a relative link. Update the visible project count too.

## Refresh bundled projects

Copy `index.html`, `style.css`, and `simulation.js` from `../electron-diffraction/` into `electron/`.

For Quickdraw, run `build-pages.cjs` in `../quickdraw-viewer/` and copy the contents of its `docs/` directory into `quickdraw/`. Preserve the upstream data attribution. Full dataset files are never bundled: visitors download categories directly from Google and cache them in their browser.

Project previews come from the existing workspace screenshots. The original project directories are unchanged.
