ALTER TABLE "reviews" RENAME COLUMN "buyer_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_buyer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;