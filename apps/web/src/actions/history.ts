"use server";

import { db } from "@/db";
import { searchHistory, users, culturalEntities } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

async function getUserId() {
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    return existingUsers[0].id;
  }

  // Create default user if none exists
  const [newUser] = await db.insert(users).values({
    email: 'user@example.com',
    role: 'user',
  }).returning();
  
  return newUser.id;
}

export async function saveSearchEntry(query: string) {
  try {
    const userId = await getUserId();
    await db.insert(searchHistory).values({
      userId,
      query,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to save search history:", error);
    return { success: false, error: "Failed to save history" };
  }
}

export async function getRecentSearchedEntities() {
  try {
    const userId = await getUserId();
    
    // Get distinct recent searches
    const history = await db.select({
      query: searchHistory.query,
      timestamp: searchHistory.timestamp
    })
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.timestamp))
    .limit(20);

    // Dedup queries, keeping latest
    const uniqueQueries = Array.from(new Set(history.map(h => h.query)));
    const topQueries = uniqueQueries.slice(0, 5);

    if (topQueries.length === 0) return { success: true, data: [] };

    // Fetch entities matching these queries
    const entities = await db.select().from(culturalEntities)
      .where(inArray(culturalEntities.name, topQueries));

    // Sort entities to match the order of topQueries (latest first)
    const sortedEntities = topQueries.map(q => entities.find(e => e.name === q)).filter(Boolean);

    return { success: true, data: sortedEntities };
  } catch (error) {
    console.error("Failed to fetch recent searched entities:", error);
    return { success: false, data: [] };
  }
}
