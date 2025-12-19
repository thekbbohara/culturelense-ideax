"use server";

import { db } from "@/db";
import { culturalEntities, searchHistory } from "@/db/schema";
import { ilike, or, sql, asc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

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
        // Calculate relevance score:
        // 1: Starts effectively with query (high priority)
        // 2: Contains query in name
        // 3: Contains query in description
        relevance: sql<number>`
          CASE 
            WHEN ${culturalEntities.name} ILIKE ${query + '%'} THEN 1
            WHEN ${culturalEntities.name} ILIKE ${'%' + query + '%'} THEN 2
            ELSE 3
          END
        `.as('relevance')
      })
      .from(culturalEntities)
      .where(
        or(
          ilike(culturalEntities.name, `%${query}%`),
          ilike(culturalEntities.description, `%${query}%`)
        )
      )
      .orderBy(asc(sql`relevance`), asc(culturalEntities.name))
      .limit(5);

    return results;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

export async function addToSearchHistory(term: string) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await db.insert(searchHistory).values({
        userId: user.id,
        query: term,
      });
    }
  } catch (error) {
    console.error("Failed to save search history:", error);
    // Don't block the UI if history save fails
  }
}
