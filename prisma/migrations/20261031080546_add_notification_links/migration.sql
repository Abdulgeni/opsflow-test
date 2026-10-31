-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "linkedEntityId" TEXT,
ADD COLUMN     "linkedEntityType" TEXT;

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
