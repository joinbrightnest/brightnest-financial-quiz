-- First, delete all tasks with cancelled status
DELETE FROM tasks WHERE status = 'cancelled';

-- Create a new enum without cancelled
CREATE TYPE "TaskStatus_new" AS ENUM ('pending', 'in_progress', 'completed');

-- Update the column to use the new enum
ALTER TABLE "tasks" 
  ALTER COLUMN "status" TYPE "TaskStatus_new" 
  USING "status"::text::"TaskStatus_new";

-- Drop the old enum
DROP TYPE "TaskStatus";

-- Rename the new enum to the original name
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
