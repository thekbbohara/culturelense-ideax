'use server';

import { db } from '@/lib/db';
import {
    orders,
    listings,
    escrowTransactions,
    userBalances,
    vendors,
    eq,
    sql,
} from '@/db';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Create escrow payment for an order
 * - Simulates payment gateway integration
 * - Creates escrow transaction with funds held
 * - Updates order payment status to 'escrowed'
 * - Vendor notified to ship product
 */
export async function createEscrowPayment(orderId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const result = await db.transaction(async (tx) => {
            // 1. Fetch order with listing and vendor details
            const order = await tx.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: {
                    listing: {
                        with: {
                            vendor: true,
                        },
                    },
                },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // 2. Validate order belongs to current user
            if (order.buyerId !== user.id) {
                throw new Error('Unauthorized: This is not your order');
            }

            // 3. Validate order is for escrow payment
            if (order.paymentMethod !== 'escrow') {
                throw new Error('This order is not set for escrow payment');
            }

            // 4. Check if payment already processed
            if (order.paymentStatus === 'escrowed' || order.paymentStatus === 'paid') {
                return { alreadyPaid: true, order };
            }

            // 5. CRITICAL: Vendor self-purchase prevention
            const vendorUserId = order.listing.vendor.userId;
            if (vendorUserId === user.id) {
                throw new Error('Cannot purchase your own product');
            }

            // 6. Simulate payment gateway call
            // In production, integrate with Stripe/PayPal here
            // const paymentIntent = await stripe.paymentIntents.create({...});

            // For now, simulate successful payment
            const paymentSuccessful = true;

            if (!paymentSuccessful) {
                throw new Error('Payment gateway declined the transaction');
            }

            // 7. Create escrow transaction
            const [escrow] = await tx
                .insert(escrowTransactions)
                .values({
                    orderId: order.id,
                    buyerId: user.id,
                    vendorId: order.listing.vendorId,
                    amount: order.totalAmount,
                    state: 'held',
                    heldAt: new Date(),
                })
                .returning();

            // 8. Update order payment status
            const [updatedOrder] = await tx
                .update(orders)
                .set({
                    paymentStatus: 'escrowed',
                    paymentFailureReason: null,
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId))
                .returning();

            return { order: updatedOrder, escrow };
        });

        revalidatePath('/marketplace');
        revalidatePath('/profile');
        revalidatePath('/vendor/orders');

        return { success: true, data: result };
    } catch (error: any) {
        console.error('[Payment] createEscrowPayment error:', error);

        // Update order with failure reason
        try {
            await db
                .update(orders)
                .set({
                    paymentStatus: 'failed',
                    paymentFailureReason: error.message || 'Unknown error',
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId));
        } catch (updateError) {
            console.error('[Payment] Failed to update order failure reason:', updateError);
        }

        return {
            success: false,
            error: error.message || 'Payment processing failed. Please try again.',
        };
    }
}

/**
 * Confirm delivery for escrow order (called by buyer)
 * - Releases funds from escrow to vendor
 * - Updates order status to delivered and paid
 * - Credits vendor balance for payout tracking
 */
export async function confirmEscrowDelivery(orderId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const result = await db.transaction(async (tx) => {
            // 1. Fetch order
            const order = await tx.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: {
                    listing: {
                        with: {
                            vendor: true,
                        },
                    },
                },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // 2. Validate buyer owns this order
            if (order.buyerId !== user.id) {
                throw new Error('Unauthorized: Only the buyer can confirm delivery');
            }

            // 3. Validate order is escrowed
            if (order.paymentStatus !== 'escrowed') {
                throw new Error('This order is not in escrow');
            }

            // 4. Update escrow state to released
            const escrow = await tx.query.escrowTransactions.findFirst({
                where: eq(escrowTransactions.orderId, orderId),
            });

            if (!escrow) {
                throw new Error('Escrow transaction not found');
            }

            await tx
                .update(escrowTransactions)
                .set({
                    state: 'released',
                    releasedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(escrowTransactions.id, escrow.id));

            // 5. Credit vendor balance (for payout tracking)
            const vendorUserId = order.listing.vendor.userId;
            const orderAmount = parseFloat(order.totalAmount);

            const vendorBalance = await tx.query.userBalances.findFirst({
                where: eq(userBalances.userId, vendorUserId),
            });

            if (vendorBalance) {
                await tx
                    .update(userBalances)
                    .set({
                        balance: sql`CAST(${userBalances.balance} AS NUMERIC) + ${orderAmount}`,
                        updatedAt: new Date(),
                    })
                    .where(eq(userBalances.userId, vendorUserId));
            } else {
                await tx.insert(userBalances).values({
                    userId: vendorUserId,
                    balance: orderAmount.toString(),
                    currency: 'USD',
                });
            }

            // 6. Update order status
            const [updatedOrder] = await tx
                .update(orders)
                .set({
                    paymentStatus: 'paid',
                    deliveryStatus: 'delivered',
                    deliveryConfirmedAt: new Date(),
                    deliveryConfirmedBy: user.id,
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId))
                .returning();

            return { order: updatedOrder };
        });

        revalidatePath('/marketplace');
        revalidatePath('/profile');
        revalidatePath('/vendor/orders');

        return { success: true, data: result };
    } catch (error: any) {
        console.error('[Payment] confirmEscrowDelivery error:', error);
        return {
            success: false,
            error: error.message || 'Failed to confirm delivery. Please try again.',
        };
    }
}

