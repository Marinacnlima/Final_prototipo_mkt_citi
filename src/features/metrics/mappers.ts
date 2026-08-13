import type { ApiCustomMetric } from "../../api/contracts"
import type { CustomMetric } from "../../data"

export function mapApiMetric(row: ApiCustomMetric): CustomMetric {
  return {
    id: row.id,
    name: row.nome,
    value: row.valor,
    unit: row.unidade,
    formula: row.formula,
    channel: row.canal
      ? row.canal.toLowerCase() as CustomMetric["channel"]
      : undefined,
    color: "#7D1AD7",
    updatedAt: row.atualizadoEm,
  }
}

export function toApiMetric(metric: CustomMetric) {
  return {
    nome: metric.name,
    canal:
      metric.channel === "instagram" || metric.channel === "linkedin"
        ? metric.channel.toUpperCase()
        : null,
    formula: metric.formula,
    valor: metric.value,
    unidade: metric.unit,
  }
}
