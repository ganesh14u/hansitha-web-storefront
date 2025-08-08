import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
  const [searchParams] = useSearchParams();

  // Try getting orderId from either orderId or razorpay_payment_link_reference_id
  const orderId =
    searchParams.get("orderId") || searchParams.get("razorpay_payment_link_reference_id");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID found in URL.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${orderId}`);
        setOrder(res.data.order);
      } catch (err) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500">{error || "Order not found."}</p>
        <Button asChild>
          <Link to="/shop">Go to Shop</Link>
        </Button>
      </div>
    );
  }

  const totalPrice = order.products.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. A confirmation email has been sent to{" "}
              {order.customerEmail}.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Card className="w-full max-w-md">
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
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <ul className="divide-y">
              {order.products.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between py-2 text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    ₹
                    {(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold pt-4 border-t mt-4">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
            <br />
            <Button variant="outline" asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
