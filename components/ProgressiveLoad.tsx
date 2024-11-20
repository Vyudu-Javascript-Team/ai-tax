import React, { Suspense } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const ProgressiveLoad = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<Skeleton className="w-full h-20" />}>
      {children}
    </Suspense>
  );
};

export default ProgressiveLoad;