"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ARScanner from "@/components/ARScanner";

export default function MobileScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScanComplete = (result: string) => {
    setScanResult(result);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mobile Document Scanner</h1>
      <Card>
        <CardHeader>
          <CardTitle>Scan Tax Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <ARScanner onScanComplete={handleScanComplete} />
          {scanResult && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Scan Result:</h2>
              <pre className="bg-gray-100 p-4 rounded">{scanResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}