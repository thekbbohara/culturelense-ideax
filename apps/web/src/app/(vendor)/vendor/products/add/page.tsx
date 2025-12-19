'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/vendor/product-form';
import { createVendorListing, getVendorByUserId } from '@/actions/vendor-actions';
import { type ProductFormValues } from '@/lib/validations/product-schema';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AddProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [vendorId, setVendorId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    async function fetchVendor() {
      // Import dynamically nicely or just rely on existing import if possible,
      // but imports need to be top-level.
      // Assuming getVendorByUserId is imported.
      const result = await getVendorByUserId();
      if (result.success && result.data) {
        setVendorId(result.data.id);
      }
    }
    fetchVendor();
  }, []);

  const handleSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    const result = await createVendorListing(values);

    if (result.success) {
      toast.success(result.message || 'Product created successfully!');
      router.push('/vendor/products');
    } else {
      toast.error(result.error || 'Failed to create product');
    }
    setIsLoading(false);
  };

  // ...

  // Pass vendorId to ProductForm
  return (
    <div className="mx-auto space-y-6">
      {/* ... header ... */}

      {/* Form Card */}
      <Card className="border-border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fill in the information below to create your product listing
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ProductForm
            onSubmit={handleSubmit}
            submitLabel="Create Product"
            isLoading={isLoading}
            vendorId={vendorId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
