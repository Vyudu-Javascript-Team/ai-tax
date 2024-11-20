"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface TaxSavingsRecommendation {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
}

export default function TaxSavings() {
  const [recommendations, setRecommendations] = useState<TaxSavingsRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/tax-savings/recommendations");
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: "Failed to load tax savings recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecommendation = async (id: string) => {
    try {
      const response = await fetch(`/api/tax-savings/apply/${id}`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to apply recommendation");
      }
      toast({
        title: "Success",
        description: "Recommendation applied successfully.",
      });
      fetchRecommendations(); // Refresh the list
    } catch (error) {
      console.error("Error applying recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to apply recommendation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading tax savings recommendations...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tax Savings Recommendations</h1>
      {recommendations.map((recommendation) => (
        <Card key={recommendation.id} className="mb-4">
          <CardHeader>
            <CardTitle>{recommendation.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{recommendation.description}</p>
            <p className="mb-4">Potential Savings: ${recommendation.potentialSavings.toFixed(2)}</p>
            <Button onClick={() => handleApplyRecommendation(recommendation.id)}>
              Apply Recommendation
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}