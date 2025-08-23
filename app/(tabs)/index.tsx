import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ImageBackground, Dimensions } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { router } from 'expo-router';
import { Search, MapPin, Clock, DollarSign, User, Mail, Phone } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const JOB_CATEGORIES = [
  'Electrician', 'Plumber', 'Mechanic', 'Cook', 'Peon', 
  'Driver', 'House Keeping', 'Construction Site Workers', 'Security Guard'
];

export default function MainScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is a worker
          let docRef = doc(db, 'workers', user.uid);
          let docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserType('worker');
            fetchJobs();
          } else {
            // Check if user is an organization
            docRef = doc(db, 'organizations', user.uid);
            docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setUserType('organization');
              fetchApplications();
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

  useEffect(() => {
    if (userType === 'worker') {
      fetchJobs();
    }
  }, [selectedCategory, userType]);

  const fetchJobs = async () => {
    try {
      let jobsQuery;
      if (selectedCategory === 'All') {
        jobsQuery = collection(db, 'jobs');
      } else {
        jobsQuery = query(collection(db, 'jobs'), where('category', '==', selectedCategory));
      }
      
      const snapshot = await getDocs(jobsQuery);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by creation date (newest first)
      jobsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate() || new Date(0);
        const dateB = b.createdAt?.toDate() || new Date(0);
        return dateB - dateA;
      });
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get jobs posted by this organization
      const jobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', user.uid));
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobIds = jobsSnapshot.docs.map(doc => doc.id);

      if (jobIds.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Get applications for these jobs
      const applicationsQuery = query(collection(db, 'applications'), where('jobId', 'in', jobIds));
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

      // Filter to show only pending and accepted applications (not left ones)
      const activeApplications = applicationsData.filter(app => app.status !== 'left');
      setApplications(activeApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => router.push(`/job-details/${item.id}`)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.category}</Text>
        <View style={styles.salaryContainer}>
          <DollarSign size={16} color="#16A34A" />
          <Text style={styles.salary}>₹{item.salary}/day</Text>
        </View>
      </View>
      
      <Text style={styles.organizationName}>{item.organizationName}</Text>
      <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.jobFooter}>
        <View style={styles.locationContainer}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.time}>
            {new Date(item.createdAt?.toDate()).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderApplicationCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.applicationCard}
      onPress={() => router.push(`/application-details/${item.id}`)}
    >
      <View style={styles.applicationHeader}>
        <Text style={styles.jobTitle}>{item.jobTitle}</Text>
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
      
      <View style={styles.applicantInfo}>
        <View style={styles.infoRow}>
          <User size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.applicantName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Phone size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.applicantPhone}</Text>
        </View>
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
        <Text>Loading...</Text>
      </View>
    );
  }

  if (userType === 'organization') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ImageBackground
          source={{ uri: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.overlay} />
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerContent}>
                <Text style={[styles.headerTitle, { color: '#FFFFFF', fontFamily: 'Poppins-Bold' }]}>{t('jobApplications')}</Text>
                <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.9)', fontFamily: 'Inter-Regular' }]}>{t('manageApplications')}</Text>
              </View>
              <View style={styles.headerControls}>
                <LanguageSelector />
                <ThemeToggle />
              </View>
            </View>
          </View>
        </ImageBackground>

        {applications.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
            <Text style={[styles.emptyText, { color: colors.text, fontFamily: 'Poppins-SemiBold' }]}>{t('noApplicationsYet')}</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary, fontFamily: 'Inter-Regular' }]}>{t('applicationsWillAppear')}</Text>
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.overlay} />
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerContent}>
              <Text style={[styles.headerTitle, { color: '#FFFFFF', fontFamily: 'Poppins-Bold' }]}>{t('availableJobs')}</Text>
              <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.9)', fontFamily: 'Inter-Regular' }]}>{t('findPerfectJob')}</Text>
            </View>
            <View style={styles.headerControls}>
              <LanguageSelector />
              <ThemeToggle />
            </View>
          </View>
        </View>
      </ImageBackground>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.categoriesContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={[
            styles.categoryChip, 
            { backgroundColor: colors.background, borderColor: colors.border },
            selectedCategory === 'All' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setSelectedCategory('All')}
        >
          <Text style={[
            styles.categoryText, 
            { color: colors.textSecondary },
            selectedCategory === 'All' && { color: '#FFFFFF' }
          ]}>
            fontFamily: 'Inter-SemiBold',
            {t('allJobs')}
          </Text>
        </TouchableOpacity>
        {JOB_CATEGORIES.map((category) => (
          <TouchableOpacity 
            key={category}
            style={[
              styles.categoryChip, 
              { backgroundColor: colors.background, borderColor: colors.border },
              selectedCategory === category && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText, 
              { color: colors.textSecondary },
              selectedCategory === category && { color: '#FFFFFF' }
            ]}>
              fontFamily: 'Inter-SemiBold',
              {t(category.toLowerCase().replace(/\s+/g, ''))}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {jobs.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.emptyText, { color: colors.text, fontFamily: 'Poppins-SemiBold' }]}>{t('noJobsAvailable')}</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary, fontFamily: 'Inter-Regular' }]}>{t('checkBackLater')}</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: 200,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(37, 99, 235, 0.75)',
  },
  header: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 17,
    marginTop: 4,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
  },
  jobsList: {
    padding: 20,
  },
  applicationsList: {
    padding: 20,
  },
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  salary: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#16A34A',
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
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  acceptedText: {
    color: '#065F46',
  },
  rejectedText: {
    color: '#991B1B',
  },
  organizationName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  applicantInfo: {
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
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  appliedDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});