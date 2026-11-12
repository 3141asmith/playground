# Revolve Lab

## PLA estimate

Below the 3D model, **Estimated PLA needed** shows approximate filament mass in grams and length in metres, plus the model's solid-PLA mass before allowance. It updates with geometry edits, symmetry, retained cut-outs, undo, imported models and the current revolution angle. Open/invalid/zero-volume solids clear the estimate. **Print settings** opens the assumptions in the Measure menu and focuses the infill field.

Defaults are 20% infill, 0.8 mm uniform shell thickness, 1.24 g/cm³ density, 1.75 mm filament and 10% extra material allowance. Density is based on [Prusament's manufacturer data](https://prusament.com/wp-content/uploads/2023/05/22_12_07_BL_Prusament-PLA-by-Prusa-Polymers9051-89-2_EN.pdf) and can be changed for the chosen filament. These settings are session-only and do not alter geometry, STL or saved project data.

`material.js` estimates shell volume as `min(model volume, surface area × shell thickness)`, adds the chosen infill fraction of the remaining core, then applies the extra-material allowance. Mass uses mm³ ÷ 1000 × density in g/cm³. Filament length uses material volume divided by the circular filament cross-section, converted from mm to metres. This simple shell approximation can overestimate shells on curved or thin features and does not calculate supports, brim, purge paths, layer heights or print orientation. Use a slicer for a print-specific quantity.

`tests/material-models.cjs` checks unit conversions, full-density reference mass, shell/core handling, allowances, thin-part capping and parameter validation. `tests/material.cjs` checks the live estimates, geometry/undo updates, invalid input recovery, partial/zero-angle revolutions, settings shortcut and mobile placement.

## Top tool menus

The sticky toolbar opens **File**, **Model**, **Sketch**, **Curves**, **Symmetry**, **Transform**, **Shapes**, **Measure** and **View** panels. Controls are moved into these menus, using the same underlying elements and modelling operations. Undo, Redo and Clear remain directly accessible. Drawing and 3D canvases sit beside each other on desktop and stack on smaller screens; the toolbar remains available while scrolling.

Panels are non-modal: changes update the model immediately, and only one panel stays open at a time. Click the same tool button, its Close button, outside the panel, or press Escape to dismiss it. Escape and Close return focus to the invoking button. Menus fit within the viewport and scroll internally on smaller screens. File contains JSON save/load and STL export; Model contains revolution/extrusion, presets, axis, thickness and revolution animation. Sketch contains grid/vertex editing; Curves contains edge and handle editing. The other menus contain their corresponding precision and display tools. View also provides shortcuts to the drawing and 3D canvases.

`menus.js` uses native popovers where available, with a JavaScript fallback. `tests/revolve-menus.cjs` checks every menu, live edits, focus and dismissal, sticky behaviour, responsive bounds and the fallback. Existing modelling browser checks use `tests/revolve-menu-helper.cjs` to open the menu owning each control before interacting; geometry and project-data checks are unchanged.

## Precision CAD tools

**Move & transform** supports numeric XY offsets, rotation, independent X/Y scale percentages, horizontal/vertical reflection, and resizing to an exact bounding width and height. Choose a pivot at the selection's bounding-box centre or the grid origin. With retained geometry, transformations can target the selected outline, the selected shape and its cut-outs, or every shape. A rotational setup transforms its seed outline. Transformations include Bézier handles, preserve precision without resnapping, and reject nonfinite values or results outside the editor's coordinate bounds before changing anything.

**Duplicate with offset** uses the move offsets and copies the selected retained shape with all its cut-outs. For an ordinary outline or live symmetry setup, it retains the complete result before duplicating it. **Draw a precise shape** creates rectangles, circles made from four editable cubic Bézier arcs, and regular polygons with 3–32 sides. Define dimensions and a centre, then replace the selected outline, add material or add a cut-out. Circle/polygon width is a diameter; polygon diameter is measured through its circumcircle. Adding shapes/cut-outs is available in extrusion mode and retains existing symmetry first. Overlapping material is unioned by the existing retained-outline geometry. Circles and their printed surfaces use approximations, rather than exact analytic circle entities.

Select an edge and use **Split selected edge** at a percentage along its parameter. Straight edges gain a vertex; Béziers use de Casteljau subdivision, preserving their path exactly instead of snapping the split point or handles. Ordinary drawing and dragging still use the selected grid snap.

**Measure & resize** reports the selected outline's width, height, area, perimeter/path length, and selected edge length and endpoint-chord angle. Curved lengths and areas use 0.01 mm adaptive subdivision. These are measurements, not a persistent geometric constraint solver. Enable **Dimensions** in the drawing toolbar for bounding width/height rulers. Front, right, top and isometric camera presets are available beside the 3D preview controls. Camera changes do not change exported geometry.

All modelling operations enter undo history, and their resulting editable geometry is preserved by the existing JSON project format and STL export. Inspection/view preferences are session-only. `tests/cad-models.cjs` checks curve-aware affine transforms, known dimensions/volumes, exact Bézier splitting, primitive measurements, printable STL and invalid operations. `tests/cad.cjs` checks the interactive tools, grouped cut-outs, duplication, dimensional overlays, camera views, saved-project reload and mobile layout.

## Save and load editable projects

**Save project** downloads a `playground-revolve-project.json` or `playground-extrude-project.json` file. **Load project** opens one of these files to continue editing later, including after refreshing the page or on another device. Keep the downloaded JSON file; the site does not upload it or store projects on a server. STL remains the separate export for printing.

The versioned `playground-shape` format stores millimetre coordinates, vertices and Bézier handles, open/closed state, revolution axis and angle, extrusion thickness, symmetry settings, retained shapes and cut-outs, the active retained outline, grid snap and new-edge mode. Unfinished outlines can be saved. Camera orientation and the old undo history are not included. Loading adds one undo step, allowing the current project to be restored with Undo and the imported project with Redo.

`project.js` validates the file format/version/units, numeric settings, coordinate and handle bounds, booleans, outline selection and array sizes, and constructs clean state objects using known fields. Invalid files leave the current shape and its undo history untouched. Limits are 5 MB per file, 512 outlines and 16,384 total vertices, within the existing per-outline editing limits. Imported drafts may still need geometry corrections before STL export.

`tests/shape-project-models.cjs` checks data round-trips, deep-copy independence, draft support and malformed/unsupported input rejection. `tests/shape-project.cjs` exercises real JSON downloads and imports, continued editing settings, identical data round-trips, undo/redo, invalid-file recovery, symmetry and retained shapes, and mobile layout.

## Keep a rotational shape for free editing

Use **Keep shape & edit freely**, or choose **None / edit freely** while symmetry is active. The complete merged result is retained, symmetry turns off, and subsequent edits affect only the selected outline. The retained geometry uses the export's finer 0.01 mm curve approximation without snapping generated vertices to the drawing grid. Existing curves become editable straight segments along that approximation. New curves and vertex moves still use the normal editor tools and grid snapping.

Holes and disconnected components are retained. **Edit outline** selects a shape boundary or one of its cut-outs. **Add shape** draws an additional region that joins existing material where it overlaps; **Add cut-out** removes material from the selected shape. Close the new outline before switching outlines or exporting. **Remove outline** removes the selected cut-out or the selected shape and its cut-outs. A cut-out outside its parent never adds material. Preview, dimensions and STL reflect the complete collection, not just the selected outline.

Undo restores the original seed and rotational settings; redo restores the retained result, including all independent edits. Clear or choosing a preset starts a fresh outline. Retained collections stay in extrusion mode; undo or start a fresh shape to use revolution again. Up to 4096 editable vertices per retained boundary are supported, so generated outlines do not inherit the 80-anchor seed limit.

`tests/retained-models.cjs` audits preservation of dimensions, volume, holes and disconnected parts, cut-out operations, large contours, curves and closed STL files. `tests/retained.cjs` verifies retention by button and symmetry-off selection, asymmetric vertex edits and additions, export, removal, undo/redo and mobile layout.

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
