'use client';

import React from 'react';
import { NavSearch } from '@/components/search/nav-search';

export function Nav() {
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

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
      className={`fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-primary/10 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-serif text-lg md:text-xl font-bold italic">C</span>
          </div>
          <span className="font-serif text-xl md:text-2xl font-black tracking-tighter uppercase hidden lg:block">
            CultureLense
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0 grow justify-end ml-4">
          <div className="w-full max-w-xs lg:w-80 transition-all">
            <NavSearch />
          </div>
        </div>
      </div>
    </nav>
  );
}
