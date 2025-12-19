'use server';

import { db } from '@/lib/db';
import { listings, vendors, eq, desc, and } from '@/db';

export async function getRecentListings() {
  try {
    const items = await db
      .select()
      .from(listings)
      .where(eq(listings.status, 'active'))
      .orderBy(desc(listings.createdAt))
      .limit(20);
    return { success: true, data: items };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function createListing(vendorId: string, data: any) {
  try {
    await db.insert(listings).values({
      vendorId,
      title: data.title,
      description: data.description,
      price: data.price,
      quantity: data.quantity,
      imageUrl: data.imageUrl,
      entityId: data.entityId || null,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to create listing' };
  }
}

export async function getListingById(id: string) {
  try {
    const item = await db.select().from(listings).where(eq(listings.id, id)).limit(1);

    if (item && item.length > 0) {
      return { success: true, data: item[0] };
    }
    return { success: false, error: 'Listing not found' };
  } catch (error) {
    return { success: false, error: 'Failed to fetch listing' };
  }
}

export async function getListingsByEntityId(entityId: string) {
  try {
    const items = await db
      .select()
      .from(listings)
      .where(and(eq(listings.entityId, entityId), eq(listings.status, 'active')))
      .orderBy(desc(listings.createdAt));
    return { success: true, data: items };
  } catch (error) {
    console.error('Failed to fetch listings by entity:', error);
    return { success: false, data: [] };
  }
}
