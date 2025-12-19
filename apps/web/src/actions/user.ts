"use server";

import { db, userPreferences, eq } from "@/db";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getUserPreferences(userId: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Optional: Allow admin to read others, but for now enforce self-read
        // or just ensure the user is logged in. 
        // Strict security: only allow reading own preferences.
        const targetUserId = user.id;

        const prefs = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, targetUserId),
        });
        return { success: true, data: prefs };
    } catch (error) {
        return { success: false, error: "Failed to fetch preferences" };
    }
}

export async function updateUserPreferences(userId: string, data: Partial<typeof userPreferences.$inferInsert>) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // SECURITY: Ignore the passed 'userId' and use the authenticated user's ID.
        // This prevents IDOR (Insecure Direct Object Reference).
        const targetUserId = user.id;

        const existing = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, targetUserId),
        });

        if (existing) {
            await db.update(userPreferences)
                .set(data)
                .where(eq(userPreferences.userId, targetUserId));
        } else {
            await db.insert(userPreferences).values({
                userId: targetUserId,
                ...data,
            });
        }
        
        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Failed to update preferences:", error);
        return { success: false, error: "Failed to update preferences" };
    }
}
