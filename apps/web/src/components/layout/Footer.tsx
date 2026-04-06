'use client';

import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { ArrowUpRight, Mail } from 'lucide-react';

const footerColumns = [
  {
    title: 'Solutions',
    links: [
      { label: 'Asset Tokenization', href: '#' },
      { label: 'Credential Verification', href: '#' },
      { label: 'Carbon Tracking', href: '#' },
      { label: 'Supply Chain', href: '#' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Smart Contracts', href: '#' },
      { label: 'SDK', href: '#' },
      { label: 'GitHub', href: '#' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { label: 'Partners', href: '#' },
      { label: 'Grants', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Events', href: '#' },
    ],
  },
  {
    title: 'Token',
    links: [
      { label: 'Tokenomics', href: '#' },
      { label: 'Staking', href: '#' },
      { label: 'Governance', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Kit', href: '#' },
    ],
  },
];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const links = footerRef.current.querySelectorAll('.footer-link');
    gsap.from(links, {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.03,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: footerRef.current,
        start: 'top 85%',
        once: true,
      },
    });
  }, []);

  return (
    <footer ref={footerRef} className="border-t border-border bg-background">
      {/* Main footer */}
      <div className="content-width section-padding">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center">
                <span className="text-black font-bold text-sm font-display">U</span>
              </div>
              <span className="text-lg font-display font-black tracking-tight text-[#1A1A1A]">
                Uni<span className="text-accent-pink">Trust</span>
              </span>
            </a>
            <p className="text-sm text-muted leading-relaxed max-w-[240px]">
              Decentralized trust infrastructure for the real world.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-dark mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="footer-link text-sm text-muted hover:text-[#1A1A1A] transition-colors duration-200 animated-underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="content-width py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-muted">
            <span>© 2025 UniTrust. All rights reserved.</span>
            <a href="mailto:hello@unitrust.xyz" className="flex items-center gap-1 hover:text-accent-pink transition-colors">
              <Mail className="w-3 h-3" />
              hello@unitrust.xyz
            </a>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted">
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
