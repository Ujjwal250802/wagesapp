// Google Maps Configuration
// To get your API key:
// 1. Go to Google Cloud Console (https://console.cloud.google.com/)
// 2. Create a new project or select an existing one
// 3. Enable the following APIs:
//    - Maps SDK for Android
//    - Maps SDK for iOS
//    - Directions API
//    - Places API (optional)
// 4. Create credentials (API Key)
// 5. Restrict the API key to your app's bundle ID/package name
// 6. Replace 'YOUR_GOOGLE_MAPS_API_KEY' in the directions component

export const GOOGLE_MAPS_CONFIG = {
  // Replace with your actual Google Maps API key
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
  
  // Default map settings
  defaultRegion: {
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Map style (optional)
  mapStyle: [],
};

// Instructions for getting Google Maps API Key:
/*
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS  
   - Directions API
   - Geocoding API
4. Go to Credentials → Create Credentials → API Key
5. Restrict the key to your app bundle ID
6. Copy the key and replace 'YOUR_GOOGLE_MAPS_API_KEY' above
*/