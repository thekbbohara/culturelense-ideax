import axios from 'axios';
import { db, culturalEntities } from '../db';
import { eq } from 'drizzle-orm';

// Define expected response structure from Overpass API
interface OverpassElement {
    type: string;
    id: number;
    lat: number;
    lon: number;
    tags?: {
        name?: string;
        "name:en"?: string;
        description?: string;
        religion?: string;
        denomination?: string;
    };
}

interface OverpassResponse {
    version: number;
    generator: string;
    elements: OverpassElement[];
}

export async function fetchTemplesFromOSM() {
    console.log('🌍 Fetching temples from OpenStreetMap (Overpass API)...');

    try {
        // Kathmandu Coordinates: 27.7172, 85.3240
        // Search radius: 5000 meters
        const query = `
      [out:json];
      (
        node["amenity"="place_of_worship"]["religion"~"hindu|buddhist"](around:5000, 27.7172, 85.3240);
      );
      out body;
    `;

        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        const response = await axios.get<OverpassResponse>(url);
        const places = response.data.elements;

        console.log(`📍 Found ${places.length} places from OSM.`);

        let count = 0;
        for (const place of places) {
            if (!place.tags || (!place.tags.name && !place.tags["name:en"])) {
                continue;
            }

            const name = place.tags["name:en"] || place.tags.name || "Unknown Temple";
            const slug = name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-');

            // Check if exists
            const existing = await db.query.culturalEntities.findFirst({
                where: eq(culturalEntities.slug, slug),
            });

            const validImageUrl = existing?.imageUrl || `https://dztlpbogmnjdxmhaaleg.supabase.co/storage/v1/object/public/images/temples/default.webp`;
            const geoLocation = `${place.lat}, ${place.lon}`;

            const description = place.tags.description
                ? place.tags.description
                : `A ${place.tags.religion || 'sacred'} place of worship in Kathmandu.`;

            if (existing) {
                // Optional: Update coordinates if they drifted or we want precise OSM ones
                // console.log(`🔄 Updating ${name}...`); 
                // Skipping update to preserve manual edits unless necessary
            } else {
                console.log(`✨ Inserting ${name}...`);
                await db.insert(culturalEntities).values({
                    name: name,
                    slug: slug,
                    type: 'temple',
                    description: description,
                    history: 'Fetched from OpenStreetMap',
                    geoLocation: geoLocation,
                    imageUrl: validImageUrl,
                });
                count++;
            }
        }
        console.log(`✅ Successfully added ${count} new temples.`);

    } catch (error) {
        console.error('❌ Error fetching from OSM:', error);
    }
}
