-- CreateEnum
CREATE TYPE "TipoMidia" AS ENUM ('IMAGEM', 'VIDEO');

-- AlterTable
ALTER TABLE "CustomMetric" ALTER COLUMN "canal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "linkUrl" TEXT;

-- AlterTable
ALTER TABLE "PostImage" ADD COLUMN     "tipo" "TipoMidia" NOT NULL DEFAULT 'IMAGEM';

-- AlterTable
ALTER TABLE "RichMaterial" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "nomeArquivo" TEXT,
ADD COLUMN     "tamanhoBytes" INTEGER;

-- CreateTable
CREATE TABLE "PasswordResetCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordResetCode_userId_idx" ON "PasswordResetCode"("userId");

-- AddForeignKey
ALTER TABLE "PasswordResetCode" ADD CONSTRAINT "PasswordResetCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
