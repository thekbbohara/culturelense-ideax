import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav';
import { Nav } from '@/components/nav';
import { Dock } from '@/components/dock';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <>
      <Nav />
      <SidebarProvider className="flex w-full h-[calc(100vh-4rem)] mt-16">
        <div className="h-full w-full bg-gradient-to-br from-background via-background to-primary/5 flex">
          <AdminSidebarNav />
          <main
            className="flex-1 p-4 sm:p-6 lg:p-8 pb-32 overflow-y-auto relative"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="lg:hidden mb-4">
              <SidebarTrigger />
            </div>
            {children}
          </main>
        </div>
      </SidebarProvider>
      <Dock className="bottom-6" />
    </>
  );
};

export default AdminLayout;
