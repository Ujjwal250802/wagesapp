import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { router } from 'expo-router';
import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react-native';

export default function AppliedJobs() {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const applicationsQuery = query(
        collection(db, 'applications'), 
        where('applicantId', '==', user.uid)
      );
      
      const snapshot = await getDocs(applicationsQuery);
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by application date (newest first)
      applicationsData.sort((a, b) => {
        const dateA = a.appliedAt?.toDate() || new Date(0);
        const dateB = b.appliedAt?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setAppliedJobs(applicationsData);
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAppliedJobCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => router.push(`/job-details/${item.jobId}`)}
    >
      <View style={styles.jobHeader}>
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
      
      <Text style={styles.organizationName}>{item.organizationName}</Text>
      
      <View style={styles.jobFooter}>
        <View style={styles.appliedContainer}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.appliedDate}>
            Applied: {new Date(item.appliedAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading applied jobs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Applied Jobs</Text>
        <Text style={styles.headerSubtitle}>Track your job applications</Text>
      </View>

      {appliedJobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Briefcase size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No applications yet</Text>
          <Text style={styles.emptySubtext}>Start applying to jobs to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={appliedJobs}
          renderItem={renderAppliedJobCard}
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
    marginBottom: 12,
  },
  jobFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  appliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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