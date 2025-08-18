import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CreditCard, Smartphone, X, DollarSign } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { paymentService, PaymentRequest } from '../services/PaymentService';
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
      const paymentRequest: PaymentRequest = {
        amount: paymentAmount,
        currency: 'INR',
        orderId: `ORDER_${Date.now()}`,
        description: `Payment for ${workerName}`,
        customerInfo: {
          name: workerName,
          email: 'worker@rozgar.com',
          phone: '9999999999'
        }
      };

      const result = await paymentService.processRazorpayPayment(paymentRequest);
      
      if (result.success) {
        onPaymentSuccess({
          paymentId: result.paymentId,
          orderId: result.orderId,
          signature: result.signature,
          method: 'razorpay',
          amount: paymentAmount,
          status: 'success'
        });
        onClose();
      } else {
        if (result.error !== 'Payment cancelled by user') {
          Alert.alert('Payment Failed', result.error || 'Unknown error');
        }
      }
    } catch (error) {
      Alert.alert('Payment Error', 'Failed to process Razorpay payment');
    }
  };

  const handlePhonePePayment = async (paymentAmount: number) => {
    try {
      const paymentRequest: PaymentRequest = {
        amount: paymentAmount,
        currency: 'INR',
        orderId: `ORDER_${Date.now()}`,
        description: `Payment for ${workerName}`,
        customerInfo: {
          name: workerName,
          email: 'worker@rozgar.com',
          phone: '9999999999'
        }
      };

      const result = await paymentService.processPhonePePayment(paymentRequest);
      
      if (result.success) {
        onPaymentSuccess({
          paymentId: result.paymentId,
          orderId: result.orderId,
          method: 'phonepe',
          amount: paymentAmount,
          status: 'success'
        });
        onClose();
      } else {
        Alert.alert('Payment Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Payment Error', 'Failed to initialize PhonePe');
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
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={onClose}
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