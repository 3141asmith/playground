# Playground

A static home for browser experiments: electron diffraction, Quickdraw, Motion Lab, Moments Lab, Capacitor Lab, Stellar atlas, Vector Lab, Wave Lab, Temperature Explorer and Computer Science. No build step or server API is needed.

## Computer Science — SLRs 2, 3, 4 and 9

`computer-science/` offers SLRs 2, 3, 4 and 9, mapped to OCR H446 1.1.2, 1.1.3, 1.2.1 and 1.3.1 respectively. Topic groupings were checked against Craig 'n' Dave's unit listings ([2](https://craigndave.org/video-categories/slr-2-types-of-processor/), [3](https://craigndave.org/video-categories/slr-3-input-output-and-storage/), [4](https://craigndave.org/video-categories/slr-4-operating-systems-systems-software/), [9](https://craigndave.org/video-categories/slr-9-compression-encryption-and-hashing/)) and the [OCR specification](https://www.ocr.org.uk/images/170844-specification-accredited-a-level-gce-computer-science-h446.pdf). Explanations, visual activities and practice questions are original, with no copied lesson materials or affiliation implied. Other SLRs are not implemented.

SLRs 2–4 use the shared renderer, authored lesson content and simulation models in `computer-science/shared/`. Each topic has explanation text, an interactive activity, model assumptions, exam distinctions and session-only review progress. Time-based activities provide play/pause, single-step, restart and a keyboard-accessible position slider; timers pause on topic changes and hidden tabs. Quizzes have explanations and balanced deterministic answer positions. Nothing changes the user's hardware, files, connectivity or system configuration, and no answers or simulation data are uploaded or saved.

SLR 2 has three topics and six questions: editable memory-latency RISC/CISC instruction traces; independent/dependent GPU work distribution; and an idealised serial/parallel speedup model. The timings and abstract lanes are explicitly not real-device benchmarks. SLR 3 has four topics and eight questions: a sensor/decision/actuator control path, magnetic/flash/optical/tape access diagrams, saved/unsaved RAM and ROM/firmware power-loss behaviour, and logical/physical remote storage with optional offline-copy availability. Virtual storage and virtual memory are explicitly distinguished.

SLR 4 has eight topics and ten questions: OS service permissions; FIFO demand paging and a separate variable-size segmentation/compaction example; prioritised, maskable interrupt recognition with saved/restored context; FCFS, SJF, SRTF, round robin and multi-level feedback queue scheduling; OS-type scenario classification; successful/failed boot paths; compatible/incompatible driver paths; and hosted system/process VMs with finite RAM and an isolated guest-failure illustration. Scheduling supports editable arrivals/bursts, idle periods, completion/waiting/turnaround/response metrics, and deterministic ties. Its three-level MLFQ model uses 1/2/4-unit quanta, demotion, strict-priority preemption, retained unused allotment and bottom-level round robin; it omits ageing, I/O and switch costs. This omission and the possibility of starvation are explained. `tests/cs-units-models.cjs` checks model results, five scheduling policies and all topic/question counts. `tests/cs-units.cjs` checks all 15 new labs, numerical outputs, failure cases, controls, quizzes, progress, keyboard access and every mobile panel.

### SLR 9

Four keyboard-accessible lesson tabs cover lossy/lossless compression with a live RGB precision experiment; editable step/play/pause RLE traces and dictionary coding; symmetric/asymmetric message encryption with animated transmission and unrelated-key rejection; and actual SHA-256 comparisons plus a toy collision/chaining hash table. Revision includes eight original multiple-choice questions with explanations, two written-answer prompts and session-only reviewed-topic progress. All processing stays in the browser. Messages, keys, answers and progress are not uploaded or persisted.

