import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { ArrowLeft, Navigation, Clock, MapPin, ExternalLink, Car, Wallet as Walk } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const { width, height } = Dimensions.get('window');

// Get API key from environment variables (recommended) or replace with your actual key
const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

export default function Directions() {
  const params = useLocalSearchParams();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [job, setJob] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [directions, setDirections] = useState([]);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const mapRef = useRef(null);

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

          // If job has coordinates, we can show directions
          if (jobData.coordinates) {
            // Fit map to show both locations
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.fitToCoordinates([userCoords, jobData.coordinates], {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                });
              }
            }, 1000);
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

  const onDirectionsReady = (result) => {
    setDistance(result.distance.toFixed(1));
    setDuration(Math.round(result.duration));
    setDirections(result.coordinates);
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
      window.open(url, '_blank');
    } else {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to web version
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

      {userLocation && job.coordinates ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsTraffic={true}
          >
            {/* User location marker */}
            <Marker
              coordinate={userLocation}
              title="Your Location"
              pinColor="blue"
            />
            
            {/* Job location marker */}
            <Marker
              coordinate={job.coordinates}
              title={job.category}
              description={job.organizationName}
              pinColor="red"
            />
            
            {/* Directions */}
            {GOOGLE_MAPS_APIKEY !== 'YOUR_GOOGLE_MAPS_API_KEY' && (
              <MapViewDirections
                origin={userLocation}
                destination={job.coordinates}
                apikey={GOOGLE_MAPS_APIKEY}
                strokeWidth={4}
                strokeColor="#2563EB"
                mode={travelMode}
                onReady={onDirectionsReady}
                onError={(errorMessage) => {
                  console.log('Directions error:', errorMessage);
                }}
              />
            )}
          </MapView>

          {/* Travel mode selector */}
          <View style={styles.travelModeContainer}>
            <TouchableOpacity
              style={[styles.travelModeButton, travelMode === 'DRIVING' && styles.activeTravelMode]}
              onPress={() => setTravelMode('DRIVING')}
            >
              <Car size={20} color={travelMode === 'DRIVING' ? '#FFFFFF' : '#6B7280'} />
              <Text style={[styles.travelModeText, travelMode === 'DRIVING' && styles.activeTravelModeText]}>
                Drive
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.travelModeButton, travelMode === 'WALKING' && styles.activeTravelMode]}
              onPress={() => setTravelMode('WALKING')}
            >
              <Walk size={20} color={travelMode === 'WALKING' ? '#FFFFFF' : '#6B7280'} />
              <Text style={[styles.travelModeText, travelMode === 'WALKING' && styles.activeTravelModeText]}>
                Walk
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapContent}>
            <MapPin size={48} color="#2563EB" />
            <Text style={styles.mapTitle}>Map Not Available</Text>
            <Text style={styles.mapSubtitle}>
              {!userLocation ? 'Location permission required' : 'Job coordinates not available'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.infoContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
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

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={openInGoogleMaps}
            >
              <Navigation size={20} color="#FFFFFF" />
              <Text style={styles.directionsButtonText}>Open in Google Maps</Text>
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

          {GOOGLE_MAPS_APIKEY === 'YOUR_GOOGLE_MAPS_API_KEY' && (
            <View style={styles.apiKeyWarning}>
              <Text style={styles.warningText}>
                ⚠️ To enable turn-by-turn directions, please add your Google Maps API key in the directions component.
              </Text>
            </View>
          )}
        </ScrollView>
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
  headerBackButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  travelModeContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
    gap: 8,
  },
  travelModeButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTravelMode: {
    backgroundColor: '#2563EB',
  },
  travelModeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTravelModeText: {
    color: '#FFFFFF',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  mapContent: {
    alignItems: 'center',
    padding: 40,
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
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    maxHeight: height * 0.4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  jobInfo: {
    padding: 20,
    paddingBottom: 16,
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
  distanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
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
  buttonContainer: {
    paddingHorizontal: 20,
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
  apiKeyWarning: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
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