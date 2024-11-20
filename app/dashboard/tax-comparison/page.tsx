"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiClient } from "@/lib/api-client";

interface TaxReturn {
  id: string;
  year: number;
  income: number;
  deductions: number;
  taxCredits: number;
  calculatedTax: number;
}

export default function TaxComparisonPage() {
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  useEffect(() => {
    fetchTaxReturns();
  }, []);

  const fetchTaxReturns = async () => {
    try {
      const data = await apiClient<TaxReturn[]>("/api/tax-returns");
      setTaxReturns(data);
    } catch (error) {
      // Error is already handled by apiClient
    }
  };

  const handleYearSelection = (years: number[]) => {
    setSelectedYears(years);
  };

  const getComparisonData = () => {
    return selectedYears.map(year => {
      const taxReturn = taxReturns.find(tr => tr.year === year);
      return {
        year,
        income: taxReturn?.income || 0,
        deductions: taxReturn?.deductions || 0,
        taxCredits: taxReturn?.taxCredits || 0,
        calculatedTax: taxReturn?.calculatedTax || 0,
      };
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tax Return Comparison</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Years to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            multiple
            value={selectedYears}
            onChange={(e) => handleYearSelection(Array.from(e.target.selectedOptions, option => Number(option.value)))}
          >
            {taxReturns.map(tr => (
              <option key={tr.id} value={tr.year}>{tr.year}</option>
            ))}
          </Select>
        </CardContent>
      </Card>
      {selectedYears.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getComparisonData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#8884d8" />
                <Bar dataKey="deductions" fill="#82ca9d" />
                <Bar dataKey="taxCredits" fill="#ffc658" />
                <Bar dataKey="calculatedTax" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}