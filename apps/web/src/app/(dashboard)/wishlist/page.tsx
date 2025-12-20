'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { addItem } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Product } from '../marketplace/page';
import { getRecentListings } from '@/actions/marketplace';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const { userId, vendorId: currentVendorId } = useAppSelector((state) => state.auth);
  const effectiveUserId = userId || 'guest';

  const wishlistItems = useAppSelector(
    (state) => state.wishlist?.itemsByUserId?.[effectiveUserId] || [],
  );
  const cartItems = useAppSelector((state) => state.cart?.itemsByUserId?.[effectiveUserId] || []);
  const [listings, setListings] = useState<Product[]>([]);

  const handleRemoveItem = (item: any) => {
    dispatch(toggleWishlist({ item, userId: effectiveUserId }));
    toast.success('Removed from wishlist');
  };

  const moveToCart = (item: any) => {
    const existingCartItem = cartItems.find((ci) => ci.id === item.id);

    const isOwner = currentVendorId && item.vendorId && currentVendorId === item.vendorId;

    if (isOwner) {
      toast.error('You cannot add your own product to the cart');
      return;
    }

    if (item.availableQuantity === 0) {
      toast.error('This item is out of stock');
      return;
    }

    if (existingCartItem && existingCartItem.quantity >= item.availableQuantity) {
      toast.warning(`Maximum available quantity (${item.availableQuantity}) reached in cart`);
      return;
    }

    dispatch(addItem({ item, userId: effectiveUserId }));
    dispatch(toggleWishlist({ item, userId: effectiveUserId }));
    toast.success('Moved to cart');
  };

  const fetchListings = async () => {
    const res = await getRecentListings();
    if (res.success && res.data) {
      setListings(res.data?.map((item) => ({ ...item, price: parseFloat(item.price) })));
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-white via-neutral-white to-primary/5 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black italic mb-3">
            Your Wishlist is Empty
          </h2>
          <p className="text-neutral-black/60 mb-8 text-sm sm:text-base">
            Save your favorite sculptures to keep track of them
          </p>
          <Link href="/marketplace">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full h-11 sm:h-12 px-6 sm:px-8">
              Explore Marketplace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-white via-neutral-white to-primary/5 pb-24 lg:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary fill-primary" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black italic">
                My <span className="text-primary">Wishlist</span>
              </h1>
            </div>
            <p className="text-neutral-black/60 text-sm sm:text-base">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-2 sm:px-3 py-1 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              {wishlistItems.filter((i) => i.availableQuantity > 0).length} Available
            </Badge>
          </div>
        </div>

        {/* Wishlist - Horizontal Scroll on Mobile */}
        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-4 pb-4 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 lg:pb-0 lg:overflow-visible">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
                className="min-w-[260px] max-w-[280px] flex-shrink-0 snap-center lg:min-w-0 lg:max-w-none group"
              >
                <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-primary/10 hover:border-primary/20 transition-all shadow-sm hover:shadow-lg flex flex-col h-full">
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-neutral-white to-primary/5 overflow-hidden">
                    {item.isNew && (
                      <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-primary text-white border-none px-2 sm:px-3 py-0.5 sm:py-1 shadow-lg">
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider">
                          New
                        </span>
                      </Badge>
                    )}

                    {item.availableQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Badge className="bg-white text-neutral-black border-none px-3 sm:px-4 py-1.5 sm:py-2">
                          <span className="text-xs sm:text-sm">Out of Stock</span>
                        </Badge>
                      </div>
                    )}

                    <Link href={`/marketplace/${item.id}`}>
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </Link>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveItem(item)}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm text-neutral-black opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:text-red-600 shadow-lg flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <Link href={`/marketplace/${item.id}`}>
                      <h3 className="font-bold text-neutral-black mb-0.5 sm:mb-1 line-clamp-1 hover:text-primary transition-colors text-sm sm:text-base">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-neutral-black/60 mb-2 sm:mb-3">
                      {item.artist}
                    </p>

                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-lg sm:text-2xl font-black text-primary">
                        Rs.{item.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => moveToCart(item)}
                        disabled={
                          item.availableQuantity === 0 ||
                          !!(currentVendorId && item.vendorId && currentVendorId === item.vendorId)
                        }
                        className={cn(
                          'flex-1 font-bold h-9 sm:h-10 rounded-full transition-all text-xs sm:text-sm',
                          item.availableQuantity > 0 &&
                            !(currentVendorId && item.vendorId && currentVendorId === item.vendorId)
                            ? 'bg-primary hover:bg-primary/90 text-white'
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
                        )}
                      >
                        <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {currentVendorId && item.vendorId && currentVendorId === item.vendorId
                          ? 'Your Product'
                          : item.availableQuantity > 0
                            ? 'Add to Cart'
                            : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Recommendations */}
        <div className="mt-12 sm:mt-16">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-serif font-black italic">
              You Might Also <span className="text-primary">Like</span>
            </h2>
            <Link href="/marketplace">
              <Button variant="link" className="text-primary font-bold text-sm sm:text-base p-0">
                View All
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
              </Button>
            </Link>
          </div>

          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 sm:gap-4 pb-4 lg:grid lg:grid-cols-4 lg:pb-0 lg:overflow-visible">
            {listings.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={`/marketplace/${item.id}`}
                className="min-w-[160px] max-w-[180px] flex-shrink-0 snap-center lg:min-w-0 lg:max-w-none"
              >
                <div className="group bg-white rounded-lg sm:rounded-xl overflow-hidden border border-primary/10 hover:border-primary/20 transition-all">
                  <div className="aspect-square bg-gradient-to-br from-neutral-white to-primary/5 overflow-hidden relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-2 sm:p-3">
                    <h4 className="font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-primary font-black text-base sm:text-lg">
                      Rs.{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
