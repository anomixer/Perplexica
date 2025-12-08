export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import '../globals.css';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'sonner';
import ThemeProvider from '@/components/theme/Provider';
import configManager from '@/lib/config';
import SetupWizard from '@/components/Setup/SetupWizard';
import { ChatProvider } from '@/lib/hooks/useChat';
import { getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

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

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Settings' });
  const setupComplete = configManager.isSetupComplete();
  const configSections = configManager.getUIConfigSections(t);

  return (
    <html className="h-full" lang={locale} suppressHydrationWarning>
      <body className={cn('h-full', montserrat.className)}>
        <NextIntlClientProvider locale={locale} messages={messages}>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
