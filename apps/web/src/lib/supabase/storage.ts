import { createClient } from './client';

const BUCKET_NAME = 'images';

export async function uploadProductImage(
  file: File,
  vendorId: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).',
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { success: false, error: 'File size too large. Maximum size is 5MB.' };
    }

    const supabase = createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    // Path: listings/{vendorId}/{timestamp}.{ext}
    const fileName = `listings/${vendorId}/${timestamp}.${fileExt}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: 'Failed to upload image. Please try again.' };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'An unexpected error occurred during upload.' };
  }
}

export async function deleteProductImage(
  imageUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
    if (pathParts.length < 2) {
      return { success: false, error: 'Invalid image URL.' };
    }

    const filePath = pathParts[1];

    // Delete file from Supabase storage
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: 'Failed to delete image.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: 'An unexpected error occurred during deletion.' };
  }
}
