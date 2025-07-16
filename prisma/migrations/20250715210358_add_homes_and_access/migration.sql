/*
  Warnings:

  - Added the required column `homeId` to the `inventory_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HomeRole" AS ENUM ('ADMIN', 'MEMBER');

-- CreateTable for homes first
CREATE TABLE "homes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "numberOfAdults" INTEGER NOT NULL DEFAULT 2,
    "numberOfChildren" INTEGER NOT NULL DEFAULT 0,
    "numberOfPets" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "homes_pkey" PRIMARY KEY ("id")
);

-- CreateTable for home accesses
CREATE TABLE "home_accesses" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "homeId" INTEGER NOT NULL,
    "role" "HomeRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_accesses_pkey" PRIMARY KEY ("id")
);

-- Handle existing inventory items by creating a default home
DO $$
DECLARE
    default_user_id INTEGER;
    default_home_id INTEGER;
    inventory_count INTEGER;
BEGIN
    -- Check if there are any inventory items
    SELECT COUNT(*) INTO inventory_count FROM inventory_items;
    
    IF inventory_count > 0 THEN
        -- Find the first user to be the owner of the default home
        SELECT id INTO default_user_id FROM users ORDER BY id LIMIT 1;
        
        IF default_user_id IS NOT NULL THEN
            -- Insert a default home
            INSERT INTO "homes" ("name", "numberOfAdults", "numberOfChildren", "numberOfPets", "ownerId", "updatedAt")
            VALUES ('Default Home', 2, 0, 0, default_user_id, NOW())
            RETURNING id INTO default_home_id;
            
            -- Add homeId column as nullable first
            ALTER TABLE "inventory_items" ADD COLUMN "homeId" INTEGER;
            
            -- Update all existing inventory items to belong to the default home
            UPDATE "inventory_items" SET "homeId" = default_home_id WHERE "homeId" IS NULL;
            
            -- Now make the column NOT NULL
            ALTER TABLE "inventory_items" ALTER COLUMN "homeId" SET NOT NULL;
        ELSE
            -- If no users exist, just add the column as nullable and it will be handled later
            ALTER TABLE "inventory_items" ADD COLUMN "homeId" INTEGER;
        END IF;
    ELSE
        -- If no inventory items exist, just add the required column
        ALTER TABLE "inventory_items" ADD COLUMN "homeId" INTEGER NOT NULL;
    END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX "home_accesses_userId_homeId_key" ON "home_accesses"("userId", "homeId");

-- AddForeignKey
ALTER TABLE "homes" ADD CONSTRAINT "homes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_accesses" ADD CONSTRAINT "home_accesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_accesses" ADD CONSTRAINT "home_accesses_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "homes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "homes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
