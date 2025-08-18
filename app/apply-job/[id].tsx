import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { ArrowLeft, User, Phone, Clock, FileText, Briefcase } from 'lucide-react-native';
import * as MailComposer from 'expo-mail-composer';
import VoiceInput from '../../components/VoiceInput';

export default function ApplyJob() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form fields
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  useEffect(() => {
    fetchJobAndUserData();
  }, [id]);

  const fetchJobAndUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to apply');
        router.back();
        return;
      }

      // Fetch job details
      const jobDoc = await getDoc(doc(db, 'jobs', id));
      if (jobDoc.exists()) {
        setJob({ id: jobDoc.id, ...jobDoc.data() });
      }

      // Fetch user profile to pre-fill form
      const userDoc = await getDoc(doc(db, 'workers', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        setApplicantName(userData.name || '');
        setApplicantPhone(userData.phone || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load application form');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!applicantName || !applicantPhone || !experience) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to apply');
        return;
      }

      // Save application to Firestore
      await addDoc(collection(db, 'applications'), {
        jobId: id,
        jobTitle: job.category,
        organizationName: job.organizationName,
        applicantId: user.uid,
        applicantName: applicantName,
        applicantPhone: applicantPhone,
        applicantEmail: user.email,
        experience: parseInt(experience),
        additionalInfo: additionalInfo,
        appliedAt: new Date(),
        status: 'pending',
      });

      // Send email to employer
      const emailBody = `
New Job Application

Job Category: ${job.category}
Organization: ${job.organizationName}

Applicant Details:
Name: ${applicantName}
Phone: ${applicantPhone}
Email: ${user.email}
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

      Alert.alert(
        'Success', 
        'Your application has been submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
              router.back(); // Go back to jobs list
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading application form...</Text>
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Job</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.jobInfo}>
          <View style={styles.jobHeader}>
            <Briefcase size={24} color="#2563EB" />
            <View style={styles.jobDetails}>
              <Text style={styles.jobTitle}>{job.category}</Text>
              <Text style={styles.organizationName}>{job.organizationName}</Text>
            </View>
          </View>
        </View>

        <VoiceInput
          onTextReceived={setAdditionalInfo}
          context="application"
          placeholder="Tell us about yourself using voice"
        />

        <View style={styles.form}>
          <Text style={styles.formTitle}>Application Details</Text>
          
          <View style={styles.inputContainer}>
            <User size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your Full Name *"
              value={applicantName}
              onChangeText={setApplicantName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your Phone Number *"
              value={applicantPhone}
              onChangeText={setApplicantPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Clock size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Years of Experience *"
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

          <Text style={styles.requiredNote}>* Required fields</Text>

          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitApplication}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  jobInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  jobDetails: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  organizationName: {
    fontSize: 14,
    color: '#6B7280',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 16,
  },
  formTitle: {
    fontSize: 18,
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
  submitButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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