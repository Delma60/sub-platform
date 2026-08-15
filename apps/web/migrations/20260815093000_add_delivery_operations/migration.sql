ALTER TABLE "Delivery"
ADD COLUMN "proofImageUrl" TEXT,
ADD COLUMN "recipientName" TEXT,
ADD COLUMN "riderNote" TEXT,
ADD COLUMN "proofLatitude" DOUBLE PRECISION,
ADD COLUMN "proofLongitude" DOUBLE PRECISION,
ADD COLUMN "issueType" TEXT;
