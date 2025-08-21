import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase-config';
import { router } from 'expo-router';
import { Search, MapPin, Clock, DollarSign, User, Mail, Phone, Briefcase, LogOut, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';
import * as MailComposer from 'expo-mail-composer';
import { Alert } from 'react-native';

const JOB_CATEGORIES = [
  'Electrician', 'Plumber', 'Mechanic', 'Cook', 'Peon', 
  'Driver', 'House Keeping', 'Construction Site Workers', 'Security Guard'
];

export default function MainScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [currentJobs, setCurrentJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is a worker
          let docRef = doc(db, 'workers', user.uid);
          let docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserType('worker');
            fetchJobs();
            fetchCurrentJobs();
          } else {
            // Check if user is an organization
            docRef = doc(db, 'organizations', user.uid);
            docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserType('organization');
              fetchApplications();
            }
          }
        } catch (error) {
          console.error('Error fetching user type:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (userType === 'worker') {
      fetchJobs();
    }
  }, [selectedCategory, userType]);

  const fetchJobs = async () => {
    try {
      let jobsQuery;
      if (selectedCategory === 'All') {
        jobsQuery = collection(db, 'jobs');
      } else {
        jobsQuery = query(collection(db, 'jobs'), where('category', '==', selectedCategory));
      }
      
      const snapshot = await getDocs(jobsQuery);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by creation date (newest first)
      jobsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

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
      const currentJobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter only active jobs (not left)
      const activeJobs = currentJobsData.filter(job => job.workerStatus !== 'inactive');
      setCurrentJobs(activeJobs);
    } catch (error) {
      console.error('Error fetching current jobs:', error);
    }
  };

  const handleLeaveJob = async (job) => {
    Alert.alert(
      'Leave Job',
      `Are you sure you want to leave the job "${job.jobTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Leave Job', 
          style: 'destructive',
          onPress: () => leaveJob(job)
        }
      ]
    );
  };

  const leaveJob = async (job) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Update application status to inactive
      await updateDoc(doc(db, 'applications', job.id), {
        workerStatus: 'inactive',
        leftAt: new Date(),
        updatedAt: new Date()
      });

      // Send email to employer
      const emailBody = `
Job Resignation Notice

Dear Employer,

This is to inform you that ${job.applicantName} has decided to leave the job "${job.jobTitle}".

Worker Details:
Name: ${job.applicantName}
Phone: ${job.applicantPhone}
Email: ${user.email}

The worker's status has been updated to inactive in the system.

Thank you for your understanding.

Best regards,
ROZGAR Team
      `;

      try {
        await MailComposer.composeAsync({
          recipients: [job.organizationEmail || ''],
          subject: `Job Resignation - ${job.jobTitle}`,
          body: emailBody,
        });
      } catch (emailError) {
        console.log('Email composer not available, but status was updated');
      }

      // Refresh current jobs
      fetchCurrentJobs();
      
      Alert.alert(
        'Job Left Successfully',
        'You have successfully left the job. The employer has been notified.'
      );
    } catch (error) {
      console.error('Error leaving job:', error);
      Alert.alert('Error', 'Failed to leave job. Please try again.');
    }
  };

  const fetchApplications = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get jobs posted by this organization
      const jobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobIds = jobsSnapshot.docs.map(doc => doc.id);

      if (jobIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Get applications for these jobs
      const applicationsQuery = query(collection(db, 'applications'), where('jobId', 'in', jobIds));
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by application date (newest first)
      applicationsData.sort((a, b) => {
        const dateA = a.appliedAt?.toDate() || new Date(0);
        const dateB = b.appliedAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => router.push(`/job-details/${item.id}`)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.category}</Text>
        <View style={styles.salaryContainer}>
          <DollarSign size={16} color="#16A34A" />
          <Text style={styles.salary}>₹{item.salary}/day</Text>
        </View>
      </View>
      
      <Text style={styles.organizationName}>{item.organizationName}</Text>
      <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.jobFooter}>
        <View style={styles.locationContainer}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.time}>
            {new Date(item.createdAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCurrentJobCard = ({ item }) => (
    <View style={[styles.currentJobCard, { backgroundColor: colors.surface }]}>
      <View style={styles.currentJobHeader}>
        <View style={styles.currentJobInfo}>
          <Text style={[styles.currentJobTitle, { color: colors.text }]}>{item.jobTitle}</Text>
          <Text style={[styles.currentJobOrg, { color: colors.textSecondary }]}>{item.organizationName}</Text>
        </View>
        <View style={[styles.activeStatusBadge, { backgroundColor: colors.success }]}>
          <Text style={styles.activeStatusText}>Active</Text>
        </View>
      </View>
      
      <Text style={[styles.currentJobDescription, { color: colors.text }]} numberOfLines={2}>
        {item.jobDescription || 'No description available'}
      </Text>
      
      <View style={styles.currentJobFooter}>
        <View style={styles.currentJobMeta}>
          <Text style={[styles.currentJobDate, { color: colors.textSecondary }]}>
            Started: {new Date(item.appliedAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.leaveJobButton, { backgroundColor: colors.error }]}
          onPress={() => handleLeaveJob(item)}
        >
          <LogOut size={16} color="#FFFFFF" />
          <Text style={styles.leaveJobText}>Leave Job</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  const renderApplicationCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.applicationCard}
      onPress={() => router.push(`/application-details/${item.id}`)}
    >
      <View style={styles.applicationHeader}>
        <Text style={styles.jobTitle}>{item.jobTitle}</Text>
        <View style={[styles.statusBadge, 
          item.status === 'accepted' && styles.acceptedBadge,
          item.status === 'rejected' && styles.rejectedBadge
        ]}>
          <Text style={[styles.statusText,
            item.status === 'accepted' && styles.acceptedText,
            item.status === 'rejected' && styles.rejectedText
          ]}>
            {item.status || 'Pending'}
          </Text>
        </View>
      </View>
      
      <View style={styles.applicantInfo}>
        <View style={styles.infoRow}>
          <User size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.applicantName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.applicantPhone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.experience} years experience</Text>
        </View>
      </View>
      
      <View style={styles.applicationFooter}>
        <Text style={styles.appliedDate}>
          Applied: {new Date(item.appliedAt?.toDate()).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (userType === 'organization') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{t('jobApplications')}</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('manageApplications')}</Text>
            </View>
            <View style={styles.headerControls}>
              <LanguageSelector />
              <ThemeToggle />
            </View>
          </View>
        </View>

        {applications.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.emptyText, { color: colors.text }]}>{t('noApplicationsYet')}</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t('applicationsWillAppear')}</Text>
          </View>
        ) : (
          <FlatList
            data={applications}
            renderItem={renderApplicationCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.applicationsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('availableJobs')}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('findPerfectJob')}</Text>
          </View>
          <View style={styles.headerControls}>
            <LanguageSelector />
            <ThemeToggle />
          </View>
        </View>
      </View>

      {/* Current Jobs Section */}
      {currentJobs.length > 0 && (
        <View style={[styles.currentJobsSection, { backgroundColor: colors.surface }]}>
          <View style={styles.currentJobsHeader}>
            <Briefcase size={20} color={colors.primary} />
            <Text style={[styles.currentJobsTitle, { color: colors.text }]}>Current Jobs</Text>
          </View>
          <FlatList
            data={currentJobs}
            renderItem={renderCurrentJobCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.currentJobsList}
          />
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.categoriesContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={[
            styles.categoryChip, 
            { backgroundColor: colors.background, borderColor: colors.border },
            selectedCategory === 'All' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setSelectedCategory('All')}
        >
          <Text style={[
            styles.categoryText, 
            { color: colors.textSecondary },
            selectedCategory === 'All' && { color: '#FFFFFF' }
          ]}>
            {t('allJobs')}
          </Text>
        </TouchableOpacity>
        {JOB_CATEGORIES.map((category) => (
          <TouchableOpacity 
            key={category}
            style={[
              styles.categoryChip, 
              { backgroundColor: colors.background, borderColor: colors.border },
              selectedCategory === category && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText, 
              { color: colors.textSecondary },
              selectedCategory === category && { color: '#FFFFFF' }
            ]}>
              {t(category.toLowerCase().replace(/\s+/g, ''))}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {jobs.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.emptyText, { color: colors.text }]}>{t('noJobsAvailable')}</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t('checkBackLater')}</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
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
  currentJobsSection: {
    paddingVertical: 16,
    marginBottom: 8,
  },
  currentJobsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  currentJobsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  currentJobsList: {
    paddingHorizontal: 20,
  },
  currentJobCard: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentJobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  currentJobInfo: {
    flex: 1,
  },
  currentJobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  currentJobOrg: {
    fontSize: 14,
  },
  activeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  currentJobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  currentJobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentJobMeta: {
    flex: 1,
  },
  currentJobDate: {
    fontSize: 12,
  },
  leaveJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  leaveJobText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobsList: {
    padding: 20,
  },
  applicationsList: {
    padding: 20,
  },
  jobCard: {
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
  applicationCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  acceptedBadge: {
    backgroundColor: '#D1FAE5',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  acceptedText: {
    color: '#065F46',
  },
  rejectedText: {
    color: '#991B1B',
  },
  organizationName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  applicantInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  appliedDate: {
    fontSize: 12,
    color: '#6B7280',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});