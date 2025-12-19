"use server";

import { db } from "@/db";
import { scanHistory, searchHistory } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { count, eq } from "drizzle-orm";

export async function checkUserHistory() {
  const supabase = createClient();
  let user = null;
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.error("Auth error in checkUserHistory:", error);
    return { hasHistory: false };
  }

  if (!user) {
    return { hasHistory: false };
  }

  try {
    const [scanCount] = await db
      .select({ count: count() })
      .from(scanHistory)
      .where(eq(scanHistory.userId, user.id));

    const [searchCount] = await db
      .select({ count: count() })
      .from(searchHistory)
      .where(eq(searchHistory.userId, user.id));

    const hasHistory = (scanCount?.count ?? 0) > 0 || (searchCount?.count ?? 0) > 0;
    return { hasHistory };
  } catch (error) {
    console.error("Error checking user history:", error);
    return { hasHistory: false };
  }
}
