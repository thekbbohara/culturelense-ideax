'use client';

import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

const MIN_PRICE = 0;
const MAX_PRICE = 10000;

export const FilterSidebar = () => {
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="font-bold text-sm text-foreground mb-3 uppercase tracking-wider">
          Category
        </h4>
        <div className="space-y-2">
          {['All', 'Traditional', 'Modern', 'Abstract', 'Religious'].map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-2 border-primary/20 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors font-medium">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Price Range with Shadcn Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">
            Price Range
          </h4>
          {/* <span className="text-xs font-bold text-primary">${priceRange[0].toLocaleString()}</span> */}
        </div>

        <div className="space-y-4">
          {/* Shadcn Slider */}
          <div className="pt-2 pb-4">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={10}
              className="w-full"
            />

            {/* Min/Max Labels */}
            <div className="flex justify-between mt-3">
              <span className="text-xs font-medium text-muted-foreground">
                ${priceRange[0].toLocaleString()}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                ${priceRange[1].toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Availability */}
      <div>
        <h4 className="font-bold text-sm text-foreground mb-3 uppercase tracking-wider">
          Availability
        </h4>
        <div className="space-y-2">
          {['In Stock', 'Pre-Order', 'Coming Soon'].map((status) => (
            <label key={status} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-2 border-primary/20 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer bg-background"
              />
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors font-medium">
                {status}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full h-12 shadow-lg shadow-primary/30">
        Apply Filters
      </Button>
    </div>
  );

  // Render mobile filter button and drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Filter Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Button
            onClick={() => setIsMobileFilterOpen(true)}
            className="w-full bg-card text-foreground border-2 border-border hover:bg-muted font-bold h-12 rounded-full shadow-sm"
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filters & Sort
          </Button>
        </motion.div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />

              {/* Drawer */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-card text-card-foreground rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-hidden"
              >
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <SlidersHorizontal className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Filters</h3>
                      <p className="text-xs text-muted-foreground">Refine your search</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="rounded-full hover:bg-muted"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div
                  className="overflow-y-auto px-6 py-6"
                  style={{ maxHeight: 'calc(85vh - 140px)' }}
                >
                  <FilterContent />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="bg-card text-card-foreground rounded-3xl border border-border p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          Filters
        </h3>
        <Button variant="link" className="text-primary text-sm font-bold p-0 h-auto">
          Clear All
        </Button>
      </div>
      <FilterContent />
    </div>
  );
};
