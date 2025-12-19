import { createClient } from '@/lib/supabase/server';
import { VendorApplicationModal } from '@/components/vendor-application-modal';
import { Card, CardContent, Button } from '@/components/ui-components';
import { ProfileHeader } from '@/components/profile-header';
import { Package, Clock, ShieldCheck, ChevronRight, ScanLine, Store } from 'lucide-react';
import { db, vendors, purchases, contentItems, scanHistory, userPreferences, eq, count, desc } from '@/db';
import { UserPreferences } from '@/components/user-preferences';
import Link from 'next/link';

export default async function ProfilePage() {
    let user = null;
    let vendorData = null;
    let preferencesData = null;
    let recentOrders: any[] = [];
    let totalScans = 0;

    try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;

        if (user) {
            // Fetch Vendor Status
            vendorData = await db.query.vendors.findFirst({
                where: eq(vendors.userId, user.id),
            });

            // Fetch User Preferences
            preferencesData = await db.query.userPreferences.findFirst({
                where: eq(userPreferences.userId, user.id),
            }) || null;

            // Fetch Purchases
            recentOrders = await db.select({
                id: purchases.id,
                date: purchases.createdAt,
                status: purchases.status,
                price: contentItems.price,
                item: contentItems.title,
            })
                .from(purchases)
                .innerJoin(contentItems, eq(purchases.contentItemId, contentItems.id))
                .where(eq(purchases.userId, user.id))
                .orderBy(desc(purchases.createdAt))
                .limit(5);

            // Fetch Scan Count
            const [scanResult] = await db.select({ value: count() })
                .from(scanHistory)
                .where(eq(scanHistory.userId, user.id));
            totalScans = scanResult?.value || 0;
        }

    } catch (e) {
        console.error("Data fetch failed:", e);
    }

    const isVerifiedVendor = vendorData?.verificationStatus === 'verified';

    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">

                <ProfileHeader userEmail={user?.email} />

                <div className="grid gap-8 md:grid-cols-3">

                    {/* Main Content Column */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Vendor Card */}
                        <Card className="border-none shadow-xl bg-gradient-to-r from-primary/5 to-transparent relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Package className="w-32 h-32 text-primary" />
                            </div>
                            <CardContent className="p-6 relative z-10 w-full">
                                <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                                    {vendorData ? 'Vendor Dashboard' : 'Become a Vendor'}
                                </h2>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    {isVerifiedVendor
                                        ? `Welcome back, ${vendorData?.businessName}. Manage your listings and orders.`
                                        : vendorData 
                                            ? `Your application is currently ${vendorData.verificationStatus}.`
                                            : 'Join our exclusive marketplace to sell authentic cultural artifacts. Identity verification required.'}
                                </p>
                                
                                {isVerifiedVendor ? (
                                    <Link href="/vendor/dashboard">
                                        <Button className="gap-2 w-full sm:w-auto">
                                            <Store className="w-4 h-4" /> Go to Store Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    !vendorData && <VendorApplicationModal />
                                )}

                                {vendorData && !isVerifiedVendor && (
                                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                                        {vendorData.verificationStatus}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Orders History */}
                        {recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-secondary" /> Recent History
                                </h3>
                                {recentOrders.map((order) => (
                                    <Card key={order.id} className="hover:bg-muted/30 transition-colors cursor-pointer group">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div>
                                                <div className="font-semibold group-hover:text-primary transition-colors">{order.item}</div>
                                                <div className="text-xs text-muted-foreground">{order.id} • {new Date(order.date).toLocaleDateString()}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">{order.price}</div>
                                                <div className="text-xs text-green-600 font-medium capitalize">{order.status}</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-muted/10 rounded-lg border border-dashed">
                                <p className="text-muted-foreground">No recent purchases found.</p>
                            </div>
                        )}

                        {/* Terms and Service Section */}
                        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-muted-foreground" /> Terms & Service
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                By using the CultureLense platform, you agree to our terms of service regarding the sale and purchase of cultural artifacts.
                                We verify authenticity for every high-value item listed.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-primary underline cursor-pointer">
                                <span>User Agreement</span>
                                <span>Privacy Policy</span>
                                <span>Vendor Guidelines</span>
                                <span>Refund Policy</span>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">My Activity</h3>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm p-2 hover:bg-muted rounded-md cursor-pointer transition-colors">
                                        <span className="flex items-center gap-2"><ScanLine className="w-4 h-4" /> Scans</span>
                                        <span className="text-muted-foreground font-mono">{totalScans}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Preferences Component */}
                        {user && (
                            <UserPreferences userId={user.id} preferences={preferencesData} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
