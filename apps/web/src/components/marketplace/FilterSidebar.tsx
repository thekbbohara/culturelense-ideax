import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export const FilterSidebar = () => {
  return (
    <div className="w-full lg:w-64 space-y-8">
      <div className="flex items-center justify-between lg:hidden mb-4">
        <h2 className="text-lg font-bold">Filters</h2>
         <Button variant="outline" size="sm">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filter
         </Button>
      </div>

      <div className="hidden lg:block space-y-8">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Categories</h3>
          <ul className="space-y-3">
            {['All Sculptures', 'Modern', 'Classical', 'Abstract', 'Bronze', 'Marble'].map((category, i) => (
              <li key={category}>
                <button className={`text-sm ${i === 0 ? 'font-semibold text-black' : 'text-gray-600 hover:text-black'} transition-colors`}>
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <Separator />

        <div>
            <div className="flex items-center justify-between mb-4 group cursor-pointer">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Price Range</h3>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors"/>
            </div>
            <div className="space-y-3">
                 <label className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer hover:text-black">
                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                    <span>Under $100</span>
                 </label>
                 <label className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer hover:text-black">
                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                    <span>$100 - $500</span>
                 </label>
                 <label className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer hover:text-black">
                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                    <span>$500 - $1000</span>
                 </label>
                 <label className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer hover:text-black">
                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                    <span>Over $1000</span>
                 </label>
            </div>
        </div>

        <Separator />

        <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4">Availability</h3>
             <div className="space-y-3">
                 <label className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer hover:text-black">
                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" defaultChecked />
                    <span>In Stock</span>
                 </label>
                 <label className="flex items-center space-x-3 text-sm text-gray-600 cursor-pointer hover:text-black">
                    <input type="checkbox" className="rounded border-gray-300 text-black focus:ring-black" />
                    <span>Pre-order</span>
                 </label>
            </div>
        </div>
      </div>
    </div>
  );
};
