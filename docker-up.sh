#!/usr/bin/env bash
set -euo pipefail

# Use .env.docker by default (has container names for Docker network)
# Override with: ENV_FILE=.env ./docker-up.sh
ENV_FILE="${ENV_FILE:-.env.docker}"
PORT="${SITE_15_PORT:-8080}"

# Stop pm2 prod if running
npx -y pm2 delete ./ecosystem-prod.config.json 2>/dev/null || true

# Free port on host (orphan node processes, etc.)
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" 2>/dev/null || true
elif command -v ss >/dev/null 2>&1; then
  pid="$(ss -tlnp 2>/dev/null | grep ":${PORT} " | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1)"
  if [ -n "${pid:-}" ]; then
    kill "${pid}" 2>/dev/null || true
  fi
fi

sleep 0.5

# Build and start everything (infra + app)
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d --build "$@"

echo "✅ Done (site15 on :${PORT}, env: ${ENV_FILE})"
