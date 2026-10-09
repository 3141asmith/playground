# Playground

A small, static home for experiments and projects. Includes the electron diffraction animation, browser-only Quickdraw viewer, and Motion Lab: a draggable, bouncing ball with live vertical motion graphs. No build step or server API is needed.

## Motion Lab

Open `ball/`. Drag the ball and release to throw it, or focus the simulation and use arrow keys. Gravity and bounciness are adjustable. Pause freezes simulation time; Reset clears the graphs and returns the ball to its starting point, preserving the gravity and bounciness settings.

The distance graph measures ball centre height above the floor. Velocity and acceleration are vertical components, positive upwards. Physics runs at 120 fixed steps per simulated second; graphs retain 12 seconds sampled at 60 Hz. Acceleration is the change in vertical velocity per plotted interval, including collisions and dragging. Bounces apply a restitution coefficient; low-energy contacts settle on the floor. There is no air resistance. Hidden tabs suspend time.

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
