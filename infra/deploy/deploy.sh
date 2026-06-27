#!/usr/bin/env bash
# Build & (re)start the REREVI app stack on the VM.
# Run from infra/deploy/ on the server (after `git pull`).
set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE="../../web/.env"
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE (PUBLIC_* + service key)"; exit 1; }

# Export PUBLIC_* so docker compose build args can see them.
set -a; # shellcheck disable=SC1090
source "$ENV_FILE"; set +a

echo "→ Building & starting app + caddy…"
docker compose -f docker-compose.app.yml up -d --build

echo "→ Status:"
docker compose -f docker-compose.app.yml ps
echo "Done. Caddy serves :8080 → app(:4321) + Supabase(:8000)."
echo "Point the Cloudflare tunnel public hostname at http://localhost:8080."
