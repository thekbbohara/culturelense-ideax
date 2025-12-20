'use server';

import { db } from '../db';
import { culturalEntities, visitedLocations, searchHistory } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { createClient } from '../lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getExploreData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Fetch all temples
    const temples = await db.select({
        id: culturalEntities.id,
        name: culturalEntities.name,
        geoLocation: culturalEntities.geoLocation,
        description: culturalEntities.description,
        imageUrl: culturalEntities.imageUrl,
    })
        .from(culturalEntities)
        .where(eq(culturalEntities.type, 'temple'));

    // Fetch visited locations for current user
    const visited = await db.select()
        .from(visitedLocations)
        .where(eq(visitedLocations.userId, user.id));

    const visitedIds = new Set(visited.map(v => v.entityId));

    return temples.map(temple => {
        // Parse lat/long from geoLocation string "lat,long"
        let lat = 0;
        let lng = 0;
        if (temple.geoLocation) {
            const parts = temple.geoLocation.split(',').map(s => s.trim());
            if (parts.length === 2) {
                lat = parseFloat(parts[0]);
                lng = parseFloat(parts[1]);
            }
        }

        return {
            ...temple,
            lat,
            lng,
            isVisited: visitedIds.has(temple.id),
        };
    }).filter(t => t.lat !== 0 && t.lng !== 0); // Filter out invalid locations
}

export async function toggleVisited(entityId: string, locationData: { name: string, lat: string, lng: string }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const existing = await db.select()
        .from(visitedLocations)
        .where(and(
            eq(visitedLocations.userId, user.id),
            eq(visitedLocations.entityId, entityId)
        ));

    if (existing.length > 0) {
        // Remove
        await db.delete(visitedLocations)
            .where(eq(visitedLocations.id, existing[0].id));
    } else {
        // Add
        await db.insert(visitedLocations).values({
            userId: user.id,
            entityId: entityId,
            placeName: locationData.name,
            latitude: locationData.lat,
            longitude: locationData.lng,
        });

        // Also record in search history
        await db.insert(searchHistory).values({
            userId: user.id,
            query: locationData.name,
        });
    }

    revalidatePath('/explore');
    return { success: true };
}
