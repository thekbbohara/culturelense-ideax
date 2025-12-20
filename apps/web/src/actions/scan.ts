// 'use server';

// import { createClient } from '@/lib/supabase/server';
// import { getEntitiesSlugs, getEntityBySlug } from './entities';
// import { db } from '@/db';
// import { scanHistory, searchHistory } from '@/db/schema';
// import { randomUUID } from 'crypto';
// import axios from "axios";
// import { GoogleGenAI } from "@google/genai";
// import { saveSearchEntry } from './history';

// export async function scanImage(formData: FormData) {
//   try {
//     const supabase = createClient();
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//       return { success: false, error: 'You must be logged in to scan.' };
//     }

//     const file = formData.get('image') as File;
//     if (!file) {
//       throw new Error('No image provided');
//     }

//     // 1. Upload Image to Supabase Storage
//     const timestamp = Date.now();
//     const fileExt = file.name.split('.').pop();
//     const filePath = `${user.id}/scan_${timestamp}_${randomUUID()}.${fileExt}`;

//     const { error: uploadError } = await supabase.storage
//       .from('scans')
//       .upload(filePath, file);

//     if (uploadError) {
//       console.error('Storage Upload Error:', uploadError);
//       throw new Error('Failed to upload scan image');
//     }

//     // Get Public URL
//     const { data: { publicUrl } } = supabase.storage
//       .from('scans')
//       .getPublicUrl(filePath);


//     // 2. Call Python AI Service
//     const aiFormData = new FormData();
//     aiFormData.append('file', file);

//     const aiResponse = await axios.post(`${process.env.NEXT_PUBLIC_SPATIAL_URL}/predict`, aiFormData);
//     if (!aiResponse.data) {
//       console.error('AI Service Error:', aiResponse.data);
//       throw new Error('Failed to analyze image');
//     }

//     let aiResult = aiResponse.data;

//     if (!aiResult.prediction) {
//       if (!process.env.GEMINI_API_KEY) {
//         throw new Error('GEMINI_API_KEY is not set');
//       }

//       const { data: slugs } = await getEntitiesSlugs();
//       const slugsList = slugs.join(', ');

//       const arrayBuffer = await file.arrayBuffer();
//       const base64Image = Buffer.from(arrayBuffer).toString('base64');

//       const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//       // Using gemini-1.5-flash as it's typically faster and cheaper for this task
//       const response = await genAI.models.generateContent({
//         model: "gemini-1.5-flash",
//         contents: [
//           {
//             role: "user",
//             parts: [
//               {
//                 text: `You are an expert in Nepali culture and heritage.
//                   Analyze this image and identify the cultural entity (God/Goddess/Monument) depicted.

//                   Your task is to return the **slug** corresponding to the identified entity.
//                   A "slug" is a URL-friendly version of the name (lowercase, hyphens instead of spaces).

//                   Known Slugs from Database:
//                   [${slugsList}]

//                   Instructions:
//                   1. Identify the entity in the image.
//                   2. If it matches a Known Slug, return that exact slug.
//                   3. If it is a Nepali cultural entity but NOT in the list, format its name as a slug (e.g. "Durga Mata" -> "durga_mata") and return it.
//                   4. If it is NOT a cultural entity or strictly unrecognizable, return "unknown".

//                   Output strictly valid JSON (no markdown):
//                   {
//                     "prediction": "slug-result",
//                     "confidence": 0.95,
//                     "top_3": [
//                       { "god": "candidate-slug-1", "confidence": 0.5 },
//                       { "god": "candidate-slug-2", "confidence": 0.3 }
//                     ]
//                   }`
//               },
//               {
//                 inlineData: {
//                   mimeType: file.type || "image/jpeg",
//                   data: base64Image
//                 }
//               }
//             ]
//           }
//         ],
//         config: {
//           responseMimeType: "application/json"
//         }
//       });

//       const text = (response as any).text
//         ? (response as any).text()
//         : (response as any).data?.candidates?.[0]?.content?.parts?.[0]?.text
//         || (response as any).candidates?.[0]?.content?.parts?.[0]?.text;

//       if (!text) {
//         throw new Error('Gemini returned no content: ' + JSON.stringify(response));
//       }

//       try {
//         const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
//         aiResult = JSON.parse(jsonStr);
//         console.log("Gemini Fallback Result:", aiResult);
//       } catch (e) {
//         console.error("Failed to parse Gemini response:", text);
//         throw new Error("Failed to parse fallback AI response");
//       }
//     }

