'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Star, ThumbsUp, VerifiedIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReviews } from '@/actions/marketplace';
import { Button } from '@/components/ui/button';

interface Review {
  id: string;
  userName: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  verified?: boolean;
  helpful?: number;
}

interface ReviewsListProps {
  listingId: string;
}

export const ReviewsList = ({ listingId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchReviews = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (pageNum === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      try {
        const res = await getReviews(listingId, pageNum, 5);
        if (res.success && res.data) {
          const validatedData: Review[] = res.data.map((r: any) => ({
            ...r,
            rating: parseInt(r.rating) || 0,
          }));

          if (append) {
            setReviews((prev) => [...prev, ...validatedData]);
          } else {
            setReviews(validatedData);
          }

          setTotal(res.total || 0);
          setHasMore(pageNum < (res.totalPages || 0));
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [listingId],
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleSeeMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, true);
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  if (isLoading && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-end gap-3 justify-center md:justify-start mb-4">
              <span className="text-6xl font-black text-primary">{averageRating}</span>
              <div className="pb-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(parseFloat(averageRating))
                          ? 'text-secondary fill-secondary'
                          : 'text-neutral-black/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-neutral-black/60 font-medium">
                  Based on {total} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-black/70 w-12">{stars} star</span>
                <div className="flex-1 h-2 bg-neutral-black/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-neutral-black/50 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-neutral-black">Customer Reviews</h3>

        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
          {reviews.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-2xl p-6 border border-primary/10 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {review.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-neutral-black">
                              {review.userName?.split('@')[0] || 'Anonymous'}
                            </h4>
                            {review.verified && (
                              <div className="flex items-center gap-1 text-green-600">
                                <VerifiedIcon className="w-4 h-4 fill-current" />
                                <span className="text-xs font-medium">Verified Purchase</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-secondary fill-secondary'
                                      : 'text-neutral-black/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-neutral-black/50">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-neutral-black/70 leading-relaxed">{review.comment}</p>

                      {/* Footer */}
                      <div className="flex items-center gap-4 pt-2">
                        <button className="flex items-center gap-2 text-sm text-neutral-black/60 hover:text-primary transition-colors group">
                          <ThumbsUp className="w-4 h-4 group-hover:fill-current" />
                          <span className="font-medium">Helpful ({review.helpful || 0})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed border-primary/10">
              <p className="text-neutral-black/40 font-medium">
                No reviews yet. Be the first to share your thoughts!
              </p>
            </div>
          )}
        </div>

        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleSeeMore}
              disabled={isFetchingMore}
              className="rounded-full px-8 h-12 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all font-bold"
            >
              {isFetchingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'See More Reviews'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
