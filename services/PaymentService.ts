import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

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
  private phonePeMerchantId = 'PGTESTPAYUAT';

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
      // Load Razorpay script dynamically
      const loadRazorpayScript = () => {
        return new Promise((scriptResolve, scriptReject) => {
          if (window.Razorpay) {
            scriptResolve(true);
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => scriptResolve(true);
          script.onerror = () => scriptReject(new Error('Failed to load Razorpay script'));
          document.head.appendChild(script);
        });
      };

      loadRazorpayScript()
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

  private async processRazorpayMobile(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // For mobile, create a payment URL that opens Razorpay checkout
      const paymentData = {
        key: this.razorpayKeyId,
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
      };

      // Create a simple HTML page with Razorpay integration
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment - ROZGAR</title>
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: #f8fafc;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
              width: 100%;
            }
            .logo { color: #2563EB; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .amount { font-size: 32px; font-weight: bold; color: #16A34A; margin: 20px 0; }
            .description { color: #6B7280; margin-bottom: 30px; }
            .pay-button {
              background: #2563EB;
              color: white;
              border: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              width: 100%;
            }
            .pay-button:hover { background: #1D4ED8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">ROZGAR</div>
            <div class="amount">₹${request.amount}</div>
            <div class="description">${request.description}</div>
            <button class="pay-button" onclick="startPayment()">Pay with Razorpay</button>
          </div>
          
          <script>
            function startPayment() {
              const options = ${JSON.stringify(paymentData)};
              options.handler = function(response) {
                window.postMessage({
                  type: 'PAYMENT_SUCCESS',
                  data: response
                }, '*');
              };
              options.modal = {
                ondismiss: function() {
                  window.postMessage({
                    type: 'PAYMENT_CANCELLED'
                  }, '*');
                }
              };
              
              const rzp = new Razorpay(options);
              rzp.on('payment.failed', function(response) {
                window.postMessage({
                  type: 'PAYMENT_FAILED',
                  error: response.error
                }, '*');
              });
              rzp.open();
            }
            
            // Auto-start payment
            setTimeout(startPayment, 1000);
          </script>
        </body>
        </html>
      `;

      // Create blob URL for the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const result = await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: '#2563EB',
      });

      // Clean up blob URL
      URL.revokeObjectURL(url);

      // For demo purposes, simulate success after browser closes
      return {
        success: true,
        paymentId: `rzp_${Date.now()}`,
        orderId: request.orderId,
        method: 'razorpay',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to open payment gateway',
        method: 'razorpay',
      };
    }
  }

  private async processPhonePeWeb(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = `TXN_${Date.now()}`;
      
      // Create PhonePe payment URL for web
      const paymentUrl = `https://mercury-t2.phonepe.com/transact/simulate?merchantId=${this.phonePeMerchantId}&merchantTransactionId=${transactionId}&amount=${request.amount * 100}`;
      
      const result = await WebBrowser.openBrowserAsync(paymentUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: '#5F259F',
      });

      // For demo purposes, simulate success
      return {
        success: true,
        paymentId: `phonepe_${Date.now()}`,
        orderId: request.orderId,
        method: 'phonepe',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to open PhonePe',
        method: 'phonepe',
      };
    }
  }

  private async processPhonePeMobile(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = `TXN_${Date.now()}`;
      
      // Create a simple HTML page for PhonePe payment
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PhonePe Payment - ROZGAR</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: linear-gradient(135deg, #5F259F, #8B5CF6);
              color: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: rgba(255,255,255,0.1);
              backdrop-filter: blur(10px);
              padding: 30px;
              border-radius: 16px;
              text-align: center;
              max-width: 400px;
              width: 100%;
              border: 1px solid rgba(255,255,255,0.2);
            }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .amount { font-size: 32px; font-weight: bold; margin: 20px 0; }
            .description { opacity: 0.9; margin-bottom: 30px; }
            .pay-button {
              background: white;
              color: #5F259F;
              border: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              width: 100%;
              margin-bottom: 20px;
            }
            .pay-button:hover { background: #f3f4f6; }
            .phonepe-logo {
              background: white;
              color: #5F259F;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: bold;
              display: inline-block;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="phonepe-logo">PhonePe</div>
            <div class="logo">ROZGAR Payment</div>
            <div class="amount">₹${request.amount}</div>
            <div class="description">${request.description}</div>
            <button class="pay-button" onclick="processPayment()">Pay with PhonePe</button>
            <div style="font-size: 12px; opacity: 0.8;">
              Secure payment powered by PhonePe
            </div>
          </div>
          
          <script>
            function processPayment() {
              // Simulate payment processing
              document.querySelector('.pay-button').textContent = 'Processing...';
              document.querySelector('.pay-button').disabled = true;
              
              setTimeout(() => {
                document.querySelector('.container').innerHTML = \`
                  <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Payment Successful!</div>
                    <div style="font-size: 18px; margin-bottom: 20px;">₹${request.amount}</div>
                    <div style="font-size: 14px; opacity: 0.8;">Transaction ID: phonepe_\${Date.now()}</div>
                  </div>
                \`;
                
                // Auto close after 3 seconds
                setTimeout(() => {
                  window.close();
                }, 3000);
              }, 2000);
            }
          </script>
        </body>
        </html>
      `;

      // Create blob URL for the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      const result = await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: '#5F259F',
      });

      // Clean up blob URL
      URL.revokeObjectURL(url);

      return {
        success: true,
        paymentId: `phonepe_${Date.now()}`,
        orderId: request.orderId,
        method: 'phonepe',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to open PhonePe',
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
            resolve({
              success: false,
              error: response.error?.description || 'Payment failed',
              method: 'razorpay',
            });
          });

          rzp.open();
        })
        .catch(() => {
          resolve({
            success: false,
            error: 'Failed to load Razorpay',
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