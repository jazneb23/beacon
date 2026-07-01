#!/usr/bin/env bash
# Wait for Postgres, then apply schema and demo seed data.
set -euo pipefail

echo "Waiting for Postgres..."
for _ in $(seq 1 60); do
  if docker compose exec -T postgres pg_isready -U beacon -d beacon >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! docker compose exec -T postgres pg_isready -U beacon -d beacon >/dev/null 2>&1; then
  echo "Postgres did not become ready in time." >&2
  exit 1
fi

pnpm --filter @beacon/api migrate
pnpm --filter @beacon/api seed
