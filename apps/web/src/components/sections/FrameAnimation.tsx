'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const TOTAL_FRAMES = 60;
const FRAME_WIDTH = 800;
const FRAME_HEIGHT = 800;

export function FrameAnimation() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  // Generate procedural frames (SVG-based token rotation)
  const generateFrames = useCallback(() => {
    const frames: HTMLCanvasElement[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const offscreen = document.createElement('canvas');
      offscreen.width = FRAME_WIDTH;
      offscreen.height = FRAME_HEIGHT;
      const octx = offscreen.getContext('2d')!;

      const progress = i / (TOTAL_FRAMES - 1);
      const angle = progress * Math.PI * 2;
      const scale = 0.6 + Math.sin(progress * Math.PI) * 0.4;

      // Clear background for light theme
      octx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);

      octx.save();
      octx.translate(FRAME_WIDTH / 2, FRAME_HEIGHT / 2);
      octx.scale(scale, scale);
      octx.rotate(angle * 0.3);

      // Glow
      const glowGrad = octx.createRadialGradient(0, 0, 50, 0, 0, 250);
      glowGrad.addColorStop(0, `rgba(0, 255, 136, ${0.15 + progress * 0.15})`);
      glowGrad.addColorStop(0.5, `rgba(0, 184, 255, ${0.05 + progress * 0.05})`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      octx.fillStyle = glowGrad;
      octx.fillRect(-300, -300, 600, 600);

      // Outer ring
      octx.strokeStyle = `rgba(0, 255, 136, ${0.3 + progress * 0.4})`;
      octx.lineWidth = 3;
      octx.beginPath();
      octx.arc(0, 0, 140, 0, Math.PI * 2);
      octx.stroke();

      // Inner ring
      octx.strokeStyle = `rgba(0, 184, 255, ${0.2 + progress * 0.3})`;
      octx.lineWidth = 2;
      octx.beginPath();
      octx.arc(0, 0, 100, angle, angle + Math.PI * 1.5);
      octx.stroke();

      // Dash ring
      octx.setLineDash([8, 12]);
      octx.strokeStyle = `rgba(124, 58, 237, ${0.15 + progress * 0.25})`;
      octx.lineWidth = 1.5;
      octx.beginPath();
      octx.arc(0, 0, 170, -angle * 0.5, -angle * 0.5 + Math.PI * 1.3);
      octx.stroke();
      octx.setLineDash([]);

      // Center hexagon
      const hexSize = 60;
      octx.beginPath();
      for (let h = 0; h < 6; h++) {
        const ha = (Math.PI / 3) * h - Math.PI / 6 + angle * 0.2;
        const hx = Math.cos(ha) * hexSize;
        const hy = Math.sin(ha) * hexSize;
        if (h === 0) octx.moveTo(hx, hy);
        else octx.lineTo(hx, hy);
      }
      octx.closePath();
      const hexGrad = octx.createLinearGradient(-hexSize, -hexSize, hexSize, hexSize);
      hexGrad.addColorStop(0, `rgba(0, 255, 136, ${0.1 + progress * 0.15})`);
      hexGrad.addColorStop(1, `rgba(0, 184, 255, ${0.05 + progress * 0.1})`);
      octx.fillStyle = hexGrad;
      octx.fill();
      octx.strokeStyle = `rgba(0, 255, 136, ${0.5 + progress * 0.3})`;
      octx.lineWidth = 2;
      octx.stroke();

      // "U" letter in center
      octx.font = 'bold 40px sans-serif';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillStyle = `rgba(255, 255, 255, ${0.6 + progress * 0.4})`;
      octx.fillText('U', 0, 2);

      // Orbiting particles
      for (let p = 0; p < 8; p++) {
        const pa = angle + (Math.PI * 2 * p) / 8;
        const pr = 120 + Math.sin(pa * 2 + progress * Math.PI) * 20;
        const px = Math.cos(pa) * pr;
        const py = Math.sin(pa) * pr;
        const pSize = 2 + Math.sin(pa + progress * Math.PI * 4) * 1.5;

        octx.beginPath();
        octx.arc(px, py, pSize, 0, Math.PI * 2);
        octx.fillStyle = p % 2 === 0
          ? `rgba(0, 255, 136, ${0.4 + progress * 0.4})`
          : `rgba(0, 184, 255, ${0.3 + progress * 0.4})`;
        octx.fill();
      }

      octx.restore();

      frames.push(offscreen);
    }
    return frames;
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !sectionRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = FRAME_WIDTH;
    canvas.height = FRAME_HEIGHT;

    // Generate frames
    framesRef.current = generateFrames();
    setLoaded(true);

    // Draw first frame
    ctx.drawImage(framesRef.current[0], 0, 0);

    const ctx2 = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const frameIndex = Math.min(
            Math.floor(self.progress * (TOTAL_FRAMES - 1)),
            TOTAL_FRAMES - 1,
          );
          if (framesRef.current[frameIndex]) {
            ctx.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
            ctx.drawImage(framesRef.current[frameIndex], 0, 0);
          }
        },
      });

      // Text parallax
      if (textRef.current) {
        const lines = textRef.current.querySelectorAll('.frame-text-line');
        lines.forEach((line, i) => {
          gsap.from(line, {
            y: 60 + i * 20,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top+=${10 + i * 5}% top`,
              end: `top+=${20 + i * 5}% top`,
              scrub: 1,
            },
          });
        });
      }
    }, sectionRef);

    return () => ctx2.revert();
  }, [generateFrames]);

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-background overflow-hidden">
      <div className="content-width h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
          {/* Canvas */}
          <div className="flex justify-center order-2 lg:order-1">
            <canvas
              ref={canvasRef}
              className="w-full max-w-[400px] aspect-square"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {/* Text */}
          <div ref={textRef} className="space-y-6 order-1 lg:order-2">
            <div className="frame-text-line">
              <span className="text-xs font-mono text-[#1A1A1A] font-bold uppercase tracking-widest">
                Token Infrastructure
              </span>
            </div>
            <h2 className="frame-text-line text-4xl md:text-5xl lg:text-6xl font-display font-black text-[#1A1A1A] tracking-tight leading-[1.05]">
              Build.<br />
              <span>Stake.</span><br />
              Innovate.
            </h2>
            <p className="frame-text-line text-lg text-muted max-w-md leading-relaxed">
              Our token powers the entire trust ecosystem — from minting asset
              NFTs to staking for governance rights. Every transaction
              strengthens the network.
            </p>
            <div className="frame-text-line flex items-center gap-6 pt-2">
              {[
                { label: 'Total Supply', value: '100M' },
                { label: 'Staked', value: '42%' },
                { label: 'Burned', value: '2.1M' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-display font-black text-[#1A1A1A] tracking-tight">{s.value}</div>
                  <div className="text-xs text-muted font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
