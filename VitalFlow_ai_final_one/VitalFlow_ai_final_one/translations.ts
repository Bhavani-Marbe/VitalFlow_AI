
export type Language = 'en' | 'hi' | 'kn';

export interface TranslationKeys {
  title: string;
  home: string;
  subtitle: string;
  inventory: string;
  dashboard: string;
  analytics: string;
  assistant: string;
  login: string;
  adminAccess: string;
  sos: string;
  searchPlaceholder: string;
  bloodGroup: string;
  component: string;
  location: string;
  components: string;
  selected: string;
  selectComponents: string;
  scanning: string;
  scanNetwork: string;
  networkStatus: string;
  operational: string;
  precision: string;
  bloodSupply: string;
  intelligence: string;
  heroSubtitle: string;
  facilities: string;
  connectedToGrid: string;
  emergencyProtocol: string;
  activeIn: string;
  connectingHospitals: string;
  doNotClose: string;
  sosStep1: string;
  sosStep2: string;
  sosStep3: string;
  sosStep4: string;
  broadcastingTo: string;
  andSurrounding: string;
  calling: string;
  connecting: string;
  alertSent: string;
  cancelProtocol: string;
  administrator: string;
  verifiedUser: string;
  adminPortal: string;
  secureLogin: string;
  authenticateAccess: string;
  returnToSearch: string;
  live: string;
  nationalBioGrid: string;
  active: string;
  activeRequestTelemetry: string;
  liveTracking: string;
  transfer: string;
  pickup: string;
  liveNetwork: string;
  sync: string;
  sector: string;
  availableInventory: string;
  totalUnits: string;
  networkOverflow: string;
  noMatchesTitle: string;
  noMatchesDesc: string;
  tip1: string;
  tip2: string;
  tip3: string;
  tip4: string;
  resetFilters: string;
  footerDesc: string;
  contact: string;
  email: string;
  platform: string;
  inventoryMap: string;
  aiForecasting: string;
  facilityPortal: string;
  legal: string;
  privacyPolicy: string;
  termsOfService: string;
  compliance: string;
  copyright: string;
  systemStatus: string;
  stable: string;
  logout: string;
  userDashboard: string;
  welcomeBack: string;
  accountId: string;
  totalPurchases: string;
  reservations: string;
  totalSpend: string;
  activeRequestStatus: string;
  requestDetails: string;
  facility: string;
  method: string;
  destination: string;
  activityHistory: string;
  downloadReport: string;
  date: string;
  activity: string;
  noActivity: string;
  commandCenter: string;
  liveTelemetry: string;
  networkHealth: string;
  activeNodes: string;
  regionalDemandMatrix: string;
  livePrediction: string;
  anomalies: string;
  integrityIndex: string;
  perishableAlerts: string;
  riskIndex: string;
  redistributionRequired: string;
  draftTransfer: string;
  redistributionRoutes: string;
  executeProtocol: string;
  networkSecured: string;
  noHighRisk: string;
  model01: string;
  model02: string;
  model04: string;
  model05: string;
  exactMatch: string;
  compatible: string;
  risk: string;
  units: string;
  reserve: string;
  neuralMatch: string;
  latency: string;
  actionableTips: string;
  localSector: string;
  locationDetected: string;
  street: string;
  area: string;
  state: string;
  postcode: string;
  facilitiesIn: string;
  clinicalIntelligenceNode: string;
  clinicalHeroSubtitle: string;
  decisionSupport: string;
  nationwidePresence: string;
  ensuringAccessibility: string;
  connectedNetwork: string;
  selectState: string;
  totalDonorRegistration: string;
  totalBloodCenters: string;
  totalUpcomingCamps: string;
  campsOrganised: string;
  dataCollectedPost: string;
  downloadApp: string;
  findBloodBank: string;
  bloodAvailability: string;
  campSchedule: string;
  donorLogin: string;
  aboutVitalFlow: string;
  bloodDonationFacts: string;
  fact1: string;
  fact2: string;
  fact3: string;
  fact4: string;
  donationProcess: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  slogan1: string;
  slogan2: string;
  slogan3: string;
  emergencyMode: string;
  criticalRequirement: string;
  emergencyContact: string;
  contactName: string;
  phoneNumber: string;
  save: string;
  nearbyFacilities: string;
  detectedLocation: string;
  hospitalDashboard: string;
  driverDashboard: string;
  activeDeliveries: string;
  pendingRequests: string;
  completedDeliveries: string;
  routeOptimization: string;
  vehicleStatus: string;
  currentLocation: string;
  destinationAddress: string;
  user: string;
  driver: string;
  hospital: string;
  admin: string;
}

