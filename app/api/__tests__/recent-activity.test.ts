import { GET } from '../recent-activity/route';
import { prismaMock, createMockRequest, parseJSON, mockSession } from './helpers';

jest.mock('next-auth', () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

describe('GET /api/recent-activity', () => {
  const mockDocuments = [
    {
      id: 'doc1',
      fileName: 'tax2023.pdf',
      fileType: 'application/pdf',
      uploadedAt: new Date('2023-12-01'),
      userId: 'user1',
      metadata: { year: '2023', type: 'W2' },
      size: 1024,
      status: 'PROCESSED',
    },
    {
      id: 'doc2',
      fileName: 'receipt.jpg',
      fileType: 'image/jpeg',
      uploadedAt: new Date('2023-12-02'),
      userId: 'user1',
      metadata: { type: 'Receipt', amount: '150.00' },
      size: 2048,
      status: 'PROCESSED',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return recent activity for authenticated user', async () => {
    const request = createMockRequest('GET');
    prismaMock.document.findMany.mockResolvedValue(mockDocuments);

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.documents).toHaveLength(2);
    expect(data.documents[0]).toEqual(expect.objectContaining({
      id: 'doc1',
      fileName: 'tax2023.pdf',
      metadata: expect.any(Object),
    }));
  });

  it('should handle case with no recent activity', async () => {
    const request = createMockRequest('GET');
    prismaMock.document.findMany.mockResolvedValue([]);

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.documents).toHaveLength(0);
  });

  it('should handle database errors', async () => {
    const request = createMockRequest('GET');
    prismaMock.document.findMany.mockRejectedValue(new Error('Database error'));

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should handle pagination correctly', async () => {
    const request = createMockRequest('GET', { searchParams: { page: '1', limit: '1' } });
    prismaMock.document.findMany.mockResolvedValue([mockDocuments[0]]);
    prismaMock.document.count.mockResolvedValue(2);

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.documents).toHaveLength(1);
    expect(data.totalPages).toBe(2);
    expect(data.currentPage).toBe(1);
  });

  it('should handle invalid pagination parameters', async () => {
    const request = createMockRequest('GET', { searchParams: { page: 'invalid', limit: 'invalid' } });
    prismaMock.document.findMany.mockResolvedValue(mockDocuments);

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.documents).toHaveLength(2);
    expect(data.currentPage).toBe(1); // Should default to first page
  });

  it('should filter by document status if provided', async () => {
    const request = createMockRequest('GET', { searchParams: { status: 'PROCESSED' } });
    prismaMock.document.findMany.mockResolvedValue(mockDocuments);

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.documents).toHaveLength(2);
    expect(prismaMock.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PROCESSED',
        }),
      })
    );
  });

  it('should sort documents by uploadedAt in descending order', async () => {
    const request = createMockRequest('GET');
    prismaMock.document.findMany.mockResolvedValue(mockDocuments);

    const response = await GET(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(prismaMock.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          uploadedAt: 'desc',
        },
      })
    );
  });
});
