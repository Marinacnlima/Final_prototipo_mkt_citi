import { Router } from 'express'
import { prisma } from '../prisma.js'
import { config } from '../config.js'
import { asyncRoute } from '../http.js'
import { authenticate, signGoogleStateToken, verifyGoogleStateToken } from '../auth.js'
import { generateGoogleAuthUrl, exchangeGoogleCode } from '../google-oauth.js'

export const googleRouter = Router()

googleRouter.get('/status', authenticate, asyncRoute(async (req, res) => {
  const account = await prisma.googleAccount.findUnique({ where: { userId: req.user!.id } })
  res.json({ connected: Boolean(account), email: account?.email ?? null })
}))

googleRouter.get('/connect', authenticate, asyncRoute(async (req, res) => {
  const state = signGoogleStateToken(req.user!.id)
  const url = generateGoogleAuthUrl(config.GOOGLE_OAUTH_REDIRECT_URI, state)
  res.json({ url })
}))

googleRouter.get('/callback', asyncRoute(async (req, res) => {
  const { code, state, error } = req.query as { code?: string; state?: string; error?: string }
  if (error || !code || !state) return res.redirect(`${config.FRONTEND_URL}/?google=error`)
  let userId: string
  try { userId = verifyGoogleStateToken(state) } catch { return res.redirect(`${config.FRONTEND_URL}/?google=error`) }
  try {
    const { refreshToken, email } = await exchangeGoogleCode(config.GOOGLE_OAUTH_REDIRECT_URI, code)
    await prisma.googleAccount.upsert({
      where: { userId },
      update: { email, refreshToken },
      create: { userId, email, refreshToken },
    })
    res.redirect(`${config.FRONTEND_URL}/?google=connected`)
  } catch (cause) {
    console.error('[google-accounts] Falha ao trocar código por token:', cause instanceof Error ? cause.message : cause)
    res.redirect(`${config.FRONTEND_URL}/?google=error`)
  }
}))

googleRouter.delete('/disconnect', authenticate, asyncRoute(async (req, res) => {
  await prisma.googleAccount.deleteMany({ where: { userId: req.user!.id } })
  res.status(204).send()
}))
