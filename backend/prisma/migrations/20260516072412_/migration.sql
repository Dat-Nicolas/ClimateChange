/*
  Warnings:

  - Changed the type of `dayOfWeek` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "dayOfWeek",
ADD COLUMN     "dayOfWeek" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Schedule_roomId_dayOfWeek_idx" ON "Schedule"("roomId", "dayOfWeek");
