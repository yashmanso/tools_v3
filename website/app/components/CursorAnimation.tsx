'use client';

import { useEffect, useRef } from 'react';

export function CursorAnimation() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let animationFrameId: number;

    const updateCursor = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * 0.15;
      cursorY += dy * 0.15;
      
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;

      animationFrameId = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseEnter = () => {
      cursor.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
    };

    // Initialize position
    const handleMouseMoveInit = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleMouseMoveInit, { once: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    updateCursor();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="hidden md:block fixed pointer-events-none z-[9999] w-3 h-3 bg-red-500 rounded-full opacity-0 transition-opacity duration-200 shadow-lg shadow-red-500/50"
      style={{
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}
