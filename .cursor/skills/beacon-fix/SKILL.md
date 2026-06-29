---
name: beacon-fix
description: Diagnose and fix a bug in the Beacon project by locating affected files, reading the relevant code first, proposing a reasoned fix, and confirming it with the relevant tests — without touching anything unrelated. Use when the user reports a bug or asks to fix broken behavior in Beacon.
disable-model-invocation: true
---

# Beacon Fix

Fix a reported bug with minimal, well-reasoned changes.

## Workflow

```
- [ ] 1. Identify the likely affected files
- [ ] 2. Read the relevant code before proposing anything
- [ ] 3. Propose a fix with reasoning
- [ ] 4. Run the relevant tests to confirm it works
- [ ] 5. Confirm nothing unrelated changed
```

### 1. Identify affected files

From the bug description, locate the likely affected files (use search across `apps/*` and `packages/shared`). List them before changing anything.

### 2. Read first

Read the relevant code to understand the actual cause **before** proposing a fix. Do not propose changes from assumptions alone.

### 3. Propose a fix with reasoning

Explain the root cause and the proposed change, then apply it. Follow `.cursor/rules/conventions.mdc`:

- TypeScript, never `any`.
- API responses stay `{ data: ... }` / `{ error: ... }`.
- Shared types stay in `packages/shared`.
- Keep the change as small as possible.

### 4. Verify

Run the tests relevant to the affected area and confirm the fix works:

```bash
pnpm test
```

Scope to the affected package when possible (e.g. `pnpm --filter <pkg> test`). Re-run until green.

### 5. Stay in scope

**Do not change anything unrelated to the bug.** No drive-by refactors, renames, formatting sweeps, or unrelated edits.
