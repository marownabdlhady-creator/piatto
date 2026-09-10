-- CreateEnum
CREATE TYPE "MenuDomain" AS ENUM ('FOOD', 'DRINKS');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('SIMPLE', 'OPTIONS', 'TEXT');

-- CreateTable
CREATE TABLE "MenuMeta" (
    "domain" "MenuDomain" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT '₪',
    "noteEn" TEXT,
    "noteAr" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuMeta_pkey" PRIMARY KEY ("domain")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "domain" "MenuDomain" NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "noteEn" TEXT,
    "noteAr" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "descEn" TEXT,
    "descAr" TEXT,
    "priceType" "PriceType" NOT NULL DEFAULT 'SIMPLE',
    "priceValue" INTEGER,
    "priceText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceOption" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Section_domain_order_idx" ON "Section"("domain", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Section_domain_slug_key" ON "Section"("domain", "slug");

-- CreateIndex
CREATE INDEX "Item_sectionId_order_idx" ON "Item"("sectionId", "order");

-- CreateIndex
CREATE INDEX "PriceOption_itemId_order_idx" ON "PriceOption"("itemId", "order");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOption" ADD CONSTRAINT "PriceOption_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
