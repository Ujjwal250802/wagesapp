# WorkConnect - Daily Wage Job App

## Firebase Setup Instructions

### 1. Firestore Security Rules

To fix the attendance permission errors, you need to update your Firestore security rules in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`dailywageapp`)
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the content from `firestore.rules` file in this project
5. Click **Publish** to apply the new rules

### 2. Authentication Setup

Make sure your Firebase Authentication is properly configured:

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. In **Settings** → **Authorized domains**, add your domain if deploying to web

### 3. Firestore Database Setup

1. Create a Firestore database in **production mode**
2. Choose a location close to your users
3. The app will automatically create the required collections:
   - `workers` - Worker profiles
   - `organizations` - Organization profiles  
   - `jobs` - Job postings
   - `applications` - Job applications
   - `attendance` - Attendance records
   - `payments` - Payment records

### 4. Testing the App

After updating the Firestore rules:

1. **Sign up** as both a worker and organization (use different email addresses)
2. **Verify email addresses** for both accounts
3. **Post a job** as an organization
4. **Apply for the job** as a worker
5. **Accept the application** as an organization
6. **Mark attendance** in the worker calendar
7. **Process payment** for completed work

### 5. Troubleshooting

If you still get permission errors:

1. **Check email verification**: Users must verify their email addresses
2. **Clear app data**: Clear browser cache/app data and try again
3. **Check Firebase Console**: Verify the rules are published correctly
4. **Authentication state**: Make sure users are properly logged in

### 6. Security Notes

- The current rules allow broad access for development
- For production, restrict rules to specific user roles and data ownership
- Consider implementing admin roles for better security
- Add field-level validation in security rules

## Features

- **Dual User Types**: Workers and Organizations
- **Job Management**: Post, browse, and apply for jobs
- **Application System**: Track application status
- **Attendance Tracking**: Mark daily attendance with calendar view
- **Payment Processing**: Calculate and record payments
- **Location Services**: Get directions to job locations
- **Real-time Updates**: Live updates using Firebase
- **Payments**: Razorpay and PhonePe integration

## Payment Gateway Setup

### Razorpay Integration

The app uses Razorpay test API for payment processing:
- **Key ID**: `rzp_test_uO9KUIRRmFD0rp`
- **Key Secret**: `ZsmuBYvapWYZ4IkpMRWCZWpo`

For production:
1. Create a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your live API keys from the dashboard
3. Update the keys in `services/PaymentService.ts`
4. Enable required payment methods in Razorpay dashboard

### PhonePe Integration

The app uses PhonePe test environment:
- **Merchant ID**: `PGTESTPAYUAT`
- **Salt Key**: `099eb0cd-02cf-4e2a-8aca-3e6c6aff0399`
- **Salt Index**: `1`

For production:
1. Register as a merchant with PhonePe
2. Get your production merchant credentials
3. Update the credentials in `services/PhonePeService.ts`
4. Implement proper backend verification

### Security Notes

- **Never expose API secrets in frontend code**
- **Always verify payments on your backend**
- **Use webhooks for payment confirmation**
- **Implement proper error handling and retry logic**
- **Store payment records securely in your database**

### Mobile Implementation

For mobile apps, you'll need to:
1. **Razorpay**: Install `@razorpay/react-native-razorpay`
2. **PhonePe**: Integrate PhonePe SDK
3. **Create development build** using Expo Dev Client
4. **Test on physical devices** (payment gateways don't work in simulators)

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase (Auth, Firestore)
- **Navigation**: Expo Router
- **UI Components**: Custom components with Lucide icons
- **Maps**: Expo Location and native map integration
<img width="585" height="707" alt="Screenshot 2025-09-03 181121" src="https://github.com/user-attachments/assets/0ce0bb4a-2004-4afb-9a6b-c89330a90520" />


https://github.com/user-attachments/assets/03ec9649-1a37-4895-9c1b-cf456687b5e9



https://github.com/user-attachments/assets/0926c921-6f06-4ef1-aa8f-60aba34c3c38



  
