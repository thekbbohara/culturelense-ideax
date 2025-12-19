import { Card } from "@/components/ui-components";
import { Receipt } from "lucide-react";

interface Transaction {
    id: string;
    userEmail: string | null;
    itemTitle: string | null;
    price: string | null;
    status: string;
    date: Date;
}

export function TransactionTable({ transactions }: { transactions: Transaction[] }) {
    if (transactions.length === 0) {
        return (
            <Card className="p-8 text-center text-muted-foreground">
                No recent transactions found.
            </Card>
        );
    }

    return (
        <Card>
            <div className="p-6 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Receipt className="w-5 h-5" /> Recent Transactions
                </h3>
            </div>
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Item</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Buyer</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle font-medium">{tx.itemTitle || 'Unknown Item'}</td>
                                <td className="p-4 align-middle">{tx.userEmail || 'Guest'}</td>
                                <td className="p-4 align-middle font-bold">{tx.price}</td>
                                <td className="p-4 align-middle">
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 capitalize">
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="p-4 align-middle text-right text-muted-foreground">
                                    {new Date(tx.date).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
