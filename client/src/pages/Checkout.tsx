import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { calculatePricing } from "../utils/pricing";
import { TruckButton } from "../components/TruckButton";

const API_URL = import.meta.env.VITE_API_URL;

const Checkout: React.FC = () => {
  const { cartItems, getTotalPrice } = useCart();
  const { reloadProducts } = useProducts();
  reloadProducts();

  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [animateTruck, setAnimateTruck] = useState(false);

  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [hasOrdered, setHasOrdered] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = useMemo(() => {
    return (
      formData.email.trim() !== "" &&
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.phone.trim() !== ""
    );
  }, [formData]);

  const validateForm = () => {
    const requiredFields = ["email", "firstName", "lastName", "phone"];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Error",
          description: `Please fill in the ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} field.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  // Calculate subtotal
  const subtotal = getTotalPrice();

  // Redirect to cart if subtotal is 0 (empty cart), but only if user has NOT just ordered
  useEffect(() => {
    if (subtotal === 0 && !hasOrdered) {
      navigate("/cart");
    }
  }, [subtotal, navigate, hasOrdered]);

  // Redirect to payment link once order is placed
  useEffect(() => {
    if (hasOrdered && paymentLink) {
      window.location.href = paymentLink;
    }
  }, [hasOrdered, paymentLink]);

  const { shipping, tax, total } = calculatePricing(subtotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Start animation immediately
    setAnimateTruck(true);
    setIsProcessing(true);

    try {
      const { email, firstName, lastName, phone } = formData;

      const res = await axios.post(`${API_URL}/api/checkout/payment-link`, {
        userName: `${firstName} ${lastName}`,
        userEmail: email,
        userPhone: phone,
        cartItems,
        totalAmount: total,
      });

      const link = res.data.paymentLink.short_url;

      // Wait 3 seconds to let animation play
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPaymentLink(link);
      setHasOrdered(true);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "Failed to get payment link",
        variant: "destructive",
      });

      setAnimateTruck(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-pink-400 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <CheckoutSection
                icon={<User className="w-5 h-5" />}
                title="Contact Information"
                fields={[
                  { id: "email", label: "Email Address" },
                  { id: "firstName", label: "First Name" },
                  { id: "lastName", label: "Last Name" },
                  { id: "phone", label: "Phone Number", maxLength: 10 },
                ]}
                formData={formData}
                handleChange={handleInputChange}
              />
            </div>

            <div className="lg:sticky lg:top-8 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="text-gray-600 text-sm">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ₹
                          {(item.price * item.quantity).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <SummaryRow label="Subtotal" value={subtotal} />
                      <SummaryRow label="Shipping" value={shipping} />
                      <SummaryRow label="Tax" value={tax} />
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

                    {/* Centered Truck Button */}
                    <div className="mt-6 flex justify-center">
                      <TruckButton
                        type="submit"
                        disabled={!isFormValid || isProcessing}
                        animate={animateTruck}
                        onClick={(e) => {
                          if (!isFormValid) {
                            e.preventDefault();
                            toast({
                              title: "Error",
                              description:
                                "Please fill in all required fields to proceed with your order.",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>

                    <p className="text-sm text-center text-gray-600 flex items-center justify-center gap-1 mt-2">
                      <Lock className="w-3 h-3" /> Your order details are safe
                      and secure.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

// Reusable Components
const InputGroup = ({
  id,
  label,
  value,
  onChange,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
}) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
    />
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between">
    <span>{label}</span>
    <span>₹{value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
  </div>
);

const CheckoutSection = ({
  icon,
  title,
  fields,
  formData,
  handleChange,
}: {
  icon: React.ReactNode;
  title: string;
  fields: { id: string; label: string; maxLength?: number }[];
  formData: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon} {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {fields.map((field) => (
        <InputGroup
          key={field.id}
          id={field.id}
          label={field.label}
          value={formData[field.id]}
          onChange={handleChange}
          maxLength={field.maxLength}
        />
      ))}
    </CardContent>
  </Card>
);
