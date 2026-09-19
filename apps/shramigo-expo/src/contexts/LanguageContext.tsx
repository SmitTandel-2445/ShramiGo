import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { storage, KEYS } from '@/lib/storage';

export type Language = 'en' | 'hi' | 'gu';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home', 'nav.search': 'Search', 'nav.bookings': 'Bookings',
    'nav.profile': 'Profile', 'nav.dashboard': 'Dashboard', 'nav.jobs': 'Jobs',
    'nav.earnings': 'Earnings', 'nav.welfare': 'Welfare',
    'Home': 'Home', 'Search': 'Search', 'Bookings': 'Bookings', 'Profile': 'Profile',
    'Dashboard': 'Dashboard', 'Jobs': 'Jobs', 'Earnings': 'Earnings',
    'Good Morning,': 'Good Morning,', 'Good Afternoon,': 'Good Afternoon,',
    'Good Evening,': 'Good Evening,', 'Welcome 👋': 'Welcome 👋',
    'Set your location': 'Set your location',
    'Search for Electrician, Plumber...': 'Search for Electrician, Plumber...',
    'Popular Services': 'Popular Services', 'See all': 'See all', 'View all': 'View all',
    'Find your best match': 'Find your best match',
    'Get smart worker recommendations near you.': 'Get smart worker recommendations near you.',
    'Top Rated Workers': 'Top Rated Workers',
    'Trusted professionals near you': 'Trusted professionals near you',
    'Verified workers from your local cooperative.': 'Verified workers from your local cooperative.',
    'Electrician': 'Electrician', 'Plumber': 'Plumber', 'Carpenter': 'Carpenter',
    'Cleaner': 'Cleaner', 'Painter': 'Painter', 'Driver': 'Driver',
    'AC Repair': 'AC Repair', 'Mason': 'Mason', 'Gardener': 'Gardener',
    'Appliance Repair': 'Appliance Repair',
    'Years Experience': 'Years Experience', 'No reviews yet': 'No reviews yet',
    'Available': 'Available', 'Offline': 'Offline', 'Nearby': 'Nearby',
    '/hr': '/hr', 'per hour': 'per hour', 'Book Now': 'Book Now',
    'Services not configured': 'Services not configured',
    'My Profile': 'My Profile', 'Edit Profile': 'Edit Profile',
    'Bookings count': 'Bookings', 'Active': 'Active', 'Addresses': 'Addresses',
    'Account': 'Account', 'Personal Information': 'Personal Information',
    'Manage your name, phone and email': 'Manage your name, phone and email',
    'My Addresses': 'My Addresses', 'Payment Methods': 'Payment Methods',
    'UPI, Cards, and Cash on Completion': 'UPI, Cards, and Cash on Completion',
    'Dark Mode Theme': 'Dark Mode Theme',
    'Switch between cyber dark and clean light': 'Switch between cyber dark and clean light',
    'Language': 'Language', 'Language / भाषा / ભાષા': 'Language / भाषा / ભાષા',
    'Choose your preferred language': 'Choose your preferred language',
    'App Language': 'App Language', 'English, हिंदी, ગુજરાતી': 'English, हिंदी, ગુજરાતી',
    'Notifications': 'Notifications', 'Booking and service updates': 'Booking and service updates',
    'Support': 'Support', 'Help & Support': 'Help & Support',
    'Get help with your bookings': 'Get help with your bookings',
    'Privacy & Security': 'Privacy & Security',
    'Manage your account security': 'Manage your account security',
    'Logout': 'Logout', 'Save Changes': 'Save Changes', 'Cancel': 'Cancel',
    'Book Service': 'Book Service', 'Select Service': 'Select Service',
    'Choose Date & Time': 'Choose Date & Time', 'Continue to Payment': 'Continue to Payment',
    'Payment': 'Payment', 'Cash on Completion': 'Cash on Completion',
    'Pay with UPI / Online': 'Pay with UPI / Online', 'Confirm Booking': 'Confirm Booking',
    'Total Amount': 'Total Amount',
    'Professional Information': 'Professional Information', 'About & Bio': 'About & Bio',
    'App Settings': 'App Settings', 'Language and preferences': 'Language and preferences',
    'Order Sound Alerts': 'Order Sound Alerts', 'Accept Jobs Automatically': 'Accept Jobs Automatically',
    'Vibration Alerts': 'Vibration Alerts', 'Save App Preferences': 'Save App Preferences',
    'Worker Profile': 'Worker Profile', 'Duty Status': 'Duty Status', 'Online': 'Online',
    'All': 'All', 'All Workers': 'All Workers', 'Pending': 'Pending', 'Accepted': 'Accepted',
    'Confirmed': 'Confirmed', 'In Progress': 'In Progress', 'Completed': 'Completed',
    'Cancelled': 'Cancelled', 'Upcoming': 'Upcoming', 'My Bookings': 'My Bookings',
    'Booking History': 'Booking History', 'Price': 'Price', 'Rating': 'Rating',
    'Sort by': 'Sort by', 'Filter': 'Filter', 'Clear': 'Clear', 'Apply': 'Apply',
    'Verified': 'Verified',
    'Worker Account': 'Worker Account', 'Welcome back': 'Welcome back',
    'Sign in to manage your jobs, schedule and earnings.': 'Sign in to manage your jobs, schedule and earnings.',
    'Sign in': 'Sign in', 'Sign In': 'Sign In',
    'Enter your account details to continue.': 'Enter your account details to continue.',
    'Email address': 'Email address', 'Enter your email': 'Enter your email',
    'Password': 'Password', 'Enter your password': 'Enter your password',
    'Forgot password?': 'Forgot password?',
    "Don't have a worker account?": "Don't have a worker account?",
    'Create Worker Account': 'Create Worker Account', 'Change role': 'Change role',
    'Your account information is secure': 'Your account information is secure',
    'Good morning': 'Good morning', 'Good afternoon': 'Good afternoon',
    'Good evening': 'Good evening', 'Available for Work': 'Available for Work',
    'Duty on': 'Duty on', 'Duty off': 'Duty off',
    "Today's Earnings": "Today's Earnings", 'Total Earnings': 'Total Earnings',
    'Completed Jobs': 'Completed Jobs', "Today's Jobs": "Today's Jobs",
    'No jobs scheduled for today': 'No jobs scheduled for today',
    'View all jobs': 'View all jobs', 'Quick Actions': 'Quick Actions',
    'My Schedule': 'My Schedule', 'Update working hours': 'Update working hours',
    'Skills & Services': 'Skills & Services', 'Manage categories': 'Manage categories',
    'Schedule': 'Schedule', 'More': 'More', 'Account & settings': 'Account & settings',
    'Personal information': 'Personal information', 'Name, phone and email': 'Name, phone and email',
    'Manage notification preferences': 'Manage notification preferences',
    'App settings': 'App settings', 'Help & support': 'Help & support',
    'Get help with ShramiGo': 'Get help with ShramiGo',
    'Active Jobs': 'Active Jobs', 'Job Requests': 'Job Requests',
    'Start Job': 'Start Job', 'Complete Job': 'Complete Job',
    'Customer Details': 'Customer Details', 'Call Customer': 'Call Customer',
    'Accept': 'Accept', 'Reject': 'Reject', 'Hourly Rates': 'Hourly Rates',
    'Welfare & Benefits': 'Welfare & Benefits',
    "You're Available": "You're Available", "You're Offline": "You're Offline",
    'Total jobs': 'Total jobs', "Today's earnings": "Today's earnings",
    'Completed jobs today': 'Completed jobs today', 'Active job requests': 'Active job requests',
    'Recent job requests': 'Recent job requests', 'Jobs assigned to you': 'Jobs assigned to you',
    'Earned': 'Earned', 'Estimated earning': 'Estimated earning', 'Status': 'Status',
    'Loading your jobs...': 'Loading your jobs...', 'No job requests yet.': 'No job requests yet.',
    'Make sure your availability is turned ON to receive bookings.': 'Make sure your availability is turned ON to receive bookings.',
    'Customers can send you job requests': 'Customers can send you job requests',
    "You won't receive new requests": "You won't receive new requests",
    'About Me': 'About Me', 'About': 'About',
    'Professional information': 'Professional information', 'Skills': 'Skills',
    'Service area & radius': 'Service area & radius', 'Services offered': 'Services offered',
    'Pricing & hourly charges': 'Pricing & hourly charges', 'Experience': 'Experience',
    'Working hours & availability': 'Working hours & availability',
    'Verified Worker': 'Verified Worker', 'Worker Verification': 'Worker Verification',
    'Your profile has been verified by ShramiGo': 'Your profile has been verified by ShramiGo',
    'Your profile is awaiting verification': 'Your profile is awaiting verification',
    'Jobs done': 'Jobs done', 'Services': 'Services', 'Edit': 'Edit', 'Add Bio': 'Add Bio',
    'No bio added yet. Tell customers about your background and experience.': 'No bio added yet. Tell customers about your background and experience.',
    'active services': 'active services', 'No services added': 'No services added',
    'Manage working days and shifts': 'Manage working days and shifts',
    'Done': 'Done', 'Save': 'Save', 'Search jobs...': 'Search jobs...',
    'Filter jobs': 'Filter jobs', 'Sort by Date': 'Sort by Date',
    'Sort by Amount': 'Sort by Amount', 'This Week': 'This Week',
    'This Month': 'This Month', 'All Time': 'All Time',
    'Weekly Earnings': 'Weekly Earnings', 'Monthly Earnings': 'Monthly Earnings',
    'Total Payout': 'Total Payout', 'Payout History': 'Payout History',
    'job': 'job', 'jobs': 'jobs', 'hr': 'hr',
  },
  hi: {
    'nav.home': 'होम', 'nav.search': 'खोजें', 'nav.bookings': 'बुकिंग',
    'nav.profile': 'प्रोफ़ाइल', 'nav.dashboard': 'डैशबोर्ड', 'nav.jobs': 'कार्य',
    'nav.earnings': 'कमाई', 'nav.welfare': 'कल्याण',
    'Home': 'होम', 'Search': 'खोजें', 'Bookings': 'बुकिंग', 'Profile': 'प्रोफ़ाइल',
    'Dashboard': 'डैशबोर्ड', 'Jobs': 'कार्य', 'Earnings': 'कमाई',
    'Good Morning,': 'शुभ प्रभात,', 'Good Afternoon,': 'शुभ दोपहर,',
    'Good Evening,': 'शुभ संध्या,', 'Welcome 👋': 'स्वागत है 👋',
    'Set your location': 'अपना स्थान चुनें',
    'Search for Electrician, Plumber...': 'इलेक्ट्रीशियन, प्लंबर खोजें...',
    'Popular Services': 'लोकप्रिय सेवाएं', 'See all': 'सभी देखें', 'View all': 'सभी देखें',
    'Find your best match': 'सर्वोत्तम कामगार खोजें',
    'Get smart worker recommendations near you.': 'अपने आस-पास उपयुक्त और कुशल कामगार खोजें।',
    'Top Rated Workers': 'शीर्ष रेटेड कामगार',
    'Trusted professionals near you': 'आपके आस-पास विश्वसनीय पेशेवर',
    'Verified workers from your local cooperative.': 'आपकी स्थानीय सहकारी संस्था से सत्यापित कामगार।',
    'Electrician': 'इलेक्ट्रीशियन', 'Plumber': 'प्लंबर', 'Carpenter': 'बढ़ई',
    'Cleaner': 'सफ़ाईकर्मी', 'Painter': 'पेंटर', 'Driver': 'ड्राइवर',
    'AC Repair': 'एसी रिपेयर', 'Mason': 'राजमिस्त्री', 'Gardener': 'माली',
    'Appliance Repair': 'उपकरण मरम्मत',
    'Years Experience': 'वर्षों का अनुभव', 'No reviews yet': 'अभी कोई समीक्षा नहीं',
    'Available': 'उपलब्ध', 'Offline': 'ऑफ़लाइन', 'Nearby': 'नज़दीक',
    '/hr': '/घंटा', 'per hour': 'प्रति घंटा', 'Book Now': 'अभी बुक करें',
    'Services not configured': 'सेवाएं उपलब्ध नहीं हैं',
    'My Profile': 'मेरी प्रोफ़ाइल', 'Edit Profile': 'प्रोफ़ाइल संपादित करें',
    'Bookings count': 'कुल बुकिंग', 'Active': 'सक्रिय', 'Addresses': 'पते',
    'Account': 'खाता', 'Personal Information': 'व्यक्तिगत जानकारी',
    'Manage your name, phone and email': 'अपना नाम, फोन और ईमेल प्रबंधित करें',
    'My Addresses': 'मेरे पते', 'Payment Methods': 'भुगतान के तरीके',
    'UPI, Cards, and Cash on Completion': 'यूपीआई, कार्ड और कार्य समाप्ति पर नकद',
    'Dark Mode Theme': 'डार्क मोड थीम',
    'Switch between cyber dark and clean light': 'साइबर डार्क और लाइट मोड बदलें',
    'Language': 'भाषा', 'Language / भाषा / ભાષા': 'भाषा / Language / ભાષા',
    'Choose your preferred language': 'अपनी पसंदीदा भाषा चुनें',
    'App Language': 'ऐप भाषा', 'Notifications': 'सूचनाएं',
    'Booking and service updates': 'बुकिंग और सेवा के ताज़ा अपडेट',
    'Support': 'सहायता', 'Help & Support': 'सहायता और संपर्क',
    'Get help with your bookings': 'अपनी बुकिंग के लिए सहायता प्राप्त करें',
    'Privacy & Security': 'गोपनीयता और सुरक्षा',
    'Manage your account security': 'अपने खाते की सुरक्षा प्रबंधित करें',
    'Logout': 'लॉग आउट', 'Save Changes': 'बदलाव सहेजें', 'Cancel': 'रद्द करें',
    'Book Service': 'सेवा बुक करें', 'Select Service': 'सेवा का चयन करें',
    'Choose Date & Time': 'तारीख और समय चुनें',
    'Continue to Payment': 'भुगतान के लिए आगे बढ़ें',
    'Payment': 'भुगतान', 'Cash on Completion': 'काम पूरा होने पर नकद',
    'Pay with UPI / Online': 'यूपीआई / ऑनलाइन से भुगतान करें',
    'Confirm Booking': 'बुकिंग की पुष्टि करें', 'Total Amount': 'कुल राशि',
    'Professional Information': 'व्यावसायिक जानकारी', 'About & Bio': 'परिचय और बायो',
    'App Settings': 'ऐप सेटिंग्स', 'Language and preferences': 'भाषा और प्राथमिकताएं',
    'Order Sound Alerts': 'ऑर्डर ध्वनि अलर्ट',
    'Accept Jobs Automatically': 'कार्य स्वतः स्वीकार करें',
    'Vibration Alerts': 'वाइब्रेशन अलर्ट', 'Save App Preferences': 'ऐप प्राथमिकताएं सहेजें',
    'Worker Profile': 'कामगार प्रोफ़ाइल', 'Duty Status': 'ड्यूटी स्थिति', 'Online': 'ऑनलाइन',
    'All': 'सभी', 'All Workers': 'सभी कामगार', 'Pending': 'लंबित', 'Accepted': 'स्वीकृत',
    'Confirmed': 'पुष्टि की गई', 'In Progress': 'प्रगति पर', 'Completed': 'पूर्ण हुआ',
    'Cancelled': 'रद्द किया गया', 'Upcoming': 'आगामी', 'My Bookings': 'मेरी बुकिंग',
    'Booking History': 'बुकिंग इतिहास', 'Price': 'मूल्य', 'Rating': 'रेटिंग',
    'Sort by': 'क्रमबद्ध करें', 'Filter': 'फ़िल्टर', 'Clear': 'हटाएं', 'Apply': 'लागू करें',
    'Verified': 'सत्यापित',
    'Worker Account': 'कामगार खाता', 'Welcome back': 'पुनः स्वागत है',
    'Sign in': 'साइन इन', 'Sign In': 'साइन इन करें',
    'Email address': 'ईमेल पता', 'Enter your email': 'अपना ईमेल दर्ज करें',
    'Password': 'पासवर्ड', 'Enter your password': 'अपना पासवर्ड दर्ज करें',
    'Forgot password?': 'पासवर्ड भूल गए?',
    'Create Worker Account': 'कामगार खाता बनाएं', 'Change role': 'भूमिका बदलें',
    'Good morning': 'शुभ प्रभात', 'Good afternoon': 'शुभ दोपहर', 'Good evening': 'शुभ संध्या',
    'Available for Work': 'कार्य के लिए उपलब्ध', 'Duty on': 'ड्यूटी चालू', 'Duty off': 'ड्यूटी बंद',
    "Today's Earnings": 'आज की कमाई', 'Total Earnings': 'कुल कमाई',
    'Completed Jobs': 'पूर्ण कार्य', "Today's Jobs": 'आज के कार्य',
    'No jobs scheduled for today': 'आज के लिए कोई कार्य निर्धारित नहीं है',
    'View all jobs': 'सभी कार्य देखें', 'Quick Actions': 'त्वरित क्रियाएं',
    'My Schedule': 'मेरी समय सारिणी', 'Update working hours': 'काम के घंटे अपडेट करें',
    'Skills & Services': 'कौशल और सेवाएं', 'Manage categories': 'श्रेणियां प्रबंधित करें',
    'More': 'अधिक', 'Active Jobs': 'सक्रिय कार्य', 'Job Requests': 'कार्य अनुरोध',
    'Start Job': 'कार्य शुरू करें', 'Complete Job': 'कार्य पूरा करें',
    'Customer Details': 'ग्राहक का विवरण', 'Call Customer': 'ग्राहक को कॉल करें',
    'Accept': 'स्वीकार करें', 'Reject': 'अस्वीकार करें',
    'Welfare & Benefits': 'कल्याण और लाभ',
    "You're Available": 'आप उपलब्ध हैं', "You're Offline": 'आप ऑफ़लाइन हैं',
    'Total jobs': 'कुल कार्य', "Today's earnings": 'आज की कमाई',
    'Completed jobs today': 'आज पूरे किए गए कार्य',
    'No job requests yet.': 'अभी कोई कार्य अनुरोध नहीं है।',
    'Skills': 'कौशल', 'Experience': 'अनुभव',
    'Done': 'पूर्ण', 'Save': 'सहेजें', 'Edit': 'संपादित करें',
    'This Week': 'इस सप्ताह', 'This Month': 'इस महीने', 'All Time': 'कुल समय',
    'Weekly Earnings': 'साप्ताहिक कमाई', 'Monthly Earnings': 'मासिक कमाई',
    'Total Payout': 'कुल भुगतान', 'Payout History': 'भुगतान इतिहास',
    'job': 'कार्य', 'jobs': 'कार्य', 'hr': 'घंटा',
  },
  gu: {
    'nav.home': 'હોમ', 'nav.search': 'શોધો', 'nav.bookings': 'બુકિંગ',
    'nav.profile': 'પ્રોફાઇલ', 'nav.dashboard': 'ડેશબોર્ડ', 'nav.jobs': 'કામ',
    'nav.earnings': 'કમાણી', 'nav.welfare': 'કલ્યાણ',
    'Home': 'હોમ', 'Search': 'શોધો', 'Bookings': 'બુકિંગ', 'Profile': 'પ્રોફાઇલ',
    'Dashboard': 'ડેશબોર્ડ', 'Jobs': 'કામ', 'Earnings': 'કમાણી',
    'Good Morning,': 'સુપ્રભાત,', 'Good Afternoon,': 'શુભ બપોર,',
    'Good Evening,': 'શુભ સાંજ,', 'Welcome 👋': 'સ્વાગત છે 👋',
    'Set your location': 'સ્થાન પસંદ કરો',
    'Search for Electrician, Plumber...': 'ઇલેક્ટ્રિશિયન, પ્લમ્બર શોધો...',
    'Popular Services': 'લોકપ્રિય સેવાઓ', 'See all': 'બધું જુઓ', 'View all': 'બધું જુઓ',
    'Find your best match': 'શ્રેષ્ઠ કામદાર શોધો',
    'Get smart worker recommendations near you.': 'તમારી નજીકના કુશળ કામદારોની ભલામણો મેળવો.',
    'Top Rated Workers': 'ટોચના રેટિંગવાળા કામદારો',
    'Trusted professionals near you': 'તમારી નજીકના વિશ્વાસપાત્ર પ્રોફેશનલ્સ',
    'Verified workers from your local cooperative.': 'તમારી સ્થાનિક સહકારી સંસ્થાના પ્રમાણિત કામદારો.',
    'Electrician': 'ઇલેક્ટ્રિશિયન', 'Plumber': 'પ્લમ્બર', 'Carpenter': 'સુથાર',
    'Cleaner': 'સફાઈ કામદાર', 'Painter': 'પેઇન્ટર', 'Driver': 'ડ્રાઈવર',
    'AC Repair': 'એસી રિપેરિંગ', 'Mason': 'કડિયો', 'Gardener': 'માળી',
    'Appliance Repair': 'સાધન સમારકામ',
    'Years Experience': 'વર્ષોનો અનુભવ', 'No reviews yet': 'હજુ કોઈ સમીક્ષા નથી',
    'Available': 'ઉપલબ્ધ', 'Offline': 'ઓફલાઇન', 'Nearby': 'નજીક',
    '/hr': '/કલાક', 'per hour': 'પ્રતિ કલાક', 'Book Now': 'હમણાં બુક કરો',
    'Services not configured': 'સેવાઓ ગોઠવેલ નથી',
    'My Profile': 'મારી પ્રોફાઇલ', 'Edit Profile': 'પ્રોફાઇલ સંપાદિત કરો',
    'Bookings count': 'કુલ બુકિંગ', 'Active': 'સક્રિય', 'Addresses': 'સરનામાં',
    'Account': 'ખાતું', 'Personal Information': 'વ્યક્તિગત માહિતી',
    'Manage your name, phone and email': 'તમારું નામ, ફોન અને ઇમેઇલ મેનેજ કરો',
    'Payment Methods': 'ચુકવણી પદ્ધતિઓ',
    'Dark Mode Theme': 'ડાર્ક મોડ થીમ',
    'Language': 'ભાષા', 'Choose your preferred language': 'તમારી પસંદગીની ભાષા પસંદ કરો',
    'Notifications': 'સૂચનાઓ', 'Booking and service updates': 'બુકિંગ અને સેવાના તાજા અપડેટ્સ',
    'Support': 'સહાય', 'Help & Support': 'મદદ અને સંપર્ક',
    'Privacy & Security': 'ગોપનીયતા અને સુરક્ષા',
    'Logout': 'લૉગ આઉટ', 'Save Changes': 'ફેરફારો સાચવો', 'Cancel': 'રદ કરો',
    'Payment': 'ચુકવણી', 'Cash on Completion': 'કામ પૂરું થતાં રોકડ',
    'Confirm Booking': 'બુકિંગ કન્ફર્મ કરો', 'Total Amount': 'કુલ રકમ',
    'Worker Profile': 'કામદાર પ્રોફાઇલ', 'Online': 'ઓનલાઇન',
    'All': 'બધું', 'Pending': 'બાકી', 'Accepted': 'સ્વીકાર્યું',
    'Completed': 'પૂર્ણ થયેલ', 'Cancelled': 'રદ થયેલ',
    'My Bookings': 'મારી બુકિંગ', 'Price': 'કિંમત', 'Rating': 'રેટિંગ',
    'Verified': 'પ્રમાણિત',
    'Sign In': 'સાઇન ઇન કરો', 'Password': 'પાસવર્ડ',
    'Good morning': 'સુપ્રભાત', 'Good afternoon': 'શુભ બપોર', 'Good evening': 'શુભ સાંજ',
    'Available for Work': 'કામ માટે ઉપલબ્ધ',
    "Today's Earnings": 'આજની કમાણી', 'Total Earnings': 'કુલ કમાણી',
    'Completed Jobs': 'પૂર્ણ થયેલ કામ', 'View all jobs': 'બધા કામ જુઓ',
    'Active Jobs': 'ચાલુ કામ', 'Job Requests': 'કામની વિનંતીઓ',
    'Accept': 'સ્વીકારો', 'Reject': 'અસ્વીકાર કરો',
    "You're Available": 'તમે ઉપલબ્ધ છો', "You're Offline": 'તમે ઑફલાઇન છો',
    'Skills': 'કૌશલ્ય', 'Experience': 'અનુભવ',
    'Done': 'પૂર્ણ', 'Save': 'સાચવો', 'Edit': 'સંપાદિત કરો',
    'This Week': 'આ અઠવાડિયે', 'This Month': 'આ મહિને', 'All Time': 'કુલ સમય',
    'Total Payout': 'કુલ ચુકવણી', 'Payout History': 'ચુકવણી ઇતિહાસ',
    'job': 'કામ', 'jobs': 'કામ', 'hr': 'કલાક',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    storage.getItem(KEYS.LANGUAGE).then((saved) => {
      if (saved === 'en' || saved === 'hi' || saved === 'gu') {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storage.setItem(KEYS.LANGUAGE, lang);
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key] !== undefined) return langDict[key];
    const enDict = translations.en;
    if (enDict && enDict[key] !== undefined) return enDict[key];
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
