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

  const daysAgo = (n: number) => new Date(Date.now() - n * 86400000)
  const dashboardKpis = [
    { plataforma: 'INSTAGRAM' as const, nome: 'Alcance & Impressões', valor: '48,2K', variacaoPct: 14, descricao: 'Últimos 30 dias', atualizadoEm: daysAgo(2) },
    { plataforma: 'INSTAGRAM' as const, nome: 'Taxa de Engajamento', valor: '4,8%', variacaoPct: 0.3, descricao: '(Curtidas + Comentários + Saves) / Alcance', atualizadoEm: daysAgo(1) },
    // Propositalmente desatualizada (>20 dias) para demonstrar o aviso de métricas obsoletas no dashboard
    { plataforma: 'INSTAGRAM' as const, nome: 'CTR — Link na Bio', valor: '2,1%', variacaoPct: -0.4, descricao: 'Cliques no link da bio', atualizadoEm: daysAgo(25) },
    { plataforma: 'INSTAGRAM' as const, nome: 'Crescimento de Seguidores', valor: '+342', variacaoPct: 5.2, descricao: 'Novos seguidores menos unfollows', atualizadoEm: daysAgo(3) },
    { plataforma: 'LINKEDIN' as const, nome: 'Impressões & Alcance Único', valor: '28,4K', variacaoPct: 3.1, descricao: 'Impressões orgânicas + patrocinadas no período', atualizadoEm: daysAgo(1) },
    { plataforma: 'LINKEDIN' as const, nome: 'Taxa de Engajamento Geral', valor: '4,2%', variacaoPct: 1.8, descricao: '(Cliques + Reações + Comentários + Reposts) / Impressões', atualizadoEm: daysAgo(2) },
    { plataforma: 'LINKEDIN' as const, nome: 'Cliques no Website / CTA', valor: '+624', variacaoPct: 6.4, descricao: 'Cliques no botão principal da página LinkedIn', atualizadoEm: daysAgo(4) },
    { plataforma: 'LINKEDIN' as const, nome: 'Crescimento de Seguidores', valor: '+127', variacaoPct: 14.7, descricao: 'Novos seguidores orgânicos + patrocinados', atualizadoEm: daysAgo(1) },
  ]
  for (const kpi of dashboardKpis) {
    await prisma.dashboardKpi.upsert({
      where: { plataforma_nome: { plataforma: kpi.plataforma, nome: kpi.nome } },
      update: { valor: kpi.valor, variacaoPct: kpi.variacaoPct, descricao: kpi.descricao, atualizadoEm: kpi.atualizadoEm },
      create: kpi,
    })
  }

  const contentFormats = [
    { plataforma: 'INSTAGRAM' as const, formato: 'REELS' as const, alcanceMedio: 12400, taxaEngajamento: 6.8, saves: 892, compartilhamentos: 241, atualizadoEm: daysAgo(3) },
    { plataforma: 'INSTAGRAM' as const, formato: 'CARROSSEL' as const, alcanceMedio: 4800, taxaEngajamento: 5.2, saves: 634, compartilhamentos: 118, atualizadoEm: daysAgo(6) },
    { plataforma: 'INSTAGRAM' as const, formato: 'POST_ESTATICO' as const, alcanceMedio: 3100, taxaEngajamento: 3.1, saves: 220, compartilhamentos: 64, atualizadoEm: daysAgo(4) },
    // Propositalmente desatualizado (>20 dias), para provar que o aviso cobre formatos e não só os 4 KPIs do topo
    { plataforma: 'INSTAGRAM' as const, formato: 'STORIES' as const, alcanceMedio: 2200, taxaEngajamento: 4.4, saves: 0, compartilhamentos: 0, atualizadoEm: daysAgo(26) },
    { plataforma: 'LINKEDIN' as const, formato: 'PDF_DOCUMENTO' as const, taxaEngajamento: 7.2, impressoes: 14200, ctr: 4.8, taxaReacao: 7.2, reposts: 187, comentarios: 86, atualizadoEm: daysAgo(4) },
    { plataforma: 'LINKEDIN' as const, formato: 'TEXTO_IMAGEM' as const, taxaEngajamento: 5.8, impressoes: 9800, ctr: 3.6, taxaReacao: 5.8, reposts: 134, comentarios: 72, atualizadoEm: daysAgo(6) },
    // Propositalmente desatualizado (>20 dias)
    { plataforma: 'LINKEDIN' as const, formato: 'VIDEO' as const, taxaEngajamento: 6.1, impressoes: 7300, ctr: 2.9, taxaReacao: 6.1, reposts: 98, comentarios: 54, atualizadoEm: daysAgo(29) },
    { plataforma: 'LINKEDIN' as const, formato: 'ARTIGO_NEWSLETTER' as const, taxaEngajamento: 2.8, impressoes: 5600, ctr: 6.4, taxaReacao: 2.8, reposts: 150, comentarios: 130, atualizadoEm: daysAgo(3) },
    { plataforma: 'LINKEDIN' as const, formato: 'ENQUETE' as const, taxaEngajamento: 6.1, impressoes: 4800, ctr: 8.2, taxaReacao: 6.1, reposts: 32, comentarios: 240, atualizadoEm: daysAgo(5) },
  ]
  for (const row of contentFormats) {
    await prisma.contentFormatPerformance.upsert({
      where: { plataforma_formato: { plataforma: row.plataforma, formato: row.formato } },
      update: row,
      create: row,
    })
  }

  // Métrica personalizada de exemplo, propositalmente desatualizada — demonstra que o aviso também cobre métricas do usuário
  const staleCustomMetricNome = 'Taxa de Conversão de Leads'
  const existingCustomMetric = await prisma.customMetric.findFirst({ where: { nome: staleCustomMetricNome } })
  if (!existingCustomMetric) {
    await prisma.customMetric.create({
      data: { nome: staleCustomMetricNome, canal: 'INSTAGRAM', formula: 'Leads convertidos / Leads totais × 100', valor: 12.4, unidade: 'PERCENT', atualizadoEm: daysAgo(24), createdAt: daysAgo(40) },
    })
  }
}

main().finally(() => prisma.$disconnect())
