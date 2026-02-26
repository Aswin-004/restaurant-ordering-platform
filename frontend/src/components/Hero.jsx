import React from 'react';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { restaurantInfo } from '../utils/mockData';

const Hero = ({ onOrderClick, onMenuClick }) => {
  return (
    <section id="home" className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1689079564957-83e3641c7fd8"
          alt="Restaurant Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/50"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/20 backdrop-blur-sm border border-[#D4AF37] px-4 py-2 rounded-full mb-6">
            <Star className="w-5 h-5 text-[#D4AF37] fill-current" />
            <span className="text-[#D4AF37] font-semibold">
              {restaurantInfo.rating} Rating • {restaurantInfo.reviewCount}+ Reviews
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Potheri's Favorite
            <span className="block text-[#D4AF37]">Multi-Cuisine Restaurant</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-200 mb-4">
            Delicious Biryani, North Indian & Chinese
          </p>
          <p className="text-lg text-gray-300 mb-8">
            Just Steps from SRM University • {restaurantInfo.avgCost}
          </p>

          {/* Quick Info Tags */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-white font-medium">Open Today: {restaurantInfo.timings}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-white font-medium">{restaurantInfo.landmark}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onOrderClick}
              className="group bg-[#8B0000] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#6B0000] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>Order Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onMenuClick}
              className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-white hover:text-[#8B0000] transition-all duration-300"
            >
              View Menu
            </button>
          </div>

          {/* Urgency Banner */}
          <div className="mt-8 inline-block">
            <div className="bg-[#D4AF37] text-[#8B0000] px-6 py-3 rounded-lg font-bold text-lg animate-pulse">
              🔥 Hungry? We're Open Now!
            </div>
          </div>
        </div>
      </div>

      {/* Student Offer Badge - Floating */}
      <div className="absolute bottom-8 right-8 hidden lg:block">
        <div className="bg-white p-6 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#8B0000] mb-1">₹500</div>
            <div className="text-sm text-gray-600 font-medium">For Two People</div>
            <div className="mt-2 text-xs text-[#D4AF37] font-semibold">Student Combos Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
