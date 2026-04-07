'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Button } from '@/components/ui/Button';
import { useInView } from 'react-intersection-observer';



const socials = [
  { label: 'Twitter / X', icon: '𝕏', color: 'hover:bg-surface/20 hover:text-background', href: '#' },
  { label: 'Telegram', icon: '✈', color: 'hover:bg-[#229ED9]/20 hover:text-[#229ED9]', href: '#' },
  { label: 'Discord', icon: '🎮', color: 'hover:bg-[#5865F2]/20 hover:text-[#5865F2]', href: '#' },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => setCount(Math.floor(obj.val)),
    });
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function Community() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current!.querySelector('.community-content'), {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="community" className="section-padding">
      <div className="content-width">
        <div className="community-content text-center max-w-2xl mx-auto">

          <h2 className="text-section font-display font-black text-foreground tracking-tight mb-4">
            Built from scratch in <AnimatedCounter target={24} suffix="h" /> 
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-10 max-w-lg mx-auto">
            We're a passionate startup born out of this hackathon. Join our early community of supporters as we pioneer the future of decentralized trust and asset tokenization.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-10">
            {[
              { label: 'Lines of Code', value: 12400, suffix: '+' },
              { label: 'Smart Contracts', value: 4, suffix: '' },
              { label: 'Cups of Coffee', value: 89, suffix: '+' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-display font-black text-foreground">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Social buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 bg-surface text-sm font-medium text-muted transition-all duration-200 ${social.color}`}
              >
                <span className="text-base">{social.icon}</span>
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
