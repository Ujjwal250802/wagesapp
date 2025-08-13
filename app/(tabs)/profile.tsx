import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { router } from 'expo-router';
import { User, LogOut, Edit, Briefcase, Building, Mail, Phone } from 'lucide-react-native';

export default function Profile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Try to get worker profile first
        let docRef = doc(db, 'workers', user.uid);
        let docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          // If not a worker, try organization
          docRef = doc(db, 'organizations', user.uid);
          docSnap = await getDoc(docRef);
        }
        
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/auth/welcome');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {userProfile?.profileImage ? (
              <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
            ) : (
              <User size={40} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.profileName}>
            {userProfile?.name || userProfile?.organizationName || 'User'}
          </Text>
          <Text style={styles.profileEmail}>{userProfile?.email}</Text>
          <Text style={styles.userType}>
            {userProfile?.userType === 'worker' ? 'Job Seeker' : 'Employer'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {userProfile?.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>About</Text>
            <Text style={styles.bioText}>{userProfile.bio}</Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoItem}>
            <Mail size={16} color="#6B7280" />
            <Text style={styles.infoText}>{userProfile?.email}</Text>
          </View>
          {userProfile?.phone && (
            <View style={styles.infoItem}>
              <Phone size={16} color="#6B7280" />
              <Text style={styles.infoText}>{userProfile.phone}</Text>
            </View>
          )}
          {userProfile?.userType === 'organization' && userProfile?.contactPerson && (
            <View style={styles.infoItem}>
              <User size={16} color="#6B7280" />
              <Text style={styles.infoText}>{userProfile.contactPerson}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/edit-profile')}
        >
          <Edit size={20} color="#2563EB" />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  userType: {
    fontSize: 14,
    color: '#D1D5DB',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  content: {
    padding: 20,
    gap: 12,
  },
  bioSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});