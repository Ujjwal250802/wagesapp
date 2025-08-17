import { Platform } from 'react-native';
import CryptoJS from 'crypto-js';

export interface PhonePeConfig {
  merchantId: string;
  saltKey: string;
  saltIndex: number;
  environment: 'sandbox' | 'production';
}

export interface PhonePePaymentRequest {
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  mobileNumber: string;
  callbackUrl?: string;
  redirectUrl?: string;
}

export interface PhonePePaymentResponse {
  success: boolean;
  code?: string;
  message?: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
    responseCode: string;
    paymentInstrument?: {
      type: string;
      utr?: string;
    };
  };
}

class PhonePeService {
  private config: PhonePeConfig = {
    merchantId: 'PGTESTPAYUAT',
    saltKey: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
    saltIndex: 1,
    environment: 'sandbox',
  };

  private getBaseUrl(): string {
    return this.config.environment === 'production' 
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  }

  async initiatePayment(request: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
    try {
      const payload = {
        merchantId: this.config.merchantId,
        merchantTransactionId: request.merchantTransactionId,
        merchantUserId: request.merchantUserId,
        amount: request.amount * 100, // Convert to paise
        redirectUrl: request.redirectUrl || `${typeof window !== 'undefined' ? window.location.origin : 'https://rozgar.app'}/payment-success`,
        redirectMode: 'POST',
        callbackUrl: request.callbackUrl || `${typeof window !== 'undefined' ? window.location.origin : 'https://rozgar.app'}/payment-callback`,
        mobileNumber: request.mobileNumber,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const payloadString = JSON.stringify(payload);
      const payloadBase64 = btoa(payloadString);
      const checksum = this.generateChecksum(payloadBase64);

      const requestBody = {
        request: payloadBase64
      };

      const headers = {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'accept': 'application/json'
      };

      if (Platform.OS === 'web') {
        // For web, open PhonePe payment page
        return this.initiateWebPayment(request, payloadBase64, checksum);
      } else {
        // For mobile, open PhonePe payment page in browser
        return this.initiateMobilePayment(request, payloadBase64, checksum);
      }
    } catch (error) {
      console.error('PhonePe initiation error:', error);
      return {
        success: false,
        message: error.message || 'Payment initiation failed'
      };
    }
  }

  private async initiateWebPayment(
    request: PhonePePaymentRequest, 
    payload: string, 
    checksum: string
  ): Promise<PhonePePaymentResponse> {
    try {
      // Create PhonePe payment URL
      const paymentUrl = `https://mercury-t2.phonepe.com/transact/simulate?merchantId=${this.config.merchantId}&merchantTransactionId=${request.merchantTransactionId}&amount=${request.amount * 100}`;
      
      // Open PhonePe payment page in new window
      const paymentWindow = window.open(
        paymentUrl,
        'phonepe_payment',
        'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no'
      );

      if (!paymentWindow) {
        throw new Error('Failed to open payment window. Please allow popups.');
      }

      return new Promise((resolve) => {
        // Monitor the payment window
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed);
            // Simulate successful payment for demo
            resolve({
              success: true,
              code: 'PAYMENT_SUCCESS',
              message: 'Payment completed successfully',
              data: {
                merchantId: this.config.merchantId,
                merchantTransactionId: request.merchantTransactionId,
                transactionId: `T${Date.now()}`,
                amount: request.amount * 100,
                state: 'COMPLETED',
                responseCode: 'SUCCESS',
                paymentInstrument: {
                  type: 'UPI',
                  utr: `UTR${Date.now()}`
                }
              }
            });
          }
        }, 1000);

        // Timeout after 10 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          if (!paymentWindow.closed) {
            paymentWindow.close();
          }
          resolve({
            success: false,
            message: 'Payment timeout or cancelled'
          });
        }, 600000);
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to initiate PhonePe payment'
      };
    }
  }

  private async initiateMobilePayment(
    request: PhonePePaymentRequest, 
    payload: string, 
    checksum: string
  ): Promise<PhonePePaymentResponse> {
    return new Promise((resolve) => {
      // For mobile, we would open the PhonePe app or browser
      // This is a simplified implementation
      setTimeout(() => {
        resolve({
          success: true,
          code: 'PAYMENT_SUCCESS',
          message: 'Payment completed successfully',
          data: {
            merchantId: this.config.merchantId,
            merchantTransactionId: request.merchantTransactionId,
            transactionId: `T${Date.now()}`,
            amount: request.amount * 100,
            state: 'COMPLETED',
            responseCode: 'SUCCESS',
            paymentInstrument: {
              type: 'UPI',
              utr: `UTR${Date.now()}`
            }
          }
        });
      }, 2000);
    });
  }

  private generateChecksum(payload: string): string {
    const string = payload + '/pg/v1/pay' + this.config.saltKey;
    const sha256 = CryptoJS.SHA256(string);
    const checksum = sha256.toString(CryptoJS.enc.Hex) + '###' + this.config.saltIndex;
    return checksum;
  }

  async checkPaymentStatus(merchantTransactionId: string): Promise<PhonePePaymentResponse> {
    try {
      const string = `/pg/v1/status/${this.config.merchantId}/${merchantTransactionId}` + this.config.saltKey;
      const sha256 = CryptoJS.SHA256(string);
      const checksum = sha256.toString(CryptoJS.enc.Hex) + '###' + this.config.saltIndex;

      const url = `${this.getBaseUrl()}/pg/v1/status/${this.config.merchantId}/${merchantTransactionId}`;
      
      // For demo, simulate status check
      return {
        success: true,
        code: 'PAYMENT_SUCCESS',
        message: 'Payment status retrieved successfully',
        data: {
          merchantId: this.config.merchantId,
          merchantTransactionId: merchantTransactionId,
          transactionId: `T${Date.now()}`,
          amount: 100000, // Demo amount
          state: 'COMPLETED',
          responseCode: 'SUCCESS'
        }
      };
    } catch (error) {
      console.error('Status check error:', error);
      return {
        success: false,
        message: error.message || 'Status check failed'
      };
    }
  }
}

export const phonePeService = new PhonePeService();