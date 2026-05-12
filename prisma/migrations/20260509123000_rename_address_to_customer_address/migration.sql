ALTER TABLE "Address" RENAME TO "CustomerAddress";

ALTER SEQUENCE IF EXISTS "Address_id_seq" RENAME TO "CustomerAddress_id_seq";

ALTER TABLE "CustomerAddress"
  RENAME CONSTRAINT "Address_pkey" TO "CustomerAddress_pkey";

ALTER TABLE "CustomerAddress"
  RENAME CONSTRAINT "Address_customerId_fkey" TO "CustomerAddress_customerId_fkey";

ALTER TABLE "Order" RENAME COLUMN "addressId" TO "customerAddressId";

ALTER TABLE "Order"
  RENAME CONSTRAINT "Order_addressId_fkey" TO "Order_customerAddressId_fkey";
