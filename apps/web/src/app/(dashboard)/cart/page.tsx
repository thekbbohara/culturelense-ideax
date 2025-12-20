'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Heart, Tag } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateQuantity, removeItem, CartItem } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import Image from 'next/image';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector((state) => state.auth);
  const effectiveUserId = userId || 'guest';

  const cartItems = useAppSelector((state) => state.cart?.itemsByUserId?.[effectiveUserId] || []);
  const wishlistItems = useAppSelector(
    (state) => state.wishlist?.itemsByUserId?.[effectiveUserId] || [],
  );

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleUpdateQuantity = (id: string, currentQty: number, delta: number) => {
    dispatch(
      updateQuantity({ id, quantity: Math.max(1, currentQty + delta), userId: effectiveUserId }),
    );
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem({ id, userId: effectiveUserId }));
  };

  const handleSaveToWishlist = (items: CartItem[]) => {
    items.forEach((item) => {
      const isInWishlist = wishlistItems.some((i) => i.id === item.id);
      if (!isInWishlist) {
        dispatch(toggleWishlist({ item, userId: effectiveUserId }));
      }
    });
  };

  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 50;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-white via-neutral-white to-primary/5 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black italic mb-3">
            Your Cart is Empty
          </h2>
          <p className="text-neutral-black/60 mb-8 text-sm sm:text-base">
            Discover amazing sculptures and add them to your cart
          </p>
          <Link href="/marketplace">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full h-11 sm:h-12 px-6 sm:px-8">
              Browse Marketplace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-white via-neutral-white to-primary/5 pb-32 lg:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black italic mb-2">
              Shopping <span className="text-primary">Cart</span>
            </h1>
            <p className="text-neutral-black/60 text-sm sm:text-base">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-all shadow-sm"
                >
                  <div className="flex gap-3 sm:gap-6">
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-neutral-white to-primary/5">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm sm:text-lg text-neutral-black mb-0.5 sm:mb-1 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-neutral-black/60 truncate">
                            {item.artist}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 sm:p-2 rounded-full hover:bg-red-50 text-neutral-black/40 hover:text-red-600 transition-all flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 sm:mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-primary/20 hover:bg-primary/10"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <span className="font-bold text-neutral-black w-6 sm:w-8 text-center text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            disabled={item.quantity >= item.availableQuantity}
                            className={cn(
                              'h-7 w-7 sm:h-8 sm:w-8 rounded-full border-primary/20',
                              item.quantity < item.availableQuantity
                                ? 'hover:bg-primary/10'
                                : 'opacity-30 cursor-not-allowed',
                            )}
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg sm:text-2xl font-black text-primary">
                            Rs.{(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-[10px] sm:text-xs text-neutral-black/50">
                              Rs.{item.price.toLocaleString()} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <Link href="/marketplace">
              <Button
                variant="outline"
                className="w-full border-2 border-primary/20 hover:bg-primary/5 hover:border-primary font-bold h-11 sm:h-12 rounded-full text-sm sm:text-base"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary/10 shadow-lg"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Order Summary</h3>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-neutral-black/70 text-sm sm:text-base">
                    <span>Subtotal</span>
                    <span className="font-semibold">Rs.{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-black/70 text-sm sm:text-base">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <Badge className="bg-green-500/10 text-green-700 border-green-200 text-xs">
                          FREE
                        </Badge>
                      ) : (
                        `Rs.${shipping}`
                      )}
                    </span>
                  </div>

                  <Separator className="bg-primary/10" />

                  <div className="flex justify-between text-base sm:text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-black text-xl sm:text-2xl text-primary">
                      Rs.{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-secondary/10 border border-secondary/20 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-neutral-black mb-0.5 sm:mb-1">
                          Free Shipping Available!
                        </p>
                        <p className="text-[10px] sm:text-xs text-neutral-black/60">
                          Add Rs.{(5000 - subtotal).toLocaleString()} more to qualify
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 sm:h-14 rounded-full shadow-lg shadow-primary/30 mb-2 sm:mb-3"
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSaveToWishlist(cartItems)}
                  className="w-full border-2 border-primary/20 hover:bg-primary/5 font-bold h-10 sm:h-12 rounded-full text-sm sm:text-base"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Save to Wishlist
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
