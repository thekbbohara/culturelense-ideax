'use server';

import { db } from '@/lib/db';
import { culturalEntities, eq } from '@/db';


export interface Entity {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  imageUrl: string | null;
  history?: string | null;
}


export async function getEntities(): Promise<{ success: boolean; data: Entity[] }> {
  try {
    const result = await db.select().from(culturalEntities);
    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to fetch entities:', error);
    return { success: false, data: [] };
  }
}

export async function getEntityBySlug(slug: string): Promise<{ success: boolean; data: Entity | null }> {
  try {
    const result = await db.select().from(culturalEntities).where(eq(culturalEntities.slug, slug));
    return { success: true, data: result[0] || null };
  } catch (error) {
    console.error('Failed to fetch entity:', error);
    return { success: false, data: null };
  }
}
