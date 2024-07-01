/*
  Warnings:

  - You are about to drop the column `numberOfStudents` on the `Absence` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Absence" DROP COLUMN "numberOfStudents";

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");
