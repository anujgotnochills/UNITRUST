'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Layers,
  Blocks,
  Link2,
  Cpu,
  BadgeDollarSign,
  Code2,
} from 'lucide-react';

const features = [
  {
    icon: Layers,
    tag: 'Relational',
    title: 'Relational, Not Just a Ledger',
    desc: 'UniTrust stores structured relational data on-chain — assets, credentials, and carbon metrics linked together, not just balances.',
    span: 'lg:col-span-2',
    visual: (
      <div className="mt-6 grid grid-cols-3 gap-2">
        {['Assets', 'Credentials', 'Carbon'].map((t) => (
          <div key={t} className="rounded-lg bg-accent-green/5 border border-accent-green/10 p-3 text-center">
            <span className="text-xs text-accent-green/80">{t}</span>
          </div>
        ))}
        <div className="col-span-3 flex justify-center py-1">
          <div className="w-px h-6 bg-accent-green/20" />
        </div>
        <div className="col-span-3 rounded-lg bg-white/5 border border-white/10 p-3 text-center">
          <span className="text-xs text-muted">On-Chain Relational Layer</span>
        </div>
      </div>
    ),
  },
  {
    icon: Blocks,
    tag: 'Modular',
    title: 'Modular, Not Monolithic',
    desc: 'Plug-and-play smart contract modules. Use just asset tokenization, or combine credentials + carbon for full-stack trust.',
    span: '',
    visual: (
      <div className="mt-6 flex flex-col gap-2">
        {['AssetNFT.sol', 'CertificateNFT.sol', 'CarbonTracker.sol'].map((m, i) => (
          <div
            key={m}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5"
            style={{ opacity: 0.5 + i * 0.25 }}
          >
            <Code2 className="w-3.5 h-3.5 text-accent-purple" />
            <span className="text-xs font-mono text-muted">{m}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Link2,
    tag: 'Connected',
    title: 'Connected, Not Isolated',
    desc: 'Cross-reference assets with credentials. Link carbon data to product NFTs. Everything is interconnected.',
    span: '',
    visual: (
      <div className="mt-6 flex items-center justify-center">
        <div className="flex items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
            <span className="text-[10px] text-accent-green">NFT</span>
          </div>
          <div className="w-8 h-px bg-gradient-to-r from-accent-green/40 to-accent-blue/40" />
          <div className="w-10 h-10 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
            <span className="text-[10px] text-accent-blue">SBT</span>
          </div>
          <div className="w-8 h-px bg-gradient-to-r from-accent-blue/40 to-accent-purple/40" />
          <div className="w-10 h-10 rounded-full bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center">
            <span className="text-[10px] text-accent-purple">CO₂</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Cpu,
    tag: 'Scalable',
    title: 'One Chain, Zero Friction',
    desc: 'Built on Polygon for fast, cheap transactions. Biconomy integration enables gasless UX — users don\'t even need to hold tokens.',
    span: 'lg:col-span-2',
    visual: (
      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 rounded-xl bg-gradient-to-r from-accent-purple/10 to-accent-green/10 border border-white/5 p-4">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Transaction Cost</span>
            <span className="text-accent-green">~$0.001</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5">
            <div className="h-full w-[3%] rounded-full bg-accent-green" />
          </div>
        </div>
        <div className="flex-1 rounded-xl bg-gradient-to-r from-accent-green/10 to-accent-blue/10 border border-white/5 p-4">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>Finality</span>
            <span className="text-accent-green">~2s</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5">
            <div className="h-full w-[8%] rounded-full bg-accent-green" />
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: BadgeDollarSign,
    tag: 'Free',
    title: "Fees? Nah, Don't Think So",
    desc: 'Gas-abstracted transactions via Biconomy. Your users mint, verify, and track without ever paying gas fees.',
    span: '',
    visual: (
      <div className="mt-6 rounded-xl bg-white/5 border border-white/5 p-4 text-center">
        <span className="text-3xl font-display font-bold text-[#1A1A1A]">$0</span>
        <p className="text-xs text-muted mt-1">per user transaction</p>
      </div>
    ),
  },
  {
    icon: Code2,
    tag: 'Developer-First',
    title: 'A New Code on the Block',
    desc: 'Solidity smart contracts. REST APIs. React SDK. Full-stack tools for builders who want to integrate trust into their applications.',
    span: 'lg:col-span-3',
    visual: (
      <div className="mt-6 rounded-xl bg-surface-light border border-white/5 p-4 font-mono text-xs overflow-hidden">
        <div className="flex gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <pre className="text-muted">
          <code>
{`const asset = await unitrust.mint({
  name: "Solar Panel #4921",
  owner: "0x...",
  carbonOffset: 2.4, // tons CO₂
  certificate: "ISO-14064"
});`}
          </code>
        </pre>
      </div>
    ),
  },
];

export function FeaturesBento() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current!.querySelectorAll('.bento-card');

      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      // Background color transition from Dark -> Light on Built Different
      const lightTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 100%', // Start as soon as the section enters from the bottom
          end: 'top 60%',    // Finish early so the Built Different text is completely readable
          scrub: 1,
        },
      });

      lightTl.to([document.documentElement, document.body], {
        '--color-bg': '#FAF7F5',
        '--page-bg': '#FAF7F5',
        '--color-text-primary': '#1A1A1A',
        '--dot-color': '#1A1A1A',
        backgroundColor: '#FAF7F5',
        color: '#1A1A1A',
        duration: 1,
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="section-padding">
      <div className="content-width">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="green" className="mb-4">Why UniTrust</Badge>
          <h2 className="text-section font-display font-black text-[#1A1A1A] tracking-tight mb-4">
            Built Different
          </h2>
          <p className="text-lg text-muted max-w-xl mx-auto">
            Not another generic blockchain. UniTrust is purpose-built for
            real-world trust verification.
          </p>
        </div>

        {/* Bento grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className={`bento-card p-6 md:p-8 ${feature.span}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-accent-green" />
                </div>
                <Badge variant="muted">{feature.tag}</Badge>
              </div>
              <h3 className="text-xl md:text-card-title font-display font-bold text-[#1A1A1A] mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {feature.desc}
              </p>
              {feature.visual}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
