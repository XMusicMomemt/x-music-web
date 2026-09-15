# 音乐瞬间 · 认证平台 — Northflank 部署方案

> 更新日期：2026-09-15 · 适用代码版本：前后端分层重构后（V11 及以后）

---

## 一、架构总览

项目已按「前后端分离」原则分层，**UI 与服务端只通过 HTTP API 通信**，后续改 UI 不需要动后端：

```
src/
├─ app/                    # 前端（页面、布局、全局样式）
│  ├─ page.tsx / layout.tsx / globals.css
│  └─ api/                 # 仅作薄适配层（约20行/个），不含业务逻辑
│     └─ */route.ts        # 请求解析 → 调用 services → 返回 JSON
├─ components/             # 前端组件（改 UI 只动这里）
├─ lib/                    # 双端共享层（类型 / 常量 / zod 校验 / API 客户端）
│  ├─ api.ts               # 前端唯一出口：所有请求走 apiFetch
│  ├─ schemas.ts           # 前后端共用同一份校验规则与文案
│  └─ site.ts / types.ts
└─ server/                 # ★ 服务端层（与 UI 完全无关，可整体抽离）
   ├─ db.ts                # Prisma 客户端
   ├─ auth.ts              # 管理端 JWT 签发/校验
   ├─ http.ts              # 响应/错误/跨域统一封装
   └─ services.ts          # 全部业务逻辑（申请/评审/查询/统计/登录）
```

前端 API 客户端已支持 `NEXT_PUBLIC_API_BASE_URL`，未来可将后端迁到任意地址或独立仓库，前端只改一个环境变量。

---

## 二、部署形态怎么选

| | 方案一：单服务（推荐起步） | 方案二：前后端双服务 |
|---|---|---|
| 适用阶段 | 现在上线、快速验证 | 后期 UI 独立迭代 / 前端换技术栈 |
| 服务数量 | 1 个（本仓库 Dockerfile 直接部署） | 2 个（API 服务 + 前端服务） |
| 数据库 | SQLite + Volume | 建议直接上 PostgreSQL Addon |
| 改 UI 的影响 | 只改前端文件，后端零感知 | 完全独立部署、独立回滚 |
| 运维成本 | 最低 | 中等 |

> 两方案使用**同一个镜像/代码库**，切换成本≈0。建议先用方案一上线，等 UI 大改时再演进到方案二。

---

## 三、方案一：单服务部署（推荐）

### 3.1 前置：代码推送到 Git 仓库

```bash
git init && git add . && git commit -m "init"
git remote add origin git@github.com:<你的账号>/music-moment.git
git push -u origin main
```

> 仓库根目录已包含 `Dockerfile`、`docker-entrypoint.sh`、`.dockerignore`，Northflank 会自动识别。

### 3.2 创建服务（Northflank 控制台）

1. **Services → Create Service → Build from Git repository**
2. 选择仓库与分支（`main`），Build type 选 **Dockerfile**（自动检测根目录 Dockerfile）
3. 实例规格：**0.5 vCPU / 512 MB** 起步（够用，后期可随时升）
4. Deployment → **Instances 固定为 1**（SQLite 单写者，不可多副本）

### 3.3 端口

- **Ports → Add Port**：`3000`，协议 **HTTP**，勾选 Public
- 保存后 Northflank 自动分配 `https://xxx.northflank.app` 域名与 TLS 证书

### 3.4 持久化卷（SQLite 必须）

- **Volumes → Create Volume**：大小 `1 GB`（数据量小，1G 富余），类型 SSD
- **挂载路径：`/data`**（镜像内 `DATABASE_URL` 默认 `file:/data/custom.db`）
- ⚠️ 不挂卷数据会随容器重启丢失

### 3.5 环境变量（Service → Environment）

| 变量 | 必填 | 示例/默认 | 说明 |
|---|---|---|---|
| `JWT_SECRET` | **强烈建议** | 32位随机串 | 管理端登录令牌签名，不改则用代码默认值 |
| `ADMIN_USERNAME` | 建议 | `admin` | 管理后台账号 |
| `ADMIN_PASSWORD` | 建议 | 改掉 `verify@2026` | 管理后台密码 |
| `DATABASE_URL` | 可不填 | `file:/data/custom.db` | 镜像已设默认值 |
| `SEED_DEMO_DATA` | 可选 | 不设/`1` | 设 `1` 时首次启动写入 12 位演示老师 |
| `CORS_ORIGIN` | 方案一不填 | — | 同源部署无需跨域 |

生成随机密钥：`openssl rand -base64 32`

### 3.6 健康检查与上线

