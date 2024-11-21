import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient, User } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Create Prisma mock
export const prismaMock = mockDeep<PrismaClient>();

// Mock user data
export const mockUser: Partial<User> = {
  id: 'test-user-id',
  email: 'test@example.com',
  hashedPassword: 'hashed-password',
  firstName: 'Test',
  lastName: 'User',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: null,
  stripeCustomerId: null,
  subscriptionStatus: 'TRIAL',
  subscriptionEndDate: null,
  trialEndDate: null,
  twoFactorEnabled: false,
  totpSecret: null,
  referralCode: null,
  referralCount: 0,
  referralDiscount: 0,
  referredBy: null,
  companyName: null,
  plan: null,
  tenant: null,
};

// Mock session data
export const mockSession = {
  user: mockUser,
  expires: '2024-01-01',
};

// Create a mock request
export function createMockRequest(method: string, body?: any) {
  const url = new URL('http://localhost:3000');
  const request = new NextRequest(url, {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });

  if (body) {
    const originalJson = request.json;
    request.json = jest.fn().mockImplementation(() => Promise.resolve(body));
  }

  return request;
}

// Create a mock file
export function createMockFile(name: string, type: string, content: string = 'test content'): File {
  return new File([content], name, { type });
}

// Create mock FormData
export function createMockFormData(file: File, additionalData: Record<string, string> = {}): FormData {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

// Mock getToken function
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(() => Promise.resolve(mockSession)),
}));

// Helper to parse JSON response
export async function parseJSON(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse response as JSON:', text);
    throw error;
  }
}

// Helper to create test data
export function createTestData() {
  return {
    user: mockUser,
    session: mockSession,
  };
}

// Helper to clean up test data
export async function cleanupTestData() {
  // Clear all mocks
  jest.clearAllMocks();
  // Reset Prisma mock state
  Object.values(prismaMock).forEach(model => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach(method => {
        if (typeof method === 'function' && method.mockReset) {
          method.mockReset();
        }
      });
    }
  });
}

// Helper to validate error response
export async function validateErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedMessage: string
) {
  expect(response.status).toBe(expectedStatus);
  const data = await parseJSON(response);
  expect(data.error).toBe(expectedMessage);
}

// Helper to validate success response
export async function validateSuccessResponse(
  response: Response,
  expectedData?: any
) {
  expect(response.status).toBe(200);
  const data = await parseJSON(response);
  if (expectedData) {
    expect(data).toEqual(expectedData);
  }
  return data;
}
