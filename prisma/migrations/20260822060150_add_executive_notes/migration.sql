-- CreateTable
CREATE TABLE "executive_notes" (
    "id" TEXT NOT NULL,
    "linkedTo" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executive_notes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "executive_notes" ADD CONSTRAINT "executive_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
