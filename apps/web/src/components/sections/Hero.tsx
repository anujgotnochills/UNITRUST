'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { ChevronDown } from 'lucide-react';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Headline words clip-path wipe
      const words = headlineRef.current?.querySelectorAll('.hero-word');
      if (words) {
        tl.from(words, {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
        }, 0.3);
      }

      // Subheading
      tl.from(subRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
      }, 0.8);

      // CTA buttons
      const buttons = ctaRef.current?.querySelectorAll('a, button');
      if (buttons) {
        tl.from(buttons, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
        }, 1);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex flex-col items-center justify-center pt-32 pb-16"
    >
      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center flex-1 flex flex-col items-center justify-center">
        <div ref={headlineRef} className="mb-8 w-full">
          <h1 className="font-display font-black text-[#1A1A1A] leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(80px, 15vw, 220px)' }}>
            <div className="hero-word">Build</div>
            <div className="hero-word">Brilliant</div>
          </h1>
        </div>

        <p
          ref={subRef}
          className="text-xl md:text-2xl text-[#1A1A1A] max-w-3xl mx-auto mb-16 leading-snug"
          style={{ letterSpacing: '-0.01em' }}
        >
          UniTrust combines blockchain with real-world assets.<br className="hidden md:block" />
          For dapps with smarter features, fairer fees, and richer verification.
        </p>
      </div>

      {/* Bottom Buttons */}
      <div ref={ctaRef} className="w-full relative z-10 pb-8 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl px-4">
          <button className="bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-black transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            UniTrust Vault
          </button>
          
          <button className="bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-black transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            UniTrust Explorer
            <ChevronDown className="w-4 h-4 opacity-70 ml-1" />
          </button>
          
          <button className="bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-black transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
            Get $UNIT
          </button>
          
          <button className="bg-[#1A1A1A] text-white px-6 py-3.5 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-black transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
            Start Building
          </button>
        </div>
      </div>
    </section>
  );
}
