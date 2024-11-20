"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function NewTaxReturn() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/tax-returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tax return");
      }

      const data = await response.json();
      toast({
        title: "Tax Return Created",
        description: `Your ${year} tax return has been started.`,
      });
      router.push(`/dashboard/tax-return/${data.id}`);
    } catch (error) {
      console.error("Error creating tax return:", error);
      toast({
        title: "Error",
        description: "Failed to create tax return. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Start New Tax Return</h1>
      <Card className="max-w-md mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>New Tax Return</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-medium">
                  Tax Year
                </label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  min={2000}
                  max={new Date().getFullYear()}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Start Tax Return"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}