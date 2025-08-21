import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { ArrowLeft, User, Phone, Clock, FileText, Check, X } from 'lucide-react-native';
import * as MailComposer from 'expo-mail-composer';

export default function ApplicationDetails() {
  const { id } = useLocalSearchParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const applicationDoc = await getDoc(doc(db, 'applications', id));
      if (applicationDoc.exists()) {
        setApplication({ id: applicationDoc.id, ...applicationDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      // Update application status
      await updateDoc(doc(db, 'applications', id), {
        status: status,
        updatedAt: new Date(),
      });

      // Send email to applicant
      const emailSubject = status === 'accepted' 
        ? `Job Application Accepted - ${application.jobTitle}`
        : `Job Application Update - ${application.jobTitle}`;

      const emailBody = status === 'accepted'
        ? `
Congratulations!

Your application for the ${application.jobTitle} position at ${application.organizationName} has been ACCEPTED.

We will contact you soon with further details.

Best regards,
${application.organizationName}
        `
        : `
Application Update

Thank you for your interest in the ${application.jobTitle} position at ${application.organizationName}.

After careful consideration, we have decided to move forward with other candidates at this time.

We appreciate your time and interest in our organization.

Best regards,
${application.organizationName}
        `;

      try {
        await MailComposer.composeAsync({
          recipients: [application.applicantEmail || ''],
          subject: emailSubject,
          body: emailBody,
        });
      } catch (emailError) {
        console.log('Email composer not available, but status was updated');
      }

      // Update local state
      setApplication(prev => ({ ...prev, status: status }));
      
      Alert.alert(
        'Success', 
        `Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update application status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading application details...</Text>
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.errorContainer}>
        <Text>Application not found</Text>
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
          application.status === 'rejected' && styles.rejectedBadge,
          application.status === 'left' && styles.leftBadge
          <Text style={styles.jobTitle}>{application.jobTitle}</Text>
          <View style={[styles.statusBadge, 
            application.status === 'accepted' && styles.acceptedBadge,
            application.status === 'rejected' && styles.rejectedText,
            application.status === 'left' && styles.leftText
          ]}>
            <Text style={[styles.statusText,
              application.status === 'accepted' && styles.acceptedText,
              application.status === 'rejected' && styles.rejectedText
            ]}>
              {application.status || 'Pending'}
            </Text>
          </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applicant Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <User size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{application.applicantName}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Phone size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{application.applicantPhone}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={20} color="#6B7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Experience</Text>
                <Text style={styles.infoValue}>{application.experience} years</Text>
              </View>
            </View>
          </View>
        </View>

        {application.additionalInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.additionalInfoContainer}>
              <FileText size={20} color="#6B7280" />
              <Text style={styles.additionalInfoText}>{application.additionalInfo}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Details</Text>
          <Text style={styles.appliedDate}>
            {application.status === 'left' ? 'Worker Left' : (application.status || 'Pending')}
          </Text>
        </View>

        {(!application.status || application.status === 'pending') && application.status !== 'left' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.rejectButton}
              onPress={() => handleStatusUpdate('rejected')}
              disabled={updating}
            >
              <X size={20} color="#FFFFFF" />
              <Text style={styles.rejectButtonText}>
                {updating ? 'Updating...' : 'Reject'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleStatusUpdate('accepted')}
              disabled={updating}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>
                {updating ? 'Updating...' : 'Accept'}
              </Text>
            </TouchableOpacity>
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  acceptedBadge: {
    backgroundColor: '#D1FAE5',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  leftBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  acceptedText: {
    color: '#065F46',
  },
  rejectedText: {
    color: '#991B1B',
  },
  leftText: {
    color: '#92400E',
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
    marginBottom: 16,
  },
  infoContainer: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  additionalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  additionalInfoText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  appliedDate: {
    fontSize: 16,
    color: '#6B7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  rejectButtonText: {
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