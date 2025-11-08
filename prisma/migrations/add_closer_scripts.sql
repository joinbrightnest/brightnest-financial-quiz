-- CreateTable
CREATE TABLE IF NOT EXISTS "closer_scripts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "call_script" TEXT NOT NULL,
    "program_details" JSONB,
    "email_templates" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closer_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "closer_script_assignments" (
    "id" TEXT NOT NULL,
    "closer_id" TEXT NOT NULL,
    "script_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closer_script_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "closer_script_assignments_closer_id_script_id_key" ON "closer_script_assignments"("closer_id", "script_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "closer_script_assignments_closer_id_idx" ON "closer_script_assignments"("closer_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "closer_script_assignments_script_id_idx" ON "closer_script_assignments"("script_id");

-- AddForeignKey
ALTER TABLE "closer_script_assignments" ADD CONSTRAINT "closer_script_assignments_closer_id_fkey" FOREIGN KEY ("closer_id") REFERENCES "closers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closer_script_assignments" ADD CONSTRAINT "closer_script_assignments_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "closer_scripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;




