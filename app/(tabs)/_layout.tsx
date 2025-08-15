import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Briefcase, User, Plus, Search, FileText, Users, DollarSign, List } from 'lucide-react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is a worker
          let docRef = doc(db, 'workers', user.uid);
          let docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserType('worker');
          } else {
            // Check if user is an organization
            docRef = doc(db, 'organizations', user.uid);
            docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserType('organization');
            }
          }
        } catch (error) {
          console.error('Error fetching user type:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: userType === 'organization' ? t('applications') : t('findJobs'),
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      {userType === 'organization' && (
        <Tabs.Screen
          name="post-job"
          options={{
            title: t('postJob'),
            tabBarIcon: ({ size, color }) => (
              <Plus size={size} color={color} />
            ),
          }}
        />
      )}
      {userType === 'organization' && (
        <Tabs.Screen
          name="my-jobs"
          options={{
            title: t('myJobs'),
            tabBarIcon: ({ size, color }) => (
              <List size={size} color={color} />
            ),
          }}
        />
      )}
      {userType === 'organization' && (
        <Tabs.Screen
          name="workers"
          options={{
            title: t('workers'),
            tabBarIcon: ({ size, color }) => (
              <Users size={size} color={color} />
            ),
          }}
        />
      )}
      {userType === 'worker' && (
        <Tabs.Screen
          name="applied-jobs"
          options={{
            title: t('appliedJobs'),
            tabBarIcon: ({ size, color }) => (
              <FileText size={size} color={color} />
            ),
          }}
        />
      )}
      {userType === 'worker' && (
        <Tabs.Screen
          name="payments"
          options={{
            title: t('payments'),
            tabBarIcon: ({ size, color }) => (
              <DollarSign size={size} color={color} />
            ),
          }}
        />
      )}
      {/* Hide post-job and applied-jobs from the opposite user types */}
      {userType === 'worker' && (
        <Tabs.Screen
          name="post-job"
          options={{
            href: null, // This hides the tab
          }}
        />
      )}
      {userType === 'worker' && (
        <Tabs.Screen
          name="my-jobs"
          options={{
            href: null, // This hides the tab
          }}
        />
      )}
      {userType === 'worker' && (
        <Tabs.Screen
          name="workers"
          options={{
            href: null, // This hides the tab
          }}
        />
      )}
      {userType === 'organization' && (
        <Tabs.Screen
          name="applied-jobs"
          options={{
            href: null, // This hides the tab
          }}
        />
      )}
      {userType === 'organization' && (
        <Tabs.Screen
          name="payments"
          options={{
            href: null, // This hides the tab
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}