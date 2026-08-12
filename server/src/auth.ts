import type { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import type { PerfilUsuario } from '@prisma/client'
import { prisma } from './prisma.js'
import { config } from './config.js'
import { ApiError, asyncRoute } from './http.js'

declare global { namespace Express { interface Request { user?: { id: string; perfil: PerfilUsuario; primeiroAcesso: boolean } } } }

export const signToken = (id: string, perfil: PerfilUsuario) => jwt.sign({ perfil }, config.JWT_SECRET, { subject: id, expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
export const signResetToken = (id: string) => jwt.sign({ purpose: 'password_reset' }, config.JWT_SECRET, { subject: id, expiresIn: '15m' })
export const verifyResetToken = (token: string): string => {
  let payload: jwt.JwtPayload
  try { payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload } catch { throw new ApiError(401, 'RESET_TOKEN_INVALID') }
  if (payload.purpose !== 'password_reset' || !payload.sub) throw new ApiError(401, 'RESET_TOKEN_INVALID')
  return payload.sub
}
export const signGoogleStateToken = (id: string) => jwt.sign({ purpose: 'google_oauth_state' }, config.JWT_SECRET, { subject: id, expiresIn: '10m' })
export const verifyGoogleStateToken = (token: string): string => {
  let payload: jwt.JwtPayload
  try { payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload } catch { throw new ApiError(401, 'GOOGLE_STATE_INVALID') }
  if (payload.purpose !== 'google_oauth_state' || !payload.sub) throw new ApiError(401, 'GOOGLE_STATE_INVALID')
  return payload.sub
}
export const authenticate: RequestHandler = asyncRoute(async (req, _res, next) => {
  const header = req.header('authorization')
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'UNAUTHENTICATED')
  let payload: jwt.JwtPayload
  try { payload = jwt.verify(header.slice(7), config.JWT_SECRET) as jwt.JwtPayload } catch { throw new ApiError(401, 'TOKEN_INVALID') }
  const user = await prisma.user.findFirst({ where: { id: payload.sub, ativo: true } })
  if (!user) throw new ApiError(401, 'TOKEN_INVALID')
  req.user = { id: user.id, perfil: user.perfil, primeiroAcesso: user.primeiroAcesso }
  const allowed = ['/me', '/change-password', '/logout']
  if (user.primeiroAcesso && !allowed.includes(req.path)) throw new ApiError(403, 'PASSWORD_CHANGE_REQUIRED')
  next()
})
export const managerOnly: RequestHandler = (req, _res, next) => req.user?.perfil === 'GERENTE' ? next() : next(new ApiError(403, 'FORBIDDEN'))
