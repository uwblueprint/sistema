-- AddForeignKey
ALTER TABLE "Absence" ADD CONSTRAINT "Absence_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
