import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { Briefcase, MapPin, Clock, DollarSign, LogOut, Building, Phone } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';
import * as MailComposer from 'expo-mail-composer';

export default function CurrentJobs() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [currentJobs, setCurrentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentJobs();
  }, []);

  const fetchCurrentJobs = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get accepted applications for this worker
      const applicationsQuery = query(
        collection(db, 'applications'), 
        where('applicantId', '==', user.uid),
        where('status', '==', 'accepted')
      );
      
      const snapshot = await getDocs(applicationsQuery);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by acceptance date (newest first)
      jobsData.sort((a, b) => {
        const dateA = a.appliedAt?.toDate() || new Date(0);
        const dateB = b.appliedAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setCurrentJobs(jobsData);
    } catch (error) {
      console.error('Error fetching current jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveJob = (job) => {
    Alert.alert(
      'Leave Job',
      `Are you sure you want to leave the job "${job.jobTitle}" at ${job.organizationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Leave Job', 
          style: 'destructive',
          onPress: () => confirmLeaveJob(job)
        }
      ]
    );
  };

  const confirmLeaveJob = async (job) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Update application status to 'left'
      await updateDoc(doc(db, 'applications', job.id), {
        status: 'left',
        leftAt: new Date(),
        updatedAt: new Date(),
      });

      // Send email to employer
      const emailSubject = `Worker Left Job - ${job.jobTitle}`;
      const emailBody = `
Job Leave Notification

Worker Details:
Name: ${job.applicantName}
Phone: ${job.applicantPhone}
Email: ${user.email}

Job Details:
Position: ${job.jobTitle}
Organization: ${job.organizationName}

The worker has decided to leave this position effective immediately.

Date of leaving: ${new Date().toLocaleDateString()}

Please update your records accordingly.

Best regards,
ROZGAR Team
      `;

      try {
        // Get job details to find employer email
        const jobsQuery = query(collection(db, 'jobs'), where('category', '==', job.jobTitle));
        const jobsSnapshot = await getDocs(jobsQuery);
        
        let employerEmail = '';
        jobsSnapshot.docs.forEach(doc => {
          const jobData = doc.data();
          if (jobData.organizationName === job.organizationName) {
            employerEmail = jobData.email;
          }
        });

        if (employerEmail) {
          await MailComposer.composeAsync({
            recipients: [employerEmail],
            subject: emailSubject,
            body: emailBody,
          });
        }
      } catch (emailError) {
        console.log('Email composer not available, but job leave was recorded');
      }

      // Remove from local state
      setCurrentJobs(prevJobs => prevJobs.filter(j => j.id !== job.id));
      
      Alert.alert(
        'Job Left Successfully',
        'You have successfully left the job. The employer has been notified.'
      );
    } catch (error) {
      console.error('Error leaving job:', error);
      Alert.alert('Error', 'Failed to leave job. Please try again.');
    }
  };

  const renderJobCard = ({ item }) => (
    <View style={[styles.jobCard, { backgroundColor: colors.surface }]}>
      <View style={styles.jobHeader}>
        <Text style={[styles.jobTitle, { color: colors.text }]}>{item.jobTitle}</Text>
        <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.statusText, { color: colors.success }]}>Active</Text>
        </View>
      </View>
      
      <View style={styles.jobInfo}>
        <View style={styles.infoRow}>
          <Building size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{item.organizationName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>{item.organizationPhone || 'Contact via email'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Started: {new Date(item.appliedAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.jobFooter}>
        <TouchableOpacity 
          style={[styles.leaveButton, { backgroundColor: colors.error }]}
          onPress={() => handleLeaveJob(item)}
        >
          <LogOut size={16} color="#FFFFFF" />
          <Text style={styles.leaveButtonText}>Leave Job</Text>
        </TouchableOpacity>
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Current Jobs</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Manage your active work positions</Text>
          </View>
          <View style={styles.headerControls}>
            <LanguageSelector />
            <ThemeToggle />
          </View>
        </View>
      </View>

      {currentJobs.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Briefcase size={48} color="#D1D5DB" />
          <Text style={[styles.emptyText, { color: colors.text }]}>No current jobs</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Your accepted job positions will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentJobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobsList}
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
  jobsList: {
    padding: 20,
  },
  jobCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  jobInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  jobFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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