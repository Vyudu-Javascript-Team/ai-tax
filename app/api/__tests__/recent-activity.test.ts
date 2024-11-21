import { GET } from '../recent-activity/route';
import { prismaMock, createMockRequest, parseJSON, mockSession } from './helpers';
import { Document } from '@prisma/client';

jest.mock('next-auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

describe('GET /api/recent-activity', () => {
  const mockDocuments: Partial<Document>[] = [
    {
      id: 'doc1',
      fileName: 'w2-2023.pdf',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/w2-2023.pdf',
      userId: mockSession.user.id,
      taxReturnId: null,
      metadata: {
        year: '2023',
        type: 'W-2'
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'doc2',
      fileName: '1099-2023.pdf',
      fileType: 'application/pdf',
      fileUrl: 'https://example.com/1099-2023.pdf',
      userId: mockSession.user.id,
      taxReturnId: null,
      metadata: {
        year: '2023',
        type: '1099-MISC',
        amount: 5000
      },
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return recent activity', async () => {
    prismaMock.document.findMany.mockResolvedValue(mockDocuments as Document[]);

    const request = createMockRequest('GET');
    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.documents.length).toBe(2);
    expect(data.documents[0].id).toBe('doc1');
    expect(data.documents[1].id).toBe('doc2');
  });

  it('should handle empty results', async () => {
    prismaMock.document.findMany.mockResolvedValue([]);

    const request = createMockRequest('GET');
    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.documents).toEqual([]);
  });

  it('should handle database errors', async () => {
    prismaMock.document.findMany.mockRejectedValue(new Error('Database error'));

    const request = createMockRequest('GET');
    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch recent activity');
  });

  it('should handle unauthorized access', async () => {
    // Mock next-auth to return null session
    require('next-auth').auth.mockImplementationOnce(() => Promise.resolve(null));

    const request = createMockRequest('GET');
    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });
});
