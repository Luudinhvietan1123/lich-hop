-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('UPCOMING', 'PAST', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "organizerName" TEXT NOT NULL,
    "organizerRole" TEXT NOT NULL,
    "organizerEmail" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "meetLink" TEXT,
    "googleEventId" TEXT,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
