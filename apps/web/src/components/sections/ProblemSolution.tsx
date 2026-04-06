'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { AlertTriangle, CheckCircle, Database, ShieldCheck } from 'lucide-react';

export function ProblemSolution() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const panels = containerRef.current!.querySelectorAll('.ps-panel');

      // Pin the section while we crossfade panels
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 1,
        },
      });

      tl.from(panels[0], { opacity: 0, x: -60, duration: 0.3 })
        .to({}, { duration: 0.4 }) // hold
        .to(panels[0], { opacity: 0, x: -40, duration: 0.3 })
        .from(panels[1], { opacity: 0, x: 60, duration: 0.3 }, '<')
        .to({}, { duration: 0.4 }); // hold
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center relative overflow-hidden">
      <div className="content-width w-full">
        <div ref={containerRef} className="relative min-h-[70vh] flex items-center">
          {/* Problem Panel */}
          <div className="ps-panel absolute inset-0 flex items-center">
            <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-medium text-red-400 uppercase tracking-wider">The Problem</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-[#1A1A1A]">
                  Trust is <span className="text-red-400">Broken</span>
                </h2>
                <p className="text-lg text-muted leading-relaxed max-w-lg">
                  Fake certificates flood the market. Asset provenance is unverifiable.
                  Carbon claims are opaque. Traditional systems rely on centralized
                  authorities that can be corrupted, hacked, or simply wrong.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {['$4.5T in fraud annually', '68% fake credentials', 'Zero carbon transparency', 'No asset provenance'].map((stat) => (
                    <div key={stat} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted">{stat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="w-80 h-80 rounded-2xl bg-surface border border-red-500/10 flex flex-col items-center justify-center gap-6 p-8">
                  <Database className="w-16 h-16 text-red-400/40" />
                  <div className="space-y-2 text-center">
                    <div className="h-3 w-48 rounded bg-red-500/10" />
                    <div className="h-3 w-36 rounded bg-red-500/10 mx-auto" />
                    <div className="h-3 w-40 rounded bg-red-500/10 mx-auto" />
                  </div>
                  <span className="text-xs text-red-400/60 uppercase tracking-wider">Centralized & Opaque</span>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Panel */}
          <div className="ps-panel absolute inset-0 flex items-center opacity-0">
            <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/10 border border-accent-green/20">
                  <CheckCircle className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  <span className="text-xs font-medium text-[#1A1A1A] uppercase tracking-wider">Our Solution</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-[#1A1A1A]">
                  Trust, Verified
                </h2>
                <p className="text-lg text-muted leading-relaxed max-w-lg">
                  UniTrust tokenizes real-world assets as NFTs, issues soulbound
                  credential certificates, and tracks carbon data on Polygon — 
                  creating an immutable, transparent trust layer.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {['On-chain provenance', 'Soulbound certificates', 'Carbon footprint tracking', 'Gasless transactions'].map((feat) => (
                    <div key={feat} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-green mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:flex justify-center">
                <div className="w-80 h-80 rounded-2xl bg-surface border border-accent-green/20 flex flex-col items-center justify-center gap-6 p-8 glow-green">
                  <ShieldCheck className="w-16 h-16 text-[#1A1A1A]/60" />
                  <div className="space-y-3 text-center w-full">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-green/5 border border-accent-green/10">
                      <div className="w-2 h-2 rounded-full bg-accent-green" />
                      <span className="text-xs text-[#1A1A1A]/80">Asset verified</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-green/5 border border-accent-green/10">
                      <div className="w-2 h-2 rounded-full bg-accent-green" />
                      <span className="text-xs text-[#1A1A1A]/80">Certificate issued</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-green/5 border border-accent-green/10">
                      <div className="w-2 h-2 rounded-full bg-accent-green" />
                      <span className="text-xs text-[#1A1A1A]/80">Carbon tracked</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
