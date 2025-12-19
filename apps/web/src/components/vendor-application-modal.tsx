'use client';

import { useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui-components';
import { submitVendorApplication } from '@/actions/vendor';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface VendorApplicationModalProps {
    triggerClassName?: string;
    triggerText?: string;
    variant?: 'default' | 'outline' | 'link' | 'ghost'; // Add variant support
}

export function VendorApplicationModal({ triggerClassName, triggerText = "Apply for Vendor", variant = 'default' }: VendorApplicationModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await submitVendorApplication(null, formData);
            if (result?.error) {
                throw new Error(result.error);
            }
            return result;
        },
        onSuccess: (data) => {
            toast.success(data?.message || 'Application submitted!');
            setTimeout(() => {
                setIsOpen(false);
            }, 500);
        },
        onError: (error) => {
            toast.error(error.message || "An unexpected error occurred.");
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        mutate(formData);
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className={triggerClassName} variant={variant}>{triggerText}</Button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-lg p-4"
                        >
                            <Card className="w-full relative bg-background border shadow-lg">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </button>
                                <div className="p-6 pb-4">
                                    <h2 className="text-lg font-semibold leading-none tracking-tight">Vendor Application</h2>
                                    <p className="text-sm text-muted-foreground mt-1.5">
                                        Start selling your cultural artifacts. Tell us about your business.
                                    </p>
                                </div>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="businessName" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Business Name</label>
                                            <input
                                                required
                                                name="businessName"
                                                id="businessName"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="My Cultural Store"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Description</label>
                                            <textarea
                                                name="description"
                                                id="description"
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="We specialize in traditional..."
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={isPending}>
                                                {isPending ? 'Submitting...' : 'Submit Application'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
