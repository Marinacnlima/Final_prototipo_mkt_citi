import type {
  ApiCalendarEvent,
  ApiChannel,
  ApiDifficulty,
  ApiEventType,
  ApiKanbanColumn,
  ApiTask,
} from "../../api/contracts"
import type {
  CalendarEvent,
  ChannelType,
  Difficulty,
  KanbanColumn,
  Task,
} from "../../data"

export const CHANNEL_TO_API: Record<ChannelType, ApiChannel> = {
  instagram: "INSTAGRAM",
  linkedin: "LINKEDIN",
  site: "SITE",
  email: "EMAIL",
}
export const DIFFICULTY_TO_API: Record<Difficulty, ApiDifficulty> = {
  fácil: "FACIL",
  médio: "MEDIO",
  difícil: "DIFICIL",
}
export const TIPO_TO_API: Record<CalendarEvent["type"], ApiEventType> = {
  meeting: "REUNIAO",
  deadline: "DEADLINE",
  task: "TASK",
}

const DIFFICULTY_FROM_API: Record<ApiDifficulty, Difficulty> = {
  FACIL: "fácil",
  MEDIO: "médio",
  DIFICIL: "difícil",
}
const TIPO_FROM_API: Record<ApiEventType, CalendarEvent["type"]> = {
  REUNIAO: "meeting",
  DEADLINE: "deadline",
  TASK: "task",
}
const CHANNEL_FROM_API: Record<ApiChannel, ChannelType> = {
  INSTAGRAM: "instagram",
  LINKEDIN: "linkedin",
  SITE: "site",
  EMAIL: "email",
}

export function mapApiTask(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.titulo,
    channel: CHANNEL_FROM_API[task.redeSocial],
    assignees: (task.responsaveis ?? []).map((assignment) => ({
      memberId: assignment.userId,
      note: assignment.nota ?? null,
    })),
    priority: "média",
    difficulty: DIFFICULTY_FROM_API[task.dificuldade] ?? "médio",
    startDate: task.dataInicio?.slice(0, 10) ?? "",
    dueDate: task.dataEntrega?.slice(0, 10) ?? "",
  }
}

export function mapApiColumn(column: ApiKanbanColumn): KanbanColumn {
  return {
    id: column.id,
    name: column.nome,
    tasks: (column.tasks ?? []).map(mapApiTask),
  }
}

export function mapApiEvent(event: ApiCalendarEvent): CalendarEvent {
  return {
    id: event.id,
    date: String(event.data).slice(0, 10),
    title: event.titulo,
    time: event.horario,
    endTime: event.horarioFim ?? "",
    type: TIPO_FROM_API[event.tipo] ?? "meeting",
    channel: event.canal ? CHANNEL_FROM_API[event.canal] : null,
    attendees: (event.participantes ?? []).map((participant) => ({
      userId: participant.userId,
      nome: participant.nome,
    })),
  }
}
