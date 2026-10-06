# Which plate for which job

A starting point, not the catalog. `list_plates` is the live list, and a plate's
own description (plus its authoring brief, from `list_plates` with `plate_slug`)
is the authority on what it does. Every id in the tables below is checked
against the catalog when this file changes, but new plates arrive every week, so
look at the live list before settling.

What viewers of a published link can use: every plate below keeps all its tools,
except the ones marked **Studio plate**. Those hide measuring, markup and notes
from viewers until the track turns them on; SKILL.md's hand-over step says how.

## Look at a model

| Plate | Use it for |
|---|---|
| `default3d` | Just open a model (GLB/glTF, OBJ, STL, PLY, 3MF, STEP, IGES or a point cloud) with an object tree. The safe default. |
| `intro` | You do not know what the file is. Its drop zone routes a dropped file to the best-fit workspace. |
| `aec-walk-through` | Walk through a building at eye height instead of orbiting it (IFC, glTF, OBJ, STEP). |

## Review a design with other people

| Plate | Use it for |
|---|---|
| `aec-model-review` | Pinned review comments on a building or product model; IFC elements classify by discipline. |
| `aec-section-measure` | Clipping planes, distances, angles, radii, paths and areas on a model. |
| `aec-issue-coordination` | Issues bound to selected objects, with priority, status and assignee. |
| `aec-clash-coordination` | Geometric clash detection on an IFC, with BCF round-trip. |
| `aec-punch-list` | Field close-out: numbered defects that flip from open to resolved. |
| `construction-4d` | Scrub a construction sequence built from an IFC's disciplines. |
| `assembly-bom` | Explode and section an assembly, then export a quantity take-off. |
| `game-asset-review` | Approve a rigged glTF/GLB asset and scrub its animation clips. |
| `dental-scan-review` | Intraoral scans and crown designs, shared with a lab or specialist. |

## Manufacturing

| Plate | Use it for |
|---|---|
| `print3d` | 3D-print prep: watertightness, overhangs, orientation, cost, STL/3MF export. |
| `milling` | CNC milling cost drivers read from B-rep faces (STEP, IGES, BREP). |
| `part-inspection` | Scan vs CAD: a scan of the part against its STEP/IGES model, a deviation map that computes once both load (name the pair by file in `state.deviation`: `a` the scan, `b` the CAD), ±0.1 mm band, PDF report. Align the scan first. |
| `cad-sketch-solid` | Model from scratch: sketch a profile, extrude or revolve, combine with booleans. |
| `robot-cell` | A URDF robot as a kinematic tree you can jog joint by joint. |

## Scans, terrain and science

| Plate | Use it for |
|---|---|
| `survey-scan-review` | Lidar and point-cloud review; LAS/LAZ arrive through the drop zone. |
| `terrain` | An SRTM elevation tile (.hgt) as an elevation-tinted mesh. |
| `sim-results-review` | FEA or CFD results from a VTK file, coloured by their scalar field. |
| `volume-viewer` | CT, MRI or micro-CT volumes (NIfTI, NRRD), raymarched. |
| `molecule-viewer` | Molecular structures (PDB, mmCIF, SDF, MOL, XYZ). |

## Live and presented

| Plate | Use it for |
|---|---|
| `digital-twin` | **Studio plate.** A template for a factory line, a plant, a fleet or one hero machine: write ONE `twin` manifest (assets, metrics, KPIs) and pick a layout (control-room, asset-focus, fleet, kiosk); status colours, alarms, KPI tiles, asset cards, a heatmap and a simulated shift come with it. Its brief opens with a `quickstart` to copy. |
| `terrain-twin` | **Studio plate.** A site rather than an asset: terrain plus readings from stations across it. |
| `deck3d` | **Studio plate.** A template for a product or client presentation: build the product from primitives (or import it), write ONE `showcase` manifest (parts with specs and explode offsets, an operating model with a slider and curves, a tour) and pick a layout (keynote, product-page, kiosk); spec cards, the exploded view, the tour, a lighting switch, readouts and a curve chart come with it. Its brief opens with a `quickstart` to copy. Capturing slides the old way still needs the in-app Studio. |
| `cartoon-2d` | A template for a 2D cartoon in the classic studio manner: write ONE `cartoon` manifest (sets of painted planes at depths, and shots whose camera pans, trucks and racks focus across them) and pick a style (classic, toon, tv, anime) and a layout (player, theater, animatic, kiosk); the multiplane parallax, the film look, the transitions and the play bar come with it. Its brief opens with a `quickstart` to copy. Characters and lip sync are not in it yet. |

## Play

| Plate | Use it for |
|---|---|
| `fps-arena` | A template for a first-person shooter level that plays in the browser: write ONE `fps` manifest (a themed room, cover kits, and entities placed by name: turrets, drones, pickups, barrels, hazards, a keycard door and an exit) and pick a layout (arena, range, attract); the HUD, the screens, the weapon in hand, the effects and the mechanics come with it. Its brief opens with a `quickstart` to copy. A level's models can be GLB files: `import_model_asset` with `attach: false` stores one without adding it to the scene and answers with its `size` and `triangles`. `fps-level-designer` is the plan-view editor for drawing a level by hand instead. |

**A game's look, decided with a person.** When someone should approve a game's characters, sets and props before or after they are in the game (a fighter, a beat 'em up, an fps level), put a track on the `look-board` plate in the same project; the `look-to-fighter`, `look-to-brawler` and `look-to-fps` workflows make both tracks. `run_studio_action look.compose` lays the assets out on the board, each with takes to paint, and `paint_art` on the board paints them. The person approves a take or asks for changes on the board's review panel (`run_studio_action review.ask` turns it on), and `get_track { digest: true }` reads each card's verdict. `run_studio_action look.apply { look: <the digest's apply> }` on the GAME's track then dresses the game with the approved takes, painting nothing twice. For a game made first, run `look.read` on its track, then pass its answer to `look.compose` on the board.

## Anything else

| Plate | Use it for |
|---|---|
| `sandbox` | **Studio plate.** A blank chassis: 3D canvas, 2D overlay and a drop zone, with the whole app written as track state, including logic no plugin has ([custom-logic.md](custom-logic.md)). Release the result with `promote_track_to_plate`. |