//     const entity_slug = aiResult.prediction;
//     const confidence = aiResult.confidence;
//     const top_3 = aiResult.top_3;

//     // 3. Lookup Entity in DB
//     const entityResult = await getEntityBySlug(entity_slug);

//     let entityId = null;
//     let entityData = null;
//     let entityName = null;

//     if (entityResult.success && entityResult.data) {
//       entityId = entityResult.data.id;
//       entityData = entityResult.data;
//       entityName = entityResult.data.name;

//     }

//     // 4. Record in Scan History
//     await db.insert(scanHistory).values({
//       userId: user.id,
//       entityId: entityId, // Can be null if not found in DB
//       imageUrl: publicUrl,
//     });

//     await saveSearchEntry(entityName || entity_slug);

//     if (!entityData) {
//       return { success: false, error: 'Unknown Entity. Please provide a better image and try again.', data: { imageUrl: publicUrl } };
//     }

//     return {
//       success: true,
//       data: {
//         entity: entityData,
//         confidence,
//         top_3,
//         imageUrl: publicUrl
//       }
//     };

//   } catch (error: any) {
//     console.error('Scan Action Error:', error);
//     return { success: false, error: error.message || 'Failed to process scan' };
//   }
// }



// 'use server';

// import { createClient } from '@/lib/supabase/server';
// import { getEntitiesSlugs, getEntityBySlug } from './entities';
// import { db } from '@/db';
// import { scanHistory } from '@/db/schema';
// import { randomUUID } from 'crypto';
// import axios from 'axios';
// import { GoogleGenAI } from '@google/genai';
// import { saveSearchEntry } from './history';

// type AIResult = {
//   source: 'p' | 'g';
//   isStatue: boolean;
//   prediction: string;
//   confidence: number;
//   top_3: { god: string; confidence: number }[];
// };

// export async function scanImage(formData: FormData) {
//   try {
//     /* ---------------- AUTH ---------------- */
//     const supabase = createClient();
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return { success: false, error: 'You must be logged in.' };

//     const file = formData.get('image') as File;
//     if (!file) throw new Error('No image provided');

//     /* ---------------- STORAGE ---------------- */
//     const filePath = `${user.id}/scan_${Date.now()}_${randomUUID()}.${file.name.split('.').pop()}`;
//     const { error } = await supabase.storage.from('scans').upload(filePath, file);
//     if (error) throw new Error('Image upload failed');

//     const { data: { publicUrl } } = supabase.storage.from('scans').getPublicUrl(filePath);

//     /* ---------------- PYTHON AI ---------------- */
//     const pythonForm = new FormData();
//     pythonForm.append('file', file);

//     const pythonRes = await axios.post(
//       `${process.env.NEXT_PUBLIC_SPATIAL_URL}/predict`,
//       pythonForm
//     );

//     let pythonAI: AIResult | null = null;

//     if (pythonRes.data?.prediction && pythonRes.data.prediction !== 'unknown') {
//       pythonAI = {
//         source: 'p',
//         isStatue: true,
//         prediction: pythonRes.data.prediction,
//         confidence: pythonRes.data.confidence ?? 0.8,
//         top_3: pythonRes.data.top_3 ?? [],
//       };
//     }

//     /* ---------------- GEMINI ---------------- */
//     if (!process.env.NEXT_PUBLIC_GEMINI_API) throw new Error('GEMINI_API missing');

//     const { data: slugs } = await getEntitiesSlugs();
//     const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
//     console.log("slugs", slugs)

//     const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API });

//       // Debug: List available models to diagnose the 404
//     try {
//       const models = await genAI.models.list();
//       console.log('Available Gemini Models:', JSON.stringify(models));
//     } catch (e) {
//       console.warn('Failed to list Gemini models:', e);
//     }

//     const response = await genAI.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: [{
//         role: 'user',
//         parts: [
//           {
//             text: `
//               You are an expert in Nepali culture, heritage, and religious iconography.

//               Analyze the provided image and follow the rules EXACTLY.

//               STEP 1 — OBJECT TYPE CHECK
//               - If the image shows a REAL living being (human, animal, bird, plant, cartoon, drawing, scenery):
//                 → isStatue = false
//                 → prediction = "unknown"

//               - If the image shows a STATUE or SCULPTURE:
//                 → isStatue = true
//                 → continue to STEP 2

