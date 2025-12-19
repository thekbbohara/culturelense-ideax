"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export const FeedbackForm = () => {
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // Here we would call an action to save the feedback
    };

    if (submitted) {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 text-center text-green-700">
                    <p className="font-semibold">Thank you for your feedback!</p>
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`transition-colors ${rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    >
                        <Star className="w-6 h-6" />
                    </button>
                ))}
            </div>
            <textarea
                placeholder="Share your thoughts about this artwork..."
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
            />
            <Button type="submit">Submit Review</Button>
        </form>
      </CardContent>
    </Card>
  );
};
