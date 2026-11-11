# Revolve Lab

## Rotational symmetry

In extrusion mode, choose **Rotational symmetry** in **Find your symmetry**, then set an integer order from 2 to 24. Order N repeats the seed outline every 360/N degrees. **None** keeps the original outline. The numbered outline remains editable with the normal snapped vertex and Bézier tools; pale copies and radial guides follow it. Rotation is calculated before polygon operations rather than snapping copies back onto the rectangular grid. A seed may already have additional rotational symmetry.

Choose centre coordinates or use **Centre on outline** to use its snapped bounding-box centre. On a closed outline, drag the purple centre marker to reposition it. The original outline, centre, mode and order participate in undo/redo. Symmetry settings are retained but inactive in revolve mode.

Overlapping copies are unioned before extrusion: volumes count the occupied area once, holes have walls, and disconnected regions remain separate printable pieces in the same STL. Point/edge contacts that cannot form a manifold solid are rejected with an adjustment message. STL uses the same union at the finer 0.01 mm curve tolerance, independently of camera orientation. The union uses a 0.00001 mm integer geometry grid; near-coincident points are cleaned within 0.00002 mm. This is substantially finer than the drawing snap and curve tessellation. Cap edges are split where hole bridges would otherwise leave T-junctions; every float32 edge and vertex fan is audited for closure.

`tests/symmetry-models.cjs` checks every order 2–24, no overlap double-counting, holes and disconnected components, difficult collinear hole caps, curves, winding and independently audited STL files. `tests/symmetry.cjs` checks controls, measurements, STL downloads, centre snapping, seed edits, undo/redo, mode switching and mobile layout.

Bundled geometry dependencies are [Clipper 6.4.2](https://github.com/junmer/clipper-lib) (Boost Software License, with original attribution and embedded JSBN notice retained) and [Earcut 2.2.4](https://github.com/mapbox/earcut/tree/v2.2.4) (ISC). Their browser distributions and licences are in `vendor/`; no runtime CDN or package installation is needed.

## Extrusion mode

Choose **Extrude to a thickness** in **Build your solid**. The current outline is preserved when switching modes. Clear it to draw a new closed shape, using the existing snap settings (0.5, 1, 2 or 5 mm), vertex dragging, keyboard/numeric editing, Bézier handles and undo/redo. Rectangle, triangle and concave L-shaped bracket presets are available in extrusion mode.

Set **Extrusion thickness / mm** from 0.1 to 1000 mm. The 3D preview updates as you type and supports orbit, zoom, wireframe and automatic rotation. Measurements show the outline's height and width, volume (area × thickness) and surface area (two caps plus perimeter × thickness). Curves use the same adaptive approximation as revolution. The revolution axis has no effect in extrusion mode; outlines can cross it. Self-intersecting or open outlines cannot be exported. Mode and thickness changes are included in undo history.

**Download STL** creates a binary STL with the drawn outline in XY and thickness in Z, in original millimetres, with the bottom at Z=0. Its XY origin is translated to the outline's lower-left bounds. Export is independent of the camera. Front/back caps use concave-polygon triangulation, with a shared boundary for the side walls. Float32 facets are checked for degeneracy and every edge must have two oppositely directed incident triangles. STL contains geometry; choose millimetres in your slicer.

`tests/extrusion-models.cjs` independently decodes and audits STL files for dimensions, volume, normals and watertightness, including concave/curved shapes, reversed winding, translated outlines, collinear edges and invalid inputs. `tests/extrusion.cjs` checks grid drawing, thickness, preview, downloads, camera independence, undo/mode switching and mobile layout. Existing revolve, curve and STL checks also cover regression behaviour.

## Bézier curves

Choose **Bézier** in **New edges** to add cubic curve segments as you draw. Alternatively, select an existing edge (or its starting vertex) and change **Edge type** to **Bézier curve**. Initially its controls lie on the straight edge: drag the two orange square handles to bend it, or enter handle coordinates and use **Apply handles**. Each handle snaps to the selected grid spacing. Arrow keys move a selected handle; Delete converts its edge back to a straight line. Vertices remain circular handles.

Moving a vertex also moves the control attached to that endpoint. Curve edits, conversions, vertex edits and removal are covered by undo/redo. A closed outline can mix straight and curved edges, including the closing edge. Change **Edge type** back to **Straight** to remove its curve.

The canvas draws cubic Béziers directly. The solid and its approximate area/volume measurements use adaptive subdivision with a 0.03 mm control-polygon flatness limit. STL uses a finer 0.01 mm limit. Maximum radius and height use analytic Bézier extrema. Up to 80 anchor vertices and 512 sampled profile vertices are supported; overly intricate curves produce an explanation rather than freezing the editor. Curves crossing the centre line or producing a self-intersecting sampled outline are rejected.

`tests/revolve-curves-models.cjs` checks cubic evaluation and extrema, adaptive subdivision, an independently integrated curved volume, invalid curves, and watertight curved STL files including partial caps. `tests/revolve-curves.cjs` checks new curve drawing, conversions, numeric/drag/keyboard handles, endpoint attachment, deep undo/redo, 3D updates, downloads and mobile layouts.

## STL export

Use **Download STL** above the 3D canvas to download the current closed outline at its current revolution angle. Export is available for a valid, nonzero solid, including a paused partial revolution. Finish or pause the animation before downloading.

- Binary STL with outward facet normals and zero attribute bytes.
- Original model coordinates in millimetres; STL itself has no standard unit field, so import as **millimetres** in the slicer.
- Z-up, rotation axis through X=Y=0, and the lowest point at Z=0. Camera rotation and zoom do not change the file.
- Up to 360 angular segments per full turn, separately from the lower-resolution display mesh.
- Closed planar cut faces for partial turns, including concave outlines. Collinear profile points are removed consistently from both cut faces and swept surfaces.
- Seam and axis vertices are welded at the float32 precision written to the file. Each edge must have two oppositely directed incident facets; vertex fans must be connected. Non-manifold pinches are rejected with an explanation.

The STL describes geometry, not printer toolpaths. Open it in a slicer to choose material, supports, infill and other print settings.

Run `tests/revolve-stl-models.cjs` to decode and audit the output independently: structure, scale, base placement, normal orientation, edge closure and enclosed volume, across presets, partial sweeps, reversed/left/translated profiles and collinear boundaries. `tests/revolve-stl.cjs` checks real browser downloads, camera independence, availability and mobile use. Existing model and interaction checks remain in `tests/revolve-models.cjs` and `tests/revolve.cjs`. Browser tests use workspace Playwright/Edge and support `PLAYGROUND_URL` for live verification.
