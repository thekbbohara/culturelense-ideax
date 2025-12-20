import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { VendorSidebarNav } from '@/components/vendor/vendor-sidebar-nav';

interface VenderLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VenderLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider className="flex w-full h-screen">
      <div className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-br from-background via-background to-primary/5 flex">
        <VendorSidebarNav />
        <main className="flex-1 p-8 !pb-28 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default VendorLayout;
