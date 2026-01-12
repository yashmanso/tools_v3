import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';
import { HeaderWrapper } from './components/HeaderWrapper';
import { PanelProvider } from './components/PanelContext';
import { SlidingPanels } from './components/SlidingPanels';
import { CursorAnimation } from './components/CursorAnimation';
import { ContactForm } from './components/ContactForm';

export const metadata: Metadata = {
  title: 'Sustainability Atlas',
  description: 'Tools and methods for sustainable entrepreneurship and innovation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <CursorAnimation />
        <ThemeProvider>
          <PanelProvider>
            <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
              <HeaderWrapper />
              <SlidingPanels>
                <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl bg-[var(--bg-primary)]">
                  {children}
                </main>
              </SlidingPanels>
              <footer className="py-6 mt-12 bg-[var(--bg-primary)] border-t border-[var(--border)]">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Sustainability Atlas - Tools and methods for sustainable entrepreneurship and innovation
                    </div>
                    <ContactForm />
                  </div>
                </div>
              </footer>
            </div>
          </PanelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
