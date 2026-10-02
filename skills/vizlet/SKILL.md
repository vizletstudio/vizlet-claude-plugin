---
name: vizlet
description: This skill should be used when the user wants to view, review, mark up, measure, section or share a 3D, CAD, BIM, mesh, point-cloud, terrain or volume model, for example "open this STEP file", "review this IFC with the team", "show me this point cloud", "check the clearances in this assembly", "make a 3D viewer I can send to a client", "publish a link people can comment on and approve", or when they want a live spatial workspace (a digital twin, a 3D presentation, a small spatial app) that non-developers can keep editing. It drives the Vizlet MCP tools (list_plates, create_track, import_model_asset, verify_track, render_track, publish_track). Not for a one-off chart or diagram of data already in the conversation; draw that directly.
---

# Vizlet

Vizlet serves 3D, CAD and spatial data as live workspaces that people open in a
browser: no install, and no login for whoever you share them with. You build them
by calling Vizlet's MCP tools. You do not write viewer code; you pick a
purpose-built viewer and fill it in.

Two words carry the whole model:

- A **plate** (Vizplate) is the program: which plugins run, the scene graph, the
  toolbar. About eighty ship built in, and organizations add their own. Plates
  cannot be changed from the MCP tools.
- A **track** is one instance of a plate plus its state: the models, markers,
  measurements, notes and charts. Everything you write is track state.

Most review tools (section planes, measurement, pins, walk-through) are used by
the people you share the track with, in their browser. Your job is to choose the
plate, load the data, check the result, share it, and read back what people
decided.

## When to use it, and when not to

Use Vizlet when:

- the user has a model file to look at, section, measure or annotate;
- the result is for other people: a design review, a punch list, a client
  walk-through, a scan someone has to check, anything that needs a link,
  comments or an approve/reject verdict;
- the thing should keep living: a twin fed by live data, a presentation, a small
  app somebody non-technical will edit next week.

Do not use it for a one-off chart, plot or diagram of data already in the
conversation. Draw that directly: it is faster and needs no account. The same
goes for a model the user only wants converted or analysed, with nobody looking
at it.

## First, check the tools are there

The tools are named `list_plates`, `create_track`, `import_model_asset` and so
on, behind a prefix that depends on how the server was connected. If they are
not loaded yet, search the available tools for "vizlet" rather than for an
exact name.

If there are none, tell the user how to connect, rather than writing a
stand-in viewer and presenting it as Vizlet:

- **Claude Code:** run `/mcp` and sign in to the Vizlet server. Without this
  plugin, add the server first with
  `claude mcp add --transport http vizlet https://mcp.vizlet.ai`.
- **Claude on the web or desktop:** add `https://mcp.vizlet.ai` as a custom
  connector.

[references/connecting.md](references/connecting.md) covers the rest, such as a
corporate gateway blocking the domain. If they cannot connect, offer to write a
self-contained viewer instead, and say that is what it is.

## The loop

1. **Pick a plate.** `list_plates` lists them, and
   [references/plates.md](references/plates.md) maps common jobs to a starting
   plate. Confirm your choice is in the live list, since the catalog grows every
   week. Then call `list_plates` again with `plate_slug` set: that returns the
   plate's **authoring brief**, meaning its plugins and, for each plugin, a
   summary, the state keys it owns and the action ids. Then call it once more
   with `plugins` set to the ones you will write, for their full state shapes.
   Add `ui` to that list when you will write the plate's chrome (toolbars,
   header, panels, tabs): it returns the plate's own `ui` tree and hooks, the
   node types and toolbar items its plugins add and, on a plate whose
   `uiAuthorable` is true, the grammar a `ui` slice is written in.
   Those two answers are your vocabulary for every write that follows. When
   the brief opens with a `quickstart` (a template plate such as
   `digital-twin`), follow it instead: one write of its manifest and a layout
   builds the app, so do not rebuild its mechanisms from rules and bindings.
   For something no plate covers, use the `sandbox` plate: a
   blank chassis whose whole app (geometry, charts, panels, legend controls,
   event wiring) lives in track state.
2. **Make a track, then open it where the user can see it.**
   `list_organizations`, then `list_projects` (or `create_project`), then
   `create_track` with the plate's slug. Its result carries `url`, the track's
   full view — the page a person opens to look at it — and `studio_url`, the
   in-app editor.

   Open `url` beside the conversation before writing anything and keep it
   there: the desktop app's browser pane, the Claude for Chrome extension, or
   the link in your first reply. Being told "too bright" while it appears is
   what Vizlet is for. **Reload after every write** — nothing pushes state
   changes to that page, so a stale tab reads like a write that did not land.

