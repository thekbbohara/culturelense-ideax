'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button, Card, CardContent } from '@/components/ui-components';
import { submitVendorApplication } from '@/actions/vendor';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface VendorApplicationModalProps {
  triggerClassName?: string;
  triggerText?: string;
  variant?: 'default' | 'outline' | 'link' | 'ghost';
}

export function VendorApplicationModal({
  triggerClassName,
  triggerText = 'Apply for Vendor',
  variant = 'default',
}: VendorApplicationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we only use portal on client
  useEffect(() => {
    setMounted(true);
  }, []);

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
      toast.error(error.message || 'An unexpected error occurred.');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutate(formData);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{ margin: 0, padding: '1rem' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ width: '100%', maxWidth: '32rem' }}
          >
            <Card className="w-full relative bg-background border shadow-lg rounded-xl">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
              <div className="p-6 pb-4">
                <h2 className="text-lg font-semibold leading-none tracking-tight">
                  Vendor Application
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Start selling your cultural artifacts. Tell us about your business.
                </p>
              </div>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="businessName" className="text-sm font-medium leading-none">
                      Business Name
                    </label>
                    <input
                      required
                      name="businessName"
                      id="businessName"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="My Cultural Store"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium leading-none">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
  );

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className={triggerClassName} variant={variant}>
        {triggerText}
      </Button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
