'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ShieldCheck, Eye, Zap, Lock } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const CARDS = [
  {
    title: 'Trust',
    description: 'Immutably verify asset provenance directly on the Polygon blockchain without relying on opaque intermediaries.',
    icon: ShieldCheck,
  },
  {
    title: 'Transparency',
    description: 'Every certificate and action is auditable, fostering an open ecosystem where accountability is the default state.',
    icon: Eye,
  },
  {
    title: 'Scalability',
    description: 'Built on high-throughput infrastructure to handle thousands of verifications seamlessly within milliseconds.',
    icon: Zap,
  },
  {
    title: 'Security',
    description: 'Cryptographically secured identity and fractionalised ownership structures leveraging state-of-the-art smart contracts.',
    icon: Lock,
  },
];

export const DecentralisedTrust = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const sectionEl = sectionRef.current;
      const horizontalEl = horizontalRef.current;
      
      if (!sectionEl || !horizontalEl) return;

      const getScrollAmount = () => {
        const horizontalWidth = horizontalEl.scrollWidth;
        // Scroll amount is width of horizontal container minus the viewport width
        return -(horizontalWidth - window.innerWidth);
      };

      const tween = gsap.to(horizontalEl, {
        x: getScrollAmount,
        ease: 'none',
      });

      // Handle the pinning and horizontal scroll
      ScrollTrigger.create({
        trigger: sectionEl,
        start: 'top top',
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1, // Smooth scrubbing
        invalidateOnRefresh: true, // Recalculate on resize
      });

      const targets = [document.body, sectionEl];

      // Background color transition from Light -> Dark
      const darkTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top 80%', 
          end: 'top 20%',
          scrub: 1,
        },
      });

      darkTl.to([document.documentElement, document.body], {
        '--color-bg': '#0a0a0a',
        '--page-bg': '#0a0a0a',
        '--color-text-primary': '#ffffff',
        '--dot-color': '#ffffff',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
        duration: 1,
      });

      // Background color transition from Dark -> Light
      const pinDistance = getScrollAmount() * -1;
      const lightTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionEl,
          start: () => `top+=${pinDistance} top`, 
          end: () => `top+=${pinDistance + window.innerHeight * 0.7} top`,
          scrub: 1,
          invalidateOnRefresh: true,
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

      return () => {
        // Cleanup variables and inline styles
        gsap.set([document.documentElement, document.body], { 
          clearProps: 'all' 
        });
      };
    },
    { scope: sectionRef }
  );

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full overflow-hidden text-[var(--color-text-primary)]"
    >
      <div 
        ref={containerRef} 
        className="h-screen w-full flex flex-col justify-center overflow-hidden"
      >
        <div 
          ref={horizontalRef} 
          className="flex h-full items-center w-max will-change-transform pl-[5vw] pr-[20vw] md:pl-[10vw]"
        >
          {/* First element: The title block */}
          <div className="w-[90vw] md:w-[70vw] lg:w-[50vw] shrink-0 pr-8 md:pr-16 flex flex-col justify-center">
            <h2 className="text-5xl md:text-7xl font-display mb-6 tracking-tight">
              Decentralised <br/>
              <span className="gradient-text">Trust</span>
            </h2>
            <p className="text-lg md:text-xl max-w-2xl opacity-80 text-balance leading-relaxed">
              Scroll to discover the core tenets of our new Web3 paradigm. We substitute blind faith with cryptographic certainty, ensuring trust is built directly into the protocol layer.
            </p>
          </div>
          
          {/* Cards Sequence */}
          <div className="flex gap-6 md:gap-12 pl-12 md:pl-24">
            {CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx}
                  className="w-[85vw] max-w-[380px] shrink-0 border border-current opacity-90 rounded-3xl p-8 md:p-10 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-xl flex flex-col justify-between aspect-[4/5] sm:aspect-square transition-colors shadow-sm"
                  style={{ borderColor: 'rgba(150, 150, 150, 0.2)' }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-current opacity-80 flex items-center justify-center mb-8 text-black dark:text-white" style={{ background: 'rgba(150, 150, 150, 0.1)' }}>
                    <Icon className="w-8 h-8 text-[#00FF88]" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-display mb-4">{card.title}</h3>
                    <p className="opacity-70 text-lg leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