//               STEP 2 — CULTURAL IDENTIFICATION (ONLY IF isStatue = true)
//               - Identify the Nepali cultural entity (God / Goddess / Monument).
//               - Use ONLY slugs from this list if they match exactly:
//               [${slugs}]

//               - If matched:
//                 → return that exact slug

//               - If NOT in the list OR unsure:
//                 → prediction = "unknown"

//               SLUG RULES:
//               - lowercase
//               - hyphen ('-') instead of spaces
//               - no special characters

//               RETURN STRICT JSON ONLY (NO TEXT, NO MARKDOWN):

//               If NOT a statue:
//               {
//                 "source": "g",
//                 "isStatue": false,
//                 "prediction": "unknown",
//                 "confidence": 0,
//                 "top_3": []
//               }

//               If statue AND identified:
//               {
//                 "source": "g",
//                 "isStatue": true,
//                 "prediction": "ganesh",
//                 "confidence": 0.92,
//                 "top_3": [
//                   { "god": "ganesh", "confidence": 0.6 },
//                   { "god": "shiva", "confidence": 0.25 },
//                   { "god": "unknown", "confidence": 0.15 }
//                 ]
//               }

//               If statue but NOT identifiable:
//               {
//                 "source": "g",
//                 "isStatue": true,
//                 "prediction": "unknown",
//                 "confidence": 0,
//                 "top_3": []
//               }
//             `
//           },
//           {
//             inlineData: {
//               mimeType: file.type || 'image/jpeg',
//               data: base64,
//             },
//           },
//         ],
//       }],
//       config: { responseMimeType: 'application/json' },
//     });

//     const geminiText = response.text;

//     if (!geminiText) throw new Error('Gemini empty response');

//     const geminiAI: AIResult = JSON.parse(geminiText);

//     /* ---------------- DECISION ENGINE ---------------- */
//     let finalAI: AIResult | null = null;

//     if (pythonAI && pythonAI.prediction === geminiAI.prediction) {
//       finalAI = pythonAI;
//     } else if (!pythonAI && geminiAI.prediction !== 'unknown') {
//       finalAI = geminiAI;
//     } else if (
//       pythonAI &&
//       geminiAI.prediction !== 'unknown' &&
//       pythonAI.prediction !== geminiAI.prediction
//     ) {
//       const geminiEntity = await getEntityBySlug(geminiAI.prediction);
//       if (geminiEntity.success) finalAI = geminiAI;
//       else finalAI = pythonAI;
//     }

//     /* ---------------- FAIL SAFE ---------------- */
//     if (!finalAI || finalAI.prediction === 'unknown') {
//       await db.insert(scanHistory).values({
//         userId: user.id,
//         entityId: null,
//         imageUrl: publicUrl,
//       });

//       return {
//         success: false,
//         error: 'Unknown Entity',
//         data: { imageUrl: publicUrl },
//       };
//     }

//     /* ---------------- DB LOOKUP ---------------- */
//     const entity = await getEntityBySlug(finalAI.prediction);
//     if (!entity.success) throw new Error('Entity missing in DB');

//     /* ---------------- HISTORY ---------------- */
//     await db.insert(scanHistory).values({
//       userId: user.id,
//       entityId: entity?.data?.id,
//       imageUrl: publicUrl,
//     });

//     await saveSearchEntry(entity?.data?.name || '');

