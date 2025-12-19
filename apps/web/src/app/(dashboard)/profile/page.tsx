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
} from '@/db';
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Subtle Grain Texture Overlay */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 container mx-auto pt-24 pb-20 px-6 max-w-6xl">
        {/* Header Section: Minimal & Editorial */}
        <div className="mb-16 border-b border-zinc-200 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Identity
            </span>
            <ProfileHeader
              userEmail={user?.email}
              className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900"
            />
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs font-mono text-zinc-400 mb-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="text-sm font-medium">Nepal, Kathmandu</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Vendor & Activity (8 cols) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Vendor Section: The "Statement Piece" */}
            <section className="relative overflow-hidden rounded-2xl bg-zinc-900 text-zinc-100 p-8 md:p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-900/10">
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <Package className="w-64 h-64 -rotate-12" />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Store className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                      {isVerifiedVendor ? 'Verified Merchant' : 'Merchant Status'}
                    </span>
                  </div>
                  <h2 className="text-3xl font-light max-w-lg leading-tight">
                    {isVerifiedVendor ? (
                      <span>
                        Manage{' '}
                        <span className="italic font-serif text-zinc-400">
                          {vendorData?.businessName}
                        </span>{' '}
                        inventory & analytics.
                      </span>
                    ) : vendorData ? (
                      `Application is currently ${vendorData.verificationStatus}.`
                    ) : (
                      <span>
                        Turn your artifacts into <br />
                        <span className="italic font-serif text-zinc-400">digital assets</span>.
                      </span>
                    )}
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  {isVerifiedVendor ? (
                    <Link href="/vendor">
                      <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 text-sm font-medium transition-transform active:scale-95">
                        Launch Dashboard
                      </Button>
                    </Link>
                  ) : (
                    !vendorData && (
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl inline-block">
                        <VendorApplicationModal triggerClassName="text-white hover:bg-white/10 px-6 py-4 rounded-xl transition-all" />
                      </div>
                    )
                  )}
                  {vendorData && !isVerifiedVendor && (
                    <div className="px-4 py-2 border border-zinc-700 rounded-full text-xs font-mono uppercase tracking-widest text-zinc-300">
                      {vendorData.verificationStatus}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Recent Orders: Clean List Layout */}
            <section>
              <div className="flex items-baseline justify-between mb-6">
                <h3 className="text-xl font-light flex items-center gap-2">
                  Acquisitions
                  <span className="text-xs align-top bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-mono">
                    {recentOrders.length}
                  </span>
                </h3>
                <Link
                  href="/orders"
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                  View Full History <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-sm">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, i) => (
                    <div
                      key={order.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-300">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-zinc-800 group-hover:translate-x-1 transition-transform duration-300">
                            {order.item}
                          </div>
                          <div className="text-xs font-mono text-zinc-400 mt-1 flex gap-2">
                            <span>{new Date(order.date).toLocaleDateString()}</span>
                            <span className="text-zinc-300">•</span>
                            <span>#{order.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 text-right">
                        <div className="font-serif italic text-lg">{order.price}</div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-green-600/80">
                          {order.status}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-zinc-400 font-light">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-20" />
                    <p>No recent acquisitions recorded.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Stats & Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Stat Block - Unique Visual */}
            <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-zinc-400 mb-6">
                  <Fingerprint className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest">Total Scans</span>
                </div>
                <div className="text-7xl font-light tracking-tighter text-zinc-900">
                  {totalScans.toString().padStart(2, '0')}
                </div>
                <div className="mt-4 text-xs text-zinc-400 font-medium">
                  Artifact interactions lifetime
                </div>
              </div>
            </div>

            {/* Preferences Wrapper - Styling the passed component */}
            {user && (
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-2">
                <div className="px-6 py-4 border-b border-zinc-50">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                    Preferences
                  </h3>
                </div>
                <div className="p-4">
                  {/* Assuming UserPreferences accepts a className or handles its own generic styling. 
                                        We wrap it to constrain it to our clean design. */}
                  <UserPreferences userId={user.id} preferences={preferencesData} />
                </div>
              </div>
            )}

            {/* Minimal Footer / Legal */}
            <div className="pt-8 border-t border-zinc-200">
              <div className="flex items-center gap-2 mb-4 text-zinc-900">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-serif italic">CultureLense Promise</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Authenticity is the cornerstone of our platform. Every artifact is verified via our
                proprietary provenance tracking system.
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-zinc-400">
                <span className="cursor-pointer hover:text-zinc-900 transition-colors">
                  Agreements
                </span>
                <span className="cursor-pointer hover:text-zinc-900 transition-colors">
                  Privacy
                </span>
                <span className="cursor-pointer hover:text-zinc-900 transition-colors">
                  Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
