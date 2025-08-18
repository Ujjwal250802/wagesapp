import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export interface PhonePePaymentRequest {
  amount: number;
  merchantTransactionId: string;
  merchantUserId: string;
  callbackUrl?: string;
  mobileNumber?: string;
}

export interface PhonePePaymentResponse {
  success: boolean;
  data?: any;
  error?: string;
  transactionId?: string;
}

class PhonePeService {
  private merchantId = 'PGTESTPAYUAT';
  private saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
  private saltIndex = 1;
  private baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

  async initiatePayment(request: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
    try {
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: request.merchantTransactionId,
        merchantUserId: request.merchantUserId,
        amount: request.amount * 100, // Convert to paise
        redirectUrl: request.callbackUrl || 'https://rozgar.app/payment-callback',
        redirectMode: 'POST',
        callbackUrl: request.callbackUrl || 'https://rozgar.app/payment-callback',
        mobileNumber: request.mobileNumber || '9999999999',
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const base64Payload = btoa(JSON.stringify(payload));
      const checksum = this.generateChecksum(base64Payload);

      const requestBody = {
        request: base64Payload
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'accept': 'application/json'
      };

      const response = await fetch(`${this.baseUrl}/pg/v1/pay`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();

      if (responseData.success && responseData.data?.instrumentResponse?.redirectInfo?.url) {
        // Open payment URL
        if (Platform.OS === 'web') {
          window.open(responseData.data.instrumentResponse.redirectInfo.url, '_blank');
        } else {
          await WebBrowser.openBrowserAsync(responseData.data.instrumentResponse.redirectInfo.url, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            showTitle: true,
            toolbarColor: '#5F259F',
          });
        }

        return {
          success: true,
          data: responseData.data,
          transactionId: request.merchantTransactionId
        };
      } else {
        return {
          success: false,
          error: responseData.message || 'Failed to initiate payment'
        };
      }
    } catch (error) {
      console.error('PhonePe payment initiation error:', error);
      return {
        success: false,
        error: error.message || 'Payment initiation failed'
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<PhonePePaymentResponse> {
    try {
      const checksum = this.generateChecksum(`/pg/v1/status/${this.merchantId}/${transactionId}`);

      const headers = {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': this.merchantId,
        'accept': 'application/json'
      };

      const response = await fetch(
        `${this.baseUrl}/pg/v1/status/${this.merchantId}/${transactionId}`,
        {
          method: 'GET',
          headers: headers
        }
      );

      const responseData = await response.json();

      return {
        success: responseData.success || false,
        data: responseData.data,
        error: responseData.message
      };
    } catch (error) {
      console.error('PhonePe status check error:', error);
      return {
        success: false,
        error: error.message || 'Status check failed'
      };
    }
  }

  private generateChecksum(payload: string): string {
    const stringToHash = payload + this.saltKey;
    const hash = CryptoJS.SHA256(stringToHash).toString();
    return `${hash}###${this.saltIndex}`;
  }

  // Simulate payment for demo purposes
  async simulatePayment(request: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
    try {
      // Create a simple payment simulation page
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
            .success {
              background: rgba(34, 197, 94, 0.2);
              border: 1px solid rgba(34, 197, 94, 0.3);
              padding: 20px;
              border-radius: 12px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="phonepe-logo">PhonePe</div>
            <div class="logo">ROZGAR Payment</div>
            <div class="amount">₹${request.amount}</div>
            <div class="description">Payment for worker services</div>
            <button class="pay-button" onclick="processPayment()">Pay ₹${request.amount}</button>
            <div style="font-size: 12px; opacity: 0.8;">
              Secure payment powered by PhonePe
            </div>
          </div>
          
          <script>
            function processPayment() {
              const button = document.querySelector('.pay-button');
              button.textContent = 'Processing Payment...';
              button.disabled = true;
              button.style.opacity = '0.7';
              
              setTimeout(() => {
                document.querySelector('.container').innerHTML = \`
                  <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Payment Successful!</div>
                    <div style="font-size: 18px; margin-bottom: 20px;">₹${request.amount}</div>
                    <div style="font-size: 14px; opacity: 0.8; margin-bottom: 20px;">
                      Transaction ID: ${request.merchantTransactionId}
                    </div>
                    <div style="font-size: 12px; opacity: 0.6;">
                      Closing automatically...
                    </div>
                  </div>
                \`;
                
                // Auto close after 3 seconds
                setTimeout(() => {
                  if (window.close) {
                    window.close();
                  }
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
        transactionId: request.merchantTransactionId,
        data: {
          transactionId: request.merchantTransactionId,
          amount: request.amount * 100,
          state: 'COMPLETED'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to process PhonePe payment'
      };
    }
  }
}

export const phonePeService = new PhonePeService();