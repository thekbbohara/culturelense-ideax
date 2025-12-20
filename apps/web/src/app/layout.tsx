import '../styles/globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/components/query-provider';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { PWAProvider } from '@/components/pwa-provider';
import { ReduxProvider } from '@/components/providers/ReduxProvider';

export const metadata: Metadata = {
  title: 'CultureLense',
  description: 'Discover cultural entities',
  manifest: '/manifest.json',
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

              // Clear service workers in development
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                      registration.unregister();
                      console.log('Unregistered service worker:', registration);
                    }
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body>
        <ReduxProvider>
          <QueryProvider>
            <PWAProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                <div>{children}</div>
                <Toaster position="top-right" richColors />
                <PWAInstallPrompt />
              </ThemeProvider>
            </PWAProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
