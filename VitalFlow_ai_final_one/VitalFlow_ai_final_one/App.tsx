
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import InventoryCard from './components/InventoryCard';
import AdminDashboard from './components/AdminDashboard';
import ReservationModal from './components/ReservationModal';
import ClinicalAssistant from './components/ClinicalAssistant';
import EmptyState from './components/EmptyState';
import Login from './components/Login';
import ClinicalAIPage from './components/ClinicalAIPage';
import Dashboard from './components/Dashboard';
import { BloodRequestTracker } from './components/BloodRequestTracker';
import HomePage from './components/HomePage';
import InventoryPage from './components/InventoryPage';
import { UserRole, BloodGroup, ComponentType, InventoryItem, BloodRequest, BloodRequestStatus, DeliveryMethod, User, EmergencyEvent } from './types';
import { INITIAL_INVENTORY, CITIES, CITIES_DATA, INDIAN_STATES } from './constants';
import { translations, Language } from './translations';
import { API_ENDPOINTS, apiCall } from './config';

// Lazy load heavy dashboard components
const HospitalDashboard = React.lazy(() => import('./components/HospitalDashboard'));
const DriverDashboard = React.lazy(() => import('./components/DriverDashboard'));
const LocalSectorPage = React.lazy(() => import('./components/LocalSectorPage'));
const AuditDashboard = React.lazy(() => import('./components/AuditDashboard'));

type AppView = 'home' | 'search' | 'analytics' | 'assistant' | 'dashboard' | 'local-sector' | 'hospital-dashboard' | 'driver-dashboard' | 'audit';

const getNearestCity = (lat: number, lng: number): string => {
  let minDistance = Infinity;
  let nearestCity = CITIES[0];

  CITIES_DATA.forEach(city => {
    const distance = Math.sqrt(Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city.name;
    }
  });

  return nearestCity;
};

