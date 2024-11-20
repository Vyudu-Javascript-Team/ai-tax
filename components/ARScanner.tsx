import React from 'react';
import { Button } from "@/components/ui/button";

const ARScanner = () => {
  const startARScan = () => {
    // Implement AR scanning logic here
  };

  return (
    <Button onClick={startARScan}>
      Start AR Document Scan
    </Button>
  );
};

export default ARScanner;