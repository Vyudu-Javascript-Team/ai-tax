import { GET } from '../send-trial-reminders/route';
import { prismaMock, createMockRequest, parseJSON } from '../../__tests__/helpers';
import { sendTrialReminderEmail } from '@/lib/email';

// Mock email sending function
jest.mock('@/lib/email', () => ({
  sendTrialReminderEmail: jest.fn(),
}));

describe('GET /api/cron/send-trial-reminders', () => {
  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  
  const mockUsers = [
    {
      id: 'user1',
      email: 'user1@example.com',
      firstName: 'User',
      lastName: 'One',
      trialEndDate: twoDaysFromNow,
      subscriptionStatus: 'TRIAL',
      hashedPassword: 'hash',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      stripeCustomerId: null,
      twoFactorEnabled: false,
      totpSecret: null,
      referralCode: null,
      referralCount: 0,
      referralDiscount: 0,
      referredBy: null,
    },
    {
      id: 'user2',
      email: 'user2@example.com',
      firstName: 'User',
      lastName: 'Two',
      trialEndDate: twoDaysFromNow,
      subscriptionStatus: 'TRIAL',
      hashedPassword: 'hash',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      stripeCustomerId: null,
      twoFactorEnabled: false,
      totpSecret: null,
      referralCode: null,
      referralCount: 0,
      referralDiscount: 0,
      referredBy: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send trial reminders to eligible users', async () => {
    const request = createMockRequest('GET');
    prismaMock.user.findMany.mockResolvedValue(mockUsers);

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.message).toBe('Trial reminders sent successfully');
    expect(data.count).toBe(2);
    expect(sendTrialReminderEmail).toHaveBeenCalledTimes(2);
    expect(sendTrialReminderEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: mockUsers[0].email,
      firstName: mockUsers[0].firstName,
      lastName: mockUsers[0].lastName,
      trialEndDate: mockUsers[0].trialEndDate,
    }));
  });

  it('should handle case when no users need reminders', async () => {
    const request = createMockRequest('GET');
    prismaMock.user.findMany.mockResolvedValue([]);

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.message).toBe('Trial reminders sent successfully');
    expect(data.count).toBe(0);
    expect(sendTrialReminderEmail).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    const request = createMockRequest('GET');
    prismaMock.user.findMany.mockRejectedValue(new Error('Database error'));

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
    expect(sendTrialReminderEmail).not.toHaveBeenCalled();
  });

  it('should handle email sending errors', async () => {
    const request = createMockRequest('GET');
    prismaMock.user.findMany.mockResolvedValue(mockUsers);
    (sendTrialReminderEmail as jest.Mock).mockRejectedValue(new Error('Email error'));

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should only send reminders to users with trial ending soon', async () => {
    const request = createMockRequest('GET');
    const usersWithMixedDates = [
      ...mockUsers,
      {
        ...mockUsers[0],
        id: 'user3',
        email: 'user3@example.com',
        trialEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        ...mockUsers[0],
        id: 'user4',
        email: 'user4@example.com',
        trialEndDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ];

    prismaMock.user.findMany.mockResolvedValue(usersWithMixedDates);

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.count).toBe(2); // Only the original two users should get reminders
    expect(sendTrialReminderEmail).toHaveBeenCalledTimes(2);
  });
});
