CREATE TABLE "wellness_goals" (
  "id" VARCHAR(64) NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "short_description" VARCHAR(255) NOT NULL,
  "icon" VARCHAR(80) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "wellness_goals_pkey" PRIMARY KEY ("id")
);
