import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, Clock, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

interface PaymentStatusModalProps {
  visible: boolean;
  onClose: () => void;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  paymentId?: string;
  workerName: string;
}

export default function PaymentStatusModal({
  visible,
  onClose,
  status,
  amount,
  paymentId,
  workerName
}: PaymentStatusModalProps) {
  const { colors } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle size={48} color="#FFFFFF" />,
          title: 'Payment Successful!',
          subtitle: `₹${amount.toLocaleString()} has been successfully paid to ${workerName}`,
          backgroundColor: '#16A34A',
          buttonText: 'Done'
        };
      case 'failed':
        return {
          icon: <XCircle size={48} color="#FFFFFF" />,
          title: 'Payment Failed',
          subtitle: 'The payment could not be processed. Please try again.',
          backgroundColor: '#EF4444',
          buttonText: 'Try Again'
        };
      case 'pending':
        return {
          icon: <Clock size={48} color="#FFFFFF" />,
          title: 'Payment Pending',
          subtitle: 'Your payment is being processed. You will be notified once completed.',
          backgroundColor: '#F59E0B',
          buttonText: 'OK'
        };
      default:
        return {
          icon: <Clock size={48} color="#FFFFFF" />,
          title: 'Processing...',
          subtitle: 'Please wait while we process your payment.',
          backgroundColor: '#6B7280',
          buttonText: 'OK'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.statusContent}>
            <View style={[styles.statusIcon, { backgroundColor: config.backgroundColor }]}>
              {config.icon}
            </View>
            
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              {config.title}
            </Text>
            
            <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
              {config.subtitle}
            </Text>

            {paymentId && (
              <View style={[styles.paymentIdContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.paymentIdLabel, { color: colors.textSecondary }]}>
                  Payment ID
                </Text>
                <Text style={[styles.paymentIdText, { color: colors.text }]}>
                  {paymentId}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: config.backgroundColor }]}
              onPress={onClose}
            >
              <Text style={styles.actionButtonText}>{config.buttonText}</Text>
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
    width: '85%',
    maxWidth: 350,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  statusContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  paymentIdContainer: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  paymentIdLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  paymentIdText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});