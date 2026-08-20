-- CreateTable
CREATE TABLE "EngagementCriterion" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementScore" (
    "id" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION,

    CONSTRAINT "EngagementScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EngagementCriterion_nome_key" ON "EngagementCriterion"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementScore_criterionId_userId_periodo_key" ON "EngagementScore"("criterionId", "userId", "periodo");

-- CreateIndex
CREATE INDEX "EngagementScore_userId_periodo_idx" ON "EngagementScore"("userId", "periodo");

-- AddForeignKey
ALTER TABLE "EngagementScore" ADD CONSTRAINT "EngagementScore_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "EngagementCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementScore" ADD CONSTRAINT "EngagementScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed dos critérios padrão (Pontualidade e Presença já existiam como colunas fixas; Autonomia é novo)
INSERT INTO "EngagementCriterion" ("id", "nome", "ordem") VALUES
    (gen_random_uuid(), 'Pontualidade', 0),
    (gen_random_uuid(), 'Presença', 1),
    (gen_random_uuid(), 'Autonomia', 2);

-- Migra os dados existentes de TeamEngagement.compromisso/presenca para as novas pontuações genéricas
INSERT INTO "EngagementScore" ("id", "criterionId", "userId", "periodo", "valor")
SELECT gen_random_uuid(), c."id", te."userId", te."periodo", te."compromisso"
FROM "TeamEngagement" te, "EngagementCriterion" c
WHERE c."nome" = 'Pontualidade' AND te."compromisso" IS NOT NULL;

INSERT INTO "EngagementScore" ("id", "criterionId", "userId", "periodo", "valor")
SELECT gen_random_uuid(), c."id", te."userId", te."periodo", te."presenca"
FROM "TeamEngagement" te, "EngagementCriterion" c
WHERE c."nome" = 'Presença' AND te."presenca" IS NOT NULL;
