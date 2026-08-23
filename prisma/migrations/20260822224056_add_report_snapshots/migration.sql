-- CreateTable
CREATE TABLE "report_snapshots" (
    "id" TEXT NOT NULL,
    "completionRate" INTEGER NOT NULL,
    "properties" INTEGER NOT NULL,
    "activeClients" INTEGER NOT NULL,
    "openWorkflows" INTEGER NOT NULL,
    "documents" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_snapshots_pkey" PRIMARY KEY ("id")
);
