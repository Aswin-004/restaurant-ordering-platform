import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Phone, MessageCircle, Home, Clock, Package, Copy } from 'lucide-react';
import { Button } from '../components/ui/button';
import { restaurantInfo } from '../utils/mockData';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`${API}/orders/number/${orderNumber}`);
        setOrderDetails(response.data);
      } catch (error) {
        toast.error('Could not fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I placed order #${orderNumber}. Can you confirm?`
    );
    window.open(`https://wa.me/${restaurantInfo.whatsapp.replace(/\+/g, '')}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${restaurantInfo.phone}`;
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    toast.success('Order number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#8B0000] mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for ordering from Classic Restaurant
            </p>
          </div>

          {/* Order Number Card */}
          <div className="bg-gradient-to-br from-[#8B0000] to-[#6B0000] rounded-2xl p-8 text-center mb-6 shadow-xl">
            <p className="text-white/90 mb-2">Your Order Number</p>
            <div className="flex items-center justify-center space-x-3">
              <h2 className="text-3xl md:text-4xl font-bold text-[#D4AF37] tracking-wider">
                {orderNumber}
              </h2>
              <button
                onClick={copyOrderNumber}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Copy order number"
              >
                {copied ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Copy className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Order Details</h3>
              
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-[#8B0000] mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-gray-800 capitalize">
                      Order Received
                    </p>
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-[#8B0000] mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Estimated Delivery/Pickup</p>
                    <p className="font-semibold text-gray-800">30-45 minutes</p>
                  </div>
                </div>

                {/* Items */}
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-[#8B0000] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Items Ordered</p>
                    <p className="text-gray-800">{orderDetails.items}</p>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-[#8B0000] mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-800 capitalize">
                      {orderDetails.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      {orderDetails.payment_status === 'paid' && (
                        <span className="ml-2 text-green-600 text-sm">(Paid)</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total Amount</span>
                  <span className="text-2xl font-bold text-[#8B0000]">
                    ₹{orderDetails.total}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Important Note */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-[#8B0000]" />
              Important
            </h3>
            <p className="text-gray-700 mb-2">
              You will receive a confirmation call from us before delivery/pickup at:
            </p>
            <p className="text-xl font-bold text-[#8B0000]">
              {restaurantInfo.phone}
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleCall}
              className="flex items-center justify-center space-x-3 bg-white border-2 border-[#8B0000] text-[#8B0000] px-6 py-4 rounded-xl hover:bg-[#8B0000] hover:text-white transition-all font-semibold"
            >
              <Phone className="w-5 h-5" />
              <span>Call Restaurant</span>
            </button>
            
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center space-x-3 bg-[#25D366] text-white px-6 py-4 rounded-xl hover:bg-[#20BA5A] transition-all font-semibold"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Us</span>
            </button>
          </div>

          {/* Back to Home */}
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 py-4 text-lg font-semibold flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
