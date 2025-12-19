import React from 'react';
import { Star, ThumbsUp, VerifiedIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

// Dummy reviews data
const dummyReviews: Review[] = [
  {
    id: '1',
    userName: 'Priya Sharma',
    rating: 5,
    comment:
      'Absolutely stunning piece! The craftsmanship is exceptional and it looks even better in person. The details are incredible and it has become the centerpiece of my collection.',
    date: '2 days ago',
    verified: true,
    helpful: 12,
  },
  {
    id: '2',
    userName: 'Rajesh Kumar',
    rating: 5,
    comment:
      'Exceeded my expectations. The quality is top-notch and the seller was very professional. Highly recommend for serious collectors.',
    date: '1 week ago',
    verified: true,
    helpful: 8,
  },
  {
    id: '3',
    userName: 'Anita Desai',
    rating: 4,
    comment:
      'Beautiful sculpture with great attention to detail. Shipping was careful and secure. Only minor issue was delivery took slightly longer than expected.',
    date: '2 weeks ago',
    verified: false,
    helpful: 5,
  },
  {
    id: '4',
    userName: 'Vikram Singh',
    rating: 5,
    comment:
      'A true masterpiece! The artist has captured the essence perfectly. Worth every penny.',
    date: '3 weeks ago',
    verified: true,
    helpful: 15,
  },
];

export const ReviewsList = () => {
  // Calculate average rating
  const averageRating = (
    dummyReviews.reduce((sum, review) => sum + review.rating, 0) / dummyReviews.length
  ).toFixed(1);

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: dummyReviews.filter((r) => r.rating === stars).length,
    percentage: (dummyReviews.filter((r) => r.rating === stars).length / dummyReviews.length) * 100,
  }));

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
                  Based on {dummyReviews.length} reviews
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

        {dummyReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-primary/10 hover:border-primary/20 transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {review.userName.charAt(0)}
              </div>

              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-neutral-black">{review.userName}</h4>
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
                      <span className="text-sm text-neutral-black/50">{review.date}</span>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-neutral-black/70 leading-relaxed">{review.comment}</p>

                {/* Footer */}
                <div className="flex items-center gap-4 pt-2">
                  <button className="flex items-center gap-2 text-sm text-neutral-black/60 hover:text-primary transition-colors group">
                    <ThumbsUp className="w-4 h-4 group-hover:fill-current" />
                    <span className="font-medium">Helpful ({review.helpful})</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
