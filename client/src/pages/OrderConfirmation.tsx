import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail } from 'lucide-react';

const OrderConfirmation = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Card className="w-full max-w-md">
              <CardContent className="flex items-center space-x-4 p-6">
                <Mail className="w-8 h-8 text-blue-500" />
                <div className="text-left">
                  <h3 className="font-semibold">Confirmation Email</h3>
                  <p className="text-sm text-gray-600">
                    A confirmation email has been sent to your email address.
                  </p>
                </div>
              </CardContent>
            </Card>
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
