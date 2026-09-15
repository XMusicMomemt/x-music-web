import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 允许本地用 NEXT_DIST_DIR 做生产构建验证，不影响开发服务器
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
