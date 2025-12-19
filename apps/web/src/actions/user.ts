"use server";

import { db, userPreferences, eq } from "@/db";
import { revalidatePath } from "next/cache";

export async function getUserPreferences(userId: string) {
    try {
        const prefs = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, userId),
        });
        return { success: true, data: prefs };
    } catch (error) {
        return { success: false, error: "Failed to fetch preferences" };
    }
}

export async function updateUserPreferences(userId: string, data: Partial<typeof userPreferences.$inferInsert>) {
    try {
        const existing = await db.query.userPreferences.findFirst({
            where: eq(userPreferences.userId, userId),
        });

        if (existing) {
            await db.update(userPreferences)
                .set(data)
                .where(eq(userPreferences.userId, userId));
        } else {
            await db.insert(userPreferences).values({
                userId,
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
