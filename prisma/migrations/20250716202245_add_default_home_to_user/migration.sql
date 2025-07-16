-- AlterTable
ALTER TABLE "users" ADD COLUMN     "defaultHomeId" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_defaultHomeId_fkey" FOREIGN KEY ("defaultHomeId") REFERENCES "homes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
