'use client';

import React from 'react';
import { NavSearch } from '@/components/search/nav-search';
import { ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';

export function Nav() {
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  const { userId } = useAppSelector((state) => state.auth);
  const effectiveUserId = userId || 'guest';

  const cartItemsCount = useAppSelector(
    (state) => (state.cart?.itemsByUserId?.[effectiveUserId as string] || []).length,
  );
  const wishlistItemsCount = useAppSelector(
    (state) => (state.wishlist?.itemsByUserId?.[effectiveUserId as string] || []).length,
  );

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
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-16 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-primary font-serif text-lg md:text-xl font-bold italic">C</span>
          </div>
          <span className="font-serif text-xl md:text-2xl font-black tracking-tighter uppercase hidden lg:block text-white">
            CultureLense
          </span>
        </Link>

        <div className="flex items-center gap-4 md:gap-8 shrink-0 grow justify-end ml-4">
          <div className="w-full max-w-xs lg:w-80 transition-all hidden sm:block">
            <NavSearch />
          </div>

          <div className="flex items-center gap-4">
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
      </div>
    </nav>
  );
}
