import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

const AccessibilityMenu = () => {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

  const increaseFontSize = () => setFontSize(prev => prev + 2);
  const decreaseFontSize = () => setFontSize(prev => prev - 2);
  const toggleHighContrast = () => setHighContrast(prev => !prev);

  return (
    <div>
      <Button onClick={increaseFontSize}>Increase Font Size</Button>
      <Button onClick={decreaseFontSize}>Decrease Font Size</Button>
      <Button onClick={toggleHighContrast}>
        {highContrast ? 'Disable' : 'Enable'} High Contrast
      </Button>
    </div>
  );
};

export default AccessibilityMenu;