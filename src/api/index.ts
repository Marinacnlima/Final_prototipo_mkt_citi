import type {
  ApiCalendarEvent,
  ApiCustomMetric,
  ApiKanbanColumn,
  ApiMaterial,
  ApiPost,
  ApiTask,
  ApiUser,
} from "./contracts"
import { hasToken, jsonBody, request, setToken, upload } from "./client"

export { ApiClientError } from "./client"

export const api = {
  setToken,
  get hasToken() {
    return hasToken()
  },
  login: (email: string, senha: string) =>
    request<{ token: string, user: ApiUser }>("/auth/login", {
      method: "POST",
      body: jsonBody({ email, senha }),
    }),
  me: () => request<ApiUser>("/auth/me"),
  changePassword: (senhaAtual: string, novaSenha: string) =>
    request("/auth/change-password", {
      method: "POST",
      body: jsonBody({ senhaAtual, novaSenha, confirmarSenha: novaSenha }),
    }),
  logout: () => request("/auth/logout", { method: "POST" }),
  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: jsonBody({ email }),
    }),
  verifyCode: (email: string, codigo: string) =>
    request<{ resetToken: string }>("/auth/verify-code", {
      method: "POST",
      body: jsonBody({ email, codigo }),
    }),
  resetPassword: (resetToken: string, novaSenha: string) =>
    request("/auth/reset-password", {
      method: "POST",
      body: jsonBody({ resetToken, novaSenha, confirmarSenha: novaSenha }),
    }),
  users: {
    list: () => request<ApiUser[]>("/users"),
    create: (data: any) =>
      request<ApiUser>("/users", { method: "POST", body: jsonBody(data) }),
    update: (id: string | number, data: any) =>
      request<ApiUser>(`/users/${id}`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    remove: (id: string | number) =>
      request(`/users/${id}`, { method: "DELETE" }),
  },
  kanban: {
    columns: (canal?: string) =>
      request<ApiKanbanColumn[]>(
        `/kanban/columns${canal ? `?canal=${canal}` : ""}`,
      ),
    assignees: () => request<any[]>("/kanban/assignees"),
    createColumn: (data: any) =>
      request<ApiKanbanColumn>("/kanban/columns", {
        method: "POST",
        body: jsonBody(data),
      }),
    updateColumn: (id: string | number, data: any) =>
      request<ApiKanbanColumn>(`/kanban/columns/${id}`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    removeColumn: (id: string | number) =>
      request(`/kanban/columns/${id}`, { method: "DELETE" }),
    createTask: (data: any) =>
      request<ApiTask>("/kanban/tasks", {
        method: "POST",
        body: jsonBody(data),
      }),
    updateTask: (id: string | number, data: any) =>
      request<ApiTask>(`/kanban/tasks/${id}`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    moveTask: (id: string | number, data: any) =>
      request<ApiTask>(`/kanban/tasks/${id}/move`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    removeTask: (id: string | number) =>
      request(`/kanban/tasks/${id}`, { method: "DELETE" }),
  },
  calendar: {
    list: (query = "") =>
      request<ApiCalendarEvent[]>(`/calendar/events${query}`),
    create: (data: any) =>
      request<ApiCalendarEvent>("/calendar/events", {
        method: "POST",
        body: jsonBody(data),
      }),
    update: (id: string | number, data: any) =>
      request<ApiCalendarEvent>(`/calendar/events/${id}`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    remove: (id: string | number) =>
      request(`/calendar/events/${id}`, { method: "DELETE" }),
    participants: () => request<any[]>("/calendar/participants"),
  },
  campaigns: {
    list: () => request<any[]>("/campaigns"),
    create: (data: any) =>
      request<any>("/campaigns", { method: "POST", body: jsonBody(data) }),
    update: (id: string | number, data: any) =>
      request<any>(`/campaigns/${id}`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    remove: (id: string | number) =>
      request(`/campaigns/${id}`, { method: "DELETE" }),
    addMetric: (id: string | number, data: any) =>
      request<any>(`/campaigns/${id}/metrics`, {
        method: "POST",
        body: jsonBody(data),
      }),
  },
  engagement: {
    get: (periodo: string) => request<any>(`/engagement?periodo=${periodo}`),
    update: (id: string | number, periodo: string, data: any) =>
      request<any>(`/engagement/${id}?periodo=${periodo}`, {
        method: "PUT",
        body: jsonBody(data),
      }),
  },
  posts: {
    list: () => request<ApiPost[]>("/library/posts"),
    create: (data: any) =>
      request<ApiPost>("/library/posts", {
        method: "POST",
        body: jsonBody(data),
      }),
    update: (id: string | number, data: any) =>
      request<ApiPost>(`/library/posts/${id}`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    remove: (id: string | number) =>
      request(`/library/posts/${id}`, { method: "DELETE" }),
    uploadMedia: (file: File) =>
      upload<{ url: string, tipo: "IMAGEM" | "VIDEO" }>(
        "/library/posts/upload",
        file,
      ),
  },
  materials: {
    list: () => request<ApiMaterial[]>("/library/materials"),
    create: (data: any) =>
      request<ApiMaterial>("/library/materials", {
        method: "POST",
        body: jsonBody(data),
      }),
    update: (id: string | number, data: any) =>
      request<ApiMaterial>(`/library/materials/${id}`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    remove: (id: string | number) =>
      request(`/library/materials/${id}`, { method: "DELETE" }),
    download: (id: string | number) =>
      request<ApiMaterial>(`/library/materials/${id}/download`, {
        method: "POST",
      }),
    upload: (file: File) =>
      upload<{
        arquivoUrl: string
        nomeArquivo: string
        tamanhoBytes: number
        mimeType: string
      }>("/library/materials/upload", file),
  },
  prompts: {
    list: () => request<any[]>("/library/prompts"),
    create: (data: any) =>
      request<any>("/library/prompts", {
        method: "POST",
        body: jsonBody(data),
      }),
    update: (id: string | number, data: any) =>
      request<any>(`/library/prompts/${id}`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    remove: (id: string | number) =>
      request(`/library/prompts/${id}`, { method: "DELETE" }),
    copy: (id: string | number) =>
      request<any>(`/library/prompts/${id}/copy`, { method: "POST" }),
    favorite: (id: string | number, favorito: boolean) =>
      request<any>(`/library/prompts/${id}/favorite`, {
        method: "PATCH",
        body: jsonBody({ favorito }),
      }),
  },
  metrics: {
    custom: () => request<ApiCustomMetric[]>("/metrics/custom"),
    createCustom: (data: any) =>
      request<ApiCustomMetric>("/metrics/custom", {
        method: "POST",
        body: jsonBody(data),
      }),
    updateCustom: (id: string | number, data: any) =>
      request<ApiCustomMetric>(`/metrics/custom/${id}`, {
        method: "PATCH",
        body: jsonBody(data),
      }),
    removeCustom: (id: string | number) =>
      request(`/metrics/custom/${id}`, { method: "DELETE" }),
    dashboard: (platform: string) =>
      request<any>(`/metrics/dashboard?plataforma=${platform}`),
    saveDashboard: (platform: string, data: any) =>
      request<any>(`/metrics/dashboard?plataforma=${platform}`, {
        method: "PUT",
        body: jsonBody(data),
      }),
    mql: () => request<any>("/metrics/mql"),
    saveMql: (data: any) =>
      request<any>("/metrics/mql", { method: "PUT", body: jsonBody(data) }),
  },
  google: {
    status: () =>
      request<{ connected: boolean, email: string | null }>("/google/status"),
    connect: () => request<{ url: string }>("/google/connect"),
    disconnect: () => request("/google/disconnect", { method: "DELETE" }),
  },
}
