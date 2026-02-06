'use client';

import { useEffect, useRef } from 'react';

export function CursorAnimation() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorOuterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorOuter = cursorOuterRef.current;
    if (!cursor || !cursorOuter) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let outerX = 0;
    let outerY = 0;
    let isHovering = false;
    let animationFrameId: number;

    const updateCursor = () => {
      // Inner cursor follows immediately
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      
      // Outer cursor follows with more lag
      outerX += (mouseX - outerX) * 0.1;
      outerY += (mouseY - outerY) * 0.1;
      
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      
      cursorOuter.style.left = `${outerX}px`;
      cursorOuter.style.top = `${outerY}px`;

      animationFrameId = requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseEnter = () => {
      cursor.style.opacity = '1';
      cursorOuter.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      cursor.style.opacity = '0';
      cursorOuter.style.opacity = '0';
    };

    // Handle hover states for interactive elements
    const handleElementEnter = () => {
      isHovering = true;
      cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
      cursorOuter.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursorOuter.style.borderColor = '#a855f7'; // Purple on hover
    };

    const handleElementLeave = () => {
      isHovering = false;
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorOuter.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorOuter.style.borderColor = '#a855f7';
    };

    // Initialize position
    const handleMouseMoveInit = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorX = e.clientX;
      cursorY = e.clientY;
      outerX = e.clientX;
      outerY = e.clientY;
    };

    // Add hover listeners to interactive elements
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select, [onclick], .cursor-pointer');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', handleElementEnter);
        el.addEventListener('mouseleave', handleElementLeave);
      });
      return interactiveElements;
    };

    // Hide default cursor
    const style = document.createElement('style');
    style.id = 'custom-cursor-style';
    style.textContent = `
      * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleMouseMoveInit, { once: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    const elements = addHoverListeners();
    
    // Re-add listeners when DOM changes
    const observer = new MutationObserver(() => {
      const newElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select, [onclick], .cursor-pointer');
      newElements.forEach(el => {
        el.addEventListener('mouseenter', handleElementEnter);
        el.addEventListener('mouseleave', handleElementLeave);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    updateCursor();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      elements.forEach(el => {
        el.removeEventListener('mouseenter', handleElementEnter);
        el.removeEventListener('mouseleave', handleElementLeave);
      });
      observer.disconnect();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      const existingStyle = document.getElementById('custom-cursor-style');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <>
      {/* Inner dot - solid purple */}
      <div
        ref={cursorRef}
        className="hidden md:block fixed pointer-events-none z-[9999] w-2 h-2 rounded-full opacity-0 transition-transform duration-150 ease-out"
        style={{
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#a855f7',
          mixBlendMode: 'difference',
        }}
      />
      {/* Outer ring - purple border */}
      <div
        ref={cursorOuterRef}
        className="hidden md:block fixed pointer-events-none z-[9998] w-8 h-8 rounded-full opacity-0 transition-all duration-150 ease-out"
        style={{
          transform: 'translate(-50%, -50%)',
          border: '1.5px solid #a855f7',
          mixBlendMode: 'difference',
        }}
      />
    </>
  );
}
