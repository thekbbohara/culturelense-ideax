import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  artist?: string;
  isNew?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  quantity,
  imageUrl,
  artist,
  isNew,
  className,
}) => {
  const dispatch = useAppDispatch();
  const isInWishlist = useAppSelector((state) =>
    state.wishlist.items.some((item) => item.id === id),
  );

  const cartItems = useAppSelector((state) => state.cart.items);
  const existingCartItem = cartItems.find((item) => item.id === id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (quantity === 0) {
      toast.error('This item is out of stock');
      return;
    }

    if (existingCartItem && existingCartItem.quantity >= quantity) {
      toast.warning(`You've reached the maximum available quantity (${quantity})`);
      return;
    }

    dispatch(
      addItem({
        id,
        title,
        price,
        imageUrl,
        availableQuantity: quantity,
        artist: artist || 'Culture Lense Artist',
      }),
    );
    toast.success('Added to cart');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      toggleWishlist({
        id,
        title,
        price,
        imageUrl,
        availableQuantity: quantity,
        artist: artist || 'Culture Lense Artist',
      }),
    );
    if (!isInWishlist) {
      toast.success('Added to wishlist');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -12 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('group', className)}
    >
      <Link href={`/marketplace/${id}`} className="inline-block h-full w-full">
        <Card className="relative flex flex-col h-full overflow-hidden border-none bg-card shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-3xl">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {isNew && (
              <Badge className="absolute top-4 left-4 z-10 bg-primary text-white border-none px-3 py-1.5 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-wider">New</span>
              </Badge>
            )}

            {/* Wishlist Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              className={cn(
                'absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm transition-all duration-300 shadow-lg flex items-center justify-center hover:bg-card',
                isInWishlist
                  ? 'text-red-500 opacity-100'
                  : 'text-foreground opacity-0 group-hover:opacity-100 hover:text-primary',
              )}
            >
              <Heart className={cn('w-4 h-4', isInWishlist && 'fill-current')} />
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
              <Button className="w-full bg-card text-primary hover:bg-card/90 font-bold shadow-xl transform active:scale-95 transition-all h-12 rounded-full">
                <Eye className="w-4 h-4 mr-2" />
                Quick View
              </Button>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-6">
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {artist && <p className="text-sm text-muted-foreground font-medium">{artist}</p>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-black text-2xl text-primary">
                  Rs.{price.toLocaleString()}
                </span>
                <motion.button
                  whileHover={quantity > 0 ? { scale: 1.05 } : {}}
                  whileTap={quantity > 0 ? { scale: 0.95 } : {}}
                  onClick={handleAddToCart}
                  disabled={quantity === 0}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    quantity > 0
                      ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                      : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
                  )}
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
