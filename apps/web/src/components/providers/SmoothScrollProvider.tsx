'use client';

import { useEffect, useRef } from 'react';
import { initLenis, destroyLenis, getLenis } from '@/lib/lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const lenis = initLenis();

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove((time: number) => {
        lenis.raf(time * 1000);
      });
      destroyLenis();
    };
  }, []);

  return <>{children}</>;
}
