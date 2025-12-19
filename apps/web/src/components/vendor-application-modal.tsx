'use client';

import { useState } from 'react';
import { Button, Card, CardContent } from '@/components/ui-components';
import { submitVendorApplication } from '@/actions/vendor';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function VendorApplicationModal({ triggerClassName }: { triggerClassName?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        const formData = new FormData(e.currentTarget);
        try {
            const result = await submitVendorApplication(null, formData);

            if (result.error) {
                setStatus('error');
                setMessage(result.error);
            } else {
                setStatus('success');
                setMessage(result.message || 'Application submitted!');
                setTimeout(() => {
                    setIsOpen(false);
                    setStatus('idle');
                }, 2000);
            }
        } catch (e) {
            setStatus('error');
            setMessage("An unexpected error occurred.");
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className={triggerClassName}>Apply for Vendor</Button>

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

                                        {message && (
                                            <div className={`text-sm ${status === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                                                {message}
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={status === 'submitting'}>
                                                {status === 'submitting' ? 'Submitting...' : 'Submit Application'}
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
