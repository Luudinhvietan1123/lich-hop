-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
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
    "googleEventId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Event" ("company", "createdAt", "description", "endTime", "id", "meetLink", "organizerEmail", "organizerName", "organizerRole", "startTime", "summary", "timezone") SELECT "company", "createdAt", "description", "endTime", "id", "meetLink", "organizerEmail", "organizerName", "organizerRole", "startTime", "summary", "timezone" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