- **Health Checks → Add**：HTTP GET，路径 `/api/stats`，端口 `3000`，超时 5s，初始延迟 15s
- 点击 **Start build**：首次构建约 3–5 分钟，之后每次 push 自动重新构建部署
- 打开分配的公网域名验收：首页、申请页、`/api/stats` 返回 JSON

### 3.7 自定义域名（可选）

Ports → 该端口 → Domains → 添加 `www.你的域名.com` → 按提示在 DNS 加 CNAME → 证书自动签发。

---

## 四、方案二：前后端双服务（UI 独立迭代阶段）

代码已具备分离条件（前端只认 `NEXT_PUBLIC_API_BASE_URL`，后端支持 `CORS_ORIGIN`），两种做法：

### 做法A：同一仓库拆两个 Northflank 服务（最快）

1. **API 服务**：用同一 Dockerfile 建服务，但加环境变量控制：
   - 后续可加 `RUN_MODE=api`（需要时在 entrypoint 里区分）；现阶段直接整镜像部署也可以，只是前端文件同样存在
   - `CORS_ORIGIN=https://前端域名`
2. **前端服务**：构建时注入
   - `NEXT_PUBLIC_API_BASE_URL=https://api-xxx.northflank.app`（**构建期变量**，改地址需重新构建）
3. 前端服务与 API 服务之间如需服务端调用，走 Northflank 内网 `*.northflank.internal:3000`；浏览器端请求走公网域名

### 做法B：后端抽成独立仓库（彻底分离，UI 可换栈）

- `src/server/**` + `prisma/**` + API 路由适配层整体迁出（服务端无任何 React 依赖，迁移干净）
- 前端仓库只留 `app/`、`components/`、`lib/`（api.ts、schemas.ts、types.ts 随前端走或发内部 npm 包共享）
- 适合未来把 UI 换成 Vite + React SPA / 移动端 H5 等

> 做法B 后数据库建议同步换成 PostgreSQL（见下节），双服务不再共享文件系统。

---

## 五、数据库演进：SQLite → PostgreSQL

起步用 SQLite（零成本），数据/并发上来后平滑升级：

1. Northflank → **Addons → Create Addon → PostgreSQL**（选带连接池版本）
2. 代码改动（`prisma/schema.prisma`）：

```prisma
datasource db {
  provider = "postgresql"        // 由 "sqlite" 改为 postgresql
  url      = env("DATABASE_URL")
}
```

3. 环境变量 `DATABASE_URL` 改为 Addon 提供的连接串（Northflank 可直接绑定 Addon 变量）
4. 重新构建部署后执行一次 `prisma db push` 同步表结构（或改用 `prisma migrate deploy` 纳入发布流程）
5. 历史数据迁移：旧库用 `prisma studio` 导出 CSV → `\copy` 导入 PG（数据量小，手动即可）

---

## 六、运维要点

| 事项 | 做法 |
|---|---|
| 日志 | Service → Logs（应用输出带 `[init]`/`[start]`/错误堆栈） |
| 备份 | Volume 定期快照（Volumes → Snapshots）；或定期 `prisma studio` 导出 |
| 回滚 | Deployments → 历史构建 → Redeploy（镜像不可变，回滚秒级） |
| 扩容 | SQLite 阶段实例数必须为 1；升级 PostgreSQL 后可水平扩容 |
| 免费额度 | Northflank 免费层支持 2 个服务 + 1 个体积有限卷；本方案起步规格足够 |
| 安全 | 上线后立即改 `ADMIN_PASSWORD` 与 `JWT_SECRET`；管理后台入口不建议加自定义域名公开分享 |

---

## 七、本地 / CI 的 Docker 验证（可选）

```bash
docker build -t music-moment .
docker run -p 3000:3000 -v mm-data:/data \
  -e JWT_SECRET=$(openssl rand -hex 32) \
  -e ADMIN_PASSWORD=你的密码 \
  music-moment
# 验证：curl http://localhost:3000/api/stats
```

容器启动时 entrypoint 会自动 `prisma db push` 建表，无表结构迁移负担。

---

## 八、验证状态说明

- ✅ 已在本仓库实测：`next build` 生产构建成功；**standalone 产物 + Bun 运行时**下首页 / 统计 / 老师列表 / 管理登录全部 200，Prisma + SQLite 读写正常（与镜像运行路径一致）
- ⚠️ 本开发环境无 Docker daemon，镜像本身未实际 `docker build`；如首次云端构建报错，多为依赖安装或 Prisma 引擎问题，把构建日志发我即可快速修正
- 环境变量 `DATABASE_URL` 必须为**绝对路径**（镜像默认 `file:/data/custom.db` 已是绝对路径，勿改回相对路径）
