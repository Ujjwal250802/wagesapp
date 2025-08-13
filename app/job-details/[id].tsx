import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { ArrowLeft, User, Phone, Clock, FileText, Briefcase, MapPin, DollarSign, Building, Mail, Navigation } from 'lucide-react-native';

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJobAndUserData();
  }, [id]);

  const fetchJobAndUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to view job details');
        router.back();
        return;
      }

      // Fetch job details
      const jobDoc = await getDoc(doc(db, 'jobs', id));
      if (jobDoc.exists()) {
        setJob({ id: jobDoc.id, ...jobDoc.data() });
      }

      // Check if user has already applied
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', '==', id),
        where('applicantId', '==', user.uid)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      setHasApplied(!applicationsSnapshot.empty);

      // Fetch user profile to pre-fill form
      const userDoc = await getDoc(doc(db, 'workers', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleGetDirections = () => {
    router.push(`/directions/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Job not found</Text>
        <TouchableOpacity 
          style={styles.backToHomeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backToHomeText}>Go Back</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Job Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleContainer}>
            <Briefcase size={24} color="#2563EB" />
            <View style={styles.jobTitleInfo}>
              <Text style={styles.jobTitle}>{job.category}</Text>
              <Text style={styles.organizationName}>{job.organizationName}</Text>
            </View>
          </View>
          
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
                Posted {job.createdAt ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Recently'}
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

      </ScrollView>

      <View style={styles.bottomActions}>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.directionsButton}
            onPress={handleGetDirections}
          >
            <Navigation size={20} color="#2563EB" />
            <Text style={styles.directionsButtonText}>Directions</Text>
          </TouchableOpacity>
          
          {hasApplied ? (
            <View style={styles.appliedButton}>
              <Text style={styles.appliedText}>✓ Applied</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => router.push(`/apply-job/${id}`)}
            >
              <Text style={styles.applyButtonText}>Apply for this Job</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  jobHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  jobTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  jobTitleInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  organizationName: {
    fontSize: 16,
    color: '#6B7280',
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
  applicationForm: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    gap: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  requiredNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  directionsButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appliedButton: {
    flex: 2,
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  appliedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  backToHomeButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToHomeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});