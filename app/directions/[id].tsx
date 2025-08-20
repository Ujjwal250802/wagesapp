import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { ArrowLeft, Navigation, Clock, MapPin, ExternalLink, Car } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';

const { width, height } = Dimensions.get('window');

export default function Directions() {
  const params = useLocalSearchParams();
  const jobId = typeof params.id === 'string' ? params.id : params.id?.[0];
  
  const [job, setJob] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJobAndLocation();
    }
  }, [jobId]);

  const fetchJobAndLocation = async () => {
    try {
      if (!jobId) {
        Alert.alert('Error', 'Job ID not found');
        router.back();
        return;
      }

      // Fetch job details
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      if (jobDoc.exists()) {
        const jobData = { id: jobDoc.id, ...jobDoc.data() };
        setJob(jobData);
        
        // Get user's current location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const userCoords = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          };
          setUserLocation(userCoords);

          // Calculate distance if job has coordinates
          if (jobData.coordinates) {
            const dist = calculateDistance(userCoords, jobData.coordinates);
            setDistance(Number(dist.toFixed(1)));
            // Estimate duration (assuming average speed of 30 km/h for driving)
            setDuration(Math.round((dist / 30) * 60));
          }
        } else {
          Alert.alert('Permission denied', 'Location permission is required for directions');
        }
      } else {
        Alert.alert('Error', 'Job not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load directions');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (coord1: any, coord2: any) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openInGoogleMaps = () => {
    if (!job?.coordinates || !userLocation) {
      Alert.alert('Error', 'Location data not available');
      return;
    }

    const { latitude: destLat, longitude: destLng } = job.coordinates;
    const { latitude: originLat, longitude: originLng } = userLocation;
    
    const url = Platform.select({
      ios: `maps://app?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&dirflg=d`,
      android: `google.navigation:q=${destLat},${destLng}&mode=d`,
      web: `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`,
    });

    if (Platform.OS === 'web') {
      window.open(url as string, '_blank');
    } else {
      Linking.canOpenURL(url as string).then((supported) => {
        if (supported) {
          Linking.openURL(url as string);
        } else {
          const webUrl = `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`;
          Linking.openURL(webUrl);
        }
      });
    }
  };

  const openInAppleMaps = () => {
    if (!job?.coordinates || !userLocation) {
      Alert.alert('Error', 'Location data not available');
      return;
    }

    const { latitude: destLat, longitude: destLng } = job.coordinates;
    const { latitude: originLat, longitude: originLng } = userLocation;
    
    const url = `http://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${destLat},${destLng}&dirflg=d`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Apple Maps not available');
      }
    });
  };

  const getDirectionsSteps = async () => {
    if (!job?.coordinates || !userLocation) {
      Alert.alert('Error', 'Location data not available');
      return;
    }

    try {
      Alert.alert(
        'Directions',
        `Distance: ${distance} km\nEstimated time: ${duration} minutes\n\nFor detailed turn-by-turn directions, please use Google Maps or Apple Maps.`,
        [
          { text: 'Open Google Maps', onPress: openInGoogleMaps },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get directions');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading directions...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Job not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Directions</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{job.category}</Text>
          <Text style={styles.organizationName}>{job.organizationName}</Text>
          <View style={styles.locationRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>{job.location}</Text>
          </View>
        </View>

        {userLocation && job.coordinates ? (
          <View style={styles.mapPlaceholder}>
            <View style={styles.mapContent}>
              <MapPin size={48} color="#2563EB" />
              <Text style={styles.mapTitle}>Route Information</Text>
              <Text style={styles.mapSubtitle}>
                From your location to {job.organizationName}
              </Text>
              
              {distance && duration && (
                <View style={styles.routeInfo}>
                  <View style={styles.routeItem}>
                    <Navigation size={24} color="#2563EB" />
                    <View>
                      <Text style={styles.routeValue}>{distance} km</Text>
                      <Text style={styles.routeLabel}>Distance</Text>
                    </View>
                  </View>
                  <View style={styles.routeItem}>
                    <Clock size={24} color="#16A34A" />
                    <View>
                      <Text style={styles.routeValue}>{duration} min</Text>
                      <Text style={styles.routeLabel}>Est. Time</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <View style={styles.mapContent}>
              <MapPin size={48} color="#2563EB" />
              <Text style={styles.mapTitle}>Location Not Available</Text>
              <Text style={styles.mapSubtitle}>
                {!userLocation ? 'Location permission required' : 'Job coordinates not available'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.directionsSection}>
          <Text style={styles.sectionTitle}>Get Directions</Text>
          <Text style={styles.sectionSubtitle}>
            Choose your preferred navigation app for turn-by-turn directions
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={getDirectionsSteps}
            >
              <Navigation size={20} color="#FFFFFF" />
              <Text style={styles.directionsButtonText}>Get Directions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.googleMapsButton}
              onPress={openInGoogleMaps}
            >
              <ExternalLink size={20} color="#2563EB" />
              <Text style={styles.googleMapsButtonText}>Open in Google Maps</Text>
            </TouchableOpacity>
            
            {Platform.OS === 'ios' && (
              <TouchableOpacity 
                style={styles.appleMapsButton}
                onPress={openInAppleMaps}
              >
                <ExternalLink size={20} color="#2563EB" />
                <Text style={styles.appleMapsButtonText}>Open in Apple Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Navigation Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Check traffic conditions before leaving</Text>
            <Text style={styles.tipItem}>• Confirm the exact location with the employer</Text>
            <Text style={styles.tipItem}>• Allow extra time for your first visit</Text>
            <Text style={styles.tipItem}>• Save the location for future reference</Text>
          </View>
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
    backgroundColor: '#2563EB',
  },
  headerBackButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  jobInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
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
    flex: 1,
  },
  mapPlaceholder: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  mapContent: {
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  routeItem: {
    alignItems: 'center',
    gap: 8,
  },
  routeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  routeLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  directionsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  directionsButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleMapsButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  googleMapsButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  appleMapsButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleMapsButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
