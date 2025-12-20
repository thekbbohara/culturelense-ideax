'use client';

import React from 'react';
import { NavSearch } from '@/components/search/nav-search';
import { ShoppingCart, Heart, Search, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function Nav() {
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = React.useState(false);

  const { userId } = useAppSelector((state) => state.auth);
  const effectiveUserId = userId || 'guest';

  const cartItemsCount = useAppSelector(
    (state) => (state.cart?.itemsByUserId?.[effectiveUserId as string] || []).length,
  );
  const wishlistItemsCount = useAppSelector(
    (state) => (state.wishlist?.itemsByUserId?.[effectiveUserId as string] || []).length,
  );

  const router = useRouter();

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // On desktop (md+), hide on scroll down, show on scroll up
      if (window.innerWidth >= 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        // Always visible/fixed on mobile
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 w-full z-[999] bg-primary backdrop-blur-xl border-b border-primary/10 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center relative">
        <AnimatePresence mode="wait">
          {!isMobileSearchVisible ? (
            <motion.div
              key="logo-nav"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between w-full"
            >
              <Image
                src="/cultureLense.png"
                alt="CultureLense Logo"
                width={50}
                height={50}
                className="w-12 h-12 object-cover rounded-full cursor-pointer"
                onClick={() => router.push('/home')}
              />

              <div className="flex items-center gap-2 md:gap-8 ml-4">
                {/* Desktop Search */}
                <div className="max-w-xs transition-all hidden md:block w-80">
                  <NavSearch />
                </div>

                <div className="flex items-center gap-1 md:gap-4">
                  {/* Mobile Search Toggle */}
                  <button
                    onClick={() => setIsMobileSearchVisible(true)}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors md:hidden"
                  >
                    <Search className="w-6 h-6" />
                  </button>

                  {/* Wishlist Icon */}
                  <Link
                    href="/wishlist"
                    className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors group"
                  >
                    <Heart className="w-6 h-6" />
                    {wishlistItemsCount > 0 && (
                      <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in">
                        {wishlistItemsCount}
                      </span>
                    )}
                  </Link>

                  {/* Cart Icon */}
                  <Link
                    href="/cart"
                    className="relative p-2 text-white hover:bg-white/10 rounded-full transition-colors group"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {cartItemsCount > 0 && (
                      <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mobile-search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center w-full gap-2"
            >
              <button
                onClick={() => setIsMobileSearchVisible(false)}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex-1 min-w-0">
                <NavSearch />
              </div>
              <button
                onClick={() => setIsMobileSearchVisible(false)}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
