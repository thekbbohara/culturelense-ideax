"use server";

import { db } from "@/db";
import { culturalEntities } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export type SearchResult = {
  id: string;
  name: string;
  slug: string;
  type: string;
  imageUrl: string | null;
};

export async function searchEntities(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  try {
    const results = await db
      .select({
        id: culturalEntities.id,
        name: culturalEntities.name,
        slug: culturalEntities.slug,
        type: culturalEntities.type,
        imageUrl: culturalEntities.imageUrl,
      })
      .from(culturalEntities)
      .where(
        or(
          ilike(culturalEntities.name, `%${query}%`),
          ilike(culturalEntities.description, `%${query}%`)
        )
      )
      .limit(5);

    return results;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
