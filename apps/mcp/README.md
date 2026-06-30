# @beacon/mcp

Beacon Model Context Protocol server. Exposes account health and outreach tools to Cursor (or any MCP client) over stdio, backed by the Beacon API and AI services.

## Prerequisites

- Node.js 20+
- Beacon API running (`apps/api`, default `http://localhost:3001`)
- Beacon AI running (`apps/ai`, default `http://localhost:3002`) — required for `draft_outreach`

## Setup

```bash
pnpm install
pnpm --filter @beacon/mcp build
```

Copy `.env.example` to `.env` and adjust URLs if needed:

```bash
cp apps/mcp/.env.example apps/mcp/.env
```

## Tools

| Tool | Description |
| --- | --- |
| `list_at_risk_accounts` | Accounts scoring below a threshold (default 40) with top negative drivers |
| `get_account_health` | Full health score, drivers, and history for one account |
| `draft_outreach` | Draft outreach via `@beacon/ai` `/next-action` |

## Cursor MCP config

Paste this into **Cursor Settings → MCP → Edit config** (`~/.cursor/mcp.json` or project `.cursor/mcp.json`). Replace `/Users/jeremy/beacon` with your repo path.

```json
{
  "mcpServers": {
    "beacon": {
      "command": "node",
      "args": ["/Users/jeremy/beacon/apps/mcp/dist/src/index.js"],
      "env": {
        "API_URL": "http://localhost:3001",
        "AI_URL": "http://localhost:3002"
      }
    }
  }
}
```

For local development without building first:

```json
{
  "mcpServers": {
    "beacon": {
      "command": "pnpm",
      "args": ["--filter", "@beacon/mcp", "dev"],
      "env": {
        "API_URL": "http://localhost:3001",
        "AI_URL": "http://localhost:3002"
      }
    }
  }
}
```

## Development

```bash
pnpm --filter @beacon/mcp dev
pnpm --filter @beacon/mcp test
```
