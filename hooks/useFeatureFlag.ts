import { useState, useEffect } from 'react';

export function useFeatureFlag(flagName: string, defaultValue: boolean = false): boolean {
  const [isEnabled, setIsEnabled] = useState(defaultValue);

  useEffect(() => {
    const checkFeatureFlag = async () => {
      try {
        const response = await fetch(`/api/feature-flags/${flagName}`);
        if (response.ok) {
          const { enabled } = await response.json();
          setIsEnabled(enabled);
        } else {
          console.warn(`Feature flag ${flagName} not found, using default value.`);
        }
      } catch (error) {
        console.error(`Error checking feature flag ${flagName}:`, error);
        console.warn(`Using default value for feature flag ${flagName}.`);
      }
    };

    checkFeatureFlag();
  }, [flagName, defaultValue]);

  return isEnabled;
}