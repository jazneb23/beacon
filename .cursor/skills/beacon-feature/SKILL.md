---
name: beacon-feature
description: Plan and build a new Beacon feature across the full stack (shared types, API, frontend, tests) following project conventions and the design system, with tests green before finishing. Use when the user asks to add or build a new feature in the Beacon project.
disable-model-invocation: true
---

# Beacon Feature

Build a new feature end-to-end for the Beacon monorepo. Plan first, then implement, then verify.

## Workflow

```
- [ ] 1. Clarify scope (only if unclear)
- [ ] 2. Plan across the full stack and show the plan
- [ ] 3. Build following conventions and design rules
- [ ] 4. Run pnpm test until green
- [ ] 5. Summarize what was built and what to review manually
```

### 1. Clarify scope

If the feature description is ambiguous, ask **one** clarifying question before planning. If the scope is already clear, skip this and proceed.

### 2. Plan and show it

Plan the feature across every relevant layer, then present the plan to the user **before** writing any code:

- **Shared types** — new/changed types in `packages/shared` (imported, never copy-pasted).
- **API** — endpoints in `apps/api`, returning `{ data: ... }` on success or `{ error: ... }` on failure.
- **Frontend** — UI in `apps/web` following `.cursor/rules/beacon-design.mdc` (tokens, existing `src/components/ui/`, `lucide-react`, Tailwind spacing).
- **Tests** — every new feature gets a matching test.

Wait for the plan to be acknowledged, then build.

### 3. Build

Follow `.cursor/rules/conventions.mdc` and `.cursor/rules/beacon-design.mdc`:

- TypeScript everywhere; never use `any`.
- Shared types live in `packages/shared` and are imported.
- API responses are `{ data: ... }` or `{ error: ... }`.
- Keep functions short with a short comment on each.
- Use `pnpm` only — never `npm` or `yarn`.
- **Preserve all existing functionality.** Do not break or remove behavior unrelated to the feature.

### 4. Verify

Run the full suite and confirm green before finishing:

```bash
pnpm test
```

If tests fail, fix and re-run until they pass. Do not finish on red.

### 5. Summarize

Report:
- **Built** — what changed, per layer (shared / API / frontend / tests).
- **Review manually** — anything needing human judgment (design polish, edge cases, env/config, data migrations).
