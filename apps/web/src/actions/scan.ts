'use server';

import { createClient } from '@/lib/supabase/server';
import { getEntitiesSlugs, getEntityBySlug } from './entities';
import { db } from '@/db';
import { scanHistory } from '@/db/schema';
import { randomUUID } from 'crypto';
import axios from "axios";
import { GoogleGenAI } from "@google/genai";

export async function scanImage(formData: FormData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be logged in to scan.' };
    }

    const file = formData.get('image') as File;
    if (!file) {
      throw new Error('No image provided');
    }

    // 1. Upload Image to Supabase Storage
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/scan_${timestamp}_${randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('scans')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      throw new Error('Failed to upload scan image');
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('scans')
      .getPublicUrl(filePath);


    // 2. Call Python AI Service
    const aiFormData = new FormData();
    aiFormData.append('file', file);

    const aiResponse = await axios.post(`${process.env.NEXT_PUBLIC_SPATIAL_URL}/predictv2`, aiFormData);

    if (!aiResponse.data) {
      console.error('AI Service Error:', aiResponse.data);
      throw new Error('Failed to analyze image');
    }

    let aiResult = aiResponse.data;

    if (!aiResult.prediction) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
      }

      console.log('Primary AI failed, falling back to Gemini...');

      const { data: slugs } = await getEntitiesSlugs();
      const slugsList = slugs.join(', ');

      const arrayBuffer = await file.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');

      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // Using gemini-1.5-flash as it's typically faster and cheaper for this task
      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert in Nepali culture and heritage.
                  Analyze this image and identify the cultural entity (God/Goddess/Monument) depicted.

                  Your task is to return the **slug** corresponding to the identified entity.
                  A "slug" is a URL-friendly version of the name (lowercase, hyphens instead of spaces).

                  Known Slugs from Database:
                  [${slugsList}]

                  Instructions:
                  1. Identify the entity in the image.
                  2. If it matches a Known Slug, return that exact slug.
                  3. If it is a Nepali cultural entity but NOT in the list, format its name as a slug (e.g. "Durga Mata" -> "durga_mata") and return it.
                  4. If it is NOT a cultural entity or strictly unrecognizable, return "unknown".

                  Output strictly valid JSON (no markdown):
                  {
                    "prediction": "slug-result",
                    "confidence": 0.95,
                    "top_3": [
                      { "god": "candidate-slug-1", "confidence": 0.5 },
                      { "god": "candidate-slug-2", "confidence": 0.3 }
                    ]
                  }`
              },
              {
                inlineData: {
                  mimeType: file.type || "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = (response as any).text
        ? (response as any).text()
        : (response as any).data?.candidates?.[0]?.content?.parts?.[0]?.text
        || (response as any).candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini returned no content: ' + JSON.stringify(response));
      }

      try {
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
        aiResult = JSON.parse(jsonStr);
        console.log("Gemini Fallback Result:", aiResult);
      } catch (e) {
        console.error("Failed to parse Gemini response:", text);
        throw new Error("Failed to parse fallback AI response");
      }
    }

    const entity_slug = aiResult.prediction;
    const confidence = aiResult.confidence;
    const top_3 = aiResult.top_3;

    // 3. Lookup Entity in DB
    const entityResult = await getEntityBySlug(entity_slug);

    let entityId = null;
    let entityData = null;

    if (entityResult.success && entityResult.data) {
      entityId = entityResult.data.id;
      entityData = entityResult.data;
    }

    // 4. Record in Scan History
    await db.insert(scanHistory).values({
      userId: user.id,
      entityId: entityId, // Can be null if not found in DB
      imageUrl: publicUrl,
    });

    if (!entityData) {
      return { success: false, error: 'Entity recognized but not found in our database.', data: { imageUrl: publicUrl } };
    }

    return {
      success: true,
      data: {
        entity: entityData,
        confidence,
        top_3,
        imageUrl: publicUrl
      }
    };

  } catch (error: any) {
    console.error('Scan Action Error:', error);
    return { success: false, error: error.message || 'Failed to process scan' };
  }
}
