import { Platform } from 'react-native';

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
  private razorpayKeyId = 'rzp_test_uO9KUIRRmFD0rp';

  async processRazorpayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (Platform.OS === 'web') {
        return await this.processRazorpayWeb(request);
      } else {
        // For mobile, you would need to install react-native-razorpay
        // For now, simulate success
        return {
          success: true,
          paymentId: `rzp_${Date.now()}`,
          orderId: request.orderId,
          method: 'razorpay',
        };
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
      // For demo purposes, simulate PhonePe payment
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            paymentId: `phonepe_${Date.now()}`,
            orderId: request.orderId,
            method: 'phonepe',
          });
        }, 2000);
      });
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
      const loadScript = () => {
        return new Promise((scriptResolve, scriptReject) => {
          if (window.Razorpay) {
            scriptResolve(true);
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => scriptResolve(true);
          script.onerror = () => scriptReject(new Error('Razorpay script failed to load'));
          document.head.appendChild(script);
        });
      };

      loadScript()
        .then(() => {
          const options = {
            key: this.razorpayKeyId,
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
            handler: function (response: any) {
              console.log('Razorpay success:', response);
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
          
          rzp.on('payment.failed', function (response: any) {
            console.log('Razorpay failed:', response);
            resolve({
              success: false,
              error: response.error?.description || 'Payment failed',
              method: 'razorpay',
            });
          });

          rzp.open();
        })
        .catch((error) => {
          resolve({
            success: false,
            error: 'Failed to load payment gateway',
            method: 'razorpay',
          });
        });
    });
  }
}

export const paymentService = new PaymentService();

// Declare global Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}