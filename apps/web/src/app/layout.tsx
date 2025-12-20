import '../styles/globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/query-provider';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { PWAProvider } from '@/components/pwa-provider';

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.pwaEvent = e;
              });
              
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
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
              <Toaster position="top-right" richColors />
              <PWAInstallPrompt />
            </ThemeProvider>
          </PWAProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
