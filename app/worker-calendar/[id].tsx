import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { doc, getDoc, setDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { ArrowLeft, DollarSign, Calendar as CalendarIcon, User, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';

export default function WorkerCalendar() {
  const { id, jobTitle, salary } = useLocalSearchParams();
  const workerId = typeof id === 'string' ? id : id?.[0];
  const workerJobTitle = typeof jobTitle === 'string' ? jobTitle : jobTitle?.[0];
  const dailyRate = parseInt(typeof salary === 'string' ? salary : salary?.[0] || '500');
  
  const [workerData, setWorkerData] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [workDays, setWorkDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workerId) {
      fetchWorkerData();
      loadAttendanceData();
    }
  }, [workerId, currentMonth, currentYear]);

  useEffect(() => {
    calculateMonthlyTotal();
  }, [attendanceData, currentMonth, currentYear]);

  const fetchWorkerData = async () => {
    try {
      // Get worker details from applications
      const applicationsQuery = query(
        collection(db, 'applications'), 
        where('applicantId', '==', workerId)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      if (!applicationsSnapshot.empty) {
        const workerApp = applicationsSnapshot.docs[0].data();
        setWorkerData(workerApp);
      } else {
        // Fallback: try to get from workers collection
        const workerDoc = await getDoc(doc(db, 'workers', workerId));
        if (workerDoc.exists()) {
          setWorkerData(workerDoc.data());
        }
      }
    } catch (error) {
      console.error('Error fetching worker data:', error);
      Alert.alert('Error', 'Failed to load worker data');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !workerId) return;

      // Ensure user is authenticated
      if (!user.emailVerified) {
        console.log('User email not verified');
        return;
      }

      const attendanceId = `${user.uid}_${workerId}_${currentYear}_${currentMonth + 1}`;
      
      try {
        const attendanceDoc = await getDoc(doc(db, 'attendance', attendanceId));
        
        if (attendanceDoc.exists()) {
          const data = attendanceDoc.data();
          setAttendanceData(data.attendance || {});
          updateMarkedDates(data.attendance || {});
        } else {
          // Create initial attendance document if it doesn't exist
          const initialData = {
            employerId: user.uid,
            workerId: workerId,
            workerName: workerData?.applicantName || workerData?.name || 'Unknown',
            jobTitle: workerJobTitle,
            year: currentYear,
            month: currentMonth + 1,
            attendance: {},
            dailyRate: dailyRate,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          await setDoc(doc(db, 'attendance', attendanceId), initialData);
          setAttendanceData({});
          updateMarkedDates({});
        }
      } catch (firestoreError) {
        console.error('Firestore error:', firestoreError);
        // Initialize with empty data if there's a permission error
        setAttendanceData({});
        updateMarkedDates({});
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      // Don't show alert for permission errors during initial load
      setAttendanceData({});
      updateMarkedDates({});
    }
  };

  const updateMarkedDates = (attendance) => {
    const marked = {};
    
    // Mark joining date (example: first day of current month for demo)
    const joiningDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    marked[joiningDate] = {
      customStyles: {
        container: { backgroundColor: '#FCD34D' },
        text: { color: '#92400E', fontWeight: 'bold' }
      }
    };

    // Mark attendance dates
    Object.keys(attendance).forEach(date => {
      if (attendance[date] === 'present') {
        marked[date] = {
          customStyles: {
            container: { backgroundColor: '#10B981' },
            text: { color: '#FFFFFF', fontWeight: 'bold' }
          }
        };
      } else if (attendance[date] === 'absent') {
        marked[date] = {
          customStyles: {
            container: { backgroundColor: '#EF4444' },
            text: { color: '#FFFFFF', fontWeight: 'bold' }
          }
        };
      }
    });

    setMarkedDates(marked);
  };

  const calculateMonthlyTotal = () => {
    const presentDays = Object.values(attendanceData).filter(status => status === 'present').length;
    setWorkDays(presentDays);
    setMonthlyTotal(presentDays * dailyRate);
  };

  const markAttendance = async (status) => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date first');
      return;
    }

    // Validate selected date is not in the future
    const today = new Date();
    const selected = new Date(selectedDate);
    if (selected > today) {
      Alert.alert('Error', 'Cannot mark attendance for future dates');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      // Check if user email is verified
      if (!user.emailVerified) {
        Alert.alert('Error', 'Please verify your email address first');
        return;
      }

      const updatedAttendance = {
        ...attendanceData,
        [selectedDate]: status
      };

      const attendanceId = `${user.uid}_${workerId}_${currentYear}_${currentMonth + 1}`;
      
      // Prepare attendance document data
      const attendanceData = {
        employerId: user.uid,
        workerId: workerId,
        workerName: workerData?.applicantName || workerData?.name || 'Unknown',
        jobTitle: workerJobTitle,
        year: currentYear,
        month: currentMonth + 1,
        attendance: updatedAttendance,
        dailyRate: dailyRate,
        updatedAt: new Date()
      };

      // Add createdAt only if it's a new document
      try {
        const existingDoc = await getDoc(doc(db, 'attendance', attendanceId));
        if (!existingDoc.exists()) {
          attendanceData.createdAt = new Date();
        }
      } catch (error) {
        // If we can't check, assume it's new
        attendanceData.createdAt = new Date();
      }

      // Create or update the attendance document
      await setDoc(doc(db, 'attendance', attendanceId), attendanceData);

      setAttendanceData(updatedAttendance);
      updateMarkedDates(updatedAttendance);
      
      Alert.alert(
        'Success', 
        `Marked ${workerData?.applicantName || workerData?.name || 'Worker'} as ${status} for ${new Date(selectedDate).toLocaleDateString()}`
      );
    } catch (error) {
      console.error('Error marking attendance:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        Alert.alert(
          'Permission Error', 
          'You do not have permission to mark attendance. Please contact support.'
        );
      } else if (error.code === 'unauthenticated') {
        Alert.alert(
          'Authentication Error', 
          'Please log out and log back in to continue.'
        );
      } else {
        Alert.alert(
          'Error', 
          `Failed to mark attendance: ${error.message || 'Unknown error'}`
        );
      }
    }
  };

  const handlePayment = async () => {
    if (monthlyTotal === 0) {
      Alert.alert('Error', 'No amount to pay');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay ₹${monthlyTotal.toLocaleString()} to ${workerData?.applicantName || workerData?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: processPayment }
      ]
    );
  };

  const processPayment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Check if user email is verified
      if (!user.emailVerified) {
        Alert.alert('Error', 'Please verify your email address first');
        return;
      }

      // Get organization name
      let orgName = 'Organization';
      try {
        const orgDoc = await getDoc(doc(db, 'organizations', user.uid));
        orgName = orgDoc.exists() ? orgDoc.data().organizationName : 'Organization';
      } catch (error) {
        console.log('Could not fetch organization name:', error);
      }

      // Create payment record
      await addDoc(collection(db, 'payments'), {
        employerId: user.uid,
        employerName: orgName,
        workerId: workerId,
        workerName: workerData?.applicantName || workerData?.name,
        jobTitle: workerJobTitle,
        amount: monthlyTotal,
        workDays: workDays,
        workPeriod: `${getMonthName(currentMonth)} ${currentYear}`,
        paymentId: `PAY_${Date.now()}`,
        paidAt: new Date(),
        status: 'completed'
      });

      // Reset attendance for next month
      const attendanceId = `${user.uid}_${workerId}_${currentYear}_${currentMonth + 1}`;
      
      const resetAttendanceData = {
        employerId: user.uid,
        workerId: workerId,
        workerName: workerData?.applicantName || workerData?.name || 'Unknown',
        jobTitle: workerJobTitle,
        year: currentYear,
        month: currentMonth + 1,
        attendance: {},
        dailyRate: dailyRate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'attendance', attendanceId), resetAttendanceData);

      setAttendanceData({});
      setMarkedDates({});
      setMonthlyTotal(0);
      setWorkDays(0);

      Alert.alert('Success', 'Payment completed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        Alert.alert(
          'Permission Error', 
          'You do not have permission to process payments. Please contact support.'
        );
      } else {
        Alert.alert(
          'Payment Error', 
          `Payment failed: ${error.message || 'Unknown error'}. Please try again.`
        );
      }
    }
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading worker calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{workerData?.applicantName || workerData?.name || 'Worker'}</Text>
          <Text style={styles.headerSubtitle}>{workerJobTitle}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            onMonthChange={(month) => {
              setCurrentMonth(month.month - 1);
              setCurrentYear(month.year);
            }}
            markingType={'custom'}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#FFFFFF',
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: '#2563EB',
              selectedDayBackgroundColor: '#2563EB',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#2563EB',
              dayTextColor: '#374151',
              textDisabledColor: '#D1D5DB',
              arrowColor: '#2563EB',
              monthTextColor: '#111827',
              indicatorColor: '#2563EB',
            }}
          />
        </View>

        {selectedDate && (
          <View style={styles.attendanceActions}>
            <Text style={styles.selectedDateText}>
              Selected: {new Date(selectedDate).toLocaleDateString()}
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.presentButton}
                onPress={() => markAttendance('present')}
              >
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Present</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.absentButton}
                onPress={() => markAttendance('absent')}
              >
                <XCircle size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Absent</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Monthly Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Work Days:</Text>
            <Text style={styles.summaryValue}>{workDays} days</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Daily Rate:</Text>
            <Text style={styles.summaryValue}>₹{dailyRate}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{monthlyTotal.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.payButton, monthlyTotal === 0 && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={monthlyTotal === 0}
        >
          <DollarSign size={20} color="#FFFFFF" />
          <Text style={styles.payButtonText}>
            Pay ₹{monthlyTotal.toLocaleString()}
          </Text>
        </TouchableOpacity>

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FCD34D' }]} />
              <Text style={styles.legendText}>Joining Date</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Absent</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#2563EB',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendanceActions: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  presentButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  absentButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16A34A',
  },
  payButton: {
    backgroundColor: '#16A34A',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  payButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});