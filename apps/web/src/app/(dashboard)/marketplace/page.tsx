'use client';

import React, { useEffect, useState } from 'react';
import { getRecentListings } from '@/actions/marketplace';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { dummyProducts } from '@/data/dummy-products';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>(dummyProducts);

  useEffect(() => {
    getRecentListings().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setItems(res.data);
      }
    });
  }, []);

  const featuredItems = items.slice(0, 2);
  const regularItems = items.slice(2);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1">
              <Sparkles className="w-3 h-3 mr-2" />
              Curated Collection
            </Badge>
            <h1 className="text-5xl md:text-7xl font-serif font-black italic mb-6 tracking-tight">
              Discover <span className="text-secondary">Masterpieces</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              Explore our handpicked collection of authentic sculptures from renowned artists
              worldwide
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MarketplaceHeader />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Filter Sidebar - handles mobile/desktop internally */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-12">
            {/* Featured Section */}
            {featuredItems.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-serif font-black italic">Featured Today</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                      <ProductCard
                        id={item.id}
                        title={item.title}
                        artist={item.artist || 'Culture Lense Artist'}
                        price={item.price}
                        imageUrl={item.imageUrl}
                        isNew={item.isNew}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* All Products Grid */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-black italic">All Sculptures</h2>
                <p className="text-sm text-muted-foreground font-medium">
                  {regularItems.length} items
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ProductCard
                      id={item.id}
                      title={item.title}
                      artist={item.artist || 'Culture Lense Artist'}
                      price={item.price}
                      imageUrl={item.imageUrl}
                      isNew={item.isNew}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
