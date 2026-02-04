'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Toast } from './Toast';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with 'light' to match server render - prevents hydration mismatch
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read theme from localStorage after mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Only update theme and apply class after mount to prevent hydration issues
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Show toast message when switching to dark mode
    if (newTheme === 'dark') {
      setShowToast(true);
    }
  };

  // Always provide the context, but use 'light' as default until mounted
  // This ensures consistent rendering between server and initial client render
  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'light', toggleTheme }}>
      {children}
      {showToast && (
        <Toast
          message="If you have any dark reader plugins enabled in your browser, please disable them to ensure dark mode functions properly."
          onClose={() => setShowToast(false)}
        />
      )}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values for SSR/SSG
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
    };
  }
  return context;
}
