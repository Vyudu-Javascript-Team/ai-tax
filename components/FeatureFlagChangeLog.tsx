"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ChangeLogEntry {
  id: string;
  changedBy: string;
  oldValue: boolean;
  newValue: boolean;
  changedAt: string;
}

export function FeatureFlagChangeLog({ flagId }: { flagId: string }) {
  // Rest of the component code remains the same...
}