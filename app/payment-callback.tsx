import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { phonePeService } from '../services/PhonePeService';

export default function PaymentCallback() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Extract transaction ID from params
      const transactionId = params.transactionId as string;
      
      if (transactionId) {
        // Check payment status with PhonePe
        const statusResult = await phonePeService.checkPaymentStatus(transactionId);
        
        if (statusResult.success && statusResult.data?.state === 'COMPLETED') {
          // Payment successful, redirect to success page
          router.replace({
            pathname: '/payment-success',
            params: {
              paymentId: statusResult.data.transactionId,
              amount: statusResult.data.amount / 100, // Convert from paise
              method: 'phonepe'
            }
          });
        } else {
          // Payment failed, redirect to failure page
          router.replace('/payment-failure');
        }
      } else {
        // No transaction ID, redirect to failure
        router.replace('/payment-failure');
      }
    } catch (error) {
      console.error('Callback processing error:', error);
      router.replace('/payment-failure');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.text }]}>
        Processing payment...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
});