// Compatibility Matrix for Smart Search Fallback
const COMPATIBILITY: Record<string, string[]> = {
  [BloodGroup.OPos]: [BloodGroup.OPos, BloodGroup.ONeg],
  [BloodGroup.ONeg]: [BloodGroup.ONeg],
  [BloodGroup.APos]: [BloodGroup.APos, BloodGroup.ANeg, BloodGroup.OPos, BloodGroup.ONeg],
  [BloodGroup.ANeg]: [BloodGroup.ANeg, BloodGroup.ONeg],
  [BloodGroup.BPos]: [BloodGroup.BPos, BloodGroup.BNeg, BloodGroup.OPos, BloodGroup.ONeg],
  [BloodGroup.BNeg]: [BloodGroup.BNeg, BloodGroup.ONeg],
  [BloodGroup.ABPos]: Object.values(BloodGroup),
  [BloodGroup.ABNeg]: [BloodGroup.ABNeg, BloodGroup.ANeg, BloodGroup.BNeg, BloodGroup.ONeg],
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.Patient);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginInitialMode, setLoginInitialMode] = useState<'patient' | 'admin'>('patient');
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  const [searchCity, setSearchCity] = useState('Mumbai');
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>(BloodGroup.OPos);
  const [filterComponents, setFilterComponents] = useState<string[]>([ComponentType.WholeBlood, ComponentType.Plasma, ComponentType.PRBC, ComponentType.PlateletConcentrate, ComponentType.WBC]);
  const [filterUnits, setFilterUnits] = useState<number>(1);
  
  const [resultsCity, setResultsCity] = useState('Mumbai');
  const [resultsBloodGroup, setResultsBloodGroup] = useState<string>(BloodGroup.OPos);
  const [resultsComponents, setResultsComponents] = useState<string[]>([
    ComponentType.WholeBlood, 
    ComponentType.Plasma, 
    ComponentType.PRBC, 
    ComponentType.PlateletConcentrate,
    ComponentType.WBC
  ]);
  const [resultsUnits, setResultsUnits] = useState<number>(1);

  const [activeInventory, setActiveInventory] = useState<InventoryItem[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [reservingItem, setReservingItem] = useState<InventoryItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [syncSeconds, setSyncSeconds] = useState(8);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [activeSOS, setActiveSOS] = useState<{ city: string, bloodGroup: string } | null>(null);
  const [emergencyEvents, setEmergencyEvents] = useState<EmergencyEvent[]>([]);
  const [nearestBankResults, setNearestBankResults] = useState<InventoryItem[]>([]);
  const [availabilityHeatmap, setAvailabilityHeatmap] = useState<InventoryItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [activeRequest, setActiveRequest] = useState<{
    status: BloodRequestStatus;
    deliveryMethod: DeliveryMethod;
    deliveryAddress?: string;
    facilityName: string;
  } | null>(null);

  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [detectedAddress, setDetectedAddress] = useState<string | null>(null);
  const [locationDetails, setLocationDetails] = useState<{
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    postcode?: string;
  } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [selectedState, setSelectedState] = useState('Rajasthan');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showCampModal, setShowCampModal] = useState(false);

  const searchRef = React.useRef<HTMLDivElement>(null);
  const inventoryRef = React.useRef<HTMLDivElement>(null);

  const t = translations[language];

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920",
      title: t.precision,
      subtitle: t.bloodSupply,
      description: t.heroSubtitle,
      slogan: t.slogan1,
      color: "from-red-950/90 via-red-900/40 to-slate-950"
    },
    {
      image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1920",
      title: t.connectedNetwork,
      subtitle: t.nationwidePresence,
      description: t.ensuringAccessibility,
      slogan: t.slogan2,
      color: "from-maroon-950/90 via-maroon-900/40 to-slate-950"
    },
    {
      image: "https://images.unsplash.com/photo-1579154273821-0a6980f94631?auto=format&fit=crop&q=80&w=1920",
      title: t.emergencyMode,
      subtitle: t.criticalRequirement,
      description: t.heroSubtitle,
      slogan: t.slogan3,
      color: "from-slate-950/90 via-slate-900/40 to-slate-950"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // Automatically detect location on mount
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using Nominatim with high zoom for street-level detail
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          const address = data.display_name;
          const addr = data.address;
          
          const city = addr.city || addr.town || addr.village || addr.state_district || addr.county;
          const area = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict;
          const street = addr.road || addr.pedestrian || addr.path;
          const state = addr.state;
          const postcode = addr.postcode;
          
          setDetectedAddress(address);
          setLocationDetails({
            street,
            area,
            city,
            state,
            postcode
          });

          if (city) {
            // If the city is in our list, select it
            if (CITIES.includes(city)) {
              setSearchCity(city);
              setResultsCity(city);
            } else {
              // Otherwise, find the nearest city from our database but keep the detected city name for display
              const nearest = getNearestCity(latitude, longitude);
              setSearchCity(nearest);
              setResultsCity(nearest);
            }
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          const nearest = getNearestCity(latitude, longitude);
          setSearchCity(nearest);
          setResultsCity(nearest);
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetectingLocation(false);
        alert("Unable to retrieve your location. Please check your browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-US';
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchCity(transcript);
      // Try to match with existing cities
      const matchedCity = CITIES.find(c => c.toLowerCase() === transcript.toLowerCase());
      if (matchedCity) {
        setSearchCity(matchedCity);
      }
    };
  };

  const fetchInventory = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.INVENTORY, {
        headers: {
          'x-user-id': currentUser?.id || 'anonymous',
          'x-user-role': currentUser?.role || UserRole.Patient
        }
      });
      const inventory = Array.isArray(data) ? data : (data as any).results || [];
      setActiveInventory(inventory);
      setLastUpdated(new Date().toLocaleTimeString());

      // Keep availability map in sync
      setAvailabilityHeatmap(inventory);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  };

  const fetchAvailabilityMap = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.AVAILABILITY_MAP);
      setAvailabilityHeatmap(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch availability map data:', error);
    }
  };

  const findNearestBank = async (latitude: number, longitude: number, bloodGroup: BloodGroup, componentType: ComponentType, units: number) => {
    try {
      const data = await apiCall(API_ENDPOINTS.NEAREST_BANK, {
        method: 'POST',
        body: JSON.stringify({ lat: latitude, lng: longitude, bloodGroup, componentType, units }),
      });

      const primary = Array.isArray(data?.primary) ? data.primary : [];
      const fallback = Array.isArray(data?.fallback) ? data.fallback : [];
      setNearestBankResults([...primary, ...fallback.slice(0, 3)]);
    } catch (error) {
      console.error('Failed to query nearest blood bank:', error);
      setNearestBankResults([]);
    }
  };

  const sendEmergencyAlert = async (city: string, bloodGroup: string, severity: 'critical' | 'high' | 'medium' | 'low' = 'critical', details = 'Urgent requirement') => {
    try {
      const data = await apiCall(API_ENDPOINTS.EMERGENCY_ALERT, {
        method: 'POST',
        body: JSON.stringify({ city, bloodGroup, severity, details }),
      });

      if (data?.event) {
        setEmergencyEvents(prev => [data.event, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchAvailabilityMap();
    // WebSocket Setup
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onopen = () => console.log('Connected to SOS Network');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'SOS_BROADCAST') {
        const { city, bloodGroup } = data.payload;
        setActiveSOS({ city, bloodGroup });
        // Auto-clear after 30 seconds
        setTimeout(() => setActiveSOS(null), 30000);
      } else if (data.type === 'EMERGENCY_ALERT') {
        const eventData = data.payload as EmergencyEvent;
        setEmergencyEvents(prev => [eventData, ...prev].slice(0, 10));
        setActiveSOS({ city: eventData.city, bloodGroup: eventData.bloodGroup });
        setTimeout(() => setActiveSOS(null), 30000);
      } else if (data.type === 'INVENTORY_UPDATE') {
        console.log('Live Inventory Update Received');
        setActiveInventory(data.payload);
        setAvailabilityHeatmap(data.payload);
        setLastUpdated(new Date().toLocaleTimeString());
      } else if (data.type === 'REQUEST_STATUS_UPDATE') {
        const { requestId, status } = data.payload;
        setBloodRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status } : req
        ));
      }
    };
    
    setSocket(ws);
    return () => ws.close();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncSeconds(prev => (prev <= 1 ? 15 : prev - 1));
    }, 1000);

    // Geofencing: Auto-detect location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nearest = getNearestCity(latitude, longitude);
          setSearchCity(nearest);
          setResultsCity(nearest);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        }
      );
    }

    return () => clearInterval(interval);
  }, []);

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const { cityResults, otherCityResults, allCityFacilities } = useMemo(() => {
    // TIER 1: Exact Matches (Same City)
    const exactMatches = activeInventory.filter(item => {
      return item.city === resultsCity && 
             item.bloodGroup === resultsBloodGroup && 
             resultsComponents.includes(item.componentType) &&
             item.units >= resultsUnits;
    });

    // TIER 2: Biological Compatibility (Same City)
    const compatibleGroups = COMPATIBILITY[resultsBloodGroup as BloodGroup] || [resultsBloodGroup];
    const cityCompatible = activeInventory.filter(item => {
      return item.city === resultsCity && 
             resultsComponents.includes(item.componentType) &&
             item.units >= resultsUnits &&
             compatibleGroups.includes(item.bloodGroup) &&
             !exactMatches.find(em => em.id === item.id);
    });

    const cityResults = [...exactMatches, ...cityCompatible];

    // ALL Facilities in the selected city (Unique names)
    const allCityFacilities = Array.from(new Set(
      activeInventory
        .filter(item => item.city === resultsCity)
        .map(item => item.facilityName)
    )).map(name => {
      return activeInventory.find(item => item.city === resultsCity && item.facilityName === name)!;
    });

    // TIER 3: Network Overflow (Other Cities - Same or Compatible Type)
    const otherCityResults = activeInventory.filter(item => {
      return item.city !== resultsCity && 
             resultsComponents.includes(item.componentType) &&
             compatibleGroups.includes(item.bloodGroup) &&
             item.units >= resultsUnits
    }).sort((a, b) => a.distanceKm - b.distanceKm); // Nearest first

    return { cityResults, otherCityResults, allCityFacilities };
  }, [activeInventory, resultsCity, resultsBloodGroup, resultsComponents]);

  const totalUnits = useMemo(() => {
    return [...cityResults, ...otherCityResults].reduce((acc, curr) => acc + curr.units, 0);
  }, [cityResults, otherCityResults]);

  const handleGridScan = async () => {
    setIsScanning(true);
    // Fetch fresh data from server to ensure "right time" access
    await fetchInventory();
    await new Promise(r => setTimeout(r, 800));
    setResultsCity(searchCity);
    setResultsBloodGroup(filterBloodGroup);
    setResultsComponents(filterComponents);
    setResultsUnits(filterUnits);
    setIsScanning(false);
  };

  const handleNav = (view: AppView) => {
    if ((view === 'analytics' || view === 'dashboard') && !isAuthenticated) {
      setShowLogin(true);
      return;
    }
    
    // Role-based access check for Analytics
    if (view === 'analytics' && role !== UserRole.SuperAdmin) {
      alert("Access Denied: Only administrators can view analytics.");
      return;
    }

    setActiveView(view);
    setShowLogin(false);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setRole(user.role);
    setIsAuthenticated(true);
    setShowLogin(false);
    
    // Redirect based on role
    if (user.role === UserRole.SuperAdmin) {
      setActiveView('analytics');
    } else if (user.role === UserRole.HospitalAdmin) {
      setActiveView('hospital-dashboard');
    } else if (user.role === UserRole.Driver) {
      setActiveView('driver-dashboard');
    } else {
      setActiveView('dashboard');
    }
  };

  const [isSOSCalling, setIsSOSCalling] = useState(false);
  const [callingHospital, setCallingHospital] = useState<InventoryItem | null>(null);

  const handleEmergencyToggle = () => {
    const nextMode = !emergencyMode;
    setEmergencyMode(nextMode);
    
    // Simulate emergency calling process if activating SOS
    if (nextMode) {
      setIsSOSCalling(true);
      // Simulate calling multiple hospitals
      setTimeout(() => {
        setIsSOSCalling(false);
      }, 8000);
    }

    if (nextMode && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'SOS_TRIGGER',
        payload: {
          city: searchCity,
          bloodGroup: filterBloodGroup,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  return (
    <div className="min-h-screen selection:bg-red-100 selection:text-red-900 relative bg-[#fcfcfc] text-slate-900 overflow-x-hidden">
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1579154273821-0a6980f94631?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-[0.03] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#fff1f1_0%,transparent_50%)] pointer-events-none"></div>
      <Header 
        role={role} 
        onRoleChange={setRole} 
        onHomeClick={() => handleNav('search')}
        emergency={emergencyMode} 
        toggleEmergency={handleEmergencyToggle}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={() => { 
          setIsAuthenticated(false); 
          setCurrentUser(null);
          setRole(UserRole.Patient); 
          setActiveView('search'); 
        }}
        onLoginTrigger={(mode?: 'patient' | 'admin') => {
          setLoginInitialMode(mode || 'patient');
          setShowLogin(true);
        }}
        activeView={activeView}
        onNav={handleNav}
        t={t}
        language={language}
        setLanguage={setLanguage}
      />

      <main className="max-w-[1200px] mx-auto px-6 pt-32 pb-24 relative">
        {/* Active Requests Status Tracker */}
        <AnimatePresence>
          {bloodRequests.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.activeRequestTelemetry}</h3>
                <span className="text-[9px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/30 animate-pulse">{t.liveTracking}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bloodRequests.map((request, i) => (
                  <motion.div 
                    key={request.id || `request-${i}`}
                    layout
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-100">
                      <i className={`fa-solid ${
                        request.status === 'SENT' ? 'fa-paper-plane' :
                        request.status === 'INITIATED' ? 'fa-gears' :
                        request.status === 'IN_TRANSIT' ? 'fa-truck-fast' :
                        request.status === 'REACHED' ? 'fa-location-dot' : 'fa-check-double'
                      } text-lg ${request.status === 'REACHED' ? 'text-emerald-500' : 'text-slate-900'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{request.facilityName}</p>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                          request.status === 'REACHED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {request.units} Units • {request.bloodGroup} {request.componentType}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                              width: request.status === 'SENT' ? '20%' :
                                     request.status === 'INITIATED' ? '40%' :
                                     request.status === 'IN_TRANSIT' ? '70%' : '100%'
                            }}
                            className={`h-full ${request.status === 'REACHED' ? 'bg-emerald-500' : 'bg-red-600'}`}
                          />
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                          {request.deliveryMethod === 'TRANSFER' ? 'Transfer' : 'Pickup'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showLogin ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Login 
                onLoginSuccess={handleLoginSuccess} 
                onCancel={() => setShowLogin(false)} 
                initialMode={loginInitialMode}
                t={t}
              />
            </motion.div>
          ) : activeView === 'home' ? (
            <HomePage 
              t={t}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
              slides={slides}
              onSearchClick={() => setActiveView('search')}
              onInventoryClick={() => setActiveView('search')}
              onCampClick={() => setShowCampModal(true)}
              onAboutClick={() => setShowAboutModal(true)}
              onLoginTrigger={(mode) => {
                setLoginInitialMode(mode);
                setShowLogin(true);
              }}
            />
          ) : activeView === 'search' ? (
            <InventoryPage 
              t={t}
              searchCity={searchCity}
              nearestBankResults={nearestBankResults}
              emergencyEvents={emergencyEvents}
              availabilityHeatmap={availabilityHeatmap}
              findNearestBank={(lat, lng, bloodGroup, componentType, units) => findNearestBank(lat, lng, bloodGroup, componentType, units)}
              sendEmergencyAlert={(city, bloodGroup, severity, details) => sendEmergencyAlert(city, bloodGroup, severity, details)}
              setSearchCity={setSearchCity}
              filterBloodGroup={filterBloodGroup}
              setFilterBloodGroup={setFilterBloodGroup}
              filterComponents={filterComponents}
              setFilterComponents={setFilterComponents}
              filterUnits={filterUnits}
              setFilterUnits={setFilterUnits}
              isScanning={isScanning}
              resultsCity={resultsCity}
              resultsBloodGroup={resultsBloodGroup}
              resultsComponents={resultsComponents}
              cityResults={cityResults}
              otherCityResults={otherCityResults}
              allCityFacilities={allCityFacilities}
              totalUnits={totalUnits}
              lastUpdated={lastUpdated}
              isDetectingLocation={isDetectingLocation}
              detectLocation={detectLocation}
              handleGridScan={handleGridScan}
              setReservingItem={setReservingItem}
              setCallingHospital={setCallingHospital}
              CITIES={CITIES}
              emergencyMode={emergencyMode}
            />
          ) : activeView === 'analytics' ? (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard role={role} inventory={activeInventory} selectedCity={resultsCity} t={t} currentUser={currentUser} />
            </motion.div>
          ) : activeView === 'dashboard' && currentUser ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Dashboard 
                user={currentUser} 
                activeRequest={activeRequest}
                t={t}
                onUpdateUser={handleUpdateUser}
              />
            </motion.div>
          ) : activeView === 'hospital-dashboard' && currentUser ? (
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fas fa-circle-notch animate-spin text-4xl text-red-600"></i></div>}>
              <motion.div 
                key="hospital-dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <HospitalDashboard user={currentUser} t={t} />
              </motion.div>
            </Suspense>
          ) : activeView === 'driver-dashboard' && currentUser ? (
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fas fa-circle-notch animate-spin text-4xl text-red-600"></i></div>}>
              <motion.div 
                key="driver-dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <DriverDashboard user={currentUser} t={t} />
              </motion.div>
            </Suspense>
          ) : activeView === 'local-sector' ? (
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fas fa-circle-notch animate-spin text-4xl text-red-600"></i></div>}>
              <motion.div
                key="local-sector"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LocalSectorPage
                  t={t}
                  locationDetails={locationDetails}
                  detectedAddress={detectedAddress}
                  detectLocation={detectLocation}
                  allCityFacilities={allCityFacilities}
                  syncSeconds={syncSeconds}
                  setEmergencyMode={setEmergencyMode}
                  isEmergencyMode={emergencyMode}
                />
              </motion.div>
            </Suspense>
          ) : activeView === 'assistant' ? (
            <motion.div 
              key="assistant"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ClinicalAIPage t={t} />
            </motion.div>
          ) : activeView === 'audit' && currentUser ? (
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><i className="fas fa-circle-notch animate-spin text-4xl text-red-600"></i></div>}>
              <motion.div 
                key="audit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AuditDashboard currentUser={currentUser} />
              </motion.div>
            </Suspense>
          ) : (
            null
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-droplet text-white text-sm"></i>
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{t.title}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
                {t.footerDesc}
              </p>
              <div className="text-[10px] font-bold text-slate-400 space-y-1">
                <p>{t.contact.toUpperCase()}: +91 9110966427</p>
                <p>{t.email.toUpperCase()}: SUPPORT@VITALFLOW.AI</p>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">{t.platform}</h4>
              <ul className="space-y-2">
                <li className="text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors uppercase tracking-tight">{t.inventoryMap}</li>
                <li className="text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors uppercase tracking-tight">{t.aiForecasting}</li>
                <li className="text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors uppercase tracking-tight">{t.facilityPortal}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">{t.legal}</h4>
              <ul className="space-y-2">
                <li className="text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors uppercase tracking-tight">{t.privacyPolicy}</li>
                <li className="text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors uppercase tracking-tight">{t.termsOfService}</li>
                <li className="text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors uppercase tracking-tight">{t.compliance}</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex justify-between items-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">© 2024 VITALFLOW HEALTHCARE. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">System Status: Stable</p>
            </div>
          </div>
        </div>
      </footer>

      <ClinicalAssistant />

      <AnimatePresence>
        {isSOSCalling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-12">
              <div className="relative">
                <div className="w-32 h-32 bg-red-600 rounded-full mx-auto flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                  <i className="fa-solid fa-phone-volume text-white text-4xl"></i>
                </div>
                <div className="absolute inset-0 border-4 border-red-600 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t.emergencyProtocol}</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] leading-relaxed">
                  {t.broadcastingTo} <span className="text-red-500">{searchCity}</span> {t.andSurrounding}.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  {[
                    { name: 'Apollo Hospital', status: t.calling + '...' },
                    { name: 'Max Super Speciality', status: t.connecting + '...' },
                    { name: 'Fortis Memorial', status: t.alertSent }
                  ].map((h, i) => (
                    <motion.div 
                      key={h.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.5 }}
                      className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between"
                    >
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">{h.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{h.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setIsSOSCalling(false)}
                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                {t.cancelProtocol}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {callingHospital && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full text-center space-y-12">
              <div className="relative">
                <div className="w-32 h-32 bg-emerald-600 rounded-full mx-auto flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                  <i className="fa-solid fa-phone text-white text-4xl"></i>
                </div>
                <div className="absolute inset-0 border-4 border-emerald-600 rounded-full animate-ping opacity-20"></div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{t.calling}...</h2>
                <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">{callingHospital.facilityName}</p>
                <p className="text-emerald-500 font-mono text-lg">{callingHospital.contact}</p>
              </div>

              <button 
                onClick={() => setCallingHospital(null)}
                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                {t.cancelProtocol}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reservingItem && (
        <ReservationModal 
          item={reservingItem} 
          onClose={() => setReservingItem(null)} 
          onConfirm={async (units, deliveryMethod, deliveryAddress) => {
             const newRequest: BloodRequest = {
               id: `REQ-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
               itemId: reservingItem.id,
               facilityName: reservingItem.facilityName,
               bloodGroup: reservingItem.bloodGroup,
               componentType: reservingItem.componentType,
               units,
               status: BloodRequestStatus.Sent,
               deliveryMethod,
               deliveryAddress,
               timestamp: new Date().toISOString()
             };
             
             setBloodRequests(prev => [newRequest, ...prev]);
             setActiveInventory(prev => prev.map(item => item.id === reservingItem.id ? { ...item, units: item.units - units } : item));
             
             // Record activity if user is logged in
             if (currentUser) {
               try {
                 await apiCall(`${API_ENDPOINTS.ACTIVITIES}`, {
                   method: 'POST',
                   headers: { 
                     'x-user-id': currentUser.id,
                     'x-user-role': currentUser.role
                   },
                   body: JSON.stringify({
                     userId: currentUser.id,
                     type: 'reservation',
                     bloodGroup: reservingItem.bloodGroup,
                     componentType: reservingItem.componentType,
                     units,
                     cost: units * 1450,
                     facilityName: reservingItem.facilityName
                   })
                 });
               } catch (error) {
                 console.error("Failed to record activity:", error);
               }
             }

             // Set active request for tracking
             setActiveRequest({
               status: BloodRequestStatus.Sent,
               deliveryMethod,
               deliveryAddress,
               facilityName: reservingItem.facilityName
             });

             // Simulate status updates
             setTimeout(() => {
               setActiveRequest(prev => prev ? { ...prev, status: BloodRequestStatus.Initiated } : null);
               setTimeout(() => {
                 setActiveRequest(prev => prev ? { ...prev, status: BloodRequestStatus.InTransit } : null);
                 setTimeout(() => {
                   setActiveRequest(prev => prev ? { ...prev, status: BloodRequestStatus.Reached } : null);
                 }, 10000);
               }, 8000);
             }, 5000);

             setReservingItem(null);
          }}
        />
      )}

      {activeRequest && (
        <BloodRequestTracker
          {...activeRequest}
          onClose={() => setActiveRequest(null)}
          t={t}
        />
      )}

      {/* About VitalFlow AI Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setShowAboutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48 bg-gradient-to-br from-red-600 to-maroon-900 p-12 flex flex-col justify-end">
                <button 
                  onClick={() => setShowAboutModal(false)}
                  className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <h2 className="text-4xl font-black text-white uppercase tracking-tight">{t.aboutVitalFlow}</h2>
              </div>
              <div className="p-12 space-y-8">
                <div className="space-y-4">
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    VitalFlow AI is a revolutionary blood supply chain management platform that leverages artificial intelligence to ensure no life is lost due to blood unavailability.
                  </p>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    Our mission is to create a seamless, transparent, and highly efficient network connecting donors, blood banks, and hospitals across the nation.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600 mb-4">
                      <i className="fa-solid fa-brain"></i>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 uppercase text-xs tracking-widest">AI Driven</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Predictive analytics for demand forecasting.</p>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                      <i className="fa-solid fa-network-wired"></i>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 uppercase text-xs tracking-widest">Real-time</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Live inventory tracking across 450+ facilities.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAboutModal(false)}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-all"
                >
                  Close Information
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camp Schedule Modal */}
      <AnimatePresence>
        {showCampModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setShowCampModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48 bg-gradient-to-br from-emerald-600 to-teal-900 p-12 flex flex-col justify-end">
                <button 
                  onClick={() => setShowCampModal(false)}
                  className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <h2 className="text-4xl font-black text-white uppercase tracking-tight">{t.campSchedule}</h2>
              </div>
              <div className="p-12 space-y-8">
                <div className="space-y-4">
                  {[
                    { title: "City Hospital Drive", date: "April 05, 2026", time: "09:00 AM - 04:00 PM", location: "Main Atrium, City Hospital" },
                    { title: "Tech Park Mega Camp", date: "April 12, 2026", time: "10:00 AM - 06:00 PM", location: "Global Tech Park, Block C" },
                    { title: "Community Center Drive", date: "April 18, 2026", time: "08:00 AM - 02:00 PM", location: "Sector 42 Community Hall" }
                  ].map((camp, i) => (
                    <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase text-sm tracking-tight">{camp.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{camp.location}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md uppercase tracking-widest">{camp.date}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{camp.time}</span>
                        </div>
                      </div>
                      <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-all">
                        <i className="fa-solid fa-calendar-plus"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setShowCampModal(false)}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-lg shadow-emerald-600/20"
                >
                  Close Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Download Button */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[500]">
        <button className="bg-[#8b0000] text-white px-4 py-8 rounded-l-2xl shadow-2xl flex flex-col items-center gap-4 group">
          <i className="fa-solid fa-mobile-screen-button text-xl"></i>
          <span className="[writing-mode:vertical-rl] text-[10px] font-black uppercase tracking-[0.3em]">{t.downloadApp}</span>
        </button>
      </div>
    </div>
  );
};

export default App;
