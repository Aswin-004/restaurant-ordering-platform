import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLocation } from '../contexts/LocationContext';

const FloatingCartButton = ({ onClick }) => {
  const { getItemCount, getCartTotal } = useCart();
  const { isLocationSet } = useLocation();
  const itemCount = getItemCount();

  if (!isLocationSet || itemCount === 0) return null;

  return (
    <>
      {/* Desktop Version */}
      <button
        onClick={onClick}
        className="hidden md:flex fixed bottom-8 right-8 z-40 bg-[#8B0000] text-white px-6 py-4 rounded-full shadow-2xl hover:bg-[#6B0000] transition-all duration-300 hover:scale-110 items-center space-x-3 group"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {itemCount}
            </div>
          )}
        </div>
        <div className="text-left">
          <div className="text-xs opacity-90">View Cart</div>
          <div className="text-lg font-bold">₹{getCartTotal()}</div>
        </div>
      </button>

      {/* Mobile Version - Sticky Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#8B0000] shadow-2xl p-3">
        <button
          onClick={onClick}
          className="w-full bg-[#8B0000] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#6B0000] transition-colors shadow-lg flex items-center justify-between px-6"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </div>
              )}
            </div>
            <span>View Cart ({itemCount} items)</span>
          </div>
          <div className="text-xl font-bold">
            ₹{getCartTotal()}
          </div>
        </button>
      </div>
    </>
  );
};

export default FloatingCartButton;
