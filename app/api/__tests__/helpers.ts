import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Create Prisma mock
export const prismaMock = mockDeep<PrismaClient>() as DeepMockProxy<PrismaClient>;

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  image: null,
  emailVerified: null,
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
  await prismaMock.$reset();
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
