import { Card, CardContent } from '@/components/ui-components';
import { Users, Store, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalVendors: number;
    pendingVendors: number;
    totalSales: number;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="flex overflow-x-auto pb-4 gap-4 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4 md:pb-0 md:overflow-visible no-scrollbar snap-x snap-mandatory">
      <Card className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 flex-shrink-0 snap-center overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground">{stats.totalUsers}</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">Total Users</p>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 flex-shrink-0 snap-center overflow-hidden border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Store className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-muted text-muted-foreground rounded-full">
              Active
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground">{stats.totalVendors}</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">Verified Vendors</p>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 flex-shrink-0 snap-center overflow-hidden border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all relative">
        {stats.pendingVendors > 0 && (
          <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-red-500 animate-pulse ring-4 ring-white dark:ring-background" />
        )}
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            {stats.pendingVendors > 0 ? (
              <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Action Needed
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                All Clear
              </span>
            )}
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground">{stats.pendingVendors}</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">Pending Requests</p>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-[85vw] sm:min-w-[300px] md:min-w-0 flex-shrink-0 snap-center overflow-hidden border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5%
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground">{stats.totalSales}</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">Total Sales</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
