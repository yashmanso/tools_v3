'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface StaggeredTextProps {
  text: string;
  delay?: number; // Delay between words in ms
  className?: string;
  triggerOnScroll?: boolean; // Only animate when scrolled into view
}

export function StaggeredText({ 
  text, 
  delay = 100, 
  className = '',
  triggerOnScroll = true 
}: StaggeredTextProps) {
  const [visibleWords, setVisibleWords] = useState<string[]>([]);
  const [hasStarted, setHasStarted] = useState(!triggerOnScroll);
  const elementRef = useRef<HTMLDivElement>(null);
  const animationStartedRef = useRef(false);
  
  // Memoize words to prevent recalculation
  const words = useMemo(() => text.split(' '), [text]);

  // Intersection Observer for scroll trigger
  useEffect(() => {
    if (!triggerOnScroll) {
      // Animate words immediately
      if (!animationStartedRef.current) {
        animationStartedRef.current = true;
        setVisibleWords([]);
        words.forEach((word, index) => {
          setTimeout(() => {
            setVisibleWords(prev => [...prev, word]);
          }, index * delay);
        });
      }
      return;
    }

    if (hasStarted && !animationStartedRef.current) {
      // Start animation when triggered
      animationStartedRef.current = true;
      setVisibleWords([]);
      words.forEach((word, index) => {
        setTimeout(() => {
          setVisibleWords(prev => [...prev, word]);
        }, index * delay);
      });
      return;
    }

    // Intersection Observer for scroll trigger
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
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
  }, [triggerOnScroll, hasStarted, delay, words]);

  return (
    <div ref={elementRef} className={className}>
      {words.map((word, index) => {
        const isVisible = visibleWords.includes(word) || visibleWords.length > index;
        return (
          <span
            key={`${word}-${index}`}
            className={`inline-block transition-all duration-500 ease-out ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * delay}ms` }}
          >
            {word}
            {index < words.length - 1 && '\u00A0'}
          </span>
        );
      })}
    </div>
  );
}
