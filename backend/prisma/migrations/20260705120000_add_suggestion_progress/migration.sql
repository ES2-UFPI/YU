-- CreateTable
CREATE TABLE "suggestion_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "completedAt" DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT "suggestion_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "suggestion_progress_userId_suggestionId_completedAt_key" ON "suggestion_progress"("userId", "suggestionId", "completedAt");
