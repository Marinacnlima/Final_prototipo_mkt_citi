import type { ApiMaterial } from "../../api/contracts"
import type { Material } from "../../data"

export function mapApiMaterial(row: ApiMaterial): Material {
  return {
    id: row.id,
    type: row.tipo.toLowerCase() as Material["type"],
    title: row.titulo,
    description: row.descricao,
    cover: row.capaUrl || "",
    downloads: row.downloads,
    createdAt: row.createdAt?.slice(0, 10) ?? "",
    arquivoUrl: row.arquivoUrl ?? undefined,
    arquivoNome: row.nomeArquivo ?? undefined,
    arquivoTamanho: row.tamanhoBytes ?? undefined,
  }
}
