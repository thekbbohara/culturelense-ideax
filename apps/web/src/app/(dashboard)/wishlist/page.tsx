'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { addItem } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Product } from '../marketplace/page';
import { getRecentListings } from '@/actions/marketplace';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const cartItems = useAppSelector((state) => state.cart.items);
  const [listings, setListings] = useState<Product[]>([]);

  const handleRemoveItem = (item: any) => {
    dispatch(toggleWishlist(item));
    toast.success('Removed from wishlist');
  };

  const moveToCart = (item: any) => {
    const existingCartItem = cartItems.find((ci) => ci.id === item.id);

    if (item.availableQuantity === 0) {
      toast.error('This item is out of stock');
      return;
    }

    if (existingCartItem && existingCartItem.quantity >= item.availableQuantity) {
      toast.warning(`Maximum available quantity (${item.availableQuantity}) reached in cart`);
      return;
    }

    dispatch(addItem({ ...item, quantity: 1 }));
    dispatch(toggleWishlist(item));
    toast.success('Moved to cart');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-white via-neutral-white to-primary/5 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-black italic mb-3">Your Wishlist is Empty</h2>
          <p className="text-neutral-black/60 mb-8">
            Save your favorite sculptures to keep track of them
          </p>
          <Link href="/marketplace">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full h-12 px-8">
              Explore Marketplace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const fetchListings = async () => {
    const res = await getRecentListings();
    if (res.success && res.data) {
      setListings(res.data?.map((item) => ({ ...item, price: parseFloat(item.price) })));
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-white via-neutral-white to-primary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-primary fill-primary" />
              <h1 className="text-4xl md:text-5xl font-serif font-black italic">
                My <span className="text-primary">Wishlist</span>
              </h1>
            </div>
            <p className="text-neutral-black/60">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              {wishlistItems.filter((i) => i.availableQuantity > 0).length} Available
            </Badge>
          </div>
          {/* <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-2 border-primary/20 hover:bg-primary/5 font-bold rounded-full"
            >
              Share Wishlist
            </Button>
          </div> */}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
                className="group max-h-[450px]"
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-primary/10 hover:border-primary/20 transition-all shadow-sm hover:shadow-lg flex flex-col h-full">
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-neutral-white to-primary/5 overflow-hidden">
                    {item.isNew && (
                      <Badge className="absolute top-3 left-3 z-10 bg-primary text-white border-none px-3 py-1 shadow-lg">
                        <span className="text-[10px] font-black uppercase tracking-wider">New</span>
                      </Badge>
                    )}

                    {item.availableQuantity === 0 && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Badge className="bg-white text-neutral-black border-none px-4 py-2">
                          Out of Stock
                        </Badge>
                      </div>
                    )}

                    <Link href={`/marketplace/${item.id}`}>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </Link>

                    {/* Remove Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveItem(item)}
                      className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-neutral-black opacity-0 group-hover:opacity-100 transition-all hover:text-red-600 shadow-lg flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Link href={`/marketplace/${item.id}`}>
                      <h3 className="font-bold text-neutral-black mb-1 line-clamp-1 hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-neutral-black/60 mb-3">{item.artist}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-primary">
                        Rs.{item.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => moveToCart(item)}
                        disabled={item.availableQuantity === 0}
                        className={cn(
                          'flex-1 font-bold h-10 rounded-full transition-all',
                          item.availableQuantity > 0
                            ? 'bg-primary hover:bg-primary/90 text-white'
                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
                        )}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {item.availableQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Recommendations */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-black italic">
              You Might Also <span className="text-primary">Like</span>
            </h2>
            <Link href="/marketplace">
              <Button variant="link" className="text-primary font-bold">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/marketplace/${item.id}`}>
                <div className="group bg-white rounded-xl overflow-hidden border border-primary/10 hover:border-primary/20 transition-all">
                  <div className="aspect-square bg-gradient-to-br from-neutral-white to-primary/5 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-primary font-black text-lg">
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
