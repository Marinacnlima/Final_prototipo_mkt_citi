CREATE TABLE "GoogleAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoogleAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GoogleAccount_userId_key" ON "GoogleAccount"("userId");

ALTER TABLE "GoogleAccount" ADD CONSTRAINT "GoogleAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CalendarEvent" ADD COLUMN "criadorId" TEXT;

ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
