'use server';

import { db } from '@/lib/db';
import { listings, vendors, eq, desc } from '@culturelense/db';


export async function getRecentListings() {
   try {
     const items = await db.select().from(listings)
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
            imageUrl: data.imageUrl,
            entityId: data.entityId || null,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to create listing' };
    }
}
