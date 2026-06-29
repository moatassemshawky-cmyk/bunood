import type { Metadata } from 'next';
import { Readex_Pro, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

/**
 * next/font/google downloads fonts at build time and self-hosts them.
 * This eliminates the render-blocking @import from Google's CDN that was
 * previously injected by the GlobalStyle component on every render.
 */
const readex = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-readex',
  display: 'swap',
});

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-arabic',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bunood.com'),
  title: 'bunood — منصة المشتريات الفورية للمقاولات',
  description:
    'Bunood connects contractors and suppliers for instant procurement and AI-powered BOQ estimation.',
  alternates: {
    canonical: 'https://www.bunood.com',
  },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
  openGraph: {
    title: 'bunood — منصة المشتريات الفورية للمقاولات',
    description: 'Instant procurement for construction.',
    locale: 'ar_EG',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1024, height: 1024, alt: 'bunood' }],
  },
  twitter: {
    card: 'summary',
    title: 'bunood',
    description: 'Instant procurement for construction.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      className={`${readex.variable} ${ibmArabic.variable} ${ibmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
