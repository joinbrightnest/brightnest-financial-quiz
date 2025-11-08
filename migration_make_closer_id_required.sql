-- Make closer_id required (NOT NULL) in tasks table
-- This ensures every task must be assigned to a closer

ALTER TABLE "tasks"
ALTER COLUMN "closer_id" SET NOT NULL;

-- Update the comment to reflect this is required
COMMENT ON COLUMN "tasks"."closer_id" IS 'Required - every task must be assigned to a closer';

