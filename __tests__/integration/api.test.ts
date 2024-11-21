import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

// Mock next-auth
jest.mock('next-auth/next');
const mockGetServerSession = getServerSession as jest.Mock;

// Mock Prisma
jest.mock('@prisma/client');
const mockPrismaClient = PrismaClient as jest.Mock;

describe('API Integration Tests', () => {
  let mockPrisma: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup Prisma mock
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      taxCalculation: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    mockPrismaClient.mockImplementation(() => mockPrisma);
  });

  describe('Tax Calculation API', () => {
    it('should require authentication', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
      });

      mockGetServerSession.mockResolvedValueOnce(null);

      // Import and call your API route handler
      const handler = require('@/pages/api/tax/calculate').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should calculate taxes for authenticated users', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          income: 50000,
          deductions: 5000,
        },
      });

      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'test-user-id', email: 'test@example.com' },
      });

      mockPrisma.taxCalculation.create.mockResolvedValueOnce({
        id: 'test-calc-id',
        userId: 'test-user-id',
        income: 50000,
        deductions: 5000,
        taxAmount: 6750,
        createdAt: new Date(),
      });

      // Import and call your API route handler
      const handler = require('@/pages/api/tax/calculate').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          taxAmount: expect.any(Number),
        })
      );
    });

    it('should validate input data', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          income: -1000, // Invalid income
          deductions: 'invalid', // Invalid deductions
        },
      });

      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'test-user-id', email: 'test@example.com' },
      });

      // Import and call your API route handler
      const handler = require('@/pages/api/tax/calculate').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });

  describe('User Tax History API', () => {
    it('should return tax calculation history for authenticated users', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      mockGetServerSession.mockResolvedValueOnce({
        user: { id: 'test-user-id', email: 'test@example.com' },
      });

      const mockHistory = [
        {
          id: 'calc-1',
          userId: 'test-user-id',
          income: 50000,
          deductions: 5000,
          taxAmount: 6750,
          createdAt: new Date(),
        },
        {
          id: 'calc-2',
          userId: 'test-user-id',
          income: 75000,
          deductions: 7500,
          taxAmount: 10125,
          createdAt: new Date(),
        },
      ];

      mockPrisma.taxCalculation.findMany.mockResolvedValueOnce(mockHistory);

      // Import and call your API route handler
      const handler = require('@/pages/api/tax/history').default;
      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            income: expect.any(Number),
            taxAmount: expect.any(Number),
          }),
        ])
      );
    });
  });
});
