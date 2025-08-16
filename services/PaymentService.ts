import { Platform, Alert } from 'react-native';

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
      amount: request.amount * 100, // Amount in paise
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
      // For mobile, we'll use a web view approach since native SDK requires development build
      const options = {
        description: request.description,
        image: 'https://i.imgur.com/3g7nmJC.png',
        currency: request.currency,
        key: this.config.razorpay.keyId,
        amount: request.amount * 100,
        name: 'ROZGAR',
        order_id: request.orderId,
        prefill: {
          email: request.customerInfo.email,
          contact: request.customerInfo.phone,
          name: request.customerInfo.name
        },
        theme: { color: '#2563EB' }
      };

      // For now, simulate successful payment on mobile
      // In production, you'd use RazorpayCheckout.open(options)
      return new Promise((resolve) => {
        Alert.alert(
          'Razorpay Payment',
          'This would open Razorpay payment gateway with all payment options (UPI, Cards, Net Banking, Wallets)',
          [
            {
              text: 'Cancel',
              onPress: () => resolve({
                success: false,
                error: 'Payment cancelled',
                method: 'razorpay'
              })
            },
            {
              text: 'Pay ₹' + request.amount,
              onPress: () => resolve({
                success: true,
                paymentId: `rzp_mobile_${Date.now()}`,
                orderId: request.orderId,
                signature: `sig_${Date.now()}`,
                method: 'razorpay',
              })
            }
          ]
        );
      });
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Mobile payment failed',
        method: 'razorpay',
      };
    }
  }

  private async processPhonePeWeb(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create PhonePe payment URL
      const transactionId = request.merchantTransactionId;
      const userId = request.merchantUserId;
      
      const paymentData = {
        merchantId: this.config.merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: userId,
        amount: request.amount * 100, // Convert to paise
        redirectUrl: request.redirectUrl || `${window.location.origin}/payment-success`,
        redirectMode: 'POST',
        callbackUrl: request.callbackUrl || `${window.location.origin}/payment-callback`,
        mobileNumber: request.customerInfo.phone,
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      const payload = JSON.stringify(paymentData);
      const payloadMain = btoa(payload);
      const checksum = this.generatePhonePeChecksum(payloadMain);

      // For web, open PhonePe payment page
      const paymentUrl = `${this.getBaseUrl()}/pg/v1/pay`;
      
      // Simulate PhonePe payment interface
      return new Promise((resolve) => {
        Alert.alert(
          'PhonePe Payment',
          'This would redirect to PhonePe payment gateway with UPI, Cards, and Wallet options',
          [
            {
              text: 'Cancel',
              onPress: () => resolve({
                success: false,
                error: 'Payment cancelled',
                method: 'phonepe'
              })
            },
            {
              text: 'Pay ₹' + request.amount,
              onPress: () => resolve({
                success: true,
                paymentId: `phonepe_${Date.now()}`,
                orderId: transactionId,
                method: 'phonepe',
              })
            }
          ]
        );
      });
    } catch (error) {
      return {
        success: false,
        error: error.message || 'PhonePe payment failed',
        method: 'phonepe',
      };
    }
  }

  private async processPhonePeMobile(request: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
    // For mobile, simulate PhonePe SDK integration
    return new Promise((resolve) => {
      Alert.alert(
        'PhonePe Payment',
        'This would open PhonePe app with payment options',
        [
          {
            text: 'Cancel',
            onPress: () => resolve({
              success: false,
              message: 'Payment cancelled'
            })
          },
          {
            text: 'Pay ₹' + (request.amount),
            onPress: () => resolve({
              success: true,
              code: 'PAYMENT_SUCCESS',
              message: 'Payment completed successfully',
              data: {
                merchantId: this.config.merchantId,
                merchantTransactionId: request.merchantTransactionId,
                transactionId: `T${Date.now()}`,
                amount: request.amount * 100,
                state: 'COMPLETED',
                responseCode: 'SUCCESS'
              }
            })
          }
        ]
      );
    });
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production' 
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  }

  private generatePhonePeChecksum(payload: string): string {
    const string = payload + '/pg/v1/pay' + this.config.saltKey;
    const sha256 = CryptoJS.SHA256(string);
    return sha256.toString(CryptoJS.enc.Hex) + '###' + this.config.saltIndex;
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