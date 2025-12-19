'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/vendor/product-form';
import { createVendorListing } from '@/actions/vendor-actions';
import { type ProductFormValues } from '@/lib/validations/product-schema';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AddProductPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/vendor/products">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-black italic text-foreground">Add New Product</h1>
        <p className="text-muted-foreground mt-2">
          Create a new product listing for your marketplace
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Fill in the information below to create your product listing
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ProductForm onSubmit={handleSubmit} submitLabel="Create Product" isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
