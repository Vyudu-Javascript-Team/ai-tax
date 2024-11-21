import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

// Mock NextAuth session
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

// Reset all mocks between tests
beforeEach(() => {
  mockReset(prismaMock);
});

// Helper to create mock FormData
export function createMockFormData(data: Record<string, any>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

// Helper to create mock File
export function createMockFile(content: string, filename: string, type: string): File {
  const blob = new Blob([content], { type });
  return new File([blob], filename, { type });
}

// Helper to create mock Request
export function createMockRequest(method: string, body?: BodyInit, headers?: HeadersInit): Request {
  return new Request('http://localhost:3000', {
    method,
    body,
    headers,
  });
}

// Helper to parse JSON response
export async function parseJSON(response: Response): Promise<any> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${text}`);
  }
}
