import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'hi' | 'mr' | 'pa' | 'gu' | 'bn' | 'te' | 'kn' | 'bh';

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
    housekeeping: 'House Keeping',
    constructionsiteworkers: 'Construction Site Workers',
    securityguard: 'Security Guard',
    
    // Home Screen
    availableJobs: 'Available Jobs',
    findPerfectJob: 'Find your perfect daily wage job',
    jobApplications: 'Job Applications',
    manageApplications: 'Manage applications for your posted jobs',
    allJobs: 'All Jobs',
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
    
    // Post Job
    postAJob: 'Post a Job',
    findRightWorker: 'Find the right worker for your needs',
    contactEmail: 'Contact Email',
    selectJobCategory: 'Select Job Category',
    jobLocation: 'Job Location',
    useCurrentLocation: 'Use Current Location',
    salaryPerDay: 'Salary per day (₹)',
    jobDescriptionPlaceholder: 'Job Description (requirements, working hours, etc.)',
    postJobButton: 'Post Job',
    postingJob: 'Posting Job...',
    
    // My Jobs
    myPostedJobs: 'My Posted Jobs',
    manageJobPostings: 'Manage your job postings',
    noJobsPosted: 'No jobs posted yet',
    startPostingJobs: 'Start posting jobs to find workers',
    postFirstJob: 'Post Your First Job',
    view: 'View',
    applicationsCount: 'Applications',
    
    // Workers
    myWorkers: 'My Workers',
    manageAcceptedWorkers: 'Manage your accepted workers',
    noWorkersYet: 'No workers yet',
    workersWillAppear: 'Workers will appear here when you accept their applications',
    active: 'Active',
    joined: 'Joined',
    yearsExp: 'years exp.',
    
    // Applied Jobs
    appliedJobsTitle: 'Applied Jobs',
    trackApplications: 'Track your job applications',
    noApplicationsYetWorker: 'No applications yet',
    startApplyingJobs: 'Start applying to jobs to see them here',
    appliedOn: 'Applied',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    
    // Payment History
    paymentHistory: 'Payment History',
    totalPaid: 'Total Paid',
    acrossPayments: 'Across',
    toWorkers: 'to workers',
    noPaymentsMade: 'No payments made yet',
    paymentHistoryWillAppear: 'Payment history will appear here when you pay workers',
    paidTo: 'Paid to',
    via: 'Via',
    dailyRate: 'Daily Rate',
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
    housekeeping: 'हाउस कीपिंग',
    constructionsiteworkers: 'निर्माण स्थल मजदूर',
    securityguard: 'सिक्योरिटी गार्ड',
    
    // Home Screen
    availableJobs: 'उपलब्ध नौकरियां',
    findPerfectJob: 'अपनी परफेक्ट दैनिक मजदूरी की नौकरी खोजें',
    jobApplications: 'नौकरी के आवेदन',
    manageApplications: 'अपनी पोस्ट की गई नौकरियों के लिए आवेदनों का प्रबंधन करें',
    allJobs: 'सभी नौकरियां',
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
    
    // Post Job
    postAJob: 'नौकरी पोस्ट करें',
    findRightWorker: 'अपनी आवश्यकताओं के लिए सही मजदूर खोजें',
    contactEmail: 'संपर्क ईमेल',
    selectJobCategory: 'नौकरी की श्रेणी चुनें',
    jobLocation: 'नौकरी का स्थान',
    useCurrentLocation: 'वर्तमान स्थान का उपयोग करें',
    salaryPerDay: 'प्रति दिन वेतन (₹)',
    jobDescriptionPlaceholder: 'नौकरी का विवरण (आवश्यकताएं, काम के घंटे, आदि)',
    postJobButton: 'नौकरी पोस्ट करें',
    postingJob: 'नौकरी पोस्ट की जा रही है...',
    
    // My Jobs
    myPostedJobs: 'मेरी पोस्ट की गई नौकरियां',
    manageJobPostings: 'अपनी नौकरी पोस्टिंग का प्रबंधन करें',
    noJobsPosted: 'अभी तक कोई नौकरी पोस्ट नहीं की गई',
    startPostingJobs: 'मजदूर खोजने के लिए नौकरियां पोस्ट करना शुरू करें',
    postFirstJob: 'अपनी पहली नौकरी पोस्ट करें',
    view: 'देखें',
    applicationsCount: 'आवेदन',
    
    // Workers
    myWorkers: 'मेरे मजदूर',
    manageAcceptedWorkers: 'अपने स्वीकृत मजदूरों का प्रबंधन करें',
    noWorkersYet: 'अभी तक कोई मजदूर नहीं',
    workersWillAppear: 'जब आप उनके आवेदन स्वीकार करेंगे तो मजदूर यहां दिखाई देंगे',
    active: 'सक्रिय',
    joined: 'शामिल हुआ',
    yearsExp: 'साल का अनुभव',
    
    // Applied Jobs
    appliedJobsTitle: 'आवेदित नौकरियां',
    trackApplications: 'अपने नौकरी आवेदनों को ट्रैक करें',
    noApplicationsYetWorker: 'अभी तक कोई आवेदन नहीं',
    startApplyingJobs: 'यहां देखने के लिए नौकरियों के लिए आवेदन करना शुरू करें',
    appliedOn: 'आवेदन किया',
    pending: 'लंबित',
    accepted: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    
    // Payment History
    paymentHistory: 'भुगतान इतिहास',
    totalPaid: 'कुल भुगतान',
    acrossPayments: 'में',
    toWorkers: 'मजदूरों को',
    noPaymentsMade: 'अभी तक कोई भुगतान नहीं किया गया',
    paymentHistoryWillAppear: 'जब आप मजदूरों को भुगतान करेंगे तो भुगतान इतिहास यहां दिखाई देगा',
    paidTo: 'को भुगतान',
    via: 'के माध्यम से',
    dailyRate: 'दैनिक दर',
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
    electrician: 'इलेक्ट्रिशिअन',
    plumber: 'प्लंबर',
    mechanic: 'मेकॅनिक',
    cook: 'स्वयंपाकी',
    peon: 'चपरासी',
    driver: 'ड्रायव्हर',
    housekeeping: 'हाऊस कीपिंग',
    constructionsiteworkers: 'बांधकाम साईट कामगार',
    securityguard: 'सिक्युरिटी गार्ड',
    
    // Home Screen
    availableJobs: 'उपलब्ध नोकऱ्या',
    findPerfectJob: 'तुमची परफेक्ट दैनंदिन मजुरीची नोकरी शोधा',
    jobApplications: 'नोकरीचे अर्ज',
    manageApplications: 'तुमच्या पोस्ट केलेल्या नोकऱ्यांसाठी अर्जांचे व्यवस्थापन करा',
    allJobs: 'सर्व नोकऱ्या',
    allJobs: 'सर्व नोकऱ्या',
    noJobsAvailable: 'कोणत्याही नोकऱ्या उपलब्ध नाहीत',
    checkBackLater: 'नवीन संधींसाठी नंतर तपासा',
    noApplicationsYet: 'अद्याप कोणते अर्ज नाहीत',
    applicationsWillAppear: 'जेव्हा नोकरी शोधणारे तुमच्या पोस्ट केलेल्या नोकऱ्यांसाठी अर्ज करतील तेव्हा अर्ज येथे दिसतील',
    
    // Auth
    welcomeBack: 'परत स्वागत',
    signInToFind: 'कामाच्या संधी शोधण्यासाठी साइन इन करा',
    joinRozgar: 'रोजगारात सामील व्हा',
    createWorkerAccount: 'तुमचे कामगार खाते तयार करा',
    organizationLogin: 'संस्था लॉगिन',
    signInToPost: 'नोकरीच्या संधी पोस्ट करण्यासाठी साइन इन करा',
    registerOrganization: 'संस्था नोंदणी करा',
    createOrgAccount: 'तुमचे संस्था खाते तयार करा',
    fullName: 'पूर्ण नाव',
    emailAddress: 'ईमेल पत्ता',
    phoneNumber: 'फोन नंबर',
    password: 'पासवर्ड',
    confirmPassword: 'पासवर्डची पुष्टी करा',
    organizationName: 'संस्थेचे नाव',
    contactPerson: 'संपर्क व्यक्तीचे नाव',
    contactNumber: 'संपर्क नंबर',
    signIn: 'साइन इन',
    createAccount: 'खाते तयार करा',
    pleaseWait: 'कृपया प्रतीक्षा करा...',
    noAccount: 'खाते नाही? साइन अप करा',
    haveAccount: 'आधीच खाते आहे? साइन इन करा',
    
    // Profile
    jobSeeker: 'नोकरी शोधणारा',
    contactInformation: 'संपर्क माहिती',
    about: 'बद्दल',
    editProfile: 'प्रोफाइल संपादित करा',
    signOut: 'साइन आउट',
    
    // Job Details
    jobDetails: 'नोकरीचे तपशील',
    jobDescription: 'नोकरीचे वर्णन',
    perDay: '/दिवस',
    posted: 'पोस्ट केले',
    recently: 'अलीकडे',
    directions: 'दिशानिर्देश',
    applyForJob: 'या नोकरीसाठी अर्ज करा',
    applied: '✓ अर्ज केला',
    
    // Payments
    myPayments: 'माझे पेमेंट',
    trackEarnings: 'तुमची कमाई ट्रॅक करा',
    totalEarnings: 'एकूण कमाई',
    fromPayments: 'पासून',
    payment: 'पेमेंट',
    payments: 'पेमेंट',
    noPaymentsYet: 'अद्याप कोणते पेमेंट नाही',
    paymentHistoryAppear: 'तुमचा पेमेंट इतिहास येथे दिसेल',
    workDays: 'कामाचे दिवस',
    days: 'दिवस',
    paymentMethod: 'पेमेंटची पद्धत',
    paidOn: 'पेमेंटची तारीख',
    workPeriod: 'कामाचा कालावधी',
    
    // Post Job
    postAJob: 'नोकरी पोस्ट करा',
    findRightWorker: 'तुमच्या गरजांसाठी योग्य कामगार शोधा',
    contactEmail: 'संपर्क ईमेल',
    selectJobCategory: 'नोकरीची श्रेणी निवडा',
    jobLocation: 'नोकरीचे ठिकाण',
    useCurrentLocation: 'सध्याचे स्थान वापरा',
    salaryPerDay: 'दररोज पगार (₹)',
    jobDescriptionPlaceholder: 'नोकरीचे वर्णन (आवश्यकता, कामाचे तास, इ.)',
    postJobButton: 'नोकरी पोस्ट करा',
    postingJob: 'नोकरी पोस्ट होत आहे...',
    
    // My Jobs
    myPostedJobs: 'माझ्या पोस्ट केलेल्या नोकऱ्या',
    manageJobPostings: 'तुमच्या नोकरी पोस्टिंगचे व्यवस्थापन करा',
    noJobsPosted: 'अद्याप कोणत्याही नोकऱ्या पोस्ट केल्या नाहीत',
    startPostingJobs: 'कामगार शोधण्यासाठी नोकऱ्या पोस्ट करणे सुरू करा',
    postFirstJob: 'तुमची पहिली नोकरी पोस्ट करा',
    view: 'पहा',
    applicationsCount: 'अर्ज',
    
    // Workers
    myWorkers: 'माझे कामगार',
    manageAcceptedWorkers: 'तुमच्या स्वीकृत कामगारांचे व्यवस्थापन करा',
    noWorkersYet: 'अद्याप कोणते कामगार नाहीत',
    workersWillAppear: 'जेव्हा तुम्ही त्यांचे अर्ज स्वीकारता तेव्हा कामगार येथे दिसतील',
    active: 'सक्रिय',
    joined: 'सामील झाला',
    yearsExp: 'वर्षांचा अनुभव',
    
    // Applied Jobs
    appliedJobsTitle: 'अर्ज केलेल्या नोकऱ्या',
    trackApplications: 'तुमच्या नोकरी अर्जांचा मागोवा घ्या',
    noApplicationsYetWorker: 'अद्याप कोणते अर्ज नाहीत',
    startApplyingJobs: 'येथे पाहण्यासाठी नोकऱ्यांसाठी अर्ज करणे सुरू करा',
    appliedOn: 'अर्ज केला',
    pending: 'प्रलंबित',
    accepted: 'स्वीकृत',
    rejected: 'नाकारले',
    
    // Payment History
    paymentHistory: 'पेमेंट इतिहास',
    totalPaid: 'एकूण पेमेंट',
    acrossPayments: 'मध्ये',
    toWorkers: 'कामगारांना',
    noPaymentsMade: 'अद्याप कोणते पेमेंट केले नाही',
    paymentHistoryWillAppear: 'जेव्हा तुम्ही कामगारांना पेमेंट कराल तेव्हा पेमेंट इतिहास येथे दिसेल',
    paidTo: 'ला पेमेंट',
    via: 'द्वारे',
    dailyRate: 'दैनिक दर',
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
    housekeeping: 'ਹਾਊਸ ਕੀਪਿੰਗ',
    constructionsiteworkers: 'ਉਸਾਰੀ ਸਾਈਟ ਮਜ਼ਦੂਰ',
    securityguard: 'ਸਿਕਿਉਰਿਟੀ ਗਾਰਡ',
    
    // Home Screen
    availableJobs: 'ਉਪਲਬਧ ਨੌਕਰੀਆਂ',
    findPerfectJob: 'ਆਪਣੀ ਸੰਪੂਰਨ ਰੋਜ਼ਾਨਾ ਮਜ਼ਦੂਰੀ ਦੀ ਨੌਕਰੀ ਲੱਭੋ',
    jobApplications: 'ਨੌਕਰੀ ਦੀਆਂ ਅਰਜ਼ੀਆਂ',
    manageApplications: 'ਆਪਣੀਆਂ ਪੋਸਟ ਕੀਤੀਆਂ ਨੌਕਰੀਆਂ ਲਈ ਅਰਜ਼ੀਆਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ',
    allJobs: 'ਸਾਰੀਆਂ ਨੌਕਰੀਆਂ',
    allJobs: 'ਸਾਰੀਆਂ ਨੌਕਰੀਆਂ',
    noJobsAvailable: 'ਕੋਈ ਨੌਕਰੀ ਉਪਲਬਧ ਨਹੀਂ',
    checkBackLater: 'ਨਵੇਂ ਮੌਕਿਆਂ ਲਈ ਬਾਅਦ ਵਿੱਚ ਜਾਂਚ ਕਰੋ',
    noApplicationsYet: 'ਅਜੇ ਤੱਕ ਕੋਈ ਅਰਜ਼ੀ ਨਹੀਂ',
    applicationsWillAppear: 'ਜਦੋਂ ਨੌਕਰੀ ਦੇ ਇੱਛੁਕ ਤੁਹਾਡੀਆਂ ਪੋਸਟ ਕੀਤੀਆਂ ਨੌਕਰੀਆਂ ਲਈ ਅਰਜ਼ੀ ਦੇਣਗੇ ਤਾਂ ਅਰਜ਼ੀਆਂ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੀਆਂ',
    
    // Post Job
    postAJob: 'ਨੌਕਰੀ ਪੋਸਟ ਕਰੋ',
    findRightWorker: 'ਆਪਣੀਆਂ ਲੋੜਾਂ ਲਈ ਸਹੀ ਮਜ਼ਦੂਰ ਲੱਭੋ',
    contactEmail: 'ਸੰਪਰਕ ਈਮੇਲ',
    selectJobCategory: 'ਨੌਕਰੀ ਦੀ ਸ਼ਰੇਣੀ ਚੁਣੋ',
    jobLocation: 'ਨੌਕਰੀ ਦਾ ਸਥਾਨ',
    useCurrentLocation: 'ਮੌਜੂਦਾ ਸਥਾਨ ਵਰਤੋ',
    salaryPerDay: 'ਪ੍ਰਤੀ ਦਿਨ ਤਨਖਾਹ (₹)',
    jobDescriptionPlaceholder: 'ਨੌਕਰੀ ਦਾ ਵੇਰਵਾ (ਲੋੜਾਂ, ਕੰਮ ਦੇ ਘੰਟੇ, ਆਦਿ)',
    postJobButton: 'ਨੌਕਰੀ ਪੋਸਟ ਕਰੋ',
    postingJob: 'ਨੌਕਰੀ ਪੋਸਟ ਹੋ ਰਹੀ ਹੈ...',
    
    // My Jobs
    myPostedJobs: 'ਮੇਰੀਆਂ ਪੋਸਟ ਕੀਤੀਆਂ ਨੌਕਰੀਆਂ',
    manageJobPostings: 'ਆਪਣੀਆਂ ਨੌਕਰੀ ਪੋਸਟਿੰਗਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ',
    noJobsPosted: 'ਅਜੇ ਤੱਕ ਕੋਈ ਨੌਕਰੀ ਪੋਸਟ ਨਹੀਂ ਕੀਤੀ',
    startPostingJobs: 'ਮਜ਼ਦੂਰ ਲੱਭਣ ਲਈ ਨੌਕਰੀਆਂ ਪੋਸਟ ਕਰਨਾ ਸ਼ੁਰੂ ਕਰੋ',
    postFirstJob: 'ਆਪਣੀ ਪਹਿਲੀ ਨੌਕਰੀ ਪੋਸਟ ਕਰੋ',
    view: 'ਵੇਖੋ',
    applicationsCount: 'ਅਰਜ਼ੀਆਂ',
    
    // Workers
    myWorkers: 'ਮੇਰੇ ਮਜ਼ਦੂਰ',
    manageAcceptedWorkers: 'ਆਪਣੇ ਸਵੀਕਾਰ ਕੀਤੇ ਮਜ਼ਦੂਰਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ',
    noWorkersYet: 'ਅਜੇ ਤੱਕ ਕੋਈ ਮਜ਼ਦੂਰ ਨਹੀਂ',
    workersWillAppear: 'ਜਦੋਂ ਤੁਸੀਂ ਉਨ੍ਹਾਂ ਦੀਆਂ ਅਰਜ਼ੀਆਂ ਸਵੀਕਾਰ ਕਰੋਗੇ ਤਾਂ ਮਜ਼ਦੂਰ ਇੱਥੇ ਦਿਖਾਈ ਦੇਣਗੇ',
    active: 'ਸਰਗਰਮ',
    joined: 'ਸ਼ਾਮਲ ਹੋਇਆ',
    yearsExp: 'ਸਾਲ ਦਾ ਤਜਰਬਾ',
    
    // Applied Jobs
    appliedJobsTitle: 'ਅਰਜ਼ੀ ਦਿੱਤੀਆਂ ਨੌਕਰੀਆਂ',
    trackApplications: 'ਆਪਣੀਆਂ ਨੌਕਰੀ ਅਰਜ਼ੀਆਂ ਦਾ ਪਤਾ ਲਗਾਓ',
    noApplicationsYetWorker: 'ਅਜੇ ਤੱਕ ਕੋਈ ਅਰਜ਼ੀ ਨਹੀਂ',
    startApplyingJobs: 'ਇੱਥੇ ਵੇਖਣ ਲਈ ਨੌਕਰੀਆਂ ਲਈ ਅਰਜ਼ੀ ਦੇਣਾ ਸ਼ੁਰੂ ਕਰੋ',
    appliedOn: 'ਅਰਜ਼ੀ ਦਿੱਤੀ',
    pending: 'ਲੰਬਿਤ',
    accepted: 'ਸਵੀਕਾਰ ਕੀਤਾ',
    rejected: 'ਰੱਦ ਕੀਤਾ',
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
    housekeeping: 'હાઉસ કીપિંગ',
    constructionsiteworkers: 'બાંધકામ સાઇટ મજૂરો',
    securityguard: 'સિક્યુરિટી ગાર્ડ',
    
    // Home Screen
    availableJobs: 'ઉપલબ્ધ નોકરીઓ',
    findPerfectJob: 'તમારી પરફેક્ટ દૈનિક મજૂરીની નોકરી શોધો',
    jobApplications: 'નોકરીની અરજીઓ',
    manageApplications: 'તમારી પોસ્ટ કરેલી નોકરીઓ માટે અરજીઓનું સંચાલન કરો',
    allJobs: 'બધી નોકરીઓ',
    allJobs: 'બધી નોકરીઓ',
    noJobsAvailable: 'કોઈ નોકરી ઉપલબ્ધ નથી',
    checkBackLater: 'નવી તકો માટે પછીથી તપાસો',
    noApplicationsYet: 'હજુ સુધી કોઈ અરજી નથી',
    applicationsWillAppear: 'જ્યારે નોકરીની શોધ કરનારાઓ તમારી પોસ્ટ કરેલી નોકરીઓ માટે અરજી કરશે ત્યારે અરજીઓ અહીં દેખાશે',
    
    // Post Job
    postAJob: 'નોકરી પોસ્ટ કરો',
    findRightWorker: 'તમારી જરૂરિયાતો માટે યોગ્ય મજૂર શોધો',
    contactEmail: 'સંપર્ક ઈમેલ',
    selectJobCategory: 'નોકરીની શ્રેણી પસંદ કરો',
    jobLocation: 'નોકરીનું સ્થાન',
    useCurrentLocation: 'વર્તમાન સ્થાન વાપરો',
    salaryPerDay: 'દરરોજ પગાર (₹)',
    jobDescriptionPlaceholder: 'નોકરીનું વર્ણન (જરૂરિયાતો, કામના કલાકો, વગેરે)',
    postJobButton: 'નોકરી પોસ્ટ કરો',
    postingJob: 'નોકરી પોસ્ટ થઈ રહી છે...',
    
    // My Jobs
    myPostedJobs: 'મારી પોસ્ટ કરેલી નોકરીઓ',
    manageJobPostings: 'તમારી નોકરી પોસ્ટિંગનું સંચાલન કરો',
    noJobsPosted: 'હજુ સુધી કોઈ નોકરી પોસ્ટ કરી નથી',
    startPostingJobs: 'મજૂરો શોધવા માટે નોકરીઓ પોસ્ટ કરવાનું શરૂ કરો',
    postFirstJob: 'તમારી પહેલી નોકરી પોસ્ટ કરો',
    view: 'જુઓ',
    applicationsCount: 'અરજીઓ',
    
    // Workers
    myWorkers: 'મારા મજૂરો',
    manageAcceptedWorkers: 'તમારા સ્વીકૃત મજૂરોનું સંચાલન કરો',
    noWorkersYet: 'હજુ સુધી કોઈ મજૂર નથી',
    workersWillAppear: 'જ્યારે તમે તેમની અરજીઓ સ્વીકારશો ત્યારે મજૂરો અહીં દેખાશે',
    active: 'સક્રિય',
    joined: 'જોડાયા',
    yearsExp: 'વર્ષનો અનુભવ',
    
    // Applied Jobs
    appliedJobsTitle: 'અરજી કરેલી નોકરીઓ',
    trackApplications: 'તમારી નોકરી અરજીઓને ટ્રેક કરો',
    noApplicationsYetWorker: 'હજુ સુધી કોઈ અરજી નથી',
    startApplyingJobs: 'અહીં જોવા માટે નોકરીઓ માટે અરજી કરવાનું શરૂ કરો',
    appliedOn: 'અરજી કરી',
    pending: 'બાકી',
    accepted: 'સ્વીકૃત',
    rejected: 'નકારી',
  },
  bn: {
    // App Name
    appName: 'রোজগার',
    appSubtitle: 'দৈনিক মজুরদের সুযোগের সাথে সংযুক্ত করা',
    
    // Welcome Screen
    lookingForWork: 'আমি কাজের খোঁজে আছি',
    findJobsSubtext: 'আপনার কাছাকাছি দৈনিক মজুরির কাজ খুঁজুন',
    employer: 'আমি একজন নিয়োগকর্তা',
    postJobsSubtext: 'কাজ পোস্ট করুন এবং শ্রমিক নিয়োগ দিন',
    
    // Navigation
    findJobs: 'কাজ খুঁজুন',
    applications: 'আবেদন',
    postJob: 'কাজ পোস্ট করুন',
    myJobs: 'আমার কাজ',
    workers: 'শ্রমিক',
    appliedJobs: 'আবেদনকৃত কাজ',
    payments: 'পেমেন্ট',
    profile: 'প্রোফাইল',
    
    // Common
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফলতা',
    cancel: 'বাতিল',
    save: 'সেভ করুন',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    apply: 'আবেদন করুন',
    accept: 'গ্রহণ করুন',
    reject: 'প্রত্যাখ্যান',
    
    // Job Categories
    electrician: 'ইলেকট্রিশিয়ান',
    plumber: 'প্লাম্বার',
    mechanic: 'মেকানিক',
    cook: 'রাঁধুনি',
    peon: 'পিয়ন',
    driver: 'ড্রাইভার',
    housekeeping: 'হাউস কিপিং',
    constructionsiteworkers: 'নির্মাণ সাইট শ্রমিক',
    securityguard: 'নিরাপত্তা প্রহরী',
    
    // Home Screen
    availableJobs: 'উপলব্ধ কাজ',
    findPerfectJob: 'আপনার নিখুঁত দৈনিক মজুরির কাজ খুঁজুন',
    jobApplications: 'কাজের আবেদন',
    manageApplications: 'আপনার পোস্ট করা কাজের জন্য আবেদনগুলি পরিচালনা করুন',
    allJobs: 'সব কাজ',
    noJobsAvailable: 'কোন কাজ উপলব্ধ নেই',
    checkBackLater: 'নতুন সুযোগের জন্য পরে চেক করুন',
    noApplicationsYet: 'এখনও কোন আবেদন নেই',
    applicationsWillAppear: 'যখন চাকরি প্রার্থীরা আপনার পোস্ট করা কাজের জন্য আবেদন করবে তখন আবেদনগুলি এখানে দেখা যাবে',
    
    // Home Screen
    availableJobs: 'উপলব্ধ কাজ',
    findPerfectJob: 'আপনার নিখুঁত দৈনিক মজুরির কাজ খুঁজুন',
    jobApplications: 'কাজের আবেদন',
    manageApplications: 'আপনার পোস্ট করা কাজের জন্য আবেদনগুলি পরিচালনা করুন',
    allJobs: 'সব কাজ',
    noJobsAvailable: 'কোন কাজ উপলব্ধ নেই',
    checkBackLater: 'নতুন সুযোগের জন্য পরে চেক করুন',
    noApplicationsYet: 'এখনও কোন আবেদন নেই',
    applicationsWillAppear: 'যখন চাকরি প্রার্থীরা আপনার পোস্ট করা কাজের জন্য আবেদন করবে তখন আবেদনগুলি এখানে দেখা যাবে',
    
    // Post Job
    postAJob: 'একটি কাজ পোস্ট করুন',
    findRightWorker: 'আপনার প্রয়োজনের জন্য সঠিক শ্রমিক খুঁজুন',
    contactEmail: 'যোগাযোগের ইমেইল',
    selectJobCategory: 'কাজের ধরন নির্বাচন করুন',
    jobLocation: 'কাজের স্থান',
    useCurrentLocation: 'বর্তমান অবস্থান ব্যবহার করুন',
    salaryPerDay: 'প্রতিদিন বেতন (₹)',
    jobDescriptionPlaceholder: 'কাজের বিবরণ (প্রয়োজনীয়তা, কাজের সময়, ইত্যাদি)',
    postJobButton: 'কাজ পোস্ট করুন',
    postingJob: 'কাজ পোস্ট হচ্ছে...',
    
    // Applied Jobs
    appliedJobsTitle: 'আবেদনকৃত কাজ',
    trackApplications: 'আপনার কাজের আবেদনগুলি ট্র্যাক করুন',
    noApplicationsYetWorker: 'এখনও কোন আবেদন নেই',
    startApplyingJobs: 'এখানে দেখতে কাজের জন্য আবেদন করা শুরু করুন',
    appliedOn: 'আবেদন করেছেন',
    pending: 'অপেক্ষমাণ',
    accepted: 'গৃহীত',
    rejected: 'প্রত্যাখ্যাত',
  },
  te: {
    // App Name
    appName: 'రోజ్‌గార్',
    appSubtitle: 'రోజువారీ కూలీలను అవకాశాలతో కలుపుట',
    
    // Welcome Screen
    lookingForWork: 'నేను పని వెతుకుతున్నాను',
    findJobsSubtext: 'మీ దగ్గర రోజువారీ కూలీ పనులను కనుగొనండి',
    employer: 'నేను యజమాని',
    postJobsSubtext: 'పనులను పోస్ట్ చేసి కూలీలను నియమించండి',
    
    // Navigation
    findJobs: 'పని వెతకండి',
    applications: 'దరఖాస్తులు',
    postJob: 'పని పోస్ట్ చేయండి',
    myJobs: 'నా పనులు',
    workers: 'కూలీలు',
    appliedJobs: 'దరఖాస్తు చేసిన పనులు',
    payments: 'చెల్లింపులు',
    profile: 'ప్రొఫైల్',
    
    // Common
    loading: 'లోడ్ అవుతోంది...',
    error: 'లోపం',
    success: 'విజయం',
    cancel: 'రద్దు చేయండి',
    save: 'సేవ్ చేయండి',
    delete: 'తొలగించండి',
    edit: 'సవరించండి',
    apply: 'దరఖాస్తు చేయండి',
    accept: 'అంగీకరించండి',
    reject: 'తిరస్కరించండి',
    
    // Job Categories
    electrician: 'ఎలక్ట్రీషియన్',
    plumber: 'ప్లంబర్',
    mechanic: 'మెకానిక్',
    cook: 'వంటవాడు',
    peon: 'పియన్',
    driver: 'డ్రైవర్',
    housekeeping: 'హౌస్ కీపింగ్',
    constructionsiteworkers: 'నిర్మాణ సైట్ కూలీలు',
    securityguard: 'సెక్యూరిటీ గార్డ్',
    
    // Home Screen
    availableJobs: 'అందుబాటులో ఉన్న పనులు',
    findPerfectJob: 'మీ పరిపూర్ణ రోజువారీ కూలీ పనిని కనుగొనండి',
    jobApplications: 'పని దరఖాస్తులు',
    manageApplications: 'మీ పోస్ట్ చేసిన పనుల కోసం దరఖాస్తులను నిర్వహించండి',
    allJobs: 'అన్ని పనులు',
    noJobsAvailable: 'ఎటువంటి పని అందుబాటులో లేదు',
    checkBackLater: 'కొత్త అవకాశాల కోసం తర్వాత తనిఖీ చేయండి',
    noApplicationsYet: 'ఇంకా ఎటువంటి దరఖాస్తులు లేవు',
    applicationsWillAppear: 'పని అన్వేషకులు మీ పోస్ట్ చేసిన పనుల కోసం దరఖాస్తు చేసినప్పుడు దరఖాస్తులు ఇక్కడ కనిపిస్తాయి',
    
    // Applied Jobs
    appliedJobsTitle: 'దరఖాస్తు చేసిన పనులు',
    trackApplications: 'మీ పని దరఖాస్తులను ట్రాక్ చేయండి',
    noApplicationsYetWorker: 'ఇంకా ఎటువంటి దరఖాస్తులు లేవు',
    startApplyingJobs: 'ఇక్కడ చూడడానికి పనుల కోసం దరఖాస్తు చేయడం ప్రారంభించండి',
    appliedOn: 'దరఖాస్తు చేసారు',
    pending: 'పెండింగ్',
    accepted: 'అంగీకరించబడింది',
    rejected: 'తిరస్కరించబడింది',
  },
  kn: {
    // App Name
    appName: 'ರೋಜ್‌ಗಾರ್',
    appSubtitle: 'ದೈನಂದಿನ ಕೂಲಿ ಕೆಲಸಗಾರರನ್ನು ಅವಕಾಶಗಳೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವುದು',
    
    // Welcome Screen
    lookingForWork: 'ನಾನು ಕೆಲಸ ಹುಡುಕುತ್ತಿದ್ದೇನೆ',
    findJobsSubtext: 'ನಿಮ್ಮ ಹತ್ತಿರ ದೈನಂದಿನ ಕೂಲಿ ಕೆಲಸಗಳನ್ನು ಹುಡುಕಿ',
    employer: 'ನಾನು ಉದ್ಯೋಗದಾತ',
    postJobsSubtext: 'ಕೆಲಸಗಳನ್ನು ಪೋಸ್ಟ್ ಮಾಡಿ ಮತ್ತು ಕೆಲಸಗಾರರನ್ನು ನೇಮಿಸಿ',
    
    // Navigation
    findJobs: 'ಕೆಲಸ ಹುಡುಕಿ',
    applications: 'ಅರ್ಜಿಗಳು',
    postJob: 'ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ',
    myJobs: 'ನನ್ನ ಕೆಲಸಗಳು',
    workers: 'ಕೆಲಸಗಾರರು',
    appliedJobs: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ಕೆಲಸಗಳು',
    payments: 'ಪಾವತಿಗಳು',
    profile: 'ಪ್ರೊಫೈಲ್',
    
    // Common
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    error: 'ದೋಷ',
    success: 'ಯಶಸ್ಸು',
    cancel: 'ರದ್ದುಗೊಳಿಸಿ',
    save: 'ಉಳಿಸಿ',
    delete: 'ಅಳಿಸಿ',
    edit: 'ಸಂಪಾದಿಸಿ',
    apply: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿ',
    accept: 'ಸ್ವೀಕರಿಸಿ',
    reject: 'ತಿರಸ್ಕರಿಸಿ',
    
    // Job Categories
    electrician: 'ಎಲೆಕ್ಟ್ರೀಷಿಯನ್',
    plumber: 'ಪ್ಲಂಬರ್',
    mechanic: 'ಮೆಕ್ಯಾನಿಕ್',
    cook: 'ಅಡುಗೆಯವರು',
    peon: 'ಪಿಯನ್',
    driver: 'ಚಾಲಕ',
    housekeeping: 'ಹೌಸ್ ಕೀಪಿಂಗ್',
    constructionsiteworkers: 'ನಿರ್ಮಾಣ ಸೈಟ್ ಕೆಲಸಗಾರರು',
    securityguard: 'ಸೆಕ್ಯೂರಿಟಿ ಗಾರ್ಡ್',
    
    // Home Screen
    availableJobs: 'ಲಭ್ಯವಿರುವ ಕೆಲಸಗಳು',
    findPerfectJob: 'ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ದೈನಂದಿನ ಕೂಲಿ ಕೆಲಸವನ್ನು ಹುಡುಕಿ',
    jobApplications: 'ಕೆಲಸದ ಅರ್ಜಿಗಳು',
    manageApplications: 'ನಿಮ್ಮ ಪೋಸ್ಟ್ ಮಾಡಿದ ಕೆಲಸಗಳಿಗೆ ಅರ್ಜಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
    allJobs: 'ಎಲ್ಲಾ ಕೆಲಸಗಳು',
    noJobsAvailable: 'ಯಾವುದೇ ಕೆಲಸ ಲಭ್ಯವಿಲ್ಲ',
    checkBackLater: 'ಹೊಸ ಅವಕಾಶಗಳಿಗಾಗಿ ನಂತರ ಪರಿಶೀಲಿಸಿ',
    noApplicationsYet: 'ಇನ್ನೂ ಯಾವುದೇ ಅರ್ಜಿಗಳಿಲ್ಲ',
    applicationsWillAppear: 'ಕೆಲಸ ಹುಡುಕುವವರು ನಿಮ್ಮ ಪೋಸ್ಟ್ ಮಾಡಿದ ಕೆಲಸಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿದಾಗ ಅರ್ಜಿಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ',
    
    // Applied Jobs
    appliedJobsTitle: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿದ ಕೆಲಸಗಳು',
    trackApplications: 'ನಿಮ್ಮ ಕೆಲಸದ ಅರ್ಜಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    noApplicationsYetWorker: 'ಇನ್ನೂ ಯಾವುದೇ ಅರ್ಜಿಗಳಿಲ್ಲ',
    startApplyingJobs: 'ಇಲ್ಲಿ ನೋಡಲು ಕೆಲಸಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಪ್ರಾರಂಭಿಸಿ',
    appliedOn: 'ಅರ್ಜಿ ಸಲ್ಲಿಸಿದೆ',
    pending: 'ಬಾಕಿ',
    accepted: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    rejected: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
  },
  bh: {
    // App Name (Bhojpuri)
    appName: 'रोजगार',
    appSubtitle: 'दैनिक मजूरन के अवसर से जोड़ल',
    
    // Welcome Screen
    lookingForWork: 'हम काम के खोज में बानी',
    findJobsSubtext: 'अपना लगे दैनिक मजूरी के काम खोजीं',
    employer: 'हम एगो मालिक बानी',
    postJobsSubtext: 'काम पोस्ट करीं आ मजूरन के काम पर रखीं',
    
    // Navigation
    findJobs: 'काम खोजीं',
    applications: 'अर्जी',
    postJob: 'काम पोस्ट करीं',
    myJobs: 'हमार काम',
    workers: 'मजूर',
    appliedJobs: 'अर्जी दिहल काम',
    payments: 'पेमेंट',
    profile: 'प्रोफाइल',
    
    // Common
    loading: 'लोड हो रहल बा...',
    error: 'गलती',
    success: 'सफलता',
    cancel: 'रद्द करीं',
    save: 'सेव करीं',
    delete: 'हटाईं',
    edit: 'संपादित करीं',
    apply: 'अर्जी दीं',
    accept: 'स्वीकार करीं',
    reject: 'अस्वीकार करीं',
    
    // Job Categories
    electrician: 'इलेक्ट्रीशियन',
    plumber: 'प्लंबर',
    mechanic: 'मैकेनिक',
    cook: 'रसोइया',
    peon: 'चपरासी',
    driver: 'ड्राइवर',
    housekeeping: 'हाउस कीपिंग',
    constructionsiteworkers: 'निर्माण साइट मजूर',
    securityguard: 'सिक्योरिटी गार्ड',
    
    // Home Screen
    availableJobs: 'उपलब्ध काम',
    findPerfectJob: 'अपना परफेक्ट रोजाना मजूरी के काम खोजीं',
    jobApplications: 'काम के अर्जी',
    manageApplications: 'अपना पोस्ट कइल काम खातिर अर्जी के व्यवस्थापन करीं',
    allJobs: 'सब काम',
    noJobsAvailable: 'कवनो काम उपलब्ध नइखे',
    checkBackLater: 'नया अवसर खातिर बाद में जांच करीं',
    noApplicationsYet: 'अभी तक कवनो अर्जी नइखे',
    applicationsWillAppear: 'जब काम खोजे वाला लोग रउआ के पोस्ट कइल काम खातिर अर्जी देई तब अर्जी इहाँ दिखाई',
    
    // Applied Jobs
    appliedJobsTitle: 'अर्जी दिहल काम',
    trackApplications: 'अपना काम के अर्जी के ट्रैक करीं',
    noApplicationsYetWorker: 'अभी तक कवनो अर्जी नइखे',
    startApplyingJobs: 'इहाँ देखे खातिर काम खातिर अर्जी देवे शुरू करीं',
    appliedOn: 'अर्जी दिहल',
    pending: 'बाकी',
    accepted: 'स्वीकार',
    rejected: 'अस्वीकार',
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
      if (savedLanguage && ['en', 'hi', 'mr', 'pa', 'gu', 'bn', 'te', 'kn', 'bh'].includes(savedLanguage)) {
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
    bn: 'বাংলা',
    te: 'తెలుగు',
    kn: 'ಕನ್ನಡ',
    bh: 'भोजपुरी',
  };
  return names[code];
};