/*
  Warnings:

  - You are about to drop the column `userId` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `cartId` on the `CartEvent` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `CartEvent` table. All the data in the column will be lost.
  - You are about to drop the column `cartId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `menuItemId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `menuItemId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `snapshotPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cart_id,menu_item_id]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id,menu_item_id]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customerId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cart_id` to the `CartEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_type` to the `CartEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cart_id` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menu_item_id` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `menu_item_id` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshot_price` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";

-- DropForeignKey
ALTER TABLE "CartEvent" DROP CONSTRAINT "CartEvent_cartId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropIndex
DROP INDEX "Cart_userId_idx";

-- DropIndex
DROP INDEX "Cart_userId_key";

-- DropIndex
DROP INDEX "CartItem_cartId_menuItemId_key";

-- DropIndex
DROP INDEX "OrderItem_orderId_menuItemId_key";

-- DropIndex
DROP INDEX "Review_userId_restaurantId_idx";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "customerId" INTEGER NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "userId",
ADD COLUMN     "customerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CartEvent" DROP COLUMN "cartId",
DROP COLUMN "type",
ADD COLUMN     "cart_id" INTEGER NOT NULL,
ADD COLUMN     "event_data" JSONB,
ADD COLUMN     "event_type" "CartEventType" NOT NULL;

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "cartId",
DROP COLUMN "menuItemId",
ADD COLUMN     "cart_id" INTEGER NOT NULL,
ADD COLUMN     "menu_item_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerId" INTEGER NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "menuItemId",
DROP COLUMN "orderId",
DROP COLUMN "snapshotPrice",
ADD COLUMN     "menu_item_id" INTEGER NOT NULL,
ADD COLUMN     "order_id" INTEGER NOT NULL,
ADD COLUMN     "snapshot_price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "userId",
ADD COLUMN     "customerId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_customerId_key" ON "Cart"("customerId");

-- CreateIndex
CREATE INDEX "Cart_customerId_idx" ON "Cart"("customerId");

-- CreateIndex
CREATE INDEX "CartEvent_cart_id_idx" ON "CartEvent"("cart_id");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cart_id_menu_item_id_key" ON "CartItem"("cart_id", "menu_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_order_id_menu_item_id_key" ON "OrderItem"("order_id", "menu_item_id");

-- CreateIndex
CREATE INDEX "Review_customerId_restaurantId_idx" ON "Review"("customerId", "restaurantId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartEvent" ADD CONSTRAINT "CartEvent_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
