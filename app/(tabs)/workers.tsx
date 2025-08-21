import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { router } from 'expo-router';
import { User, Briefcase, Calendar, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';

export default function Workers() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [acceptedWorkers, setAcceptedWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcceptedWorkers();
  }, []);

  const fetchAcceptedWorkers = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get jobs posted by this organization
      const jobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const jobIds = jobs.map(job => job.id);

      if (jobIds.length === 0) {
        setAcceptedWorkers([]);
        setLoading(false);
        return;
      }

      // Get accepted applications for these jobs
      const applicationsQuery = query(
        collection(db, 'applications'), 
        where('jobId', 'in', jobIds),
        where('status', '==', 'accepted')
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      
      const workersData = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
        const appData = doc.data();
        // Find the corresponding job to get salary info
        const job = jobs.find(j => j.id === appData.jobId);
        return {
        id: doc.id,
          ...appData,
          salary: job?.salary || 500 // Default daily rate if not found
        };
      }));

      // Group by worker to avoid duplicates
      const uniqueWorkers = workersData.reduce((acc, worker) => {
        const existingWorker = acc.find(w => w.applicantId === worker.applicantId);
        if (!existingWorker) {
          acc.push(worker);
        }
        return acc;
      }, []);

      setAcceptedWorkers(uniqueWorkers);
    } catch (error) {
      console.error('Error fetching accepted workers:', error);
      Alert.alert('Error', 'Failed to fetch workers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderWorkerCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.workerCard, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/worker-calendar/${item.applicantId}?jobTitle=${encodeURIComponent(item.jobTitle)}&salary=${item.salary || 500}`)}
    >
      <View style={styles.workerHeader}>
        <View style={[styles.workerAvatar, { backgroundColor: colors.background }]}>
          <User size={24} color={colors.primary} />
        </View>
        <View style={styles.workerInfo}>
          <Text style={[styles.workerName, { color: colors.text }]}>{item.applicantName}</Text>
          <View style={styles.jobInfo}>
            <Briefcase size={16} color={colors.textSecondary} />
            <Text style={[styles.jobTitle, { color: colors.textSecondary }]}>{item.jobTitle}</Text>
          </View>
          <View style={styles.dateInfo}>
            <Calendar size={16} color={colors.secondary} />
            <Text style={[styles.acceptedDate, { color: colors.secondary }]}>
              {t('joined')}: {new Date(item.appliedAt?.toDate()).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.workerFooter}>
        <View style={styles.contactInfo}>
          <Text style={[styles.phoneNumber, { color: colors.text }]}>{item.applicantPhone}</Text>
          <Text style={[styles.experience, { color: colors.textSecondary }]}>{item.experience} {t('yearsExp')}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.background }]}>
          <Text style={[styles.statusText, { color: colors.secondary }]}>{t('active')}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('myWorkers')}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('manageAcceptedWorkers')}</Text>
          </View>
          <View style={styles.headerControls}>
            <LanguageSelector />
            <ThemeToggle />
          </View>
        </View>
      </View>

      {acceptedWorkers.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <User size={48} color="#D1D5DB" />
          <Text style={[styles.emptyText, { color: colors.text }]}>{t('noWorkersYet')}</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t('workersWillAppear')}</Text>
        </View>
      ) : (
        <FlatList
          data={acceptedWorkers}
          renderItem={renderWorkerCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.workersList}
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
  workersList: {
    padding: 20,
  },
  workerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acceptedDate: {
    fontSize: 12,
  },
  workerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  contactInfo: {
    flex: 1,
  },
  phoneNumber: {
    fontSize: 14,
    marginBottom: 2,
  },
  experience: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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