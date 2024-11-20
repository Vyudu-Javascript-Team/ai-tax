"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [referralDiscount, setReferralDiscount] = useState(0);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await fetch("/api/user/referral-data");
      if (response.ok) {
        const data = await response.json();
        setReferralCode(data.referralCode);
        setReferralCount(data.referralCount);
        setReferralDiscount(data.referralDiscount);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Referrals</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input value={referralCode} readOnly />
            <Button onClick={copyReferralCode}>Copy</Button>
          </div>
          <p>Referrals: {referralCount}</p>
          <p>Total Discount: {referralDiscount}%</p>
        </CardContent>
      </Card>
    </div>
  );
}