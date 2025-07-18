-- CreateTable
CREATE TABLE "ParentEmailSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "notificationEmail" TEXT NOT NULL,
    "receiveAllCompletions" BOOLEAN NOT NULL DEFAULT false,
    "receiveAchievements" BOOLEAN NOT NULL DEFAULT true,
    "receiveWeeklyReports" BOOLEAN NOT NULL DEFAULT true,
    "receiveMediaUploads" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ParentEmailSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentEmailSettings_userId_key" ON "ParentEmailSettings"("userId");
