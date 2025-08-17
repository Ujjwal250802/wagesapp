import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

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
      // Create order first (in real app, this should be done on backend)
      const orderData = {
        amount: request.amount * 100, // Convert to paise
        currency: request.currency,
        receipt: request.orderId,
      };

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
      image: '/assets/images/icon.png', // Your app logo
      order_id: request.orderId,
      prefill: {
        name: request.customerInfo.name,
        email: request.customerInfo.email,
        contact: request.customerInfo.phone,
      },
      notes: {
        address: 'ROZGAR Payment',
      },
      theme: {
        color: '#2563EB',
      },
      method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true,
        emi: true,
        paylater: true,
      },
      handler: function (response: any) {
        console.log('Razorpay payment success:', response);
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
          console.log('Razorpay payment dismissed');
          resolve({
            success: false,
            error: 'Payment cancelled by user',
            method: 'razorpay',
          });
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      console.log('Razorpay payment failed:', response.error);
      resolve({
        success: false,
        error: response.error.description || 'Payment failed',
        method: 'razorpay',
      });
    });

    rzp.open();
  }

  private async processRazorpayMobile(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create a payment URL for mobile
      const paymentUrl = this.createRazorpayMobileUrl(request);
      
      // Open in browser
      const result = await WebBrowser.openBrowserAsync(paymentUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: '#2563EB',
      });

      // For mobile, we'll need to handle the callback differently
      // This is a simplified version - in production, you'd handle deep links
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            paymentId: `rzp_mobile_${Date.now()}`,
            orderId: request.orderId,
            method: 'razorpay',
          });
        }, 3000);
      });
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to open payment gateway',
        method: 'razorpay',
      };
    }
  }

  private createRazorpayMobileUrl(request: PaymentRequest): string {
    const params = new URLSearchParams({
      key_id: this.config.razorpay.keyId,
      amount: (request.amount * 100).toString(),
      currency: request.currency,
      name: 'ROZGAR',
      description: request.description,
      order_id: request.orderId,
      prefill_name: request.customerInfo.name,
      prefill_email: request.customerInfo.email,
      prefill_contact: request.customerInfo.phone,
      theme_color: '#2563EB',
    });

    return `https://checkout.razorpay.com/v1/checkout.js?${params.toString()}`;
  }

  private async processPhonePeWeb(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create PhonePe payment URL
      const paymentUrl = await this.createPhonePePaymentUrl(request);
      
      // Open PhonePe payment page in new window
      const paymentWindow = window.open(
        paymentUrl,
        'phonepe_payment',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      return new Promise((resolve) => {
        // Monitor the payment window
        const checkClosed = setInterval(() => {
          if (paymentWindow?.closed) {
            clearInterval(checkClosed);
            // In real implementation, you'd check the payment status via API
            resolve({
              success: true,
              paymentId: `phonepe_${Date.now()}`,
              orderId: request.orderId,
              method: 'phonepe',
            });
          }
        }, 1000);

        // Timeout after 10 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          if (paymentWindow && !paymentWindow.closed) {
            paymentWindow.close();
          }
          resolve({
            success: false,
            error: 'Payment timeout',
            method: 'phonepe',
          });
        }, 600000);
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
    try {
      // Create PhonePe payment URL
      const paymentUrl = await this.createPhonePePaymentUrl(request);
      
      // Open in browser
      const result = await WebBrowser.openBrowserAsync(paymentUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: '#5F259F',
      });

      // For mobile, we'll need to handle the callback differently
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            paymentId: `phonepe_mobile_${Date.now()}`,
            orderId: request.orderId,
            method: 'phonepe',
          });
        }, 3000);
      });
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to open PhonePe',
        method: 'phonepe',
      };
    }
  }

  private async createPhonePePaymentUrl(request: PaymentRequest): Promise<string> {
    const transactionId = `TXN_${Date.now()}`;
    const userId = `USER_${Date.now()}`;
    
    const paymentData = {
      merchantId: this.config.phonepe.merchantId,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: request.amount * 100, // Convert to paise
      redirectUrl: `${window.location.origin}/payment-success?method=phonepe&txnId=${transactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${window.location.origin}/payment-callback`,
      mobileNumber: request.customerInfo.phone,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    // In production, this should be done on your backend
    const payload = JSON.stringify(paymentData);
    const payloadMain = btoa(payload);
    const checksum = await this.generatePhonePeChecksum(payloadMain);

    // PhonePe test environment URL
    const baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    
    // Create form data for POST request
    const formData = new FormData();
    formData.append('request', payloadMain);
    
    // For demo, return a mock PhonePe URL
    // In production, you'd make a POST request to PhonePe API and get the redirect URL
    return `https://mercury-t2.phonepe.com/transact/simulate?merchantId=${this.config.phonepe.merchantId}&merchantTransactionId=${transactionId}&amount=${request.amount * 100}`;
  }

  private async generatePhonePeChecksum(payload: string): Promise<string> {
    // In production, this should be done on your backend for security
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
    try {
      // In production, verify payment on your backend
      const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(this.config.razorpay.keyId + ':' + this.config.razorpay.keySecret)}`,
        },
      });
      
      const paymentData = await response.json();
      return paymentData.status === 'captured';
    } catch (error) {
      console.error('Razorpay verification error:', error);
      return false;
    }
  }

  private async verifyPhonePePayment(paymentId: string): Promise<boolean> {
    // In production, verify payment on your backend
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