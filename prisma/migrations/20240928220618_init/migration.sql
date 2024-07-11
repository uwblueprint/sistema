/*
  Warnings:

  - You are about to drop the column `numberOfStudents` on the `Absence` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `Absence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `subjectId` to the `Absence` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Absence" DROP COLUMN "numberOfStudents",
DROP COLUMN "subject",
ADD COLUMN     "subjectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "numOfAbsences" INTEGER NOT NULL DEFAULT 10;

-- DropEnum
DROP TYPE "Subject";

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
