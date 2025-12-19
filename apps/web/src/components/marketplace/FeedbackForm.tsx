'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FeedbackForm = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
              className="w-full min-h-[120px] p-4 rounded-xl border-2 border-primary/10 bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-neutral-black placeholder:text-neutral-black/40 resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-full shadow-lg shadow-primary/30"
          >
            Submit Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
