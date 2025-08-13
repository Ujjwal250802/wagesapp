import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { Briefcase, User, Plus, Search, FileText } from 'lucide-react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import Layout from '../../components/Layout';

export default function TabLayout() {
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
    <Layout>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#6B7280',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            height: 80,
            paddingBottom: 10,
            paddingTop: 10,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: userType === 'organization' ? 'Applications' : 'Find Jobs',
            tabBarIcon: ({ size, color }) => (
              <Search size={size} color={color} />
            ),
          }}
        />
        {userType === 'organization' && (
          <Tabs.Screen
            name="post-job"
            options={{
              title: 'Post Job',
              tabBarIcon: ({ size, color }) => (
                <Plus size={size} color={color} />
              ),
            }}
          />
        )}
        {userType === 'worker' && (
          <Tabs.Screen
            name="applied-jobs"
            options={{
              title: 'Applied Jobs',
              tabBarIcon: ({ size, color }) => (
                <FileText size={size} color={color} />
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
        {userType === 'organization' && (
          <Tabs.Screen
            name="applied-jobs"
            options={{
              href: null, // This hides the tab
            }}
          />
        )}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </Layout>
  );
}