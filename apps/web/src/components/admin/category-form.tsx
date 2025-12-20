'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/vendor/image-upload';
import { uploadProductImage } from '@/lib/supabase/storage';
import { CategoryFormValues, categorySchema } from '@/lib/validations/category-schema';
import { createCategory, updateCategory } from '@/actions/categories';

interface CategoryFormProps {
  initialData?: CategoryFormValues & { id?: string; imageUrl?: string | null };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      imageUrl: initialData?.imageUrl || '',
    },
  });

  async function onSubmit(data: CategoryFormValues) {
    setIsSubmitting(true);
    try {
      let imageUrl = data.imageUrl;

      if (imageFile) {
        setIsUploading(true);
        const result = await uploadProductImage('categories', imageFile, data.slug);
        if (!result.success || !result.url) {
          throw new Error(result.error || 'Failed to upload image');
        }
        imageUrl = result.url;
      }

      if (initialData?.id) {
        const result = await updateCategory(initialData.id, {
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          imageUrl: imageUrl || undefined,
        });

        if (result.success) {
          toast.success('Category updated successfully');
          router.push('/admin/categories');
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update category');
        }
      } else {
        const result = await createCategory({
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          imageUrl: imageUrl || undefined,
        });

        if (result.success) {
          toast.success('Category created successfully');
          router.push('/admin/categories');
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to create category');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);

    // Always auto-generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    form.setValue('slug', slug);
  };

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      form.setValue('imageUrl', previewUrl);
    } else {
      form.setValue('imageUrl', '');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Statues"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleNameChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="e.g. statues" {...field} readOnly className="bg-muted" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Category description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onFileChange={handleFileChange}
                  disabled={isSubmitting || isUploading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting || isUploading}>
          {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Category' : 'Create Category'}
        </Button>
      </form>
    </Form>
  );
}
