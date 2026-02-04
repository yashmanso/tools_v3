'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterTitleProps {
  text: string;
  speed?: number; // milliseconds per character
  repeat?: boolean;
  pauseAtEnd?: number; // milliseconds to pause before restarting
  triggerOnScroll?: boolean; // Only animate when scrolled into view
}

export function TypewriterTitle({ 
  text, 
  speed = 100, 
  repeat = true,
  pauseAtEnd = 2000,
  triggerOnScroll = true
}: TypewriterTitleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isInView, setIsInView] = useState(false);
  const currentIndexRef = useRef(0);
  const isPausedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLSpanElement>(null);
  const isInViewRef = useRef(false);
  const hasAnimatedRef = useRef(false);

  // Intersection Observer to continuously track visibility
  useEffect(() => {
    if (!triggerOnScroll) {
      setIsInView(true);
      isInViewRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsInView(isIntersecting);
        isInViewRef.current = isIntersecting;
        
        if (!isIntersecting) {
          // Stop animation immediately when going out of view
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      },
      {
        threshold: 0.1, // Require 10% of element to be visible
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before element enters viewport
      }
    );

    // Start observing after a brief delay to ensure element is mounted
    const timeoutId = setTimeout(() => {
      if (elementRef.current) {
        // Check initial state - use Intersection Observer's initial check
        // The observer will fire immediately if element is already in view
        observer.observe(elementRef.current);
        
        // Also manually check initial state as fallback
        const rect = elementRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const isInViewport = rect.top < viewportHeight && rect.bottom > 0 && rect.top >= -100;
        
        // If element is already in view on mount, set state immediately
        if (isInViewport) {
          setIsInView(true);
          isInViewRef.current = true;
        }
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [triggerOnScroll]);

  // Animation effect - runs when in view
  useEffect(() => {
    // Don't start if not in view
    if (!isInView) {
      // Clear animation if going out of view
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Reset when coming into view (only if not already animating)
    if (currentIndexRef.current === 0 || !hasAnimatedRef.current) {
      currentIndexRef.current = 0;
      isPausedRef.current = false;
      setDisplayedText('');
      hasAnimatedRef.current = true;
    }

    const animate = () => {
      // Stop immediately if element is no longer in view (check ref for current state)
      if (!isInViewRef.current) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!repeat && currentIndexRef.current === text.length) {
        return; // Stop at the end if not repeating
      }

      // Handle pause at the end before restarting
      if (isPausedRef.current && currentIndexRef.current === text.length) {
        timeoutRef.current = setTimeout(() => {
          if (!isInViewRef.current) return; // Check again before restarting
          currentIndexRef.current = 0;
          isPausedRef.current = false;
          setDisplayedText('');
          animate();
        }, pauseAtEnd);
        return;
      }

      // Typing animation
      timeoutRef.current = setTimeout(() => {
        // Check if still in view before continuing (use ref for current state)
        if (!isInViewRef.current) {
          return;
        }
        
        if (currentIndexRef.current < text.length) {
          currentIndexRef.current += 1;
          setDisplayedText(text.slice(0, currentIndexRef.current));
          animate();
        } else if (repeat) {
          // Finished typing, pause before restarting
          isPausedRef.current = true;
          animate();
        }
      }, speed);
    };

    animate();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isInView, text, speed, repeat, pauseAtEnd]);

  return (
    <span ref={elementRef}>
      {displayedText}
      <span className="blinking-cursor"></span>
    </span>
  );
}

