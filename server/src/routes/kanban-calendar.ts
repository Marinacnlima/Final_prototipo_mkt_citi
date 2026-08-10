import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../prisma.js'
import { ApiError, asyncRoute } from '../http.js'
import { authenticate } from '../auth.js'

const assignment = z.object({ userId: z.string().uuid(), nota: z.number().min(0).max(5).nullable().optional() })
const taskFields = z.object({ titulo: z.string().trim().min(1), redeSocial: z.enum(['INSTAGRAM','LINKEDIN','SITE','EMAIL']), dificuldade: z.enum(['FACIL','MEDIO','DIFICIL']), dataInicio: z.coerce.date().nullable().optional(), dataEntrega: z.coerce.date().nullable().optional(), colunaId: z.string().uuid(), responsaveis: z.array(assignment).default([]) })
const validDates = (value: { dataInicio?: Date | null; dataEntrega?: Date | null }) => !value.dataInicio || !value.dataEntrega || value.dataEntrega >= value.dataInicio
const taskBody = taskFields.refine(validDates, { message: 'O prazo deve ser igual ou posterior à data de início', path: ['dataEntrega'] })
const taskPatch = taskFields.partial().refine(validDates, { message: 'O prazo deve ser igual ou posterior à data de início', path: ['dataEntrega'] })
const taskInclude = { coluna: true, atribuicoes: { include: { user: true } } } as const
const serializeTask = (task: any) => ({ ...task, responsaveis: task.atribuicoes.map((a: any) => ({ userId: a.userId, nome: a.user.nomeCompleto, nota: a.nota })) })

