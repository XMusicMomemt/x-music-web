#!/bin/bash
# 开发模式启动：安装依赖 → 生成/同步数据库 → next dev + runner 控制面
set -euo pipefail
export PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
export PATH=/home/z/.venv/bin:$PATH

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "[BUN] bun install..."
bun install

echo "[BUN] prisma db push..."
bun run db:push

# 平台控制面（pre-stop / ping / db inspect），带端口占用保护
if ! (exec 3<>/dev/tcp/127.0.0.1/3100) 2>/dev/null; then
	echo "[BUN] Starting runner control server on port 3100..."
	APP_DIR="$PROJECT_DIR" DATABASE_URL="file:${PROJECT_DIR}/db/custom.db" CONTROL_PORT=3100 \
		nohup node "$SCRIPT_DIR/control-server.mjs" > "$SCRIPT_DIR/control-server.log" 2>&1 &
	sleep 1
	if (exec 3<>/dev/tcp/127.0.0.1/3100) 2>/dev/null; then
		echo "[BUN] Control server started on 3100"
	else
		echo "[BUN] WARNING: control server failed to start"
	fi
else
	echo "[BUN] Control server already running on 3100"
fi

echo "[BUN] starting next dev..."
exec bun run dev
