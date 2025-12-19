"use server";

import { db } from "@/db";
import { searchHistory, users } from "@/db/schema";

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
