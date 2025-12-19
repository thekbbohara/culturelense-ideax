'use server';

import { db } from '@/lib/db';
import { contentItems, purchases, eq, and } from '@culturelense/db';


export async function getContentForEntity(entityId: string) {
  try {
    const items = await db.select().from(contentItems).where(eq(contentItems.entityId, entityId));
    return { success: true, data: items };
  } catch (error) {
    console.error('Fetch Content Error:', error);
    return { success: false, data: [] };
  }
}

// Check if a specific user has purchased a specific item
export async function checkAccess(userId: string, contentId: string) {
  try {
    const purchase = await db.query.purchases.findFirst({
        where: and(
            eq(purchases.userId, userId),
            eq(purchases.contentItemId, contentId),
            eq(purchases.status, 'completed')
        )
    });
    return { success: true, hasAccess: !!purchase };
  } catch (error) {
     return { success: false, hasAccess: false };
  }
}

// Mock Purchase Flow
export async function purchaseContent(userId: string, contentId: string) {
    try {
        // 1. In real world, create Stripe Intent here
        // 2. For MVP, we assume "One-Click Buy" succeeds immediately
        
        await db.insert(purchases).values({
            userId,
            contentItemId: contentId,
            status: 'completed',
            transactionId: `mock_tx_${Date.now()}`
        });

        return { success: true };
    } catch (error) {
        console.error('Purchase Error:', error);
        return { success: false, error: 'Purchase failed' };
    }
}
