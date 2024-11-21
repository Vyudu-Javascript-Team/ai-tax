import { POST } from '../create-setup-intent/route';
import { prismaMock, createMockRequest, parseJSON, mockSession } from './helpers';
import Stripe from 'stripe';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    setupIntents: {
      create: jest.fn(),
    },
    customers: {
      create: jest.fn(),
    },
  }));
});

jest.mock('next-auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

describe('POST /api/create-setup-intent', () => {
  let stripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    jest.clearAllMocks();
    stripe = new (Stripe as jest.MockedClass<typeof Stripe>)('fake-key', {
      apiVersion: '2023-10-16',
    });
  });

  it('should create setup intent for new customer', async () => {
    const request = createMockRequest('POST');
    const mockCustomer = { id: 'cus_123' };
    const mockSetupIntent = { 
      client_secret: 'seti_123_secret_456',
      id: 'seti_123',
    };

    stripe.customers.create.mockResolvedValue(mockCustomer);
    stripe.setupIntents.create.mockResolvedValue(mockSetupIntent);
    prismaMock.user.update.mockResolvedValue({
      ...mockSession.user,
      stripeCustomerId: mockCustomer.id,
    });

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.clientSecret).toBe(mockSetupIntent.client_secret);
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: mockSession.user.email,
      name: `${mockSession.user.firstName} ${mockSession.user.lastName}`,
    });
    expect(stripe.setupIntents.create).toHaveBeenCalledWith({
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

    const userWithStripeId = {
      ...mockSession.user,
      stripeCustomerId: existingCustomerId,
    };

    prismaMock.user.findUnique.mockResolvedValue(userWithStripeId);
    stripe.setupIntents.create.mockResolvedValue(mockSetupIntent);

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.clientSecret).toBe(mockSetupIntent.client_secret);
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(stripe.setupIntents.create).toHaveBeenCalledWith({
      customer: existingCustomerId,
      payment_method_types: ['card'],
    });
  });

  it('should handle Stripe API errors', async () => {
    const request = createMockRequest('POST');
    stripe.customers.create.mockRejectedValue(new Error('Stripe API error'));

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create setup intent');
  });

  it('should handle database errors', async () => {
    const request = createMockRequest('POST');
    const mockCustomer = { id: 'cus_123' };

    stripe.customers.create.mockResolvedValue(mockCustomer);
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
    stripe.customers.create.mockResolvedValue(null as any);

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to create setup intent');
  });
});
