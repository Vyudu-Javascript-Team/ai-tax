import { POST } from '../document-upload/route';
import { prismaMock, createMockFile, createMockFormData, createMockRequest, parseJSON, mockSession } from './helpers';
import { createWorker } from 'tesseract.js';
import { extractTaxInfo } from '@/lib/tax-document-parser';

// Mock Tesseract.js
jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(),
}));

// Mock tax document parser
jest.mock('@/lib/tax-document-parser', () => ({
  extractTaxInfo: jest.fn(),
}));

describe('POST /api/document-upload', () => {
  const mockWorker = {
    recognize: jest.fn(),
    terminate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createWorker as jest.Mock).mockResolvedValue(mockWorker);
    mockWorker.recognize.mockResolvedValue({ data: { text: 'Extracted text' } });
    (extractTaxInfo as jest.Mock).mockReturnValue({ income: 50000 });
  });

  it('should process and store document successfully', async () => {
    const file = createMockFile('test content', 'test.jpg', 'image/jpeg');
    const formData = createMockFormData({
      file,
      taxReturnId: 'test-tax-return-id',
    });

    const request = createMockRequest('POST', formData);

    prismaMock.document.create.mockResolvedValue({
      id: 'test-doc-id',
      fileName: 'test.jpg',
      fileType: 'image/jpeg',
      fileUrl: 'placeholder_url',
      userId: mockSession.user.id,
      taxReturnId: 'test-tax-return-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        extractedText: 'Extracted text',
        taxInfo: { income: 50000 },
        processedAt: expect.any(String),
      },
    });

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.documentId).toBe('test-doc-id');
    expect(createWorker).toHaveBeenCalledWith('eng');
    expect(mockWorker.recognize).toHaveBeenCalled();
    expect(mockWorker.terminate).toHaveBeenCalled();
    expect(extractTaxInfo).toHaveBeenCalledWith('Extracted text');
  });

  it('should handle unauthorized requests', async () => {
    const file = createMockFile('test content', 'test.jpg', 'image/jpeg');
    const formData = createMockFormData({ file });
    const request = createMockRequest('POST', formData);

    // Mock session to return null
    require('next-auth/next').getServerSession.mockResolvedValueOnce(null);

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle missing file', async () => {
    const formData = createMockFormData({});
    const request = createMockRequest('POST', formData);

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('No file uploaded');
  });

  it('should handle unsupported file types', async () => {
    const file = createMockFile('test content', 'test.txt', 'text/plain');
    const formData = createMockFormData({ file });
    const request = createMockRequest('POST', formData);

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain('Unsupported file type');
  });

  it('should handle OCR errors', async () => {
    const file = createMockFile('test content', 'test.jpg', 'image/jpeg');
    const formData = createMockFormData({ file });
    const request = createMockRequest('POST', formData);

    mockWorker.recognize.mockRejectedValue(new Error('OCR failed'));

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process document');
  });

  it('should handle database errors', async () => {
    const file = createMockFile('test content', 'test.jpg', 'image/jpeg');
    const formData = createMockFormData({ file });
    const request = createMockRequest('POST', formData);

    prismaMock.document.create.mockRejectedValue(new Error('Database error'));

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process document');
  });

  it('should handle tax info extraction errors', async () => {
    const file = createMockFile('test content', 'test.jpg', 'image/jpeg');
    const formData = createMockFormData({ file });
    const request = createMockRequest('POST', formData);

    (extractTaxInfo as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to extract tax info');
    });

    const response = await POST(request);
    const data = await parseJSON(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to process document');
  });
});
