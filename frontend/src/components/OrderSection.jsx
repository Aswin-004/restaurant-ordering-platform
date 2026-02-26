import React, { useState } from 'react';
import { ShoppingBag, Phone, MessageCircle, X, CheckCircle, Loader2 } from 'lucide-react';
import { restaurantInfo, orderOptions } from '../utils/mockData';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderSection = () => {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    address: '',
    items: '',
    notes: ''
  });

  const handleCall = () => {
    window.location.href = `tel:${restaurantInfo.phone}`;
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I'd like to place an order from Classic Restaurant.`
    );
    window.open(`https://wa.me/${restaurantInfo.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Submit order to backend
      const response = await axios.post(`${API}/orders`, {
        customer_name: orderData.name,
        phone: orderData.phone,
        address: orderData.address,
        items: orderData.items,
        notes: orderData.notes,
        order_type: 'delivery'
      });

      // Show success message with order number
      setOrderNumber(response.data.order_number);
      setOrderSuccess(true);
      
      // Reset form after showing success
      setTimeout(() => {
        setIsOrderDialogOpen(false);
        setOrderSuccess(false);
        setOrderNumber('');
        setOrderData({
          name: '',
          phone: '',
          address: '',
          items: '',
          notes: ''
        });
      }, 4000);
    } catch (err) {
      console.error('Order submission error:', err);
      setError(err.response?.data?.detail || 'Failed to place order. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setOrderData({
      ...orderData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#8B0000] to-[#6B0000] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Choose your preferred way to order - Fast delivery in Potheri Area
          </p>
        </div>

        {/* Order Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Online Order */}
          <div
            onClick={() => setIsOrderDialogOpen(true)}
            className="group bg-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#8B0000] mb-3">
              Order Online
            </h3>
            <p className="text-gray-600 mb-6">
              Browse menu & place order directly from our website
            </p>
            <Button className="bg-[#8B0000] text-white hover:bg-[#6B0000] w-full">
              Start Order
            </Button>
          </div>

          {/* Call Now */}
          <div
            onClick={handleCall}
            className="group bg-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#8B0000] mb-3">
              Call Now
            </h3>
            <p className="text-gray-600 mb-6">
              Speak to us directly for orders & queries
            </p>
            <Button className="bg-[#8B0000] text-white hover:bg-[#6B0000] w-full">
              {restaurantInfo.phone}
            </Button>
          </div>

          {/* WhatsApp */}
          <div
            onClick={handleWhatsApp}
            className="group bg-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#8B0000] mb-3">
              WhatsApp Order
            </h3>
            <p className="text-gray-600 mb-6">
              Quick & easy ordering via WhatsApp
            </p>
            <Button className="bg-[#25D366] text-white hover:bg-[#20BA5A] w-full">
              Message Us
            </Button>
          </div>
        </div>

        {/* Urgency Banner */}
        <div className="mt-12 max-w-3xl mx-auto bg-[#D4AF37] rounded-2xl p-6 text-center">
          <p className="text-[#8B0000] font-bold text-xl">
            ⚡ Fast Delivery in Potheri Area • Order Now & Get Hot Food in 30 Minutes!
          </p>
        </div>
      </div>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-md">
          {!orderSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#8B0000]">
                  Place Your Order
                </DialogTitle>
              </DialogHeader>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleOrderSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={orderData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000] transition-colors disabled:bg-gray-100"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={orderData.phone}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000] transition-colors disabled:bg-gray-100"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    name="address"
                    value={orderData.address}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    rows="2"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000] transition-colors resize-none disabled:bg-gray-100"
                    placeholder="Enter delivery address"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What would you like to order? *
                  </label>
                  <textarea
                    name="items"
                    value={orderData.items}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000] transition-colors resize-none disabled:bg-gray-100"
                    placeholder="E.g., 2x Chicken Biryani, 1x Butter Chicken"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={orderData.notes}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    rows="2"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000] transition-colors resize-none disabled:bg-gray-100"
                    placeholder="Any special requests?"
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#8B0000] text-white hover:bg-[#6B0000] py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <span>Confirm Order</span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#8B0000] mb-2">
                Order Received!
              </h3>
              <p className="text-gray-600 mb-3">
                Your order number is:
              </p>
              <p className="text-3xl font-bold text-[#D4AF37] mb-4">
                {orderNumber}
              </p>
              <p className="text-gray-600">
                We'll call you shortly to confirm your order.
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Estimated delivery: 30-40 minutes
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default OrderSection;
