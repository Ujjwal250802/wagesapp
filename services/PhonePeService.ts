import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';

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
      // For demo purposes, simulate PhonePe payment success
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            transactionId: request.merchantTransactionId,
            data: {
              transactionId: request.merchantTransactionId,
              amount: request.amount * 100,
              state: 'COMPLETED'
            }
          });
        }, 2000);
      });
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
      // For demo purposes, return success status
      return {
        success: true,
        data: {
          transactionId: transactionId,
          state: 'COMPLETED',
          amount: 100000 // Demo amount in paise
        }
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
}

export const phonePeService = new PhonePeService();