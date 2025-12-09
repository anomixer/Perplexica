export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/theme/Provider';
import configManager from '@/lib/config';
import SetupWizard from '@/components/Setup/SetupWizard';
import { ChatProvider } from '@/lib/hooks/useChat';
import Script from 'next/script';

const montserrat = Montserrat({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Perplexica - Chat with the internet',
  description:
    'Perplexica is an AI powered chatbot that is connected to the internet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const setupComplete = configManager.isSetupComplete();
  const configSections = configManager.getUIConfigSections();

  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <head>
        {/* 防閃爍腳本 - 必須在 body 之前執行 */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme) {
                    // 檢測系統偏好
                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      theme = 'dark';
                    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                      theme = 'light';
                    } else {
                      theme = 'dark'; // 默認
                    }
                    localStorage.setItem('theme', theme);
                  }
                  if (theme === 'dark' || theme === 'system') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error('Theme initialization error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={cn('h-full', montserrat.className)}>
        <ThemeProvider>
          {setupComplete ? (
            <ChatProvider>
              <Sidebar>{children}</Sidebar>
              <Toaster
                toastOptions={{
                  unstyled: true,
                  classNames: {
                    toast:
                      'bg-light-secondary dark:bg-dark-secondary dark:text-white/70 text-black-70 rounded-lg p-4 flex flex-row items-center space-x-2',
                  },
                }}
              />
            </ChatProvider>
          ) : (
            <SetupWizard configSections={configSections} />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
