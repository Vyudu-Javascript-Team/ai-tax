import { describe, it, expect } from '@jest/globals';

// Mock tax calculation function (replace with your actual implementation)
const calculateTax = (income: number) => {
  if (income <= 0) return 0;
  if (income <= 50000) return income * 0.15;
  return 50000 * 0.15 + (income - 50000) * 0.25;
};

describe('Tax Calculations', () => {
  it('should return 0 tax for 0 income', () => {
    expect(calculateTax(0)).toBe(0);
  });

  it('should calculate tax correctly for income under $50,000', () => {
    expect(calculateTax(40000)).toBe(6000); // 15% of 40000
  });

  it('should calculate tax correctly for income over $50,000', () => {
    expect(calculateTax(60000)).toBe(
      50000 * 0.15 + 10000 * 0.25 // 7500 + 2500
    );
  });

  it('should handle negative income', () => {
    expect(calculateTax(-1000)).toBe(0);
  });
});