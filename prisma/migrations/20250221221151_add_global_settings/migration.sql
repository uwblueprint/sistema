/*
  Warnings:

  - You are about to drop the column `numOfAbsences` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "numOfAbsences";

-- CreateTable
CREATE TABLE "GlobalSettings" (
    "id" SERIAL NOT NULL,
    "absenceCap" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);
