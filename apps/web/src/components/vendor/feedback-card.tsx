'use client';

import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Review {
  id: string;
  rating: string;
  comment: string | null;
  createdAt: Date;
  listing: {
    title: string;
    imageUrl: string;
  };
  user: {
    email: string;
  };
}

interface FeedbackCardProps {
  review: Review;
}

export function FeedbackCard({ review }: FeedbackCardProps) {
  const rating = parseInt(review.rating);
  const buyerInitial = review?.user?.email.charAt(0).toUpperCase();

  return (
    <Card className="hover:shadow-md transition-shadow border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <img
            src={review.listing.imageUrl}
            alt={review.listing.title}
            className="w-16 h-16 object-cover rounded-md"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{review.listing.title}</h3>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {review.comment && (
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{review.comment}"</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
              {buyerInitial}
            </div>
            <span>{review.user?.email}</span>
          </div>
          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
