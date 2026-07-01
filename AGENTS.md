# Beacon Agent Instructions

Beacon is a pnpm monorepo for customer account health monitoring.

| App | Port | Role |
| --- | --- | --- |
| `apps/api` | 3001 | REST API + PostgreSQL |
| `apps/ai` | 3002 | Anthropic Claude summaries and outreach drafts |
| `apps/web` | 3000 | Next.js dashboard |
| `apps/mcp` | — | MCP tools for Cursor (stdio) |
| `packages/shared` | — | Shared types and scoring logic |

Use **pnpm** everywhere. API responses are `{ data: ... }` on success or `{ error: ... }` on failure.

## Cursor Cloud specific instructions

Cloud agents boot a full dev stack via [`.cursor/environment.json`](.cursor/environment.json):

1. **Postgres** starts with `docker compose up -d`
2. **Schema + seed** run in `start` via `.cursor/cloud-db-init.sh`
3. **Dev servers** run in background terminals: API (`:3001`), AI (`:3002`), Web (`:3000`)

### Required secret

Add `ANTHROPIC_API_KEY` in [Cursor Dashboard → Secrets](https://cursor.com/dashboard). The AI service and MCP `draft_outreach` tool need it.

Local Postgres credentials are fixed in `.cursor/cloud-env-setup.sh` (`beacon` / `beacon` / `beacon`).

### Verify changes

After implementing a feature or fix, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

E2E expects Postgres to be up and seeded. Playwright starts its own API and web dev servers when needed.

### Manual checks

- API health: `curl http://localhost:3001/healthz`
- AI health: `curl http://localhost:3002/healthz`
- Web: open `http://localhost:3000` — demo accounts include Northwind Analytics and Riverstone Labs

### Project conventions

- Rules: [`.cursor/rules/conventions.mdc`](.cursor/rules/conventions.mdc), [`.cursor/rules/beacon-design.mdc`](.cursor/rules/beacon-design.mdc)
- Skills: [`.cursor/skills/beacon-feature/SKILL.md`](.cursor/skills/beacon-feature/SKILL.md), [`.cursor/skills/beacon-fix/SKILL.md`](.cursor/skills/beacon-fix/SKILL.md)
- Every new feature needs a matching test
- Shared types live in `packages/shared` — import them, never copy-paste
