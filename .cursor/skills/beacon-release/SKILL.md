---
name: beacon-release
description: Run the Beacon release checklist — verify the branch is main and up to date, run the test suite, summarize changes since the last version tag, create and push a new version tag, and remind to approve the production gate. Use when the user asks to cut, ship, or tag a Beacon release.
disable-model-invocation: true
---

# Beacon Release

Run the release checklist in order. **Do not proceed past any failing step** — stop and report instead.

## Checklist

```
- [ ] 1. On main and up to date
- [ ] 2. pnpm test passes
- [ ] 3. Summarize changes since last tag
- [ ] 4. Ask for the new version number
- [ ] 5. Create and push the tag
- [ ] 6. Remind to approve the production gate
```

### 1. Confirm branch is main and up to date

```bash
git rev-parse --abbrev-ref HEAD   # must be "main"
git fetch origin
git status -sb                     # must be clean and not behind origin/main
```

If not on `main`, or behind/ahead/dirty, stop and report.

### 2. Run tests

```bash
pnpm test
```

If anything fails, stop. Do not continue.

### 3. Summarize changes since the last version tag

```bash
git describe --tags --abbrev=0    # last version tag
git log <last-tag>..HEAD --oneline
```

Summarize the changes for the release notes.

### 4. Ask for the new version number

Ask the user for the new version (e.g. `v1.1.0`). Wait for the answer.

### 5. Create and push the tag

```bash
git tag <version>
git push origin <version>
```

### 6. Remind about the production gate

Remind the user to **approve the production gate in GitHub Actions** to complete the deploy.
