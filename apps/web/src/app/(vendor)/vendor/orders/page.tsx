'use client';

import { useEffect, useState } from 'react';
import { getVendorByUserId, getVendorOrders } from '@/actions/vendor-actions';
import { OrdersTable } from '@/components/vendor/orders-table';
import { ShoppingCart } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const vendorResult = await getVendorByUserId();
    if (vendorResult.success && vendorResult.data) {
      const ordersResult = await getVendorOrders(vendorResult.data.id);
      setOrders(ordersResult.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-black italic text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage and track your product orders</p>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShoppingCart className="w-5 h-5 animate-pulse" />
            <span>Loading orders...</span>
          </div>
        </div>
      ) : (
        <OrdersTable orders={orders} onStatusUpdate={fetchOrders} />
      )}
    </div>
  );
}
