import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { ArrowLeft, User, Phone, Clock, Mail } from 'lucide-react-native';

export default function JobApplications() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJobAndApplications();
    }
  }, [id]);

  const fetchJobAndApplications = async () => {
    try {
      // Fetch job details
      const jobDoc = await getDoc(doc(db, 'jobs', id));
      if (jobDoc.exists()) {
        setJob({ id: jobDoc.id, ...jobDoc.data() });
      }

      // Fetch applications for this job
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', '==', id),
        where('status', 'in', ['pending', 'accepted', 'rejected'])
      );
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
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const renderApplicationCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.applicationCard}
      onPress={() => router.push(`/application-details/${item.id}`)}
    >
      <View style={styles.applicationHeader}>
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName}>{item.applicantName}</Text>
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
      </View>
      
      <View style={styles.contactInfo}>
        <View style={styles.infoRow}>
          <Phone size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.applicantPhone}</Text>
        </View>
        {item.applicantEmail && (
          <View style={styles.infoRow}>
            <Mail size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.applicantEmail}</Text>
          </View>
        )}
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
        <Text>Loading applications...</Text>
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
          <ArrowLeft size={24} color="#2563EB" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Applications</Text>
          <Text style={styles.headerSubtitle}>
            {job?.category} - {applications.length} application{applications.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {applications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <User size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No applications yet</Text>
          <Text style={styles.emptySubtext}>Applications will appear here when job seekers apply</Text>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  applicationsList: {
    padding: 20,
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
  applicationHeader: {
    marginBottom: 12,
  },
  applicantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicantName: {
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
  contactInfo: {
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
  applicationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
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