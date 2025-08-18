import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import { CreditCard, Smartphone, X, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface MockPaymentGatewayProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  workerName: string;
  onPaymentResult: (result: 'success' | 'failed' | 'pending') => void;
}

export default function MockPaymentGateway({ 
  visible, 
  onClose, 
  amount, 
  workerName, 
  onPaymentResult 
}: MockPaymentGatewayProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'phonepe' | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showResultOptions, setShowResultOptions] = useState(false);

  const handleMethodSelect = (method: 'razorpay' | 'phonepe') => {
    setSelectedMethod(method);
    setShowQR(true);
  };

  const handleQRScan = () => {
    setShowQR(false);
    setShowResultOptions(true);
  };

  const handleResultSelect = (result: 'success' | 'failed' | 'pending') => {
    setShowResultOptions(false);
    setSelectedMethod(null);
    setShowQR(false);
    onPaymentResult(result);
    onClose();
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setShowQR(false);
    setShowResultOptions(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {!selectedMethod && !showQR && !showResultOptions && (
            <>
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
                  <Text style={[styles.amount, { color: colors.text }]}>₹{amount.toLocaleString()}</Text>
                </View>

                <View style={styles.paymentMethods}>
                  <Text style={[styles.methodsTitle, { color: colors.text }]}>
                    Select Payment Method
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.methodButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => handleMethodSelect('razorpay')}
                  >
                    <CreditCard size={24} color={colors.primary} />
                    <View style={styles.methodInfo}>
                      <Text style={[styles.methodName, { color: colors.text }]}>Razorpay</Text>
                      <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                        Cards, UPI, Net Banking, Wallets
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.methodButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => handleMethodSelect('phonepe')}
                  >
                    <Smartphone size={24} color="#5F259F" />
                    <View style={styles.methodInfo}>
                      <Text style={[styles.methodName, { color: colors.text }]}>PhonePe</Text>
                      <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                        UPI, Cards, Wallets
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {showQR && !showResultOptions && (
            <>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {selectedMethod === 'razorpay' ? 'Razorpay' : 'PhonePe'} Payment
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.qrSection}>
                <View style={[styles.qrContainer, { backgroundColor: colors.background }]}>
                  <QrCode size={120} color={selectedMethod === 'razorpay' ? '#2563EB' : '#5F259F'} />
                  <Text style={[styles.qrLabel, { color: colors.text }]}>
                    Scan QR Code with any UPI App
                  </Text>
                  <Text style={[styles.qrAmount, { color: colors.text }]}>₹{amount.toLocaleString()}</Text>
                </View>

                <View style={styles.upiApps}>
                  <Text style={[styles.upiAppsTitle, { color: colors.textSecondary }]}>
                    Scan with any UPI app
                  </Text>
                  <View style={styles.upiAppsList}>
                    <View style={[styles.upiApp, { backgroundColor: colors.background }]}>
                      <Text style={styles.upiAppText}>📱 Google Pay</Text>
                    </View>
                    <View style={[styles.upiApp, { backgroundColor: colors.background }]}>
                      <Text style={styles.upiAppText}>💜 PhonePe</Text>
                    </View>
                    <View style={[styles.upiApp, { backgroundColor: colors.background }]}>
                      <Text style={styles.upiAppText}>🔵 Paytm</Text>
                    </View>
                    <View style={[styles.upiApp, { backgroundColor: colors.background }]}>
                      <Text style={styles.upiAppText}>🟠 Amazon Pay</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.scanButton, { backgroundColor: colors.primary }]}
                  onPress={handleQRScan}
                >
                  <Text style={styles.scanButtonText}>I have scanned the QR code</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {showResultOptions && (
            <>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Choose Payment Result
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.resultOptions}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>
                  Demo: Select payment outcome
                </Text>
                <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                  In a real app, this would be determined automatically
                </Text>

                <TouchableOpacity
                  style={[styles.resultButton, styles.successButton]}
                  onPress={() => handleResultSelect('success')}
                >
                  <CheckCircle size={24} color="#FFFFFF" />
                  <Text style={styles.resultButtonText}>Payment Successful</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resultButton, styles.failedButton]}
                  onPress={() => handleResultSelect('failed')}
                >
                  <XCircle size={24} color="#FFFFFF" />
                  <Text style={styles.resultButtonText}>Payment Failed</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resultButton, styles.pendingButton]}
                  onPress={() => handleResultSelect('pending')}
                >
                  <Clock size={24} color="#FFFFFF" />
                  <Text style={styles.resultButtonText}>Payment Pending</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
    maxHeight: '80%',
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
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
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
    borderWidth: 1,
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
  qrSection: {
    padding: 20,
    alignItems: 'center',
  },
  qrContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  qrAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  upiApps: {
    width: '100%',
    marginBottom: 24,
  },
  upiAppsTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  upiAppsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  upiApp: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  upiAppText: {
    fontSize: 12,
  },
  scanButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultOptions: {
    padding: 20,
    gap: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  successButton: {
    backgroundColor: '#16A34A',
  },
  failedButton: {
    backgroundColor: '#EF4444',
  },
  pendingButton: {
    backgroundColor: '#F59E0B',
  },
  resultButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});