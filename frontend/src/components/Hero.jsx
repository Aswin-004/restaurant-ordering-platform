import React from "react";
import { Star, MapPin, Clock, ArrowRight, Utensils } from "lucide-react";
import { restaurantInfo } from "../utils/mockData";

const Hero = ({ onOrderClick, onMenuClick }) => {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-cream"
    >
      {/* Background Image */}

      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1689079564957-83e3641c7fd8"
          alt="Restaurant"
          className="w-full h-full object-cover scale-105"
        />

        {/* Softer gradient overlay */}

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20"></div>
      </div>

      {/* Content */}

      <div className="container mx-auto px-4 relative z-10 py-20">

        <div className="max-w-2xl animate-fade-in">

          {/* Rating */}

          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6 shadow-sm">

            <Star className="w-4 h-4 text-gold fill-gold" />

            <span className="text-gold text-sm font-semibold">
              {restaurantInfo.rating} • {restaurantInfo.reviewCount}+ Reviews
            </span>

          </div>

          {/* Main Heading */}

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-[1.05] drop-shadow-lg">
            Potheri's Favorite
            <span className="block text-gold mt-2">Multi-Cuisine</span>
          </h1>

          {/* Subtitle */}

          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-lg">
            Authentic Biryani, North Indian & Chinese — crafted with passion
            and served fresh every day.
          </p>

          {/* Info Pills */}

          <div className="flex flex-wrap gap-3 mb-10">

            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-sm text-white border border-white/10 shadow-sm">
              <Clock className="w-4 h-4 text-gold" />
              {restaurantInfo.timings}
            </div>

            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-sm text-white border border-white/10 shadow-sm">
              <MapPin className="w-4 h-4 text-gold" />
              {restaurantInfo.landmark}
            </div>

            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full text-sm text-white border border-white/10 shadow-sm">
              <Utensils className="w-4 h-4 text-gold" />
              {restaurantInfo.avgCost}
            </div>

          </div>

          {/* CTA Buttons */}

          <div className="flex flex-col sm:flex-row gap-4">

            <button
              onClick={onOrderClick}
              className="group bg-gold text-black px-8 py-4 rounded-xl font-semibold text-base hover:bg-gold-dark hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Order Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onMenuClick}
              className="bg-white/15 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold text-base border border-white/20 hover:bg-white hover:text-brand-700 transition-all duration-300"
            >
              View Menu
            </button>

          </div>

        </div>

      </div>

      {/* Floating Info Card */}

      <div className="absolute bottom-12 right-12 hidden lg:block animate-slide-up">

        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 hover:scale-105 transition-transform duration-300">

          <div className="text-center">

            <div className="text-4xl font-bold text-brand-700 mb-1">
              ₹500
            </div>

            <div className="text-sm text-gray-500 font-medium">
              Avg Cost for Two
            </div>

            <div className="mt-2 text-xs text-gold-dark font-semibold uppercase tracking-wide">
              Best Value
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Hero;