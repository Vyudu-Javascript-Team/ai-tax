import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaxCalculator } from '@/components/TaxCalculator';

describe('TaxCalculator Component', () => {
  it('renders without crashing', () => {
    render(<TaxCalculator />);
    const heading = screen.getByText('Tax Calculator');
    expect(heading).toBeInTheDocument();
  });

  it('has income input field', () => {
    render(<TaxCalculator />);
    const input = screen.getByTestId('income-input');
    expect(input).toBeInTheDocument();
  });

  it('allows income input', () => {
    render(<TaxCalculator />);
    const input = screen.getByTestId('income-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '50000' } });
    expect(input.value).toBe('50000');
  });

  it('has calculate button', () => {
    render(<TaxCalculator />);
    const button = screen.getByText('Calculate Tax');
    expect(button).toBeInTheDocument();
  });
});