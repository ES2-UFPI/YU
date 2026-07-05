-- CreateTable
CREATE TABLE "goal_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "completedAt" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "goal_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "goal_progress_userId_goalId_completedAt_key" ON "goal_progress"("userId", "goalId", "completedAt");

-- AddForeignKey
ALTER TABLE "goal_progress" ADD CONSTRAINT "goal_progress_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "wellness_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
