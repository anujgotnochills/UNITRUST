'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Menu, X, ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  {
    label: 'Solutions',
    children: [
      { label: 'Asset Tokenization', desc: 'Digitize real-world assets on-chain', href: '#features' },
      { label: 'Credential Verification', desc: 'Soulbound NFT certificates', href: '#features' },
      { label: 'Carbon Tracking', desc: 'On-chain sustainability metrics', href: '#features' },
    ],
  },
  {
    label: 'Developers',
    children: [
      { label: 'Documentation', desc: 'Integrate with UniTrust APIs', href: '#' },
      { label: 'Smart Contracts', desc: 'Audited Solidity contracts', href: '#' },
      { label: 'SDK & Tools', desc: 'Build faster with our SDK', href: '#' },
    ],
  },
  {
    label: 'Ecosystem',
    children: [
      { label: 'Partners', desc: 'Our growing network', href: '#community' },
      { label: 'Community', desc: 'Join 50k+ builders', href: '#community' },
    ],
  },
  { label: 'Roadmap', href: '#roadmap' },
  { label: 'About', href: '#' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-40 transition-all duration-300">
        <nav
          className={cn(
            'w-full rounded-full flex items-center justify-between px-6 py-3 transition-colors duration-300',
            scrolled ? 'bg-[#1A1A1A]/95 backdrop-blur-md shadow-lg' : 'bg-[#1A1A1A]'
          )}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group text-white">
            <span className="text-xl font-display font-bold tracking-tight">
              UniTrust
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={link.href || '#'}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-tight rounded-full transition-colors duration-200',
                    'text-gray-300 hover:text-white',
                  )}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform duration-200',
                        activeDropdown === link.label && 'rotate-180',
                      )}
                    />
                  )}
                </a>

                {/* Dropdown */}
                {link.children && activeDropdown === link.label && (
                  <div className="absolute top-full left-0 pt-4 w-64">
                    <div className="bg-[#1A1A1A] rounded-2xl p-2 shadow-2xl border border-white/10">
                      {link.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          className="flex flex-col gap-0.5 p-3 rounded-xl hover:bg-white/10 transition-colors duration-200 group text-white"
                        >
                          <span className="text-sm font-medium transition-colors duration-200">
                            {child.label}
                          </span>
                          <span className="text-xs text-gray-400">{child.desc}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="/dashboard" className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors">
              Launch App
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-full text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-background/95 backdrop-blur-xl transition-all duration-500 lg:hidden flex flex-col',
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
      >
        <div className="pt-24 px-6 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navLinks.map((link, i) => (
              <div key={link.label} style={{ transitionDelay: `${i * 60}ms` }}>
                <a
                  href={link.href || '#'}
                  onClick={() => setMobileOpen(false)}
                  className="block py-4 text-2xl font-display font-bold text-white/80 hover:text-accent-green transition-colors duration-200 border-b border-white/5"
                >
                  {link.label}
                </a>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 mt-10">
            <Button variant="primary" size="lg" className="w-full">
              Get Started
            </Button>
            <a href="/dashboard" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                Launch App
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
