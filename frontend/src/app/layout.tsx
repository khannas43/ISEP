import type { Metadata } from 'next';
import { Libre_Baskerville, Source_Sans_3 } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import { AppShell } from '@/components/AppShell';
import { I18nProvider } from '@/i18n/client';
import './globals.css';

const fontDisplay = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const fontBody = Source_Sans_3({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ISEP – IMO Strategic Engagement Platform',
  description: 'Directorate General of Shipping (DGS) | MoPSW, Government of India',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${fontDisplay.variable} ${fontBody.variable}`}>
      <body className="min-h-screen min-h-full w-full max-w-none antialiased">
        <SessionProvider>
          <I18nProvider>
            <AppShell>{children}</AppShell>
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
