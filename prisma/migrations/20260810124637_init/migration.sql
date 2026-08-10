-- CreateEnum
CREATE TYPE "CanalSocial" AS ENUM ('INSTAGRAM', 'LINKEDIN', 'SITE', 'EMAIL');

-- CreateEnum
CREATE TYPE "CanalPost" AS ENUM ('INSTAGRAM', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('GERENTE', 'ANALISTA');

-- CreateEnum
CREATE TYPE "Dificuldade" AS ENUM ('FACIL', 'MEDIO', 'DIFICIL');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('REUNIAO', 'DEADLINE', 'TASK');

-- CreateEnum
CREATE TYPE "StatusCampanha" AS ENUM ('ATIVA', 'PLANEJADA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "TipoMaterial" AS ENUM ('EBOOK', 'NEWSLETTER', 'CASE');

-- CreateEnum
CREATE TYPE "CategoriaPrompt" AS ENUM ('INSTAGRAM', 'LINKEDIN', 'EMAIL', 'CARROSSEL', 'SITE');

-- CreateEnum
CREATE TYPE "UnidadeMetrica" AS ENUM ('PERCENT', 'LEADS', 'SESSOES', 'NUMERO');

-- CreateEnum
CREATE TYPE "Plataforma" AS ENUM ('INSTAGRAM', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "FormatoConteudo" AS ENUM ('REELS', 'CARROSSEL', 'POST_ESTATICO', 'STORIES', 'PDF_DOCUMENTO', 'TEXTO_IMAGEM', 'VIDEO', 'ARTIGO_NEWSLETTER', 'ENQUETE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL DEFAULT 'ANALISTA',
    "cargo" TEXT,
    "primeiroAcesso" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanColumn" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT,
    "ordem" INTEGER NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KanbanColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "redeSocial" "CanalSocial" NOT NULL,
    "dificuldade" "Dificuldade" NOT NULL DEFAULT 'MEDIO',
    "dataInicio" TIMESTAMP(3),
    "dataEntrega" TIMESTAMP(3),
    "colunaId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nota" DOUBLE PRECISION,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horario" TEXT NOT NULL,
    "duracao" TEXT,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'REUNIAO',
    "canal" "CanalSocial",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "StatusCampanha" NOT NULL DEFAULT 'PLANEJADA',
    "objetivo" TEXT NOT NULL,
    "publico" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "alcanceMeta" INTEGER NOT NULL DEFAULT 0,
    "interacoesMeta" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignChannel" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "canal" "CanalSocial" NOT NULL,

    CONSTRAINT "CampaignChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignDailyMetric" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "alcance" INTEGER NOT NULL DEFAULT 0,
    "interacoes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CampaignDailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamEngagement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "compromisso" DOUBLE PRECISION,
    "presenca" DOUBLE PRECISION,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "canal" "CanalPost" NOT NULL,
    "campaignId" TEXT,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "formato" "FormatoConteudo",
    "dataPublicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataLimite" TIMESTAMP(3),
    "alcance" INTEGER NOT NULL DEFAULT 0,
    "impressoes" INTEGER NOT NULL DEFAULT 0,
    "engajamento" INTEGER NOT NULL DEFAULT 0,
    "curtidas" INTEGER NOT NULL DEFAULT 0,
    "comentarios" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "compartilhamentos" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION,
    "visitasPerfil" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostImage" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RichMaterial" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "TipoMaterial" NOT NULL,
    "arquivoUrl" TEXT,
    "capaUrl" TEXT,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RichMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prompt" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" "CategoriaPrompt" NOT NULL,
    "conteudo" TEXT NOT NULL,
    "usos" INTEGER NOT NULL DEFAULT 0,
    "favorito" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTag" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "PromptTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomMetric" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "canal" "CanalSocial" NOT NULL,
    "formula" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "unidade" "UnidadeMetrica" NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardKpi" (
    "id" TEXT NOT NULL,
    "plataforma" "Plataforma" NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "variacaoPct" DOUBLE PRECISION,
    "descricao" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardKpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentFormatPerformance" (
    "id" TEXT NOT NULL,
    "plataforma" "Plataforma" NOT NULL,
    "formato" "FormatoConteudo" NOT NULL,
    "alcanceMedio" INTEGER NOT NULL DEFAULT 0,
    "taxaEngajamento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saves" INTEGER,
    "compartilhamentos" INTEGER,
    "impressoes" INTEGER,
    "ctr" DOUBLE PRECISION,
    "taxaReacao" DOUBLE PRECISION,
    "reposts" INTEGER,
    "comentarios" INTEGER,
    "atualizadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentFormatPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryFunnelStep" (
    "id" TEXT NOT NULL,
    "plataforma" "Plataforma" NOT NULL DEFAULT 'INSTAGRAM',
    "ordem" INTEGER NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,
    "espectadores" INTEGER NOT NULL,

    CONSTRAINT "StoryFunnelStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityHeatmapCell" (
    "id" TEXT NOT NULL,
    "plataforma" "Plataforma" NOT NULL DEFAULT 'INSTAGRAM',
    "diaSemana" INTEGER NOT NULL,
    "faixaHora" INTEGER NOT NULL,
    "intensidade" INTEGER NOT NULL,

    CONSTRAINT "ActivityHeatmapCell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardDistribution" (
    "id" TEXT NOT NULL,
    "plataforma" "Plataforma" NOT NULL,
    "principalPct" DOUBLE PRECISION NOT NULL,
    "secundarioPct" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardDistribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MqlDefinition" (
    "id" TEXT NOT NULL,
    "scoreMinimo" INTEGER NOT NULL DEFAULT 65,
    "taxaMqlSql" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mqlsEsteMes" INTEGER NOT NULL DEFAULT 0,
    "tamanhoEmpresa" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MqlDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MqlTargetRole" (
    "id" TEXT NOT NULL,
    "mqlId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "MqlTargetRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MqlSegment" (
    "id" TEXT NOT NULL,
    "mqlId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "MqlSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MqlBehavior" (
    "id" TEXT NOT NULL,
    "mqlId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "MqlBehavior_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_perfil_ativo_idx" ON "User"("perfil", "ativo");

-- CreateIndex
CREATE INDEX "KanbanColumn_ordem_idx" ON "KanbanColumn"("ordem");

-- CreateIndex
CREATE INDEX "Task_colunaId_ordem_idx" ON "Task"("colunaId", "ordem");

-- CreateIndex
CREATE INDEX "Task_redeSocial_idx" ON "Task"("redeSocial");

-- CreateIndex
CREATE INDEX "Task_dataInicio_idx" ON "Task"("dataInicio");

-- CreateIndex
CREATE INDEX "Task_dataEntrega_idx" ON "Task"("dataEntrega");

-- CreateIndex
CREATE INDEX "TaskAssignment_userId_idx" ON "TaskAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_taskId_userId_key" ON "TaskAssignment"("taskId", "userId");

-- CreateIndex
CREATE INDEX "CalendarEvent_data_idx" ON "CalendarEvent"("data");

-- CreateIndex
CREATE INDEX "CalendarEvent_canal_idx" ON "CalendarEvent"("canal");

-- CreateIndex
CREATE INDEX "Campaign_status_dataInicio_idx" ON "Campaign"("status", "dataInicio");

-- CreateIndex
CREATE INDEX "CampaignChannel_canal_idx" ON "CampaignChannel"("canal");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignChannel_campaignId_canal_key" ON "CampaignChannel"("campaignId", "canal");

-- CreateIndex
CREATE INDEX "CampaignDailyMetric_campaignId_data_idx" ON "CampaignDailyMetric"("campaignId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignDailyMetric_campaignId_data_key" ON "CampaignDailyMetric"("campaignId", "data");

-- CreateIndex
CREATE INDEX "TeamEngagement_periodo_idx" ON "TeamEngagement"("periodo");

-- CreateIndex
CREATE UNIQUE INDEX "TeamEngagement_userId_periodo_key" ON "TeamEngagement"("userId", "periodo");

-- CreateIndex
CREATE INDEX "Post_canal_dataPublicacao_idx" ON "Post"("canal", "dataPublicacao");

-- CreateIndex
CREATE INDEX "Post_campaignId_idx" ON "Post"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "PostImage_postId_ordem_key" ON "PostImage"("postId", "ordem");

-- CreateIndex
CREATE INDEX "RichMaterial_tipo_idx" ON "RichMaterial"("tipo");

-- CreateIndex
CREATE INDEX "Prompt_categoria_idx" ON "Prompt"("categoria");

-- CreateIndex
CREATE INDEX "Prompt_favorito_idx" ON "Prompt"("favorito");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTag_promptId_tag_key" ON "PromptTag"("promptId", "tag");

-- CreateIndex
CREATE INDEX "CustomMetric_atualizadoEm_idx" ON "CustomMetric"("atualizadoEm");

-- CreateIndex
CREATE INDEX "CustomMetric_canal_idx" ON "CustomMetric"("canal");

-- CreateIndex
CREATE INDEX "DashboardKpi_atualizadoEm_idx" ON "DashboardKpi"("atualizadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardKpi_plataforma_nome_key" ON "DashboardKpi"("plataforma", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "ContentFormatPerformance_plataforma_formato_key" ON "ContentFormatPerformance"("plataforma", "formato");

-- CreateIndex
CREATE UNIQUE INDEX "StoryFunnelStep_plataforma_ordem_key" ON "StoryFunnelStep"("plataforma", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityHeatmapCell_plataforma_diaSemana_faixaHora_key" ON "ActivityHeatmapCell"("plataforma", "diaSemana", "faixaHora");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardDistribution_plataforma_key" ON "DashboardDistribution"("plataforma");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_colunaId_fkey" FOREIGN KEY ("colunaId") REFERENCES "KanbanColumn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignChannel" ADD CONSTRAINT "CampaignChannel_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignDailyMetric" ADD CONSTRAINT "CampaignDailyMetric_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEngagement" ADD CONSTRAINT "TeamEngagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostImage" ADD CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptTag" ADD CONSTRAINT "PromptTag_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MqlTargetRole" ADD CONSTRAINT "MqlTargetRole_mqlId_fkey" FOREIGN KEY ("mqlId") REFERENCES "MqlDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MqlSegment" ADD CONSTRAINT "MqlSegment_mqlId_fkey" FOREIGN KEY ("mqlId") REFERENCES "MqlDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MqlBehavior" ADD CONSTRAINT "MqlBehavior_mqlId_fkey" FOREIGN KEY ("mqlId") REFERENCES "MqlDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
