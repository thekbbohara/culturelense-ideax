'use client';

import React from 'react';
import { FeedbackForm } from '@/components/marketplace/FeedbackForm';
import { ReviewsList } from '@/components/marketplace/ReviewsList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { getListingById, getSimilarListingsByTitle } from '@/actions/marketplace';
import { ShoppingCart, Heart, Share2, Shield, Award, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  artist?: string | null;
  isNew?: boolean;
  category?: string;
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const res = await getListingById(params.id);

      if (res.success && res.data) {
        const item = res.data;
        const mappedProduct: Product = {
          ...item,
          price: parseFloat(item.price) || 0,
          isNew:
            new Date().getTime() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
        };
        setProduct(mappedProduct);

        // Fetch similar products by title
        const similarRes = await getSimilarListingsByTitle(item.title, item.id);
        if (similarRes.success && similarRes.data) {
          setSimilarProducts(
            similarRes.data.map((p: any) => ({
              ...p,
              price: parseFloat(p.price) || 0,
              isNew:
                new Date().getTime() - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000,
            })),
          );
        }
      } else {
        setError(res.error || 'Product not found');
      }
      setIsLoading(false);
    };

    fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium text-lg">
            Loading masterpiece details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-12 h-12 text-primary opacity-50" />
          </div>
          <h1 className="text-3xl font-serif font-black italic text-neutral-black">
            {error || 'Masterpiece Not Found'}
          </h1>
          <p className="text-neutral-black/60">
            We couldn't find the sculpture you're looking for. It may have been moved or is no
            longer available.
          </p>
          <Button size="lg" className="w-full rounded-full" asChild>
            <a href="/marketplace">Return to Marketplace</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-white via-neutral-white to-primary/5">
      {/* Hero Section with Breadcrumb */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm">
            <a
              href="/marketplace"
              className="text-neutral-black/60 hover:text-primary transition-colors font-medium"
            >
              Marketplace
            </a>
            <span className="text-neutral-black/30">/</span>
            <span className="text-primary font-semibold">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image - Sticky */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="sticky top-24">
              <div className="relative aspect-1/2 bg-gradient-to-br from-neutral-white to-primary/10 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 group">
                {product.isNew && (
                  <Badge className="absolute top-6 left-6 z-10 bg-primary text-white px-4 py-2 shadow-lg border-none">
                    <span className="text-xs font-black uppercase tracking-wider">New Arrival</span>
                  </Badge>
                )}
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Title & Artist */}
            <div>
              <h1 className="text-5xl font-serif font-black italic text-neutral-black mb-3 leading-tight">
                {product.title}
              </h1>
              <p className="text-2xl text-neutral-black/60 font-medium">
                by {product.artist || 'Unknown Artist'}
              </p>
            </div>

            {/* Price & Status */}
            <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/10">
              <div>
                <p className="text-sm text-neutral-black/50 font-medium uppercase tracking-wider mb-1">
                  Price
                </p>
                <span className="text-4xl font-black text-primary">
                  Rs. {product.price.toLocaleString()}
                </span>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <Badge className="bg-green-500/10 text-green-700 border-green-200 px-4 py-2">
                <span className="font-bold">In Stock</span>
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 h-14 text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 rounded-full"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 aspect-square p-0 rounded-full border-2 border-primary/20 hover:bg-primary/10 hover:border-primary"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 aspect-square p-0 rounded-full border-2 border-primary/20 hover:bg-primary/10 hover:border-primary"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Separator className="bg-primary/10" />

            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-bold text-neutral-black mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Description
              </h3>
              <p className="text-neutral-black/70 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Shield, label: 'Authenticated', desc: 'AI Verified' },
                { icon: Award, label: 'Premium', desc: 'Quality' },
                { icon: TrendingUp, label: 'Investment', desc: 'Grade' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-4 bg-white rounded-2xl border border-primary/10 text-center hover:border-primary/30 transition-all"
                >
                  <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs font-bold text-neutral-black">{feature.label}</p>
                  <p className="text-[10px] text-neutral-black/50">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Authenticity Badge */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-2xl border border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-black mb-1">Authenticity Guaranteed</h4>
                  <p className="text-sm text-neutral-black/70">
                    Every item on CultureLense is verified by our team of experts and advanced AI
                    analysis tools.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="bg-primary/10" />

            {/* Ratings & Feedback Section */}
            <div className="space-y-8">
              <h3 className="text-2xl font-serif font-black italic text-neutral-black">
                Ratings & Feedback
              </h3>

              {/* Existing Reviews */}
              <ReviewsList />

              {/* Feedback Form */}
              <div>
                <h4 className="text-xl font-bold text-neutral-black mb-4">Write a Review</h4>
                <FeedbackForm />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Similar Products */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h2 className="text-3xl font-serif font-black italic text-neutral-black">
              You Might Also Like
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProducts.length > 0 ? (
              similarProducts.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative group max-h-[400px]"
                >
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    artist={item.artist || 'Culture Lense Artist'}
                    price={item.price}
                    imageUrl={item.imageUrl}
                    isNew={item.isNew}
                    className="h-full w-full"
                  />
                </motion.div>
              ))
            ) : (
              <p>No similar products found.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
