'use client';

import { useState, useEffect } from 'react';

interface TypewriterTitleProps {
  text: string;
  speed?: number; // milliseconds per character
  repeat?: boolean;
  pauseAtEnd?: number; // milliseconds to pause before restarting
}

export function TypewriterTitle({ 
  text, 
  speed = 100, 
  repeat = true,
  pauseAtEnd = 2000 
}: TypewriterTitleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!repeat && currentIndex === text.length) {
      return; // Stop at the end if not repeating
    }

    // Handle pause at the end before restarting
    if (isPaused && currentIndex === text.length) {
      const pauseTimeout = setTimeout(() => {
        setCurrentIndex(0);
        setDisplayedText('');
        setIsPaused(false);
      }, pauseAtEnd);
      return () => clearTimeout(pauseTimeout);
    }

    // Typing animation
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (repeat) {
        // Finished typing, pause before restarting
        setIsPaused(true);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, isPaused, text, speed, repeat, pauseAtEnd]);

  return (
    <>
      {displayedText}
      <span className="blinking-cursor"></span>
    </>
  );
}

