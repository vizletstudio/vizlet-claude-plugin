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
| `digital-twin` | **Studio plate.** An asset (or a fleet) with a timeline clock and telemetry widgets fed by a datasource. |
| `terrain-twin` | **Studio plate.** A site rather than an asset: terrain plus readings from stations across it. |
| `deck3d` | **Studio plate.** An interactive 3D presentation with hotspots and camera-view slides. Capturing slides needs the in-app Studio. |

## Anything else

| Plate | Use it for |
|---|---|
| `sandbox` | **Studio plate.** A blank chassis: 3D canvas, 2D overlay and a drop zone, with the whole app written as track state. Release the result with `promote_track_to_plate`. |
