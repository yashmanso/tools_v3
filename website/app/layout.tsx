import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';
import { HeaderWrapper } from './components/HeaderWrapper';
import { PanelProvider } from './components/PanelContext';
import { TagModalProvider } from './components/TagModalContext';
import { SlidingPanels } from './components/SlidingPanels';
import { CursorAnimation } from './components/CursorAnimation';
import { ContactForm } from './components/ContactForm';
import { TagModal } from './components/TagModal';
import { WelcomePopup } from './components/WelcomePopup';
import { getAllResources } from './lib/markdown';

export const metadata: Metadata = {
  title: 'Sustainability Atlas',
  description: 'Tools and methods for sustainable entrepreneurship and innovation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const allResources = getAllResources();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <CursorAnimation />
        <ThemeProvider>
          <PanelProvider>
            <TagModalProvider>
              <div className="bg-[var(--bg-primary)]" style={{ height: '100vh', overflow: 'hidden' }}>
                <HeaderWrapper />
                <SlidingPanels allResources={allResources}>
                    {children}
                </SlidingPanels>
                <TagModal resources={allResources} />
                <WelcomePopup allResources={allResources} />
              </div>
            </TagModalProvider>
          </PanelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
