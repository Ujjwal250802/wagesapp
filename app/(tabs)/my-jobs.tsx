import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { router } from 'expo-router';
import { Briefcase, MapPin, Clock, DollarSign, Trash2, Users, Eye } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';

export default function MyJobs() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const jobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
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
      Alert.alert('Error', 'Failed to fetch your jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    Alert.alert(
      'Delete Job',
      `Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteJob(jobId)
        }
      ]
    );
  };

  const deleteJob = async (jobId) => {
    try {
      // Delete the job
      await deleteDoc(doc(db, 'jobs', jobId));
      
      // Remove from local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      Alert.alert('Success', 'Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      Alert.alert('Error', 'Failed to delete job. Please try again.');
    }
  };

  const renderJobCard = ({ item }) => (
    <View style={[styles.jobCard, { backgroundColor: colors.surface }]}>
      <View style={styles.jobHeader}>
        <Text style={[styles.jobTitle, { color: colors.text }]}>{t(item.category.toLowerCase().replace(/\s+/g, ''))}</Text>
        <View style={styles.salaryContainer}>
          <DollarSign size={16} color="#16A34A" />
          <Text style={[styles.salary, { color: colors.text }]}>₹{item.salary}/day</Text>
        </View>
      </View>
      
      <Text style={[styles.organizationName, { color: colors.textSecondary }]}>{item.organizationName}</Text>
      <Text style={[styles.jobDescription, { color: colors.text }]} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.jobFooter}>
        <View style={styles.locationContainer}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={[styles.location, { color: colors.textSecondary }]}>{item.location}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {new Date(item.createdAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.viewButton, { backgroundColor: colors.background }]}
          onPress={() => router.push(`/job-details/${item.id}`)}
        >
          <Eye size={16} color={colors.primary} />
          <Text style={[styles.viewButtonText, { color: colors.primary }]}>{t('view')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.applicationsButton, { backgroundColor: colors.background }]}
          onPress={() => router.push(`/job-applications/${item.id}`)}
        >
          <Users size={16} color={colors.secondary} />
          <Text style={[styles.applicationsButtonText, { color: colors.secondary }]}>{t('applicationsCount')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          <style={[styles.deleteButton, { backgroundColor: colors.background }]}
          onPress={() => handleDeleteJob(item.id, item.category)}
        >
          <Trash2 size={16} color={colors.error} />
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>{t('delete')}</Text>
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('myPostedJobs')}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{t('manageJobPostings')}</Text>
          </View>
          <View style={styles.headerControls}>
            <LanguageSelector />
            <ThemeToggle />
          </View>
        </View>
      </View>

      {jobs.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Briefcase size={48} color="#D1D5DB" />
          <Text style={[styles.emptyText, { color: colors.text }]}>{t('noJobsPosted')}</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t('startPostingJobs')}</Text>
          <TouchableOpacity 
            style={[styles.postJobButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/(tabs)/post-job')}
          >
            <Text style={styles.postJobButtonText}>{t('postFirstJob')}</Text>
          </TouchableOpacity>
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
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
  },
  organizationName: {
    fontSize: 14,
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  applicationsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applicationsButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
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
    marginBottom: 24,
  },
  postJobButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  postJobButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});