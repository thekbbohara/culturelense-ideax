import 'dotenv/config';
import { db, culturalEntities, godDetails } from './index';
import { godSeedData } from './godseed';
import { eq } from 'drizzle-orm';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

async function seed() {
  console.log('🌱 Starting seed...');

  for (const god of godSeedData) {
    console.log(`Processing ${god.name}...`);
    
    const slug = generateSlug(god.name);

    // 1. Upsert Cultural Entity
    // Check if exists first to get ID, or use onConflict if constraint (slug is unique)
    // We'll try to find existing first to avoid overwriting if we want to be safe, or just onConflict update.
    // 'culturalEntities' has unique slug.

    let entityId: string;
    
    const existingEntity = await db.query.culturalEntities.findFirst({
        where: eq(culturalEntities.slug, slug)
    });

    if (existingEntity) {
        entityId = existingEntity.id;
        // Optional: Update details if needed
    } else {
        const result = await db.insert(culturalEntities).values({
            name: god.name,
            slug: slug,
            type: 'deity',
            description: god.intro,
            history: god.myth, // Mapping myth to history for now, or intro + journey
            imageUrl: '', // No image yet
        }).returning({ id: culturalEntities.id });
        entityId = result[0].id;
    }

    // 2. Upsert God Details
    // Check if details exist for this entity
    const existingDetails = await db.query.godDetails.findFirst({
        where: eq(godDetails.entityId, entityId)
    });

    if (existingDetails) {
        await db.update(godDetails).set({
            nickName: god.nickName,
            avatarNames: god.avatarNames,
            intro: god.intro,
            journey: god.journey,
            myth: god.myth,
            religion: god.religion,
            funFact: god.funFact
        }).where(eq(godDetails.id, existingDetails.id));
    } else {
        await db.insert(godDetails).values({
            entityId: entityId,
            name: god.name,
            nickName: god.nickName,
            avatarNames: god.avatarNames,
            intro: god.intro,
            journey: god.journey,
            myth: god.myth,
            religion: god.religion,
            funFact: god.funFact
        });
    }
  }

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
