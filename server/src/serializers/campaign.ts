import type { Prisma } from "@prisma/client"

export const campaignInclude = {
  canais: true,
  metricasDiarias: { orderBy: { data: "asc" as const } },
} as const
type CampaignWithRelations = Prisma.CampaignGetPayload<{
  include: typeof campaignInclude
}>

export function serializeCampaign(campaign: CampaignWithRelations) {
  const alcanceAtual = campaign.metricasDiarias.reduce(
    (sum, metric) => sum + metric.alcance,
    0,
  )
  const interacoesAtual = campaign.metricasDiarias.reduce(
    (sum, metric) => sum + metric.interacoes,
    0,
  )
  const end = Math.min(Date.now(), campaign.dataFim.getTime())
  return {
    ...campaign,
    canais: campaign.canais.map((entry) => entry.canal),
    alcanceAtual,
    interacoesAtual,
    progressoAlcance: campaign.alcanceMeta
      ? Math.min(1, alcanceAtual / campaign.alcanceMeta)
      : 0,
    progressoInteracoes: campaign.interacoesMeta
      ? Math.min(1, interacoesAtual / campaign.interacoesMeta)
      : 0,
    diasNoAr: Math.max(
      0,
      Math.floor((end - campaign.dataInicio.getTime()) / 86400000),
    ),
    totalRegistrosMetricas: campaign.metricasDiarias.length,
  }
}
