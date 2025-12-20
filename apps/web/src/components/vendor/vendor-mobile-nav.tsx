'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/vendor',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/vendor/products',
    icon: Package,
  },
  {
    title: 'Orders',
    href: '/vendor/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Feedbacks',
    href: '/vendor/feedbacks',
    icon: MessageSquare,
  },
];

export function VendorMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/vendor'
              ? pathname === '/vendor'
              : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'fill-primary/20')} />
              <span className={cn('text-[10px] font-medium', isActive && 'font-bold')}>
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
