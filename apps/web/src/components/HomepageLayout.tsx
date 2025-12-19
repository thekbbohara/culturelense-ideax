'use client';

import { createClient } from '@/lib/supabase/client';
import React from 'react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HomepageLayoutProps {
  children: React.ReactNode;
}

const HomepageLayout: React.FC<HomepageLayoutProps> = ({ children }) => {
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const pathname = usePathname();

  if (pathname === '/' || pathname === '/login') {
    return (
      <div className="min-h-screen bg-neutral-white text-neutral-black font-sans">{children}</div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-white text-neutral-black font-sans">
      <nav className="fixed top-0 w-full z-50 bg-neutral-white/90 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-serif text-xl font-bold italic">C</span>
            </div>
            <span className="font-serif text-2xl font-black tracking-tighter uppercase">
              CultureLense
            </span>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-full border-neutral-black font-bold uppercase tracking-widest text-[10px] px-6 hover:bg-neutral-black hover:text-white transition-colors flex items-center gap-2"
          >
            Logout <LogOut className="w-3 h-3" />
          </Button>
        </div>
      </nav>

      <main className="pt-32 px-6 max-w-7xl mx-auto pb-20">{children}</main>
    </div>
  );
};

export default HomepageLayout;