export const kanbanRouter = Router(); kanbanRouter.use(authenticate)
kanbanRouter.get('/assignees', asyncRoute(async (_req, res) => {
  const users = await prisma.user.findMany({ where: { ativo: true, perfil: 'ANALISTA' }, select: { id: true, nomeCompleto: true, cargo: true }, orderBy: { nomeCompleto: 'asc' } })
  res.json(users)
}))
kanbanRouter.get('/columns', asyncRoute(async (req, res) => {
  const canal = z.enum(['INSTAGRAM','LINKEDIN','SITE','EMAIL']).optional().parse(req.query.canal)
  const columns = await prisma.kanbanColumn.findMany({ orderBy: { ordem: 'asc' }, include: { tasks: { where: canal ? { redeSocial: canal } : {}, orderBy: { ordem: 'asc' }, include: taskInclude } } })
  res.json(columns.map((column) => ({ ...column, tasks: column.tasks.map(serializeTask) })))
}))
kanbanRouter.post('/columns', asyncRoute(async (req, res) => {
  const body = z.object({ nome: z.string().trim().min(1), cor: z.string().optional(), isDone: z.boolean().default(false) }).parse(req.body)
  const max = await prisma.kanbanColumn.aggregate({ _max: { ordem: true } })
  res.status(201).json(await prisma.kanbanColumn.create({ data: { ...body, ordem: (max._max.ordem ?? -1) + 1 } }))
}))
kanbanRouter.patch('/columns/:id', asyncRoute(async (req, res) => res.json(await prisma.kanbanColumn.update({ where: { id: String(req.params.id) }, data: z.object({ nome: z.string().min(1).optional(), cor: z.string().nullable().optional(), ordem: z.number().int().min(0).optional(), isDone: z.boolean().optional() }).parse(req.body) }))))
kanbanRouter.delete('/columns/:id', asyncRoute(async (req, res) => { if (await prisma.task.count({ where: { colunaId: String(req.params.id) } })) throw new ApiError(409, 'COLUMN_NOT_EMPTY'); await prisma.kanbanColumn.delete({ where: { id: String(req.params.id) } }); res.status(204).send() }))
kanbanRouter.post('/tasks', asyncRoute(async (req, res) => {
  const body = taskBody.parse(req.body); const ordem = await prisma.task.count({ where: { colunaId: body.colunaId } })
  if (body.responsaveis.some((assignment) => assignment.nota != null)) throw new ApiError(422, 'GRADE_ONLY_AFTER_CREATION', 'As notas devem ser atribuídas somente ao editar a task')
  const analystCount = await prisma.user.count({ where: { id: { in: body.responsaveis.map((assignment) => assignment.userId) }, perfil: 'ANALISTA', ativo: true } })
  if (analystCount !== new Set(body.responsaveis.map((assignment) => assignment.userId)).size) throw new ApiError(422, 'INVALID_ASSIGNEE', 'Somente analistas ativos podem ser responsáveis por tasks')
  const task = await prisma.task.create({ data: { titulo: body.titulo, redeSocial: body.redeSocial, dificuldade: body.dificuldade, dataInicio: body.dataInicio, dataEntrega: body.dataEntrega, colunaId: body.colunaId, ordem, atribuicoes: { create: body.responsaveis.map((a) => ({ userId: a.userId, nota: a.nota })) } }, include: taskInclude })
  res.status(201).json(serializeTask(task))
}))
kanbanRouter.patch('/tasks/:id', asyncRoute(async (req, res) => {
  const body = taskPatch.parse(req.body)
  if (body.responsaveis) {
    const analystCount = await prisma.user.count({ where: { id: { in: body.responsaveis.map((assignment) => assignment.userId) }, perfil: 'ANALISTA', ativo: true } })
    if (analystCount !== new Set(body.responsaveis.map((assignment) => assignment.userId)).size) throw new ApiError(422, 'INVALID_ASSIGNEE', 'Somente analistas ativos podem ser responsáveis por tasks')
    if (req.user!.perfil !== 'GERENTE') {
      const current = await prisma.taskAssignment.findMany({ where: { taskId: String(req.params.id) } })
      const grades = new Map(current.map((assignment) => [assignment.userId, assignment.nota]))
      if (body.responsaveis.some((assignment) => (assignment.nota ?? null) !== (grades.get(assignment.userId) ?? null))) throw new ApiError(403, 'MANAGER_ONLY_GRADING', 'Somente a gerente pode avaliar a execução da task')
    }
  }
  const task = await prisma.$transaction(async (tx) => { if (body.responsaveis) { await tx.taskAssignment.deleteMany({ where: { taskId: String(req.params.id) } }); await tx.taskAssignment.createMany({ data: body.responsaveis.map((a) => ({ taskId: String(req.params.id), userId: a.userId, nota: a.nota })) }) } const { responsaveis, ...data } = body; return tx.task.update({ where: { id: String(req.params.id) }, data, include: taskInclude }) })
  res.json(serializeTask(task))
}))
kanbanRouter.patch('/tasks/:id/move', asyncRoute(async (req, res) => { const body = z.object({ colunaId: z.string().uuid(), ordem: z.number().int().min(0).default(0) }).parse(req.body); res.json(await prisma.task.update({ where: { id: String(req.params.id) }, data: body })) }))
kanbanRouter.delete('/tasks/:id', asyncRoute(async (req, res) => { await prisma.task.delete({ where: { id: String(req.params.id) } }); res.status(204).send() }))

export const calendarRouter = Router(); calendarRouter.use(authenticate)
const eventBody = z.object({ titulo: z.string().trim().min(1), data: z.coerce.date(), horario: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), duracao: z.string().nullable().optional(), tipo: z.enum(['REUNIAO','DEADLINE','TASK']), canal: z.enum(['INSTAGRAM','LINKEDIN','SITE','EMAIL']).nullable().optional() })
calendarRouter.get('/events', asyncRoute(async (req, res) => { const q = z.object({ inicio: z.coerce.date().optional(), fim: z.coerce.date().optional(), canal: z.enum(['INSTAGRAM','LINKEDIN','SITE','EMAIL']).optional() }).parse(req.query); res.json(await prisma.calendarEvent.findMany({ where: { ...(q.canal?{canal:q.canal}:{}), ...(q.inicio||q.fim?{data:{gte:q.inicio,lte:q.fim}}:{}) }, orderBy: [{data:'asc'},{horario:'asc'}] })) }))
calendarRouter.post('/events', asyncRoute(async (req, res) => res.status(201).json(await prisma.calendarEvent.create({ data: eventBody.parse(req.body) }))))
calendarRouter.patch('/events/:id', asyncRoute(async (req, res) => res.json(await prisma.calendarEvent.update({ where: { id: String(req.params.id) }, data: eventBody.partial().parse(req.body) }))))
calendarRouter.delete('/events/:id', asyncRoute(async (req, res) => { await prisma.calendarEvent.delete({ where: { id: String(req.params.id) } }); res.status(204).send() }))
