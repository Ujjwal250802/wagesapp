import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Home } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function PaymentSuccess() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.successIcon, { backgroundColor: colors.success }]}>
          <CheckCircle size={48} color="#FFFFFF" />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Payment Successful!
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your payment has been processed successfully.
        </Text>

        {params.amount && (
          <View style={[styles.amountCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
              Amount Paid
            </Text>
            <Text style={[styles.amount, { color: colors.success }]}>
              ₹{params.amount}
            </Text>
          </View>
        )}

        {params.paymentId && (
          <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Transaction ID
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {params.paymentId}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Home size={20} color="#FFFFFF" />
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </TouchableOpacity>

        <Text style={[styles.autoRedirect, { color: colors.textSecondary }]}>
          Redirecting to home in 5 seconds...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  amountCard: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  detailsCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  autoRedirect: {
    fontSize: 12,
    textAlign: 'center',
  },
});