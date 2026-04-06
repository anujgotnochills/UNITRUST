'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useInView } from 'react-intersection-observer';

const avatarColors = [
  'from-accent-green to-accent-blue',
  'from-accent-purple to-pink-500',
  'from-accent-blue to-cyan-400',
  'from-yellow-400 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-emerald-400 to-teal-500',
  'from-violet-500 to-purple-600',
];

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
          <Badge variant="green" className="mb-4">Community</Badge>

          {/* Overlapping avatars */}
          <div className="flex justify-center mb-8">
            <div className="flex -space-x-3">
              {avatarColors.map((gradient, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} border-2 border-background flex items-center justify-center text-xs font-bold text-background shadow-lg`}
                  style={{ zIndex: avatarColors.length - i }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full bg-surface border-2 border-background flex items-center justify-center text-xs font-medium text-muted shadow-lg">
                +5k
              </div>
            </div>
          </div>

          <h2 className="text-section font-display font-black text-foreground tracking-tight mb-4">
            Join <AnimatedCounter target={270} suffix="k+" /> Builders
          </h2>
          <p className="text-lg text-muted leading-relaxed mb-10 max-w-lg mx-auto">
            Be part of the global community building the future of decentralized
            trust. Ship code, earn rewards, shape governance.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-10">
            {[
              { label: 'Community Members', value: 270000, suffix: '+' },
              { label: 'Active Developers', value: 4200, suffix: '+' },
              { label: 'Countries', value: 89, suffix: '' },
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
