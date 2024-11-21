import { User, TaxReturn, Document, Income, Deductions, TaxCredits } from '@prisma/client'

export type Role = 'USER' | 'ADMIN' | 'ACCOUNTANT'

export interface AuthUser extends Omit<User, 'hashedPassword'> {
  role: Role
}

export interface SignupRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
  companyName?: string
  plan?: string
}

export interface SignupResponse {
  user: AuthUser
  message: string
}

export interface TaxReturnWithRelations extends TaxReturn {
  income: Income | null
  deductions: Deductions | null
  taxCredits: TaxCredits | null
  documents: Document[]
}

export interface DocumentMetadata {
  extractedText?: string;
  taxInfo?: Record<string, any>;
  processedAt?: string;
  fileSize?: number;
  processingStatus?: 'pending' | 'completed' | 'failed';
}

export interface DocumentWithMetadata {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  userId: string;
  taxReturnId?: string | null;
  metadata: DocumentMetadata | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaidLinkRequest {
  userId: string
  institutionId?: string
}

export interface PlaidLinkResponse {
  linkToken: string
}

export interface PlaidExchangeRequest {
  publicToken: string
  userId: string
}

export interface PlaidExchangeResponse {
  accessToken: string
  itemId: string
}

export interface TaxCalculationRequest {
  taxReturnId: string
  userId: string
}

export interface TaxCalculationResponse {
  calculatedTax: number
  estimatedRefund: number
  breakdown: {
    totalIncome: number
    totalDeductions: number
    totalCredits: number
    effectiveTaxRate: number
  }
}

export interface ReportGenerationRequest {
  taxReturnId: string
  userId: string
  format?: 'PDF' | 'CSV' | 'JSON'
}

export interface ReportGenerationResponse {
  reportUrl: string
  format: string
  generatedAt: string
}

export interface ReferralRequest {
  referralCode: string
  userId: string
}

export interface ReferralResponse {
  discountApplied: number
  newSubscriptionStatus: string
  message: string
}

export interface TeamMemberInvite {
  email: string
  role: Role
  teamId: string
}

export interface WebhookEvent {
  type: string
  data: {
    object: {
      id: string
      customer?: string
      subscription?: string
      status?: string
      amount?: number
    }
  }
}
