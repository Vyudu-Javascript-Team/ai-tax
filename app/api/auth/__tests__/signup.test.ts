import { POST } from '../signup/route';
import { prismaMock, createMockRequest, parseJSON } from '../../__tests__/helpers';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed_password')),
}));

describe('POST /api/auth/signup', () => {
  const validSignupData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'StrongPass123!',
    companyName: 'Test Company',
    phoneNumber: '1234567890',
    plan: 'PRO',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    const request = createMockRequest('POST', JSON.stringify(validSignupData));
    
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'test-id',
      ...validSignupData,
      hashedPassword: 'hashed_password',
      role: 'USER',
      subscriptionStatus: 'TRIAL',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      stripeCustomerId: null,
      trialEndDate: new Date(),
      twoFactorEnabled: false,
      totpSecret: null,
      referralCode: 'test-ref',
      referralCount: 0,
      referralDiscount: 0,
      referredBy: null,
    });

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
    expect(data.email).toBe(validSignupData.email);
    expect(data.firstName).toBe(validSignupData.firstName);
    expect(data.lastName).toBe(validSignupData.lastName);
    expect(bcrypt.hash).toHaveBeenCalledWith(validSignupData.password, 10);
  });

  it('should return 400 if user already exists', async () => {
    const request = createMockRequest('POST', JSON.stringify(validSignupData));

    prismaMock.user.findUnique.mockResolvedValue({
      id: 'existing-id',
      email: validSignupData.email,
      hashedPassword: 'hashed',
      role: 'USER',
      subscriptionStatus: 'TRIAL',
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: 'Existing',
      lastName: 'User',
      lastLoginAt: null,
      stripeCustomerId: null,
      trialEndDate: null,
      twoFactorEnabled: false,
      totpSecret: null,
      referralCode: null,
      referralCount: 0,
      referralDiscount: 0,
      referredBy: null,
    });

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('User already exists');
  });

  it('should handle missing required fields', async () => {
    const invalidData = {
      email: 'john@example.com',
      // Missing other required fields
    };

    const request = createMockRequest('POST', JSON.stringify(invalidData));
    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('should handle invalid email format', async () => {
    const invalidData = {
      ...validSignupData,
      email: 'invalid-email',
    };

    const request = createMockRequest('POST', JSON.stringify(invalidData));
    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('should handle database errors gracefully', async () => {
    const request = createMockRequest('POST', JSON.stringify(validSignupData));

    prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'));

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Error creating user');
  });

  it('should handle password hashing errors', async () => {
    const request = createMockRequest('POST', JSON.stringify(validSignupData));

    (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing error'));

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Error creating user');
  });

  it('should set correct trial end date', async () => {
    const request = createMockRequest('POST', JSON.stringify(validSignupData));
    
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async (args) => ({
      id: 'test-id',
      ...args.data,
      role: 'USER',
      subscriptionStatus: 'TRIAL',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      stripeCustomerId: null,
      twoFactorEnabled: false,
      totpSecret: null,
      referralCode: 'test-ref',
      referralCount: 0,
      referralDiscount: 0,
      referredBy: null,
    }));

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          trialEndDate: expect.any(Date),
        }),
      })
    );

    const createCall = (prismaMock.user.create as jest.Mock).mock.calls[0][0];
    const trialEndDate = createCall.data.trialEndDate;
    const daysDiff = Math.round((trialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBe(7); // Trial period should be 7 days
  });
});
