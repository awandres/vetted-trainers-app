"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Cathy Watkins",
    review: "Vetted Trainers knowledge of the human body is beyond amazing. They helped me complete a goal of competing in my first-ever U.S. Strong Woman competition. Without them I would have never challenged myself and succeeded!",
  },
  {
    name: "Colleen Q",
    review: "I have worked with Vetted Trainers on several occasions. Joel designed a great fitness program that has improved my overall health. Also, when various musculoskeletal issues related to sports and exercise have arisen, Vetted Trainers has solved a number of my issues. I highly recommend them.",
  },
  {
    name: "Simon K",
    review: "Joel and Vetted Trainers takes a holistic approach to building strength and injury recovery. After I tore my meniscus, Joel developed a program that focused on mobility, muscle releases, and strength training. I can't recommend him enough!",
  },
  {
    name: "Charlie C",
    review: "Vetted Trainers is an important part of my life. Without them I doubt my 66 year old body would feel as good after rowing 240 miles of the Colorado River through Grand Canyon.",
  },
  {
    name: "Betty D",
    review: "I have become stronger, more flexible, and I feel super healthy since working with Vetted Trainers in my truly individualized program. They are the best—and also, it's fun!",
  },
];

export function VTTestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-[#181818] rounded-2xl p-8 md:p-12 relative">
        <Quote className="absolute top-6 left-6 h-12 w-12 text-[#50BFF4]/20" />

        <div className="text-center">
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-[#50BFF4] text-[#50BFF4]" />
            ))}
          </div>

          {/* Review - fixed height to prevent layout shift */}
          <div className="h-[180px] flex items-center justify-center">
            <p className="text-lg md:text-xl text-gray-300 italic leading-relaxed">
              &ldquo;{testimonials[activeIndex]?.review}&rdquo;
            </p>
          </div>

          {/* Author */}
          <div className="font-bold text-white text-lg mt-6">
            — {testimonials[activeIndex]?.name}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="p-4 rounded-full bg-[#252525] hover:bg-[#50BFF4] text-white hover:text-black transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="p-4 rounded-full bg-[#252525] hover:bg-[#50BFF4] text-white hover:text-black transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === activeIndex 
                  ? "bg-[#50BFF4] w-8" 
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