//     /* ---------------- SUCCESS ---------------- */
//     return {
//       success: true,
//       data: {
//         entity: entity.data,
//         confidence: finalAI.confidence,
//         top_3: finalAI.top_3,
//         imageUrl: publicUrl,
//         source: finalAI.source,
//       },
//     };
//   } catch (err: any) {
//     console.error(err);
//     return { success: false, error: err.message };
//   }
// }



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
  console.log('🚀 [SCAN] scanImage started');

  try {
    /* ---------------- AUTH ---------------- */
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    console.log('🔐 [AUTH] User:', user?.id ?? 'NOT LOGGED IN');

    if (!user) return { success: false, error: 'You must be logged in.' };

    const file = formData.get('image') as File;
    if (!file) throw new Error('No image provided');

    console.log('🖼️ [FILE] name:', file.name, 'type:', file.type, 'size:', file.size);

    /* ---------------- STORAGE ---------------- */
    const filePath = `${user.id}/scan_${Date.now()}_${randomUUID()}.${file.name.split('.').pop()}`;

    const { error } = await supabase.storage.from('scans').upload(filePath, file);
    if (error) {
      console.error('❌ [STORAGE] Upload failed:', error);
      throw new Error('Image upload failed');
    }

    const { data: { publicUrl } } = supabase.storage.from('scans').getPublicUrl(filePath);
    console.log('✅ [STORAGE] Uploaded:', publicUrl);

    /* ---------------- PYTHON AI ---------------- */
    console.log('🧠 [PYTHON AI] Sending image to Python service');

    const pythonForm = new FormData();
    pythonForm.append('file', file);

    const pythonRes = await axios.post(
      `${process.env.NEXT_PUBLIC_SPATIAL_URL}/predict`,
      pythonForm
    );

    console.log('🧠 [PYTHON AI] Raw response:', pythonRes.data);

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

    console.log('🧠 [PYTHON AI] Parsed:', pythonAI);

    /* ---------------- GEMINI ---------------- */
    if (!process.env.NEXT_PUBLIC_GEMINI_API) {
      console.error('❌ [GEMINI] API key missing');
      throw new Error('GEMINI_API missing');
    }

    console.log('🤖 [GEMINI] Initializing Gemini client');

    const { data: slugs } = await getEntitiesSlugs();
    console.log('📜 [DB] Slugs loaded:', slugs.length);

    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');
    console.log('🧾 [IMAGE] Base64 size:', base64.length);

    const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API });

    /* --------- MODEL CHECK --------- */
    try {
      const models = await genAI.models.list();
      console.log('🤖 [GEMINI] Available models:', models?.models?.map(m => m.name));
    } catch (e) {
      console.warn('⚠️ [GEMINI] Failed to list models:', e);
    }

    console.log('🤖 [GEMINI] Sending generateContent request');

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

    console.log('🤖 [GEMINI] Raw response object:', response);

    const geminiText = response.text;

    console.log('🤖 [GEMINI] Raw text:', geminiText);

    if (!geminiText) throw new Error('Gemini returned empty response');

    const geminiAI: AIResult = JSON.parse(geminiText);

    console.log('🤖 [GEMINI] Parsed JSON:', geminiAI);

    /* ---------------- DECISION ENGINE ---------------- */
    console.log('⚖️ [DECISION] Comparing Python vs Gemini');

    let finalAI: AIResult | null = null;

    if (pythonAI && pythonAI.prediction === geminiAI.prediction) {
      console.log('✅ [DECISION] Python & Gemini MATCH → Python wins');
      finalAI = pythonAI;
    } else if (!pythonAI && geminiAI.prediction !== 'unknown') {
      console.log('✅ [DECISION] Python unknown → Gemini used');
      finalAI = geminiAI;
    } else if (
      pythonAI &&
      geminiAI.prediction !== 'unknown' &&
      pythonAI.prediction !== geminiAI.prediction
    ) {
      console.log('⚠️ [DECISION] MISMATCH detected');

      const geminiEntity = await getEntityBySlug(geminiAI.prediction);

      if (geminiEntity.success) {
        console.log('✅ [DECISION] Gemini slug exists in DB → Gemini wins');
        finalAI = geminiAI;
      } else {
        console.log('⚠️ [DECISION] Gemini slug not in DB → Python wins');
        finalAI = pythonAI;
      }
    }

    /* ---------------- FAIL SAFE ---------------- */
    if (!finalAI || finalAI.prediction === 'unknown') {
      console.log('❌ [RESULT] Unknown entity');

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
    console.log('📦 [DB] Entity lookup:', entity);

    if (!entity.success) throw new Error('Entity missing in DB');

    /* ---------------- HISTORY ---------------- */
    await db.insert(scanHistory).values({
      userId: user.id,
      entityId: entity?.data?.id,
      imageUrl: publicUrl,
    });

    await saveSearchEntry(entity?.data?.name) || '';

    console.log('🎉 [SUCCESS] Scan completed');

    console.log(
      {
      success: true,
      data: {
      entity: entity.data,
      confidence: finalAI.confidence,
      top_3: finalAI.top_3,
      // imageUrl: publicUrl,
      source: finalAI.source,
    }})
    return {
      success: true,
      data: {
        entity: entity.data,
        confidence: finalAI.confidence,
        top_3: finalAI.top_3,
        // imageUrl: publicUrl,
        source: finalAI.source,
      },
    };

  } catch (err: any) {
    console.error('🔥 [SCAN ERROR]', err);
    return { success: false, error: err.message };
  }
}
