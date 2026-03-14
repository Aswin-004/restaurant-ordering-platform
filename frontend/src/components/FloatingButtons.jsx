import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { restaurantInfo } from '../utils/mockData';

const FloatingButtons = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hi! I'd like to place an order from Classic Restaurant.`);
    window.open(`https://wa.me/${restaurantInfo.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank', 'noopener');
  };

  return (
    <>
      {/* WhatsApp – always visible, positioned above mobile cart bar on mobile */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 w-12 h-12 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20BA5A] hover:scale-105 transition-all flex items-center justify-center group"
        aria-label="Order on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
        <span className="hidden md:block absolute right-16 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Order on WhatsApp
        </span>
      </button>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-[136px] md:bottom-24 right-4 md:right-6 z-30 w-10 h-10 bg-brand-700 text-white rounded-full shadow-lg hover:bg-brand transition-all flex items-center justify-center ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </>
  );
};

export default FloatingButtons;
