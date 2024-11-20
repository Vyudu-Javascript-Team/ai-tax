import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function TaxCalculator() {
  const [income, setIncome] = useState('');
  const [taxAmount, setTaxAmount] = useState<number | null>(null);

  const calculateTax = () => {
    const incomeValue = parseFloat(income);
    if (isNaN(incomeValue)) {
      setTaxAmount(null);
      return;
    }

    // This is a simplified tax calculation. In a real application, you'd use more complex logic.
    let tax = 0;
    if (incomeValue <= 50000) {
      tax = incomeValue * 0.1;
    } else if (incomeValue <= 100000) {
      tax = 5000 + (incomeValue - 50000) * 0.2;
    } else {
      tax = 15000 + (incomeValue - 100000) * 0.3;
    }

    setTaxAmount(tax);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Tax Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="number"
          placeholder="Enter your annual income"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          className="mb-4"
        />
        <Button onClick={calculateTax} className="mb-4">Calculate Tax</Button>
        {taxAmount !== null && (
          <p>Estimated Tax: ${taxAmount.toFixed(2)}</p>
        )}
      </CardContent>
    </Card>
  );
}