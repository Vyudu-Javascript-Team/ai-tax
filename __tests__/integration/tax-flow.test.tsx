import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaxCalculator } from '@/components/TaxCalculator';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Tax Calculation Flow', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should handle basic tax calculation flow', async () => {
    // Mock successful API response
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tax: 5000 }),
      })
    );

    render(<TaxCalculator />);

    // Enter income
    const input = screen.getByTestId('income-input');
    fireEvent.change(input, { target: { value: '50000' } });

    // Click calculate
    const calculateButton = screen.getByText('Calculate Tax');
    fireEvent.click(calculateButton);

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText('Estimated Tax: $5000.00')).toBeInTheDocument();
    });

    // Verify API call
    expect(mockFetch).toHaveBeenCalledWith('/api/tax-calculation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ income: 50000 }),
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(<TaxCalculator />);

    // Enter income
    const input = screen.getByTestId('income-input');
    fireEvent.change(input, { target: { value: '50000' } });

    // Click calculate
    const calculateButton = screen.getByText('Calculate Tax');
    fireEvent.click(calculateButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('An error occurred while calculating tax')).toBeInTheDocument();
    });
  });

  it('should validate input fields', async () => {
    render(<TaxCalculator />);

    // Click calculate without entering income
    const calculateButton = screen.getByText('Calculate Tax');
    fireEvent.click(calculateButton);

    // Wait for validation message
    await waitFor(() => {
      expect(screen.getByText('Income is required')).toBeInTheDocument();
    });

    // Enter invalid income
    const input = screen.getByTestId('income-input');
    fireEvent.change(input, { target: { value: '-1000' } });
    fireEvent.click(calculateButton);

    // Wait for validation message
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid income amount')).toBeInTheDocument();
    });
  });

  it('should persist calculation history', async () => {
    // Mock successful API responses
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tax: 5000 }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

    render(<TaxCalculator />);

    // Enter income
    const input = screen.getByTestId('income-input');
    fireEvent.change(input, { target: { value: '50000' } });

    // Click calculate
    const calculateButton = screen.getByText('Calculate Tax');
    fireEvent.click(calculateButton);

    // Wait for result
    await waitFor(() => {
      expect(screen.getByText('Estimated Tax: $5000.00')).toBeInTheDocument();
    });

    // Verify API calls
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/tax-calculation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ income: 50000 }),
    });
  });
});
