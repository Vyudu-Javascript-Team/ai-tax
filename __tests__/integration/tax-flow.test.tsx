import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TaxCalculator from '@/components/TaxCalculator';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('Tax Calculation Flow', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should handle basic tax calculation flow', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ taxAmount: 5000 }),
      })
    );

    render(
      <TestWrapper>
        <TaxCalculator />
      </TestWrapper>
    );

    // Fill in income
    const incomeInput = screen.getByLabelText(/income/i);
    fireEvent.change(incomeInput, { target: { value: '50000' } });

    // Submit form
    const calculateButton = screen.getByRole('button', { name: /calculate/i });
    fireEvent.click(calculateButton);

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    render(
      <TestWrapper>
        <TaxCalculator />
      </TestWrapper>
    );

    const incomeInput = screen.getByLabelText(/income/i);
    fireEvent.change(incomeInput, { target: { value: '50000' } });

    const calculateButton = screen.getByRole('button', { name: /calculate/i });
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should validate input fields', async () => {
    render(
      <TestWrapper>
        <TaxCalculator />
      </TestWrapper>
    );

    // Try submitting without input
    const calculateButton = screen.getByRole('button', { name: /calculate/i });
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    // Try invalid input
    const incomeInput = screen.getByLabelText(/income/i);
    fireEvent.change(incomeInput, { target: { value: '-1000' } });

    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText(/must be/i)).toBeInTheDocument();
    });
  });

  it('should persist calculation history', async () => {
    const mockHistory = [
      { id: '1', income: 50000, taxAmount: 5000, createdAt: new Date().toISOString() },
      { id: '2', income: 75000, taxAmount: 7500, createdAt: new Date().toISOString() },
    ];

    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ taxAmount: 5000 }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockHistory),
        })
      );

    render(
      <TestWrapper>
        <TaxCalculator />
      </TestWrapper>
    );

    const incomeInput = screen.getByLabelText(/income/i);
    fireEvent.change(incomeInput, { target: { value: '50000' } });

    const calculateButton = screen.getByRole('button', { name: /calculate/i });
    fireEvent.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
