"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxReturnSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";

const steps = [
  { title: "Basic Information", fields: ["year"] },
  { title: "Income", fields: ["income.wages", "income.interest", "income.dividends", "income.otherIncome"] },
  { title: "Deductions", fields: ["deductions.standardDeduction", "deductions.itemizedDeductions", "deductions.otherDeductions"] },
  { title: "Tax Credits", fields: ["taxCredits.childTaxCredit", "taxCredits.earnedIncomeCredit", "taxCredits.otherCredits"] },
];

export default function TaxWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(taxReturnSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      income: { wages: 0, interest: 0, dividends: 0, otherIncome: 0 },
      deductions: { standardDeduction: 0, itemizedDeductions: 0, otherDeductions: 0 },
      taxCredits: { childTaxCredit: 0, earnedIncomeCredit: 0, otherCredits: 0 },
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await apiClient("/api/tax-returns", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast({
        title: "Tax Return Created",
        description: `Your ${data.year} tax return has been started.`,
      });
      router.push(`/dashboard/tax-return/${response.id}`);
    } catch (error) {
      // Error is already handled by apiClient
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tax Return Wizard</h1>
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {steps[currentStep].fields.map((field) => (
              <div key={field} className="mb-4">
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                  {field.split('.').pop().replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <Input
                  id={field}
                  type="number"
                  {...register(field)}
                  className={errors[field] ? 'border-red-500' : ''}
                />
                {errors[field] && (
                  <p className="mt-1 text-sm text-red-500">{errors[field].message}</p>
                )}
              </div>
            ))}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={nextStep}>
            {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}