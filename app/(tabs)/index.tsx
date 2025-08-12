import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebase-config';
import { router } from 'expo-router';
import { Search, MapPin, Clock, DollarSign } from 'lucide-react-native';

const JOB_CATEGORIES = [
  'Electrician', 'Plumber', 'Mechanic', 'Cook', 'Peon', 
  'Driver', 'House Keeping', 'Construction Site Workers', 'Security Guard'
];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    try {
      let jobsQuery;
      if (selectedCategory === 'All') {
        jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
      } else {
        jobsQuery = query(
          collection(db, 'jobs'), 
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(jobsQuery);
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Jobs</Text>
        <Text style={styles.headerSubtitle}>Find your perfect daily wage job</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        <TouchableOpacity 
          style={[styles.categoryChip, selectedCategory === 'All' && styles.selectedCategoryChip]}
          onPress={() => setSelectedCategory('All')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'All' && styles.selectedCategoryText]}>
            All Jobs
          </Text>
        </TouchableOpacity>
        {JOB_CATEGORIES.map((category) => (
          <TouchableOpacity 
            key={category}
            style={[styles.categoryChip, selectedCategory === category && styles.selectedCategoryChip]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading jobs...</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategoryChip: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  jobsList: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16A34A',
  },
  organizationName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});