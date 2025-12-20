'use client';

import { VendorNav, NavItem } from '@/components/vendor/vendor-nav';
import { LayoutDashboard, Package } from 'lucide-react';

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Package,
  },
];

export function AdminSidebarNav() {
  return <VendorNav navItems={navItems} isAdmin={true} />;
}
