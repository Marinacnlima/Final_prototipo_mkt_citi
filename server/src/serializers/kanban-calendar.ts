import type { Prisma } from "@prisma/client"

export const taskInclude = {
  coluna: true,
  atribuicoes: { include: { user: true } },
} as const
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof taskInclude
}>

export function serializeTask(task: TaskWithRelations) {
  return {
    ...task,
    responsaveis: task.atribuicoes.map((assignment) => ({
      userId: assignment.userId,
      nome: assignment.user.nomeCompleto,
      nota: assignment.nota,
    })),
  }
}

export const eventInclude = {
  participantes: { where: { user: { ativo: true } }, include: { user: true } },
} as const
export type EventWithParticipants = Prisma.CalendarEventGetPayload<{
  include: typeof eventInclude
}>

export function serializeEvent(event: EventWithParticipants) {
  return {
    ...event,
    participantes: event.participantes.map((participant) => ({
      userId: participant.userId,
      nome: participant.user.nomeCompleto,
      email: participant.user.email,
    })),
  }
}

export function googleEventInput(event: EventWithParticipants) {
  return {
    titulo: event.titulo,
    dataISO: event.data.toISOString().slice(0, 10),
    horario: event.horario,
    horarioFim: event.horarioFim,
    attendeeEmails: event.participantes.map(
      (participant) => participant.user.email,
    ),
  }
}
