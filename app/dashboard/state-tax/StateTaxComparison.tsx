import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StateTaxInfo {
  state: string;
  incomeTaxRate: number[];
  salesTax: number;
  propertyTax: number;
  specialDeductions: string[];
  filingDeadlines: string;
  reciprocityAgreements: string[];
}

export default function StateTaxComparison() {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [income, setIncome] = useState<number>(0);
  const [taxData, setTaxData] = useState<Record<string, StateTaxInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStateTaxData();
  }, [selectedStates]);

  const fetchStateTaxData = async () => {
    try {
      const response = await fetch('/api/state-tax/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ states: selectedStates, income })
      });
      const data = await response.json();
      setTaxData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching state tax data:', error);
      setLoading(false);
    }
  };

  const calculateEffectiveTaxRate = (state: StateTaxInfo) => {
    // Progressive tax calculation logic
    const rates = state.incomeTaxRate;
    let totalTax = 0;
    let remainingIncome = income;
    
    rates.forEach((rate, index) => {
      const bracket = [0, 10000, 50000, 100000, 500000][index];
      const nextBracket = [10000, 50000, 100000, 500000, Infinity][index];
      const taxableInThisBracket = Math.min(Math.max(remainingIncome - bracket, 0), nextBracket - bracket);
      totalTax += taxableInThisBracket * (rate / 100);
      remainingIncome -= taxableInThisBracket;
    });

    return (totalTax / income) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 items-center">
        <Select
          isMulti
          value={selectedStates}
          onChange={(values) => setSelectedStates(values)}
          options={stateOptions}
          placeholder="Select states to compare..."
        />
        <Input
          type="number"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          placeholder="Enter annual income"
        />
        <Button onClick={fetchStateTaxData}>
          Compare States
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>State Tax Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                {selectedStates.map(state => (
                  <TableHead key={state}>{state}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Effective Income Tax Rate</TableCell>
                {selectedStates.map(state => (
                  <TableCell key={state}>
                    {taxData[state] ? `${calculateEffectiveTaxRate(taxData[state]).toFixed(2)}%` : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Sales Tax</TableCell>
                {selectedStates.map(state => (
                  <TableCell key={state}>
                    {taxData[state] ? `${taxData[state].salesTax}%` : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Property Tax Rate</TableCell>
                {selectedStates.map(state => (
                  <TableCell key={state}>
                    {taxData[state] ? `${taxData[state].propertyTax}%` : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Special Deductions</TableCell>
                {selectedStates.map(state => (
                  <TableCell key={state}>
                    {taxData[state] ? (
                      <ul className="list-disc pl-4">
                        {taxData[state].specialDeductions.map((deduction, idx) => (
                          <li key={idx}>{deduction}</li>
                        ))}
                      </ul>
                    ) : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Filing Deadlines</TableCell>
                {selectedStates.map(state => (
                  <TableCell key={state}>
                    {taxData[state]?.filingDeadlines || 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Reciprocity Agreements</TableCell>
                {selectedStates.map(state => (
                  <TableCell key={state}>
                    {taxData[state] ? (
                      <ul className="list-disc pl-4">
                        {taxData[state].reciprocityAgreements.map((agreement, idx) => (
                          <li key={idx}>{agreement}</li>
                        ))}
                      </ul>
                    ) : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const stateOptions = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  // ... Add all states
  { value: 'WY', label: 'Wyoming' }
];
