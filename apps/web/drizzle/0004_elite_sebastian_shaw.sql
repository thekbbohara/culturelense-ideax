CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'shipped', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cod', 'escrow');--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'escrowed' BEFORE 'failed';--> statement-breakpoint
ALTER TABLE "escrow_transactions" DROP CONSTRAINT "escrow_transactions_listing_id_listings_id_fk";
--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD COLUMN "order_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD COLUMN "vendor_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD COLUMN "held_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD COLUMN "released_at" timestamp;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD COLUMN "refunded_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" "payment_method" NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_status" "delivery_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_confirmed_by" uuid;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_confirmed_by_users_id_fk" FOREIGN KEY ("delivery_confirmed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_transactions" DROP COLUMN "listing_id";