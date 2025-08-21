// services/PaymentService.ts
import * as WebBrowser from 'expo-web-browser';
import { phonePeService } from './PhonePeService';

export const paymentService = {
  async processRazorpayPayment(request: any) {
    try {
      // ⚡ Call your backend API to create Razorpay order
      const order = await fetch('https://your-backend.com/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: request.amount, currency: request.currency }),
      }).then(res => res.json());

      if (order && order.checkoutUrl) {
        await WebBrowser.openBrowserAsync(order.checkoutUrl);
        return { success: true, initiated: true };
      } else {
        return { success: false, error: 'Failed to create Razorpay order' };
      }
    } catch (error) {
      return { success: false, error: 'Razorpay init failed' };
    }
  },

  async processPhonePePayment(request: any) {
    try {
      const result = await phonePeService.createPayment(request);
      if (result.success && result.redirectUrl) {
        await WebBrowser.openBrowserAsync(result.redirectUrl);
        return { success: true, initiated: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'PhonePe init failed' };
    }
  }
};
