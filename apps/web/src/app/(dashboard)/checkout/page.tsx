'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChevronRight,
  MapPin,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Banknote,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { createOrders } from '@/actions/checkout';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Step = 'address' | 'review' | 'payment' | 'success';

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('address');
  const [isLoading, setIsLoading] = useState(false);
  const [shippingData, setShippingData] = useState({
    fullName: '',
    address: '',
    city: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'escrow'>('cod');

  const dispatch = useAppDispatch();
  const router = useRouter();
  const cartItems = useAppSelector((state) => state.cart.items);
  const subtotal = useAppSelector((state) => state.cart.totalAmount);

  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 50;
  const total = subtotal + shipping;

  if (cartItems.length === 0 && step !== 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-black mb-2">Your cart is empty</h2>
        <p className="text-neutral-black/60 mb-6">
          Add some cultural treasures to your cart before checking out.
        </p>
        <Button asChild>
          <Link href="/marketplace">Explore Marketplace</Link>
        </Button>
      </div>
    );
  }

  const handleStepChange = (nextStep: Step) => {
    if (
      nextStep === 'review' &&
      (!shippingData.fullName || !shippingData.address || !shippingData.city || !shippingData.phone)
    ) {
      toast.error('Please fill in all shipping details');
      return;
    }
    setStep(nextStep);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          listingId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod,
        shippingAddress: `${shippingData.fullName}, ${shippingData.address}, ${shippingData.city}. Ph: ${shippingData.phone}`,
      };

      const result = await createOrders(orderData);

      if (result.success) {
        dispatch(clearCart());
        setStep('success');
        toast.success('Order placed successfully!');
      } else {
        toast.error(result.error || 'Failed to place order');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-white via-neutral-white to-primary/5 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-neutral-black">Checkout</h1>
            <Badge variant="outline" className="bg-white border-primary/20 text-primary px-4 py-1">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </Badge>
          </div>

          <div className="relative flex justify-between">
            {/* Progress Bar */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/10 -translate-y-1/2 -z-10" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -translate-y-1/2 -z-10"
              style={{
                width:
                  step === 'address'
                    ? '0%'
                    : step === 'review'
                      ? '50%'
                      : step === 'payment'
                        ? '100%'
                        : '100%',
              }}
            />

            {[
              { id: 'address', icon: MapPin, label: 'Shipping' },
              { id: 'review', icon: ShoppingBag, label: 'Review' },
              { id: 'payment', icon: CreditCard, label: 'Payment' },
            ].map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted =
                ['review', 'payment', 'success'].includes(step) &&
                idx < ['address', 'review', 'payment'].indexOf(step);

              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 bg-white',
                      isActive
                        ? 'border-primary text-primary shadow-lg shadow-primary/20'
                        : isCompleted
                          ? 'border-primary bg-primary text-white'
                          : 'border-primary/20 text-neutral-black/40',
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium mt-2',
                      isActive || isCompleted ? 'text-primary' : 'text-neutral-black/40',
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 'address' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-primary/10 shadow-sm"
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Shipping Information
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-black/70">
                          Full Name
                        </label>
                        <Input
                          placeholder="John Doe"
                          value={shippingData.fullName}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, fullName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-black/70">
                          Phone Number
                        </label>
                        <Input
                          placeholder="+977-9800000000"
                          value={shippingData.phone}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-black/70">
                        Street Address
                      </label>
                      <Input
                        placeholder="House No., Street Name"
                        value={shippingData.address}
                        onChange={(e) =>
                          setShippingData({ ...shippingData, address: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-black/70">
                        City / District
                      </label>
                      <Input
                        placeholder="Kathmandu"
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button
                      onClick={() => handleStepChange('review')}
                      className="px-8 bg-primary hover:bg-primary/90 text-white rounded-xl h-12"
                    >
                      Next: Review Order
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'review' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-primary/10 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                      Review Order
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep('address')}
                      className="text-primary hover:text-primary/80"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Edit Address
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* Items List */}
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 rounded-xl bg-neutral-white border border-primary/5"
                        >
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-neutral-black truncate">
                              {item.title}
                            </h3>
                            <p className="text-sm text-neutral-black/60 truncate">{item.artist}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm font-medium">Qty: {item.quantity}</span>
                              <span className="font-bold text-primary">
                                Rs. {(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Summary */}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Shipping To
                      </h4>
                      <p className="text-sm text-neutral-black/70">{shippingData.fullName}</p>
                      <p className="text-sm text-neutral-black/70">
                        {shippingData.address}, {shippingData.city}
                      </p>
                      <p className="text-sm text-neutral-black/70">Ph: {shippingData.phone}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button
                      onClick={() => setStep('payment')}
                      className="px-8 bg-primary hover:bg-primary/90 text-white rounded-xl h-12"
                    >
                      Proceed to Payment
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-primary/10 shadow-sm"
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={cn(
                        'p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all',
                        paymentMethod === 'cod'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-primary/10 hover:border-primary/30',
                      )}
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center',
                          paymentMethod === 'cod'
                            ? 'bg-primary text-white'
                            : 'bg-neutral-white text-neutral-black/40',
                        )}
                      >
                        <Banknote className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-black">Cash on Delivery</p>
                        <p className="text-xs text-neutral-black/60">Pay when you receive</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('escrow')}
                      className={cn(
                        'p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all',
                        paymentMethod === 'escrow'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-primary/10 hover:border-primary/30',
                      )}
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center',
                          paymentMethod === 'escrow'
                            ? 'bg-primary text-white'
                            : 'bg-neutral-white text-neutral-black/40',
                        )}
                      >
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-black">Secure Escrow</p>
                        <p className="text-xs text-neutral-black/60">Payment held until delivery</p>
                      </div>
                    </button>
                  </div>

                  {paymentMethod === 'escrow' ? (
                    <div className="space-y-4 mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900">Secure Escrow Payment</h4>
                          <p className="text-xs text-blue-700">Your funds are protected</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-blue-800">
                        <p className="flex items-start gap-2">
                          <span className="font-bold">1.</span>
                          <span>Payment will be held securely in escrow</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold">2.</span>
                          <span>Vendor ships your order</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold">3.</span>
                          <span>Confirm delivery to release payment to vendor</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold">4.</span>
                          <span>Dispute option available if issues arise</span>
                        </p>
                      </div>
                      <p className="text-xs text-blue-600 italic pt-2 border-t border-blue-200">
                        💡 Buyer protection: Funds only released after you confirm delivery
                      </p>
                    </div>
                  ) : (
                    <div className="mb-8 p-6 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                          <Banknote className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-900">Cash on Delivery</h4>
                          <p className="text-xs text-amber-700">Pay when you receive your order</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-amber-800">
                        <p className="flex items-start gap-2">
                          <span className="font-bold">1.</span>
                          <span>Vendor ships your order</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold">2.</span>
                          <span>Receive your order at your doorstep</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="font-bold">3.</span>
                          <span>Pay cash to the delivery person</span>
                        </p>
                      </div>
                      <p className="text-xs text-amber-600 italic pt-2 border-t border-amber-200">
                        💡 Simple & convenient: No upfront payment required
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={() => setStep('review')}
                      className="text-primary"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back to Review
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isLoading}
                      className="px-10 bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-lg font-bold min-w-[200px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-12 border border-primary/10 shadow-xl text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-black mb-2">Order Confirmed!</h2>
                  <p className="text-neutral-black/60 mb-8 max-w-sm mx-auto">
                    Thank you for your purchase. Your order has been placed and is being processed
                    by our artisans.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild className="rounded-xl h-12 px-8">
                      <Link href="/marketplace">Continue Shopping</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-xl h-12 px-8 border-primary/20 text-primary"
                    >
                      <Link href="/vendor/orders">View Your Orders</Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar (Sticky) */}
          {step !== 'success' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-primary/10 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold mb-6">Order Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-neutral-black/70">
                    <span>Subtotal</span>
                    <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-black/70">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-600 font-bold uppercase text-sm italic">
                          Free
                        </span>
                      ) : (
                        `Rs. ${shipping}`
                      )}
                    </span>
                  </div>
                  <Separator className="bg-primary/10" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      Rs. {total.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-black/40 text-center uppercase tracking-wider font-semibold pt-4">
                    Guaranteed Safe Checkout
                  </p>
                  <div className="flex justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg"
                      className="h-4"
                      alt="Visa"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                      className="h-4"
                      alt="Mastercard"
                    />
                    <img
                      src="https://khalti.com/wp-content/uploads/2019/12/khalti-logo.png"
                      className="h-4"
                      alt="Khalti"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
