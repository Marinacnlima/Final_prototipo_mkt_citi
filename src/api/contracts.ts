export type ApiChannel = "INSTAGRAM" | "LINKEDIN" | "SITE" | "EMAIL"
export type ApiDifficulty = "FACIL" | "MEDIO" | "DIFICIL"
export type ApiEventType = "REUNIAO" | "DEADLINE" | "TASK"

export interface ApiUser {
  id: string
  nomeCompleto: string
  email: string
  perfil: "GERENTE" | "ANALISTA"
  cargo?: string | null
  primeiroAcesso: boolean
}

export interface ApiPostImage {
  url: string
  tipo: "IMAGEM" | "VIDEO"
}

export interface ApiPost {
  id: string
  titulo: string
  canal: ApiChannel
  campanhaNome?: string | null
  imagens: ApiPostImage[]
  linkUrl?: string | null
  ctr?: number | null
  visitasPerfil?: number | null
  conteudo: string
  formato: string
  curtidas: number
  alcance: number
  impressoes: number
  engajamento: number
  saves: number
  compartilhamentos: number
  comentarios: number
  dataPublicacao?: string | null
  dataLimite?: string | null
}

export interface ApiTaskAssignment {
  userId: string
  nome: string
  nota?: number | null
}

export interface ApiTask {
  id: string
  titulo: string
  redeSocial: ApiChannel
  dificuldade: ApiDifficulty
  dataInicio?: string | null
  dataEntrega?: string | null
  responsaveis?: ApiTaskAssignment[]
}

export interface ApiKanbanColumn {
  id: string
  nome: string
  tasks?: ApiTask[]
}

export interface ApiEventParticipant {
  userId: string
  nome: string
  email?: string
}

export interface ApiCalendarEvent {
  id: string
  data: string
  titulo: string
  horario: string
  horarioFim?: string | null
  tipo: ApiEventType
  canal?: ApiChannel | null
  participantes?: ApiEventParticipant[]
}

export interface ApiMaterial {
  id: string
  tipo: "EBOOK" | "NEWSLETTER" | "CASE"
  titulo: string
  descricao: string
  capaUrl?: string | null
  downloads: number
  createdAt?: string | null
  arquivoUrl?: string | null
  nomeArquivo?: string | null
  tamanhoBytes?: number | null
}

export interface ApiCustomMetric {
  id: string
  nome: string
  valor: number
  unidade: string
  formula: string
  canal?: ApiChannel | null
  atualizadoEm?: string
}
