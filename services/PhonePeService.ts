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
        redirectUrl: request.redirectUrl || `${window.location.origin}/payment-success`,
        redirectMode: 'POST',
        callbackUrl: request.callbackUrl || `${window.location.origin}/payment-callback`,
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
        // For web, simulate the payment flow
        return this.simulateWebPayment(request);
      } else {
        // For mobile, you would use PhonePe SDK
        return this.simulateMobilePayment(request);
      }
    } catch (error) {
      console.error('PhonePe initiation error:', error);
      return {
        success: false,
        message: error.message || 'Payment initiation failed'
      };
    }
  }

  private simulateWebPayment(request: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
    return new Promise((resolve) => {
      // Simulate payment processing delay
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

  private simulateMobilePayment(request: PhonePePaymentRequest): Promise<PhonePePaymentResponse> {
    return new Promise((resolve) => {
      // Simulate payment processing delay
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