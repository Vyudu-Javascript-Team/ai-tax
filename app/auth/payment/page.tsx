"use client";

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function PaymentPage() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while setting up payment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Add Payment Method</h1>
      <Card>
        <CardHeader>
          <CardTitle>Enter Payment Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <PaymentElement />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!stripe || loading}>
              {loading ? "Processing..." : "Save Payment Method"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}