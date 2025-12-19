import { Card, CardContent } from "@/components/ui-components";
import { Users, Store, Clock, DollarSign } from "lucide-react";

interface AdminStatsProps {
    stats: {
        totalUsers: number;
        totalVendors: number;
        pendingVendors: number;
        totalSales: number;
    }
}

export function AdminStats({ stats }: AdminStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardContent className="p-6 flex items-center justify-between space-y-0">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                        <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 flex items-center justify-between space-y-0">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                        <h3 className="text-2xl font-bold">{stats.totalVendors}</h3>
                    </div>
                    <Store className="h-4 w-4 text-muted-foreground" />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 flex items-center justify-between space-y-0">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                        <h3 className="text-2xl font-bold text-orange-600">{stats.pendingVendors}</h3>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 flex items-center justify-between space-y-0">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Sales (Count)</p>
                        <h3 className="text-2xl font-bold">{stats.totalSales}</h3>
                    </div>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardContent>
            </Card>
        </div>
    );
}
