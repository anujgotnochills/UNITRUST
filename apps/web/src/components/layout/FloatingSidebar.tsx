'use client';

import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export function FloatingSidebar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show when scrolled down 200px
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
      }`}
    >
      <div className="bg-white rounded-full flex flex-col items-center py-4 px-2 gap-5 shadow-lg border border-black/5">
        <button
          onClick={scrollToTop}
          className="text-gray-400 hover:text-black transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        <a href="#" className="text-gray-400 hover:text-black transition-colors" aria-label="X (Twitter)">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.04H5.078z"/></svg>
        </a>

        <a href="#" className="text-gray-400 hover:text-black transition-colors" aria-label="Telegram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </a>

        <a href="#" className="text-gray-400 hover:text-black transition-colors" aria-label="Discord">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M7.5 7.5c3.5-1 5.5-1 9 0"/><path d="M7 16.5c-2.9.5-3.5 2-3.5 2V8c0-3.5 2-4 2-4h13s2 .5 2 4v10.5s-.6-1.5-3.5-2"/><path d="M12 21c-2.5 0-3-.5-4-1.5s-1-4-1-4h10s.5 3-1 4-1.5 1.5-4 1.5z"/></svg>
        </a>
      </div>
    </div>
  );
}
