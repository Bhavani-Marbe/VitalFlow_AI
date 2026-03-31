
export enum BloodGroup {
  APos = 'A+',
  ANeg = 'A-',
  BPos = 'B+',
  BNeg = 'B-',
  ABPos = 'AB+',
  ABNeg = 'AB-',
  OPos = 'O+',
  ONeg = 'O-'
}

export enum ComponentType {
  WholeBlood = 'Whole blood',
  Plasma = 'Plasma',
  SingleDonorPlasma = 'Single donor plasma',
  SingleDonorPlatelet = 'Single donor platelet',
  SAGMPRBC = 'SAGM PRBC',
  RandomDonorPlatelets = 'Random donor platelets',
  PlateletRichPlasma = 'Platelet rich plasma',
  PlateletConcentrate = 'Platelet concentrate',
  PRBC = 'PRBC',
  WBC = 'WBC',
  LeukoreducedRBC = 'Leukoreduced RBC',
  IrradiatedRBC = 'Irradiated RBC',
  FreshFrozenPlasma = 'Fresh frozen plasma',
  Cryoprecipitate = 'Cryoprecipitate',
  CryoPoorPlasma = 'Cryo poor plasma'
}

export enum UserRole {
  Patient = 'PATIENT',
  BloodBankAdmin = 'BANK_ADMIN',
  HospitalAdmin = 'HOSP_ADMIN',
  SuperAdmin = 'SUPER_ADMIN',
  Driver = 'DRIVER'
}

export interface AIInsights {
  expiryRiskScore: number; // 0-1 (Model 2)
  precisionMatchRank: number; // 0-1 (Model 3)
  demandForecast24h: number; // (Model 1)
  anomalyStatus: 'Normal' | 'Flagged' | 'Critical'; // (Model 4)
  redistributionWeight: number; // Importance of moving this unit (Model 5)
  daysToExpiry: number;
  riskRecommendation: string;
}

export interface InventoryItem {
  id: string;
  facilityName: string;
  city: string;
  bloodGroup: BloodGroup;
  componentType: ComponentType;
  units: number;
  lastUpdated: string;
  expiryDate: string;
  distanceKm: number;
  status: 'Critical' | 'Stable' | 'Surplus';
  category: number;
  contact: string;
  aiInsights: AIInsights;
  trafficStatus?: 'Low' | 'Moderate' | 'High';
  estimatedArrivalMins?: number;
  coords?: { lat: number, lng: number };
}

export interface NetworkNode {
  id: string;
  name: string;
  supplyLevel: number;
  demandForecast: number;
  coords: { lat: number, lng: number };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'PURCHASE' | 'RESERVATION' | 'SOS_TRIGGER';
  bloodGroup: BloodGroup;
  componentType: ComponentType;
  units: number;
  cost: number;
  timestamp: string;
  facilityName: string;
}

export enum BloodRequestStatus {
  Sent = 'SENT',
  Initiated = 'INITIATED',
  InTransit = 'IN_TRANSIT',
  Reached = 'REACHED',
  Completed = 'COMPLETED'
}

export enum DeliveryMethod {
  SelfCollection = 'SELF_COLLECTION',
  Transfer = 'TRANSFER'
}

export interface BloodRequest {
  id: string;
  itemId: string;
  facilityName: string;
  bloodGroup: BloodGroup;
  componentType: ComponentType;
  units: number;
  status: BloodRequestStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'SUCCESS' | 'FAILURE';
  ipAddress?: string;
  userAgent?: string;
  metadata?: string; // JSON string
}

export interface EmergencyEvent {
  id: string;
  city: string;
  bloodGroup: BloodGroup;
  severity: 'critical' | 'high' | 'medium' | 'low';
  details: string;
  timestamp: string;
}

export interface SecurityPolicy {
  role: UserRole;
  permissions: string[];
  dataMasking: boolean;
  phiAccess: boolean;
}

export interface HospitalInventory {
  hospitalId: string;
  bloodGroup: BloodGroup;
  units: number;
  lastUpdated: string;
}
