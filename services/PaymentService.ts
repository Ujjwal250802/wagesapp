import { Platform } from 'react-native';

export interface PaymentConfig {
  razorpay: {
    keyId: string;
    keySecret: string;
  };
  phonepe: {
    merchantId: string;
    saltKey: string;
    saltIndex: number;
  };
}

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

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
  method: 'razorpay' | 'phonepe';
}

class PaymentService {
  private config: PaymentConfig = {
    razorpay: {
      keyId: 'rzp_test_uO9KUIRRmFD0rp',
      keySecret: 'ZsmuBYvapWYZ4IkpMRWCZWpo',
    },
    phonepe: {
      merchantId: 'PGTESTPAYUAT',
      saltKey: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
      saltIndex: 1,
    },
  };

  async processRazorpayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (Platform.OS === 'web') {
        return await this.processRazorpayWeb(request);
      } else {
        return await this.processRazorpayMobile(request);
      }
    } catch (error) {
      console.error('Razorpay payment error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
        method: 'razorpay',
      };
    }
  }

  async processPhonePePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (Platform.OS === 'web') {
        return await this.processPhonePeWeb(request);
      } else {
        return await this.processPhonePeMobile(request);
      }
    } catch (error) {
      console.error('PhonePe payment error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed',
        method: 'phonepe',
      };
    }
  }

  private async processRazorpayWeb(request: PaymentRequest): Promise<PaymentResponse> {
    return new Promise((resolve) => {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => this.openRazorpayCheckout(request, resolve);
        script.onerror = () => resolve({
          success: false,
          error: 'Failed to load Razorpay',
          method: 'razorpay',
        });
        document.body.appendChild(script);
      } else {
        this.openRazorpayCheckout(request, resolve);
      }
    });
  }

  private openRazorpayCheckout(
    request: PaymentRequest, 
    resolve: (value: PaymentResponse) => void
  ) {
    const options = {
      key: this.config.razorpay.keyId,
      amount: request.amount * 100,
      currency: request.currency,
      name: 'ROZGAR',
      description: request.description,
      order_id: request.orderId,
      prefill: {
        name: request.customerInfo.name,
        email: request.customerInfo.email,
        contact: request.customerInfo.phone,
      },
      theme: {
        color: '#2563EB',
      },
      handler: function (response: any) {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          method: 'razorpay',
        });
      },
      modal: {
        ondismiss: function() {
          resolve({
            success: false,
            error: 'Payment cancelled by user',
            method: 'razorpay',
          });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  private async processRazorpayMobile(request: PaymentRequest): Promise<PaymentResponse> {
    // For mobile, you would integrate with @razorpay/react-native-razorpay
    // This requires ejecting from Expo or using a development build
    // For now, we'll simulate the payment
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentId: `rzp_mobile_${Date.now()}`,
          orderId: request.orderId,
          method: 'razorpay',
        });
      }, 2000);
    });
  }

  private async processPhonePeWeb(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create PhonePe payment request
      const transactionId = `TXN_${Date.now()}`;
      const userId = `USER_${Date.now()}`;
      
      const paymentData = {
        merchantId: this.config.phonepe.merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: userId,
        amount: request.amount * 100,
        redirectUrl: `${window.location.origin}/payment-success`,
        redirectMode: 'POST',
        callbackUrl: `${window.location.origin}/payment-callback`,
        mobileNumber: request.customerInfo.phone,
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      // Generate checksum (simplified for demo)
      const payload = JSON.stringify(paymentData);
      const payloadMain = btoa(payload);
      const checksum = await this.generatePhonePeChecksum(payloadMain);

      // For demo purposes, we'll simulate the payment
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            paymentId: `phonepe_${Date.now()}`,
            orderId: transactionId,
            method: 'phonepe',
          });
        }, 2000);
      });
    } catch (error) {
      return {
        success: false,
        error: error.message || 'PhonePe payment failed',
        method: 'phonepe',
      };
    }
  }

  private async processPhonePeMobile(request: PaymentRequest): Promise<PaymentResponse> {
    // For mobile, you would integrate with PhonePe SDK
    // For now, we'll simulate the payment
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentId: `phonepe_mobile_${Date.now()}`,
          orderId: request.orderId,
          method: 'phonepe',
        });
      }, 2000);
    });
  }

  private async generatePhonePeChecksum(payload: string): Promise<string> {
    // In a real implementation, this should be done on your backend
    // This is a simplified version for demo purposes
    const string = payload + '/pg/v1/pay' + this.config.phonepe.saltKey;
    
    // For demo, return a mock checksum
    return `${btoa(string)}###${this.config.phonepe.saltIndex}`;
  }

  async verifyPayment(paymentId: string, method: 'razorpay' | 'phonepe'): Promise<boolean> {
    try {
      if (method === 'razorpay') {
        return await this.verifyRazorpayPayment(paymentId);
      } else {
        return await this.verifyPhonePePayment(paymentId);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  private async verifyRazorpayPayment(paymentId: string): Promise<boolean> {
    // In a real app, verify payment on your backend
    // For demo, assume all payments are valid
    return true;
  }

  private async verifyPhonePePayment(paymentId: string): Promise<boolean> {
    // In a real app, verify payment on your backend
    // For demo, assume all payments are valid
    return true;
  }
}

export const paymentService = new PaymentService();

// Declare global Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}