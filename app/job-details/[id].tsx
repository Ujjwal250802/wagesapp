import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { ArrowLeft, MapPin, DollarSign, Clock, Building, Mail, Phone, User, FileText } from 'lucide-react-native';
import * as MailComposer from 'expo-mail-composer';

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchJobDetails();
    checkIfApplied();
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'workers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profile = docSnap.data();
          setUserProfile(profile);
          setApplicantName(profile.name || '');
          setApplicantPhone(profile.phone || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

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

  const checkIfApplied = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const applicationsQuery = query(
        collection(db, 'applications'),
        where('jobId', '==', id),
        where('applicantId', '==', user.uid)
      );
      
      const snapshot = await getDocs(applicationsQuery);
      setHasApplied(!snapshot.empty);
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApplyJob = async () => {
    if (!applicantName || !applicantPhone || !experience) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Save application to Firestore
      await addDoc(collection(db, 'applications'), {
        jobId: id,
        jobTitle: job.category,
        organizationName: job.organizationName,
        applicantName,
        applicantPhone,
        experience,
        additionalInfo,
        appliedAt: new Date(),
        applicantId: auth.currentUser?.uid,
        status: 'pending',
      });

      // Send email to organization
      const emailBody = `
New Job Application

Job Category: ${job.category}
Organization: ${job.organizationName}

Applicant Details:
Name: ${applicantName}
Phone: ${applicantPhone}
Experience: ${experience} years
Additional Information: ${additionalInfo || 'None provided'}

Applied on: ${new Date().toLocaleDateString()}
      `;

      try {
        await MailComposer.composeAsync({
          recipients: [job.email],
          subject: `Job Application - ${job.category}`,
          body: emailBody,
        });
      } catch (emailError) {
        console.log('Email composer not available, but application was saved');
      }

      setHasApplied(true);
      setShowApplicationForm(false);
      Alert.alert('Success', 'Your application has been submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
        ) : !showApplicationForm ? (
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => setShowApplicationForm(true)}
          >
            <Text style={styles.applyButtonText}>Apply for this Job</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.applicationForm}>
            <Text style={styles.formTitle}>Application Form</Text>
            
            <View style={styles.inputContainer}>
              <User size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your Full Name"
                value={applicantName}
                onChangeText={setApplicantName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your Phone Number"
                value={applicantPhone}
                onChangeText={setApplicantPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Clock size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Years of Experience"
                value={experience}
                onChangeText={setExperience}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <FileText size={20} color="#6B7280" style={[styles.inputIcon, styles.textAreaIcon]} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Additional Information (optional)"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowApplicationForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleApplyJob}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    height: 100,
    textAlignVertical: 'top',
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