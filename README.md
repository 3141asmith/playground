# Playground

A small, static home for experiments and projects. Includes the electron diffraction animation, browser-only Quickdraw viewer, Motion Lab: a draggable, bouncing ball with live vertical motion graphs, and Moments Lab: a beam, pivot, and movable loads. No build step or server API is needed.

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
