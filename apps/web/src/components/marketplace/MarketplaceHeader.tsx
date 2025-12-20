import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface MarketplaceHeaderProps {
  selectedSort: string;
  onSortChange: (sort: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}

export const MarketplaceHeader = ({
  selectedSort,
  onSortChange,
  search,
  onSearchChange,
  onSearchSubmit,
}: MarketplaceHeaderProps) => {
  const sortOptions = [
    'All',
    'New Arrivals',
    'Popular',
    'Price: Low to High',
    'Price: High to Low',
  ];

  return (
    <div>
      <div className="space-y-6 static top-24">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
            placeholder="Search sculptures, artists, or styles..."
            className="w-full h-14 pl-14 pr-6 rounded-full border-2 border-border bg-card focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground font-medium shadow-sm"
          />
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {sortOptions.map((option) => (
            <motion.button
              key={option}
              onClick={() => onSortChange(option)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                selectedSort === option
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-card text-muted-foreground border-2 border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
