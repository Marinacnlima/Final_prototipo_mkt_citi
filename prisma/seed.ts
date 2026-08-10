import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient, PerfilUsuario } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = (process.env.MANAGER_EMAIL ?? 'cecilia@marketops.com').trim().toLowerCase()
  const senhaHash = await bcrypt.hash(process.env.MANAGER_PASSWORD ?? 'ChangeMe123!', 12)
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      nomeCompleto: process.env.MANAGER_NAME ?? 'Cecília', email, senhaHash,
      perfil: PerfilUsuario.GERENTE, cargo: 'Gerente de Marketing', primeiroAcesso: true,
    },
  })
  const columns = [
    ['A Fazer', '#8b5cf6', false], ['Em Andamento', '#507AE6', false],
    ['Em Revisão', '#FFB300', false], ['Aprovado', '#50E678', true], ['Publicado', '#00C853', true],
  ] as const
  for (const [ordem, [nome, cor, isDone]] of columns.entries()) {
    const existing = await prisma.kanbanColumn.findFirst({ where: { nome } })
    if (!existing) await prisma.kanbanColumn.create({ data: { nome, cor, isDone, ordem } })
  }
}

main().finally(() => prisma.$disconnect())
