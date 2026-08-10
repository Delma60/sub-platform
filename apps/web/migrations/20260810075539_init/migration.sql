-- AlterTable
-- This migration can be replayed before the Plan table exists in a shadow
-- database, so guard the alteration to keep the full migration history valid.
DO $$
BEGIN
  IF to_regclass('"Plan"') IS NOT NULL THEN
    ALTER TABLE "Plan" ALTER COLUMN "features" DROP DEFAULT;
  END IF;
END $$;
