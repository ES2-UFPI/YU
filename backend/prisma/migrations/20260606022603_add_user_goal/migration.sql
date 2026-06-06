-- CreateTable
CREATE TABLE "UserGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoal_userId_goalId_key" ON "UserGoal"("userId", "goalId");

-- AddForeignKey
ALTER TABLE "UserGoal" ADD CONSTRAINT "UserGoal_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "wellness_goals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
