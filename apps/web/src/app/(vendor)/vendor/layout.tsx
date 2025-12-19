import React from 'react';
import { VendorNav } from '@/components/vendor/vendor-nav';

interface VenderLayoutProps {
  children: React.ReactNode;
}

const VendorLayout: React.FC<VenderLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <VendorNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
};

export default VendorLayout;
