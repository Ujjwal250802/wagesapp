// services/PaymentService.ts
import RazorpayCheckout from 'react-native-razorpay';
import * as WebBrowser from 'expo-web-browser';
import { phonePeService } from './PhonePeService';

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export const paymentService = {
  async processRazorpayPayment(request: PaymentRequest) {
    return new Promise((resolve) => {
      const options = {
        description: request.description,
        image: 'https://your-logo.png',
        currency: request.currency,
        key: 'rzp_test_xxxxxxx', // 🔑 replace with your Razorpay test key
        amount: request.amount * 100, // in paise
        name: 'Rozgar Payments',
        order_id: request.orderId,
        prefill: {
          name: request.customerInfo.name,
          email: request.customerInfo.email,
          contact: request.customerInfo.phone,
        },
        theme: { color: '#3399cc' },
      };

      RazorpayCheckout.open(options)
        .then((data: any) => {
          resolve({
            success: true,
            paymentId: data.razorpay_payment_id,
            orderId: data.razorpay_order_id,
            signature: data.razorpay_signature,
          });
        })
        .catch((error: any) => {
          resolve({ success: false, error: error.description });
        });
    });
  },

  async processPhonePePayment(request: PaymentRequest) {
    try {
      const result = await phonePeService.createPayment(request);

      if (result.success && result.redirectUrl) {
        await WebBrowser.openBrowserAsync(result.redirectUrl);
        return { success: true, initiated: true };
      } else {
        return { success: false, error: result.error || 'Failed to create PhonePe payment' };
      }
    } catch (error) {
      return { success: false, error: 'PhonePe payment init failed' };
    }
  },
};
