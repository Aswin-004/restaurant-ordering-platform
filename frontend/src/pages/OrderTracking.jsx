import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Package, Truck, ChefHat, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { getOrderByNumber } from '../services/api';

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package, description: 'We received your order' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, description: 'Restaurant confirmed' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Chef is cooking your food' },
  { key: 'ready', label: 'Ready', icon: Clock, description: 'Food is ready' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, description: 'On the way to you' },
  { key: 'delivered', label: 'Delivered', icon: Home, description: 'Enjoy your meal!' },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      const response = await getOrderByNumber(orderId);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      if (!mounted) return;
      await fetchOrder();
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, [fetchOrder]);

  const getStepIndex = (status) => {
    if (status === 'completed') return STEPS.length - 1;
    const idx = STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-brand-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Order Not Found</h2>
          <p className="text-gray-500 text-sm mb-5">We couldn't find order "{orderId}"</p>
          <button onClick={() => navigate('/')} className="bg-brand-700 text-white px-6 py-2.5 rounded-xl hover:bg-brand transition-colors text-sm font-semibold">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-cream py-6">
      <div className="container mx-auto px-4 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-brand-800">Track Order</h1>
            <p className="text-gray-500 text-sm">#{order.order_number}</p>
          </div>
          <button onClick={fetchOrder} className="p-2 hover:bg-white rounded-xl transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {isCancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-red-700 mb-1">Order Cancelled</h2>
            <p className="text-sm text-red-600">Please contact the restaurant for details.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
            <div className="relative">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index <= currentStep;
                const isActive = index === currentStep;

                return (
                  <div key={step.key} className="flex items-start mb-5 last:mb-0">
                    <div className="flex flex-col items-center mr-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-brand-700 text-white ring-4 ring-brand-100'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      )}
                    </div>
                    <div className="pt-2">
                      <p className={`text-sm font-semibold ${isActive ? 'text-brand-700' : isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                      {isActive && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-[11px] text-gray-500">Current</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-sm text-gray-800 mb-3">Order Details</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium capitalize">{order.order_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Items</span>
              <span className="font-medium text-right max-w-[55%] text-xs">{order.items}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium capitalize">{order.payment_method} ({order.payment_status})</span>
            </div>
            <div className="border-t border-gray-100 pt-2.5 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-brand-700">₹{order.total}</span>
            </div>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2">
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;
