'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Box, 
  PlusCircle, 
  Scan, 
  FileCheck, 
  Clock, 
  ShieldCheck, 
  FilePlus, 
  Files,
  LogOut,
  Wallet
} from 'lucide-react';

const sidebarLinks = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Assets',
    items: [
      { title: 'My Assets', href: '/assets', icon: Box },
      { title: 'Register Asset', href: '/assets/register', icon: PlusCircle },
      { title: 'Scan QR', href: '/assets/scan', icon: Scan },
    ]
  },
  {
    title: 'Certificates',
    items: [
      { title: 'My Certificates', href: '/certificates', icon: FileCheck },
      { title: 'Pending Requests', href: '/certificates/pending', icon: Clock },
    ]
  },
  {
    title: 'Requests & Auth',
    items: [
      { title: 'Verify', href: '/verify', icon: ShieldCheck },
      { title: 'New Request', href: '/requests/new', icon: FilePlus },
      { title: 'My Requests', href: '/requests', icon: Files },
    ]
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1A1A1A]/10 bg-white flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 border-b border-[#1A1A1A]/10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
            <span className="text-white font-bold text-sm font-display">U</span>
          </div>
          <span className="text-xl font-display font-black tracking-tight text-[#1A1A1A]">
            Uni<span className="text-accent-pink">Trust</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sidebarLinks.map((section, idx) => (
            <div key={idx}>
              {section.items ? (
                <>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 px-2">
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.title}
                          href={link.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-[#1A1A1A] text-white'
                              : 'text-muted hover:text-[#1A1A1A] hover:bg-gray-100'
                          }`}
                        >
                          <link.icon className="w-4 h-4" />
                          {link.title}
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <Link
                    href={section.href!}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === section.href
                         ? 'bg-[#1A1A1A] text-white'
                         : 'text-muted hover:text-[#1A1A1A] hover:bg-gray-100'
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.title}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#1A1A1A]/10">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#1A1A1A]/10 bg-white/50 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
          <h1 className="font-display font-black text-xl text-[#1A1A1A] tracking-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-pink/10 border border-accent-pink/20">
              <div className="w-2 h-2 rounded-full bg-accent-pink animate-pulse" />
              <span className="text-xs font-semibold text-accent-pink tracking-wide">
                Amoy Testnet Active
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#1A1A1A]/10 shadow-sm">
              <Wallet className="w-4 h-4 text-[#1A1A1A]" />
              <span className="text-sm font-mono font-medium text-[#1A1A1A]">0x42f...a1B8</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
