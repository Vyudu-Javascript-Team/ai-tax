'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface FeatureFlags {
  newDashboard: boolean;
  aiAssistant: boolean;
  referralProgram: boolean;
  [key: string]: boolean;
}

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

interface Props {
  flag: keyof FeatureFlags;
  children: ReactNode;
}

export function FeatureFlag(props: Props) {
  const flags = useFeatureFlags();
  if (!flags[props.flag]) return null;
  return <>{props.children}</>;
}
