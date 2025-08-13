# Google Maps API Key Setup Guide

## Step 1: Create a Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "WorkConnect Maps")
   - Click "Create"

## Step 2: Enable Required APIs

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" → "Library"

2. **Enable the following APIs** (search for each and click "Enable"):
   - **Maps SDK for Android** (for Android app)
   - **Maps SDK for iOS** (for iOS app)
   - **Directions API** (for turn-by-turn directions)
   - **Geocoding API** (for address conversion)
   - **Places API** (optional, for place search)

## Step 3: Create API Key

1. **Go to Credentials**
   - Click "APIs & Services" → "Credentials"

2. **Create API Key**
   - Click "+ CREATE CREDENTIALS"
   - Select "API key"
   - Copy the generated API key immediately

## Step 4: Restrict Your API Key (IMPORTANT for Security)

1. **Click on your API key** to edit it

2. **Set Application Restrictions**
   - Choose "Android apps" for Android
   - Add your package name: `com.yourcompany.workconnect`
   - Add SHA-1 certificate fingerprint

   For iOS:
   - Choose "iOS apps"
   - Add your bundle ID: `com.yourcompany.workconnect`

3. **Set API Restrictions**
   - Select "Restrict key"
   - Choose the APIs you enabled:
     - Maps SDK for Android/iOS
     - Directions API
     - Geocoding API

## Step 5: Enable Billing (Required for Production)

1. **Go to Billing**
   - In the left sidebar, click "Billing"
   - Link a billing account (Google provides $200 free credits monthly)

## Step 6: Get Your SHA-1 Fingerprint (Android)

Run this command in your terminal:

```bash
# For debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release keystore (when publishing)
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```

## Step 7: Configure in Your App

Replace the API key in your app:

```typescript
// In app/directions/[id].tsx
const GOOGLE_MAPS_APIKEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

## Pricing Information

- **Free Tier**: $200 credit per month (covers ~28,000 map loads)
- **Maps SDK**: $7 per 1,000 loads after free tier
- **Directions API**: $5 per 1,000 requests after free tier

## Security Best Practices

1. **Never commit API keys to version control**
2. **Always restrict your API keys**
3. **Monitor usage in Google Cloud Console**
4. **Set up billing alerts**

## Troubleshooting

### Common Issues:

1. **"This API project is not authorized"**
   - Check if APIs are enabled
   - Verify API key restrictions match your app

2. **"REQUEST_DENIED"**
   - Enable billing account
   - Check API key restrictions

3. **Maps not loading**
   - Verify bundle ID/package name matches restrictions
   - Check SHA-1 fingerprint is correct

### Testing Your Setup:

1. **Test in development first**
2. **Check Google Cloud Console logs**
3. **Monitor API usage and quotas**

## Alternative: Using Environment Variables (Recommended)

Instead of hardcoding the API key, use environment variables:

1. Create `.env` file:
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Use in your code:
```typescript
const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
```

## Support

- Google Maps Platform Documentation: https://developers.google.com/maps/documentation
- Google Cloud Support: https://cloud.google.com/support