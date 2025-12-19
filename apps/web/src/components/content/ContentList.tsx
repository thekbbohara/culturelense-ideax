import React, { useState } from 'react';
import { Button } from '@culturelense/ui';
import { purchaseContent } from '@/actions/content';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  price: string;
  type: string;
  isPremium: boolean;
}

interface ContentListProps {
  entityId: string;
  items: ContentItem[];
  userId: string; // In a real app, this comes from context/auth
}

export const ContentList: React.FC<ContentListProps> = ({ items, userId }) => {
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBuy = async (itemId: string) => {
    setLoadingId(itemId);
    const result = await purchaseContent(userId, itemId);
    if (result.success) {
        setPurchasedIds(prev => new Set(prev).add(itemId));
    } else {
        alert('Purchase failed');
    }
    setLoadingId(null);
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-yellow-500 mb-4">Premium Knowledge</h3>
      <div className="space-y-4">
        {items.map(item => {
            const isUnlocked = !item.isPremium || purchasedIds.has(item.id);
            return (
                <div key={item.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2">
                             <span className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded capitalize">{item.type}</span>
                             <h4 className="font-semibold text-white">{item.title}</h4>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                    </div>
                    <div>
                        {isUnlocked ? (
                            <Button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                                Access
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => handleBuy(item.id)}
                                disabled={loadingId === item.id}
                                className="bg-yellow-600 text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1"
                            >
                                {loadingId === item.id ? '...' : `Buy $${item.price}`}
                            </Button>
                        )}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};
