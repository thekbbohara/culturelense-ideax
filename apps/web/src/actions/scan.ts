'use server';

import { getEntityBySlug } from './entities';

export async function scanImage(formData: FormData) {
  try {
    const file = formData.get('image') as File;
    if (!file) {
      throw new Error('No image provided');
    }

    // Call Python AI Service
    const aiFormData = new FormData();
    aiFormData.append('file', file);

    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_SPATIAL_URL}/predict`, {
      method: 'POST',
      body: aiFormData as any, // Node fetch supports FormData
      cache: 'no-store'
    });

    console.log(aiResponse)

    if (!aiResponse.ok) {
      console.error('AI Service Error:', await aiResponse.text());
      throw new Error('Failed to analyze image');
    }

    const aiResult = await aiResponse.json();
    
    if (!aiResult.success) {
      throw new Error(aiResult.error || 'Unknown AI error');
    }

    const { entity_slug, confidence } = aiResult.data;

    // Lookup Entity in DB
    const entity = await getEntityBySlug(entity_slug);

    if (!entity.success || !entity.data) {
       // Ideally we might want to return the slug anyway if not found in our DB, 
       // but for MVP let's treat it as "Not Found"
       return { success: false, error: 'Entity recognized but not found in database.' };
    }

    return {
      success: true,
      data: {
        entity: entity.data,
        confidence,
        scanId: 'mock-scan-id' // We haven't built scan_logs yet
      }
    };

  } catch (error) {
    console.error('Scan Action Error:', error);
    return { success: false, error: 'Failed to process scan' };
  }
}
