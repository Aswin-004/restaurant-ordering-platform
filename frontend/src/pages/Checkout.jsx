import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useLocation } from "../contexts/LocationContext";
import { createRazorpayOrder, verifyPayment } from "../services/api";

import {
  ShoppingBag,
  MapPin,
  User,
  Phone,
  Home,
  FileText,
  Loader2,
  Tag,
  ArrowLeft,
  CreditCard,
  Banknote
} from "lucide-react";

function Checkout() {

  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { location } = useLocation();

  const [loading, setLoading] = useState(false);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePayment = async () => {
    try {

      setLoading(true);

      const orderPayload = {
        items: cartItems,
        total: totalAmount,
        location: location
      };

      const response = await createRazorpayOrder(orderPayload);

      const options = {
        key: response.data.key_id,
        amount: response.data.amount,
        currency: response.data.currency,
        order_id: response.data.order_id,

        handler: async function (razorpayResponse) {

          try {

            await verifyPayment({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature
            });

            clearCart();

            navigate(`/track/${response.data.order_id}`);

          } catch (error) {
            console.error("Payment verification failed", error);
          }

        }

      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Payment error", error);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="checkout-page">

      <button
        onClick={() => navigate(-1)}
        className="back-btn"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h2>Checkout</h2>

      <div className="cart-summary">

        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <span>{item.name}</span>
            <span>₹{item.price} x {item.quantity}</span>
          </div>
        ))}

        <div className="total">
          <strong>Total: ₹{totalAmount}</strong>
        </div>

      </div>

      <button
        className="place-order-btn"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={18} /> Processing...
          </>
        ) : (
          <>
            <CreditCard size={18} /> Place Order
          </>
        )}
      </button>

    </div>

  );
}

export default Checkout;