import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface OrderedProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderDetails {
  orderId: string;
  products: OrderedProduct[];
  totalAmount: number;
  customerEmail: string;
}

const OrderConfirmation: React.FC = () => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderIdAndDetails = async () => {
      try {
        // Get email from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email') || localStorage.getItem('userEmail') || '';
        
        if (!email) {
          setError("Email not found.");
          setLoading(false);
          return;
        }

        // Step 1: Get current order ID for the user
        const orderIdRes = await axios.get(`${API_URL}/api/orders/current-order-id`, {
          params: { email }
        });
        const orderId = orderIdRes.data.orderId;

        if (!orderId) {
          setError("No order found.");
          setLoading(false);
          return;
        }

        // Step 2: Get full order details by orderId
        const orderDetailsRes = await axios.get(`${API_URL}/api/orders/${orderId}`);
        setOrder(orderDetailsRes.data.order);
      } catch (err) {
        console.error("Error loading order:", err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderIdAndDetails();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-pink-400 py-16">
        <p className="text-lg font-medium text-white">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-pink-400 py-16 px-4">
        <p className="text-red-500 text-lg font-semibold mb-6">{error || "Order not found."}</p>
        <Button asChild size="lg" className="mb-4">
          <Link to="/shop">Go to Shop</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  const totalPrice = order.products.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 py-16 px-4">
      <div className="container mx-auto max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-700">
            Thank you for your purchase. A confirmation email has been sent to{" "}
            <span className="font-semibold">{order.customerEmail}</span>.
          </p>
        </div>

        <Card className="mb-8 border border-gray-200">
          <CardContent className="flex items-center space-x-4 p-6">
            <Mail className="w-8 h-8 text-blue-500" />
            <div className="text-left">
              <h3 className="font-semibold">Confirmation Email</h3>
              <p className="text-sm text-gray-600">
                You will receive order details in your email shortly.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white shadow rounded-lg p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <ul className="divide-y divide-gray-200">
            {order.products.map((item) => (
              <li
                key={item.id}
                className="flex justify-between py-2 text-sm items-center"
              >
                <div className="flex items-center space-x-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center border border-gray-300 text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                  <span>{item.name} × {item.quantity}</span>
                </div>
                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold pt-4 border-t mt-4">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button asChild size="lg" className="w-full">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="w-full">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
