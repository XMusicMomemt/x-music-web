import { SignJWT, jwtVerify } from 'jose'

const secretString = process.env.JWT_SECRET || 'dev-only-fallback-secret'
const secret = new TextEncoder().encode(secretString)

export type AdminPayload = {
  role: 'admin'
  username: string
}

export async function signAdminToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    if (payload.role !== 'admin') return null
    return {
      role: 'admin',
      username: String(payload.username || ''),
    }
  } catch {
    return null
  }
}

export async function getAdminFromRequest(request: Request): Promise<AdminPayload | null> {
  const header = request.headers.get('authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) return null
  return verifyAdminToken(match[1].trim())
}
