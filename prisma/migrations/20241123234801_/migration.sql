/*
  Warnings:

  - Added the required column `colorGroupId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "colorGroupId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ColorGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "colorCodes" TEXT[],

    CONSTRAINT "ColorGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_colorGroupId_fkey" FOREIGN KEY ("colorGroupId") REFERENCES "ColorGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
