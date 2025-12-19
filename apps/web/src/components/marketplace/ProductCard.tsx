import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import Link from 'next/link';

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
  isNew,
}) => {
  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="group"
    >
      <Link href={`/marketplace/${id}`}>
        <Card className="relative overflow-hidden border-none bg-white shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-neutral-white to-primary/5">
            {isNew && (
              <Badge className="absolute top-4 left-4 z-10 bg-primary text-white border-none px-3 py-1.5 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-wider">New</span>
              </Badge>
            )}

            {/* Wishlist Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm text-neutral-black opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-primary hover:bg-white shadow-lg flex items-center justify-center"
            >
              <Heart className="w-4 h-4" />
            </motion.button>

            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Quick View Button */}
            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold shadow-xl transform active:scale-95 transition-all h-12 rounded-full">
                <Eye className="w-4 h-4 mr-2" />
                Quick View
              </Button>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-6">
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-neutral-black text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-neutral-black/60 font-medium">{artist}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-black/5">
                <span className="font-black text-2xl text-primary">${price.toLocaleString()}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
