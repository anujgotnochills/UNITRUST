'use client';

import React from 'react';
import Marquee from 'react-fast-marquee';

const words = ['Build Brilliant', 'Own Everything', 'Trust Verified', 'Carbon Neutral', 'Stake & Govern', 'Mint Assets'];

export function MarqueeTicker() {
  return (
    <section className="py-16 md:py-24 overflow-hidden select-none">
      {/* Row 1 — left */}
      <Marquee speed={20} gradient={false} className="mb-4">
        {words.map((word, i) => (
          <span key={`top-${i}`} className="flex items-center">
            <span className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground/[0.08] whitespace-nowrap px-2">
              {word}
            </span>
            <span className="text-accent-green text-2xl md:text-4xl mx-4">·</span>
          </span>
        ))}
      </Marquee>

      {/* Row 2 — right */}
      <Marquee speed={20} direction="right" gradient={false}>
        {words.map((word, i) => (
          <span key={`bottom-${i}`} className="flex items-center">
            <span className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground/[0.08] whitespace-nowrap px-2">
              {word}
            </span>
            <span className="text-accent-green/40 text-2xl md:text-4xl mx-4">·</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
