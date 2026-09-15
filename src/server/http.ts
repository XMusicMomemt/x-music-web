import { NextResponse } from 'next/server'

/**
 * HTTP 适配辅助层：统一 JSON 返回、错误映射与跨域（CORS）。
 * 路由文件只做「解析请求 → 调用服务 → 返回响应」，不含业务逻辑。
 */

// 带状态的业务异常：service 抛出，路由统一映射为 HTTP 响应
export class HttpError extends Error {
  status: number
  extra?: Record<string, unknown>

  constructor(status: number, message: string, extra?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.extra = extra
  }
}

// 前后端分离部署时，设置 CORS_ORIGIN=* 或前端站点地址即可跨域访问
export function corsHeaders(): Record<string, string> {
  const origin = process.env.CORS_ORIGIN
  if (!origin) return {}
  return {
    'Access-Control-Allow-Origin': origin === '*' ? '*' : origin,
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders() })
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export function fail(error: unknown, fallback: string, logTag: string) {
  if (error instanceof HttpError) {
    return json({ error: error.message, ...(error.extra || {}) }, error.status)
  }
  console.error(logTag, error)
  return json({ error: fallback }, 500)
}
