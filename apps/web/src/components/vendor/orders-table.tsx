'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateOrderStatus } from '@/actions/vendor-actions';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

interface Order {
  id: string;
  quantity: string;
  totalAmount: string;
  status: string;
  shippingAddress: string;
  createdAt: Date;
  listing: {
    title: string;
    imageUrl: string;
  };
  buyer: {
    email: string;
  };
}

interface OrdersTableProps {
  orders: Order[];
  onStatusUpdate?: () => void;
}

export function OrdersTable({ orders, onStatusUpdate }: OrdersTableProps) {
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    const result = await updateOrderStatus(orderId, newStatus);

    if (result.success) {
      toast.success(result.message || 'Order status updated');
      onStatusUpdate?.();
    } else {
      toast.error(result.error || 'Failed to update order status');
    }
    setUpdatingOrder(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      shipped: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      delivered: 'bg-green-500/10 text-green-600 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    };

    return (
      <Badge className={variants[status] || variants.pending} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[80px]">Product</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Update Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="w-12 h-12 opacity-50" />
                  <p>No orders yet</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <img
                    src={order.listing.imageUrl}
                    alt={order.listing.title}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold text-foreground">{order.listing.title}</div>
                    <div className="text-sm text-muted-foreground">Qty: {order.quantity}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{order.buyer.email}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {order.shippingAddress}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">${order.totalAmount}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                    disabled={updatingOrder === order.id}
                  >
                    <SelectTrigger className="w-[140px] focus:ring-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
