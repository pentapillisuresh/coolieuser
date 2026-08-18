import RazorpayCheckout from 'react-native-razorpay';
import { Platform } from 'react-native';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx'; // Replace with your key

export const openRazorpay = (options: {
  amount: number; // in paise
  currency: string;
  orderId: string;
  bookingId: number;
  customerName: string;
  customerEmail?: string;
  customerContact: string;
  description?: string;
}) => {
  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      description: options.description || 'Booking Payment',
      image: 'https://your-logo-url.png',
      currency: options.currency || 'INR',
      key: RAZORPAY_KEY_ID,
      amount: options.amount, // in paise
      name: 'COOLI',
      order_id: options.orderId,
      prefill: {
        contact: options.customerContact,
        email: options.customerEmail || 'customer@cooli.com',
        name: options.customerName,
      },
      theme: { color: '#17381B' },
    };

    RazorpayCheckout.open(razorpayOptions)
      .then((data:any) => {
        // Success: data.razorpay_payment_id, data.razorpay_order_id, data.razorpay_signature
        resolve(data);
      })
      .catch((error:any) => {
        reject(error);
      });
  });
};