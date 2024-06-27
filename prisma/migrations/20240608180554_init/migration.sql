-- CreateTable
CREATE TABLE "MailingList" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "emails" TEXT[],

    CONSTRAINT "MailingList_pkey" PRIMARY KEY ("id")
);
