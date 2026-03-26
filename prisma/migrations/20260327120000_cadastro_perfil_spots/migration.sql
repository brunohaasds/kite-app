-- AlterTable users
ALTER TABLE "users" ADD COLUMN "profile_completed_at" TIMESTAMP(0);

-- AlterTable organizations: slug único (backfill estável por id)
ALTER TABLE "organizations" ADD COLUMN "slug" VARCHAR(255);

UPDATE "organizations" SET "slug" = 'escola-' || "id"::text WHERE "slug" IS NULL AND "deleted_at" IS NULL;
UPDATE "organizations" SET "slug" = 'escola-del-' || "id"::text WHERE "slug" IS NULL;

ALTER TABLE "organizations" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- AlterTable global_spots
ALTER TABLE "global_spots" ADD COLUMN "country" VARCHAR(100);
ALTER TABLE "global_spots" ADD COLUMN "state" VARCHAR(100);
