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
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const animationClasses = {
    fade: isVisible ? 'opacity-100' : 'opacity-0',
    'slide-up': isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
    'slide-left': isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12',
    'slide-right': isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12',
  };

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${animationClasses[direction]} ${className}`}
    >
      {children}
    </div>
  );
}
