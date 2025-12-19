import { createClient } from '@/lib/supabase/server';
import { VendorApplicationModal } from '@/components/vendor-application-modal';
import { Button } from '@/components/ui-components';
import { ProfileHeader } from '@/components/profile-header';
import {
    ArrowUpRight,
    Package,
    Clock,
    ShieldCheck,
    Fingerprint,
    Store,
    Sparkles,
} from 'lucide-react';
import {
    db,
    vendors,
    purchases,
    contentItems,
    scanHistory,
    userPreferences,
    eq,
    count,
    desc,
    users,
} from '@/db';
import Link from 'next/link';
import { ProfileSettings } from '@/components/profile-settings';

export default async function ProfilePage() {
    let user = null;
    let fullUserData = null;
    let vendorData = null;
    let preferencesData = null;
    let recentOrders: any[] = [];
    let totalScans = 0;

    try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;

        if (user) {
            fullUserData = await db.query.users.findFirst({
                where: eq(users.id, user.id),
            });

            vendorData = await db.query.vendors.findFirst({
                where: eq(vendors.userId, user.id),
            });

            preferencesData =
                (await db.query.userPreferences.findFirst({
                    where: eq(userPreferences.userId, user.id),
                })) || null;

            recentOrders = await db
                .select({
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

            const [scanResult] = await db
                .select({ value: count() })
                .from(scanHistory)
                .where(eq(scanHistory.userId, user.id));
            totalScans = scanResult?.value || 0;
        }
    } catch (e) {
        console.error('Data fetch failed:', e);
    }

    const isVerifiedVendor = vendorData?.verificationStatus === 'verified';
    const isAdmin = fullUserData?.role === 'admin';

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            {/* Subtle Grain Texture Overlay */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            <div className="relative z-10 container mx-auto pt-16 pb-32 px-6 max-w-7xl">
                {/* Header Section: Minimal & Editorial */}
                <div className="mb-16 border-b flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-2">
                        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Identity</span>
                        <ProfileHeader
                            userEmail={user?.email}
                            memberSince={user?.created_at}
                            className="text-4xl md:text-5xl font-light tracking-tight text-foreground"
                        />
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-mono text-muted-foreground mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                        <div className="text-sm font-medium">Nepal, Kathmandu</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Vendor & Activity (8 cols) */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Vendor Section: The "Statement Piece" */}
                        <section className="relative overflow-hidden rounded-2xl bg-foreground text-background p-8 md:p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-foreground/10">
                            <div className="absolute top-0 right-0 p-12 opacity-5">
                                <Package className="w-64 h-64 -rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-muted-foreground/80">
                                        <Store className="w-4 h-4" />
                                        <span className="text-xs font-mono uppercase tracking-wider">
                                            {isAdmin ? 'Platform Administration' : isVerifiedVendor ? 'Verified Merchant' : 'Merchant Status'}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-light max-w-lg leading-tight">
                                        {isAdmin ? (
                                            <span>Review pending <span className="italic font-serif text-muted-foreground">vendor applications</span> and manage users.</span>
                                        ) : isVerifiedVendor ? (
                                            <span>Manage <span className="italic font-serif text-muted-foreground">{vendorData?.businessName}</span> inventory & analytics.</span>
                                        ) : (
                                            <span>Turn your artifacts into <br /><span className="italic font-serif text-muted-foreground">digital assets</span>.</span>
                                        )}
                                    </h2>
                                </div>

                                <div className="flex items-center gap-4">
                                    {isAdmin ? (
                                        <Link href="/admin/applications">
                                            <Button className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-8 py-6 text-sm font-medium transition-transform active:scale-95 border-none">
                                                Vendor Applications
                                            </Button>
                                        </Link>
                                    ) : isVerifiedVendor ? (
                                        <Link href="/vendor/dashboard">
                                            <Button className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-8 py-6 text-sm font-medium transition-transform active:scale-95 border-none">
                                                Manage Store
                                            </Button>
                                        </Link>
                                    ) : (
                                        !vendorData ? (
                                            <div className="bg-background/10 backdrop-blur-sm rounded-xl inline-block">
                                                <VendorApplicationModal triggerClassName="bg-primary text-primary-foreground hover:bg-primary/80  rounded-full px-8 py-6 text-sm font-medium transition-transform active:scale-95 border-none" triggerText="Apply for Vendor" />
                                            </div>
                                        ) : (
                                            <div className="px-4 py-2 border border-muted-foreground/30 rounded-full text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                                Application {vendorData.verificationStatus}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Recent Orders: Clean List Layout */}
                        <section>
                            <div className="flex items-baseline justify-between mb-6">
                                <h3 className="text-xl font-light flex items-center gap-2">
                                    Acquisitions
                                    <span className="text-xs align-top bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">{recentOrders.length}</span>
                                </h3>
                                <Link href="/orders" className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                                    View Full History <ArrowUpRight className="w-3 h-3" />
                                </Link>
                            </div>

                            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order, i) => (
                                        <div key={order.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground group-hover:translate-x-1 transition-transform duration-300">{order.item}</div>
                                                    <div className="text-xs font-mono text-muted-foreground mt-1 flex gap-2">
                                                        <span>{new Date(order.date).toLocaleDateString()}</span>
                                                        <span className="text-border">•</span>
                                                        <span>#{order.id.slice(0, 8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 sm:mt-0 text-right">
                                                <div className="font-serif italic text-lg">{order.price}</div>
                                                <div className="text-[10px] uppercase tracking-widest font-bold text-green-600/80">{order.status}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 text-center text-muted-foreground font-light">
                                        <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-20" />
                                        <p>No recent acquisitions recorded.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Stats & Settings (4 cols) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* NEW: Profile Settings Block */}
                        {user && (
                            <ProfileSettings
                                userId={user.id}
                                initialPreferences={preferencesData}
                            />
                        )}

                        {/* Stat Block */}
                        <div className="bg-card p-8 rounded-2xl border shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-muted rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-muted-foreground mb-6">
                                    <Fingerprint className="w-4 h-4" />
                                    <span className="text-xs font-mono uppercase tracking-widest">Total Scans</span>
                                </div>
                                <div className="text-7xl font-light tracking-tighter text-foreground">
                                    {totalScans.toString().padStart(2, '0')}
                                </div>
                                <div className="mt-4 text-xs text-muted-foreground font-medium">
                                    Artifact interactions lifetime
                                </div>
                            </div>
                        </div>

                        {/* Minimal Footer / Legal */}
                        <div className="pt-8 border-t">
                            <div className="flex items-center gap-2 mb-4 text-foreground">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="font-serif italic">CultureLense Promise</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                                Authenticity is the cornerstone of our platform. Every artifact is verified via our proprietary provenance tracking system.
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
                                <span className="cursor-pointer hover:text-foreground transition-colors">Agreements</span>
                                <span className="cursor-pointer hover:text-foreground transition-colors">Privacy</span>
                                <span className="cursor-pointer hover:text-foreground transition-colors">Support</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
