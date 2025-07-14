/*
  Warnings:

  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable - Add password column as nullable first
ALTER TABLE "users" ADD COLUMN "password" TEXT;

-- Update existing users with a default password (they'll need to change it)
-- Using bcrypt hash for "password123" - users should change this immediately
UPDATE "users" SET "password" = '$2b$10$LJRHAde4H09fOCQ5tSksGek0bPnOYxFX0gVa0PonA.w5x.MqfBzDu' WHERE "password" IS NULL;

-- Make password column required
ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;
