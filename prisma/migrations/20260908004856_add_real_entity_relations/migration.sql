/*
  Warnings:

  - You are about to drop the column `linkedTo` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `linkedTo` on the `workflow_instances` table. All the data in the column will be lost.
  - Added the required column `linkedEntityId` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkedEntityType` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "documents" DROP COLUMN "linkedTo",
ADD COLUMN     "linkedEntityId" TEXT NOT NULL,
ADD COLUMN     "linkedEntityType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "workflow_instances" DROP COLUMN "linkedTo",
ADD COLUMN     "linkedEntityId" TEXT,
ADD COLUMN     "linkedEntityType" TEXT;

-- CreateTable
CREATE TABLE "occupancy_records" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "occupancy_records_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "occupancy_records" ADD CONSTRAINT "occupancy_records_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupancy_records" ADD CONSTRAINT "occupancy_records_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
