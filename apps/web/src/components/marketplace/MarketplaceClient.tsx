'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    getRecentListings,
    recordSearch,
    ListingFilters,
} from '@/actions/marketplace';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, PackageSearch, Loader2, ArrowRight } from 'lucide-react';
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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatText } from '@/utils/re-usables';
import { Product } from '@/app/(dashboard)/marketplace/page';
import { getFeaturedListings } from '@/actions/marketplace';

interface MarketplaceClientProps {
    initialItems: Product[];
    initialFeaturedItems: Product[];
    initialCategories: { id: string; name: string }[];
    initialMaxPrice: number;
    initialTotalItems: number;
    initialTotalPages: number;
}

export function MarketplaceClient({
    initialItems,
    initialFeaturedItems,
    initialCategories,
    initialMaxPrice,
    initialTotalItems,
    initialTotalPages,
}: MarketplaceClientProps) {
    const router = useRouter();
    const [items, setItems] = useState<Product[]>(initialItems);
    const [featuredItems, setFeaturedItems] = useState<Product[]>(initialFeaturedItems);
    const [categories] = useState<{ id: string; name: string }[]>(initialCategories);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<number[]>([0, initialMaxPrice]);
    const [dynamicMaxPrice] = useState<number>(initialMaxPrice);
    const [selectedSort, setSelectedSort] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [totalItems, setTotalItems] = useState(initialTotalItems);

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

    const handleSearchSubmit = async () => {
        setCurrentPage(1);
        fetchItems({ search: searchQuery, page: 1 });
        fetchFeaturedItemsData({ search: searchQuery });

        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (user) {
            await recordSearch(user.id, searchQuery);
        }
    };

    useEffect(() => {
        // We skip the first load because we have initial data
        if (
            selectedCategory !== 'all' ||
            priceRange[0] !== 0 ||
            priceRange[1] !== dynamicMaxPrice ||
            selectedSort !== 'All' ||
            searchQuery !== '' ||
            currentPage !== 1
        ) {
            fetchItems();
        }
    }, [currentPage, selectedCategory, selectedSort, priceRange, searchQuery, fetchItems]);

    const handleApplyFilters = () => {
        setCurrentPage(1);
        fetchItems({ page: 1 });
    };

    const handleClearFilters = () => {
        setSelectedCategory('all');
        setPriceRange([0, dynamicMaxPrice]);
        setSearchQuery('');
        setCurrentPage(1);
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

                    <main className="flex-1 space-y-16">
                        {featuredItems.length > 0 && currentPage === 1 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    <h2 className="text-2xl font-serif font-black italic">Featured Masterpieces</h2>
                                </div>
                                <div className="lg:hidden flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                                    {featuredItems.map((item: Product) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4 }}
                                            onClick={() => router.push(`/marketplace/${item.id}`)}
                                            className="min-w-[280px] max-w-[300px] h-[350px] flex-shrink-0 snap-center relative rounded-2xl overflow-hidden group cursor-pointer border border-border bg-card shadow-sm"
                                        >
                                            {item.imageUrl && (
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                                <span className="px-2 py-0.5 bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 inline-block">
                                                    {item.artist || 'Featured'}
                                                </span>
                                                <h3 className="text-xl font-serif font-bold text-white mb-2 line-clamp-2">
                                                    {formatText(item.title)}
                                                </h3>
                                                <div className="flex items-center gap-2 text-white/80">
                                                    <span className="text-sm font-medium">View Details</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[600px]">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                        onClick={() => router.push(`/marketplace/${featuredItems[0]?.id}`)}
                                        className="col-span-6 h-full relative rounded-[2rem] overflow-hidden group cursor-pointer border border-border bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                                    >
                                        {featuredItems[0]?.imageUrl && (
                                            <Image
                                                src={featuredItems[0]?.imageUrl}
                                                alt={featuredItems[0]?.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-10 w-full">
                                            <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 inline-block">
                                                {featuredItems[0]?.artist}
                                            </span>
                                            <h3 className="text-4xl font-serif font-bold text-white mb-3">
                                                {featuredItems[0]?.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                                                <span className="text-base font-medium">View Details</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="col-span-6 h-full flex flex-col gap-6">
                                        {featuredItems.slice(1, 3).map((item: any) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4 }}
                                                onClick={() => router.push(`/marketplace/${item.id}`)}
                                                className="flex-1 relative rounded-[2rem] overflow-hidden group cursor-pointer border border-border bg-card shadow-sm hover:shadow-lg transition-all"
                                            >
                                                {item.imageUrl && (
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                                <div className="absolute bottom-6 left-6 right-6">
                                                    <h3 className="font-serif font-bold text-xl text-white truncate">
                                                        {formatText(item.title)}
                                                    </h3>
                                                    <p className="text-white/70 text-xs font-medium uppercase tracking-widest mt-1">
                                                        {item.artist}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                        

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
                                        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 pb-4 lg:grid lg:grid-cols-3 sm:gap-6 sm:pb-0 lg:overflow-visible">
                                            {items.map((item: Product) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.4 }}
                                                    className="min-w-[280px] max-w-[320px] flex-shrink-0 snap-center sm:min-w-0 sm:max-w-none sm:max-h-[400px]"
                                                >
                                                    <ProductCard
                                                        id={item.id}
                                                        vendorId={item.vendorId}
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
