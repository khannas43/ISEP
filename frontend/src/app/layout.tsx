import type { Metadata } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import { AppShell } from '@/components/AppShell';
import { I18nProvider } from '@/i18n/client';
import './globals.css';

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
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <SessionProvider>
          <I18nProvider>
            <AppShell>{children}</AppShell>
          </I18nProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
