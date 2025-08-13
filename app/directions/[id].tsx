import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { ArrowLeft, Navigation, Clock, MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function Directions() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    fetchJobAndLocation();
  }, [id]);

  const fetchJobAndLocation = async () => {
    try {
      // Fetch job details
      const jobDoc = await getDoc(doc(db, 'jobs', id));
      if (jobDoc.exists()) {
        const jobData = { id: jobDoc.id, ...jobDoc.data() };
        setJob(jobData);
        
        // Get user's current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });

          // Calculate distance and duration if job has coordinates
          if (jobData.coordinates) {
            calculateDistanceAndDuration(
              currentLocation.coords.latitude,
              currentLocation.coords.longitude,
              jobData.coordinates.latitude,
              jobData.coordinates.longitude
            );
          }
        } else {
          Alert.alert('Permission denied', 'Location permission is required for directions');
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load directions');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistanceAndDuration = (lat1, lon1, lat2, lon2) => {
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    
    setDistance(distanceKm.toFixed(1));
    
    // Estimate duration (assuming average speed of 30 km/h in city)
    const estimatedDuration = Math.round((distanceKm / 30) * 60); // in minutes
    setDuration(estimatedDuration);
  };

  const openInMaps = () => {
    if (!job?.coordinates) {
      Alert.alert('Error', 'Job location coordinates not available');
      return;
    }

    const { latitude, longitude } = job.coordinates;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
      web: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });

    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      // For mobile, you would use Linking.openURL(url)
      Alert.alert('Open in Maps', 'This would open in your default maps app');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading directions...</Text>
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
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Directions</Text>
      </View>

      {job.coordinates && userLocation ? (
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: (userLocation.latitude + job.coordinates.latitude) / 2,
            longitude: (userLocation.longitude + job.coordinates.longitude) / 2,
            latitudeDelta: Math.abs(userLocation.latitude - job.coordinates.latitude) * 2 + 0.01,
            longitudeDelta: Math.abs(userLocation.longitude - job.coordinates.longitude) * 2 + 0.01,
          }}
        >
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="blue"
          />
          <Marker
            coordinate={job.coordinates}
            title={job.organizationName}
            description={job.location}
            pinColor="red"
          />
        </MapView>
      ) : (
        <View style={styles.noMapContainer}>
          <MapPin size={48} color="#D1D5DB" />
          <Text style={styles.noMapText}>Map not available</Text>
          <Text style={styles.noMapSubtext}>Location coordinates not found</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{job.category}</Text>
          <Text style={styles.organizationName}>{job.organizationName}</Text>
          <View style={styles.locationRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>{job.location}</Text>
          </View>
        </View>

        {distance && duration && (
          <View style={styles.distanceInfo}>
            <View style={styles.distanceItem}>
              <Navigation size={20} color="#2563EB" />
              <View>
                <Text style={styles.distanceValue}>{distance} km</Text>
                <Text style={styles.distanceLabel}>Distance</Text>
              </View>
            </View>
            <View style={styles.distanceItem}>
              <Clock size={20} color="#16A34A" />
              <View>
                <Text style={styles.distanceValue}>{duration} min</Text>
                <Text style={styles.distanceLabel}>Est. Time</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.openMapsButton}
          onPress={openInMaps}
        >
          <Navigation size={20} color="#FFFFFF" />
          <Text style={styles.openMapsButtonText}>Open in Maps</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#2563EB',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  map: {
    flex: 1,
  },
  noMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  noMapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  noMapSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  jobInfo: {
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  organizationName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
  },
  distanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  distanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  distanceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  openMapsButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  openMapsButtonText: {
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