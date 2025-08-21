import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CreditCard, Smartphone, X, DollarSign } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { razorpayService, RazorpayOrderRequest } from '../services/RazorpayService';
import { phonePeService } from '../services/PhonePeService';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  workerName: string;
  onPaymentSuccess: (paymentData: any) => void;
}

export default function PaymentModal({ 
  visible, 
  onClose, 
  amount, 
  workerName, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'phonepe' | null>(null);
  const [customAmount, setCustomAmount] = useState(amount.toString());
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const paymentAmount = parseInt(customAmount);
    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setProcessing(true);

    try {
      if (selectedMethod === 'razorpay') {
        await handleRazorpayPayment(paymentAmount);
      } else if (selectedMethod === 'phonepe') {
        await handlePhonePePayment(paymentAmount);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'Please try again');
    } finally {
      setProcessing(false);
    }
  };

  const handleRazorpayPayment = async (paymentAmount: number) => {
    try {
      // First check if backend is available
      const isServerHealthy = await razorpayService.checkServerHealth();
      if (!isServerHealthy) {
        Alert.alert(
          'Server Error', 
          'Payment server is not available. Please make sure the backend server is running on http://localhost:5000'
        );
        return;
      }

      // Create order on backend
      const orderRequest: RazorpayOrderRequest = {
        amount: paymentAmount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          worker_name: workerName,
          job_title: 'Daily Wage Work',
          payment_type: 'worker_payment'
        }
      };

      console.log('Creating order for amount:', paymentAmount);
      const orderResponse = await razorpayService.createOrder(orderRequest);
      
      if (!orderResponse.success || !orderResponse.order) {
        Alert.alert('Order Creation Failed', orderResponse.error || 'Failed to create payment order');
        return;
      }

      console.log('Order created successfully:', orderResponse.order);

      // Process payment with the created order
      const customerInfo = {
        name: 'Employer',
        email: 'employer@rozgar.com',
        phone: '9999999999',
        workerName: workerName
      };

      const result = await razorpayService.processPayment(orderResponse.order, customerInfo);
      
      if (result.success && result.verified) {
        onPaymentSuccess({
          paymentId: result.paymentId,
          orderId: result.orderId,
          signature: result.signature,
          method: 'razorpay',
          amount: paymentAmount,
          status: 'completed',
          verified: true
        });
        onClose();
      } else {
        Alert.alert('Payment Failed', 'Payment could not be processed. Please try again.');
      }
    } catch (error) {
      console.error('Razorpay payment error:', error);
      Alert.alert('Payment Error', error.message || 'Failed to process payment');
    }
  };

  const handlePhonePePayment = async (paymentAmount: number) => {
    try {
      const paymentRequest = {
        amount: paymentAmount,
        currency: 'INR',
        orderId: `ORDER_${Date.now()}`,
        description: `Payment to ${workerName} for work completed`,
      };

      const result = await phonePeService.initiatePayment({
        amount: paymentAmount,
        merchantTransactionId: paymentRequest.orderId,
        merchantUserId: 'user_123',
        mobileNumber: '9999999999'
      });
      
      if (result.success) {
        onPaymentSuccess({
          paymentId: result.transactionId,
          orderId: paymentRequest.orderId,
          method: 'phonepe',
          amount: paymentAmount,
          status: 'completed'
        });
        onClose();
      } else {
        Alert.alert('Payment Failed', result.error || 'PhonePe payment failed');
      }
    } catch (error) {
      Alert.alert('Payment Error', 'Failed to process PhonePe payment');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Payment for {workerName}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={[styles.amountSection, { backgroundColor: colors.background }]}>
              <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
                Payment Amount
              </Text>
              <View style={[styles.amountInputContainer, { borderColor: colors.border }]}>
                <DollarSign size={20} color={colors.textSecondary} />
                <Text style={[styles.currencySymbol, { color: colors.text }]}>₹</Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.paymentMethods}>
              <Text style={[styles.methodsTitle, { color: colors.text }]}>
                Select Payment Method
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  { 
                    backgroundColor: colors.background,
                    borderColor: selectedMethod === 'razorpay' ? colors.primary : colors.border,
                    borderWidth: selectedMethod === 'razorpay' ? 2 : 1,
                  }
                ]}
                onPress={() => setSelectedMethod('razorpay')}
              >
                <CreditCard size={24} color={selectedMethod === 'razorpay' ? colors.primary : colors.textSecondary} />
                <View style={styles.methodInfo}>
                  <Text style={[
                    styles.methodName, 
                    { color: selectedMethod === 'razorpay' ? colors.primary : colors.text }
                  ]}>
                    Razorpay
                  </Text>
                  <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                    Cards, UPI, Net Banking, Wallets
                  </Text>
                </View>
                {selectedMethod === 'razorpay' && (
                  <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  { 
                    backgroundColor: colors.background,
                    borderColor: selectedMethod === 'phonepe' ? colors.primary : colors.border,
                    borderWidth: selectedMethod === 'phonepe' ? 2 : 1,
                  }
                ]}
                onPress={() => setSelectedMethod('phonepe')}
              >
                <Smartphone size={24} color={selectedMethod === 'phonepe' ? colors.primary : colors.textSecondary} />
                <View style={styles.methodInfo}>
                  <Text style={[
                    styles.methodName, 
                    { color: selectedMethod === 'phonepe' ? colors.primary : colors.text }
                  ]}>
                    PhonePe
                  </Text>
                  <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                    UPI, Cards, Wallets
                  </Text>
                </View>
                {selectedMethod === 'phonepe' && (
                  <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]} />
                )}
              </TouchableOpacity>
            </View>

            <View style={[styles.securityNote, { backgroundColor: colors.background }]}>
              <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                🔒 Your payment is secured with 256-bit SSL encryption
              </Text>
            </View>
          </View>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={onClose}
              disabled={processing}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.payButton, 
                { 
                  backgroundColor: selectedMethod ? colors.primary : colors.border,
                  opacity: processing ? 0.7 : 1,
                }
              ]}
              onPress={handlePayment}
              disabled={!selectedMethod || processing}
            >
              <Text style={styles.payButtonText}>
                {processing ? 'Processing...' : `Pay ₹${customAmount}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  amountSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  paymentMethods: {
    gap: 12,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
    position: 'relative',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  securityNote: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  securityText: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  payButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
