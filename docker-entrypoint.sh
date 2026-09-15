#!/bin/sh
set -e

echo "[init] 同步数据库结构 (prisma db push)"
bunx prisma db push --skip-generate

if [ "$SEED_DEMO_DATA" = "1" ]; then
  echo "[init] 写入演示数据"
  bun prisma/seed.ts || echo "[init] 演示数据写入失败，跳过"
fi

echo "[start] 音乐瞬间认证平台启动: http://0.0.0.0:${PORT}"
exec bun server.js
