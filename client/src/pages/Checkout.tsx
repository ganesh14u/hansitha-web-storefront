import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { calculatePricing } from "../utils/pricing"; // <-- shared utility

const Cart: React.FC = () => {
  const { cartItems, getTotalPrice, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const subtotal = getTotalPrice();
  const { shipping, tax, total } = calculatePricing(subtotal);

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 p-8">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex items-center space-x-4 py-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{item.name}</h3>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-gray-800 font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <SummaryRow label="Subtotal" value={subtotal} />
                    <SummaryRow label="Shipping" value={shipping} />
                    <SummaryRow label="Tax (5%)" value={tax} />
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>
                        ₹
                        {total.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4 bg-black text-white hover:bg-gray-900"
                    onClick={() => navigate("/checkout")}
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between">
    <span>{label}</span>
    <span>₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
  </div>
);

export default Cart;
