import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  emailVerified: null,
};

// Mock session data
export const mockSession = {
  user: mockUser,
  expires: '2024-01-01',
};

// Create a mock request with optional body, method, and headers
export function createMockRequest(options: {
  body?: any;
  method?: string;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}) {
  const {
    body,
    method = 'GET',
    headers = {},
    searchParams = {},
  } = options;

  const url = new URL('http://localhost:3000');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const request = new NextRequest(url, {
    method,
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
  });

  // Add the body if provided
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

// Helper to mock authenticated request
export async function createAuthenticatedRequest(options: {
  body?: any;
  method?: string;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}) {
  const request = createMockRequest(options);
  (getToken as jest.Mock).mockImplementationOnce(() => Promise.resolve(mockSession));
  return request;
}

// Helper to create an unauthenticated request
export async function createUnauthenticatedRequest(options: {
  body?: any;
  method?: string;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}) {
  const request = createMockRequest(options);
  (getToken as jest.Mock).mockImplementationOnce(() => Promise.resolve(null));
  return request;
}

// Helper to parse JSON response
export async function parseJsonResponse(response: Response) {
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
  // Add any cleanup logic here
  jest.clearAllMocks();
}

// Helper to validate error response
export function validateErrorResponse(response: Response, expectedStatus: number, expectedMessage: string) {
  expect(response.status).toBe(expectedStatus);
  return parseJsonResponse(response).then(data => {
    expect(data.error).toBe(expectedMessage);
  });
}

// Helper to validate success response
export function validateSuccessResponse(response: Response, expectedData?: any) {
  expect(response.status).toBe(200);
  return parseJsonResponse(response).then(data => {
    if (expectedData) {
      expect(data).toEqual(expectedData);
    }
  });
}
