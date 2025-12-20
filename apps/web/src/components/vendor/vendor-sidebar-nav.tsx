'use client';

import { VendorNav, NavItem } from '@/components/vendor/vendor-nav';
import { LayoutDashboard, MessageSquare, Package, ShoppingCart } from 'lucide-react';

const navItems: NavItem[] = [
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

export function VendorSidebarNav() {
  return <VendorNav navItems={navItems} />;
}
