import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLocation } from '../contexts/LocationContext';
import { formatPrice } from '../utils/cartUtils';

const FloatingCartButton = ({ onClick }) => {
  const { getItemCount, getCartTotal } = useCart();
  const { isLocationSet } = useLocation();
  const itemCount = getItemCount();

  if (!isLocationSet || itemCount === 0) return null;

  return (
    <>
      {/* Desktop – floating pill */}
      <button
        onClick={onClick}
        className="hidden md:flex fixed bottom-8 right-8 z-40 bg-brand-700 text-white pl-5 pr-6 py-3.5 rounded-full shadow-2xl hover:bg-brand hover:shadow-brand-700/30 hover:shadow-xl transition-all duration-300 hover:scale-105 items-center gap-3 group"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-2 -right-2.5 bg-gold text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center text-brand-900 animate-cart-bounce">
            {itemCount}
          </span>
        </div>
        <div className="text-left leading-tight">
          <span className="block text-[11px] opacity-80">View Cart</span>
          <span className="block text-base font-bold">{formatPrice(getCartTotal())}</span>
        </div>
      </button>

      {/* Mobile – sticky bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 p-2.5 safe-area-bottom">
        <button
          onClick={onClick}
          className="w-full bg-brand-700 text-white py-3.5 rounded-xl font-semibold hover:bg-brand transition-colors shadow-lg flex items-center justify-between px-5"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 bg-gold text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-brand-900">
                {itemCount}
              </span>
            </div>
            <span className="text-sm">View Cart · {itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>
          <span className="text-lg font-bold">{formatPrice(getCartTotal())}</span>
        </button>
      </div>
    </>
  );
};

export default FloatingCartButton;
