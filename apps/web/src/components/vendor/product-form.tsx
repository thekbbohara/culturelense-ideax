'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { productFormSchema, type ProductFormValues } from '@/lib/validations/product-schema';
import { uploadProductImage } from '@/lib/supabase/storage';
import { getEntities } from '@/actions/entities';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ImageUpload } from './image-upload';

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Create Product',
  isLoading = false,
}: ProductFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      price: '',
      imageUrl: '',
      entityId: '',
      status: 'active',
    },
  });

  const handleFileChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      form.setValue('imageUrl', previewUrl);
    } else {
      form.setValue('imageUrl', '');
    }
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    try {
      if (imageFile) {
        setIsUploading(true);
        // Using 'uploads' as default folder, ideally pass vendorId if available
        const result = await uploadProductImage(imageFile, 'uploads');

        if (!result.success || !result.url) {
          throw new Error(result.error || 'Failed to upload image');
        }

        values.imageUrl = result.url;
      }

      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      // If passing error to parent is needed, or just toast here
    } finally {
      setIsUploading(false);
    }
  };

  const [entities, setEntities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchEntities() {
      const result = await getEntities();
      if (result.success && result.data) {
        setEntities(result.data);
      }
    }
    fetchEntities();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter product title"
                  {...field}
                  className="focus-visible:ring-primary"
                />
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
                <Textarea
                  placeholder="Describe your product in detail"
                  className="min-h-[120px] focus-visible:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="99.99"
                    {...field}
                    className="focus-visible:ring-primary"
                  />
                </FormControl>
                <FormDescription>Enter price in dollars</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="focus:ring-primary">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="entityId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deity/Entity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger className="focus:ring-primary">
                    <SelectValue placeholder="Select a deity or entity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[400px] overflow-y-auto">
                  <SelectItem value="none">None</SelectItem>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Associate this product with a specific cultural entity
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onFileChange={handleFileChange}
                  disabled={isLoading || isUploading}
                />
              </FormControl>
              <FormDescription>Upload a product image (max 5MB, JPEG/PNG/WebP/GIF)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {(isLoading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
