# Logic no plugin has

A plate's plugins cannot be changed from the MCP tools, and most apps need
none: bindings, rules and legend controls cover a lot. When they do not, there
are two tiers, both written as track state, both checked before anyone sees
them. Neither one draws. Generated code computes, then calls the actions of
plugins that do (`primitives`, `chart2d`, `markers`, `dataframe`, `richtext`,
`legend`), so rendering stays reviewed code.

## A script: small logic, no review

The `script` plugin runs short programs from `state.script.scripts`, on any
plate (a non-empty slice wakes it; `sandbox` declares it). The code is a
JavaScript subset (no classes, `try`, `async`, regular expressions or `this`)
run in a sandboxed interpreter with a step budget. It sees only:

- `call('plugin.action', params)`: runs an action and returns a copy of its
  result. An async action returns `undefined`.
- `read('slice.path')`: a copy of a value in track state.
- `get(path)` / `set(path, value)`: datasource fields.
- `vars`: its own persisted object. `event`: what triggered the run. `log(...)`.

A script's `on` is `'action'` (the default: point a ui hook, a legend control
or an interactions binding at `script.run { id, payload }`), `'load'`,
`{ every: ms }` (at least 100) or `{ datasource: 'path' }`. Write it with
`run_studio_action` (`script.add`, `script.update`) or `update_track_state`;
every write's receipt reports a script that does not compile.

## A sandboxed plugin: real computation, a person approves it

For a solver, a simulation or a layout algorithm, write an organization
plugin. It runs in a Web Worker per vizlet and reaches the vizlet only through
what its manifest declares; anything else is refused.

1. `list_plugins({ org_id })` first, to bump one rather than make a second.
2. `draft_plugin({ org_id, slug, description, source, manifest })`. The source
   is ONE call, with no import or export:
   `pluginApi.define({ name, setup(ctx) { ctx.actions.register('run', async (c, p) => { ... }) } })`.
   `manifest` holds only `requires` (the actions, events and services it uses)
   and `provides` (what it offers); the tool writes the rest. Every `ctx` call
   returns a Promise, and the plugin persists with `ctx.state.set` /
   `ctx.state.patch` (a `serialize` is never called). It needs an org admin,
   and is always saved as a draft. Read `check`: `errors` stop it,
   `warnings` are what would silently do nothing, and `needs_review` (network
   origins, asset writes) is what the approver will be asked about.
3. `test_plugin({ ref, fixture, calls })` runs it in a real browser Worker
   against fixture state and answers what it invoked, emitted, stored and
   logged, and whether it was quarantined. A pass means its own logic did what
   you meant, not that the actions it calls exist on a plate.
4. Attach it with `update_track_state({ customPlugins: [ref] })`. A draft runs
   only for org admins. A person approves it on the Sandboxed Plugins page
   (`/app/admin/org-plugins`) before a publish can include it; say so to the
   user rather than presenting a draft as shipped.

## A node a woken plugin needs

A plugin woken by its slice gets no scene node from the plate, and some (a
controller, a drop zone) do nothing without one. `list_plates` with `plugins`
says, per plugin, whether the plate lacks its node. On a plate whose
`uiAuthorable` is true (such as `sandbox`), add it with
`update_track_state({ sceneNodes: [{ "type": "<plugin>.<node>", "id": "..." }] })`;
it is built on the next load.
