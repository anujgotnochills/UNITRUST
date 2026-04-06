'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Zap } from 'lucide-react';

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('announcement-dismissed');
    if (stored === 'true') setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('announcement-dismissed', 'true');
  };

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50">
      <div className="bg-accent-pink text-[#1A1A1A] rounded-full py-2.5 px-6 flex items-center justify-center relative shadow-sm border border-black/5">
        <a
          href="#"
          className="text-sm font-medium hover:opacity-80 transition-opacity"
        >
          Want 6 Months of Mainnet Hosting? Apply for a Container Grant!
        </a>
        <button
          onClick={handleDismiss}
          className="absolute right-2 p-1.5 rounded-full bg-[#1A1A1A] text-white hover:bg-black transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
