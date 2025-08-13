// Google Maps Configuration
// See docs/GOOGLE_MAPS_SETUP.md for complete setup instructions

export const GOOGLE_MAPS_CONFIG = {
  // Get API key from environment variables
  apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
  
  // Default map settings
  defaultRegion: {
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Map style (optional)
  mapStyle: [],
};