/**
 * Confirm COD delivery and payment received (called by vendor)
 * - Confirms cash payment received
 * - Updates order status to delivered and paid
 * - Tracks vendor earnings
 */
export async function confirmCODDelivery(orderId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const result = await db.transaction(async (tx) => {
            // 1. Fetch order
            const order = await tx.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: {
                    listing: {
                        with: {
                            vendor: true,
                        },
                    },
                },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // 2. Validate vendor owns this listing
            if (order.listing.vendor.userId !== user.id) {
                throw new Error('Unauthorized: Only the vendor can confirm COD delivery');
            }

            // 3. Validate order is COD
            if (order.paymentMethod !== 'cod') {
                throw new Error('This order is not a COD order');
            }

            // 4. Validate order is shipped
            if (order.deliveryStatus !== 'shipped') {
                throw new Error('Order must be shipped before confirming delivery');
            }

            // 5. Credit vendor balance (for earnings tracking)
            const vendorUserId = order.listing.vendor.userId;
            const orderAmount = parseFloat(order.totalAmount);

            const vendorBalance = await tx.query.userBalances.findFirst({
                where: eq(userBalances.userId, vendorUserId),
            });

            if (vendorBalance) {
                await tx
                    .update(userBalances)
                    .set({
                        balance: sql`CAST(${userBalances.balance} AS NUMERIC) + ${orderAmount}`,
                        updatedAt: new Date(),
                    })
                    .where(eq(userBalances.userId, vendorUserId));
            } else {
                await tx.insert(userBalances).values({
                    userId: vendorUserId,
                    balance: orderAmount.toString(),
                    currency: 'USD',
                });
            }

            // 6. Update order status
            const [updatedOrder] = await tx
                .update(orders)
                .set({
                    paymentStatus: 'paid',
                    deliveryStatus: 'delivered',
                    deliveryConfirmedAt: new Date(),
                    deliveryConfirmedBy: user.id,
                    status: 'delivered',
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId))
                .returning();

            return { order: updatedOrder };
        });

        revalidatePath('/marketplace');
        revalidatePath('/profile');
        revalidatePath('/vendor/orders');

        return { success: true, data: result };
    } catch (error: any) {
        console.error('[Payment] confirmCODDelivery error:', error);
        return {
            success: false,
            error: error.message || 'Failed to confirm delivery. Please try again.',
        };
    }
}

/**
 * Dispute an escrow order (called by buyer)
 * - Sets escrow state to disputed
 * - Holds funds pending resolution
 * - Admin must resolve manually
 */
