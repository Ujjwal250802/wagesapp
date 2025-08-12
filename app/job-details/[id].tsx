import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { ArrowLeft, DollarSign, MapPin, Clock, Building, Mail, Phone } from 'lucide-react-native';

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', id));
      if (jobDoc.exists()) {
        setJob({ id: jobDoc.id, ...jobDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const applicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', '==', id),
        where('applicantId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(applicationsQuery);
      setHasApplied(!querySnapshot.empty);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApplyPress = () => {
    router.push(`/apply-job/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text>Job not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#2563EB" />
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{job.category}</Text>
          <Text style={styles.organizationName}>{job.organizationName}</Text>
          
          <View style={styles.jobMeta}>
            <View style={styles.metaItem}>
              <DollarSign size={16} color="#16A34A" />
              <Text style={styles.salary}>₹{job.salary}/day</Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.location}>{job.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.postedDate}>
                Posted {new Date(job.createdAt?.toDate()).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Building size={16} color="#6B7280" />
              <Text style={styles.contactText}>{job.organizationName}</Text>
            </View>
            <View style={styles.contactItem}>
              <Mail size={16} color="#6B7280" />
              <Text style={styles.contactText}>{job.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Phone size={16} color="#6B7280" />
              <Text style={styles.contactText}>{job.phone}</Text>
            </View>
          </View>
        </View>

        {hasApplied ? (
          <View style={styles.appliedContainer}>
            <Text style={styles.appliedText}>✓ Applied</Text>
            <Text style={styles.appliedSubtext}>You have already applied for this job</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={handleApplyPress}
          >
            <Text style={styles.applyButtonText}>Apply for this Job</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingTop: 100,
  },
  jobHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  organizationName: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 16,
  },
  jobMeta: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  salary: {
    fontSize: 18,
    fontWeight: '600',
    color: '#16A34A',
  },
  location: {
    fontSize: 16,
    color: '#374151',
  },
  postedDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#374151',
  },
  applyButton: {
    backgroundColor: '#2563EB',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appliedContainer: {
    backgroundColor: '#D1FAE5',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  appliedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  appliedSubtext: {
    fontSize: 14,
    color: '#047857',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});