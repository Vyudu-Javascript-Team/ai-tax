import { calculateTax } from './tax-calculations';

describe('calculateTax', () => {
  it('calculates tax correctly for income up to 50000', () => {
    expect(calculateTax(30000)).toBe(4500);
  });

  it('calculates tax correctly for income between 50000 and 100000', () => {
    expect(calculateTax(75000)).toBe(13750);
  });

  it('calculates tax correctly for income above 100000', () => {
    expect(calculateTax(150000)).toBe(37500);
  });

  it('handles zero income', () => {
    expect(calculateTax(0)).toBe(0);
  });

  it('handles negative income', () => {
    expect(calculateTax(-1000)).toBe(0);
  });
});