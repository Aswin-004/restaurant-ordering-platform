import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Percent,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { getSpecials } from "../services/api";
import { useCart } from "../contexts/CartContext";
import { useLocation as useLocationContext } from "../contexts/LocationContext";
import toast from "react-hot-toast";

const TodaysSpecial = ({ onOrderClick }) => {
  const [specials, setSpecials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const { isLocationSet } = useLocationContext();

  useEffect(() => {
    fetchSpecials();
  }, []);

  useEffect(() => {
    if (specials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % specials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [specials.length]);

  const fetchSpecials = async () => {
    try {
      const response = await getSpecials(true);
      const data = Array.isArray(response.data) ? response.data : [];
      setSpecials(data);
    } catch {
      setSpecials([]);
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

    addItem({
      name: special.name,
      price: special.special_price,
      category: "Today's Special",
    });

    toast.success(`${special.name} added to cart!`);
  };

  if (loading || specials.length === 0) return null;

  const currentSpecial = specials[currentIndex];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 relative overflow-hidden">

      {/* Decorative sparkles */}

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Sparkles className="absolute top-8 left-10 text-gold w-6 h-6 animate-pulse" />
        <Sparkles className="absolute bottom-10 right-20 text-gold w-5 h-5 animate-pulse delay-300" />
      </div>

      <div className="container mx-auto px-4 relative z-10">

        <div className="flex flex-col lg:flex-row items-center gap-8">

          {/* Left title */}

          <div className="lg:w-1/4 text-center lg:text-left">

            <div className="inline-flex items-center gap-2 bg-gold text-black px-4 py-2 rounded-full mb-3 shadow-md">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold">LIMITED TIME</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              Today's Special
            </h2>

            <p className="text-white/80 text-sm flex items-center gap-2 justify-center lg:justify-start">
              <Clock className="w-4 h-4" />
              Available Today Only
            </p>

          </div>

          {/* Special card */}

          <div className="lg:w-2/4 w-full">

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] transition-all duration-300">

              <div className="flex flex-col md:flex-row">

                {/* Image */}

                <div className="md:w-2/5 h-56 md:h-auto relative">

                  <img
                    src={
                      currentSpecial.image ||
                      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a"
                    }
                    alt={currentSpecial.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Discount */}

                  <div className="absolute top-4 left-4 bg-gold text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                    <Percent className="w-4 h-4" />
                    {currentSpecial.discount_percent}% OFF
                  </div>

                </div>

                {/* Content */}

                <div className="md:w-3/5 p-6 flex flex-col justify-center">

                  <div className="text-xs text-gold-dark font-semibold uppercase tracking-wider mb-1">
                    {currentSpecial.badge}
                  </div>

                  <h3 className="text-2xl font-display font-bold text-brand-800 mb-2">
                    {currentSpecial.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {currentSpecial.description}
                  </p>

                  {/* Pricing */}

                  <div className="flex items-center gap-3 mb-4">

                    <span className="text-3xl font-bold text-brand-700">
                      ₹{currentSpecial.special_price}
                    </span>

                    <span className="text-gray-400 line-through">
                      ₹{currentSpecial.original_price}
                    </span>

                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                      Save ₹
                      {currentSpecial.original_price -
                        currentSpecial.special_price}
                    </span>

                  </div>

                  {/* CTA */}

                  <button
                    onClick={() => handleAddToCart(currentSpecial)}
                    className="bg-gold text-black px-8 py-3 rounded-xl font-semibold hover:bg-gold-dark hover:shadow-lg transition-all flex items-center gap-2 w-fit"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>

                </div>

              </div>

            </div>

          </div>

          {/* Navigation */}

          {specials.length > 1 && (

            <div className="lg:w-1/4 flex lg:flex-col items-center gap-4">

              <button
                onClick={handlePrev}
                className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* dots */}

              <div className="flex lg:flex-col gap-2">
                {specials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`rounded-full transition-all ${
                      idx === currentIndex
                        ? "bg-gold w-4 h-2 lg:w-2 lg:h-4"
                        : "bg-white/50 w-2 h-2"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition"
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