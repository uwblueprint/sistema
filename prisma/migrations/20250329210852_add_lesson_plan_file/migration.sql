/*
  Warnings:

  - You are about to drop the column `lessonPlan` on the `Absence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lessonPlanId]` on the table `Absence` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Absence" DROP COLUMN "lessonPlan",
ADD COLUMN     "lessonPlanId" INTEGER;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LessonPlanFile" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "LessonPlanFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Absence_lessonPlanId_key" ON "Absence"("lessonPlanId");

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "LessonPlanFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
