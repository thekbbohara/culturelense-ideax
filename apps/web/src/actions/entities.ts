'use server';

import { db } from '@/lib/db';
import { culturalEntities, godDetails } from '@/db';
import { eq, inArray, sql } from 'drizzle-orm';


export interface Entity {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  imageUrl: string | null;
  history?: string | null;
  // Extended details
  nickName?: string | null;
  avatarNames?: string | null;
  intro?: string | null;
  journey?: string | null;
  myth?: string | null;
  religion?: string | null;
  location?: string | null;
  funFact?: string | null;
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
    // case-insensitive match on slug, join with godDetails
    const result = await db
      .select()
      .from(culturalEntities)
      .leftJoin(godDetails, eq(culturalEntities.id, godDetails.entityId))
      .where(sql`lower(${culturalEntities.slug}) = lower(${slug})`);

    if (!result.length) return { success: true, data: null };

    const row = result[0];
    const combined: Entity = {
      ...row.cultural_entities,
      ...row.god_details, // This will override fields if names match, but ids match (ok), metadata might differ.
      // Explicit mapping to ensure safety and type correctness
      id: row.cultural_entities.id,
      name: row.cultural_entities.name, // base name
      slug: row.cultural_entities.slug,
      type: row.cultural_entities.type,
      description: row.cultural_entities.description,
      imageUrl: row.cultural_entities.imageUrl,
      history: row.cultural_entities.history,

      // God details mappings
      nickName: row.god_details?.nickName,
      avatarNames: row.god_details?.avatarNames,
      intro: row.god_details?.intro,
      journey: row.god_details?.journey,
      myth: row.god_details?.myth,
      religion: row.god_details?.religion,
      location: row.god_details?.location || row.cultural_entities.geoLocation, // Fallback or merge
      funFact: row.god_details?.funFact,
    };

    return { success: true, data: combined };
  } catch (error) {
    console.error('Failed to fetch entity:', error);
    return { success: false, data: null };
  }
}

export async function getEntitiesBySlugs(slugs: string[]): Promise<{ success: boolean; data: Entity[] }> {
  try {
    if (!slugs.length) return { success: true, data: [] };

    // Create lowercase slugs for comparison
    const lowerSlugs = slugs.map(s => s.toLowerCase());

    // In a real scenario, we might want to do lower(col) IN (...), but simpler is to assume stored slugs are standard.
    // However, for robustness as requested:
    const result = await db
      .select()
      .from(culturalEntities)
      .where(sql`lower(${culturalEntities.slug}) IN ${lowerSlugs}`);

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to fetch entities by slugs:', error);
    return { success: false, data: [] };
  }
}

export async function getEntitiesSlugs(): Promise<{ success: boolean; data: string[] }> {
  try {
    const result = await db
      .select({ slug: culturalEntities.slug })
      .from(culturalEntities);

    return { success: true, data: result.map(row => row.slug) };
  } catch (error) {
    console.error('Failed to fetch entity slugs:', error);
    return { success: false, data: [] };
  }
}

export async function getContentItems(entityId: string) {
  try {
    const items = await db.query.contentItems.findMany({
      where: (contentItems, { eq }) => eq(contentItems.entityId, entityId),
    });
    return items;
  } catch (error) {
    console.error("Failed to fetch content items:", error);
    return [];
  }
}

export async function getRelatedEntities(entityId: string) {
  try {
    // Basic implementation: fetch entities of the same type, excluding current one
    // In future, querying entityRelationships table would be better
    const current = await db.query.culturalEntities.findFirst({
      where: (culturalEntities, { eq }) => eq(culturalEntities.id, entityId),
      columns: { type: true }
    });

    if (!current) return [];

    const related = await db.query.culturalEntities.findMany({
      where: (culturalEntities, { and, eq, ne }) => and(
        eq(culturalEntities.type, current.type),
        ne(culturalEntities.id, entityId)
      ),
      limit: 3,
    });
    
    return related;
  } catch (error) {
    console.error("Failed to fetch related entities:", error);
    return [];
  }
}
