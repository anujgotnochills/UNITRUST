'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function QRScanner({
  prefix,
  onScan,
  onError,
  errorMessage,
}: {
  prefix: string;
  onScan: (tokenId: string) => void;
  onError?: (msg: string) => void;
  errorMessage?: string;
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const containerId = `qr-reader-${prefix.replace(/[^a-z]/gi, '')}`;

  const startScanning = async () => {
    try {
      setError('');
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          if (decoded.startsWith(prefix)) {
            const tokenId = decoded.slice(prefix.length);
            scanner.stop().catch(() => {});
            setScanning(false);
            onScan(tokenId);
          } else {
            setError(errorMessage || `Invalid QR code. Expected prefix: ${prefix}`);
          }
        },
        () => {} // ignore scan failures
      );
      setScanning(true);
    } catch (err: any) {
      setError('Camera access denied or not available');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        id={containerId}
        style={{
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--surface-2)',
          minHeight: scanning ? 'auto' : '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!scanning && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Camera preview</p>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center' }}>
          ⚠ {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        {!scanning ? (
          <button className="btn btn-primary" onClick={startScanning}>
            📷 Start Scanner
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={stopScanning}>
            ⏹ Stop Scanner
          </button>
        )}
      </div>
    </div>
  );
}
