import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLocation } from '../contexts/LocationContext';
import { useNavigate } from 'react-router-dom';
import { calculateSubtotal, getDeliveryCharge, calculateTotal, isMinimumOrderMet, MIN_ORDER, formatPrice } from '../utils/cartUtils';
import toast from 'react-hot-toast';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, increaseQuantity, decreaseQuantity, removeItem } = useCart();
  const { deliveryType, selectedArea } = useLocation();
  const navigate = useNavigate();

  const subtotal = calculateSubtotal(items);
  const deliveryCharge = getDeliveryCharge(selectedArea, deliveryType);
  const total = calculateTotal(subtotal, deliveryCharge);
  const minOrder = deliveryType === 'delivery' ? MIN_ORDER.delivery : MIN_ORDER.pickup;
  const isMinMet = isMinimumOrderMet(subtotal, deliveryType);

  const handleCheckout = () => {
    if (!isMinMet) { toast.error(`Minimum order: ${formatPrice(minOrder)}`); return; }
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />

      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-brand-700 text-white">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="text-lg font-bold">Your Cart</h2>
            <span className="bg-white/20 text-xs font-semibold px-2 py-0.5 rounded-full">{items.length} items</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Delivery Badge */}
        <div className="px-5 py-3 bg-cream border-b border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}{deliveryType === 'delivery' && selectedArea ? ` • ${selectedArea}` : ''}</span>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-1">Cart is empty</h3>
              <p className="text-sm text-gray-400">Add delicious items from our menu!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-cream-dark rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-brand-700/20" /></div>}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h4>
                    <div className="text-brand-700 font-bold text-sm">{formatPrice(item.price * item.quantity)}</div>
                  </div>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5">
                    <button onClick={() => decreaseQuantity(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-brand-700 hover:text-white transition-colors text-gray-600">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-brand-700 hover:text-white transition-colors text-gray-600">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete */}
                  <button onClick={() => { removeItem(item.id); toast.success('Removed'); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4 bg-gray-50 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-medium text-gray-700">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Delivery</span><span className="font-medium text-gray-700">{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span></div>
              <div className="border-t pt-2 flex justify-between"><span className="font-bold text-base">Total</span><span className="font-bold text-base text-brand-700">{formatPrice(total)}</span></div>
            </div>

            {!isMinMet && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
                <p className="text-xs text-amber-700 font-medium">Add {formatPrice(minOrder - subtotal)} more to place order</p>
              </div>
            )}

            <button onClick={handleCheckout} disabled={!isMinMet}
              className="w-full bg-brand-700 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
