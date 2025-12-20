'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createReview } from '@/actions/marketplace';
import { toast } from 'sonner';

interface FeedbackFormProps {
  listingId: string;
  userId?: string;
  vendorUserId?: string | null; // The user ID of the vendor who owns the listing
  onSuccess?: () => void;
}

export const FeedbackForm = ({ listingId, userId, vendorUserId, onSuccess }: FeedbackFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Requirement: only allow to post if vendor id and user id are same
  // Note: Usually it's the opposite, but following exact instructions.
  const canReview = userId === vendorUserId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Please log in to submit a review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createReview(listingId, userId, rating, comment);
      if (res.success) {
        setSubmitted(true);
        toast.success('Review submitted successfully!');
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <div className="bg-muted/30 p-8 rounded-2xl border-2 border-dashed border-primary/10 text-center">
        <AlertCircle className="w-12 h-12 text-primary/40 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-neutral-black mb-2">Login Required</h4>
        <p className="text-neutral-black/60 mb-6">
          Please log in to share your experience with this artwork.
        </p>
        <Button variant="outline" className="rounded-full px-8" asChild>
          <a href="/login">Login / Sign Up</a>
        </Button>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10 text-center">
        <h4 className="text-lg font-bold text-neutral-black mb-2">Review Restricted</h4>
        <p className="text-neutral-black/60 italic">
          Reviews are currently restricted to authorized members only.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">Thank You!</h3>
          <p className="text-green-700">Your feedback has been submitted successfully.</p>
          <Button
            variant="ghost"
            onClick={() => {
              setSubmitted(false);
              setRating(0);
              setComment('');
            }}
            className="mt-4 text-green-700 hover:text-green-800 hover:bg-green-100/50"
          >
            Write another review
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <Card className="border-2 border-primary/10 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-primary/10">
        <CardTitle className="text-xl font-bold">Share Your Experience</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-bold text-neutral-black mb-3 uppercase tracking-wider">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="transition-all"
                >
                  <Star
                    className={`w-8 h-8 transition-all ${
                      star <= (hoveredRating || rating)
                        ? 'text-secondary fill-secondary'
                        : 'text-neutral-black/20'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-bold text-neutral-black mb-3 uppercase tracking-wider">
              Your Review
            </label>
            <textarea
              placeholder="Share your thoughts about this artwork..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[120px] p-4 rounded-xl border-2 border-primary/10 bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-neutral-black placeholder:text-neutral-black/40 resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-full shadow-lg shadow-primary/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
