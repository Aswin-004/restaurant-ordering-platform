import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Phone, MessageCircle, Home, Clock, Package, Copy, ArrowRight } from 'lucide-react';
import { restaurantInfo } from '../utils/mockData';
import { getOrderByNumber } from '../services/api';
import toast from 'react-hot-toast';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await getOrderByNumber(orderNumber);
        setOrderDetails(response.data);
      } catch (error) {
        toast.error('Could not fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) fetchOrderDetails();
  }, [orderNumber]);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hi, I placed order #${orderNumber}. Can you confirm?`);
    window.open(`https://wa.me/${restaurantInfo.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank', 'noopener');
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success('Order number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-800 mb-1">
              Order Placed!
            </h1>
            <p className="text-gray-500 text-sm">
              Thank you for ordering from Classic Restaurant
            </p>
          </div>

          {/* Order Number Card */}
          <div className="bg-gradient-to-br from-brand-700 to-brand-800 rounded-2xl p-6 text-center mb-5 shadow-xl">
            <p className="text-white/80 text-xs uppercase tracking-wider mb-2">Order Number</p>
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gold tracking-wider font-display">
                {orderNumber}
              </h2>
              <button
                onClick={copyOrderNumber}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Copy order number"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white/70" />}
              </button>
            </div>
          </div>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
              <h3 className="font-bold text-gray-800 mb-4">Order Details</h3>
              
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-brand-700 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-semibold text-sm text-gray-800 capitalize">{orderDetails.status?.replace(/_/g, ' ') || 'Order Received'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-brand-700 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Estimated Delivery</p>
                    <p className="font-semibold text-sm text-gray-800">45-60 minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 text-brand-700 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Items Ordered</p>
                    <p className="text-sm text-gray-700">{orderDetails.items}</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-brand-700">₹{orderDetails.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* Important Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">📞 Confirmation call</span> — You'll receive a call before delivery at{' '}
              <span className="font-bold">{restaurantInfo.phone}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/track/${orderNumber}`)}
              className="w-full bg-brand-700 text-white hover:bg-brand py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <Package className="w-4 h-4" />
              Track Order
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.location.href = `tel:${restaurantInfo.phone}`}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:border-brand-700 hover:text-brand-700 transition-all text-sm font-medium"
              >
                <Phone className="w-4 h-4" />
                Call
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl hover:bg-[#20BA5A] transition-colors text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
