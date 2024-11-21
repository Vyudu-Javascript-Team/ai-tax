import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';

// Mock component (replace with your actual component)
const TaxCalculator = () => (
  <div>
    <h1>Tax Calculator</h1>
    <input type="number" placeholder="Enter income" data-testid="income-input" />
    <button>Calculate Tax</button>
  </div>
);

describe('TaxCalculator Component', () => {
  it('renders without crashing', () => {
    render(<TaxCalculator />);
    expect(screen.getByText('Tax Calculator')).toBeInTheDocument();
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