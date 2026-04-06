'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Sparkles, Database, Gamepad2 } from 'lucide-react';

const useCases = [
  {
    id: 'supply-chain',
    tab: 'Supply Chain',
    icon: Database,
    title: 'Transparent Supply Chains',
    desc: 'Track product provenance from manufacturer to consumer with immutable on-chain records and IoT-verified data.',
    gradient: 'from-accent-green/20 via-accent-blue/10 to-transparent',
    stats: [
      { label: 'Products Tracked', value: '125K+' },
      { label: 'Verified Steps', value: '1.2M' },
      { label: 'Fraud Prevented', value: '$84M' },
    ],
  },
  {
    id: 'credentials',
    tab: 'Credentials',
    icon: Sparkles,
    title: 'Soulbound Certificates',
    desc: 'Issue non-transferable, verifiable credentials as soulbound NFTs — degrees, certifications, compliance records.',
    gradient: 'from-accent-purple/20 via-accent-blue/10 to-transparent',
    stats: [
      { label: 'Certificates Issued', value: '50K+' },
      { label: 'Institutions', value: '340' },
      { label: 'Verification Time', value: '<2s' },
    ],
  },
  {
    id: 'sustainability',
    tab: 'Sustainability',
    icon: Gamepad2,
    title: 'Carbon Tracking & Offsets',
    desc: 'Measure, report, and verify carbon footprints on-chain. Enable transparent carbon credit trading and sustainability compliance.',
    gradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
    stats: [
      { label: 'CO₂ Tracked', value: '2.4M tons' },
      { label: 'Companies', value: '180+' },
      { label: 'Offsets Traded', value: '$12M' },
    ],
  },
];

export function UseCases() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const animateIndicator = (index: number) => {
    if (!tabsRef.current || !indicatorRef.current) return;
    const tabs = tabsRef.current.querySelectorAll('.uc-tab');
    const tab = tabs[index] as HTMLElement;
    if (!tab) return;
    gsap.to(indicatorRef.current, {
      x: tab.offsetLeft,
      width: tab.offsetWidth,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  useEffect(() => {
    animateIndicator(active);
  }, [active]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current!.querySelector('.uc-content'), {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const current = useCases[active];

  return (
    <section ref={sectionRef} className="section-padding" id="use-cases">
      <div className="content-width">
        <div className="text-center mb-12">
          <Badge variant="purple" className="mb-4">Use Cases</Badge>
          <h2 className="text-section font-display font-black text-foreground tracking-tight">
            Real World Impact
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div ref={tabsRef} className="relative inline-flex items-center gap-1 p-1 rounded-full bg-surface border border-white/10 shadow-sm">
            <div
              ref={indicatorRef}
              className="absolute top-1 left-0 h-[calc(100%-8px)] rounded-full bg-gray-100 transition-none"
            />
            {useCases.map((uc, i) => (
              <button
                key={uc.id}
                onClick={() => setActive(i)}
                className={`uc-tab relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                  active === i ? 'text-foreground font-medium' : 'text-muted hover:text-foreground/70'
                }`}
              >
                <uc.icon className="w-4 h-4" />
                {uc.tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="uc-content relative rounded-3xl overflow-hidden border border-white/10 bg-surface shadow-sm min-h-[400px]">
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${current.gradient} opacity-10`} />

          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-center min-h-[400px]">
            <div className="max-w-2xl">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 tracking-tight">
                {current.title}
              </h3>
              <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">
                {current.desc}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {current.stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl md:text-3xl font-display font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <a
                href="#"
                className="inline-flex items-center gap-2 text-foreground text-sm font-medium group animated-underline"
              >
                Explore {current.tab}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
