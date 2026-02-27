import React from 'react';
import { Star } from 'lucide-react';
import { bestSellers } from '../utils/mockData';

const BestSellers = ({ onOrderClick }) => {
  return (
    <section className="py-16 md:py-24 bg-[#FFF8DC]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[#8B0000]/10 px-4 py-2 rounded-full mb-4">
            <span className="text-[#8B0000] font-semibold">Customer Favorites</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#8B0000] mb-4">
            Our Best Sellers
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover why these dishes keep our customers coming back for more
          </p>
        </div>

        {/* Best Sellers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  {item.badge}
                </div>
                {/* Category Tag */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {item.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#8B0000] mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Price and Order */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-[#8B0000]">
                    {item.price}
                  </div>
                  <button
                    onClick={onOrderClick}
                    className="bg-[#8B0000] text-white px-4 py-2 rounded-lg hover:bg-[#6B0000] transition-colors font-medium text-sm"
                  >
                    Order Now
                  </button>
                </div>

                {/* Rating */}
                <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-[#D4AF37] fill-current"
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Highly Rated</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
