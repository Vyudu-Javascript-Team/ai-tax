import { POST } from '../create-setup-intent/route';
import { prismaMock, createMockRequest, parseJSON, mockSession } from './helpers';
import Stripe from 'stripe';
import { jest } from '@jest/globals';
import { User } from '@prisma/client';

const mockStripeClient = {
  setupIntents: {
    create: jest.fn(),
  },
  customers: {
    create: jest.fn(),
  },
} as unknown as jest.Mocked<Stripe>;

// Mock Stripe constructor
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripeClient);
});

jest.mock('next-auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

describe('POST /api/create-setup-intent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create setup intent for new customer', async () => {
    const request = createMockRequest('POST');
    const mockCustomer = { id: 'cus_123' };
    const mockSetupIntent = { 
      client_secret: 'seti_123_secret_456',
      id: 'seti_123',
    };

    mockStripeClient.customers.create.mockResolvedValue(mockCustomer as any);
    mockStripeClient.setupIntents.create.mockResolvedValue(mockSetupIntent as any);

    const updatedUser: Partial<User> = {
      ...mockSession.user,
      stripeCustomerId: mockCustomer.id,
    };
    prismaMock.user.update.mockResolvedValue(updatedUser as User);

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.clientSecret).toBe(mockSetupIntent.client_secret);
    expect(mockStripeClient.customers.create).toHaveBeenCalledWith({
      email: mockSession.user.email,
      name: `${mockSession.user.firstName} ${mockSession.user.lastName}`,
    });
    expect(mockStripeClient.setupIntents.create).toHaveBeenCalledWith({
      customer: mockCustomer.id,
      payment_method_types: ['card'],
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: mockSession.user.id },
      data: { stripeCustomerId: mockCustomer.id },
    });
  });

  it('should create setup intent for existing customer', async () => {
    const request = createMockRequest('POST');
    const existingCustomerId = 'cus_existing';
    const mockSetupIntent = { 
      client_secret: 'seti_123_secret_456',
      id: 'seti_123',
    };

    const userWithStripeId: Partial<User> = {
      ...mockSession.user,
      stripeCustomerId: existingCustomerId,
    };

    prismaMock.user.findUnique.mockResolvedValue(userWithStripeId as User);
    mockStripeClient.setupIntents.create.mockResolvedValue(mockSetupIntent as any);

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.clientSecret).toBe(mockSetupIntent.client_secret);
    expect(mockStripeClient.customers.create).not.toHaveBeenCalled();
    expect(mockStripeClient.setupIntents.create).toHaveBeenCalledWith({
      customer: existingCustomerId,
      payment_method_types: ['card'],
    });
  });

  it('should handle Stripe API errors', async () => {
    const request = createMockRequest('POST');
    mockStripeClient.customers.create.mockRejectedValue(new Error('Stripe API error'));

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create setup intent');
  });

  it('should handle database errors', async () => {
    const request = createMockRequest('POST');
    const mockCustomer = { id: 'cus_123' };

    mockStripeClient.customers.create.mockResolvedValue(mockCustomer as any);
    prismaMock.user.update.mockRejectedValue(new Error('Database error'));

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create setup intent');
  });

  it('should handle missing user session', async () => {
    const request = createMockRequest('POST');
    require('next-auth').auth.mockResolvedValueOnce(null);

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle invalid customer creation response', async () => {
    const request = createMockRequest('POST');
    mockStripeClient.customers.create.mockResolvedValue(null as any);

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create setup intent');
  });
});
