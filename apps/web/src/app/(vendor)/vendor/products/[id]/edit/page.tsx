'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '@/components/vendor/product-form';
import { getListingById, updateVendorListing, deleteVendorListing } from '@/actions/vendor-actions';
import { type ProductFormValues } from '@/lib/validations/product-schema';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const result = await getListingById(params.id as string);
      if (result.success && result.data) {
        setProduct(result.data);
      } else {
        toast.error('Product not found');
        router.push('/vendor/products');
      }
      setLoading(false);
    }

    fetchProduct();
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

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteVendorListing(params.id as string);

    if (result.success) {
      toast.success(result.message || 'Product archived successfully');
      router.push('/vendor/products');
    } else {
      toast.error(result.error || 'Failed to archive product');
    }
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">Loading product...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link href="/vendor/products">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </Link>
        <Button variant="destructive" className="gap-2" onClick={() => setDeleteDialogOpen(true)}>
          <Trash2 className="w-4 h-4" />
          Archive Product
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-black italic text-foreground">Edit Product</h1>
        <p className="text-muted-foreground mt-2">Update your product listing details</p>
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
            defaultValues={product}
            onSubmit={handleSubmit}
            submitLabel="Update Product"
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this product? It will be hidden from the marketplace
              but you can restore it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Archiving...' : 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
