-- Create normal_website_clicks table
CREATE TABLE IF NOT EXISTS "normal_website_clicks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for faster date filtering
CREATE INDEX IF NOT EXISTS "normal_website_clicks_created_at_idx" ON "normal_website_clicks"("created_at");

