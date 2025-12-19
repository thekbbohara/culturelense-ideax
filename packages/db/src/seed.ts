import { db, client } from './index';
import { culturalEntities, entityRelationships, contentItems } from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Create Deities (10)
    const deitiesData = [
      { name: 'Shiva', slug: 'shiva', type: 'deity', description: 'The Destroyer' },
      { name: 'Vishnu', slug: 'vishnu', type: 'deity', description: 'The Preserver' },
      { name: 'Brahma', slug: 'brahma', type: 'deity', description: 'The Creator' },
      { name: 'Ganesha', slug: 'ganesha', type: 'deity', description: 'Remover of Obstacles' },
      { name: 'Durga', slug: 'durga', type: 'deity', description: 'Warrior Goddess' },
      { name: 'Lakshmi', slug: 'lakshmi', type: 'deity', description: 'Goddess of Wealth' },
      { name: 'Saraswati', slug: 'saraswati', type: 'deity', description: 'Goddess of Knowledge' },
      { name: 'Krishna', slug: 'krishna', type: 'deity', description: 'Avatar of Vishnu' },
      { name: 'Rama', slug: 'rama', type: 'deity', description: 'Avatar of Vishnu' },
      { name: 'Hanuman', slug: 'hanuman', type: 'deity', description: 'Devotee of Rama' },
    ];

    const insertedDeities = await db.insert(culturalEntities).values(deitiesData as any).returning();
    console.log(`Created ${insertedDeities.length} deities.`);

    // 2. Create Sculptures (20) - 2 per deity for simplicity
    const sculpturesData = [];
    for (const deity of insertedDeities) {
      sculpturesData.push({
        name: `Bronze ${deity.name}`,
        slug: `bronze-${deity.slug}`,
        type: 'sculpture',
        description: `Exquisite bronze statue of ${deity.name}.`,
      });
      sculpturesData.push({
        name: `Stone ${deity.name}`,
        slug: `stone-${deity.slug}`,
        type: 'sculpture',
        description: `Ancient stone carving of ${deity.name}.`,
      });
    }

    const insertedSculptures = await db.insert(culturalEntities).values(sculpturesData as any).returning();
    console.log(`Created ${insertedSculptures.length} sculptures.`);

    // 3. Create Relationships
    // Link statues to their respective deities
    const relationshipData = [];
    for (const sculpture of insertedSculptures) {
      const deityName = sculpture.name.split(' ')[1]; // Extract deity name
      const deity = insertedDeities.find((d) => d.name === deityName);
      if (deity) {
        relationshipData.push({
          fromEntityId: sculpture.id,
          toEntityId: deity.id,
          relationshipType: 'depicts',
        });
      }
    }

    if (relationshipData.length > 0) {
      await db.insert(entityRelationships).values(relationshipData).returning();
      console.log(`Created ${relationshipData.length} relationships.`);
    }

    // 4. Create Paid Content
    const contentData = [];
    
    // Add content for Shiva
    const shiva = insertedDeities.find(d => d.slug === 'shiva');
    if (shiva) {
      contentData.push({
        entityId: shiva.id,
        type: 'audio',
        title: 'Shiva Tandava Stotram',
        description: 'High-quality audio recitation of the powerful hymn.',
        price: '2.99',
        contentUrl: 'https://example.com/audio/shiva-tandava.mp3',
        isPremium: true
      });
      contentData.push({
        entityId: shiva.id,
        type: 'deep_mythology',
        title: 'The Symbolism of Nataraja',
        description: 'Deep dive PDF explaining the cosmic dance.',
        price: '4.99',
        contentUrl: 'https://example.com/pdf/nataraja.pdf',
        isPremium: true
      });
    }
    
    // Add content for Ganesha
    const ganesha = insertedDeities.find(d => d.slug === 'ganesha');
    if (ganesha) {
        contentData.push({
        entityId: ganesha.id,
        type: 'audio',
        title: 'Ganesha Atharvashirsha',
        description: 'Vedic chant for removing obstacles.',
        price: '1.99',
        contentUrl: 'https://example.com/audio/ganesha.mp3',
        isPremium: true
      });
    }

    if (contentData.length > 0) {
        // @ts-ignore - dynamic import fix
       await db.insert(contentItems).values(contentData as any).returning();
       console.log(`Created ${contentData.length} content items.`);
    }

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seed();
