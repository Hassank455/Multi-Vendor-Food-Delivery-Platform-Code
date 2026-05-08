-- AlterTable
ALTER TABLE "Cart"
ADD COLUMN "restaurantId" INTEGER,
ALTER COLUMN "subTotal" TYPE DECIMAL(10, 2)
USING "subTotal"::DECIMAL(10, 2);

-- Backfill existing carts from their current items
UPDATE "Cart" c
SET "restaurantId" = sub."restaurantId"
FROM (
  SELECT ci."cart_id" AS "cartId", MIN(mi."restaurantId") AS "restaurantId"
  FROM "CartItem" ci
  INNER JOIN "MenuItem" mi ON mi."id" = ci."menu_item_id"
  GROUP BY ci."cart_id"
) sub
WHERE c."id" = sub."cartId";

-- CreateIndex
CREATE INDEX "Cart_restaurantId_idx" ON "Cart"("restaurantId");

-- AddForeignKey
ALTER TABLE "Cart"
ADD CONSTRAINT "Cart_restaurantId_fkey"
FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
