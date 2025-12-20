'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '@/components/vendor/product-form';
import { getListingById, updateVendorListing, getVendorByUserId } from '@/actions/vendor-actions';
import { type ProductFormValues } from '@/lib/validations/product-schema';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [vendorId, setVendorId] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      // Fetch Vendor ID
      const vendorResult = await getVendorByUserId();
      if (vendorResult.success && vendorResult.data) {
        setVendorId(vendorResult.data.id);
      }

      // Fetch Product
      const result = await getListingById(params.id as string);
      if (result.success && result.data) {
        setProduct(result.data);
      } else {
        toast.error('Product not found');
        router.push('/vendor/products');
      }
      setLoading(false);
    }

    fetchData();
  }, [params.id, router]);

  const handleSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    const result = await updateVendorListing(params.id as string, values);

    if (result.success) {
      toast.success(result.message || 'Product updated successfully!');
      router.push('/vendor/products');
    } else {
      toast.error(result.error || 'Failed to update product');
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">Loading product...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black italic text-foreground">
            Edit Product
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Update your product listing details
          </p>
        </div>
        <Link href="/vendor/products" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 border-primary text-primary hover:bg-primary hover:text-white ease-linear duration-200 h-11 sm:h-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      {/* Form Card */}
      <Card className="border-border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Modify the information below to update your product listing
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ProductForm
            defaultValues={{ ...product, quantity: String(product.quantity) }}
            onSubmit={handleSubmit}
            submitLabel="Update Product"
            isLoading={isLoading}
            vendorId={vendorId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
