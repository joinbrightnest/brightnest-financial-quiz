-- Make lead_email optional (nullable) in tasks table
ALTER TABLE "tasks" 
ALTER COLUMN "lead_email" DROP NOT NULL;

