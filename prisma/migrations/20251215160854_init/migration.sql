-- AlterTable
ALTER TABLE "File" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "FileHistory" ADD COLUMN     "locationChanged" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "newStatusName" TEXT,
ADD COLUMN     "oldStatusName" TEXT,
ADD COLUMN     "statusChanged" BOOLEAN NOT NULL DEFAULT true;
