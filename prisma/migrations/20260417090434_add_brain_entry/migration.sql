-- CreateTable
CREATE TABLE "BrainEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "source" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrainEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrainEntry_userId_idx" ON "BrainEntry"("userId");

-- AddForeignKey
ALTER TABLE "BrainEntry" ADD CONSTRAINT "BrainEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
