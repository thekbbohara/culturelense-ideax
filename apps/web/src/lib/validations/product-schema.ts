import { z } from 'zod';

export const productFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Price must be a positive number'),
  imageUrl: z.string().url('Product image is required'),
  status: z.enum(['draft', 'active', 'sold', 'archived']),
  entityId: z.string().min(1, 'Entity is required'),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