export async function disputeEscrowOrder(orderId: string, reason: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const result = await db.transaction(async (tx) => {
            // 1. Fetch order
            const order = await tx.query.orders.findFirst({
                where: eq(orders.id, orderId),
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // 2. Validate buyer owns this order
            if (order.buyerId !== user.id) {
                throw new Error('Unauthorized: Only the buyer can dispute the order');
            }

            // 3. Validate order is escrowed
            if (order.paymentStatus !== 'escrowed') {
                throw new Error('Can only dispute escrowed orders');
            }

            // 4. Update escrow state
            const escrow = await tx.query.escrowTransactions.findFirst({
                where: eq(escrowTransactions.orderId, orderId),
            });

            if (!escrow) {
                throw new Error('Escrow transaction not found');
            }

            await tx
                .update(escrowTransactions)
                .set({
                    state: 'disputed',
                    updatedAt: new Date(),
                })
                .where(eq(escrowTransactions.id, escrow.id));

            // 5. Update order
            const [updatedOrder] = await tx
                .update(orders)
                .set({
                    paymentFailureReason: `Disputed by buyer: ${reason}`,
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId))
                .returning();

            return { order: updatedOrder };
        });

        revalidatePath('/marketplace');
        revalidatePath('/profile');
        revalidatePath('/vendor/orders');

        return { success: true, data: result };
    } catch (error: any) {
        console.error('[Payment] disputeEscrowOrder error:', error);
        return {
            success: false,
            error: error.message || 'Failed to dispute order. Please try again.',
        };
    }
}

/**
 * Refund an escrow order (admin/system function)
 * - Returns funds to buyer
 * - Restores stock quantity
 * - Updates order and escrow status
 */
export async function refundEscrowOrder(orderId: string, reason: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const result = await db.transaction(async (tx) => {
            // 1. Fetch order
            const order = await tx.query.orders.findFirst({
                where: eq(orders.id, orderId),
                with: {
                    listing: {
                        with: {
                            vendor: true,
                        },
                    },
                },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // 2. Validate order is escrowed or disputed
            if (order.paymentStatus !== 'escrowed' && order.paymentStatus !== 'paid') {
                throw new Error('Can only refund escrowed or paid orders');
            }

            // 3. Find escrow transaction
            const escrow = await tx.query.escrowTransactions.findFirst({
                where: eq(escrowTransactions.orderId, orderId),
            });

            if (escrow) {
                // 4. If funds were released, deduct from vendor balance
                if (escrow.state === 'released') {
                    const vendorUserId = order.listing.vendor.userId;
                    const orderAmount = parseFloat(order.totalAmount);

                    await tx
                        .update(userBalances)
                        .set({
                            balance: sql`CAST(${userBalances.balance} AS NUMERIC) - ${orderAmount}`,
                            updatedAt: new Date(),
                        })
                        .where(eq(userBalances.userId, vendorUserId));
                }

                // 5. Update escrow state
                await tx
                    .update(escrowTransactions)
                    .set({
                        state: 'refunded',
                        refundedAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(escrowTransactions.id, escrow.id));
            }

            // 6. Restore stock quantity
            const orderQuantity = parseInt(order.quantity);
            await tx
                .update(listings)
                .set({
                    quantity: sql`${listings.quantity} + ${orderQuantity}`,
                })
                .where(eq(listings.id, order.listingId));

            // 7. Update order status
            const [updatedOrder] = await tx
                .update(orders)
                .set({
                    paymentStatus: 'refunded',
                    status: 'cancelled',
                    paymentFailureReason: reason,
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId))
                .returning();

            return { order: updatedOrder };
        });

        revalidatePath('/marketplace');
        revalidatePath('/vendor/orders');
        revalidatePath('/profile');

        return { success: true, data: result };
    } catch (error: any) {
        console.error('[Payment] refundEscrowOrder error:', error);
        return {
            success: false,
            error: error.message || 'Refund processing failed. Please try again.',
        };
    }
}

/**
 * Mark order as shipped (vendor action)
 */
export async function markOrderShipped(orderId: string) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                listing: {
                    with: {
                        vendor: true,
                    },
                },
            },
        });

        if (!order) {
            return { success: false, error: 'Order not found' };
        }

        if (order.listing.vendor.userId !== user.id) {
            return { success: false, error: 'Unauthorized: Only vendor can ship orders' };
        }

        const [updatedOrder] = await db
            .update(orders)
            .set({
                deliveryStatus: 'shipped',
                status: 'shipped',
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId))
            .returning();

        revalidatePath('/vendor/orders');
        revalidatePath('/profile');

        return { success: true, data: updatedOrder };
    } catch (error: any) {
        console.error('[Payment] markOrderShipped error:', error);
        return { success: false, error: 'Failed to mark as shipped' };
    }
}

/**
 * Get vendor earnings (total and pending in escrow)
 */
export async function getVendorEarnings() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Not authenticated' };
        }

        // Get vendor profile
        const vendor = await db.query.vendors.findFirst({
            where: eq(vendors.userId, user.id),
        });

        if (!vendor) {
            return { success: false, error: 'Not a vendor account' };
        }

        // Get total released earnings
        const balance = await db.query.userBalances.findFirst({
            where: eq(userBalances.userId, user.id),
        });

        // Get pending in escrow
        const pendingEscrow = await db.query.escrowTransactions.findMany({
            where: eq(escrowTransactions.vendorId, vendor.id),
        });

        const pendingAmount = pendingEscrow
            .filter((e) => e.state === 'held')
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);

        return {
            success: true,
            data: {
                availableBalance: balance?.balance || '0',
                pendingInEscrow: pendingAmount.toFixed(2),
                currency: balance?.currency || 'USD',
            },
        };
    } catch (error: any) {
        console.error('[Payment] getVendorEarnings error:', error);
        return { success: false, error: 'Failed to fetch earnings' };
    }
}
