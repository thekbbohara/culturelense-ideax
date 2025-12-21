import React from 'react';
import {
  getRecentListings,
  getCategories,
  getMaxPrice,
  getFeaturedListings,
} from '@/actions/marketplace';
import { MarketplaceClient } from '@/components/marketplace/MarketplaceClient';

export type Product = {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  quantity: number;
  artist?: string | null;
  isNew?: boolean;
};

export default async function MarketplacePage() {
  const [categoriesRes, maxPriceRes, recentListingsRes, featuredListingsRes] = await Promise.all([
    getCategories(),
    getMaxPrice(),
    getRecentListings({ page: 1, limit: 9 }),
    getFeaturedListings(),
  ]);

  const categories = categoriesRes.success && categoriesRes.data
    ? categoriesRes.data.map((c) => ({ id: c.id, name: c.name }))
    : [];

  const dynamicMaxPrice = maxPriceRes.success && maxPriceRes.data
    ? maxPriceRes.data
    : 10000;

  const initialItems: Product[] = recentListingsRes.success && recentListingsRes.data
    ? recentListingsRes.data.map((item: any) => ({
      ...item,
      price: parseFloat(item.price) || 0,
      isNew: new Date().getTime() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
    }))
    : [];

  const initialFeaturedItems: Product[] = featuredListingsRes.success && featuredListingsRes.data
    ? featuredListingsRes.data.map((item: any) => ({
      ...item,
      price: parseFloat(item.price) || 0,
      isNew: new Date().getTime() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
    }))
    : [];

  return (
    <MarketplaceClient
      initialItems={initialItems}
      initialFeaturedItems={initialFeaturedItems}
      initialCategories={categories}
      initialMaxPrice={dynamicMaxPrice}
      initialTotalItems={recentListingsRes.total || 0}
      initialTotalPages={recentListingsRes.totalPages || 1}
    />
  );
}
