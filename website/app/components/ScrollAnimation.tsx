'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right';
}

export function ScrollAnimation({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'fade'
}: ScrollAnimationProps) {
  // Always start with false to match server render
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Only start observing after mount to prevent hydration issues
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [delay]);

  // Only apply visible classes after mount to prevent hydration mismatch
  // Server and initial client render will both have hidden state
  const animationClasses = {
    fade: mounted && isVisible ? 'opacity-100' : 'opacity-0',
    'slide-up': mounted && isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
    'slide-left': mounted && isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12',
    'slide-right': mounted && isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12',
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${animationClasses[direction]} ${className}`}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
