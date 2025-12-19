'use client';

import { useEffect, useState } from 'react';
import { getVendorByUserId, getVendorReviews } from '@/actions/vendor-actions';
import { FeedbackCard } from '@/components/vendor/feedback-card';
import { MessageSquare, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function FeedbacksPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      const vendorResult = await getVendorByUserId();
      if (vendorResult.success && vendorResult.data) {
        const reviewsResult = await getVendorReviews(vendorResult.data.id);
        setReviews(reviewsResult.data || []);
        setFilteredReviews(reviewsResult.data || []);
      }
      setLoading(false);
    }

    fetchReviews();
  }, []);

  useEffect(() => {
    if (ratingFilter === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter((r) => r.rating === ratingFilter));
    }
  }, [ratingFilter, reviews]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + parseInt(r.rating), 0) / reviews.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-black italic text-foreground">
            Customer Feedbacks
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage customer reviews for your products
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1 text-primary">
              <Star className="w-5 h-5 fill-primary" />
              <span className="text-2xl font-bold">{averageRating}</span>
            </div>
            <p className="text-xs text-muted-foreground">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">Filter by rating:</label>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[180px] focus:ring-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="w-5 h-5 animate-pulse" />
            <span>Loading feedbacks...</span>
          </div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {ratingFilter === 'all'
              ? "Your products haven't received any reviews yet. Keep selling to get feedback from customers!"
              : `No reviews with ${ratingFilter} star${ratingFilter === '1' ? '' : 's'} rating.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <FeedbackCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
