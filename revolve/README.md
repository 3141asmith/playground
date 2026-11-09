# Revolve Lab: STL export

Use **Download STL** above the 3D canvas to download the current closed outline at its current revolution angle. Export is available for a valid, nonzero solid, including a paused partial revolution. Finish or pause the animation before downloading.

- Binary STL with outward facet normals and zero attribute bytes.
- Original model coordinates in millimetres; STL itself has no standard unit field, so import as **millimetres** in the slicer.
- Z-up, rotation axis through X=Y=0, and the lowest point at Z=0. Camera rotation and zoom do not change the file.
- Up to 360 angular segments per full turn, separately from the lower-resolution display mesh.
- Closed planar cut faces for partial turns, including concave outlines. Collinear profile points are removed consistently from both cut faces and swept surfaces.
- Seam and axis vertices are welded at the float32 precision written to the file. Each edge must have two oppositely directed incident facets; vertex fans must be connected. Non-manifold pinches are rejected with an explanation.

The STL describes geometry, not printer toolpaths. Open it in a slicer to choose material, supports, infill and other print settings.

Run `tests/revolve-stl-models.cjs` to decode and audit the output independently: structure, scale, base placement, normal orientation, edge closure and enclosed volume, across presets, partial sweeps, reversed/left/translated profiles and collinear boundaries. `tests/revolve-stl.cjs` checks real browser downloads, camera independence, availability and mobile use. Existing model and interaction checks remain in `tests/revolve-models.cjs` and `tests/revolve.cjs`. Browser tests use workspace Playwright/Edge and support `PLAYGROUND_URL` for live verification.