3. **Put the data in.**
   - A model file: call `list_assets` first and reuse an uploaded model by its
     `asset_id`. A file on the public web goes to `import_model_asset` as a
     https `source_url`. A local file, the usual case in a repo, goes up
     through `create_upload_url`: run the curl line it returns with the file's
     real path, then pass its `upload_path` to `import_model_asset`.
     `import_model_asset` takes glTF/GLB, OBJ, STL, PLY, 3MF, IFC, STEP,
     IGES, DWG, DXF, PCD, XYZ and X3D. Several plates accept more through their
     drop zone in the browser (LAS/LAZ scans, NIfTI and NRRD volumes, VTK
     results, PDB structures). For those, send the user the track's
     `studio_url` and ask them to drop the file onto it; a read-only public
     link may not offer the drop zone.
   - Structured data (markers, tables, charts, annotations): prefer
     `run_studio_action`, which runs named, schema-checked edits.
     `list_studio_actions` with `plugins` set to the plugins you are writing
     returns their actions with parameters; with no arguments it returns only
     the names. Use `update_track_state` (a deep merge, namespaced by plugin
     key) only for what the action catalog does not cover. Send only what
     changes, never a whole slice again; to delete an item, write it as
     `null`. Every write's receipt names its `version_index`; if one breaks
     the track, `restore_track_version` puts back the version before it,
     which is far cheaper than rebuilding.
   - Buttons, keys, clicks and rules that CALL an action (an interactions
     binding, a rule's `then.action`, a legend control, a ui `hook`): take the
     param keys from the detail brief's `actionParams` or from
     `list_studio_actions`, whose `runtime` actions are the ones that run in
     the viewer. A key the action does not declare is silently ignored, so do
     not guess one. A string `target` may be a list of ids
     (`"target": ["rotor", "fan2"]`): the action runs once per id, so one
     entry replaces a copy of the action per part. The same rule or binding
     for each of several things (a status per station, a click per part) is
     ONE entry with `each`: `{field}` in its strings is filled from every
     entry.
   - Chrome (a `ui` slice, on a plate whose `uiAuthorable` is true): give each
     node you may change later an `id`. A later patch then sends only the nodes
     that change, because a list whose items all carry an `id` merges by id;
     `{"id": "x", "$patch": "delete"}` removes one. A list with any item
     lacking an `id` replaces the whole list.
   - A 3D scene people will look at: set `threejs.look` before anything else.
     The brief lists the looks, for example `showroom` indoors, `studio` for
     parts and products, and `golden-hour` outdoors. That one key sets the light
     rig, sky or environment, tone mapping, shadows, fog, bloom and
     antialiasing from a measured recipe. Exposure, lights or post settings you
     write yourself override it piece by piece, so leave them out. On a track
     that already has them, set them to null in the same `update_track_state`
     patch.
   - Geometry built from `primitives`: draw repeated things (trees, posts,
     rollers) as ONE item with `instances` or `scatter`, not one item each.
     A regular repeat is one `instances` entry with a `count`: `step` makes a
     row, `turn` a ring (or three blades on a hub), and `count: [nx, ny, nz]` a
     grid. Never list regular coordinates by hand. Build an assembly as a `group` item that its parts name as `parent`, so
     it moves and spins as one piece. `instances` on a group draws the whole
     assembly again at each one (seven turbines are one group), and every copy
     follows its parts: spin a part and it turns in every copy. A part whose
     speed follows a live value (a rotor, a fan, a pump) is one `binding` with
     target property `spin.x|y|z` and a `curve` transform, not a rule per
     speed band.
4. **Check it, both ways, every time.** They catch different failures.
   - The document. Every `update_track_state` and `run_studio_action` answers
     with a receipt instead of the state: the version, the top-level slices
     that `changed`, `state_bytes`, and `verify`, the `verify_track` verdict on
     what it saved. Read `verify` after every write, and read `inert` and
     `partial` in it, not only `ok`: `inert` names state slices no plugin will
     ever read, and `partial` means whole checks were skipped. It also checks
     every action the track calls: `actions.known` is a name its plugin does
     not have, and `actions.params` a key the action does not declare. Fix
     both before the next write. `verify_track` gives the same verdict for the
     track as it stands. Ask a write for `echo` only when you need the whole
     merged state back; it is often too big for one result.
   - The picture. Pass `render` (`{}` for the defaults) on the write that
     should change what is on screen: the same call returns a screenshot from
     a real browser as an image (1 credit, 10 to 50 seconds). `render_track`
     takes one on its own and also stores it as a project asset. Look at
     it: a blank canvas, a model framed off-screen or overlapping panels are
     yours to catch before anyone else sees them. Read `mounted` and `settled`,
     and the `warning` that explains either: false means the picture shows a
     loading screen, or a scene still changing. Every render loads the track
     from scratch, so rendering again gives a slow scene no more time. Read
     `console_errors` too, the fastest explanation for a blank scene. For a
     plate that draws on a canvas, render a
     second time with `dpr` set to 2. If no image came back (an older server, or
     `image_omitted` for a very large screenshot), you have not seen it: point
     the user at the stored screenshot instead of describing it. If it reports
     that rendering is not configured, nothing was rendered or charged: tell the
     user the deployment has no render service, rely on `verify_track`, and do
     not describe how the result looks.
5. **Hand it over.**
   - `publish_track` returns a public, no-login link. What viewers can do on it
     depends on the plate:
     - Most plates in [references/plates.md](references/plates.md) keep all
       their tools, so viewers can measure and section.
     - The ones marked **Studio plate** there, such as the twins, the decks and
       the `sandbox` plate, treat measuring, markup and notes as optional
       viewer tools, hidden until the track turns them on. If
       `list_studio_actions` with `names` set to `["presentation.setTools"]`
       returns it, call it with the tools viewers need before you publish. If
       it does not, ask the user to switch them on in the Studio's Presentation
       settings (`studio_url`).
     - Board and storyboard plates lose their editing tools on a read-only
       link. Pass `viewer_lock` false when viewers should edit.

     `freeze_plate` true also freezes the plate itself into the link, and
     bills a publish credit.
   - `promote_track_to_plate` releases the track as a reusable app that other
     people instantiate with their own data. A slug that already holds a plate
     you can edit is **overwritten in place, with no history**, so confirm with
     the user before reusing one.
6. **Close the loop.** People answer on the link. `list_review_events` reads
   their notes, acknowledgements and approve/reject verdicts; pass `after_seq`
   to read only what is new. `register_callback` POSTs them to an https endpoint
   instead of polling (org admins only; the signing secret is shown once).

A job that runs through several plates, such as survey to site twin or
coordination to close-out, is a **workflow**: `list_workflows`,
`instantiate_workflow`, `get_workflow_progress`. Each stage is its own track,
and stages hand each other a file or a link, never live state.

## Rules that prevent silent failure

- **Never guess a name.** Plugin keys, action ids and plate slugs come from the
  authoring brief, `list_studio_actions` or `list_plates`, and from nowhere else.
  An invented name is the most common failure: `update_track_state` saves it
  anyway, and only its `verify` verdict says nothing reads it.
- **A success response is not evidence.** Writes succeed whether or not anything
  reads them. Only a verdict (a write's `verify`, or `verify_track`) reports an
  ignored slice, and only a render shows whether anything drew.
- **Work with the plate, not against it.** A non-empty state slice named after a
  plugin activates that plugin even when the plate did not declare it, so the
  declared list is a floor. When that is not enough, move to the `sandbox`
  plate rather than forcing a plate built for something else.
- **Spend deliberately.** A render, from `render_track` or a write's `render`,
  costs 1 credit per image, `render_subject`
  (a photorealistic image of a design) about 17.6 and only for the track's owner,
  and `freeze_plate` a publish credit. Say so before running a batch.
- **Some steps need an org admin:** `register_callback`, `revoke_callback` and
  `instantiate_workflow`. Signing off a workflow stage has no tool at all; a
  person does that.
- **Some edits need the in-app Studio.** `run_studio_action` covers edits that
  only change track state. Camera capture, and anything that touches live
  geometry, has to be done in the Studio by a person — so hand over
  `studio_url` rather than describing where to click.

## File what the tools could not do — without being asked

`report_authoring_gap` files one line into Vizlet's triage queue, ranked with
every other cause and raised as a GitHub issue. It is
the ticket channel: asked to report something about these tools, file it there
instead of drafting text for someone to paste somewhere.

**File the moment you hit it, not when someone asks**, once per gap: you
guessed what the tools could have told you, worked around one, took five calls
over a one-call job, or asked the user to do a step because nothing here
reached it. None of that throws, so nothing else reports it. Give a `summary`
that stands alone and a `subject` naming the tool; its description says what
not to file. Then tell the user, in one line, that you filed it.

## Reporting back

Give the user:

- where to look while you work: the track's `url`;
- the link, and whether it is read-only or interactive;
- what you checked: the verdict clean, the render settled, no console errors;
- what you could not do, such as a format only the drop zone accepts, or a step
  that needs the Studio or an org admin — and whether you filed it with
  `report_authoring_gap`;
- where the screenshot is, so they can look for themselves. A write's `render`
  stores nothing, so take the final one with `render_track`.

Describe how the result looks only from an image you actually looked at. If no
image came back, say that you have not seen it.
