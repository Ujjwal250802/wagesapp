import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { router } from 'expo-router';
import { Briefcase, MapPin, Clock, DollarSign, Trash2, Users, Eye } from 'lucide-react-native';

export default function MyJobs() {
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
    <View style={styles.jobCard}>
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

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => router.push(`/job-details/${item.id}`)}
        >
          <Eye size={16} color="#2563EB" />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.applicationsButton}
          onPress={() => router.push(`/job-applications/${item.id}`)}
        >
          <Users size={16} color="#16A34A" />
          <Text style={styles.applicationsButtonText}>Applications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteJob(item.id, item.category)}
        >
          <Trash2 size={16} color="#EF4444" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Posted Jobs</Text>
        <Text style={styles.headerSubtitle}>Manage your job postings</Text>
      </View>

      {jobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Briefcase size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No jobs posted yet</Text>
          <Text style={styles.emptySubtext}>Start posting jobs to find workers</Text>
          <TouchableOpacity 
            style={styles.postJobButton}
            onPress={() => router.push('/(tabs)/post-job')}
          >
            <Text style={styles.postJobButtonText}>Post Your First Job</Text>
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
  jobsList: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
    color: '#16A34A',
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
    backgroundColor: '#EBF4FF',
  },
  viewButtonText: {
    fontSize: 12,
    color: '#2563EB',
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
    backgroundColor: '#F0FDF4',
  },
  applicationsButtonText: {
    fontSize: 12,
    color: '#16A34A',
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
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
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
    marginBottom: 24,
  },
  postJobButton: {
    backgroundColor: '#16A34A',
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