/*
  Warnings:

  - The primary key for the `MailingList` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `emails` on the `MailingList` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `MailingList` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `MailingList` table. All the data in the column will be lost.
  - You are about to drop the `UsersOnMailingLists` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subjectId` to the `MailingList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MailingList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UsersOnMailingLists" DROP CONSTRAINT "UsersOnMailingLists_mailingListId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnMailingLists" DROP CONSTRAINT "UsersOnMailingLists_userId_fkey";

-- AlterTable
ALTER TABLE "MailingList" DROP CONSTRAINT "MailingList_pkey",
DROP COLUMN "emails",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "subjectId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "MailingList_pkey" PRIMARY KEY ("userId", "subjectId");

-- DropTable
DROP TABLE "UsersOnMailingLists";

-- CreateTable
CREATE TABLE "_MailingLists" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MailingLists_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MailingLists_B_index" ON "_MailingLists"("B");

-- AddForeignKey
ALTER TABLE "MailingList" ADD CONSTRAINT "MailingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailingList" ADD CONSTRAINT "MailingList_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MailingLists" ADD CONSTRAINT "_MailingLists_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MailingLists" ADD CONSTRAINT "_MailingLists_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
