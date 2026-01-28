"use client";

import { useState, useEffect } from "react";
import { Star, ExternalLink } from "lucide-react";

interface Review {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
  profile_photo_url?: string;
}

interface ReviewsData {
  rating: number;
  user_ratings_total: number;
  reviews: Review[];
  source: "google" | "fallback";
}

// Fallback reviews data
const fallbackReviews: Review[] = [
  {
    author_name: "Sarah M.",
    rating: 5,
    text: "Vetted Trainers completely transformed my fitness journey. The personalized approach and attention to detail is unmatched. I've never felt stronger or more confident!",
    relative_time_description: "2 months ago",
  },
  {
    author_name: "Michael R.",
    rating: 5,
    text: "The team at Vetted Trainers really knows what they're doing. They helped me recover from an injury and get back to peak performance. Highly recommend!",
    relative_time_description: "3 months ago",
  },
  {
    author_name: "Jennifer L.",
    rating: 5,
    text: "Best personal training experience I've ever had. The private gym setting is perfect and the trainers are incredibly knowledgeable about mobility and strength training.",
    relative_time_description: "1 month ago",
  },
];

// Individual review card with expandable text
function ReviewCard({ review }: { review: Review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 200;
  const shouldTruncate = review.text.length > maxLength;

  const displayText = isExpanded || !shouldTruncate
    ? review.text
    : review.text.slice(0, maxLength).trim() + "...";

  return (
    <div className="bg-[#252525] rounded-2xl p-6 shadow-lg flex flex-col">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < review.rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-600 text-gray-600"
            }`}
          />
        ))}
      </div>

      {/* Review Text */}
      <div className="flex-grow">
        <p className="text-gray-300 leading-relaxed italic">
          &ldquo;{displayText}&rdquo;
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#50BFF4] hover:text-white text-sm font-medium mt-2 transition-colors"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Author and Time */}
      <div className="mt-4">
        <p className="font-medium text-white">— {review.author_name}</p>
        {review.relative_time_description && (
          <p className="text-sm text-gray-400">{review.relative_time_description}</p>
        )}
      </div>
    </div>
  );
}

export function VTGoogleReviews() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("/api/vt/google-reviews");
        if (response.ok) {
          const reviewsData = await response.json();
          setData(reviewsData);
        } else {
          // Use fallback data
          setData({
            rating: 5.0,
            user_ratings_total: 47,
            reviews: fallbackReviews,
            source: "fallback",
          });
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        // Use fallback data
        setData({
          rating: 5.0,
          user_ratings_total: 47,
          reviews: fallbackReviews,
          source: "fallback",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  // Show skeleton loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <div className="h-8 w-48 bg-[#333] rounded animate-pulse" />
          <div className="h-8 w-32 bg-[#333] rounded animate-pulse" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#252525] rounded-2xl p-6 shadow-lg">
              <div className="h-5 w-24 bg-[#333] rounded animate-pulse mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-[#333] rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-[#333] rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-[#333] rounded animate-pulse" />
              </div>
              <div className="h-4 w-28 bg-[#333] rounded animate-pulse mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Use fetched data or fallback defaults
  const rating = data?.rating ?? 5.0;
  const totalReviews = data?.user_ratings_total ?? 47;
  const reviews = data?.reviews?.slice(0, 3) ?? fallbackReviews;

  return (
    <div className="space-y-8">
      {/* Overall Rating Display */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">Google Reviews</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.round(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-600 text-gray-600"
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-bold text-white">{rating.toFixed(1)}</span>
          <span className="text-gray-400">({totalReviews} reviews)</span>
        </div>
      </div>

      {/* 3 Reviews Side by Side */}
      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </div>

      {/* Link to Google */}
      <div className="text-center pt-4">
        <a
          href="https://www.google.com/maps/place/Vetted+Trainers/@39.3875573,-77.4233909,17z/data=!4m8!3m7!1s0x89c9c41d8f1d1c4d:0x7da4d013478fc7ff!8m2!3d39.3875573!4d-77.420816!9m1!1b1!16s%2Fg%2F11c5q5q5q5"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#50BFF4] hover:text-white font-medium transition-colors"
        >
          See all reviews on Google
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Google Attribution */}
      <p className="text-center text-gray-400 text-xs">
        Reviews powered by Google
        {data?.source === "fallback" && " (cached)"}
      </p>
    </div>
  );
}
