import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { ApiError, asyncRoute } from '../http.js'
import { authenticate, managerOnly, signToken } from '../auth.js'
import { publicUser } from '../serializers.js'

export const authRouter = Router()
authRouter.post('/login', asyncRoute(async (req, res) => {
  const body = z.object({ email: z.string().email(), senha: z.string().min(1) }).parse(req.body)
  const user = await prisma.user.findFirst({ where: { email: { equals: body.email.trim().toLowerCase(), mode: 'insensitive' }, ativo: true } })
  if (!user || !await bcrypt.compare(body.senha, user.senhaHash)) throw new ApiError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos')
  res.json({ token: signToken(user.id, user.perfil), user: publicUser(user) })
}))
authRouter.get('/me', authenticate, asyncRoute(async (req, res) => res.json(publicUser(await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })))))
authRouter.post('/change-password', authenticate, asyncRoute(async (req, res) => {
  const body = z.object({ senhaAtual: z.string().min(1), novaSenha: z.string().min(8), confirmarSenha: z.string().min(8) }).parse(req.body)
  if (body.novaSenha !== body.confirmarSenha) throw new ApiError(422, 'PASSWORD_CONFIRMATION_MISMATCH')
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } })
  if (!await bcrypt.compare(body.senhaAtual, user.senhaHash)) throw new ApiError(400, 'WRONG_CURRENT_PASSWORD')
  if (await bcrypt.compare(body.novaSenha, user.senhaHash)) throw new ApiError(422, 'SAME_PASSWORD')
  await prisma.user.update({ where: { id: user.id }, data: { senhaHash: await bcrypt.hash(body.novaSenha, 12), primeiroAcesso: false } })
  res.json({ ok: true })
}))
authRouter.post('/logout', authenticate, (_req, res) => res.status(204).send())

export const usersRouter = Router()
usersRouter.use(authenticate, managerOnly)
usersRouter.get('/', asyncRoute(async (_req, res) => res.json((await prisma.user.findMany({ where: { ativo: true }, orderBy: { createdAt: 'asc' } })).map(publicUser))))
usersRouter.post('/', asyncRoute(async (req, res) => {
  const body = z.object({
    nomeCompleto: z.string().trim().min(1, 'Informe o nome completo'),
    email: z.string().trim().email('Informe um e-mail válido'),
    perfil: z.enum(['GERENTE','ANALISTA']),
    cargo: z.string().trim().nullable().optional(),
    senhaInicial: z.string().min(8, 'A senha inicial deve ter pelo menos 8 caracteres'),
  }).parse(req.body)
  const email = body.email.trim().toLowerCase()
  if (await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })) throw new ApiError(409, 'EMAIL_TAKEN')
  const user = await prisma.user.create({ data: { nomeCompleto: body.nomeCompleto, email, perfil: body.perfil, cargo: body.cargo, senhaHash: await bcrypt.hash(body.senhaInicial, 12), primeiroAcesso: true } })
  res.status(201).json(publicUser(user))
}))
usersRouter.patch('/:id', asyncRoute(async (req, res) => {
  const body = z.object({ nomeCompleto: z.string().trim().min(1).optional(), perfil: z.enum(['GERENTE','ANALISTA']).optional(), cargo: z.string().trim().nullable().optional(), ativo: z.boolean().optional() }).parse(req.body)
  res.json(publicUser(await prisma.user.update({ where: { id: String(req.params.id) }, data: body })))
}))
usersRouter.delete('/:id', asyncRoute(async (req, res) => {
  if (String(req.params.id) === req.user!.id) throw new ApiError(409, 'CANNOT_DELETE_SELF')
  const found = await prisma.user.findUnique({ where: { id: String(req.params.id) } }); if (!found) throw new ApiError(404, 'NOT_FOUND')
  await prisma.user.update({ where: { id: found.id }, data: { ativo: false } }); res.status(204).send()
}))
