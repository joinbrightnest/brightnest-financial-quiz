-- Check if image columns exist in articles table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('imageUrl', 'imageAlt', 'showImage');

-- Check if image columns exist in loading_screens table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'loading_screens' 
AND column_name IN ('imageUrl', 'imageAlt', 'showImage');

-- If columns don't exist, add them:
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "imageAlt" TEXT;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "showImage" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "loading_screens" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "loading_screens" ADD COLUMN IF NOT EXISTS "imageAlt" TEXT;
ALTER TABLE "loading_screens" ADD COLUMN IF NOT EXISTS "showImage" BOOLEAN NOT NULL DEFAULT false;