Models state their storage assumptions. The RGB experiment measures a quantised raw payload, not an actual JPEG. RLE uses 8-bit counts and 8-bit ASCII symbols and splits runs above 255. The dictionary model preserves spaces/punctuation, uses first-occurrence entries, fixed-width stream codes, 16-bit entry-length prefixes and a 32-bit header. Dictionary costs are included before calculating savings. Encryption uses temporary AES-GCM 256-bit keys with fresh 96-bit IVs, or RSA-OAEP 2048-bit keys with SHA-256, through Web Crypto on HTTPS/localhost. Input is limited to 160 UTF-8 bytes. These are short-message illustrations; key authentication, hybrid encryption and suitable password hashing are explained separately. The hash-table rule is explicitly non-cryptographic. Animations pause when leaving the lesson or hiding the tab; reduced-motion mode suppresses the packet animation. `tests/slr9-models.cjs` checks numerical/storage models; `tests/slr9.cjs` verifies the activities, actual encryption recovery and wrong-key rejection, SHA-256 vectors, quiz, accessibility controls, privacy and mobile layout.

## Temperature Explorer

Open `temperature/` and choose or drop TXT/CSV logs. The supplied example format is `2026-05-26 09:55:01, 24.80 C`; ISO date/time plus a number is required, with optional C/°C or F/°F (converted to Celsius). Unlabelled values are Celsius. CSV headers `timestamp,temperature_c` and `datetime,temperature` are accepted, along with comma, semicolon or tab separators. Invalid dates, malformed lines and temperatures below absolute zero are skipped and reported with example line numbers. Multiple selected files are merged, sorted, and deduplicated by timestamp; the last occurrence wins, with conflicts reported. Files replace the current dataset. Limits are 50 MB per file and 100 MB per selection. Processing stays in memory in the browser: no uploads or storage. The public example and homepage preview use generated data; the user's log is not included in the repository.

Choose all data, a day, a Monday–Sunday week, a calendar month/year, or inclusive custom dates. Previous/next buttons move calendar periods. All timestamps are interpreted as written using a neutral UTC coordinate, with no viewer-timezone or daylight-saving conversion. Summary cards show reading-weighted mean, min/max and their timestamps, median, population standard deviation and count. Diagnostics include the typical sampling interval, gaps above three times the median interval, and the largest interval. Missing readings are not imputed. Statistics always use all selected readings, regardless of chart resolution.

The main graph offers individual readings and hourly/daily/monthly averages, an extrema envelope, range-average line and pointer/keyboard-slider inspection. Automatic resolution adapts to the selected data span. Large plots are reduced into at most 1,600 time buckets while preserving extremes. A second graph groups readings by hour of day, and a paginated table gives daily mean/min/max/count. Export the selected readings or daily summaries as CSV, or save the graph as a standalone SVG. `tests/temperature-data.cjs` tests parsing, date boundaries, statistics and chart reduction. `tests/temperature.cjs` verifies the supplied 202,611-reading log, date filters, exports, multiple-file import, invalid-file recovery, mobile layout and navigation; it reads the original file from Downloads for local testing and never copies it into the site.

Additional analysis panels report 5th/95th reading percentiles, a time-weighted mean, estimated time coverage and expected reading count, daily temperature ranges, typical high/low times, warming/cooling rates and daily/weekly linear trends. Threshold controls estimate hours and covered-time percentages below/above chosen Celsius limits and inside the band. Linear interpolation estimates threshold crossings and trapezoidal integration weights the mean by duration. Intervals longer than three times the full uploaded log's median interval are excluded; unsampled selection boundaries are also unknown. The gap details list the five largest internal gaps and both unsampled boundaries. All data uses the first-to-last reading span; calendar/custom selections use their entire requested period. Expected counts are approximate, assuming the median sampling interval, and coverage is based on usable duration rather than raw reading count.

