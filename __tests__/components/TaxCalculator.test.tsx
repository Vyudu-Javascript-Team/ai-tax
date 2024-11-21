import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaxCalculator } from '@/components/TaxCalculator';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TaxCalculator Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders without crashing', () => {
    render(<TaxCalculator />);
    expect(screen.getByText('Tax Calculator')).toBeInTheDocument();
  });

  it('has income input field', () => {
    render(<TaxCalculator />);
    expect(screen.getByTestId('income-input')).toBeInTheDocument();
  });

  it('allows income input', () => {
    render(<TaxCalculator />);
    const input = screen.getByTestId('income-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '50000' } });
    expect(input.value).toBe('50000');
  });

  it('has calculate button', () => {
    render(<TaxCalculator />);
    expect(screen.getByText('Calculate Tax')).toBeInTheDocument();
  });

  it('shows validation error for empty income', async () => {
    render(<TaxCalculator />);
    const button = screen.getByText('Calculate Tax');
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Income is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid income', async () => {
    render(<TaxCalculator />);
    const input = screen.getByTestId('income-input');
    fireEvent.change(input, { target: { value: '-1000' } });
    const button = screen.getByText('Calculate Tax');
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid income amount')).toBeInTheDocument();
    });
  });

  it('calculates tax successfully', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tax: 5000 }),
      })
    );

    render(<TaxCalculator />);
    const input = screen.getByTestId('income-input');
    fireEvent.change(input, { target: { value: '50000' } });
    const button = screen.getByText('Calculate Tax');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Estimated Tax: $5000.00')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/tax-calculation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ income: 50000 }),
    });
  });

  it('handles API errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    render(<TaxCalculator />);
    const input = screen.getByTestId('income-input');
    fireEvent.change(input, { target: { value: '50000' } });
    const button = screen.getByText('Calculate Tax');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('An error occurred while calculating tax')).toBeInTheDocument();
    });
  });
});