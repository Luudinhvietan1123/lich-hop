-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "organizerName" TEXT NOT NULL,
    "organizerRole" TEXT NOT NULL,
    "organizerEmail" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "timezone" TEXT NOT NULL,
    "meetLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
