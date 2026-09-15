#!/bin/bash
# ACS 构建打包：安装 → 构建 → 组装部署产物 → tar.gz
set -e
export NEXT_TELEMETRY_DISABLED=1

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NEXTJS_PROJECT_DIR="${NEXTJS_PROJECT_DIR:-${PROJECT_DIR:-$(dirname "$SCRIPT_DIR")}}"
BUILD_DIR="${BUILD_DIR:-/tmp/acs-build/next-service-dist}"
cd "$NEXTJS_PROJECT_DIR"

echo "🚀 构建 Next.js 应用..."
bun install
bun run build

mkdir -p "$BUILD_DIR"
rm -rf "$BUILD_DIR"/*
cp -r .next/standalone/* "$BUILD_DIR/"
mkdir -p "$BUILD_DIR/db"
[ -f db/custom.db ] && cp db/custom.db "$BUILD_DIR/db/custom.db"
cp "$SCRIPT_DIR/control-server.mjs" "$BUILD_DIR/control-server.mjs"
cp "$SCRIPT_DIR/start.sh" "$BUILD_DIR/start.sh"
chmod +x "$BUILD_DIR/start.sh"

tar -czf "${BUILD_DIR}.tar.gz" -C "$BUILD_DIR" .
echo "✅ 打包完成: ${BUILD_DIR}.tar.gz"
