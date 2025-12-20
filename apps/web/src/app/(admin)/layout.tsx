import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider className="flex w-full h-screen">
      <div className="min-h-[calc(100vh-5rem)] w-full bg-gradient-to-br from-background via-background to-primary/5 flex">
        <AdminSidebarNav />
        <main className="flex-1 p-8 !pb-28 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
