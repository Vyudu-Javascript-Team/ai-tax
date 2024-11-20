import { useState, useEffect } from 'react';

interface FeatureFlags {
  [key: string]: boolean;
}

const defaultFlags: FeatureFlags = {
  newDashboard: false,
  aiAssistant: true,
  referralProgram: true,
};

export function useFeatureFlags(): FeatureFlags {
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

export function FeatureFlag({ flag, children }: { flag: string; children: React.ReactNode }) {
  const flags = useFeatureFlags();

  if (flags[flag]) {
    return <>{children}</>;
  }

  return null;
}