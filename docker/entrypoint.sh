#!/bin/sh
set -e

echo "[entrypoint] Starting site15 server..."

# ── Start the backend (NestJS serves Angular static files from ./dist/apps/client) ──
exec "$@"
