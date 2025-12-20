'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import { createClient } from '@/lib/supabase/client';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function VendorNav({ navItems, isAdmin }: { navItems: NavItem[]; isAdmin?: boolean }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Using window.location to force full reload and clear any state
    window.location.href = '/';
  };

  return (
    <Sidebar>
      <SidebarContent className="pb-10 pt-28 px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xl font-semibold text-black">
            <h2>Vendor Dashboard</h2>
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-10">
            <SidebarMenu>
              {navItems.map((tab: NavItem) => {
                const isActive =
                  tab.href === '/admin'
                    ? pathname === '/admin'
                    : tab.href === '/vendor'
                      ? pathname === '/vendor'
                      : pathname === tab.href || pathname.startsWith(tab.href + '/');
                return (
                  <SidebarMenuItem
                    key={tab.title}
                    className={`flex items-center p-1 rounded-md transition-colors     
                  `}
                  >
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all',
                        'hover:bg-primary/10 hover:text-primary',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground',
                      )}
                    >
                      <Link href={tab.href}>
                        <div className="w-6 h-6">{<tab.icon />}</div>
                        <span className="text-base font-medium">{tab.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center px-3 py-3 text-architect-600 rounded-md hover:bg-architect-50 hover:text-architect-950 transition-colors cursor-pointer justify-start w-full',
            )}
          >
            <LogOut size={20} />
            <span className="ml-3 text-sm font-medium">Logout</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
