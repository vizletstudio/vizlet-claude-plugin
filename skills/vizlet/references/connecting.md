# Connecting to Vizlet

The server is `https://mcp.vizlet.ai`. It signs people in with OAuth 2.1 and
dynamic client registration, so there is no key to copy: the user approves
access in a browser and every tool then runs as them.

## Claude Code

- **With this plugin installed**, the server is already configured. Run `/mcp`,
  pick the Vizlet server, and sign in.
- **Without the plugin:** `claude mcp add --transport http vizlet https://mcp.vizlet.ai`,
  then `/mcp` to sign in.
- If the user had already added the server by hand (often as `vizlet-mcp`), they
  now have it twice. Suggest removing one, or the same tools appear under two
  prefixes.

## Claude on the web and in the desktop app

Settings, Connectors, **Add custom connector**, and enter `https://mcp.vizlet.ai`.
Claude discovers the OAuth endpoints and registers itself.

## When it will not connect

- **A corporate web gateway** may block `mcp.vizlet.ai` as an uncategorised
  domain and answer with an HTML page, which an MCP client reports as a
  connection or protocol error. Options, best first: ask IT to allow
  `mcp.vizlet.ai`; use Claude on the web, whose connectors are called from
  Anthropic's servers rather than the user's network; or use the stdio proxy
  from Vizlet's MCP docs, which forwards to Vizlet's cloud-function origin
  instead.
- **Signed in but tools refuse:** every tool runs under the user's own row-level
  security. `list_organizations` shows what the session can reach; if the org
  the user expects is missing, they are signed in as someone else.

If none of this works, say so plainly. Do not write a viewer of your own and
present it as Vizlet.
