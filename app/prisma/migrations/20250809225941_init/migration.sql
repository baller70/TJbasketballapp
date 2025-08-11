-- CreateTable
CREATE TABLE "WorkoutComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "workoutCompletionId" TEXT,
    "content" TEXT NOT NULL,
    "parentCommentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkoutComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkoutComment_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkoutComment_workoutCompletionId_fkey" FOREIGN KEY ("workoutCompletionId") REFERENCES "WorkoutCompletion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkoutComment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "WorkoutComment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
