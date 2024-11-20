"use client";

import { Card, CardHeader, CardBody, CardFooter, Button } from "@nextui-org/react";

export default function SubscriptionPage() {
  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    // TODO: Implement subscription logic
    console.log(`Subscribing to ${plan} plan`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Choose Your Subscription Plan</h1>
      <div className="flex justify-center space-x-4">
        <Card className="w-[300px]">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Monthly Plan</p>
              <p className="text-small text-default-500">$49 per month</p>
            </div>
          </CardHeader>
          <CardBody>
            <p>Access to all features</p>
            <p>Cancel anytime</p>
          </CardBody>
          <CardFooter>
            <Button onClick={() => handleSubscribe('monthly')}>Subscribe Monthly</Button>
          </CardFooter>
        </Card>
        <Card className="w-[300px]">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Yearly Plan</p>
              <p className="text-small text-default-500">$399 per year</p>
            </div>
          </CardHeader>
          <CardBody>
            <p>Access to all features</p>
            <p>Save $189 compared to monthly</p>
          </CardBody>
          <CardFooter>
            <Button onClick={() => handleSubscribe('yearly')}>Subscribe Yearly</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}