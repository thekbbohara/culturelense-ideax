'use server';

import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { deleteProductImage } from '@/lib/supabase/storage';

export async function getCategories() {
  try {
    const data = await db.query.categories.findMany({
      orderBy: [desc(categories.createdAt)],
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Failed to fetch categories' };
  }
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}) {
  try {
    const [newCategory] = await db.insert(categories).values(data).returning();
    revalidatePath('/admin/categories');
    return { success: true, data: newCategory };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: 'Failed to create category' };
  }
}

export async function getCategory(id: string) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
    if (!category) return { success: false, error: 'Category not found' };
    return { success: true, data: category };
  } catch (error) {
    console.error('Error fetching category:', error);
    return { success: false, error: 'Failed to fetch category' };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  },
) {
  try {
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!existingCategory) {
      return { success: false, error: 'Category not found' };
    }

    // If a new image is uploaded and it's different from the old one, delete the old one
    if (data.imageUrl && existingCategory.imageUrl && data.imageUrl !== existingCategory.imageUrl) {
      await deleteProductImage(existingCategory.imageUrl);
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    revalidatePath('/admin/categories');
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (category?.imageUrl) {
      await deleteProductImage(category.imageUrl);
    }

    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Failed to delete category' };
  }
}
