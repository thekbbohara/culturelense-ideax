'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Star, ThumbsUp, VerifiedIcon, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getReviews,
  deleteReview,
  toggleReviewLike,
  getReviewLikesCount,
  getUserLikedReviews,
} from '@/actions/marketplace';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  userId: string;
  userName: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  verified?: boolean;
}

interface ReviewsListProps {
  listingId: string;
  currentUserId?: string | null;
}

const INITIAL_LIMIT = 4;
const LOAD_MORE_LIMIT = 5;

export const ReviewsList = ({ listingId, currentUserId }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const offsetRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

  // Like states
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikedReviews, setUserLikedReviews] = useState<Set<string>>(new Set());
  const [likingReviewId, setLikingReviewId] = useState<string | null>(null);

  const fetchLikesData = useCallback(
    async (reviewIds: string[]) => {
      if (reviewIds.length === 0) return;

      // Fetch like counts
      const countsRes = await getReviewLikesCount(reviewIds);
      if (countsRes.success && countsRes.data) {
        setLikeCounts((prev) => ({ ...prev, ...countsRes.data }));
      }

      // Fetch user's liked reviews
      if (currentUserId) {
        const userLikesRes = await getUserLikedReviews(currentUserId, reviewIds);
        if (userLikesRes.success && userLikesRes.data) {
          setUserLikedReviews((prev) => new Set([...Array.from(prev), ...userLikesRes.data]));
        }
      }
    },
    [currentUserId],
  );

  const fetchReviews = useCallback(
    async (append: boolean = false) => {
      const limit = isFirstLoadRef.current ? INITIAL_LIMIT : LOAD_MORE_LIMIT;
      const offset = append ? offsetRef.current : 0;

      if (!append) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      try {
        // Pass offset directly to getReviews (offset-based pagination)
        const res = await getReviews(listingId, offset, limit);

        if (res.success && res.data) {
          const validatedData: Review[] = res.data.map((r: any) => ({
            ...r,
            rating: parseInt(r.rating) || 0,
          }));

          if (append) {
            setReviews((prev) => [...prev, ...validatedData]);
            offsetRef.current = offsetRef.current + validatedData.length;
          } else {
            setReviews(validatedData);
            offsetRef.current = validatedData.length;
          }

          setTotal(res.total || 0);

          // Calculate if there are more reviews to load
          const newOffset = append ? offsetRef.current : validatedData.length;
          setHasMore(newOffset < (res.total || 0));

          // Fetch likes data for these reviews
          const reviewIds = validatedData.map((r) => r.id);
          await fetchLikesData(reviewIds);

          isFirstLoadRef.current = false;
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [listingId, fetchLikesData],
  );

  // Set up Supabase Realtime subscription for likes
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`review_likes_${listingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'review_likes',
        },
        async (payload) => {
          // Refetch likes for all current reviews when there's a change
          const reviewIds = reviews.map((r) => r.id);
          if (reviewIds.length > 0) {
            const countsRes = await getReviewLikesCount(reviewIds);
            if (countsRes.success && countsRes.data) {
              setLikeCounts(countsRes.data);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId, reviews]);

  useEffect(() => {
    // Reset state when listingId changes
    offsetRef.current = 0;
    isFirstLoadRef.current = true;
    setReviews([]);
    setLikeCounts({});
    setUserLikedReviews(new Set());
    fetchReviews(false);
  }, [listingId, fetchReviews]);

  const handleSeeMore = () => {
    fetchReviews(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error('You must be logged in to delete a review');
      return;
    }

    setIsDeleting(reviewId);
    try {
      const res = await deleteReview(reviewId, currentUserId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setTotal((prev) => prev - 1);
        offsetRef.current = offsetRef.current - 1;
        toast.success('Review deleted successfully');
      } else {
        toast.error(res.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error('Please log in to like reviews');
      return;
    }

    setLikingReviewId(reviewId);

    // Optimistic update
    const wasLiked = userLikedReviews.has(reviewId);
    setUserLikedReviews((prev) => {
      const newSet = new Set(prev);
      if (wasLiked) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + (wasLiked ? -1 : 1),
    }));

    try {
      const res = await toggleReviewLike(reviewId, currentUserId);
      if (!res.success) {
        // Revert optimistic update on failure
        setUserLikedReviews((prev) => {
          const newSet = new Set(prev);
          if (wasLiked) {
            newSet.add(reviewId);
          } else {
            newSet.delete(reviewId);
          }
          return newSet;
        });
        setLikeCounts((prev) => ({
          ...prev,
          [reviewId]: (prev[reviewId] || 0) + (wasLiked ? 1 : -1),
        }));
        toast.error(res.error || 'Failed to update like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setUserLikedReviews((prev) => {
        const newSet = new Set(prev);
        if (wasLiked) {
          newSet.add(reviewId);
        } else {
          newSet.delete(reviewId);
        }
        return newSet;
      });
      setLikeCounts((prev) => ({
        ...prev,
        [reviewId]: (prev[reviewId] || 0) + (wasLiked ? 1 : -1),
      }));
      toast.error('Failed to update like');
    } finally {
      setLikingReviewId(null);
    }
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

  if (isLoading) {
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
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-4 sm:p-8 border border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-end gap-3 justify-center md:justify-start mb-4">
              <span className="text-5xl sm:text-6xl font-black text-primary">{averageRating}</span>
              <div className="pb-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        star <= Math.round(parseFloat(averageRating))
                          ? 'text-secondary fill-secondary'
                          : 'text-neutral-black/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-neutral-black/60 font-medium">
                  Based on {total} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm font-medium text-neutral-black/70 w-10 sm:w-12">
                  {stars} star
                </span>
                <div className="flex-1 h-2 bg-neutral-black/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-neutral-black/50 w-6 sm:w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl font-bold text-neutral-black">Customer Reviews</h3>

        <div
          className={cn(`space-y-3 sm:space-y-4`, reviews?.length === 4 ? '' : 'overflow-y-auto max-h-[800px]')}
          style={{ scrollbarWidth: 'thin' }}
        >
          {reviews.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {reviews?.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary/10 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                      {review.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-bold text-neutral-black text-sm sm:text-base truncate">
                              {review.userName?.split('@')[0] || 'Anonymous'}
                            </h4>
                            {review.verified && (
                              <div className="flex items-center gap-1 text-green-600">
                                <VerifiedIcon className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                                <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">
                                  Verified Purchase
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                    star <= review.rating
                                      ? 'text-secondary fill-secondary'
                                      : 'text-neutral-black/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs sm:text-sm text-neutral-black/50">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Delete button for own reviews */}
                        {currentUserId && review.userId === currentUserId && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0"
                                disabled={isDeleting === review.id}
                              >
                                {isDeleting === review.id ? (
                                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this review? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>

                      {/* Comment */}
                      <p className="text-sm sm:text-base text-neutral-black/70 leading-relaxed">
                        {review.comment}
                      </p>

                      {/* Footer - Like Button */}
                      <div className="flex items-center gap-4 pt-1 sm:pt-2">
                        <button
                          onClick={() => handleToggleLike(review.id)}
                          disabled={likingReviewId === review.id}
                          className={cn(
                            'flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm transition-colors group',
                            userLikedReviews.has(review.id)
                              ? 'text-primary'
                              : 'text-neutral-black/60 hover:text-primary',
                          )}
                        >
                          <ThumbsUp
                            className={cn(
                              'w-3 h-3 sm:w-4 sm:h-4 transition-transform',
                              userLikedReviews.has(review.id) && 'fill-current',
                              likingReviewId === review.id && 'animate-pulse',
                            )}
                          />
                          <span className="font-medium">
                            Helpful ({likeCounts[review.id] || 0})
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-8 sm:py-12 bg-muted/30 rounded-xl sm:rounded-2xl border-2 border-dashed border-primary/10">
              <p className="text-neutral-black/40 font-medium text-sm sm:text-base">
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
              className="rounded-full px-6 sm:px-8 h-10 sm:h-12 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all font-bold text-sm sm:text-base"
            >
              {isFetchingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                `View More Feedback (${total - reviews.length} remaining)`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
