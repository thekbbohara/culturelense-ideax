'use client';

import { Card, CardContent, Button } from "@/components/ui-components";
import { updateVendorStatus } from "@/actions/admin";
import { useState } from "react";
import { Check, X, Building2 } from "lucide-react";

interface Vendor {
    id: string;
    businessName: string;
    description: string | null;
    appliedAt: Date;
    userEmail: string | null;
}

export function VendorTable({ vendors }: { vendors: Vendor[] }) {
    const [processing, setProcessing] = useState<string | null>(null);

    const handleAction = async (id: string, action: 'verified' | 'rejected') => {
        setProcessing(id);
        await updateVendorStatus(id, action);
        setProcessing(null);
    };

    if (vendors.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No pending vendor applications.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <div className="p-6 border-b">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Pending Applications
                </h3>
            </div>
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Business</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Owner</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Description</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {vendors.map((vendor) => (
                            <tr key={vendor.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle font-medium">{vendor.businessName}</td>
                                <td className="p-4 align-middle">{vendor.userEmail || 'Unknown'}</td>
                                <td className="p-4 align-middle max-w-[200px] truncate" title={vendor.description || ''}>{vendor.description}</td>
                                <td className="p-4 align-middle">{new Date(vendor.appliedAt).toLocaleDateString()}</td>
                                <td className="p-4 align-middle text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                            disabled={!!processing}
                                            onClick={() => handleAction(vendor.id, 'verified')}
                                        >
                                            <Check className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive hover:text-destructive hover:bg-red-50 border-red-200"
                                            disabled={!!processing}
                                            onClick={() => handleAction(vendor.id, 'rejected')}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
