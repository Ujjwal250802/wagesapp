import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { CreditCard, Smartphone, X, DollarSign } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import MockPaymentGateway from './MockPaymentGateway';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  workerName: string;
  onPaymentResult: (result: 'success' | 'failed' | 'pending', paymentData?: any) => void;
}

export default function PaymentModal({ 
  visible, 
  onClose, 
  amount, 
  workerName, 
  onPaymentResult 
}: PaymentModalProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [customAmount, setCustomAmount] = useState(amount.toString());
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  const handlePayment = () => {
    const paymentAmount = parseInt(customAmount);
    if (!paymentAmount || paymentAmount <= 0) {
      return;
    }

    setShowPaymentGateway(true);
  };

  const handlePaymentGatewayResult = (result: 'success' | 'failed' | 'pending') => {
    setShowPaymentGateway(false);
    
    const paymentData = {
      paymentId: `DEMO_${Date.now()}`,
      orderId: `ORDER_${Date.now()}`,
      method: 'demo',
      amount: parseInt(customAmount),
      status: result
    };
    
    onPaymentResult(result, paymentData);
  };

  const handleClose = () => {
    setShowPaymentGateway(false);
    onClose();
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible && !showPaymentGateway}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Payment for {workerName}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
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

              <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={handleClose}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.payButton, { backgroundColor: colors.primary }]}
                  onPress={handlePayment}
                >
                  <Text style={styles.payButtonText}>
                    Pay ₹{customAmount}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <MockPaymentGateway
        visible={showPaymentGateway}
        onClose={() => setShowPaymentGateway(false)}
        amount={parseInt(customAmount)}
        workerName={workerName}
        onPaymentResult={handlePaymentGatewayResult}
      />
    </>
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
    alignItems: 'center',
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