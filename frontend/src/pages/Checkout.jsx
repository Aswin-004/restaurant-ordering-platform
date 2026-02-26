import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useLocation } from '../contexts/LocationContext';
import { ShoppingBag, MapPin, User, Phone, Home, FileText, Loader2, Tag } from 'lucide-react';
import {
  calculateSubtotal,
  getDeliveryCharge,
  calculateTotal,
  isMinimumOrderMet,
  getEstimatedDeliveryTime,
  formatPrice
} from '../utils/cartUtils';
import { validateCheckoutForm, sanitizeInput } from '../utils/validation';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart, getCartTotal } = useCart();
  const { deliveryType, selectedArea } = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [couponCode, setCouponCode] = useState('');

  const subtotal = calculateSubtotal(items);
  const deliveryCharge = getDeliveryCharge(selectedArea, deliveryType);
  const total = calculateTotal(subtotal, deliveryCharge);
  const estimatedTime = getEstimatedDeliveryTime();

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/');
    }
  }, [items.length, navigate]);

  // Redirect if location not set
  React.useEffect(() => {
    if (!deliveryType) {
      toast.error('Please select delivery or pickup option');
      navigate('/');
    }
  }, [deliveryType, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: sanitizeInput(value)
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateCheckoutForm({ ...formData, deliveryType });
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!isMinimumOrderMet(subtotal, deliveryType)) {
      toast.error('Minimum order amount not met');
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === 'cod') {
        // COD: Submit order directly
        const orderData = {
          customer_name: formData.name,
          phone: formData.phone,
          address: deliveryType === 'delivery' ? formData.address : 'Pickup from restaurant',
          landmark: formData.landmark || '',
          items: items.map(item => `${item.quantity}x ${item.name}`).join(', '),
          cart_items: items.map(item => ({
            item_name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
          })),
          notes: formData.notes || '',
          order_type: deliveryType,
          delivery_area: selectedArea
        };

        const response = await axios.post(`${API}/orders`, orderData);
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/order-success/${response.data.order_number}`);
        
      } else {
        // Razorpay: Create order and initiate payment
        await handleRazorpayPayment();
      }

    } catch (error) {
      if (error.response?.data?.detail?.errors) {
        toast.error(error.response.data.detail.errors.join(', '));
      } else {
        toast.error(error.response?.data?.detail || 'Failed to place order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      const orderPayload = {
        customer_name: formData.name,
        phone: formData.phone,
        address: deliveryType === 'delivery' ? formData.address : 'Pickup from restaurant',
        landmark: formData.landmark || '',
        cart_items: items.map(item => ({
          item_name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        notes: formData.notes || '',
        order_type: deliveryType,
        delivery_area: selectedArea
      };

      const response = await axios.post(`${API}/payment/create-razorpay-order`, orderPayload);

      const options = {
        key: response.data.key_id,
        amount: response.data.amount * 100,
        currency: response.data.currency,
        name: 'Classic Restaurant',
        description: 'Order Payment',
        order_id: response.data.razorpay_order_id,
        handler: async function (razorpayResponse) {
          try {
            await axios.post(`${API}/payment/verify-payment`, {
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              order_number: response.data.order_number
            });

            clearCart();
            toast.success('Payment successful!');
            navigate(`/order-success/${response.data.order_number}`);
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone
        },
        theme: {
          color: '#8B0000'
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function () {
        setIsSubmitting(false);
        toast.error('Payment failed. Please try again.');
      });
      razorpay.open();

    } catch (error) {
      setIsSubmitting(false);
      toast.error(error.response?.data?.detail || 'Failed to initiate payment');
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#8B0000] mb-2">
              Checkout
            </h1>
            <p className="text-gray-600">
              Complete your order details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Type Card */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-6 h-6 text-[#8B0000]" />
                      <h2 className="text-xl font-bold text-gray-800">Order Type</h2>
                    </div>
                    <span className="bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                    </span>
                  </div>
                  {deliveryType === 'delivery' && (
                    <p className="text-gray-600">
                      Delivering to: <span className="font-semibold">{selectedArea}</span>
                    </p>
                  )}
                </div>

                {/* Customer Details */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="w-6 h-6 text-[#8B0000]" />
                    <h2 className="text-xl font-bold text-gray-800">Your Details</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.name ? 'border-red-500' : 'border-gray-200 focus:border-[#8B0000]'
                        }`}
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                          errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-[#8B0000]'
                        }`}
                        placeholder="10-digit mobile number"
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* Address - Only for delivery */}
                    {deliveryType === 'delivery' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Delivery Address *
                          </label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            rows="3"
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors resize-none ${
                              errors.address ? 'border-red-500' : 'border-gray-200 focus:border-[#8B0000]'
                            }`}
                            placeholder="House/Flat No., Building Name, Street"
                            disabled={isSubmitting}
                          ></textarea>
                          {errors.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Landmark (Optional)
                          </label>
                          <input
                            type="text"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000] transition-colors"
                            placeholder="Nearby landmark for easy location"
                            disabled={isSubmitting}
                          />
                        </div>
                      </>
                    )}

                    {/* Order Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Order Notes (Optional)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000] transition-colors resize-none"
                        placeholder="Any special instructions?"
                        disabled={isSubmitting}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
                  
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#8B0000] hover:bg-[#FFF8DC] transition-all">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-[#8B0000]"
                      />
                      <div className="ml-3">
                        <div className="font-semibold text-gray-800">Cash on Delivery</div>
                        <div className="text-sm text-gray-600">Pay when you receive</div>
                      </div>
                    </label>

                    <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#8B0000] hover:bg-[#FFF8DC] transition-all">
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-[#8B0000]"
                      />
                      <div className="ml-3">
                        <div className="font-semibold text-gray-800">Online Payment</div>
                        <div className="text-sm text-gray-600">UPI / Card / Net Banking</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Coupon Code - Placeholder */}
                <div className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center space-x-3 mb-4">
                    <Tag className="w-6 h-6 text-[#8B0000]" />
                    <h2 className="text-xl font-bold text-gray-800">Apply Coupon</h2>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000]"
                      disabled
                    />
                    <Button
                      type="button"
                      disabled
                      className="bg-gray-300 text-gray-500 px-6 cursor-not-allowed"
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Coupon feature coming soon!</p>
                </div>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-md sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4">
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
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Total */}
                <div className="flex justify-between mb-4">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-[#8B0000]">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Estimated Time */}
                <div className="bg-[#FFF8DC] rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Estimated delivery:</span> {estimatedTime}
                  </p>
                </div>

                {/* Place Order Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || paymentMethod === 'razorpay'}
                  className="w-full bg-[#8B0000] text-white hover:bg-[#6B0000] py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <span>Pay ₹{total}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Place Order</span>
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  By placing order, you agree to our terms & conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
