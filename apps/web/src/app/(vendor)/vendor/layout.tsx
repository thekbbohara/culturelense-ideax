import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { VendorSidebarNav } from '@/components/vendor/vendor-sidebar-nav';
import { VendorMobileNav } from '@/components/vendor/vendor-mobile-nav';

interface VenderLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VenderLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider className="flex w-full h-screen">
      <div className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-br from-background via-background to-primary/5 flex">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <VendorSidebarNav />
        </div>

        {/* Main Content */}
        <main
          className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {children}
        </main>

        {/* Mobile Bottom Navigation - visible only on mobile */}
        <VendorMobileNav />
      </div>
    </SidebarProvider>
  );
};

export default VendorLayout;
