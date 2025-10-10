-- AddImageFields
ALTER TABLE "articles" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "articles" ADD COLUMN "imageAlt" TEXT;
ALTER TABLE "articles" ADD COLUMN "showImage" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "loading_screens" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "loading_screens" ADD COLUMN "imageAlt" TEXT;
ALTER TABLE "loading_screens" ADD COLUMN "showImage" BOOLEAN NOT NULL DEFAULT false;


