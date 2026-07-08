import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'lcg-secret-key-change-in-production'

export interface JwtPayload {
  id: number
  username: string
  role: string
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}
