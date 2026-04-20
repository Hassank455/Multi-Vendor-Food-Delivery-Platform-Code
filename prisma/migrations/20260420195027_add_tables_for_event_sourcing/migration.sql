-- CreateTable
CREATE TABLE "event_store" (
    "id" UUID NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "event_metadata" JSONB,
    "version" INTEGER NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_read_model" (
    "cart_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "version" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_read_model_pkey" PRIMARY KEY ("cart_id")
);

-- CreateTable
CREATE TABLE "cart_item_read_model" (
    "id" UUID NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "line_total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "cart_item_read_model_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_store_aggregate_id_occurred_at_idx" ON "event_store"("aggregate_id", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "event_store_aggregate_version_key" ON "event_store"("aggregate_id", "version");

-- CreateIndex
CREATE INDEX "cart_item_read_model_cart_id_idx" ON "cart_item_read_model"("cart_id");

-- AddForeignKey
ALTER TABLE "cart_item_read_model" ADD CONSTRAINT "cart_item_read_model_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart_read_model"("cart_id") ON DELETE CASCADE ON UPDATE CASCADE;