Rate windows of 15, 30 or 60 minutes end at observed readings, interpolate the starting value, and must not cross an excluded gap. Rates are expressed in °C/h. Daily extremes use the first occurrence when tied; circular means of their times avoid averaging 23:00 and 01:00 into noon. Flat days are excluded from typical extreme-time estimates, and balanced times around the clock produce no typical time. Mean daily range uses days with at least two readings; partial days can understate ranges. Trend fits give each observed day equal weight; weekly means average those daily means in Monday-based weeks, including partial periods. Daily slopes use °C/day, weekly slopes °C/week, and R² is displayed when defined. These are descriptions of the selection, not forecasts or evidence of a full annual seasonal cycle. A third graph switches between daily ranges, daily mean/trend and weekly mean/trend. Daily CSVs include range and extreme times; an additional analyses CSV includes settings, units and method notes. `tests/temperature-analyses.cjs` covers the controls, known results, plots, exports and mobile view. Numerical tests cover interpolation, equality at thresholds, midnight means, linear trends and empty/single/flat/sparse logs.

## Wave Lab

Open `waves/` for a progressive sinusoidal transverse wave. An orange particle stays at a fixed x coordinate and oscillates vertically on a dashed guide. Other medium particles also keep their horizontal positions. Pause/play, reverse direction without a displacement jump, step through paused motion, restart, and change playback speed. Adjust amplitude, wavelength, frequency and the selected particle's x position. Wave speed and period use v = fλ and T = 1/f.

Toggle **Real life** to show an illustrated water surface and a boat held at the selected horizontal position. The boat follows the surface vertically without drift or rocking; this is an idealised bobbing illustration, not a full water-wave or boat-dynamics model. Switching views preserves the wave phase and playback controls.

**Screensaver** fills the viewport with the boat scene and requests native fullscreen where supported. It loops through calm, clouds, rain, storm and clearing mist over four minutes, smoothly blending amplitude, wavelength, frequency, cloud cover, rain and fog. The same four-minute loop moves through day, sunset, night and sunrise, smoothly changing sky and water colours and fading between the sun, moon and stars. These are illustrative conditions rather than a forecast. Exiting restores the local-time sky and any selected local weather. Wave height and frequency increase towards the storm and then settle. The boat remains fixed horizontally. Exit or Escape restores the previous wave, view and playback settings. Native fullscreen denial falls back to an immersive viewport layout. Hidden tabs pause the cycle; local-weather requests are suspended during it. `tests/waves-screensaver.cjs` checks the cycle, fullscreen/fallback, restoration and mobile layout.

The water scene follows the visitor's device clock, with day, dawn, dusk and night lighting, an illustrative sun/moon and stars. It updates every minute independently of wave playback. Without location, the sky uses a 06:00–18:00 day window with one-hour dawn/dusk transitions; it does not claim to show actual weather or astronomical moon position/phase.

**Use local weather** requests browser geolocation only when clicked, then sends coordinates rounded to two decimal places to the public Open-Meteo forecast API. Current conditions drive clouds, rain, snow and fog, and local sunrise/sunset replace the clock-based day window. Weather refreshes every 15 minutes while the tab is visible; data older than 35 minutes is hidden. Coordinates and weather stay in memory for the current page session. **Local time only** clears them and stops requests. Denied/unavailable location, invalid data and network failures fall back to the local-time sky. Weather changes the illustration without changing the controlled wave physics. Source attribution is shown beside the controls. `tests/waves-environment.cjs` covers local time, optional geolocation, weather rendering, sunrise/sunset, fallbacks, opt-out and mobile placement using deterministic mocked API responses.

The wave is y = A sin(2πx/λ − phase), with phase advancing at ±2πf per simulated second. It represents an unbounded medium without reflections or damping. Parameter edits preserve phase; restart resets phase and time while preserving controls. Hidden tabs suspend playback, and reduced-motion preferences start it paused. `tests/waves.cjs` checks propagation direction, fixed particle/boat positions, surface-following motion, view switching, pause/reverse/step, parameters, playback speed, mobile layout and navigation.

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

The water scene occasionally includes seaweed, an old boot or driftwood passing across the surface. One appears after 35-70 seconds of water playback, then leaves a 65-130 second gap before the next visitor. Debris bobs and tilts with the wave, follows the travel direction at arrival, and pauses with playback. This decorative drift also appears in the screensaver; the teaching boat still stays fixed horizontally.
