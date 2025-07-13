-- CreateTable
CREATE TABLE "recommended_inventory_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "expiresIn" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommended_inventory_items_pkey" PRIMARY KEY ("id")
);
