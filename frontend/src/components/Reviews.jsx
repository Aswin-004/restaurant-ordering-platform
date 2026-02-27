import React from 'react';
import { Star, Quote } from 'lucide-react';
import { reviews } from '../utils/mockData';

const Reviews = () => {
  return (
    <section className="py-16 md:py-24 bg-[#FFF8DC]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[#8B0000]/10 px-4 py-2 rounded-full mb-4">
            <span className="text-[#8B0000] font-semibold">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#8B0000] mb-4">
            Loved by Families in Potheri
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-10 h-10 text-[#D4AF37]/30" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? 'text-[#D4AF37] fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{review.comment}"
              </p>

              {/* Reviewer Info */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 bg-[#8B0000] rounded-full flex items-center justify-center text-white font-bold">
                  {review.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#8B0000]">{review.name}</div>
                  <div className="text-sm text-gray-500">{review.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Want to share your experience?</p>
          <button className="bg-[#8B0000] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6B0000] transition-colors">
            Write a Review
          </button>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
