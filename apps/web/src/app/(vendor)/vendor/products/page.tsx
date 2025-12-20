'use client';

import { useEffect, useState } from 'react';
import { getVendorByUserId, getVendorListings } from '@/actions/vendor-actions';
import { ProductsTable } from '@/components/vendor/products-table';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const vendorResult = await getVendorByUserId();
    if (vendorResult.success && vendorResult.data) {
      const listingsResult = await getVendorListings(vendorResult.data.id);
      setProducts(listingsResult.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black italic text-foreground">
            My Products
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage your product listings and inventory
          </p>
        </div>
        <Link href="/vendor/products/add" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="w-5 h-5 animate-pulse" />
            <span>Loading products...</span>
          </div>
        </div>
      ) : (
        <ProductsTable products={products} onDelete={fetchProducts} />
      )}
    </div>
  );
}
