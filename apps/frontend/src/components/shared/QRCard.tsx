'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

export function QRCard({ data, label }: { data: string; label?: string }) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `unitrust-qr-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="qr-card" ref={canvasRef}>
      <QRCodeCanvas
        value={data}
        size={200}
        level="H"
        includeMargin
        style={{ borderRadius: 'var(--radius-sm)' }}
      />
      {label && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>}
      <button className="btn btn-sm btn-secondary" onClick={downloadQR}>
        ⬇ Download QR
      </button>
    </div>
  );
}
