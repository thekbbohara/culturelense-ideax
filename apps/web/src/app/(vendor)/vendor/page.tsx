'use client';

import { useEffect, useState } from 'react';
import {
  getVendorByUserId,
  getVendorListings,
  getVendorOrders,
  getVendorReviews,
} from '@/actions/vendor-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalReviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const vendorResult = await getVendorByUserId();
      if (!vendorResult.success || !vendorResult.data) {
        setLoading(false);
        return;
      }

      const [listingsResult, ordersResult, reviewsResult] = await Promise.all([
        getVendorListings(vendorResult.data.id),
        getVendorOrders(vendorResult.data.id),
        getVendorReviews(vendorResult.data.id),
      ]);

      const listings = listingsResult.data || [];
      const orders = ordersResult.data || [];
      const reviews = reviewsResult.data || [];

      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + parseInt(r.rating), 0) / reviews.length
          : 0;

      setStats({
        totalProducts: listings.length,
        activeProducts: listings.filter((l) => l.status === 'active').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        totalReviews: reviews.length,
        averageRating: avgRating,
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      subtitle: `${stats.activeProducts} active`,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      href: '/vendor/products',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} pending`,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      href: '/vendor/orders',
    },
    {
      title: 'Customer Reviews',
      value: stats.totalReviews,
      subtitle: `${stats.averageRating.toFixed(1)} avg rating`,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
      href: '/vendor/feedbacks',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black italic text-foreground">
            Vendor Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage your products, orders, and customer feedback
          </p>
        </div>
        <Link href="/vendor/products/add" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            <Package className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href} className="col-span-1">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-border group h-full">
                <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 lg:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0 lg:pt-0">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {loading ? '...' : stat.value}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                    {stat.subtitle}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-border">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link href="/vendor/products/add">
              <Button
                variant="outline"
                className="w-full justify-start hover:border-primary h-11 sm:h-10"
              >
                <Package className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
            <Link href="/vendor/products">
              <Button
                variant="outline"
                className="w-full justify-start hover:border-primary h-11 sm:h-10"
              >
                <Package className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
            </Link>
            <Link href="/vendor/orders">
              <Button
                variant="outline"
                className="w-full justify-start hover:border-primary h-11 sm:h-10"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Orders
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
