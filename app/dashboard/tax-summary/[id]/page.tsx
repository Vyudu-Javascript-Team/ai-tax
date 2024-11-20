"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface TaxSummary {
  taxableIncome: number;
  calculatedTax: number;
  effectiveTaxRate: number;
}

export default function TaxSummary() {
  const { id } = useParams();
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaxSummary = async () => {
      try {
        const response = await fetch(`/api/tax-calculation/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tax summary");
        }
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching tax summary:", error);
        toast({
          title: "Error",
          description: "Failed to load tax summary. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTaxSummary();
  }, [id]);

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`/api/reports/generate/${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "tax_return_summary.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading tax summary...</div>;
  if (!summary) return <div>Failed to load tax summary</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tax Return Summary</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tax Calculation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Taxable Income: ${summary.taxableIncome.toFixed(2)}</p>
          <p className="mb-2">Calculated Tax: ${summary.calculatedTax.toFixed(2)}</p>
          <p className="mb-4">Effective Tax Rate: {(summary.effectiveTaxRate * 100).toFixed(2)}%</p>
          <Button onClick={handleGenerateReport}>Generate PDF Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}