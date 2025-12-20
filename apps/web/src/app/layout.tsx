import '../styles/globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/query-provider';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { PWAProvider } from '@/components/pwa-provider';
import { GoogleTranslateScript } from '@/components/google-translate-script';

export const metadata: Metadata = {
  title: 'CultureLense',
  description: 'Discover cultural entities',
  manifest: '/manifest.json',
  other: {
    google: 'translate',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ scrollbarWidth: 'none', scrollBehavior: 'smooth' }}
    >
      <head>
        <style>{`
          .goog-te-banner-frame { display: none !important; }
          body { top: 0px !important; }
          iframe.goog-te-banner-frame { display: none !important; }
        `}</style>
      </head>
      <body>
        <QueryProvider>
          <PWAProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <div suppressHydrationWarning>
                <div id="google_translate_element" className="hidden" suppressHydrationWarning></div>
                {children}
              </div>
              <GoogleTranslateScript />
              <Toaster position="top-right" richColors />
              <PWAInstallPrompt />
            </ThemeProvider>
          </PWAProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
