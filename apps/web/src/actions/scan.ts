'use server';

import { createClient } from '@/lib/supabase/server';
import { getEntitiesSlugs, getEntityBySlug } from './entities';
import { db } from '@/db';
import { scanHistory } from '@/db/schema';
import { randomUUID } from 'crypto';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { saveSearchEntry } from './history';

type AIResult = {
  source: 'p' | 'g';
  isStatue: boolean;
  prediction: string;
  confidence: number;
  top_3: { god: string; confidence: number }[];
};

export async function scanImage(formData: FormData) {
  try {
    /* ---------------- AUTH ---------------- */
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'You must be logged in.' };

    const file = formData.get('image') as File;
    if (!file) throw new Error('No image provided');

    /* ---------------- STORAGE ---------------- */
    const filePath = `${user.id}/scan_${Date.now()}_${randomUUID()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('scans').upload(filePath, file);
    if (error) throw new Error('Image upload failed');

    const { data: { publicUrl } } = supabase.storage.from('scans').getPublicUrl(filePath);

    /* ---------------- PYTHON AI ---------------- */
    const pythonForm = new FormData();
    pythonForm.append('file', file);

    const pythonRes = await axios.post(
      `${process.env.NEXT_PUBLIC_SPATIAL_URL}/predict`,
      pythonForm
    );

    let pythonAI: AIResult | null = null;

    if (pythonRes.data?.prediction && pythonRes.data.prediction !== 'unknown') {
      pythonAI = {
        source: 'p',
        isStatue: true,
        prediction: pythonRes.data.prediction,
        confidence: pythonRes.data.confidence ?? 0.8,
        top_3: pythonRes.data.top_3 ?? [],
      };
    }

    /* ---------------- GEMINI ---------------- */
    if (!process.env.NEXT_PUBLIC_GEMINI_API) throw new Error('GEMINI_API missing');

    const { data: slugs } = await getEntitiesSlugs();
    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');

    const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API });

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          {
            text: `
              You are an expert in Nepali culture, heritage, and religious iconography.

              Analyze the provided image and follow the rules EXACTLY.

              STEP 1 — OBJECT TYPE CHECK
              - If the image shows a REAL living being (human, animal, bird, plant, cartoon, drawing, scenery):
                → isStatue = false
                → prediction = "unknown"

              - If the image shows a STATUE or SCULPTURE:
                → isStatue = true
                → continue to STEP 2

              STEP 2 — CULTURAL IDENTIFICATION (ONLY IF isStatue = true)
              - Identify the Nepali cultural entity (God / Goddess / Monument).
              - Use ONLY slugs from this list if they match exactly:
              [${slugs}]

              - If matched:
                → return that exact slug

              - If NOT in the list OR unsure:
                → prediction = "unknown"

              SLUG RULES:
              - lowercase
              - hyphen ('-') instead of spaces
              - no special characters

              RETURN STRICT JSON ONLY (NO TEXT, NO MARKDOWN):

              If NOT a statue:
              {
                "source": "g",
                "isStatue": false,
                "prediction": "unknown",
                "confidence": 0,
                "top_3": []
              }

              If statue AND identified:
              {
                "source": "g",
                "isStatue": true,
                "prediction": "ganesh",
                "confidence": 0.92,
                "top_3": [
                  { "god": "ganesh", "confidence": 0.6 },
                  { "god": "shiva", "confidence": 0.25 },
                  { "god": "unknown", "confidence": 0.15 }
                ]
              }

              If statue but NOT identifiable:
              {
                "source": "g",
                "isStatue": true,
                "prediction": "unknown",
                "confidence": 0,
                "top_3": []
              }
            `
          },
          {
            inlineData: {
              mimeType: file.type || 'image/jpeg',
              data: base64,
            },
          },
        ],
      }],
      config: { responseMimeType: 'application/json' },
    });

    const geminiText = response.text;

    if (!geminiText) throw new Error('Gemini empty response');

    const geminiAI: AIResult = JSON.parse(geminiText);

    /* ---------------- DECISION ENGINE ---------------- */
    let finalAI: AIResult | null = null;

    if (pythonAI && pythonAI.prediction === geminiAI.prediction) {
      finalAI = pythonAI;
    } else if (!pythonAI && geminiAI.prediction !== 'unknown') {
      finalAI = geminiAI;
    } else if (
      pythonAI &&
      geminiAI.prediction !== 'unknown' &&
      pythonAI.prediction !== geminiAI.prediction
    ) {
      const geminiEntity = await getEntityBySlug(geminiAI.prediction);
      if (geminiEntity.success) finalAI = geminiAI;
      else finalAI = pythonAI;
    }

    /* ---------------- FAIL SAFE ---------------- */
    if (!finalAI || finalAI.prediction === 'unknown') {
      await db.insert(scanHistory).values({
        userId: user.id,
        entityId: null,
        imageUrl: publicUrl,
      });

      return {
        success: false,
        error: 'Unknown Entity',
        data: { imageUrl: publicUrl },
      };
    }

    /* ---------------- DB LOOKUP ---------------- */
    const entity = await getEntityBySlug(finalAI.prediction);
    if (!entity.success) throw new Error('Entity missing in DB');

    /* ---------------- HISTORY ---------------- */
    await db.insert(scanHistory).values({
      userId: user.id,
      entityId: entity?.data?.id,
      imageUrl: publicUrl,
    });

    await saveSearchEntry(entity?.data?.name || '');

    console.log({
      success: true,
      data: {
        entity: entity.data,
        confidence: finalAI.confidence,
        top_3: finalAI.top_3,
        source: finalAI.source,
      },
    });

    /* ---------------- SUCCESS ---------------- */
    return {
      success: true,
      data: {
        entity: entity.data,
        confidence: finalAI.confidence,
        top_3: finalAI.top_3,
        source: finalAI.source,
      },
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, error: err.message };
  }
}