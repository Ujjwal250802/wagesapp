import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { router } from 'expo-router';
import { User, LogOut, CreditCard as Edit, Briefcase, Building, Mail, Phone } from 'lucide-react-native';
import { Brain } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';

export default function Profile() {
  const { colors } = useTheme();
  const { t } = useLanguage();
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerControls}>
          <LanguageSelector />
          <ThemeToggle />
        </View>
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
            {userProfile?.userType === 'worker' ? t('jobSeeker') : t('employer')}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {userProfile?.bio && (
          <View style={[styles.bioSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.bioTitle, { color: colors.text }]}>{t('about')}</Text>
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>{userProfile.bio}</Text>
          </View>
        )}

        <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('contactInformation')}</Text>
          <View style={styles.infoItem}>
            <Mail size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{userProfile?.email}</Text>
          </View>
          {userProfile?.phone && (
            <View style={styles.infoItem}>
              <Phone size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{userProfile.phone}</Text>
            </View>
          )}
          {userProfile?.userType === 'organization' && userProfile?.contactPerson && (
            <View style={styles.infoItem}>
              <User size={16} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{userProfile.contactPerson}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/edit-profile')}
        >
          <Edit size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>{t('editProfile')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/ai-insights')}
        >
          <Brain size={20} color={colors.secondary} />
          <Text style={[styles.actionButtonText, { color: colors.secondary }]}>AI Business Insights</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: colors.surface, borderColor: colors.error }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.signOutButtonText}>{t('signOut')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 20,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 20,
    borderWidth: 1,
  },
  signOutButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});