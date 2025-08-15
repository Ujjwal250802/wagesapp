import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'hi' | 'mr' | 'pa' | 'gu';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // App Name
    appName: 'ROZGAR',
    appSubtitle: 'Connecting Daily Wage Workers with Opportunities',
    
    // Welcome Screen
    lookingForWork: "I'm Looking for Work",
    findJobsSubtext: 'Find daily wage jobs near you',
    employer: "I'm an Employer",
    postJobsSubtext: 'Post jobs and hire workers',
    
    // Navigation
    findJobs: 'Find Jobs',
    applications: 'Applications',
    postJob: 'Post Job',
    myJobs: 'My Jobs',
    workers: 'Workers',
    appliedJobs: 'Applied Jobs',
    payments: 'Payments',
    profile: 'Profile',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    apply: 'Apply',
    accept: 'Accept',
    reject: 'Reject',
    
    // Job Categories
    electrician: 'Electrician',
    plumber: 'Plumber',
    mechanic: 'Mechanic',
    cook: 'Cook',
    peon: 'Peon',
    driver: 'Driver',
    houseKeeping: 'House Keeping',
    constructionWorkers: 'Construction Site Workers',
    securityGuard: 'Security Guard',
    
    // Home Screen
    availableJobs: 'Available Jobs',
    findPerfectJob: 'Find your perfect daily wage job',
    jobApplications: 'Job Applications',
    manageApplications: 'Manage applications for your posted jobs',
    allJobs: 'All Jobs',
    noJobsAvailable: 'No jobs available',
    checkBackLater: 'Check back later for new opportunities',
    noApplicationsYet: 'No applications yet',
    applicationsWillAppear: 'Applications will appear here when job seekers apply to your posted jobs',
    
    // Auth
    welcomeBack: 'Welcome Back',
    signInToFind: 'Sign in to find work opportunities',
    joinRozgar: 'Join ROZGAR',
    createWorkerAccount: 'Create your worker account',
    organizationLogin: 'Organization Login',
    signInToPost: 'Sign in to post job opportunities',
    registerOrganization: 'Register Organization',
    createOrgAccount: 'Create your organization account',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    organizationName: 'Organization Name',
    contactPerson: 'Contact Person Name',
    contactNumber: 'Contact Number',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    pleaseWait: 'Please wait...',
    noAccount: "Don't have an account? Sign Up",
    haveAccount: "Already have an account? Sign In",
    
    // Profile
    jobSeeker: 'Job Seeker',
    contactInformation: 'Contact Information',
    about: 'About',
    editProfile: 'Edit Profile',
    signOut: 'Sign Out',
    
    // Job Details
    jobDetails: 'Job Details',
    jobDescription: 'Job Description',
    perDay: '/day',
    posted: 'Posted',
    recently: 'Recently',
    directions: 'Directions',
    applyForJob: 'Apply for this Job',
    applied: '✓ Applied',
    
    // Payments
    myPayments: 'My Payments',
    trackEarnings: 'Track your earnings',
    totalEarnings: 'Total Earnings',
    fromPayments: 'From',
    payment: 'payment',
    payments: 'payments',
    noPaymentsYet: 'No payments yet',
    paymentHistoryAppear: 'Your payment history will appear here',
    workDays: 'Work Days',
    days: 'days',
    paymentMethod: 'Payment Method',
    paidOn: 'Paid on',
    workPeriod: 'Work Period',
  },
  hi: {
    // App Name
    appName: 'रोज़गार',
    appSubtitle: 'दैनिक मजदूरों को अवसरों से जोड़ना',
    
    // Welcome Screen
    lookingForWork: 'मैं काम की तलाश में हूं',
    findJobsSubtext: 'अपने पास दैनिक मजदूरी की नौकरियां खोजें',
    employer: 'मैं एक नियोक्ता हूं',
    postJobsSubtext: 'नौकरियां पोस्ट करें और मजदूरों को काम पर रखें',
    
    // Navigation
    findJobs: 'नौकरी खोजें',
    applications: 'आवेदन',
    postJob: 'नौकरी पोस्ट करें',
    myJobs: 'मेरी नौकरियां',
    workers: 'मजदूर',
    appliedJobs: 'आवेदित नौकरियां',
    payments: 'भुगतान',
    profile: 'प्रोफाइल',
    
    // Common
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    save: 'सेव करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    apply: 'आवेदन करें',
    accept: 'स्वीकार करें',
    reject: 'अस्वीकार करें',
    
    // Job Categories
    electrician: 'इलेक्ट्रीशियन',
    plumber: 'प्लंबर',
    mechanic: 'मैकेनिक',
    cook: 'रसोइया',
    peon: 'चपरासी',
    driver: 'ड्राइवर',
    houseKeeping: 'हाउस कीपिंग',
    constructionWorkers: 'निर्माण स्थल मजदूर',
    securityGuard: 'सिक्योरिटी गार्ड',
    
    // Home Screen
    availableJobs: 'उपलब्ध नौकरियां',
    findPerfectJob: 'अपनी परफेक्ट दैनिक मजदूरी की नौकरी खोजें',
    jobApplications: 'नौकरी के आवेदन',
    manageApplications: 'अपनी पोस्ट की गई नौकरियों के लिए आवेदनों का प्रबंधन करें',
    allJobs: 'सभी नौकरियां',
    noJobsAvailable: 'कोई नौकरी उपलब्ध नहीं',
    checkBackLater: 'नए अवसरों के लिए बाद में जांचें',
    noApplicationsYet: 'अभी तक कोई आवेदन नहीं',
    applicationsWillAppear: 'जब नौकरी चाहने वाले आपकी पोस्ट की गई नौकरियों के लिए आवेदन करेंगे तो आवेदन यहां दिखाई देंगे',
    
    // Auth
    welcomeBack: 'वापस स्वागत है',
    signInToFind: 'काम के अवसर खोजने के लिए साइन इन करें',
    joinRozgar: 'रोज़गार में शामिल हों',
    createWorkerAccount: 'अपना मजदूर खाता बनाएं',
    organizationLogin: 'संगठन लॉगिन',
    signInToPost: 'नौकरी के अवसर पोस्ट करने के लिए साइन इन करें',
    registerOrganization: 'संगठन पंजीकृत करें',
    createOrgAccount: 'अपना संगठन खाता बनाएं',
    fullName: 'पूरा नाम',
    emailAddress: 'ईमेल पता',
    phoneNumber: 'फोन नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    organizationName: 'संगठन का नाम',
    contactPerson: 'संपर्क व्यक्ति का नाम',
    contactNumber: 'संपर्क नंबर',
    signIn: 'साइन इन',
    createAccount: 'खाता बनाएं',
    pleaseWait: 'कृपया प्रतीक्षा करें...',
    noAccount: 'खाता नहीं है? साइन अप करें',
    haveAccount: 'पहले से खाता है? साइन इन करें',
    
    // Profile
    jobSeeker: 'नौकरी चाहने वाला',
    contactInformation: 'संपर्क जानकारी',
    about: 'के बारे में',
    editProfile: 'प्रोफाइल संपादित करें',
    signOut: 'साइन आउट',
    
    // Job Details
    jobDetails: 'नौकरी का विवरण',
    jobDescription: 'नौकरी का विवरण',
    perDay: '/दिन',
    posted: 'पोस्ट किया गया',
    recently: 'हाल ही में',
    directions: 'दिशा-निर्देश',
    applyForJob: 'इस नौकरी के लिए आवेदन करें',
    applied: '✓ आवेदन किया गया',
    
    // Payments
    myPayments: 'मेरे भुगतान',
    trackEarnings: 'अपनी कमाई ट्रैक करें',
    totalEarnings: 'कुल कमाई',
    fromPayments: 'से',
    payment: 'भुगतान',
    payments: 'भुगतान',
    noPaymentsYet: 'अभी तक कोई भुगतान नहीं',
    paymentHistoryAppear: 'आपका भुगतान इतिहास यहां दिखाई देगा',
    workDays: 'काम के दिन',
    days: 'दिन',
    paymentMethod: 'भुगतान का तरीका',
    paidOn: 'भुगतान की तारीख',
    workPeriod: 'काम की अवधि',
  },
  mr: {
    // App Name
    appName: 'रोजगार',
    appSubtitle: 'दैनंदिन मजुरांना संधींशी जोडणे',
    
    // Welcome Screen
    lookingForWork: 'मी कामाच्या शोधात आहे',
    findJobsSubtext: 'तुमच्या जवळ दैनंदिन मजुरीची नोकरी शोधा',
    employer: 'मी एक नियोक्ता आहे',
    postJobsSubtext: 'नोकऱ्या पोस्ट करा आणि कामगारांना कामावर घ्या',
    
    // Navigation
    findJobs: 'नोकरी शोधा',
    applications: 'अर्ज',
    postJob: 'नोकरी पोस्ट करा',
    myJobs: 'माझ्या नोकऱ्या',
    workers: 'कामगार',
    appliedJobs: 'अर्ज केलेल्या नोकऱ्या',
    payments: 'पेमेंट',
    profile: 'प्रोफाइल',
    
    // Common
    loading: 'लोड होत आहे...',
    error: 'त्रुटी',
    success: 'यश',
    cancel: 'रद्द करा',
    save: 'सेव्ह करा',
    delete: 'हटवा',
    edit: 'संपादित करा',
    apply: 'अर्ज करा',
    accept: 'स्वीकार करा',
    reject: 'नाकारा',
    
    // Job Categories
    electrician: 'इलेक्ट्रिशियन',
    plumber: 'प्लंबर',
    mechanic: 'मेकॅनिक',
    cook: 'स्वयंपाकी',
    peon: 'चपरासी',
    driver: 'ड्रायव्हर',
    houseKeeping: 'हाऊस कीपिंग',
    constructionWorkers: 'बांधकाम साइट कामगार',
    securityGuard: 'सिक्युरिटी गार्ड',
    
    // Home Screen
    availableJobs: 'उपलब्ध नोकऱ्या',
    findPerfectJob: 'तुमची परफेक्ट दैनंदिन मजुरीची नोकरी शोधा',
    jobApplications: 'नोकरीचे अर्ज',
    manageApplications: 'तुमच्या पोस्ट केलेल्या नोकऱ्यांसाठी अर्जांचे व्यवस्थापन करा',
    allJobs: 'सर्व नोकऱ्या',
    noJobsAvailable: 'कोणत्याही नोकऱ्या उपलब्ध नाहीत',
    checkBackLater: 'नवीन संधींसाठी नंतर तपासा',
    noApplicationsYet: 'अद्याप कोणते अर्ज नाहीत',
    applicationsWillAppear: 'जेव्हा नोकरी शोधणारे तुमच्या पोस्ट केलेल्या नोकऱ्यांसाठी अर्ज करतील तेव्हा अर्ज येथे दिसतील',
  },
  pa: {
    // App Name
    appName: 'ਰੋਜ਼ਗਾਰ',
    appSubtitle: 'ਰੋਜ਼ਾਨਾ ਮਜ਼ਦੂਰਾਂ ਨੂੰ ਮੌਕਿਆਂ ਨਾਲ ਜੋੜਨਾ',
    
    // Welcome Screen
    lookingForWork: 'ਮੈਂ ਕੰਮ ਦੀ ਤਲਾਸ਼ ਵਿੱਚ ਹਾਂ',
    findJobsSubtext: 'ਆਪਣੇ ਨੇੜੇ ਰੋਜ਼ਾਨਾ ਮਜ਼ਦੂਰੀ ਦੀਆਂ ਨੌਕਰੀਆਂ ਲੱਭੋ',
    employer: 'ਮੈਂ ਇੱਕ ਮਾਲਕ ਹਾਂ',
    postJobsSubtext: 'ਨੌਕਰੀਆਂ ਪੋਸਟ ਕਰੋ ਅਤੇ ਮਜ਼ਦੂਰਾਂ ਨੂੰ ਕਿਰਾਏ ਤੇ ਲਓ',
    
    // Navigation
    findJobs: 'ਨੌਕਰੀ ਲੱਭੋ',
    applications: 'ਅਰਜ਼ੀਆਂ',
    postJob: 'ਨੌਕਰੀ ਪੋਸਟ ਕਰੋ',
    myJobs: 'ਮੇਰੀਆਂ ਨੌਕਰੀਆਂ',
    workers: 'ਮਜ਼ਦੂਰ',
    appliedJobs: 'ਅਰਜ਼ੀ ਦਿੱਤੀਆਂ ਨੌਕਰੀਆਂ',
    payments: 'ਭੁਗਤਾਨ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    
    // Common
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    error: 'ਗਲਤੀ',
    success: 'ਸਫਲਤਾ',
    cancel: 'ਰੱਦ ਕਰੋ',
    save: 'ਸੇਵ ਕਰੋ',
    delete: 'ਮਿਟਾਓ',
    edit: 'ਸੰਪਾਦਿਤ ਕਰੋ',
    apply: 'ਅਰਜ਼ੀ ਦਿਓ',
    accept: 'ਸਵੀਕਾਰ ਕਰੋ',
    reject: 'ਰੱਦ ਕਰੋ',
    
    // Job Categories
    electrician: 'ਇਲੈਕਟ੍ਰੀਸ਼ਿਅਨ',
    plumber: 'ਪਲੰਬਰ',
    mechanic: 'ਮਿਸਤਰੀ',
    cook: 'ਰਸੋਈਆ',
    peon: 'ਚਪੜਾਸੀ',
    driver: 'ਡਰਾਈਵਰ',
    houseKeeping: 'ਹਾਊਸ ਕੀਪਿੰਗ',
    constructionWorkers: 'ਉਸਾਰੀ ਸਾਈਟ ਮਜ਼ਦੂਰ',
    securityGuard: 'ਸਿਕਿਉਰਿਟੀ ਗਾਰਡ',
    
    // Home Screen
    availableJobs: 'ਉਪਲਬਧ ਨੌਕਰੀਆਂ',
    findPerfectJob: 'ਆਪਣੀ ਸੰਪੂਰਨ ਰੋਜ਼ਾਨਾ ਮਜ਼ਦੂਰੀ ਦੀ ਨੌਕਰੀ ਲੱਭੋ',
    jobApplications: 'ਨੌਕਰੀ ਦੀਆਂ ਅਰਜ਼ੀਆਂ',
    manageApplications: 'ਆਪਣੀਆਂ ਪੋਸਟ ਕੀਤੀਆਂ ਨੌਕਰੀਆਂ ਲਈ ਅਰਜ਼ੀਆਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ',
    allJobs: 'ਸਾਰੀਆਂ ਨੌਕਰੀਆਂ',
    noJobsAvailable: 'ਕੋਈ ਨੌਕਰੀ ਉਪਲਬਧ ਨਹੀਂ',
    checkBackLater: 'ਨਵੇਂ ਮੌਕਿਆਂ ਲਈ ਬਾਅਦ ਵਿੱਚ ਜਾਂਚ ਕਰੋ',
    noApplicationsYet: 'ਅਜੇ ਤੱਕ ਕੋਈ ਅਰਜ਼ੀ ਨਹੀਂ',
    applicationsWillAppear: 'ਜਦੋਂ ਨੌਕਰੀ ਦੇ ਇੱਛੁਕ ਤੁਹਾਡੀਆਂ ਪੋਸਟ ਕੀਤੀਆਂ ਨੌਕਰੀਆਂ ਲਈ ਅਰਜ਼ੀ ਦੇਣਗੇ ਤਾਂ ਅਰਜ਼ੀਆਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ',
  },
  gu: {
    // App Name
    appName: 'રોજગાર',
    appSubtitle: 'દૈનિક મજૂરોને તકો સાથે જોડવું',
    
    // Welcome Screen
    lookingForWork: 'હું કામની શોધમાં છું',
    findJobsSubtext: 'તમારી નજીક દૈનિક મજૂરીની નોકરીઓ શોધો',
    employer: 'હું એક એમ્પ્લોયર છું',
    postJobsSubtext: 'નોકરીઓ પોસ્ટ કરો અને મજૂરોને કામે રાખો',
    
    // Navigation
    findJobs: 'નોકરી શોધો',
    applications: 'અરજીઓ',
    postJob: 'નોકરી પોસ્ટ કરો',
    myJobs: 'મારી નોકરીઓ',
    workers: 'મજૂરો',
    appliedJobs: 'અરજી કરેલી નોકરીઓ',
    payments: 'પેમેન્ટ',
    profile: 'પ્રોફાઇલ',
    
    // Common
    loading: 'લોડ થઈ રહ્યું છે...',
    error: 'ભૂલ',
    success: 'સફળતા',
    cancel: 'રદ કરો',
    save: 'સેવ કરો',
    delete: 'ડિલીટ કરો',
    edit: 'એડિટ કરો',
    apply: 'અરજી કરો',
    accept: 'સ્વીકારો',
    reject: 'નકારો',
    
    // Job Categories
    electrician: 'ઇલેક્ટ્રિશિયન',
    plumber: 'પ્લમ્બર',
    mechanic: 'મિકેનિક',
    cook: 'રસોઇયો',
    peon: 'ચપરાસી',
    driver: 'ડ્રાઇવર',
    houseKeeping: 'હાઉસ કીપિંગ',
    constructionWorkers: 'બાંધકામ સાઇટ મજૂરો',
    securityGuard: 'સિક્યુરિટી ગાર્ડ',
    
    // Home Screen
    availableJobs: 'ઉપલબ્ધ નોકરીઓ',
    findPerfectJob: 'તમારી પરફેક્ટ દૈનિક મજૂરીની નોકરી શોધો',
    jobApplications: 'નોકરીની અરજીઓ',
    manageApplications: 'તમારી પોસ્ટ કરેલી નોકરીઓ માટે અરજીઓનું સંચાલન કરો',
    allJobs: 'બધી નોકરીઓ',
    noJobsAvailable: 'કોઈ નોકરી ઉપલબ્ધ નથી',
    checkBackLater: 'નવી તકો માટે પછીથી તપાસો',
    noApplicationsYet: 'હજુ સુધી કોઈ અરજી નથી',
    applicationsWillAppear: 'જ્યારે નોકરીની શોધ કરનારાઓ તમારી પોસ્ટ કરેલી નોકરીઓ માટે અરજી કરશે ત્યારે અરજીઓ અહીં દેખાશે',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && ['en', 'hi', 'mr', 'pa', 'gu'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const getLanguageName = (code: Language): string => {
  const names = {
    en: 'English',
    hi: 'हिंदी',
    mr: 'मराठी',
    pa: 'ਪੰਜਾਬੀ',
    gu: 'ગુજરાતી',
  };
  return names[code];
};