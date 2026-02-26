import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLocation } from '../contexts/LocationContext';
import { useNavigate } from 'react-router-dom';
import {
  calculateSubtotal,
  getDeliveryCharge,
  calculateTotal,
  isMinimumOrderMet,
  MIN_ORDER,
  formatPrice
} from '../utils/cartUtils';
import { Button } from './ui/button';
import toast from 'react-hot-toast';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { deliveryType, selectedArea } = useLocation();
  const navigate = useNavigate();

  const subtotal = calculateSubtotal(items);
  const deliveryCharge = getDeliveryCharge(selectedArea, deliveryType);
  const total = calculateTotal(subtotal, deliveryCharge);
  const minOrder = deliveryType === 'delivery' ? MIN_ORDER.delivery : MIN_ORDER.pickup;
  const isMinMet = isMinimumOrderMet(subtotal, deliveryType);

  const handleCheckout = () => {
    if (!isMinMet) {
      toast.error(`Minimum order amount is ${formatPrice(minOrder)}`);
      return;
    }
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#8B0000] text-white">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-6 h-6" />
            <h2 className="text-xl font-bold">Your Cart ({items.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Delivery Type Badge */}
        <div className="p-4 bg-[#FFF8DC] border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-gray-800">
                {deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
              </span>
              {deliveryType === 'delivery' && (
                <p className="text-sm text-gray-600 mt-1">{selectedArea}</p>
              )}
            </div>
            <button
              onClick={() => {
                onClose();
                clearCart();
                window.location.href = '/';
              }}
              className="text-sm text-[#8B0000] hover:underline"
            >
              Change
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500">
                Add some delicious items to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Item Image Placeholder */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatPrice(item.price)} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-[#FFF8DC] rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-[#8B0000] hover:text-white transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md hover:bg-[#8B0000] hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-[#8B0000]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => {
                            removeItem(item.id);
                            toast.success('Item removed from cart');
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Bill Summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
            {/* Bill Details */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="font-semibold">
                  {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-[#8B0000]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Minimum Order Warning */}
            {!isMinMet && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Add {formatPrice(minOrder - subtotal)} more to place order
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={!isMinMet}
              className="w-full bg-[#8B0000] text-white hover:bg-[#6B0000] py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMinMet ? 'Proceed to Checkout' : `Minimum Order ${formatPrice(minOrder)}`}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
