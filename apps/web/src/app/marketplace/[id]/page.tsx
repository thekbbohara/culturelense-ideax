"use client"

import React, { useEffect, useState } from 'react';
import { FeedbackForm } from '@/components/marketplace/FeedbackForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { dummyProducts } from '@/data/dummy-products';
import { ShoppingCart, Heart, Share2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // Using dummy data fallback for now since DB might be empty
  const product = dummyProducts.find(p => p.id === params.id) || dummyProducts[0];
  const similarProducts = dummyProducts.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* <Link href="/marketplace">
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-gray-900 text-gray-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
            </Button>
        </Link> */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
                <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden shadow-sm relative">
                     {product.isNew && (
                        <Badge className="absolute top-4 left-4 z-10 bg-black text-white px-3 py-1">New Arrival</Badge>
                     )}
                     <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-cover"
                     />
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.title}</h1>
                    <p className="text-xl text-gray-500 font-medium">{product.artist || "Unknown Artist"}</p>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-gray-900">${product.price.toLocaleString()}</span>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock</Badge>
                </div>

                <Separator />

                <div className="prose prose-gray max-w-none">
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                    <p className="text-gray-600 leading-relaxed">
                        This masterpiece captures the essence of {product.category} art. 
                        Meticulously crafted with attention to detail, it stands as a testament to the artist's vision and skill.
                        Perfect for collectors who appreciate unique, one-of-a-kind sculptures.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button size="lg" className="flex-1 h-12 text-base">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                    </Button>
                    <Button size="lg" variant="outline" className="h-12 aspect-square p-0">
                        <Heart className="w-5 h-5" />
                    </Button>
                     <Button size="lg" variant="outline" className="h-12 aspect-square p-0">
                        <Share2 className="w-5 h-5" />
                    </Button>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                     <h4 className="font-semibold text-blue-900 mb-2">Authenticity Guaranteed</h4>
                     <p className="text-sm text-blue-700">Every item on CultureLense is verified by our team of experts and AI analysis tools.</p>
                </div>

                <Separator />

                {/* Feedback Section */}
                <div>
                   <h3 className="text-2xl font-bold text-gray-900 mb-6">Ratings & Feedback</h3>
                   <FeedbackForm />
                </div>
            </div>
        </div>

        {/* Similar Products */}
        <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProducts.map(item => (
                    <ProductCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        artist={item.artist || "Culture Lense Artist"}
                        price={item.price}
                        imageUrl={item.imageUrl}
                        isNew={item.isNew}
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
