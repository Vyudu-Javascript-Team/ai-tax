import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const TaxCalculator = () => {
  const [income, setIncome] = useState<string>('');
  const [tax, setTax] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const calculateTax = async () => {
    try {
      setError('');
      
      if (!income) {
        setError('Income is required');
        return;
      }

      const numericIncome = parseFloat(income);
      if (isNaN(numericIncome) || numericIncome < 0) {
        setError('Please enter a valid income amount');
        return;
      }

      const response = await fetch('/api/tax-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ income: numericIncome }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate tax');
      }

      const data = await response.json();
      setTax(data.tax);
    } catch (err) {
      setError('An error occurred while calculating tax');
      console.error('Tax calculation error:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="number"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Enter your annual income"
          className="mb-4"
          data-testid="income-input"
          aria-label="Annual Income"
        />
        <Button onClick={calculateTax} className="mb-4">
          Calculate Tax
        </Button>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {tax !== null && <p>Estimated Tax: ${tax.toFixed(2)}</p>}
      </CardContent>
    </Card>
  );
};