import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { DollarSign, Calendar, Building, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';

export default function Payments() {
  const { colors } = useTheme();
  const { t } = useLanguage();
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
        where('workerId', '==', user.uid)
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const paymentsData = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by payment date (newest first) - do this in memory to avoid index requirement
      paymentsData.sort((a, b) => {
        const dateA = a.paidAt?.toDate() || new Date(0);
        const dateB = b.paidAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

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
    <View style={[styles.paymentCard, { backgroundColor: colors.surface }]}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentIcon}>
          <DollarSign size={24} color="#16A34A" />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={[styles.amount, { color: colors.text }]}>₹{item.amount.toLocaleString()}</Text>
          <Text style={[styles.jobTitle, { color: colors.textSecondary }]}>{item.jobTitle}</Text>
        </View>
        <View style={styles.statusIcon}>
          <CheckCircle size={20} color="#16A34A" />
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Building size={16} color="#6B7280" />
          <Text style={[styles.detailText, { color: colors.text }]}>{item.employerName || 'Employer'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6B7280" />
          <Text style={[styles.detailText, { color: colors.text }]}>
            {item.workPeriod || 'Work Period'} • Paid on {item.paidAt ? new Date(item.paidAt.toDate()).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
        {item.paymentMethod && (
          <View style={styles.detailRow}>
            <DollarSign size={16} color="#6B7280" />
            <Text style={[styles.detailText, { color: colors.text }]}>
              Payment Method: {item.paymentMethod === 'razorpay' ? 'Razorpay' : item.paymentMethod}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.paymentFooter}>
        <Text style={[styles.workDays, { color: colors.textSecondary }]}>{t('workDays')}: {item.workDays || 0}</Text>
        <Text style={[styles.paymentId, { color: colors.textSecondary }]}>ID: {item.razorpayPaymentId || item.paymentId || 'N/A'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('myPayments')}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('trackEarnings')}</Text>
          </View>
          <View style={styles.headerControls}>
            <LanguageSelector />
            <ThemeToggle />
          </View>
        </View>
      </View>

      <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
        <View style={styles.earningsHeader}>
          <DollarSign size={32} color="#16A34A" />
          <View style={styles.earningsInfo}>
            <Text style={[styles.earningsLabel, { color: colors.textSecondary }]}>{t('totalEarnings')}</Text>
            <Text style={[styles.earningsAmount, { color: colors.text }]}>₹{totalEarnings.toLocaleString()}</Text>
          </View>
        </View>
        <Text style={[styles.earningsSubtext, { color: colors.textSecondary }]}>
          {t('fromPayments')} {payments.length} {payments.length === 1 ? t('payment') : t('payments')}
        </Text>
      </View>

      {payments.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <DollarSign size={48} color="#D1D5DB" />
          <Text style={[styles.emptyText, { color: colors.text }]}>{t('noPaymentsYet')}</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t('paymentHistoryAppear')}</Text>
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
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  earningsCard: {
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
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  earningsSubtext: {
    fontSize: 14,
  },
  paymentsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  paymentCard: {
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
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
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
  },
  paymentId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});