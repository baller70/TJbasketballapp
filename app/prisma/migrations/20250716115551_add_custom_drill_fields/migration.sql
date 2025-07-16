-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Drill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "skillLevel" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "stepByStep" TEXT NOT NULL,
    "coachingTips" TEXT NOT NULL,
    "videoUrl" TEXT,
    "alternativeVideos" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Drill_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Drill" ("alternativeVideos", "category", "coachingTips", "createdAt", "description", "duration", "equipment", "id", "name", "skillLevel", "stepByStep", "updatedAt", "videoUrl") SELECT "alternativeVideos", "category", "coachingTips", "createdAt", "description", "duration", "equipment", "id", "name", "skillLevel", "stepByStep", "updatedAt", "videoUrl" FROM "Drill";
DROP TABLE "Drill";
ALTER TABLE "new_Drill" RENAME TO "Drill";
CREATE UNIQUE INDEX "Drill_name_key" ON "Drill"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
