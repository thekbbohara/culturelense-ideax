'use client';

import React, { useEffect, useState } from 'react';
import { getRecentListings } from '@/actions/marketplace';

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    getRecentListings().then(res => {
        if (res.success) setItems(res.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
      </header>
      
      <div className="p-4 grid grid-cols-2 gap-4">
        {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-32 bg-gray-200">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover"/>
                </div>
                <div className="p-3">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{item.title}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                        <span className="font-bold text-gray-900">${item.price}</span>
                    </div>
                </div>
            </div>
        ))}
        {items.length === 0 && (
            <div className="col-span-2 text-center text-gray-400 py-10">
                No listings found yet. Be the first vendor!
            </div>
        )}
      </div>
    </div>
  );
}
