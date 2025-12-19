'use server';

import { createClient } from '@/lib/supabase/server';
import { db, users, vendors, purchases, contentItems, count, eq, desc, sum } from '@/db';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';

// Helper to ensure admin access
// Helper to ensure admin access
async function ensureAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Verify role directly from DB (Server-side, using Drizzle)
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { role: true },
  });

  if (dbUser?.role !== 'admin') {
    redirect('/home');
  }

  return user;
}

export async function getAdminStats() {
  await ensureAdmin();

  try {
    const [userCount] = await db.select({ value: count() }).from(users);
    const [vendorCount] = await db.select({ value: count() }).from(vendors);
    const [pendingVendorCount] = await db
      .select({ value: count() })
      .from(vendors)
      .where(eq(vendors.verificationStatus, 'pending'));

    // MVP: Just summing up price text assuming it's parsable, or count purchases
    // In real app, price should be numeric.
    const [purchaseCount] = await db
      .select({ value: count() })
      .from(purchases)
      .where(eq(purchases.status, 'completed'));

    return {
      totalUsers: userCount?.value || 0,
      totalVendors: vendorCount?.value || 0,
      pendingVendors: pendingVendorCount?.value || 0,
      totalSales: purchaseCount?.value || 0, // Using count as proxy for revenue for now due to text price
    };
  } catch (error) {
    console.error('Admin Stats Error:', error);
    return { totalUsers: 0, totalVendors: 0, pendingVendors: 0, totalSales: 0 };
  }
}

export async function getPendingVendors() {
  await ensureAdmin();

  try {
    const pending = await db
      .select({
        id: vendors.id,
        businessName: vendors.businessName,
        description: vendors.description,
        appliedAt: vendors.createdAt,
        userId: vendors.userId,
        userEmail: users.email,
      })
      .from(vendors)
      .leftJoin(users, eq(vendors.userId, users.id))
      .where(eq(vendors.verificationStatus, 'pending'))
      .orderBy(desc(vendors.createdAt));

    return pending;
  } catch (error) {
    console.error('Fetch Pending Vendors Error:', error);
    return [];
  }
}

export async function updateVendorStatus(vendorId: string, status: 'verified' | 'rejected') {
  await ensureAdmin();

  try {
    await db.update(vendors).set({ verificationStatus: status }).where(eq(vendors.id, vendorId));

    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.id, vendorId),
    });

    if (vendor && status === 'verified') {
      await db.update(users).set({ role: 'vendor' }).where(eq(users.id, vendor.userId));
    }

    revalidatePath('/admin');
    return { success: true, message: `Vendor ${status} successfully.` };
  } catch (error) {
    console.error('Update Vendor Status Error:', error);
    return { error: 'Failed to update vendor status.' };
  }
}

export async function getAllTransactions() {
  await ensureAdmin();

  try {
    const transactions = await db
      .select({
        id: purchases.id,
        userEmail: users.email,
        itemTitle: contentItems.title,
        price: contentItems.price,
        status: purchases.status,
        date: purchases.createdAt,
      })
      .from(purchases)
      .leftJoin(users, eq(purchases.userId, users.id))
      .leftJoin(contentItems, eq(purchases.contentItemId, contentItems.id))
      .orderBy(desc(purchases.createdAt))
      .limit(20);

    return transactions;
  } catch (error) {
    console.error('Fetch Transactions Error:', error);
    return [];
  }
}
