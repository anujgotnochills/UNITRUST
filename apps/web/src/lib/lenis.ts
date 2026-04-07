'use client';

import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function initLenis(): Lenis {
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    lerp: 0.12,
    smoothWheel: true,
    wheelMultiplier: 1,
    syncTouch: false,
    prevent: (node: Element) => {
      // Don't intercept clicks on interactive elements
      return (
        node.tagName === 'BUTTON' ||
        node.tagName === 'A' ||
        node.tagName === 'INPUT' ||
        node.tagName === 'SELECT' ||
        node.tagName === 'TEXTAREA' ||
        node.getAttribute('role') === 'button' ||
        node.getAttribute('data-lenis-prevent') !== null
      );
    },
  });

  return lenisInstance;
}

export function destroyLenis(): void {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}
