import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Loader } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { razorpayService } from '../services/RazorpayService';

export default function RazorpayTest() {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastPayment, setLastPayment] = useState<any>(null);

  React.useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    setServerStatus('checking');
    const isHealthy = await razorpayService.checkServerHealth();
    setServerStatus(isHealthy ? 'online' : 'offline');
  };

  const handleTestPayment = async () => {
    const paymentAmount = parseInt(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (serverStatus !== 'online') {
      Alert.alert(
        'Server Offline', 
        'Backend server is not running. Please start the server:\n\ncd backend\nnpm run dev'
      );
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await razorpayService.createOrder({
        amount: paymentAmount,
        currency: 'INR',
        receipt: `test_receipt_${Date.now()}`,
        notes: {
          worker_name: 'Test Worker',
          job_title: 'Test Job',
          test_payment: 'true'
        }
      });

      if (!orderResponse.success || !orderResponse.order) {
        Alert.alert('Order Failed', orderResponse.error || 'Failed to create order');
        return;
      }

      // Process payment
      const customerInfo = {
        name: 'Test User',
        email: 'test@rozgar.com',
        phone: '9999999999',
        workerName: 'Test Worker'
      };

      const result = await razorpayService.processPayment(orderResponse.order, customerInfo);
      
      if (result.success && result.verified) {
        setLastPayment(result);
        Alert.alert(
          'Payment Successful!', 
          `Payment ID: ${result.paymentId}\nAmount: ₹${result.amount}\nVerified: ${result.verified ? 'Yes' : 'No'}`
        );
      }
    } catch (error) {
      console.error('Test payment error:', error);
      if (error.message !== 'Payment cancelled by user') {
        Alert.alert('Payment Error', error.message || 'Payment failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'online': return colors.success;
      case 'offline': return colors.error;
      default: return colors.warning;
    }
  };

  const getStatusIcon = () => {
    switch (serverStatus) {
      case 'online': return <CheckCircle size={20} color={colors.success} />;
      case 'offline': return <XCircle size={20} color={colors.error} />;
      default: return <Loader size={20} color={colors.warning} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Razorpay Test</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Server Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statusHeader}>
            {getStatusIcon()}
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              Backend Server Status
            </Text>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: colors.background }]}
              onPress={checkServerStatus}
            >
              <Text style={[styles.refreshText, { color: colors.primary }]}>Refresh</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {serverStatus === 'checking' && 'Checking server...'}
            {serverStatus === 'online' && 'Server is running on http://localhost:5000'}
            {serverStatus === 'offline' && 'Server is offline. Please start the backend server.'}
          </Text>
          
          {serverStatus === 'offline' && (
            <View style={[styles.instructionsCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.instructionsTitle, { color: colors.text }]}>
                To start the backend server:
              </Text>
              <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
                1. Open terminal in project root{'\n'}
                2. cd backend{'\n'}
                3. npm install{'\n'}
                4. npm run dev
              </Text>
            </View>
          )}
        </View>

        {/* Payment Test */}
        <View style={[styles.paymentCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Test Payment</Text>
          
          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
              Amount (₹)
            </Text>
            <View style={[styles.amountInputContainer, { borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>₹</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="500"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.payButton,
              { 
                backgroundColor: serverStatus === 'online' ? colors.primary : colors.border,
                opacity: loading ? 0.7 : 1,
              }
            ]}
            onPress={handleTestPayment}
            disabled={loading || serverStatus !== 'online'}
          >
            <CreditCard size={20} color="#FFFFFF" />
            <Text style={styles.payButtonText}>
              {loading ? 'Processing...' : `Pay ₹${amount} with Razorpay`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Last Payment */}
        {lastPayment && (
          <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Last Payment Result</Text>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Status:</Text>
              <Text style={[styles.resultValue, { color: colors.success }]}>Success ✓</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Payment ID:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>{lastPayment.paymentId}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Amount:</Text>
              <Text style={[styles.resultValue, { color: colors.text }]}>₹{lastPayment.amount}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Verified:</Text>
              <Text style={[styles.resultValue, { color: lastPayment.verified ? colors.success : colors.error }]}>
                {lastPayment.verified ? 'Yes ✓' : 'No ✗'}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Order ID:</Text>
              <Text style={[styles.resultValue, { color: colors.text, fontSize: 12 }]}>{lastPayment.orderId}</Text>
            </View>
          </View>
        )}

        {/* Test Cards Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Test Card Details</Text>
          
          <View style={styles.testCardRow}>
            <Text style={[styles.testCardLabel, { color: colors.textSecondary }]}>Success Card:</Text>
            <Text style={[styles.testCardValue, { color: colors.text }]}>4111 1111 1111 1111</Text>
          </View>
          
          <View style={styles.testCardRow}>
            <Text style={[styles.testCardLabel, { color: colors.textSecondary }]}>Failure Card:</Text>
            <Text style={[styles.testCardValue, { color: colors.text }]}>4000 0000 0000 0002</Text>
          </View>
          
          <View style={styles.testCardRow}>
            <Text style={[styles.testCardLabel, { color: colors.textSecondary }]}>CVV:</Text>
            <Text style={[styles.testCardValue, { color: colors.text }]}>Any 3 digits</Text>
          </View>
          
          <View style={styles.testCardRow}>
            <Text style={[styles.testCardLabel, { color: colors.textSecondary }]}>Expiry:</Text>
            <Text style={[styles.testCardValue, { color: colors.text }]}>Any future date</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 14,
    marginTop: 4,
  },
  instructionsCard: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  amountSection: {
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
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  testCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testCardLabel: {
    fontSize: 14,
  },
  testCardValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
});