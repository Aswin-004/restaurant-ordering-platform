import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Percent, Clock } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TodaysSpecial = ({ onOrderClick }) => {
  const [specials, setSpecials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isLocationSet } = useLocationContext();

  useEffect(() => {
    fetchSpecials();
  }, []);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (specials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % specials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [specials.length]);

  const fetchSpecials = async () => {
    try {
      const response = await axios.get(`${API}/specials?active_only=true`);
      setSpecials(response.data);
    } catch (error) {
      console.log('No specials available');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + specials.length) % specials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % specials.length);
  };

  const handleAddToCart = (special) => {
    if (!isLocationSet) {
      onOrderClick();
      return;
    }
    
    addToCart({
      name: special.name,
      price: special.special_price,
      category: "Today's Special"
    });
  };

  if (loading || specials.length === 0) {
    return null;
  }

  const currentSpecial = specials[currentIndex];

  return (
    <section className="py-8 md:py-12 bg-gradient-to-r from-[#8B0000] via-[#A50000] to-[#8B0000] relative overflow-hidden">
      {/* Animated background sparkles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-10 animate-pulse">
          <Sparkles className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div className="absolute top-8 right-20 animate-pulse delay-300">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <div className="absolute bottom-6 left-1/4 animate-pulse delay-500">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <div className="absolute bottom-4 right-1/3 animate-pulse delay-700">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">
          
          {/* Left: Badge & Title */}
          <div className="text-center lg:text-left lg:w-1/4">
            <div className="inline-flex items-center space-x-2 bg-[#D4AF37] text-[#8B0000] px-4 py-2 rounded-full mb-3 animate-bounce">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">LIMITED TIME</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Today's Special
            </h2>
            <p className="text-white/80 text-sm flex items-center justify-center lg:justify-start gap-2">
              <Clock className="w-4 h-4" />
              Offer valid today only!
            </p>
          </div>

          {/* Center: Special Item Card */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-2/5 h-48 md:h-auto relative">
                  <img
                    src={currentSpecial.image || 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a'}
                    alt={currentSpecial.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4 bg-[#D4AF37] text-[#8B0000] px-3 py-1 rounded-full font-bold flex items-center space-x-1">
                    <Percent className="w-4 h-4" />
                    <span>{currentSpecial.discount_percent}% OFF</span>
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-3/5 p-6">
                  <div className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider mb-1">
                    {currentSpecial.badge}
                  </div>
                  <h3 className="text-2xl font-bold text-[#8B0000] mb-2">
                    {currentSpecial.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {currentSpecial.description}
                  </p>

                  {/* Pricing */}
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl font-bold text-[#8B0000]">
                      ₹{currentSpecial.special_price}
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{currentSpecial.original_price}
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      Save ₹{currentSpecial.original_price - currentSpecial.special_price}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleAddToCart(currentSpecial)}
                    className="w-full md:w-auto bg-[#8B0000] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6B0000] transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    data-testid="add-special-to-cart"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Navigation (if multiple specials) */}
          {specials.length > 1 && (
            <div className="lg:w-1/4 flex lg:flex-col items-center justify-center gap-4">
              <button
                onClick={handlePrev}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Previous special"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              {/* Dots indicator */}
              <div className="flex lg:flex-col gap-2">
                {specials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex 
                        ? 'bg-[#D4AF37] w-4 lg:w-2 lg:h-4' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to special ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                aria-label="Next special"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TodaysSpecial;
