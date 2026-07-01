#!/usr/bin/env bash
# Write app env files for cloud agents (.env files are gitignored locally).
set -euo pipefail

cat > apps/api/.env <<EOF
DATABASE_URL=postgresql://beacon:beacon@localhost:5432/beacon
EOF

cat > apps/ai/.env <<EOF
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
API_URL=http://localhost:3001
PORT=3002
EOF

cat > apps/web/.env.local <<EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_URL=http://localhost:3002
EOF
