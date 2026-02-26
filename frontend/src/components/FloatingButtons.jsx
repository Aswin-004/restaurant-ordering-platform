import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { restaurantInfo } from '../utils/mockData';

const FloatingButtons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I'd like to place an order from Classic Restaurant.`
    );
    window.open(`https://wa.me/${restaurantInfo.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20BA5A] transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="WhatsApp Order"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-16 bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Order on WhatsApp
        </span>
      </button>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-[#8B0000] text-white rounded-full shadow-xl hover:bg-[#6B0000] transition-all duration-300 hover:scale-110 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}

      {/* Mobile Sticky Order Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#8B0000] shadow-2xl p-4">
        <button
          onClick={handleWhatsApp}
          className="w-full bg-[#8B0000] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#6B0000] transition-colors shadow-lg flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Order Now - Quick Delivery!</span>
        </button>
      </div>
    </>
  );
};

export default FloatingButtons;
