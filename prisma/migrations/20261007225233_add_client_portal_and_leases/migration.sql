-- CreateEnum
CREATE TYPE "ClientRelationshipType" AS ENUM ('TENANT', 'OWNER');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CLIENT';

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "relationshipType" "ClientRelationshipType" NOT NULL DEFAULT 'TENANT';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "clientId" TEXT;

-- CreateTable
CREATE TABLE "leases" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rentAmount" DOUBLE PRECISION NOT NULL,
    "status" "LeaseStatus" NOT NULL DEFAULT 'PENDING',
    "renewalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leases" ADD CONSTRAINT "leases_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
