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

export default function CartPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const subtotal = useAppSelector((state) => state.cart.totalAmount);

  const handleUpdateQuantity = (id: string, currentQty: number, delta: number) => {
    dispatch(updateQuantity({ id, quantity: Math.max(1, currentQty + delta) }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
  };

  const handleSaveToWishlist = (items: CartItem[]) => {
    items.map((item) => {
      const isInWishlist = wishlistItems.some((i) => i.id === item.id);
      if (!isInWishlist) {
        dispatch(toggleWishlist(item));
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
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-black italic mb-3">Your Cart is Empty</h2>
          <p className="text-neutral-black/60 mb-8">
            Discover amazing sculptures and add them to your cart
          </p>
          <Link href="/marketplace">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full h-12 px-8">
              Browse Marketplace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-white via-neutral-white to-primary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-serif font-black italic mb-2">
              Shopping <span className="text-primary">Cart</span>
            </h1>
            <p className="text-neutral-black/60">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 border border-primary/10 hover:border-primary/20 transition-all shadow-sm"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-neutral-white to-primary/5">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-neutral-black mb-1 line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-neutral-black/60">{item.artist}</p>
                        </div>
                        <div className="flex gap-2">
                          {/* <button
                            onClick={() => handleSaveToWishlist(item)}
                            className={cn(
                              'p-2 rounded-full transition-all',
                              wishlistItems.some((i) => i.id === item.id)
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'hover:bg-primary/10 text-neutral-black/40 hover:text-primary',
                            )}
                          >
                            <Heart
                              className={cn(
                                'w-5 h-5',
                                wishlistItems.some((i) => i.id === item.id) && 'fill-current',
                              )}
                            />
                          </button> */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 rounded-full hover:bg-red-50 text-neutral-black/40 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="h-8 w-8 rounded-full border-primary/20 hover:bg-primary/10"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-bold text-neutral-black w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            disabled={item.quantity >= item.availableQuantity}
                            className={cn(
                              'h-8 w-8 rounded-full border-primary/20',
                              item.quantity < item.availableQuantity
                                ? 'hover:bg-primary/10'
                                : 'opacity-30 cursor-not-allowed',
                            )}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-2xl font-black text-primary">
                            Rs.{(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-neutral-black/50">
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
                className="w-full border-2 border-primary/20 hover:bg-primary/5 hover:border-primary font-bold h-12 rounded-full"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-primary/10 shadow-lg"
              >
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-neutral-black/70">
                    <span>Subtotal</span>
                    <span className="font-semibold">Rs.{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-black/70">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <Badge className="bg-green-500/10 text-green-700 border-green-200">
                          FREE
                        </Badge>
                      ) : (
                        `Rs.${shipping}`
                      )}
                    </span>
                  </div>
                  {/* <div className="flex justify-between text-neutral-black/70">
                    <span>Tax (10%)</span>
                    <span className="font-semibold">Rs.{tax.toFixed(2)}</span>
                  </div> */}

                  <Separator className="bg-primary/10" />

                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-black text-2xl text-primary">
                      Rs.{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-neutral-black mb-1">
                          Free Shipping Available!
                        </p>
                        <p className="text-xs text-neutral-black/60">
                          Add Rs.{(5000 - subtotal).toLocaleString()} more to qualify
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-full shadow-lg shadow-primary/30 mb-3"
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSaveToWishlist(cartItems)}
                  className="w-full border-2 border-primary/20 hover:bg-primary/5 font-bold h-12 rounded-full"
                >
                  <Heart className="w-5 h-5 mr-2" />
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
