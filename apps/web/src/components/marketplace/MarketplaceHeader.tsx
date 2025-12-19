import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export const MarketplaceHeader = () => {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-black/40" />
        <input
          type="text"
          placeholder="Search sculptures, artists, or styles..."
          className="w-full h-14 pl-14 pr-6 rounded-full border-2 border-primary/10 bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-neutral-black placeholder:text-neutral-black/40 font-medium shadow-sm"
        />
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'New Arrivals', 'Popular', 'Price: Low to High', 'Price: High to Low'].map(
          (option, i) => (
            <motion.button
              key={option}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                i === 0
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white text-neutral-black border-2 border-primary/10 hover:border-primary/30'
              }`}
            >
              {option}
            </motion.button>
          ),
        )}
      </div>
    </div>
  );
};
