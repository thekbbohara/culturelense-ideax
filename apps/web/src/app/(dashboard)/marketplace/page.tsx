'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getRecentListings,
  getCategories,
  getMaxPrice,
  getFeaturedListings,
  recordSearch,
  ListingFilters,
} from '@/actions/marketplace';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, PackageSearch, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

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

export default function MarketplacePage() {
  const [items, setItems] = useState<Product[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [dynamicMaxPrice, setDynamicMaxPrice] = useState<number>(10000);
  const [selectedSort, setSelectedSort] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(
    async (filters: ListingFilters = {}) => {
      setIsLoading(true);
      const res = await getRecentListings({
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy: selectedSort,
        search: searchQuery || undefined,
        page: currentPage,
        limit: 9,
        ...filters,
      });

      if (res.success && res.data) {
        const mappedData: Product[] = res.data.map((item: any) => ({
          ...item,
          price: parseFloat(item.price) || 0,
          isNew:
            new Date().getTime() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
        }));
        setItems(mappedData);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.total || 0);
      }
      setIsLoading(false);
    },
    [currentPage, selectedCategory, selectedSort, priceRange, searchQuery],
  );

  const handleSearchSubmit = async () => {
    setCurrentPage(1);
    fetchItems({ search: searchQuery, page: 1 });
    fetchFeaturedItemsData({ search: searchQuery });

    // Record search history for logged in user
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await recordSearch(user.id, searchQuery);
    }
  };

  const fetchFeaturedItemsData = useCallback(
    async (filters: ListingFilters = {}) => {
      const res = await getFeaturedListings({
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        search: searchQuery || undefined,
        ...filters,
      });

      if (res.success && res.data) {
        setFeaturedItems(
          res.data.map((item: any) => ({
            ...item,
            price: parseFloat(item.price) || 0,
            isNew:
              new Date().getTime() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
          })),
        );
      }
    },
    [selectedCategory, priceRange, searchQuery],
  );

  useEffect(() => {
    // Initial fetch for metadata
    getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data.map((c) => ({ id: c.id, name: c.name })));
      }
    });

    getMaxPrice().then((res) => {
      if (res.success && res.data) {
        setDynamicMaxPrice(res.data);
        setPriceRange([0, res.data]);
      }
    });
  }, []);

  useEffect(() => {
    fetchItems();
    if (currentPage === 1) {
      fetchFeaturedItemsData();
    }
  }, [currentPage, fetchItems, fetchFeaturedItemsData]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchItems({ page: 1 });
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, dynamicMaxPrice]);
    setSearchQuery('');
    setCurrentPage(1);
    // fetchItems will be triggered by handleApplyFilters or useEffect if we change these,
    // but for clear we manually reset and fetch.
    fetchItems({
      categoryId: undefined,
      minPrice: 0,
      maxPrice: dynamicMaxPrice,
      search: undefined,
      page: 1,
    });
    fetchFeaturedItemsData({
      categoryId: undefined,
      minPrice: 0,
      maxPrice: dynamicMaxPrice,
      search: undefined,
    });
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    setCurrentPage(1);
    fetchItems({ sortBy: sort, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <MarketplaceHeader
          selectedSort={selectedSort}
          onSortChange={handleSortChange}
          search={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Filter Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                maxPrice={dynamicMaxPrice}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-16">
            {/* Featured Section - Always visible on first page if items exist */}
            {featuredItems.length > 0 && currentPage === 1 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-serif font-black italic">Featured Masterpieces</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredItems?.slice(0, 2)?.map((item: Product) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="relative group max-h-[600px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
                      <ProductCard
                        id={item.id}
                        title={item.title}
                        artist={item.artist || 'Culture Lense Artist'}
                        price={item.price}
                        imageUrl={item.imageUrl}
                        quantity={item.quantity}
                        isNew={item.isNew}
                        className="h-full w-full"
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* All Sculptures Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-2xl font-serif font-black italic">
                  {selectedCategory === 'all'
                    ? 'All Sculptures'
                    : categories.find((c) => c.id === selectedCategory)?.name}
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span className="text-muted-foreground">{totalItems} results found</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <div
                    key="loading"
                    className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500"
                  >
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium">Curating your collection...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div
                    key="empty"
                    className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500"
                  >
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                      <PackageSearch className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No sculptures found</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                      We couldn't find any masterpieces matching your current criteria.
                    </p>
                    <Button variant="outline" onClick={handleClearFilters} className="rounded-full">
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div key="content" className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item: Product, index: number) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="max-h-[400px]"
                        >
                          <ProductCard
                            id={item.id}
                            title={item.title}
                            artist={item.artist || 'Culture Lense Artist'}
                            price={item.price}
                            imageUrl={item.imageUrl}
                            quantity={item.quantity}
                            isNew={item.isNew}
                            className="h-full w-full"
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="pt-8 border-t">
                      <Pagination className="flex justify-end">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) handlePageChange(currentPage - 1);
                              }}
                              className={
                                currentPage <= 1
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>

                          {Array.from({ length: totalPages }).map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(i + 1);
                                }}
                                isActive={currentPage === i + 1}
                                className={cn(
                                  `cursor-pointer`,
                                  currentPage === i + 1
                                    ? 'bg-primary text-white hover:text-white'
                                    : 'bg-card border text-foreground hover:text-primary hover:border-primary',
                                )}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) handlePageChange(currentPage + 1);
                              }}
                              className={
                                currentPage >= totalPages
                                  ? 'pointer-events-none opacity-50'
                                  : 'cursor-pointer'
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
