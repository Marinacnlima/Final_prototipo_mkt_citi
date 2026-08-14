CREATE TYPE "FormatoLocalEvento" AS ENUM ('MEET', 'PRESENCIAL');

ALTER TABLE "CalendarEvent" ADD COLUMN "formatoLocal" "FormatoLocalEvento";
ALTER TABLE "CalendarEvent" ADD COLUMN "sala" TEXT;
