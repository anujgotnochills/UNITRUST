'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

const milestones = [
  {
    quarter: 'Q1 2025',
    title: 'Foundation & Smart Contracts',
    desc: 'Core Solidity contracts deployed — AssetNFT and CertificateNFT on Polygon Amoy testnet.',
    status: 'completed' as const,
  },
  {
    quarter: 'Q2 2025',
    title: 'Platform Beta Launch',
    desc: 'Next.js frontend with RainbowKit wallet integration. Backend API with IPFS pinning and MongoDB.',
    status: 'completed' as const,
  },
  {
    quarter: 'Q3 2025',
    title: 'Gasless UX & Biconomy',
    desc: 'Meta-transaction support via Biconomy Paymaster. Users mint and verify without holding POL.',
    status: 'in-progress' as const,
  },
  {
    quarter: 'Q4 2025',
    title: 'Carbon Tracking Module',
    desc: 'On-chain carbon footprint tracking linked to product NFTs. IoT oracle integration for real-time data.',
    status: 'planned' as const,
  },
  {
    quarter: 'Q1 2026',
    title: 'Mainnet & Partnerships',
    desc: 'Polygon mainnet deployment. Enterprise partnerships for supply chain and credential verticals.',
    status: 'planned' as const,
  },
  {
    quarter: 'Q2 2026',
    title: 'DAO Governance',
    desc: 'Community-governed protocol upgrades. Token launch, staking, and decentralized dispute resolution.',
    status: 'planned' as const,
  },
];

const statusConfig = {
  completed: { icon: CheckCircle2, badge: 'green' as const, label: 'Completed', color: 'text-[#1A1A1A]', bg: 'bg-[#1A1A1A]' },
  'in-progress': { icon: Clock, badge: 'yellow' as const, label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-400' },
  planned: { icon: Circle, badge: 'muted' as const, label: 'Planned', color: 'text-muted', bg: 'bg-muted' },
};

export function Roadmap() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate the progress line
      if (lineRef.current) {
        gsap.from(lineRef.current, {
          scaleY: 0,
          transformOrigin: 'top',
          duration: 1.5,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'bottom 60%',
            scrub: 1,
          },
        });
      }

      // Animate milestone items
      const items = sectionRef.current!.querySelectorAll('.roadmap-item');
      items.forEach((item, i) => {
        gsap.from(item, {
          x: i % 2 === 0 ? -40 : 40,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            once: true,
          },
        });
      });

      // Animate dots
      const dots = sectionRef.current!.querySelectorAll('.roadmap-dot');
      dots.forEach((dot) => {
        gsap.from(dot, {
          scale: 0,
          duration: 0.4,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: dot,
            start: 'top 80%',
            once: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="roadmap" className="section-padding">
      <div className="content-width">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <Badge variant="green" className="mb-4">Roadmap</Badge>
          <h2 className="text-section font-display font-black text-[#1A1A1A] tracking-tight mb-4">
            The Path Forward
          </h2>
          <p className="text-lg text-muted max-w-xl mx-auto">
            From testnet to mainnet, from beta to enterprise — our journey to
            decentralized trust.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Center line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border">
            <div ref={lineRef} className="w-full h-full bg-gradient-to-b from-accent-green via-accent-blue to-accent-purple" />
          </div>

          <div className="space-y-12">
            {milestones.map((milestone, i) => {
              const config = statusConfig[milestone.status];
              const StatusIcon = config.icon;
              const isLeft = i % 2 === 0;

              return (
                <div key={milestone.quarter} className="roadmap-item relative flex items-start gap-8">
                  {/* Desktop: alternating sides */}
                  <div className={`hidden md:flex w-full items-start gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Content */}
                    <div className={`w-[calc(50%-2rem)] ${isLeft ? 'text-right' : 'text-left'}`}>
                      <span className={`font-mono text-sm font-semibold ${config.color}`}>
                        {milestone.quarter}
                      </span>
                      <h3 className="text-xl font-display font-bold text-[#1A1A1A] mt-1 mb-2 tracking-tight">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {milestone.desc}
                      </p>
                      <div className="mt-3">
                        <Badge variant={config.badge}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="roadmap-dot relative z-10 flex-shrink-0">
                      <div className={`w-4 h-4 rounded-full ${config.bg} shadow-lg`}>
                        {milestone.status === 'in-progress' && (
                          <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-30" />
                        )}
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="w-[calc(50%-2rem)]" />
                  </div>

                  {/* Mobile: all left-aligned */}
                  <div className="flex md:hidden items-start gap-6">
                    <div className="roadmap-dot relative z-10 flex-shrink-0 mt-1">
                      <div className={`w-3.5 h-3.5 rounded-full ${config.bg}`}>
                        {milestone.status === 'in-progress' && (
                          <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-30" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className={`font-mono text-xs font-semibold ${config.color}`}>
                        {milestone.quarter}
                      </span>
                      <h3 className="text-lg font-display font-bold text-[#1A1A1A] mt-1 mb-1.5 tracking-tight">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed mb-2">
                        {milestone.desc}
                      </p>
                      <Badge variant={config.badge}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
