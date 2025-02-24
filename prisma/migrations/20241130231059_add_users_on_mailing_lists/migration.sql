-- CreateTable
CREATE TABLE "UsersOnMailingLists" (
    "userId" INTEGER NOT NULL,
    "mailingListId" INTEGER NOT NULL,

    CONSTRAINT "UsersOnMailingLists_pkey" PRIMARY KEY ("userId","mailingListId")
);

-- AddForeignKey
ALTER TABLE "UsersOnMailingLists" ADD CONSTRAINT "UsersOnMailingLists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnMailingLists" ADD CONSTRAINT "UsersOnMailingLists_mailingListId_fkey" FOREIGN KEY ("mailingListId") REFERENCES "MailingList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
