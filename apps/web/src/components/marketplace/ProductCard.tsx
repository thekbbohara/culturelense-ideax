import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  artist: string;
  price: number;
  imageUrl: string;
  isNew?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  artist,
  price,
  imageUrl,
  isNew
}) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="group relative overflow-hidden border-none bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
           {isNew && (
            <Badge className="absolute top-3 left-3 z-10 bg-black text-white hover:bg-black/90">
              New Arrival
            </Badge>
          )}
          <button className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-red-500 hover:bg-white">
            <Heart className="w-4 h-4" />
          </button>
          
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
             <Button className="w-full bg-white text-black hover:bg-gray-100 font-medium shadow-lg transform active:scale-95 transition-all">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
             </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-1">
            <div>
                <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">{title}</h3>
                <p className="text-sm text-gray-500">{artist}</p>
            </div>
            <span className="font-bold text-lg text-gray-900">${price.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
