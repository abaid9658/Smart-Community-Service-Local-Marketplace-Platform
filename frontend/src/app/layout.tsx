import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProvider from '@/components/layout/ClientProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LocalHub — Smart Community Marketplace',
    template: '%s | LocalHub',
  },
  description: "Pakistan's #1 smart community marketplace. Buy & sell products, hire local professionals, book services — all in one place.",
  keywords: ['marketplace', 'services', 'Pakistan', 'community', 'buy', 'sell', 'local'],
  authors: [{ name: 'LocalHub' }],
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://localhub.pk',
    siteName: 'LocalHub',
    title: 'LocalHub — Smart Community Marketplace',
    description: "Pakistan's #1 community marketplace",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen bg-[#FAF9FD] text-[#1A1A2E] flex flex-col`}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}


