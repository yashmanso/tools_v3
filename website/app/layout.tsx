import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';
import { Header } from './components/Header';
import { PanelProvider } from './components/PanelContext';
import { SlidingPanels } from './components/SlidingPanels';

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
        <ThemeProvider>
          <PanelProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <SlidingPanels>
                <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                  {children}
                </main>
              </SlidingPanels>
              <footer className="border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                  Sustainability Atlas - Tools and methods for sustainable entrepreneurship and innovation
                </div>
              </footer>
            </div>
          </PanelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
