-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INVITED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('M_AND_M', 'STRINGS', 'CHOIR', 'PERCUSSION');

-- CreateTable
CREATE TABLE "Absence" (
    "id" SERIAL NOT NULL,
    "absentTeacherId" INTEGER NOT NULL,
    "lessonDate" TIMESTAMP(3) NOT NULL,
    "subject" "Subject" NOT NULL,
    "lessonPlan" TEXT,
    "reasonOfAbsence" TEXT NOT NULL,
    "numberOfStudents" INTEGER NOT NULL,
    "substituteTeacherId" INTEGER,

    CONSTRAINT "Absence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'TEACHER',
    "status" "Status" NOT NULL DEFAULT 'INVITED',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_absentTeacherId_fkey" FOREIGN KEY ("absentTeacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_substituteTeacherId_fkey" FOREIGN KEY ("substituteTeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
