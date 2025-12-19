import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export const MarketplaceHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Sculpture Marketplace
        </h1>
        <p className="text-gray-500 max-w-lg">
            Discover unique handcrafted sculptures from local artisans and master creators worldwide.
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div className="relative flex-1 sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search sculptures..." 
             className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
           />
        </div>
        <div className="flex items-center gap-2">
             <span className="text-sm text-gray-500 whitespace-nowrap hidden sm:block">Sort by:</span>
             <select className="bg-transparent text-sm font-semibold text-gray-900 border-none focus:ring-0 cursor-pointer py-2 pl-2 pr-8">
                <option>Most Popular</option>
                <option>Newest Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
             </select>
        </div>
      </div>
    </div>
  );
};
