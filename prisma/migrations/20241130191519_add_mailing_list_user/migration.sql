/*
  Warnings:

  - You are about to drop the column `emails` on the `MailingList` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MailingList" DROP COLUMN "emails",
ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "MailingListUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mailingListId" INTEGER NOT NULL,

    CONSTRAINT "MailingListUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MailingListUser_userId_mailingListId_key" ON "MailingListUser"("userId", "mailingListId");

-- AddForeignKey
ALTER TABLE "MailingList" ADD CONSTRAINT "MailingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailingListUser" ADD CONSTRAINT "MailingListUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailingListUser" ADD CONSTRAINT "MailingListUser_mailingListId_fkey" FOREIGN KEY ("mailingListId") REFERENCES "MailingList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
