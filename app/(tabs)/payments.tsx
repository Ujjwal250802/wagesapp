import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { DollarSign, Calendar, Building, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get payments made to this worker
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('workerId', '==', user.uid),
        orderBy('paidAt', 'desc')
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPayments(paymentsData);
      
      // Calculate total earnings
      const total = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
      setTotalEarnings(total);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentCard = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentIcon}>
          <DollarSign size={24} color="#16A34A" />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.amount}>₹{item.amount.toLocaleString()}</Text>
          <Text style={styles.jobTitle}>{item.jobTitle}</Text>
        </View>
        <View style={styles.statusIcon}>
          <CheckCircle size={20} color="#16A34A" />
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Building size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.employerName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {item.workPeriod} • Paid on {new Date(item.paidAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.paymentFooter}>
        <Text style={styles.workDays}>Work Days: {item.workDays}</Text>
        <Text style={styles.paymentId}>ID: {item.paymentId}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading payments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Payments</Text>
        <Text style={styles.headerSubtitle}>Track your earnings</Text>
      </View>

      <View style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <DollarSign size={32} color="#16A34A" />
          <View style={styles.earningsInfo}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsAmount}>₹{totalEarnings.toLocaleString()}</Text>
          </View>
        </View>
        <Text style={styles.earningsSubtext}>
          From {payments.length} payment{payments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <DollarSign size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No payments yet</Text>
          <Text style={styles.emptySubtext}>Your payment history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.paymentsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  earningsCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsInfo: {
    marginLeft: 16,
    flex: 1,
  },
  earningsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  earningsSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16A34A',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusIcon: {
    marginLeft: 8,
  },
  paymentDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  workDays: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentId: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});