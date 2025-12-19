import { getAdminStats, getPendingVendors, getAllTransactions } from "@/actions/admin";
import { AdminStats } from "@/components/admin/admin-stats";
import { VendorTable } from "@/components/admin/vendor-table";
import { TransactionTable } from "@/components/admin/transaction-table";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AdminPage() {
    const stats = await getAdminStats();
    const pendingVendors = await getPendingVendors();
    const transactions = await getAllTransactions();

    return (
        <div className="min-h-screen bg-muted/10 pb-20">
            <header className="bg-background border-b sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold font-serif tracking-tight">CultureLense Admin</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline">Administrator</span>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Stats Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">Overview</h2>
                    <AdminStats stats={stats} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Vendors Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Vendor Requests</h2>
                        <VendorTable vendors={pendingVendors} />
                    </section>

                    {/* Recent Transactions Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Live Transactions</h2>
                        <TransactionTable transactions={transactions} />
                    </section>
                </div>
            </main>
        </div>
    );
}
