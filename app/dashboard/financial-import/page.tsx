"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export default function FinancialImport() {
  const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleGetPlaidLink = async () => {
    try {
      const response = await fetch("/api/plaid/create-link-token", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to get Plaid link token");
      }
      const { link_token } = await response.json();
      setPlaidLinkToken(link_token);
    } catch (error) {
      console.error("Error getting Plaid link token:", error);
      toast({
        title: "Error",
        description: "Failed to initialize Plaid connection. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlaidSuccess = async (public_token: string) => {
    try {
      setImporting(true);
      const response = await fetch("/api/plaid/exchange-public-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      });
      if (!response.ok) {
        throw new Error("Failed to exchange public token");
      }
      await importTransactions();
      toast({
        title: "Success",
        description: "Financial data imported successfully.",
      });
    } catch (error) {
      console.error("Error in Plaid flow:", error);
      toast({
        title: "Error",
        description: "Failed to import financial data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const importTransactions = async () => {
    try {
      const response = await fetch("/api/plaid/import-transactions", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to import transactions");
      }
    } catch (error) {
      console.error("Error importing transactions:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Import Financial Data</h1>
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Financial Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {!plaidLinkToken ? (
            <Button onClick={handleGetPlaidLink}>Connect Bank Account</Button>
          ) : (
            <div>
              <p className="mb-4">Click the button below to securely connect your bank account:</p>
              <Button
                onClick={() => {
                  // Initialize Plaid Link using the obtained token
                  // This is a placeholder for the actual Plaid Link integration
                  console.log("Initializing Plaid Link with token:", plaidLinkToken);
                  // After successful connection, call handlePlaidSuccess with the public_token
                }}
                disabled={importing}
              >
                {importing ? "Importing..." : "Link Account"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Manual Transaction Import</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" accept=".csv,.ofx,.qfx" className="mb-4" />
          <Button>Upload Transactions</Button>
        </CardContent>
      </Card>
    </div>
  );
}