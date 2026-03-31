
import { BloodGroup, ComponentType, InventoryItem } from './types';

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const CITIES_DATA = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
  { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577 },
  { name: 'Thane', lat: 19.2183, lng: 72.9781 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Patna', lat: 25.5941, lng: 85.1376 },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
  { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538 },
  { name: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { name: 'Agra', lat: 27.1767, lng: 78.0081 },
  { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
  { name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
  { name: 'Meerut', lat: 28.9845, lng: 77.7064 },
  { name: 'Rajkot', lat: 22.3039, lng: 70.8022 },
  { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
  { name: 'Srinagar', lat: 34.0837, lng: 74.7973 },
  { name: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
  { name: 'Dhanbad', lat: 23.7957, lng: 86.4304 },
  { name: 'Amritsar', lat: 31.6340, lng: 74.8723 },
  { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297 },
  { name: 'Allahabad', lat: 25.4358, lng: 81.8463 },
  { name: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  { name: 'Howrah', lat: 22.5958, lng: 88.2636 },
  { name: 'Jabalpur', lat: 23.1815, lng: 79.9864 },
  { name: 'Gwalior', lat: 26.2124, lng: 78.1772 },
  { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
  { name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Raipur', lat: 21.2514, lng: 81.6296 },
  { name: 'Kota', lat: 25.2138, lng: 75.8648 },
  { name: 'Guwahati', lat: 26.1158, lng: 91.7086 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Solapur', lat: 17.6599, lng: 75.9064 },
  { name: 'Hubli-Dharwad', lat: 15.3647, lng: 75.1240 },
  { name: 'Bareilly', lat: 28.3670, lng: 79.4304 },
  { name: 'Moradabad', lat: 28.8351, lng: 78.7733 },
  { name: 'Mysore', lat: 12.2958, lng: 76.6394 },
  { name: 'Gurgaon', lat: 28.4595, lng: 77.0266 },
  { name: 'Aligarh', lat: 27.8974, lng: 78.0880 },
  { name: 'Jalandhar', lat: 31.3260, lng: 75.5762 },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  { name: 'Salem', lat: 11.6643, lng: 78.1460 },
  { name: 'Mira-Bhayandar', lat: 19.2813, lng: 72.8557 },
  { name: 'Warangal', lat: 17.9689, lng: 79.5941 },
  { name: 'Guntur', lat: 16.3067, lng: 80.4365 },
  { name: 'Bhiwandi', lat: 19.2813, lng: 73.0483 },
  { name: 'Saharanpur', lat: 29.9640, lng: 77.5460 },
  { name: 'Gorakhpur', lat: 26.7606, lng: 83.3731 },
  { name: 'Bikaner', lat: 28.0229, lng: 73.3119 },
  { name: 'Amravati', lat: 20.9320, lng: 77.7523 },
  { name: 'Noida', lat: 28.5355, lng: 77.3910 },
  { name: 'Jamshedpur', lat: 22.8046, lng: 86.2029 },
  { name: 'Bhilai', lat: 21.1938, lng: 81.3509 },
  { name: 'Cuttack', lat: 20.4625, lng: 85.8830 },
  { name: 'Firozabad', lat: 27.1513, lng: 78.3958 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
  { name: 'Nellore', lat: 14.4426, lng: 79.9865 },
  { name: 'Bhavnagar', lat: 21.7645, lng: 72.1519 },
  { name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  { name: 'Durgapur', lat: 23.5204, lng: 87.3119 },
  { name: 'Asansol', lat: 23.6739, lng: 86.9524 },
  { name: 'Rourkela', lat: 22.2604, lng: 84.8536 },
  { name: 'Nanded', lat: 19.1628, lng: 77.3176 },
  { name: 'Kolhapur', lat: 16.7050, lng: 74.2433 },
  { name: 'Ajmer', lat: 26.4499, lng: 74.6399 },
  { name: 'Akola', lat: 20.7002, lng: 77.0082 },
  { name: 'Gulbarga', lat: 17.3297, lng: 76.8343 },
  { name: 'Jamnagar', lat: 22.4707, lng: 70.0577 },
  { name: 'Ujjain', lat: 23.1760, lng: 75.7885 },
  { name: 'Loni', lat: 28.7500, lng: 77.2833 },
  { name: 'Siliguri', lat: 26.7271, lng: 88.3953 },
  { name: 'Jhansi', lat: 25.4484, lng: 78.5685 },
  { name: 'Ulhasnagar', lat: 19.2215, lng: 73.1645 },
  { name: 'Jammu', lat: 32.7266, lng: 74.8570 },
  { name: 'Sangli-Miraj & Kupwad', lat: 16.8524, lng: 74.5815 },
  { name: 'Mangalore', lat: 12.9141, lng: 74.8560 },
  { name: 'Erode', lat: 11.3410, lng: 77.7172 },
  { name: 'Belgaum', lat: 15.8497, lng: 74.4977 },
  { name: 'Ambattur', lat: 13.1143, lng: 80.1481 },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { name: 'Malegaon', lat: 20.5517, lng: 74.5089 },
  { name: 'Gaya', lat: 24.7914, lng: 85.0002 },
  { name: 'Jalgaon', lat: 21.0077, lng: 75.5626 },
  { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
  { name: 'Maheshtala', lat: 22.5100, lng: 88.2500 }
];

export const CITIES = CITIES_DATA.map(c => c.name);

const generateMockInventory = (): InventoryItem[] => {
  const items: InventoryItem[] = [];
  const facilities = [
    'Apollo Hospital', 'Max Super Speciality', 'Fortis Memorial', 'AIIMS Trauma Centre', 'Narayana Health City',
    'Yashoda Super Speciality', 'Medanta - The Medicity', 'Global Health City', 'St. Johns Medical College', 'KEM Hospital',
    'Ruby Hall Clinic', 'Sahyadri Super Speciality', 'Manipal Hospital', 'Max Healthcare', 'Sir H. N. Reliance Foundation',
    'Lilavati Hospital', 'Breach Candy Hospital', 'Kokilaben Dhirubhai Ambani', 'Hinduja Hospital', 'Tata Memorial',
    'Aster CMI Hospital', 'Cloudnine Hospital', 'Columbia Asia Hospital', 'Gleneagles Global Hospitals', 'HCG Cancer Centre',
    'M. S. Ramaiah Memorial Hospital', 'Sakra World Hospital', 'Sparsh Hospital', 'Vikram Hospital', 'Vydehi Institute of Medical Sciences',
    'Amrita Hospital', 'Artemis Hospital', 'BLK Super Speciality Hospital', 'Holy Family Hospital', 'Indraprastha Apollo Hospital',
    'Moolchand Hospital', 'Primus Super Speciality Hospital', 'Sir Ganga Ram Hospital', 'St. Stephen\'s Hospital', 'Venkateshwar Hospital',
    'Care Hospitals', 'Continental Hospitals', 'KIMS Hospitals', 'Sunshine Hospitals', 'Star Hospitals',
    'Billroth Hospitals', 'MIOT International', 'Prashanth Super Speciality Hospital', 'SIMS Hospital', 'Sri Ramachandra Medical Centre'
  ];

  let idCounter = 1;

  CITIES.forEach(city => {
    // Pick 12 random facilities for each city to ensure at least 10
    const cityFacilities = [...facilities].sort(() => 0.5 - Math.random()).slice(0, 12);
    
    const cityData = CITIES_DATA.find(c => c.name === city);
    
    cityFacilities.forEach((fac, idx) => {
      // Create multiple items per facility to ensure better coverage
      const groups = Object.values(BloodGroup);
      const components = Object.values(ComponentType);
      
      // Create 2-4 items per facility with different blood groups and components
      const itemsPerFac = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < itemsPerFac; i++) {
        const distance = parseFloat((Math.random() * 15 + 1).toFixed(1));
        const traffic = Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Moderate' : 'Low';
        const speedKmh = traffic === 'High' ? 15 : traffic === 'Moderate' ? 30 : 50;
        const arrivalMins = Math.round((distance / speedKmh) * 60);

        const item: InventoryItem = {
          id: `V-${city.substring(0,3).toUpperCase()}-${String(idCounter++).padStart(4, '0')}`,
          facilityName: fac,
          city: city,
          bloodGroup: groups[(idCounter + i) % groups.length] as BloodGroup,
          componentType: components[(idCounter + i) % components.length] as ComponentType,
          units: Math.floor(Math.random() * 50) + 10,
          lastUpdated: new Date().toISOString(),
          expiryDate: new Date(Date.now() + (Math.random() * 800000000 + 100000000)).toISOString(),
          distanceKm: distance,
          status: Math.random() > 0.8 ? 'Critical' : Math.random() > 0.6 ? 'Surplus' : 'Stable',
          category: 0,
          contact: `+91 9${Math.floor(Math.random() * 900000000 + 100000000)}`,
          trafficStatus: traffic as any,
          estimatedArrivalMins: arrivalMins,
          coords: cityData ? { 
            lat: cityData.lat + (Math.random() - 0.5) * 0.1, 
            lng: cityData.lng + (Math.random() - 0.5) * 0.1 
          } : undefined,
          aiInsights: {
            expiryRiskScore: Math.random(),
            precisionMatchRank: 0.85 + Math.random() * 0.14,
            demandForecast24h: Math.floor(Math.random() * 100),
            anomalyStatus: 'Normal',
            redistributionWeight: Math.random(),
            daysToExpiry: Math.floor(Math.random() * 30) + 1,
            riskRecommendation: 'Monitor closely for redistribution'
          }
        };
        items.push(item);
      }
    });
  });

  return items;
};

export const INITIAL_INVENTORY: InventoryItem[] = generateMockInventory();

export const NETWORK_HEATMAP_DATA = [
  { name: 'Monday', Mumbai: 4000, Delhi: 2400, Bengaluru: 3100, Pune: 1200, Chennai: 1800, Hyderabad: 2200 },
  { name: 'Tuesday', Mumbai: 3000, Delhi: 1398, Bengaluru: 4200, Pune: 1500, Chennai: 2100, Hyderabad: 2500 },
  { name: 'Wednesday', Mumbai: 2000, Delhi: 9800, Bengaluru: 2900, Pune: 1800, Chennai: 1900, Hyderabad: 2100 },
  { name: 'Thursday', Mumbai: 2780, Delhi: 3908, Bengaluru: 3500, Pune: 2200, Chennai: 2400, Hyderabad: 2800 },
  { name: 'Friday', Mumbai: 1890, Delhi: 4800, Bengaluru: 4800, Pune: 2500, Chennai: 2800, Hyderabad: 3200 },
];
