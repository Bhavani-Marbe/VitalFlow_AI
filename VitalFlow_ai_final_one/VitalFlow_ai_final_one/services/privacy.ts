
import { User, UserRole, SecurityPolicy } from '../types';

/**
 * Security Policies for different roles
 * Defines who can see PHI (Protected Health Information)
 */
export const SECURITY_POLICIES: Record<UserRole, SecurityPolicy> = {
  [UserRole.SuperAdmin]: {
    role: UserRole.SuperAdmin,
    permissions: ['*'],
    dataMasking: false,
    phiAccess: true,
  },
  [UserRole.BloodBankAdmin]: {
    role: UserRole.BloodBankAdmin,
    permissions: ['read', 'write', 'audit'],
    dataMasking: false,
    phiAccess: true,
  },
  [UserRole.HospitalAdmin]: {
    role: UserRole.HospitalAdmin,
    permissions: ['read', 'request'],
    dataMasking: true,
    phiAccess: false,
  },
  [UserRole.Patient]: {
    role: UserRole.Patient,
    permissions: ['read_own', 'request'],
    dataMasking: true,
    phiAccess: false,
  },
  [UserRole.Driver]: {
    role: UserRole.Driver,
    permissions: ['read_delivery'],
    dataMasking: true,
    phiAccess: false,
  },
};

/**
 * PrivacyService handles de-identification and masking of sensitive data
 */
export class PrivacyService {
  /**
   * Masks sensitive strings (e.g., emails, phone numbers)
   */
  static maskString(str: string, visibleChars: number = 2): string {
    if (!str || str.length <= visibleChars) return '***';
    const visible = str.substring(0, visibleChars);
    return `${visible}***${str.substring(str.length - visibleChars)}`;
  }

  /**
   * De-identifies a user object based on the requester's role
   */
  static deIdentifyUser(user: User, requesterRole: UserRole): Partial<User> {
    const policy = SECURITY_POLICIES[requesterRole];
    
    if (policy.phiAccess) {
      return user;
    }

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email: this.maskString(user.email, 3),
      avatar: user.avatar,
      // Emergency contacts are PHI
      emergencyContactName: 'REDACTED',
      emergencyContactPhone: 'REDACTED',
    };
  }

  /**
   * General purpose data masking for any object
   */
  static maskData(data: any, fieldsToMask: string[]): any {
    const masked = { ...data };
    fieldsToMask.forEach(field => {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    });
    return masked;
  }
}
