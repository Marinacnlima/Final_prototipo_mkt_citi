-- CreateTable
CREATE TABLE "ChannelGlobalMetrics" (
    "id" TEXT NOT NULL,
    "plataforma" "Plataforma" NOT NULL,
    "followersTotal" INTEGER NOT NULL DEFAULT 0,
    "followersGrowth" INTEGER NOT NULL DEFAULT 0,
    "channelClicks" INTEGER NOT NULL DEFAULT 0,
    "profileVisits" INTEGER NOT NULL DEFAULT 0,
    "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "reachOverride" INTEGER NOT NULL DEFAULT 0,
    "impressionsOverride" INTEGER NOT NULL DEFAULT 0,
    "engagementRateOverride" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelGlobalMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelGlobalMetrics_plataforma_key" ON "ChannelGlobalMetrics"("plataforma");
