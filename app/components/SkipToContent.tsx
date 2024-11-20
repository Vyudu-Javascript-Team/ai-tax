"use client";

import { useState } from 'react';

export function SkipToContent() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <a
      href="#main-content"
      className={`
        fixed top-0 left-0 p-2 bg-blue-500 text-white
        transition-transform duration-200 ease-in-out
        ${isFocused ? 'translate-y-0' : '-translate-y-full'}
      `}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      Skip to main content
    </a>
  );
}