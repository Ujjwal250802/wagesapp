import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';

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
      amount: request.amount * 100, // Convert to paise
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
      method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true,
        emi: false,
        paylater: false
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
    try {
      // For mobile, open Razorpay web checkout in browser
      const checkoutUrl = this.generateRazorpayMobileUrl(request);
      const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: '#2563EB',
      });

      if (result.type === 'cancel') {
        return {
          success: false,
          error: 'Payment cancelled by user',
          method: 'razorpay',
        };
      }

      // For demo purposes, simulate success
      return {
        success: true,
        paymentId: `rzp_mobile_${Date.now()}`,
        orderId: request.orderId,
        method: 'razorpay',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Mobile payment failed',
        method: 'razorpay',
      };
    }
  }

  private generateRazorpayMobileUrl(request: PaymentRequest): string {
    const params = new URLSearchParams({
      key_id: this.config.razorpay.keyId,
      amount: (request.amount * 100).toString(),
      currency: request.currency,
      name: 'ROZGAR',
      description: request.description,
      order_id: request.orderId,
      'prefill[name]': request.customerInfo.name,
      'prefill[email]': request.customerInfo.email,
      'prefill[contact]': request.customerInfo.phone,
      'theme[color]': '#2563EB',
    });

    return `https://checkout.razorpay.com/v1/checkout.js?${params.toString()}`;
  }

  private async processPhonePeWeb(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create PhonePe payment URL
      const transactionId = `TXN_${Date.now()}`;
      const userId = `USER_${Date.now()}`;
      
      const paymentData = {
        merchantId: this.config.phonepe.merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: userId,
        amount: request.amount * 100, // Convert to paise
        redirectUrl: `${window.location.origin}/payment-success`,
        redirectMode: 'POST',
        callbackUrl: `${window.location.origin}/payment-callback`,
        mobileNumber: request.customerInfo.phone,
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      // Generate checksum
      const payload = JSON.stringify(paymentData);
      const payloadMain = btoa(payload);
      const checksum = await this.generatePhonePeChecksum(payloadMain);

      // Open PhonePe payment page
      const phonePeUrl = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay`;
      
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = phonePeUrl;
      form.style.display = 'none';

      const requestInput = document.createElement('input');
      requestInput.name = 'request';
      requestInput.value = payloadMain;
      form.appendChild(requestInput);

      const checksumInput = document.createElement('input');
      checksumInput.name = 'X-VERIFY';
      checksumInput.value = checksum;
      form.appendChild(checksumInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      return {
        success: true,
        paymentId: transactionId,
        orderId: transactionId,
        method: 'phonepe',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'PhonePe payment failed',
        method: 'phonepe',
      };
    }
  }

  private async processPhonePeMobile(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = `TXN_${Date.now()}`;
      
      // For mobile, open PhonePe deep link or web interface
      const phonePeUrl = `phonepe://pay?pa=merchant@paytm&pn=ROZGAR&am=${request.amount}&cu=INR&tn=${request.description}`;
      
      const result = await WebBrowser.openBrowserAsync(phonePeUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
        controlsColor: '#5F259F',
      });

      if (result.type === 'cancel') {
        return {
          success: false,
          error: 'Payment cancelled by user',
          method: 'phonepe',
        };
      }

      return {
        success: true,
        paymentId: `phonepe_mobile_${Date.now()}`,
        orderId: transactionId,
        method: 'phonepe',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Mobile payment failed',
        method: 'phonepe',
      };
    }
  }

  private async generatePhonePeChecksum(payload: string): Promise<string> {
    // In a real implementation, this should be done on your backend
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