export const translations: Record<Language, TranslationKeys> = {
  en: {
    title: "VitalFlow AI",
    home: "Home",
    subtitle: "Precision Blood Supply Intelligence",
    inventory: "Inventory",
    dashboard: "Dashboard",
    analytics: "Analytics",
    assistant: "Clinical AI",
    login: "Login",
    adminAccess: "Admin Access",
    sos: "SOS Emergency",
    searchPlaceholder: "Search city...",
    bloodGroup: "Blood Group",
    component: "Component",
    location: "Location",
    components: "Components",
    selected: "Selected",
    selectComponents: "Select components",
    scanning: "Scanning...",
    scanNetwork: "Scan Network",
    networkStatus: "Network Status",
    operational: "Operational",
    precision: "Precision",
    bloodSupply: "Blood Supply",
    intelligence: "Intelligence",
    heroSubtitle: "VitalFlow AI optimizes the national blood supply chain using real-time telemetry and predictive analytics for zero-waste distribution.",
    facilities: "Facilities",
    connectedToGrid: "Connected to the Grid",
    emergencyProtocol: "Emergency Protocol Active",
    activeIn: "ACTIVE IN",
    connectingHospitals: "CONNECTING HOSPITALS",
    doNotClose: "DO NOT CLOSE THIS WINDOW",
    sosStep1: "Detecting precise location telemetry...",
    sosStep2: "Identifying nearest critical care facilities...",
    sosStep3: "Establishing priority communication link...",
    sosStep4: "Broadcasting urgent blood requirement...",
    broadcastingTo: "Broadcasting critical requirement to all network hospitals in",
    andSurrounding: "and surrounding sectors",
    calling: "Calling",
    connecting: "Connecting",
    alertSent: "Alert Sent",
    cancelProtocol: "Cancel Protocol",
    administrator: "Administrator",
    verifiedUser: "Verified User",
    adminPortal: "Admin Portal",
    secureLogin: "Secure Login",
    authenticateAccess: "Authenticate Access",
    returnToSearch: "Return to Search",
    live: "Live",
    nationalBioGrid: "National Bio-Grid",
    active: "Active",
    activeRequestTelemetry: "Active Request Telemetry",
    liveTracking: "Live Tracking",
    transfer: "Transfer",
    pickup: "Pickup",
    liveNetwork: "Live Network",
    sync: "Sync",
    sector: "Sector",
    availableInventory: "Available Inventory",
    totalUnits: "Total Units",
    networkOverflow: "Network Overflow (Other Cities)",
    noMatchesTitle: "No Matches in the Grid",
    noMatchesDesc: "We couldn't find any exact or compatible blood assets matching your current filters. Our network is constantly syncing, so check back shortly.",
    tip1: "Try selecting a broader location or city.",
    tip2: "Check for compatible blood groups (e.g., O- is universal).",
    tip3: "Ensure your component filters aren't too restrictive.",
    tip4: "Use the AI Assistant for complex matching requests.",
    resetFilters: "Reset Search Filters",
    footerDesc: "India's first AI-powered real-time blood supply chain network. Connecting lives through precision logistics.",
    contact: "Contact",
    email: "Email",
    platform: "Platform",
    inventoryMap: "Inventory Map",
    aiForecasting: "AI Forecasting",
    facilityPortal: "Facility Portal",
    legal: "Legal",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    compliance: "Compliance",
    copyright: "© 2024 VITALFLOW HEALTHCARE. ALL RIGHTS RESERVED.",
    systemStatus: "System Status",
    stable: "Stable",
    logout: "Logout",
    userDashboard: "User Dashboard",
    welcomeBack: "Welcome back",
    accountId: "Account ID",
    totalPurchases: "Total Purchases",
    reservations: "Reservations",
    totalSpend: "Total Spend",
    activeRequestStatus: "Active Request Status",
    requestDetails: "Request Details",
    facility: "Facility",
    method: "Method",
    destination: "Destination",
    activityHistory: "Activity History",
    downloadReport: "Download Report",
    date: "Date",
    activity: "Activity",
    noActivity: "No activity history found.",
    commandCenter: "Command Center",
    liveTelemetry: "Live Network Telemetry",
    networkHealth: "Network Health",
    activeNodes: "Active Nodes",
    regionalDemandMatrix: "Regional Demand Matrix",
    livePrediction: "Live Prediction",
    anomalies: "Anomalies",
    integrityIndex: "Integrity Index",
    perishableAlerts: "Perishable Alerts",
    riskIndex: "Risk Index",
    redistributionRequired: "Redistribution Required",
    draftTransfer: "Draft Transfer",
    redistributionRoutes: "Redistribution Routes",
    executeProtocol: "Execute Protocol",
    networkSecured: "Network Secured",
    noHighRisk: "No high-risk perishable assets detected across the grid.",
    model01: "Model 01: LSTM Projections",
    model02: "Model 02: Risk Scan",
    model04: "Model 04: Anomaly Detection",
    model05: "Model 05: Optimization",
    exactMatch: "Exact Match",
    compatible: "Compatible",
    risk: "Risk",
    units: "Units",
    reserve: "Reserve",
    neuralMatch: "Neural Match",
    latency: "Latency",
    actionableTips: "Actionable Tips",
    localSector: "Local Sector",
    locationDetected: "Location Detected",
    street: "Street",
    area: "Area",
    state: "State",
    postcode: "Postcode",
    facilitiesIn: "All Facilities in",
    clinicalIntelligenceNode: "CLINICAL INTELLIGENCE NODE",
    clinicalHeroSubtitle: "Advanced neural networks processing real-time patient data for precision transfusion decisions and risk mitigation.",
    decisionSupport: "Decision Support",
    nationwidePresence: "Nationwide Presence",
    ensuringAccessibility: "Ensuring Accessibility Across India.",
    connectedNetwork: "A Connected Network of Blood Center Serving Every State and District",
    selectState: "Select State",
    totalDonorRegistration: "Total Donor Registration",
    totalBloodCenters: "Total Blood Centers",
    totalUpcomingCamps: "Total Upcoming Camps",
    campsOrganised: "Camps Organised",
    dataCollectedPost: "*The data represented has been collected post year 2017 onwards.",
    downloadApp: "Download Our App",
    findBloodBank: "Find Blood Bank",
    bloodAvailability: "Blood Availability",
    campSchedule: "Camp Schedule",
    donorLogin: "Donor Login",
    aboutVitalFlow: "About VitalFlow AI",
    bloodDonationFacts: "Blood Donation Facts",
    fact1: "1 unit of blood can save up to 3 lives.",
    fact2: "Every 2 seconds someone in India needs blood.",
    fact3: "Blood cannot be manufactured; it can only come from generous donors.",
    fact4: "Donating blood is good for your health and reduces risk of heart disease.",
    donationProcess: "Blood Donation Process",
    step1Title: "Registration",
    step1Desc: "Fill out a simple form with your basic details and medical history.",
    step2Title: "Donation",
    step2Desc: "A quick and safe process where about 350-450ml of blood is collected.",
    step3Title: "Refreshment",
    step3Desc: "Rest for a few minutes and enjoy some snacks and fluids.",
    slogan1: "Donate Blood, Save Lives.",
    slogan2: "Your Blood is Precious, Share it.",
    slogan3: "Be a Hero, Donate Blood Today.",
    emergencyMode: "Emergency Mode",
    criticalRequirement: "Critical Requirement",
    emergencyContact: "Emergency Contact",
    contactName: "Contact Name",
    phoneNumber: "Phone Number",
    save: "Save",
    nearbyFacilities: "Nearby Facilities",
    detectedLocation: "Detected Location",
    hospitalDashboard: "Hospital Dashboard",
    driverDashboard: "Driver Dashboard",
    activeDeliveries: "Active Deliveries",
    pendingRequests: "Pending Requests",
    completedDeliveries: "Completed Deliveries",
    routeOptimization: "Route Optimization",
    vehicleStatus: "Vehicle Status",
    currentLocation: "Current Location",
    destinationAddress: "Destination Address",
    user: "User",
    driver: "Driver",
    hospital: "Hospital",
    admin: "Admin",
  },
  hi: {
    title: "वाइटलफ्लो AI",
    home: "होम",
    subtitle: "सटीक रक्त आपूर्ति इंटेलिजेंस",
    inventory: "इन्वेंटरी",
    dashboard: "डैशबोर्ड",
    analytics: "एनालिटिक्स",
    assistant: "क्लिनिकल AI",
    login: "लॉगिन",
    adminAccess: "एडमिन एक्सेस",
    sos: "SOS आपातकालीन",
    searchPlaceholder: "शहर खोजें...",
    bloodGroup: "रक्त समूह",
    component: "घटक",
    location: "स्थान",
    components: "घटक",
    selected: "चयनित",
    selectComponents: "घटक चुनें",
    scanning: "स्कैनिंग...",
    scanNetwork: "नेटवर्क स्कैन करें",
    networkStatus: "नेटवर्क स्थिति",
    operational: "परिचालन",
    precision: "सटीकता",
    bloodSupply: "रक्त आपूर्ति",
    intelligence: "इंटेलिजेंस",
    heroSubtitle: "वाइटलफ्लो AI शून्य-अपशिष्ट वितरण के लिए रीयल-टाइम टेलीमेट्री और भविष्य कहनेवाला विश्लेषण का उपयोग करके राष्ट्रीय रक्त आपूर्ति श्रृंखला को अनुकूलित करता है।",
    facilities: "सुविधाएं",
    connectedToGrid: "ग्रिड से जुड़ा",
    emergencyProtocol: "आपातकालीन प्रोटोकॉल सक्रिय",
    activeIn: "सक्रिय",
    connectingHospitals: "अस्पतालों को जोड़ना",
    doNotClose: "इस विंडो को बंद न करें",
    sosStep1: "सटीक स्थान टेलीमेट्री का पता लगाना...",
    sosStep2: "निकटतम महत्वपूर्ण देखभाल सुविधाओं की पहचान करना...",
    sosStep3: "प्राथमिकता संचार लिंक स्थापित करना...",
    sosStep4: "तत्काल रक्त की आवश्यकता का प्रसारण...",
    broadcastingTo: "सभी नेटवर्क अस्पतालों में महत्वपूर्ण आवश्यकता का प्रसारण",
    andSurrounding: "और आसपास के क्षेत्र",
    calling: "कॉलिंग",
    connecting: "कनेक्टिंग",
    alertSent: "अलर्ट भेजा गया",
    cancelProtocol: "प्रोटोकॉल रद्द करें",
    administrator: "प्रशासक",
    verifiedUser: "सत्यापित उपयोगकर्ता",
    adminPortal: "एडमिन पोर्टल",
    secureLogin: "सुरक्षित लॉगिन",
    authenticateAccess: "पहुंच प्रमाणित करें",
    returnToSearch: "खोज पर लौटें",
    live: "लाइव",
    nationalBioGrid: "राष्ट्रीय बायो-ग्रिड",
    active: "सक्रिय",
    activeRequestTelemetry: "सक्रिय अनुरोध टेलीमेट्री",
    liveTracking: "लाइव ट्रैकिंग",
    transfer: "स्थानांतरण",
    pickup: "पिकअप",
    liveNetwork: "लाइव नेटवर्क",
    sync: "सिंक",
    sector: "क्षेत्र",
    availableInventory: "उपलब्ध इन्वेंटरी",
    totalUnits: "कुल इकाइयाँ",
    networkOverflow: "नेटवर्क ओवरफ्लो (अन्य शहर)",
    noMatchesTitle: "ग्रिड में कोई मिलान नहीं",
    noMatchesDesc: "हमें आपके वर्तमान फिल्टर से मेल खाने वाली कोई सटीक या संगत रक्त संपत्ति नहीं मिली। हमारा नेटवर्क लगातार सिंक हो रहा है, इसलिए जल्द ही वापस देखें।",
    tip1: "व्यापक स्थान या शहर चुनने का प्रयास करें।",
    tip2: "संगत रक्त समूहों की जाँच करें (जैसे, O- सार्वभौमिक है)।",
    tip3: "सुनिश्चित करें कि आपके घटक फिल्टर बहुत अधिक प्रतिबंधात्मक नहीं हैं।",
    tip4: "जटिल मिलान अनुरोधों के लिए AI सहायक का उपयोग करें।",
    resetFilters: "खोज फ़िल्टर रीसेट करें",
    footerDesc: "भारत का पहला AI-संचालित वास्तविक समय रक्त आपूर्ति श्रृंखला नेटवर्क। सटीक रसद के माध्यम से जीवन को जोड़ना।",
    contact: "संपर्क",
    email: "ईमेल",
    platform: "प्लेटफॉर्म",
    inventoryMap: "इन्वेंटरी मैप",
    aiForecasting: "AI पूर्वानुमान",
    facilityPortal: "सुविधा पोर्टल",
    legal: "कानूनी",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें",
    compliance: "अनुपालन",
    copyright: "© 2024 वाइटलफ्लो हेल्थकेयर। सर्वाधिकार सुरक्षित।",
    systemStatus: "सिस्टम स्थिति",
    stable: "स्थिर",
    logout: "लॉगआउट",
    userDashboard: "उपयोगकर्ता डैशबोर्ड",
    welcomeBack: "वापसी पर स्वागत है",
    accountId: "खाता आईडी",
    totalPurchases: "कुल खरीदारी",
    reservations: "आरक्षण",
    totalSpend: "कुल खर्च",
    activeRequestStatus: "सक्रिय अनुरोध स्थिति",
    requestDetails: "अनुरोध विवरण",
    facility: "सुविधा",
    method: "तरीका",
    destination: "गंतव्य",
    activityHistory: "गतिविधि इतिहास",
    downloadReport: "रिपोर्ट डाउनलोड करें",
    date: "तारीख",
    activity: "गतिविधि",
    noActivity: "कोई गतिविधि इतिहास नहीं मिला।",
    commandCenter: "कमांड सेंटर",
    liveTelemetry: "लाइव नेटवर्क टेलीमेट्री",
    networkHealth: "नेटवर्क स्वास्थ्य",
    activeNodes: "सक्रिय नोड्स",
    regionalDemandMatrix: "क्षेत्रीय मांग मैट्रिक्स",
    livePrediction: "लाइव भविष्यवाणी",
    anomalies: "विसंगतियां",
    integrityIndex: "अखंडता सूचकांक",
    perishableAlerts: "नाशवान अलर्ट",
    riskIndex: "जोखिम सूचकांक",
    redistributionRequired: "पुनर्वितरण आवश्यक",
    draftTransfer: "ड्राफ्ट स्थानांतरण",
    redistributionRoutes: "पुनर्वಿತरण मार्ग",
    executeProtocol: "प्रोटोकॉल निष्पादित करें",
    networkSecured: "नेटवर्क सुरक्षित",
    noHighRisk: "ग्रिड में कोई उच्च जोखिम वाली नाशवान संपत्ति नहीं मिली।",
    model01: "मॉडल 01: LSTM अनुमान",
    model02: "मॉडल 02: जोखिम स्कैन",
    model04: "मॉडल 04: विसंगति का पता लगाना",
    model05: "मॉडल 05: अनुकूलन",
    exactMatch: "सटीक मिलान",
    compatible: "संगत",
    risk: "जोखिम",
    units: "इकाइयाँ",
    reserve: "आरक्षण",
    neuralMatch: "न्यूरल मैच",
    latency: "विलंबता",
    actionableTips: "कार्रवाई योग्य सुझाव",
    localSector: "स्थानीय क्षेत्र",
    locationDetected: "स्थान का पता चला",
    street: "सड़क",
    area: "क्षेत्र",
    state: "राज्य",
    postcode: "पिनकोड",
    facilitiesIn: "सभी सुविधाएं",
    clinicalIntelligenceNode: "क्लिनिकल इंटेलिजेंस नोड",
    clinicalHeroSubtitle: "सटीक आधान निर्णयों और जोखिम शमन के लिए वास्तविक समय के रोगी डेटा को संसाधित करने वाले उन्नत तंत्रिका नेटवर्क।",
    decisionSupport: "निर्णय समर्थन",
    nationwidePresence: "राष्ट्रव्यापी उपस्थिति",
    ensuringAccessibility: "पूरे भारत में पहुंच सुनिश्चित करना।",
    connectedNetwork: "हर राज्य और जिले में सेवारत ब्लड सेंटर का एक जुड़ा हुआ नेटवर्क",
    selectState: "राज्य चुनें",
    totalDonorRegistration: "कुल डोनर पंजीकरण",
    totalBloodCenters: "कुल ब्लड सेंटर",
    totalUpcomingCamps: "कुल आगामी कैंप",
    campsOrganised: "आयोजित कैंप",
    dataCollectedPost: "*प्रतिनिधित्व किया गया डेटा वर्ष 2017 के बाद से एकत्र किया गया है।",
    downloadApp: "हमारा ऐप डाउनलोड करें",
    findBloodBank: "ब्लड बैंक खोजें",
    bloodAvailability: "रक्त की उपलब्धता",
    campSchedule: "कैंप शेड्यूल",
    donorLogin: "डोनर लॉगिन",
    aboutVitalFlow: "वाइटलफ्लो AI के बारे में",
    bloodDonationFacts: "रक्तदान के तथ्य",
    fact1: "रक्त की 1 इकाई 3 लोगों तक की जान बचा सकती है।",
    fact2: "भारत में हर 2 सेकंड में किसी को रक्त की आवश्यकता होती है।",
    fact3: "रक्त का निर्माण नहीं किया जा सकता; यह केवल उदार दाताओं से ही मिल सकता है।",
    fact4: "रक्तदान आपके स्वास्थ्य के लिए अच्छा है और हृदय रोग के जोखिम को कम करता है।",
    donationProcess: "रक्तदान की प्रक्रिया",
    step1Title: "पंजीकरण",
    step1Desc: "अपने बुनियादी विवरण और चिकित्सा इतिहास के साथ एक सरल फॉर्म भरें।",
    step2Title: "दान",
    step2Desc: "एक त्वरित और सुरक्षित प्रक्रिया जहां लगभग 350-450 मिलीलीटर रक्त एकत्र किया जाता है।",
    step3Title: "जलपान",
    step3Desc: "कुछ मिनट आराम करें और कुछ स्नैक्स और तरल पदार्थों का आनंद लें।",
    slogan1: "रक्तदान करें, जीवन बचाएं।",
    slogan2: "आपका रक्त अनमोल है, इसे साझा करें।",
    slogan3: "हीरो बनें, आज ही रक्तदान करें।",
    emergencyMode: "आपातकालीन मोड",
    criticalRequirement: "महत्वपूर्ण आवश्यकता",
    emergencyContact: "आपातकालीन संपर्क",
    contactName: "संपर्क का नाम",
    phoneNumber: "फ़ोन नंबर",
    save: "सहेजें",
    nearbyFacilities: "आस-पास की सुविधाएं",
    detectedLocation: "पता लगाया गया स्थान",
    hospitalDashboard: "अस्पताल डैशबोर्ड",
    driverDashboard: "ड्राइवर डैशबोर्ड",
    activeDeliveries: "सक्रिय वितरण",
    pendingRequests: "लंबित अनुरोध",
    completedDeliveries: "पूरा वितरण",
    routeOptimization: "मार्ग अनुकूलन",
    vehicleStatus: "वाहन की स्थिति",
    currentLocation: "वर्तमान स्थान",
    destinationAddress: "गंतव्य का पता",
    user: "उपयोगकर्ता",
    driver: "ड्राइवर",
    hospital: "अस्पताल",
    admin: "एडमिन",
  },
  kn: {
    title: "ವೈಟಲ್ ಫ್ಲೋ AI",
    home: "ಮುಖಪುಟ",
    subtitle: "ನಿಖರ ರಕ್ತ ಪೂರೈಕೆ ಬುದ್ಧಿವಂತಿಕೆ",
    inventory: "ದಾಸ್ತಾನು",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    analytics: "ಅನಾಲಿಟಿಕ್ಸ್",
    assistant: "ಕ್ಲಿನಿಕಲ್ AI",
    login: "ಲಾಗಿನ್",
    adminAccess: "ನಿರ್ವಾಹಕ ಪ್ರವೇಶ",
    sos: "SOS ತುರ್ತು",
    searchPlaceholder: "ನಗರ ಹುಡುಕಿ...",
    bloodGroup: "ರಕ್ತದ ಗುಂಪು",
    component: "ಘಟಕ",
    location: "ಸ್ಥಳ",
    components: "ಘಟಕಗಳು",
    selected: "ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ",
    selectComponents: "ಘಟಕಗಳನ್ನು ಆರಿಸಿ",
    scanning: "ಸ್ಕ್ಯಾನಿಂಗ್...",
    scanNetwork: "ನೆಟ್‌ವರ್ಕ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    networkStatus: "ನೆಟ್‌ವರ್ಕ್ ಸ್ಥಿತಿ",
    operational: "ಕಾರ್ಯಾಚರಣೆಯಲ್ಲಿದೆ",
    precision: "ನಿಖರತೆ",
    bloodSupply: "ರಕ್ತದ ಪೂರೈಕೆ",
    intelligence: "ಬುದ್ಧಿವಂತಿಕೆ",
    heroSubtitle: "ವೈಟಲ್ ಫ್ಲೋ AI ನೈಜ-ಸಮಯದ ಟೆಲಿಮೆಟ್ರಿ ಮತ್ತು ಮುನ್ಸೂಚಕ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಬಳಸಿಕೊಂಡು ರಾಷ್ಟ್ರೀಯ ರಕ್ತ ಪೂರೈಕೆ ಸರಪಳಿಯನ್ನು ಉತ್ತಮಗೊಳಿಸುತ್ತದೆ.",
    facilities: "ಸೌಲಭ್ಯಗಳು",
    connectedToGrid: "ಗ್ರಿಡ್‌ಗೆ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ",
    emergencyProtocol: "ತುರ್ತು ಪ್ರೋಟೋಕಾಲ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    activeIn: "ಸಕ್ರಿಯವಾಗಿದೆ",
    connectingHospitals: "ಆಸ್ಪತ್ರೆಗಳನ್ನು ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ",
    doNotClose: "ಈ ವಿಂಡೋವನ್ನು ಮುಚ್ಚಬೇಡಿ",
    sosStep1: "ನಿಖರವಾದ ಸ್ಥಳ ಟೆಲಿಮೆಟ್ರಿಯನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ...",
    sosStep2: "ಹತ್ತಿರದ ನಿರ್ಣಾಯಕ ಆರೈಕೆ ಸೌಲಬ್ಯಗಳನ್ನು ಗುರುತಿಸುವುದು...",
    sosStep3: "ಆದ್ಯತೆಯ ಸಂವಹನ ಲಿಂಕ್ ಅನ್ನು ಸ್ಥಾಪಿಸುವುದು...",
    sosStep4: "ತುರ್ತು ರಕ್ತದ ಅವಶ್ಯಕತೆಯನ್ನು ಪ್ರಸಾರ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    broadcastingTo: "ಎಲ್ಲಾ ನೆಟ್‌ವರ್ಕ್ ಆಸ್ಪತ್ರೆಗಳಿಗೆ ನಿರ್ಣಾಯಕ ಅವಶ್ಯಕತೆಯನ್ನು ಪ್ರಸಾರ ಮಾಡಲಾಗುತ್ತಿದೆ",
    andSurrounding: "ಮತ್ತು ಸುತ್ತಮುತ್ತಲಿನ ಪ್ರದೇಶಗಳು",
    calling: "ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ",
    connecting: "ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ",
    alertSent: "ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಲಾಗಿದೆ",
    cancelProtocol: "ಪ್ರೋಟೋಕಾಲ್ ರದ್ದುಗೊಳಿಸಿ",
    administrator: "ನಿರ್ವಾಹಕರು",
    verifiedUser: "ಪರಿಶೀಲಿಸಿದ ಬಳಕೆದಾರ",
    adminPortal: "ನಿರ್ವಾಹಕ ಪೋರ್ಟಲ್",
    secureLogin: "ಸುರಕ್ಷಿತ ಲಾಗಿನ್",
    authenticateAccess: "ಪ್ರವೇಶವನ್ನು ದೃಢೀಕರಿಸಿ",
    returnToSearch: "ಹುಡುಕಾಟಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    live: "ಲೈವ್",
    nationalBioGrid: "ರಾಷ್ಟರೆಯ ಬಯೋ-ಗ್ರಿಡ್",
    active: "ಸಕ್ರಿಯ",
    activeRequestTelemetry: "ಸಕ್ರಿಯ ವಿನಂತಿ ಟೆಲಿಮೆಟ್ರಿ",
    liveTracking: "ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್",
    transfer: "ವರ್ಗಾವಣೆ",
    pickup: "ಪಿಕಪ್",
    liveNetwork: "ಲೈವ್ ನೆಟ್‌ವರ್ಕ್",
    sync: "ಸಿಂಕ್",
    sector: "ವಲಯ",
    availableInventory: "ಲಭ್ಯವಿರುವ ದಾಸ್ತಾನು",
    totalUnits: "ಒಟ್ಟು ಘಟಕಗಳು",
    networkOverflow: "ನೆಟ್‌ವರ್ಕ್ ಓವರ್‌ಫ್ಲೋ (ಇತರ ನಗರಗಳು)",
    noMatchesTitle: "ಗ್ರಿಡ್‌ನಲ್ಲಿ ಯಾವುದೇ ಹೊಂದಾಣಿಕೆಗಳಿಲ್ಲ",
    noMatchesDesc: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ನಿಖರ ಅಥವಾ ಹೊಂದಾಣಿಕೆಯ ರಕ್ತದ ಆಸ್ತಿಗಳನ್ನು ಕಂಡುಹಿಡಿಯಲು ನಮಗೆ ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ನಮ್ಮ ನೆಟ್‌ವರ್ಕ್ ನಿರಂತರವಾಗಿ ಸಿಂಕ್ ಆಗುತ್ತಿದೆ, ಆದ್ದರಿಂದ ಶೀಘ್ರದಲ್ಲೇ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ.",
    tip1: "ವಿಶಾಲವಾದ ಸ್ಥಳ ಅಥವಾ ನಗರವನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಪ್ರಯತ್ನಿಸಿ.",
    tip2: "ಹೊಂದಾಣಿಕೆಯ ರಕ್ತದ ಗುಂಪುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ (ಉದಾಹರಣೆಗೆ, O- ಸಾರ್ವತ್ರಿಕವಾಗಿದೆ).",
    tip3: "ನಿಮ್ಮ ಘಟಕ ಫಿಲ್ಟರ್‌ಗಳು ಹೆಚ್ಚು ನಿರ್ಬಂಧಿತವಾಗಿಲ್ಲ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.",
    tip4: "ಸಂಕೀರ್ಣ ಹೊಂದಾಣಿಕೆಯ ವಿನಂತಿಗಳಿಗಾಗಿ AI ಸಹಾಯಕವನ್ನು ಬಳಸಿ.",
    resetFilters: "ಹುಡುಕಾಟ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಮರುಹೊಂದಿಸಿ",
    footerDesc: "ಭಾರತದ ಮೊದಲ AI-ಚಾಲಿತ ನೈಜ-ಸಮಯದ ರಕ್ತ ಪೂರೈಕೆ ಸರಪಳಿ ನೆಟ್‌ವರ್ಕ್. ನಿಖರ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಮೂಲಕ ಜೀವನವನ್ನು ಸಂಪರ್ಕಿಸುವುದು.",
    contact: "ಸಂಪರ್ಕಿಸಿ",
    email: "ಇಮೇಲ್",
    platform: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
    inventoryMap: "ದಾಸ್ತಾನು ನಕ್ಷೆ",
    aiForecasting: "AI ಮುನ್ಸೂಚನೆ",
    facilityPortal: "ಸೌಲಭ್ಯ ಪೋರ್ಟಲ್",
    legal: "ಕಾನೂನು",
    privacyPolicy: "ಗೌಪ್ಯತಾ ನೀತಿ",
    termsOfService: "ಸೇವಾ ನಿಯಮಗಳು",
    compliance: "ಅನುಸರಣೆ",
    copyright: "© 2024 ವೈಟಲ್ ಫ್ಲೋ ಹೆಲ್ತ್‌ಕೇರ್. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    systemStatus: "ಸಿಸ್ಟಮ್ ಸ್ಥಿತಿ",
    stable: "ಸ್ಥಿರ",
    logout: "ಲಾಗ್ ಔಟ್",
    userDashboard: "ಬಳಕೆದಾರರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    welcomeBack: "ಮರಳಿ ಸ್ವಾಗತ",
    accountId: "ಖಾತೆ ಐಡಿ",
    totalPurchases: "ಒಟ್ಟು ಖರೀದಿಗಳು",
    reservations: "ಕಾಯ್ದಿರಿಸುವಿಕೆಗಳು",
    totalSpend: "ಒಟ್ಟು ವೆಚ್ಚ",
    activeRequestStatus: "ಸಕ್ರಿಯ ವಿನಂತಿ ಸ್ಥಿತಿ",
    requestDetails: "ವಿನಂತಿ ವಿವರಗಳು",
    facility: "ಸೌಲಭ್ಯ",
    method: "ವಿಧಾನ",
    destination: "ಗಮ್ಯಸ್ಥಾನ",
    activityHistory: "ಚಟುವಟಿಕೆ ಇತಿಹಾಸ",
    downloadReport: "ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    date: "ದಿನಾಂಕ",
    activity: "ಚಟುವಟಿಕೆ",
    noActivity: "ಯಾವುದೇ ಚಟುವಟಿಕೆ ಇತಿಹಾಸ ಕಂಡುಬಂದಿಲ್ಲ.",
    commandCenter: "ಕಮಾಂಡ್ ಸೆಂಟರ್",
    liveTelemetry: "ಲೈವ್ ನೆಟ್‌ವರ್ಕ್ ಟೆಲಿಮೆಟ್ರಿ",
    networkHealth: "ನೆಟ್‌ವರ್ಕ್ ಆರೋಗ್ಯ",
    activeNodes: "ಸಕ್ರಿಯ ನೋಡ್‌ಗಳು",
    regionalDemandMatrix: "ಪ್ರಾದೇಶಿಕ ಬೇಡಿಕೆ ಮ್ಯಾಟ್ರಿಕ್ಸ್",
    livePrediction: "ಲೈವ್ ಭವಿಷ್ಯ",
    anomalies: "ವೈಪರೀತ್ಯಗಳು",
    integrityIndex: "ಸಮಗ್ರತೆಯ ಸೂಚ್ಯಂಕ",
    perishableAlerts: "ಬೇಗನೆ ಹಾಳಾಗುವ ಎಚ್ಚರಿಕೆಗಳು",
    riskIndex: "ಅಪಾಯದ ಸೂಚ್ಯಂಕ",
    redistributionRequired: "ಮರುಹಂಚಿಕೆ ಅಗತ್ಯವಿದೆ",
    draftTransfer: "ಕರಡು ವರ್ಗಾವಣೆ",
    redistributionRoutes: "ಮರುಹಂಚಿಕೆ ಮಾರ್ಗಗಳು",
    executeProtocol: "ಪ್ರೋಟೋಕಾಲ್ ಕಾರ್ಯಗತಗೊಳಿಸಿ",
    networkSecured: "ನೆಟ್‌ವರ್ಕ್ ಸುರಕ್ಷಿತವಾಗಿದೆ",
    noHighRisk: "ಗ್ರಿಡ್‌ನಾದ್ಯಂತ ಯಾವುದೇ ಹೆಚ್ಚಿನ ಅಪಾಯದ ಬೇಗನೆ ಹಾಳಾಗುವ ಆಸ್ತಿಗಳು ಪತ್ತೆಯಾಗಿಲ್ಲ.",
    model01: "ಮಾದರಿ 01: LSTM ಪ್ರಕ್ಷೇಪಗಳು",
    model02: "ಮಾದರಿ 02: ಅಪಾಯದ ಸ್ಕ್ಯಾನ್",
    model04: "ಮಾದರಿ 04: ವೈಪರೀತ್ಯ ಪತ್ತೆ",
    model05: "ಮಾದರಿ 05: ಆಪ್ಟಿಮೈಸೇಶನ್",
    exactMatch: "ನಿಖರ ಹೊಂದಾಣಿಕೆ",
    compatible: "ಹೊಂದಾಣಿಕೆಯಾಗುವ",
    risk: "ಅಪಾಯ",
    units: "ಘಟಕಗಳು",
    reserve: "ಕಾಯ್ದಿರಿಸಿ",
    neuralMatch: "ನ್ಯೂರಲ್ ಮ್ಯಾಚ್",
    latency: "ವಿಳಂಬ",
    actionableTips: "ಕಾರ್ಯಗತಗೊಳಿಸಬಹುದಾದ ಸಲಹೆಗಳು",
    localSector: "ಸ್ಥಳೀಯ ವಲಯ",
    locationDetected: "ಸ್ಥಳ ಪತ್ತೆಯಾಗಿದೆ",
    street: "ಬೀದಿ",
    area: "ಪ್ರದೇಶ",
    state: "ರಾಜ್ಯ",
    postcode: "ಪಿನ್ ಕೋಡ್",
    facilitiesIn: "ಎಲ್ಲಾ ಸೌಲಭ್ಯಗಳು",
    clinicalIntelligenceNode: "ಕ್ಲಿನಿಕಲ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ನೋಡ್",
    clinicalHeroSubtitle: "ನಿಖರವಾದ ರಕ್ತ ವರ್ಗಾವಣೆ ನಿರ್ಧಾರಗಳು ಮತ್ತು ಅಪಾಯ ತಗ್ಗಿಸುವಿಕೆಗಾಗಿ ನೈಜ-ಸಮಯದ ರೋಗಿಗಳ ಡೇಟಾವನ್ನು ಸಂಸ್ಕರಿಸುವ ಸುಧಾರಿತ ನರಮಂಡಲಗಳು.",
    decisionSupport: "ನಿರ್ಧಾರ ಬೆಂಬಲ",
    nationwidePresence: "ದೇಶಾದ್ಯಂತ ಉಪಸ್ಥಿತಿ",
    ensuringAccessibility: "ಭಾರತದಾದ್ಯಂತ ಪ್ರವೇಶವನ್ನು ಖಚಿತಪಡಿಸುವುದು.",
    connectedNetwork: "ಪ್ರತಿ ರಾಜ್ಯ ಮತ್ತು ಜಿಲ್ಲೆಯಲ್ಲಿ ಸೇವೆ ಸಲ್ಲಿಸುತ್ತಿರುವ ರಕ್ತ ಕೇಂದ್ರಗಳ ಸಂಪರ್ಕಿತ ಜಾಲ",
    selectState: "ರಾಜ್ಯವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ",
    totalDonorRegistration: "ಒಟ್ಟು ದಾನಿಗಳ ನೋಂದಣಿ",
    totalBloodCenters: "ಒಟ್ಟು ರಕ್ತ ಕೇಂದ್ರಗಳು",
    totalUpcomingCamps: "ಒಟ್ಟು ಮುಂಬರುವ ಶಿಬಿರಗಳು",
    campsOrganised: "ಆಯೋಜಿಸಲಾದ ಶಿಬಿರಗಳು",
    dataCollectedPost: "*ಪ್ರತಿನಿಧಿಸಿದ ಡೇಟಾವನ್ನು 2017 ರ ನಂತರ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ.",
    downloadApp: "ನಮ್ಮ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    findBloodBank: "ರಕ್ತ ಬ್ಯಾಂಕ್ ಹುಡುಕಿ",
    bloodAvailability: "ರಕ್ತದ ಲಭ್ಯತೆ",
    campSchedule: "ಶಿಬಿರದ ವೇಳಾಪಟ್ಟಿ",
    donorLogin: "ದಾನಿಗಳ ಲಾಗಿನ್",
    aboutVitalFlow: "ವೈಟಲ್ ಫ್ಲೋ AI ಬಗ್ಗೆ",
    bloodDonationFacts: "ರಕ್ತದಾನದ ಸತ್ಯಗಳು",
    fact1: "1 ಯುನಿಟ್ ರಕ್ತವು 3 ಜೀವಗಳನ್ನು ಉಳಿಸಬಹುದು.",
    fact2: "ಭಾರತದಲ್ಲಿ ಪ್ರತಿ 2 ಸೆಕೆಂಡಿಗೆ ಯಾರಿಗಾದರೂ ರಕ್ತದ ಅವಶ್ಯಕತೆ ಇರುತ್ತದೆ.",
    fact3: "ರಕ್ತವನ್ನು ತಯಾರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ; ಇದು ಕೇವಲ ಉದಾರ ದಾನಿಗಳಿಂದ ಮಾತ್ರ ಬರಲು ಸಾಧ್ಯ.",
    fact4: "ರಕ್ತದಾನ ಮಾಡುವುದು ನಿಮ್ಮ ಆರೋಗ್ಯಕ್ಕೆ ಒಳ್ಳೆಯದು ಮತ್ತು ಹೃದ್ರೋಗದ ಅಪಾಯವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.",
    donationProcess: "ರಕ್ತದಾನ ಪ್ರಕ್ರಿಯೆ",
    step1Title: "ನೋಂದಣಿ",
    step1Desc: "ನಿಮ್ಮ ಮೂಲ ವಿವರಗಳು ಮತ್ತು ವೈದ್ಯಕೀಯ ಇತಿಹಾಸದೊಂದಿಗೆ ಸರಳ ಫಾರ್ಮ್ ಅನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
    step2Title: "ದಾನ",
    step2Desc: "ಸುಮಾರು 350-450 ಮಿಲಿ ರಕ್ತವನ್ನು ಸಂಗ್ರಹಿಸುವ ತ್ವರಿತ ಮತ್ತು ಸುರಕ್ಷಿತ ಪ್ರಕ್ರಿಯೆ.",
    step3Title: "ಉಪಾಹಾರ",
    step3Desc: "ಕೆಲವು ನಿಮಿಷಗಳ ಕಾಲ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ ಮತ್ತು ಕೆಲವು ತಿಂಡಿಗಳು ಮತ್ತು ಪಾನೀಯಗಳನ್ನು ಸೇವಿಸಿ.",
    slogan1: "ರಕ್ತದಾನ ಮಾಡಿ, ಜೀವ ಉಳಿಸಿ.",
    slogan2: "ನಿಮ್ಮ ರಕ್ತ ಅಮೂಲ್ಯವಾದುದು, ಅದನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.",
    slogan3: "ಹೀರೋ ಆಗಿ, ಇಂದು ರಕ್ತದಾನ ಮಾಡಿ.",
    emergencyMode: "ತುರ್ತು ಮೋಡ್",
    criticalRequirement: "ನಿರ್ಣಾಯಕ ಅವಶ್ಯಕತೆ",
    emergencyContact: "ತುರ್ತು ಸಂಪರ್ಕ",
    contactName: "ಸಂಪರ್ಕದ ಹೆಸರು",
    phoneNumber: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
    save: "ಉಳಿಸಿ",
    nearbyFacilities: "ಹತ್ತಿರದ ಸೌಲಭ್ಯಗಳು",
    detectedLocation: "ಪತ್ತೆಯಾದ ಸ್ಥಳ",
    hospitalDashboard: "ಆಸ್ಪತ್ರೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    driverDashboard: "ಚಾಲಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    activeDeliveries: "ಸಕ್ರಿಯ ವಿತರಣೆಗಳು",
    pendingRequests: "ಬಾಕಿ ಇರುವ ವಿನಂತಿಗಳು",
    completedDeliveries: "ಪೂರ್ಣಗೊಂಡ ವಿತರಣೆಗಳು",
    routeOptimization: "ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸೇಶನ್",
    vehicleStatus: "ವಾಹನದ ಸ್ಥಿತಿ",
    currentLocation: "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
    destinationAddress: "ಗಮ್ಯಸ್ಥಾನ ವಿಳಾಸ",
    user: "ಬಳಕೆದಾರ",
    driver: "ಚಾಲಕ",
    hospital: "ಆಸ್ಪತ್ರೆ",
    admin: "ನಿರ್ವಾಹಕ",
  }
};
