import { useState, useEffect } from 'react';

type Variant = 'A' | 'B';

export function useABTest(testName: string): Variant {
  const [variant, setVariant] = useState<Variant>('A');

  useEffect(() => {
    const storedVariant = localStorage.getItem(`abTest_${testName}`);
    if (storedVariant === 'A' || storedVariant === 'B') {
      setVariant(storedVariant);
    } else {
      const newVariant: Variant = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(`abTest_${testName}`, newVariant);
      setVariant(newVariant);
    }
  }, [testName]);

  return variant;
}