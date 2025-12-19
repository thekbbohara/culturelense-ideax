'use client';

import React, { useEffect, useState } from 'react';
import { getRecentListings } from '@/actions/marketplace';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { dummyProducts } from '@/data/dummy-products';

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>(dummyProducts);

  useEffect(() => {
    getRecentListings().then(res => {
        if (res.success && res.data.length > 0) setItems(res.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MarketplaceHeader />
        
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar />
          
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(item => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  artist={item.artist || "Culture Lense Artist"}
                  price={item.price}
                  imageUrl={item.imageUrl}
                  isNew={item.isNew !== undefined ? item.isNew : Math.random() > 0.8}
                />
              ))}
              {items.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🎨</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No sculptures found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        We couldn't find any listings at the moment. Check back later for new arrivals from our artists.
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
