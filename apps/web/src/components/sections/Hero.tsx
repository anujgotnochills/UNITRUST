'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      const words = headlineRef.current?.querySelectorAll('.hero-word');
      if (words) {
        tl.from(words, {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
        }, 0.3);
      }

      tl.from(subRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
      }, 0.8);

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
      className="relative min-h-[100svh] flex flex-col items-center justify-center pt-20 pb-16"
    >
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 text-center flex-1 flex flex-col items-center justify-center">
        <div ref={headlineRef} className="mb-8 w-full">
          <h1 className="font-display font-black text-foreground leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(80px, 15vw, 220px)' }}>
            <div className="hero-word">Build</div>
            <div className="hero-word">Brilliant</div>
          </h1>
        </div>

        <p
          ref={subRef}
          className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto mb-16 leading-snug"
          style={{ letterSpacing: '-0.01em' }}
        >
          UniTrust combines blockchain with real-world assets.<br className="hidden md:block" />
          For dapps with smarter features, fairer fees, and richer verification.
        </p>
      </div>

      {/* Single CTA */}
      <div ref={ctaRef} className="w-full relative z-10 pb-8 flex justify-center">
        <Link
          href="/connect"
          className="group bg-foreground text-background px-10 py-5 rounded-full flex items-center gap-3 text-lg font-bold hover:bg-black transition-all hover:shadow-2xl hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          Launch App
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
