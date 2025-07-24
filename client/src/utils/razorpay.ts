// utils/razorpay.ts
import axios from 'axios';

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async ({
  amount,
  items,
  onSuccess,
  onFailure,
}: {
  amount: number;
  items: { name: string; quantity: number; price: number }[];
  onSuccess: () => void;
  onFailure?: () => void;
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  try {
    const orderRes = await axios.post(`http://localhost:5000/api/payment/orders`, {
      amount: amount * 100,
    });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
      amount: orderRes.data.amount,
      currency: 'INR',
      name: 'My Store',
      description: 'Order Payment',
      order_id: orderRes.data.id,
      handler: async function (response: any) {
        try {
          await axios.post(`http://localhost:5000/api/payment/verify`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items,
            amount,
          });
          onSuccess();
        } catch (err) {
          console.error('Payment verification failed:', err);
          alert('Payment succeeded but verification failed. Contact support.');
          onFailure?.();
        }
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999',
      },
      notes: {
        items: JSON.stringify(items),
      },
      theme: {
        color: '#6366f1',
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error('Payment failed:', err);
    alert('Something went wrong. Please try again.');
    onFailure?.();
  }
};
