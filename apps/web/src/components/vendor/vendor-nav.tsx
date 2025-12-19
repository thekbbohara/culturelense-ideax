'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShoppingCart, MessageSquare, LayoutDashboard } from 'lucide-react';
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

export function VendorNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-8 h-16">
          {navItems.map((item) => {
            const isActive =
              item.href === '/vendor'
                ? pathname === '/vendor'
                : pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all',
                  'hover:bg-primary/10 hover:text-primary',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground',
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
