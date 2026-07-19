-- AlterTable
ALTER TABLE "Stop" ADD COLUMN     "stationId" TEXT;

-- AlterTable
ALTER TABLE "Train" ADD COLUMN     "arrivalTime" TEXT,
ADD COLUMN     "departureTime" TEXT,
ADD COLUMN     "duration" TEXT;

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Station_code_key" ON "Station"("code");

-- CreateIndex
CREATE INDEX "Station_code_idx" ON "Station"("code");

-- CreateIndex
CREATE INDEX "Stop_stationId_idx" ON "Stop"("stationId");

-- AddForeignKey
ALTER TABLE "Stop" ADD CONSTRAINT "Stop_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE SET NULL ON UPDATE CASCADE;
