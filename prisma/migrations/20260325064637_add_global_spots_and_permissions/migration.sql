-- AlterTable
ALTER TABLE "instructors" ADD COLUMN     "avatar" VARCHAR(500),
ADD COLUMN     "extras" JSONB;

-- AlterTable
ALTER TABLE "spots" ADD COLUMN     "global_spot_id" INTEGER;

-- CreateTable
CREATE TABLE "global_spots" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "access" VARCHAR(20) NOT NULL DEFAULT 'public',
    "description" TEXT,
    "image" VARCHAR(500),
    "tips" JSONB,
    "services" JSONB,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "parent_spot_id" INTEGER,
    "owner_organization_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "global_spots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spot_permissions" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "global_spot_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'approved',
    "granted_by_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "spot_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_spots_uuid_key" ON "global_spots"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "global_spots_slug_key" ON "global_spots"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "spot_permissions_uuid_key" ON "spot_permissions"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "spot_permissions_global_spot_id_organization_id_key" ON "spot_permissions"("global_spot_id", "organization_id");

-- AddForeignKey
ALTER TABLE "spots" ADD CONSTRAINT "spots_global_spot_id_fkey" FOREIGN KEY ("global_spot_id") REFERENCES "global_spots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_spots" ADD CONSTRAINT "global_spots_parent_spot_id_fkey" FOREIGN KEY ("parent_spot_id") REFERENCES "global_spots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "global_spots" ADD CONSTRAINT "global_spots_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spot_permissions" ADD CONSTRAINT "spot_permissions_global_spot_id_fkey" FOREIGN KEY ("global_spot_id") REFERENCES "global_spots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spot_permissions" ADD CONSTRAINT "spot_permissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spot_permissions" ADD CONSTRAINT "spot_permissions_granted_by_id_fkey" FOREIGN KEY ("granted_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
