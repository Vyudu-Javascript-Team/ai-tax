'use client';

import { useState, useEffect, type ReactNode } from 'react';

export type FeatureFlags = {
  newDashboard: boolean;
  aiAssistant: boolean;
  referralProgram: boolean;
  [key: string]: boolean;
};

const defaultFlags: FeatureFlags = {
  newDashboard: false,
  aiAssistant: true,
  referralProgram: true,
};

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await fetch('/api/feature-flags');
        if (response.ok) {
          const data = await response.json();
          setFlags(data);
        }
      } catch (error) {
        console.error('Error fetching feature flags:', error);
      }
    };

    fetchFlags();
  }, []);

  return flags;
}

export type FeatureFlagProps = {
  flag: keyof FeatureFlags;
  children: ReactNode;
};

export function FeatureFlag({ flag, children }: FeatureFlagProps) {
  const flags = useFeatureFlags();
  return flags[flag] ? <>{children}</> : null;
}
