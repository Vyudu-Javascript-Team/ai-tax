"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxReturnSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";

// ... (previous imports and component setup)

export default function TaxReturnPage() {
  // ... (previous state and hooks)

  useEffect(() => {
    const fetchTaxReturn = async () => {
      try {
        const data = await apiClient(`/api/tax-returns/${id}`);
        setTaxReturn(data);
      } catch (error) {
        // Error is already handled by apiClient
        setTaxReturn(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxReturn();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await apiClient(`/api/tax-returns/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast({
        title: "Success",
        description: "Tax return updated successfully.",
      });
      router.push("/dashboard");
    } catch (error) {
      // Error is already handled by apiClient
    }
  };

  // ... (rest of the component)
}