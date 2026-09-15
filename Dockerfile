# ─────────────────────────────────────────────
# 音乐瞬间 · 认证平台  生产镜像
# 单容器 = Next.js 前端 + API 服务端（src/server 分层）
# SQLite 持久化：挂载卷 /data（Northflank Volume）
# ─────────────────────────────────────────────

# ─── 构建阶段：安装依赖 → prisma client → 生产构建 ───
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN bunx prisma generate && bun run build

# ─── 运行阶段：仅携带 standalone 产物 + prisma（启动时同步表结构） ───
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/data/custom.db

# Prisma 引擎依赖 openssl
RUN apt-get update -qq \
    && apt-get install -y -qq --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/.bin ./node_modules/.bin
COPY docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh && mkdir -p /data

VOLUME /data
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
