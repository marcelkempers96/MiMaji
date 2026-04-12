#!/bin/bash
# SessionStart hook for MiMaji.
#
# Installs npm dependencies so Claude Code on the web can run the Next.js
# linter and typecheck without manual setup. Only runs in remote (web)
# sessions; local dev environments are left alone.
set -euo pipefail

# Only run in Claude Code on the web — local sessions manage their own deps.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "[session-start] Installing npm dependencies..."
npm install --no-audit --no-fund --loglevel=error
echo "[session-start] Dependencies installed."
