-- CreateEnum
CREATE TYPE "PlanFrequency" AS ENUM ('weekly', 'biweekly', 'monthly');

-- CreateTable

CREATE TABLE "Plan" (
    "id" "PlanId" NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "frequency" "PlanFrequency" NOT NULL,
    "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- Seed the three existing tiers
INSERT INTO "Plan" ("id","name","price","frequency","features","updatedAt") VALUES
('single','Single',15000,'monthly', ARRAY['6–8 staple items','Monthly delivery','Pause anytime'], CURRENT_TIMESTAMP),
('family','Family',28000,'biweekly', ARRAY['14–16 staple items','Weekly or bi-weekly delivery','Swap up to 3 items','Priority delivery slots'], CURRENT_TIMESTAMP),
('bulk','Bulk',45000,'weekly', ARRAY['25+ items, larger quantities','Weekly delivery','Full item customization','Dedicated support line'], CURRENT_TIMESTAMP);