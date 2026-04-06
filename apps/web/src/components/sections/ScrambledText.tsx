'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const text = 'Decentralized Trust';

export function ScrambledText() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const ghosts = sectionRef.current!.querySelectorAll('.ghost-char');

      gsap.from(ghosts, {
        y: 4,
        opacity: 0.15,
        duration: 0.8,
        stagger: 0.02,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'top 25%',
          scrub: 1,
        },
      });

      // Also animate the whole heading scale
      gsap.from(sectionRef.current!.querySelector('.scrambled-heading'), {
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding overflow-hidden">
      <div className="content-width">
        <div className="scrambled-heading text-center">
          <h2 className="font-display font-bold text-section leading-[1.1] tracking-display relative">
            {text.split('').map((char, i) => (
              <span key={i} className="relative inline-block">
                {/* Base layer */}
                <span className="relative z-10">{char === ' ' ? '\u00A0' : char}</span>
                {/* Ghost/duplicate layer */}
                <span
                  className="ghost-char absolute inset-0 text-[#1A1A1A]/[0.12] translate-y-1 z-0"
                  aria-hidden="true"
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              </span>
            ))}
          </h2>
          <p className="mt-6 text-lg text-muted max-w-xl mx-auto">
            Not just a ledger. A full relational layer for verifiable trust — 
            ownership, credentials, and sustainability data, all on-chain.
          </p>
        </div>
      </div>
    </section>
  );
}
