import { Platform } from 'react-native';

const BACKEND_URL = __DEV__ 
  ? 'http://localhost:5000' 
  : 'https://your-production-backend.com';

export interface RazorpayOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: {
    worker_name?: string;
    job_title?: string;
    employer_id?: string;
    worker_id?: string;
  };
}

export interface RazorpayOrderResponse {
  success: boolean;
  order?: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };
  error?: string;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerificationResponse {
  success: boolean;
  message: string;
  payment?: {
    id: string;
    amount: number;
    status: string;
    method: string;
    created_at: number;
  };
  error?: string;
}

class RazorpayService {
  private razorpayKeyId = 'rzp_test_uO9KUIRRmFD0rp';

  async createOrder(request: RazorpayOrderRequest): Promise<RazorpayOrderResponse> {
    try {
      console.log('Creating Razorpay order:', request);
      
      const response = await fetch(`${BACKEND_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency || 'INR',
          receipt: request.receipt || `receipt_${Date.now()}`,
          notes: request.notes || {},
        }),
      });

      const data = await response.json();
      console.log('Order creation response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return {
        success: false,
        error: error.message || 'Network error while creating order',
      };
    }
  }

  async verifyPayment(verification: RazorpayPaymentVerification): Promise<RazorpayVerificationResponse> {
    try {
      console.log('Verifying Razorpay payment:', verification);
      
      const response = await fetch(`${BACKEND_URL}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verification),
      });

      const data = await response.json();
      console.log('Payment verification response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        message: error.message || 'Network error during verification',
      };
    }
  }

  async processPayment(orderData: any, customerInfo: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'web') {
        this.processWebPayment(orderData, customerInfo, resolve, reject);
      } else {
        // For mobile, you would use react-native-razorpay
        // Since it's not installed, we'll simulate the flow
        this.simulateMobilePayment(orderData, customerInfo, resolve, reject);
      }
    });
  }

  private processWebPayment(orderData: any, customerInfo: any, resolve: any, reject: any) {
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
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'ROZGAR',
          description: `Payment to ${customerInfo.workerName}`,
          order_id: orderData.id,
          prefill: {
            name: customerInfo.name || 'Employer',
            email: customerInfo.email || 'employer@rozgar.com',
            contact: customerInfo.phone || '9999999999',
          },
          theme: {
            color: '#2563EB',
          },
          handler: async (response: any) => {
            console.log('Razorpay payment success:', response);
            
            // Verify payment on backend
            const verification = await this.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success) {
              resolve({
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                method: 'razorpay',
                amount: orderData.amount / 100, // Convert back from paise
                verified: true,
              });
            } else {
              reject(new Error(verification.message || 'Payment verification failed'));
            }
          },
          modal: {
            ondismiss: function() {
              reject(new Error('Payment cancelled by user'));
            },
          },
        };

        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response: any) {
          console.log('Razorpay payment failed:', response);
          reject(new Error(response.error?.description || 'Payment failed'));
        });

        rzp.open();
      })
      .catch((error) => {
        reject(new Error('Failed to load Razorpay payment gateway'));
      });
  }

  private simulateMobilePayment(orderData: any, customerInfo: any, resolve: any, reject: any) {
    // For mobile implementation, you would use:
    // import RazorpayCheckout from 'react-native-razorpay';
    
    // Simulate mobile payment for now
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      if (isSuccess) {
        const mockResponse = {
          razorpay_payment_id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          razorpay_order_id: orderData.id,
          razorpay_signature: `sig_${Math.random().toString(36).substr(2, 16)}`,
        };

        // Verify payment
        this.verifyPayment(mockResponse).then((verification) => {
          if (verification.success) {
            resolve({
              success: true,
              paymentId: mockResponse.razorpay_payment_id,
              orderId: mockResponse.razorpay_order_id,
              signature: mockResponse.razorpay_signature,
              method: 'razorpay',
              amount: orderData.amount / 100,
              verified: true,
            });
          } else {
            reject(new Error('Payment verification failed'));
          }
        });
      } else {
        reject(new Error('Payment failed. Please try again.'));
      }
    }, 2000);
  }

  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Backend server not reachable:', error);
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();

// Declare global Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}