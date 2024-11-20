import crypto from 'crypto';
import { prisma } from '../db';
import { ApiIntegrationManager } from '../api/ApiIntegrationManager';

interface EncryptedData {
  iv: string;
  encryptedData: string;
}

export class SecurityService {
  private static instance: SecurityService;
  private apiManager: ApiIntegrationManager;
  private encryptionKey: Buffer;

  private constructor() {
    this.apiManager = ApiIntegrationManager.getInstance();
    this.encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  public async encryptSensitiveData(data: string): Promise<EncryptedData> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    return {
      iv: iv.toString('hex'),
      encryptedData
    };
  }

  public async decryptSensitiveData(encryptedData: EncryptedData): Promise<string> {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(encryptedData.iv, 'hex')
    );

    let decryptedData = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');

    return decryptedData;
  }

  public async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
    });
  }

  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(key === derivedKey.toString('hex'));
      });
    });
  }

  public async generateSecureToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  public async validateSSN(ssn: string): Promise<boolean> {
    // Remove any non-numeric characters
    const cleanSSN = ssn.replace(/\D/g, '');

    // Check if SSN is 9 digits
    if (cleanSSN.length !== 9) {
      return false;
    }

    // Check if SSN is valid format
    // First three digits cannot be 000, 666, or 900-999
    const areaNumber = parseInt(cleanSSN.substr(0, 3));
    if (areaNumber === 0 || areaNumber === 666 || areaNumber >= 900) {
      return false;
    }

    // Middle two digits cannot be 00
    const groupNumber = parseInt(cleanSSN.substr(3, 2));
    if (groupNumber === 0) {
      return false;
    }

    // Last four digits cannot be 0000
    const serialNumber = parseInt(cleanSSN.substr(5, 4));
    if (serialNumber === 0) {
      return false;
    }

    return true;
  }

  public async validateEIN(ein: string): Promise<boolean> {
    // Remove any non-numeric characters
    const cleanEIN = ein.replace(/\D/g, '');

    // Check if EIN is 9 digits
    if (cleanEIN.length !== 9) {
      return false;
    }

    // First two digits must be valid prefix
    const prefix = parseInt(cleanEIN.substr(0, 2));
    const validPrefixes = [
      10, 12, 20, 27, 30, 32, 35, 36, 37, 38, 41, 42, 43, 46, 47, 48, 50, 51,
      52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 71,
      72, 73, 74, 75, 76, 77, 81, 82, 83, 84, 85, 86, 87, 88, 90, 91, 92, 93,
      94, 95, 98, 99
    ];

    return validPrefixes.includes(prefix);
  }

  public async maskSensitiveData(data: string, type: 'ssn' | 'ein' | 'phone' | 'email'): Promise<string> {
    switch (type) {
      case 'ssn':
        return data.replace(/^\d{5}/, '*****');
      case 'ein':
        return data.replace(/^\d{2}/, '**');
      case 'phone':
        return data.replace(/^\d{6}/, '******');
      case 'email':
        const [localPart, domain] = data.split('@');
        const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
        return `${maskedLocal}@${domain}`;
      default:
        return data;
    }
  }

  public async logSecurityEvent(
    userId: string,
    eventType: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      await prisma.securityLog.create({
        data: {
          userId,
          eventType,
          details: details as any,
          ipAddress: details.ipAddress || '',
          userAgent: details.userAgent || '',
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging security event:', error);
      throw error;
    }
  }

  public async detectSuspiciousActivity(
    userId: string,
    eventType: string
  ): Promise<boolean> {
    try {
      // Get recent events for the user
      const recentEvents = await prisma.securityLog.findMany({
        where: {
          userId,
          eventType,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      // Check for suspicious patterns
      const suspiciousPatterns = {
        maxLoginAttempts: 5,
        maxDocumentUploads: 20,
        maxAPIRequests: 100
      };

      switch (eventType) {
        case 'login_attempt':
          return recentEvents.length >= suspiciousPatterns.maxLoginAttempts;
        case 'document_upload':
          return recentEvents.length >= suspiciousPatterns.maxDocumentUploads;
        case 'api_request':
          return recentEvents.length >= suspiciousPatterns.maxAPIRequests;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return true; // Err on the side of caution
    }
  }

  public async enforceRateLimit(
    userId: string,
    action: string
  ): Promise<{ allowed: boolean; resetTime: Date }> {
    const limits = {
      api_request: { count: 100, window: 3600 }, // 100 requests per hour
      document_upload: { count: 20, window: 3600 }, // 20 uploads per hour
      login_attempt: { count: 5, window: 300 } // 5 attempts per 5 minutes
    };

    const limit = limits[action as keyof typeof limits];
    if (!limit) {
      return { allowed: true, resetTime: new Date() };
    }

    const windowStart = new Date(Date.now() - limit.window * 1000);
    const count = await prisma.securityLog.count({
      where: {
        userId,
        eventType: action,
        timestamp: {
          gte: windowStart
        }
      }
    });

    return {
      allowed: count < limit.count,
      resetTime: new Date(windowStart.getTime() + limit.window * 1000)
    };
  }
}
