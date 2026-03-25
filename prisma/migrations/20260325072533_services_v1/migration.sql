-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "whatsapp" VARCHAR(20),
    "instagram" VARCHAR(255),
    "avatar" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_scope" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" INTEGER NOT NULL,
    "scope_type" VARCHAR(20) NOT NULL,
    "organization_id" INTEGER,
    "global_spot_id" INTEGER,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_scope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_bookings" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "service_id" INTEGER NOT NULL,
    "student_id" INTEGER,
    "session_id" INTEGER,
    "status" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "quote_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "service_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_uuid_key" ON "services"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "services_user_id_key" ON "services"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_scope_uuid_key" ON "service_scope"("uuid");

-- CreateIndex
CREATE INDEX "service_scope_organization_id_idx" ON "service_scope"("organization_id");

-- CreateIndex
CREATE INDEX "service_scope_global_spot_id_idx" ON "service_scope"("global_spot_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_scope_service_id_organization_id_key" ON "service_scope"("service_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_scope_service_id_global_spot_id_key" ON "service_scope"("service_id", "global_spot_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_bookings_uuid_key" ON "service_bookings"("uuid");

-- CreateIndex
CREATE INDEX "service_bookings_service_id_idx" ON "service_bookings"("service_id");

-- CreateIndex
CREATE INDEX "service_bookings_student_id_idx" ON "service_bookings"("student_id");

-- CreateIndex
CREATE INDEX "service_bookings_session_id_idx" ON "service_bookings"("session_id");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_scope" ADD CONSTRAINT "service_scope_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_scope" ADD CONSTRAINT "service_scope_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_scope" ADD CONSTRAINT "service_scope_global_spot_id_fkey" FOREIGN KEY ("global_spot_id") REFERENCES "global_spots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
