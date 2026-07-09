-- CreateTable
CREATE TABLE "weather_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "condition" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);
