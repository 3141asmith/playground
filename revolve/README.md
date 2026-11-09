# Revolve Lab

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
