-- CreateEnum
CREATE TYPE "AudienceTab" AS ENUM ('CARGO', 'SENIORIDADE', 'SETOR', 'LOCALIZACAO');

-- CreateTable
CREATE TABLE "AudienceSegment" (
    "id" TEXT NOT NULL,
    "tab" "AudienceTab" NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AudienceSegment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AudienceSegment_tab_ordem_idx" ON "AudienceSegment"("tab", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceSegment_tab_label_key" ON "AudienceSegment"("tab", "label");
