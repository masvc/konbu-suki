-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isOwnerPick" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listPrice" INTEGER,
ADD COLUMN     "ownerComment" TEXT,
ADD COLUMN     "priceFetchedAt" TIMESTAMP(3);
