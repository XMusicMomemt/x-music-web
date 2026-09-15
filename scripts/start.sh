#!/bin/bash
# 生产模式启动（ACS runner）：控制面 + standalone server
set -euo pipefail
APP_DIR="${APP_DIR:-/app}"
cd "$APP_DIR"

# 控制面
if [ -f "./control-server.mjs" ]; then
    node ./control-server.mjs &
    sleep 1
    echo "runner control server started (Port: ${CONTROL_PORT:-3100})"
fi

# Next.js standalone
export NODE_ENV=production
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
exec bun .next/standalone/server.js 2>&1 | tee server.log
