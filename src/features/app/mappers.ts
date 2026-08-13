import type { ApiPost, ApiUser } from "../../api/contracts"
import type { AppUser, Post } from "../../data"

const POST_FORMAT_FROM_API: Record<string, Post["format"]> = {
  REELS: "reel",
  CARROSSEL: "carousel",
  POST_ESTATICO: "static",
  STORIES: "story",
  PDF_DOCUMENTO: "document",
  TEXTO_IMAGEM: "static",
  VIDEO: "video",
  ARTIGO_NEWSLETTER: "article",
  ENQUETE: "poll",
}

const POST_FORMAT_TO_API: Record<Post["format"], string> = {
  reel: "REELS",
  carousel: "CARROSSEL",
  static: "POST_ESTATICO",
  story: "STORIES",
  document: "PDF_DOCUMENTO",
  video: "VIDEO",
  article: "ARTIGO_NEWSLETTER",
  poll: "ENQUETE",
}

export function mapApiUser(user: ApiUser): AppUser {
  return {
    id: user.id,
    name: user.nomeCompleto,
    initials: user.nomeCompleto
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
    color: user.perfil === "GERENTE" ? "#7D1AD7" : "#507AE6",
    email: user.email,
    password: "",
    role: user.perfil === "GERENTE" ? "gerente" : "analista",
    mustChangePassword: user.primeiroAcesso,
  }
}

export function mapApiPost(post: ApiPost): Post {
  return {
    id: post.id,
    title: post.titulo,
    channel: post.canal.toLowerCase() as Post["channel"],
    campaign: post.campanhaNome ?? "",
    images: post.imagens.map((image) => ({
      url: image.url,
      tipo: image.tipo === "VIDEO" ? "video" : "imagem",
    })),
    linkUrl: post.linkUrl ?? undefined,
    ctr: post.ctr ?? undefined,
    profileVisits: post.visitasPerfil ?? undefined,
    caption: post.conteudo,
    format: POST_FORMAT_FROM_API[post.formato] ?? "static",
    insights: {
      likes: post.curtidas,
      reach: post.alcance,
      impressions: post.impressoes,
      engagement: post.engajamento,
      saves: post.saves,
      shares: post.compartilhamentos,
      comments: post.comentarios,
    },
    publishedAt: post.dataPublicacao?.slice(0, 10) ?? "",
    validUntil: post.dataLimite?.slice(0, 10) ?? "",
  }
}

export function toApiPost(post: Post) {
  return {
    canal: post.channel.toUpperCase(),
    titulo: post.title,
    conteudo: post.caption,
    formato: POST_FORMAT_TO_API[post.format],
    dataPublicacao: post.publishedAt || new Date().toISOString(),
    dataLimite: post.validUntil || null,
    imagens: post.images.map((image) => ({
      url: image.url,
      tipo: image.tipo === "video" ? "VIDEO" : "IMAGEM",
    })),
    linkUrl: post.linkUrl || null,
    alcance: post.insights.reach,
    impressoes: post.insights.impressions,
    engajamento: post.insights.engagement,
    curtidas: post.insights.likes,
    comentarios: post.insights.comments,
    saves: post.insights.saves,
    compartilhamentos: post.insights.shares,
    ...(post.channel === "linkedin"
      ? { ctr: post.ctr ?? 0 }
      : { visitasPerfil: post.profileVisits ?? 0 }),
  }
}
