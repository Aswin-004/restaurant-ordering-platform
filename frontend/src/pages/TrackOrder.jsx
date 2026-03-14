import React, { useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL;

function TrackOrder() {

  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const trackOrder = async () => {

    try {

      const response = await axios.get(
        `${API_BASE}/api/orders/${orderNumber}`
      );

      if (response.data.phone !== phone) {
        setError("Phone number does not match order.");
        return;
      }

      setOrder(response.data);
      setError("");

    } catch {
      setError("Order not found.");
    }
  };

  return (

    <div className="max-w-lg mx-auto p-6">

      <h2 className="text-2xl font-bold mb-4 text-brand-700">
        Track Your Order
      </h2>

      <input
        className="border p-2 w-full mb-3 rounded"
        placeholder="Order Number"
        value={orderNumber}
        onChange={(e)=>setOrderNumber(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3 rounded"
        placeholder="Phone Number"
        value={phone}
        onChange={(e)=>setPhone(e.target.value)}
      />

      <button
        onClick={trackOrder}
        className="bg-brand-700 text-white px-4 py-2 rounded w-full"
      >
        Track Order
      </button>

      {error && (
        <p className="text-red-500 mt-3">{error}</p>
      )}

      {order && (

        <div className="mt-6 border p-4 rounded bg-white">

          <p><b>Order:</b> {order.order_number}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Total:</b> ₹{order.total}</p>
          <p><b>Estimated Time:</b> {order.estimated_time}</p>

        </div>

      )}

    </div>
  );
}

export default TrackOrder;