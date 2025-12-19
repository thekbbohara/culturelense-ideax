import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Slider } from '../ui/slider';

export const FilterSidebar = () => {
  return (
    <div className="bg-white rounded-3xl border border-primary/10 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          Filters
        </h3>
        <Button variant="link" className="text-primary text-sm font-bold p-0 h-auto">
          Clear All
        </Button>
      </div>

      <div className="space-y-6">
        {/* Category */}
        <div>
          <h4 className="font-bold text-sm text-neutral-black mb-3 uppercase tracking-wider">
            Category
          </h4>
          <div className="space-y-2">
            {['All', 'Traditional', 'Modern', 'Abstract', 'Religious'].map((cat) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-2 border-primary/20 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm text-neutral-black/70 group-hover:text-primary transition-colors font-medium">
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Separator className="bg-primary/10" />

        {/* Price Range */}
        <div>
          <h4 className="font-bold text-sm text-neutral-black mb-3 uppercase tracking-wider">
            Price Range
          </h4>
          <div className="space-y-4">
            <Slider defaultValue={[200]} step={10} max={4000} />
          </div>
        </div>

        <Separator className="bg-primary/10" />

        {/* Availability */}
        <div>
          <h4 className="font-bold text-sm text-neutral-black mb-3 uppercase tracking-wider">
            Availability
          </h4>
          <div className="space-y-2">
            {['In Stock', 'Pre-Order', 'Coming Soon'].map((status) => (
              <label key={status} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-2 border-primary/20 text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                />
                <span className="text-sm text-neutral-black/70 group-hover:text-primary transition-colors font-medium">
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-full h-12 shadow-lg shadow-primary/30">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
