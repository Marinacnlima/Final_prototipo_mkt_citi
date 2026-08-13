import assert from "node:assert/strict"
import test from "node:test"
import { mapApiPost, mapApiUser, toApiPost } from "../src/features/app/mappers"
import { mapApiColumn, mapApiEvent } from "../src/features/monitoring/mappers"

test("maps API users without changing role and first-access semantics", () => {
  assert.deepEqual(
    mapApiUser({
      id: "u1",
      nomeCompleto: "Ana Lima",
      email: "ana@example.com",
      perfil: "GERENTE",
      primeiroAcesso: true,
    }),
    {
      id: "u1",
      name: "Ana Lima",
      initials: "AL",
      color: "#7D1AD7",
      email: "ana@example.com",
      password: "",
      role: "gerente",
      mustChangePassword: true,
    },
  )
})

test("maps posts and preserves the API payload convention", () => {
  const post = mapApiPost({
    id: "p1",
    titulo: "Post",
    canal: "LINKEDIN",
    campanhaNome: null,
    imagens: [{ url: "/video.mp4", tipo: "VIDEO" }],
    conteudo: "Legenda",
    formato: "ARTIGO_NEWSLETTER",
    curtidas: 1,
    alcance: 2,
    impressoes: 3,
    engajamento: 4,
    saves: 5,
    compartilhamentos: 6,
    comentarios: 7,
    dataPublicacao: "2026-08-13T12:00:00.000Z",
    dataLimite: null,
    ctr: 2.5,
  })

  assert.equal(post.format, "article")
  assert.equal(post.publishedAt, "2026-08-13")
  assert.deepEqual(post.images, [{ url: "/video.mp4", tipo: "video" }])
  assert.equal(toApiPost(post).ctr, 2.5)
})

test("maps Kanban columns and calendar events with the existing defaults", () => {
  const [task] = mapApiColumn({
    id: "c1",
    nome: "A Fazer",
    tasks: [
      {
        id: "t1",
        titulo: "Entrega",
        redeSocial: "EMAIL",
        dificuldade: "FACIL",
        responsaveis: [],
      },
    ],
  }).tasks
  assert.equal(task.channel, "email")
  assert.equal(task.priority, "média")
  assert.equal(task.difficulty, "fácil")

  assert.deepEqual(
    mapApiEvent({
      id: "e1",
      data: "2026-08-13T00:00:00.000Z",
      titulo: "Reunião",
      horario: "09:00",
      horarioFim: null,
      tipo: "REUNIAO",
      canal: null,
      participantes: [],
    }),
    {
      id: "e1",
      date: "2026-08-13",
      title: "Reunião",
      time: "09:00",
      endTime: "",
      type: "meeting",
      channel: null,
      attendees: [],
    },
  )
})
