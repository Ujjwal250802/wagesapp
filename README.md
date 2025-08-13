# WorkConnect - Daily Wage Job Platform

A React Native Expo app connecting daily wage workers with job opportunities.

## Features

- **For Workers**: Browse and apply for daily wage jobs
- **For Employers**: Post jobs and manage applications
- **Maps Integration**: Get directions to job locations
- **Real-time Applications**: Track application status
- **User Profiles**: Manage personal and organization profiles

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

The app is already configured with Firebase. The configuration is in `firebase-config.js`.

### 3. Google Maps Setup (Required for Directions)

**Important**: To use the maps and directions feature, you need a Google Maps API key.

1. **Follow the complete setup guide**: See `docs/GOOGLE_MAPS_SETUP.md`

2. **Quick Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable: Maps SDK for Android/iOS, Directions API, Geocoding API
   - Create an API key
   - Restrict the key to your app

3. **Configure API Key**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your API key
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 4. Run the App

```bash
# Start the development server
npm run dev

# For specific platforms
npx expo start --android
npx expo start --ios
npx expo start --web
```

## Project Structure

```
app/
├── (tabs)/              # Tab navigation screens
├── auth/               # Authentication screens
├── directions/         # Maps and directions
├── job-details/        # Job detail screens
├── apply-job/          # Job application screens
└── _layout.tsx         # Root layout

components/
├── Layout.tsx          # Main layout component
└── GoogleMapsConfig.ts # Maps configuration

docs/
└── GOOGLE_MAPS_SETUP.md # Complete Google Maps setup guide
```

## Key Features

### Maps & Directions
- Interactive maps with job locations
- Turn-by-turn directions
- Distance and time estimation
- Integration with Google Maps and Apple Maps
- Travel mode selection (driving/walking)

### User Management
- Separate flows for workers and employers
- Profile management with image upload
- Email verification
- Secure authentication with Firebase

### Job Management
- Job posting with location coordinates
- Application tracking and status updates
- Email notifications for applications
- Category-based job filtering

## Environment Variables

Create a `.env` file with:

```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Troubleshooting

### Maps Not Working
1. Check if you have a valid Google Maps API key
2. Ensure required APIs are enabled in Google Cloud Console
3. Verify API key restrictions match your app configuration
4. Check if billing is enabled (required for production)

### Location Services
- Grant location permissions when prompted
- Ensure location services are enabled on your device

## Support

For Google Maps setup issues, see the detailed guide in `docs/GOOGLE_MAPS_SETUP.md`.

## License

This project is for educational and demonstration purposes.