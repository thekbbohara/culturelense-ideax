"use server";

import { db } from "@/db";
import { culturalEntities, godDetails } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getGodBySlug(slug: string) {
  try {
    const result = await db
      .select({
        id: culturalEntities.id,
        name: culturalEntities.name,
        type: culturalEntities.type,
        description: culturalEntities.description,
        imageUrl: culturalEntities.imageUrl,
        intro: godDetails.intro,
        journey: godDetails.journey,
        myth: godDetails.myth,
        religion: godDetails.religion,
        location: godDetails.location,
        funFact: godDetails.funFact,
      })
      .from(culturalEntities)
      .leftJoin(godDetails, eq(culturalEntities.id, godDetails.entityId))
      .where(eq(culturalEntities.slug, slug))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching god details:", error);
    return null;
  }
}
