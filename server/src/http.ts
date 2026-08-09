import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(public status: number, public code: string, message = code, public details?: unknown) { super(message) }
}
export const asyncRoute = (handler: RequestHandler): RequestHandler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const details = error.flatten()
    const fieldMessage = Object.values(details.fieldErrors).flat().find(Boolean)
    const formMessage = details.formErrors.find(Boolean)
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: fieldMessage ?? formMessage ?? 'Verifique os campos informados', details } })
  }
  if (error instanceof ApiError) return res.status(error.status).json({ error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } })
  if (error?.code === 'P2002') return res.status(409).json({ error: { code: 'CONFLICT', message: 'Registro duplicado' } })
  console.error(error)
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } })
}
