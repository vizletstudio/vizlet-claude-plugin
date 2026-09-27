# Vizlet for Claude

Lets Claude open, review and share 3D, CAD, BIM and point-cloud models as live
browser workspaces, through [Vizlet](https://vizlet.ai). Ask Claude to put a
STEP assembly, an IFC model or a lidar scan in front of your team, and it
builds the workspace, checks it, and hands you a link people open without an
account.

| Part | What it does |
|---|---|
| `.mcp.json` | Adds Vizlet's MCP server, `https://mcp.vizlet.ai`. It signs in with OAuth, so there is no key to copy. |
| `skills/vizlet/` | Tells Claude when Vizlet is the right tool and how to author, check and publish a track. Its description (about 260 tokens) is in every session; the body (about 2.9k) loads only when the skill fires. |

## Install in Claude Code

```bash
claude plugin marketplace add vizletstudio/vizlet-claude-plugin
```

```bash
claude plugin install vizlet@vizlet
```

Then run `/mcp` in Claude Code, pick the Vizlet server and sign in.

If you had already added the server by hand, remove that copy so the tools do
not appear twice:

```bash
claude mcp remove vizlet-mcp
```

**Claude on the web or desktop:** add `https://mcp.vizlet.ai` as a custom
connector, and upload the `skills/vizlet` folder, zipped, as a custom skill.

## What it is for

Viewing, sectioning, measuring and marking up models (STEP, IGES, IFC, DWG,
DXF, glTF/GLB, OBJ, STL, PLY, 3MF, X3D, point clouds); design reviews other
people comment on and approve; and small spatial apps that non-developers keep
editing, such as digital twins and 3D presentations. In Claude Code, a model
file in your repository can go straight in: Claude uploads it for you.

It is not for a one-off chart of data already in the conversation. Claude
draws those directly, and the skill says so.

## Measuring routing

`evals/routing.mjs` checks that Claude reaches for this skill on 3D and CAD
jobs and not on near misses such as a bar chart or a G-code request. It runs
each prompt in `evals/routing-cases.json` twice, in a headless session with only
this plugin loaded, and exits non-zero if any case routes wrongly; `--baseline`
shows what Claude does without the plugin. It needs the Claude Code CLI signed
in, and costs about $0.10 a run.

## Links

- Developers: https://vizlet.ai/developers
- Privacy: https://vizlet.ai/docs/privacy
- Terms: https://vizlet.ai/docs/terms
- Support: https://vizlet.ai/contact

## License

This plugin (the skill, its references, the manifests and the routing eval) is
released under the MIT License; see [LICENSE](LICENSE). The Vizlet service it
connects to is not: that is governed by the
[Vizlet Terms](https://vizlet.ai/docs/terms).
