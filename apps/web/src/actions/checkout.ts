'use server';

import { db } from '@/lib/db';
import { orders, listings, eq, sql } from '@/db';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CheckoutData {
  items: {
    listingId: string;
    quantity: number;
    price: number;
  }[];
  paymentMethod: 'cod' | 'escrow';
  shippingAddress: string;
}

export async function createOrders(data: CheckoutData) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Use a transaction for atomic order creation and stock update
    const result = await db.transaction(async (tx) => {
      const orderResults = [];

      for (const item of data.items) {
        // 1. Check stock and fetch listing with vendor info
        const listing = await tx.query.listings.findFirst({
          where: eq(listings.id, item.listingId),
          with: {
            vendor: true,
          },
        });

        if (!listing) {
          throw new Error(`Listing ${item.listingId} not found`);
        }

        // 2. CRITICAL: Vendor self-purchase prevention
        if (listing.vendor.userId === user.id) {
          throw new Error(`Cannot purchase your own product: ${listing.title}`);
        }

        const currentQuantity = listing.quantity;
        if (currentQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${listing.title}`);
        }

        // 2. Create Order
        const totalAmount = (item.price * item.quantity).toString();
        const [newOrder] = await tx
          .insert(orders)
          .values({
            buyerId: user.id,
            listingId: item.listingId,
            quantity: item.quantity.toString(),
            totalAmount,
            paymentMethod: data.paymentMethod, // 'cod' or 'escrow'
            shippingAddress: data.shippingAddress,
            status: 'pending',
          })
          .returning();

        // 3. Update stock
        await tx
          .update(listings)
          .set({
            quantity: sql`${listings.quantity} - ${item.quantity}`,
          })
          .where(eq(listings.id, item.listingId));

        orderResults.push(newOrder);
      }

      return orderResults;
    });

    revalidatePath('/marketplace');
    revalidatePath('/vendor/orders');

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return { success: false, error: error.message || 'Failed to process checkout' };
  }
}
